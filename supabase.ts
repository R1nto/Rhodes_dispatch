// Menu: Registri Tiket & Supabase

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EventItem, Booking, Ticket } from '../types/database';
import { INITIAL_EVENTS, INITIAL_BOOKINGS, INITIAL_TICKETS } from '../data/mockEvents';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// LocalStorage Keys for resilient Demo Mode (v2 with complete Indonesian event lore)
const STORAGE_KEYS = {
  EVENTS: 'rhodes_dispatch_events_v2',
  BOOKINGS: 'rhodes_dispatch_bookings_v2',
  TICKETS: 'rhodes_dispatch_tickets_v2',
  USER_ID: 'rhodes_dispatch_user_id',
  USER_NAME: 'rhodes_dispatch_user_name',
  USER_EMAIL: 'rhodes_dispatch_user_email'
};

export function getActiveUser() {
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID) || 'usr-operator-01';
  const userName = localStorage.getItem(STORAGE_KEYS.USER_NAME) || 'Doctor (Operator Kal)';
  const userEmail = localStorage.getItem(STORAGE_KEYS.USER_EMAIL) || 'kal.operator@rhodes.dispatch';
  return { id: userId, name: userName, email: userEmail, role: 'operator' as const };
}

export function setActiveUser(name: string, email: string) {
  localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
}

// Initialize Demo Data in localStorage if absent
function initDemoStorage(): { events: EventItem[]; bookings: Booking[]; tickets: Ticket[] } {
  try {
    const storedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
    const storedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    const storedTickets = localStorage.getItem(STORAGE_KEYS.TICKETS);

    const events = storedEvents ? JSON.parse(storedEvents) : INITIAL_EVENTS;
    const bookings = storedBookings ? JSON.parse(storedBookings) : INITIAL_BOOKINGS;
    const tickets = storedTickets ? JSON.parse(storedTickets) : INITIAL_TICKETS;

    if (!storedEvents) localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    if (!storedBookings) localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    if (!storedTickets) localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));

    return { events, bookings, tickets };
  } catch {
    return { events: INITIAL_EVENTS, bookings: INITIAL_BOOKINGS, tickets: INITIAL_TICKETS };
  }
}

export async function fetchEvents(): Promise<EventItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (*)
        `);

      if (!error && data && data.length > 0) {
        // Map Supabase rows to EventItem interface
        return data.map((evt) => {
          const types = evt.ticket_types || [];
          const minPrice = types.length > 0 ? Math.min(...types.map((t: { price: number }) => t.price)) : 0;
          const availableStock = types.reduce((acc: number, t: { quota: number; sold_count?: number }) => acc + (t.quota - (t.sold_count || 0)), 0);
          const totalQuota = types.reduce((acc: number, t: { quota: number }) => acc + t.quota, 0);

          return {
            id: evt.id,
            event_code: evt.event_code,
            title: evt.title,
            category: evt.category,
            description: evt.description,
            location: evt.location,
            starts_at: evt.starts_at,
            ends_at: evt.ends_at,
            poster_url: evt.poster_url,
            status: evt.status,
            created_at: evt.created_at,
            min_price: minPrice,
            available_stock: availableStock,
            total_quota: totalQuota,
            ticket_types: types
          };
        });
      }
    } catch {
      // Fallback to local storage if Supabase query encounters issues
    }
  }

  const { events } = initDemoStorage();
  return events;
}

export interface BookingSubmission {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  customerName: string;
  customerEmail: string;
}

export async function processBooking(payload: BookingSubmission): Promise<{
  success: boolean;
  booking?: Booking;
  tickets?: Ticket[];
  error?: string;
}> {
  const { eventId, ticketTypeId, quantity, customerName, customerEmail } = payload;
  const user = getActiveUser();

  if (quantity <= 0) {
    return { success: false, error: 'Quantity must be at least 1.' };
  }

  // Real Supabase flow if configured
  if (isSupabaseConfigured && supabase) {
    try {
      // Check stock with RPC or direct check
      const { data: ticketType, error: ttErr } = await supabase
        .from('ticket_types')
        .select('*, events(*)')
        .eq('id', ticketTypeId)
        .single();

      if (ttErr || !ticketType) {
        return { success: false, error: 'Ticket type not found on server.' };
      }

      const available = ticketType.quota - (ticketType.sold_count || 0);
      if (available < quantity) {
        return { success: false, error: `Insufficient quota. Only ${available} tickets remaining.` };
      }

      // Generate booking code
      const bookingCode = `BK-RD-${Math.floor(1000 + Math.random() * 9000)}`;
      const totalAmount = ticketType.price * quantity;

      const { data: newBooking, error: bkErr } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          booking_code: bookingCode,
          total_amount: totalAmount,
          status: 'confirmed'
        })
        .select()
        .single();

      if (bkErr || !newBooking) {
        return { success: false, error: bkErr?.message || 'Failed to create booking' };
      }

      const { data: bookingItem, error: bkiErr } = await supabase
        .from('booking_items')
        .insert({
          booking_id: newBooking.id,
          ticket_type_id: ticketTypeId,
          quantity: quantity,
          unit_price: ticketType.price
        })
        .select()
        .single();

      if (bkiErr || !bookingItem) {
        return { success: false, error: 'Failed to record booking item' };
      }

      // Increment sold count
      await supabase
        .from('ticket_types')
        .update({ sold_count: (ticketType.sold_count || 0) + quantity })
        .eq('id', ticketTypeId);

      // Create individual tickets with unique tokens
      const generatedTickets: Ticket[] = [];
      for (let i = 0; i < quantity; i++) {
        const ticketCode = `TK-RH-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + i)}`;
        const qrToken = `RD-SEC-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

        const { data: ticketRecord } = await supabase
          .from('tickets')
          .insert({
            booking_item_id: bookingItem.id,
            ticket_code: ticketCode,
            qr_token: qrToken,
            status: 'valid'
          })
          .select()
          .single();

        if (ticketRecord) {
          generatedTickets.push({
            id: ticketRecord.id,
            booking_item_id: bookingItem.id,
            ticket_code: ticketCode,
            qr_token: qrToken,
            status: 'valid',
            created_at: ticketRecord.created_at,
            event_title: ticketType.events?.title || 'Tactical Event',
            event_code: ticketType.events?.event_code || 'RH-OP',
            ticket_type_name: ticketType.name,
            customer_name: customerName,
            event_date: ticketType.events?.starts_at || new Date().toISOString(),
            event_location: ticketType.events?.location || 'Operational Sector'
          });
        }
      }

      return {
        success: true,
        booking: {
          ...newBooking,
          customer_name: customerName,
          customer_email: customerEmail,
          items: [
            {
              id: bookingItem.id,
              booking_id: newBooking.id,
              ticket_type_id: ticketTypeId,
              quantity,
              unit_price: ticketType.price,
              ticket_type_name: ticketType.name,
              event_title: ticketType.events?.title,
              event_code: ticketType.events?.event_code
            }
          ]
        },
        tickets: generatedTickets
      };
    } catch {
      // In case of error in Supabase connection, gracefully fallback to local demo persistence
    }
  }

  // DEMO MODE - Atomic in-browser persistence
  const { events, bookings, tickets } = initDemoStorage();
  const event = events.find((e) => e.id === eventId);
  if (!event) {
    return { success: false, error: 'Target event not found in terminal registry.' };
  }

  const ticketType = event.ticket_types?.find((tt) => tt.id === ticketTypeId);
  if (!ticketType) {
    return { success: false, error: 'Selected ticket tier does not exist.' };
  }

  const remaining = ticketType.quota - ticketType.sold_count;
  if (remaining < quantity) {
    return { success: false, error: `Quota exceeded! Only ${remaining} ticket(s) remaining for this tier.` };
  }

  // Atomically update ticket type and event stock
  ticketType.sold_count += quantity;
  event.available_stock = Math.max(0, event.available_stock - quantity);

  // Generate Booking
  const bookingId = `bk-${Date.now()}`;
  const bookingCode = `BK-RD-${Math.floor(1000 + Math.random() * 9000)}`;
  const totalAmount = ticketType.price * quantity;

  const newBooking: Booking = {
    id: bookingId,
    user_id: user.id,
    booking_code: bookingCode,
    total_amount: totalAmount,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    customer_name: customerName,
    customer_email: customerEmail,
    items: [
      {
        id: `bki-${Date.now()}`,
        booking_id: bookingId,
        ticket_type_id: ticketTypeId,
        quantity,
        unit_price: ticketType.price,
        ticket_type_name: ticketType.name,
        event_title: event.title,
        event_code: event.event_code
      }
    ]
  };

  // Generate Digital Tickets with unique QR tokens
  const newTickets: Ticket[] = [];
  for (let i = 0; i < quantity; i++) {
    const suffix = String.fromCharCode(65 + i);
    const uniqueToken = `RD-SEC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${i+1}`;
    const ticket: Ticket = {
      id: `tkt-${Date.now()}-${i}`,
      booking_item_id: newBooking.items![0].id,
      ticket_code: `TK-RH-${Math.floor(1000 + Math.random() * 9000)}-${suffix}`,
      qr_token: uniqueToken,
      status: 'valid',
      created_at: new Date().toISOString(),
      event_title: event.title,
      event_code: event.event_code,
      ticket_type_name: ticketType.name,
      customer_name: customerName,
      event_date: event.starts_at,
      event_location: event.location
    };
    newTickets.push(ticket);
  }

  // Persist updated records
  const updatedBookings = [newBooking, ...bookings];
  const updatedTickets = [...newTickets, ...tickets];

  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings));
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updatedTickets));

  return {
    success: true,
    booking: newBooking,
    tickets: newTickets
  };
}

export async function fetchMyBookings(): Promise<Booking[]> {
  const { bookings } = initDemoStorage();
  return bookings;
}

export async function fetchMyTickets(): Promise<Ticket[]> {
  const { tickets } = initDemoStorage();
  return tickets;
}

export function resetDemoRegistry(): void {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
}

export interface VerificationResult {
  valid: boolean;
  ticket?: Ticket;
  message: string;
  checkInTime?: string;
  isAlreadyUsed?: boolean;
}

export async function verifyTicket(codeOrToken: string): Promise<VerificationResult> {
  const cleanInput = codeOrToken.trim().toUpperCase();
  const { tickets } = initDemoStorage();
  
  const found = tickets.find(
    (t) => t.ticket_code.toUpperCase() === cleanInput || 
           t.qr_token.toUpperCase() === cleanInput ||
           cleanInput.includes(t.ticket_code.toUpperCase()) ||
           cleanInput.includes(t.qr_token.toUpperCase())
  );

  if (!found) {
    return {
      valid: false,
      message: 'Kode tiket atau token QR tidak ditemukan di database server Rhodes Dispatch.'
    };
  }

  if (found.status === 'used') {
    return {
      valid: true,
      ticket: found,
      isAlreadyUsed: true,
      message: 'Tiket asli terverifikasi, namun SUDAH DIGUNAKAN (Checked-in) sebelumnya pada gate masuk.'
    };
  }

  if (found.status === 'revoked') {
    return {
      valid: false,
      ticket: found,
      message: 'Tiket ini telah dibatalkan atau dicabut oleh promotor.'
    };
  }

  return {
    valid: true,
    ticket: found,
    isAlreadyUsed: false,
    message: 'TIKET RESMI & VALID. Siap dipindai untuk akses masuk gerbang (Gate Entry).'
  };
}

export async function checkInTicket(ticketCode: string): Promise<{ success: boolean; ticket?: Ticket; message: string }> {
  const cleanCode = ticketCode.trim().toUpperCase();
  const { tickets } = initDemoStorage();

  const ticketIndex = tickets.findIndex(
    (t) => t.ticket_code.toUpperCase() === cleanCode || t.qr_token.toUpperCase() === cleanCode
  );

  if (ticketIndex === -1) {
    return { success: false, message: 'Tiket tidak ditemukan.' };
  }

  const target = tickets[ticketIndex];
  if (target.status === 'used') {
    return {
      success: false,
      ticket: target,
      message: 'Tiket sudah pernah check-in sebelumnya. Akses gerbang ditolak untuk mencegah duplikasi.'
    };
  }

  target.status = 'used';
  tickets[ticketIndex] = target;
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));

  return {
    success: true,
    ticket: target,
    message: 'Check-in berhasil! Pengunjung diizinkan memasuki arena venue.'
  };
}

