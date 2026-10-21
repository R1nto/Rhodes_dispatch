/**
 * Rhodes Dispatch - Database Schema & Types
 * Matching Supabase PostgreSQL tables
 */

export type UserRole = 'operator' | 'admin' | 'organizer';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  callsign?: string;
  created_at: string;
}

export type EventStatus = 'active' | 'upcoming' | 'sold_out' | 'concluded';
export type EventCategory = 'Gaming' | 'Anime Con' | 'Cosplay' | 'Esports' | 'Music & Symphony';

export interface EventItem {
  id: string;
  event_code: string;
  title: string;
  category: EventCategory;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  poster_url: string;
  status: EventStatus;
  created_at: string;
  // Computed or aggregated values for algorithms & display
  min_price: number;
  available_stock: number;
  total_quota: number;
  ticket_types?: TicketType[];
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  price: number;
  quota: number;
  sold_count: number;
  perks?: string[];
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';

export interface Booking {
  id: string;
  user_id: string;
  booking_code: string;
  total_amount: number;
  status: BookingStatus;
  created_at: string;
  customer_name: string;
  customer_email: string;
  items?: BookingItem[];
}

export interface BookingItem {
  id: string;
  booking_id: string;
  ticket_type_id: string;
  quantity: number;
  unit_price: number;
  ticket_type_name?: string;
  event_title?: string;
  event_code?: string;
}

export interface Ticket {
  id: string;
  booking_item_id: string;
  ticket_code: string;
  qr_token: string;
  status: 'valid' | 'used' | 'revoked';
  created_at: string;
  event_title: string;
  event_code: string;
  ticket_type_name: string;
  customer_name: string;
  event_date: string;
  event_location: string;
}
