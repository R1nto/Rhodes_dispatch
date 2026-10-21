-- =====================================================================
-- RHODES DISPATCH — SUPABASE POSTGRESQL DATABASE SCHEMA & MIGRATION
-- Tactical Sci-Fi Ticketing Terminal
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Custom ENUM types
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('operator', 'admin', 'organizer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_status_enum AS ENUM ('active', 'upcoming', 'sold_out', 'concluded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status_enum AS ENUM ('confirmed', 'pending', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status_enum AS ENUM ('valid', 'used', 'revoked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role_enum DEFAULT 'operator'::user_role_enum,
    callsign TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_code VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    poster_url TEXT NOT NULL,
    status event_status_enum DEFAULT 'active'::event_status_enum,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. TICKET TYPES TABLE
CREATE TABLE IF NOT EXISTS public.ticket_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    quota INTEGER NOT NULL CHECK (quota >= 0),
    sold_count INTEGER NOT NULL DEFAULT 0 CHECK (sold_count <= quota),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_sold_not_exceed_quota CHECK (sold_count <= quota)
);

-- 6. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_code VARCHAR(64) NOT NULL UNIQUE,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    status booking_status_enum DEFAULT 'confirmed'::booking_status_enum,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. BOOKING ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. TICKETS TABLE (Digital passes with individual QR tokens)
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_item_id UUID NOT NULL REFERENCES public.booking_items(id) ON DELETE CASCADE,
    ticket_code VARCHAR(64) NOT NULL UNIQUE,
    qr_token TEXT NOT NULL UNIQUE,
    status ticket_status_enum DEFAULT 'valid'::ticket_status_enum,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================================
-- INDEXES FOR FAST SORTING, SEARCHING, AND RELATIONSHIP LOOKUPS
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_events_code ON public.events (event_code);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON public.events (starts_at);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON public.ticket_types (event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_booking_item_id ON public.tickets (booking_item_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Events & Ticket Types: Public read access
CREATE POLICY "Public read events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Public read ticket_types" ON public.ticket_types
    FOR SELECT USING (true);

-- 3. Bookings: Users can view their own bookings
CREATE POLICY "Users view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Booking Items: Users can view items belonging to their bookings
CREATE POLICY "Users view own booking items" ON public.booking_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = booking_items.booking_id AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "Users insert own booking items" ON public.booking_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = booking_items.booking_id AND b.user_id = auth.uid()
        )
    );

-- 5. Tickets: Users can view tickets connected to their bookings
CREATE POLICY "Users view own tickets" ON public.tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.booking_items bi
            JOIN public.bookings b ON b.id = bi.booking_id
            WHERE bi.id = tickets.booking_item_id AND b.user_id = auth.uid()
        )
    );

-- =====================================================================
-- ATOMIC STORED FUNCTION: Prevent Race Conditions & Overbooking
-- =====================================================================
CREATE OR REPLACE FUNCTION book_tickets_atomic(
    p_user_id UUID,
    p_ticket_type_id UUID,
    p_quantity INT,
    p_booking_code TEXT
) RETURNS JSONB AS $$
DECLARE
    v_unit_price NUMERIC;
    v_quota INT;
    v_sold INT;
    v_total NUMERIC;
    v_booking_id UUID;
    v_booking_item_id UUID;
BEGIN
    -- Lock row for update to prevent concurrent race condition
    SELECT price, quota, sold_count INTO v_unit_price, v_quota, v_sold
    FROM public.ticket_types
    WHERE id = p_ticket_type_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ticket type not found.';
    END IF;

    IF (v_quota - v_sold) < p_quantity THEN
        RAISE EXCEPTION 'Insufficient ticket quota. Remaining: %', (v_quota - v_sold);
    END IF;

    v_total := v_unit_price * p_quantity;

    -- Create booking
    INSERT INTO public.bookings (user_id, booking_code, total_amount, status)
    VALUES (p_user_id, p_booking_code, v_total, 'confirmed')
    RETURNING id INTO v_booking_id;

    -- Create booking item
    INSERT INTO public.booking_items (booking_id, ticket_type_id, quantity, unit_price)
    VALUES (v_booking_id, p_ticket_type_id, p_quantity, v_unit_price)
    RETURNING id INTO v_booking_item_id;

    -- Update sold count
    UPDATE public.ticket_types
    SET sold_count = sold_count + p_quantity
    WHERE id = p_ticket_type_id;

    RETURN jsonb_build_object(
        'booking_id', v_booking_id,
        'booking_item_id', v_booking_item_id,
        'total_amount', v_total,
        'status', 'confirmed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- INITIAL SEED DATA
-- =====================================================================
INSERT INTO public.events (id, event_code, title, category, description, location, starts_at, ends_at, poster_url, status)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'RH-OP-01',
    'Terra Comic-Con 2026: Originium Arts Showcase',
    'Anime Con',
    'The largest subculture and anime convention gathering across Terra. Voice actors, creator alley, and stage exhibitions.',
    'District 8 Grand Expo Center, Sector Alpha',
    '2026-11-14 09:00:00+00',
    '2026-11-15 19:00:00+00',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    'active'
),
(
    '00000000-0000-0000-0000-000000000002',
    'RH-OP-02',
    'Lungmen Major Invitational: Tactics Finals',
    'Esports',
    'Premier tactical championship featuring top 16 regional combat teams clashing for the Golden Dragon Cup.',
    'Lungmen Central Cyber Stadium, Hall 3',
    '2026-11-20 13:00:00+00',
    '2026-11-21 22:00:00+00',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    'active'
),
(
    '00000000-0000-0000-0000-000000000003',
    'RH-OP-03',
    'Victoria Grand Symphony: Rhodes Orchestral Night',
    'Music & Symphony',
    'A 60-piece philharmonic orchestra performing live arrangements of iconic game overtures and battle themes.',
    'Victoria Royal Opera House, South Wing',
    '2026-12-05 18:30:00+00',
    '2026-12-05 21:30:00+00',
    'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    'active'
),
(
    '00000000-0000-0000-0000-000000000004',
    'RH-OP-04',
    'Kazdel Cosplay Masquerade & Armory Expo',
    'Cosplay',
    'Celebration of craftsmanship, armor smithing, and costume performance with runway contests and prop booths.',
    'Darkzone Industrial Pavilion B',
    '2026-11-28 10:00:00+00',
    '2026-11-28 20:00:00+00',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    'active'
)
ON CONFLICT (event_code) DO NOTHING;

-- Seed Ticket Types
INSERT INTO public.ticket_types (id, event_id, name, price, quota, sold_count)
VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Standard Daily Pass', 150000, 200, 50),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'VIP Vanguard Pass', 320000, 100, 10),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Grandstand General', 120000, 150, 50),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'Balcony Orchestra Tier', 350000, 120, 65),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'Visitor Pass', 95000, 250, 30)
ON CONFLICT DO NOTHING;
