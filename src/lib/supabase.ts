// Menu: Registri Tiket & Supabase
// Semua akses data: acara (baca + CRUD admin), pemesanan, tiket, verifikasi.
// - Supabase terhubung  -> data di database, hak akses dijaga RLS (lihat supabase/auth_roles.sql)
// - Supabase belum diisi -> mode demo (localStorage)

import { Booking, EventCategory, EventItem, EventStatus, Ticket, TicketType } from '../types/database';
import { INITIAL_EVENTS, INITIAL_BOOKINGS, INITIAL_TICKETS } from '../data/mockEvents';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getCurrentUser, isAdmin } from './auth';

export { supabase, isSupabaseConfigured };

// LocalStorage Keys untuk Mode Demo
const STORAGE_KEYS = {
  EVENTS: 'rhodes_dispatch_events_v2',
  BOOKINGS: 'rhodes_dispatch_bookings_v2',
  TICKETS: 'rhodes_dispatch_tickets_v2'
};

// Data awal demo dimiliki oleh akun user demo
const SEED_OWNER = 'usr-operator-01';
const DEMO_USER_ID = 'demo-user-01';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export function getActiveUser() {
  const u = getCurrentUser();
  if (u) return { id: u.id, name: u.name, email: u.email, role: u.role };
  return { id: 'guest', name: 'Tamu', email: '', role: 'user' as const };
}

// Inisialisasi data demo di localStorage bila belum ada
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

function demoOwner(userId: string): string {
  return userId === SEED_OWNER ? DEMO_USER_ID : userId;
}

// ---------------------------------------------------------------------
// ACARA (BACA)
// ---------------------------------------------------------------------

function mapEventRow(evt: Row): EventItem {
  const types: TicketType[] = (evt.ticket_types || []).map((t: Row) => ({
    id: t.id,
    event_id: t.event_id,
    name: t.name,
    price: Number(t.price),
    quota: Number(t.quota),
    sold_count: Number(t.sold_count || 0)
  }));
  const minPrice = types.length > 0 ? Math.min(...types.map((t) => t.price)) : 0;
  const availableStock = types.reduce((acc, t) => acc + (t.quota - t.sold_count), 0);
  const totalQuota = types.reduce((acc, t) => acc + t.quota, 0);

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
}

export async function fetchEvents(): Promise<EventItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, ticket_types (*)')
        .order('starts_at', { ascending: true });

      if (!error && data) {
        return data.map(mapEventRow);
      }
    } catch {
      // jatuh ke data demo bila koneksi bermasalah
    }
  }

  const { events } = initDemoStorage();
  return events;
}

// ---------------------------------------------------------------------
// ACARA (CRUD ADMIN)
// ---------------------------------------------------------------------

export interface EventInput {
  event_code: string;
  title: string;
  category: EventCategory;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  poster_url: string;
  status: EventStatus;
}

export interface TierInput {
  id?: string;
  name: string;
  price: number;
  quota: number;
}

export interface SaveResult {
  success: boolean;
  error?: string;
}

function validateEvent(input: EventInput, tiers: TierInput[], existing?: EventItem): string | null {
  if (!input.event_code.trim()) return 'Kode acara wajib diisi.';
  if (!input.title.trim()) return 'Judul acara wajib diisi.';
  if (!input.location.trim()) return 'Lokasi wajib diisi.';
  if (!input.description.trim()) return 'Deskripsi wajib diisi.';
  if (!input.starts_at || !input.ends_at) return 'Waktu mulai dan selesai wajib diisi.';
  if (new Date(input.ends_at) < new Date(input.starts_at)) return 'Waktu selesai tidak boleh sebelum waktu mulai.';
  if (tiers.length === 0) return 'Tambahkan minimal satu kategori tiket.';
  for (const t of tiers) {
    if (!t.name.trim()) return 'Nama kategori tiket wajib diisi.';
    if (!(t.price >= 0)) return `Harga untuk "${t.name}" tidak valid.`;
    if (!Number.isInteger(t.quota) || t.quota < 0) return `Kuota untuk "${t.name}" harus bilangan bulat ≥ 0.`;
    const old = existing?.ticket_types?.find((x) => x.id === t.id);
    if (old && t.quota < old.sold_count) {
      return `Kuota "${t.name}" tidak boleh di bawah jumlah yang sudah terjual (${old.sold_count}).`;
    }
  }
  return null;
}

function friendlyDbError(err: { code?: string; message?: string }): string {
  if (err.code === '23505') return 'Kode acara sudah dipakai acara lain.';
  if (err.code === '23503') return 'Data ini sudah punya pemesanan sehingga tidak bisa dihapus.';
  if (err.code === '42501' || /row-level security/i.test(err.message || '')) {
    return 'Akses ditolak: hanya admin yang boleh mengubah data ini.';
  }
  return err.message || 'Terjadi kesalahan pada database.';
}

/** Buat acara baru (eventId = null) atau perbarui acara yang ada. Hanya admin. */
export async function saveEvent(eventId: string | null, input: EventInput, tiers: TierInput[]): Promise<SaveResult> {
  if (!isAdmin()) return { success: false, error: 'Hanya admin yang boleh mengelola acara.' };

  const cleanInput: EventInput = {
    ...input,
    event_code: input.event_code.trim().toUpperCase(),
    title: input.title.trim(),
    location: input.location.trim(),
    description: input.description.trim(),
    poster_url: input.poster_url.trim() || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'
  };

  // ---------- Supabase ----------
  if (isSupabaseConfigured && supabase) {
    let existing: EventItem | undefined;
    if (eventId) {
      const { data } = await supabase.from('events').select('*, ticket_types (*)').eq('id', eventId).maybeSingle();
      if (data) existing = mapEventRow(data);
    }
    const invalid = validateEvent(cleanInput, tiers, existing);
    if (invalid) return { success: false, error: invalid };

    if (!eventId) {
      const { data: created, error } = await supabase.from('events').insert(cleanInput).select('id').single();
      if (error || !created) return { success: false, error: friendlyDbError(error || {}) };
      const { error: tErr } = await supabase.from('ticket_types').insert(
        tiers.map((t) => ({ event_id: created.id, name: t.name.trim(), price: t.price, quota: t.quota }))
      );
      if (tErr) {
        await supabase.from('events').delete().eq('id', created.id);
        return { success: false, error: friendlyDbError(tErr) };
      }
      return { success: true };
    }

    const { error } = await supabase.from('events').update(cleanInput).eq('id', eventId);
    if (error) return { success: false, error: friendlyDbError(error) };

    const keepIds = tiers.filter((t) => t.id).map((t) => t.id as string);
    const removed = (existing?.ticket_types || []).filter((t) => !keepIds.includes(t.id));
    for (const t of removed) {
      const { error: dErr } = await supabase.from('ticket_types').delete().eq('id', t.id);
      if (dErr) {
        return {
          success: false,
          error: dErr.code === '23503'
            ? `Kategori "${t.name}" sudah punya pemesanan sehingga tidak bisa dihapus.`
            : friendlyDbError(dErr)
        };
      }
    }
    for (const t of tiers) {
      if (t.id) {
        const { error: uErr } = await supabase
          .from('ticket_types')
          .update({ name: t.name.trim(), price: t.price, quota: t.quota })
          .eq('id', t.id);
        if (uErr) return { success: false, error: friendlyDbError(uErr) };
      } else {
        const { error: iErr } = await supabase
          .from('ticket_types')
          .insert({ event_id: eventId, name: t.name.trim(), price: t.price, quota: t.quota });
        if (iErr) return { success: false, error: friendlyDbError(iErr) };
      }
    }
    return { success: true };
  }

  // ---------- Mode demo ----------
  const { events } = initDemoStorage();
  const existing = eventId ? events.find((e) => e.id === eventId) : undefined;
  if (eventId && !existing) return { success: false, error: 'Acara tidak ditemukan.' };

  const invalid = validateEvent(cleanInput, tiers, existing);
  if (invalid) return { success: false, error: invalid };
  if (events.some((e) => e.event_code === cleanInput.event_code && e.id !== eventId)) {
    return { success: false, error: 'Kode acara sudah dipakai acara lain.' };
  }

  const id = existing?.id || `evt-${Date.now()}`;
  const ticket_types: TicketType[] = tiers.map((t, i) => {
    const old = existing?.ticket_types?.find((x) => x.id === t.id);
    return {
      id: old?.id || `tt-${Date.now()}-${i}`,
      event_id: id,
      name: t.name.trim(),
      price: t.price,
      quota: t.quota,
      sold_count: old?.sold_count || 0,
      perks: old?.perks || ['Akses masuk ke area acara', 'E-tiket QR resmi']
    };
  });

  const { bookings } = initDemoStorage();
  const bookedTypeIds = new Set(bookings.flatMap((b) => (b.items || []).map((it) => it.ticket_type_id)));
  const removedBooked = (existing?.ticket_types || []).find(
    (old) => !ticket_types.some((n) => n.id === old.id) && bookedTypeIds.has(old.id)
  );
  if (removedBooked) {
    return { success: false, error: `Kategori "${removedBooked.name}" sudah punya pemesanan sehingga tidak bisa dihapus.` };
  }

  const updated: EventItem = {
    ...(existing || { created_at: new Date().toISOString() }),
    ...cleanInput,
    id,
    created_at: existing?.created_at || new Date().toISOString(),
    ticket_types,
    min_price: ticket_types.length ? Math.min(...ticket_types.map((t) => t.price)) : 0,
    available_stock: ticket_types.reduce((a, t) => a + (t.quota - t.sold_count), 0),
    total_quota: ticket_types.reduce((a, t) => a + t.quota, 0)
  };

  const next = existing ? events.map((e) => (e.id === id ? updated : e)) : [...events, updated];
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(next));
  return { success: true };
}

/** Hapus acara beserta kategori tiketnya. Hanya admin. */
export async function deleteEvent(eventId: string): Promise<SaveResult> {
  if (!isAdmin()) return { success: false, error: 'Hanya admin yang boleh menghapus acara.' };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('events').delete().eq('id', eventId).select('id');
    if (error) {
      return {
        success: false,
        error: error.code === '23503'
          ? 'Acara ini sudah punya pemesanan tiket sehingga tidak bisa dihapus. Ubah statusnya menjadi "concluded" saja.'
          : friendlyDbError(error)
      };
    }
    if (!data || data.length === 0) return { success: false, error: 'Gagal menghapus. Acara tidak ditemukan atau akses ditolak.' };
    return { success: true };
  }

  const { events } = initDemoStorage();
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events.filter((e) => e.id !== eventId)));
  return { success: true };
}

// ---------------------------------------------------------------------
// PEMESANAN
// ---------------------------------------------------------------------

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
  const user = getCurrentUser();

  if (!user) return { success: false, error: 'Silakan login terlebih dahulu untuk memesan tiket.' };
  if (quantity <= 0) return { success: false, error: 'Jumlah tiket minimal 1.' };

  // ---------- Supabase: satu panggilan atomik di server ----------
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.rpc('book_tickets_secure', {
      p_ticket_type_id: ticketTypeId,
      p_quantity: quantity
    });
    if (error || !data) {
      return { success: false, error: error?.message?.replace(/^.*EXCEPTION:\s*/, '') || 'Gagal memproses pemesanan.' };
    }

    const booking: Booking = {
      id: data.booking_id,
      user_id: user.id,
      booking_code: data.booking_code,
      total_amount: Number(data.total_amount),
      status: 'confirmed',
      created_at: data.created_at,
      customer_name: customerName,
      customer_email: customerEmail,
      items: [
        {
          id: data.booking_item_id,
          booking_id: data.booking_id,
          ticket_type_id: ticketTypeId,
          quantity,
          unit_price: Number(data.unit_price),
          ticket_type_name: data.ticket_type_name,
          event_title: data.event_title,
          event_code: data.event_code
        }
      ]
    };
    const tickets: Ticket[] = (data.tickets || []).map((t: Row) => ({
      id: t.id,
      booking_item_id: data.booking_item_id,
      ticket_code: t.ticket_code,
      qr_token: t.qr_token,
      status: 'valid',
      created_at: t.created_at,
      event_title: data.event_title,
      event_code: data.event_code,
      ticket_type_name: data.ticket_type_name,
      customer_name: customerName,
      event_date: data.event_date,
      event_location: data.event_location
    }));
    return { success: true, booking, tickets };
  }

  // ---------- Mode demo ----------
  const { events, bookings, tickets } = initDemoStorage();
  const event = events.find((e) => e.id === eventId);
  if (!event) return { success: false, error: 'Acara tidak ditemukan.' };

  const ticketType = event.ticket_types?.find((tt) => tt.id === ticketTypeId);
  if (!ticketType) return { success: false, error: 'Kategori tiket tidak tersedia.' };

  const remaining = ticketType.quota - ticketType.sold_count;
  if (remaining < quantity) {
    return { success: false, error: `Kuota tidak cukup! Tersisa ${remaining} tiket untuk kategori ini.` };
  }

  ticketType.sold_count += quantity;
  event.available_stock = Math.max(0, event.available_stock - quantity);

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

  const newTickets: Ticket[] = [];
  for (let i = 0; i < quantity; i++) {
    const suffix = String.fromCharCode(65 + i);
    const uniqueToken = `RD-SEC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${i + 1}`;
    newTickets.push({
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
    });
  }

  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([newBooking, ...bookings]));
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify([...newTickets, ...tickets]));

  return { success: true, booking: newBooking, tickets: newTickets };
}

// ---------------------------------------------------------------------
// RIWAYAT PESANAN & TIKET MILIK SENDIRI
// ---------------------------------------------------------------------

const TICKET_SELECT =
  'id, booking_item_id, ticket_code, qr_token, status, created_at,' +
  'booking_items!inner(id, ticket_types(name, events(title, event_code, starts_at, location)),' +
  'bookings!inner(user_id, profiles(full_name)))';

function rowToTicket(row: Row): Ticket {
  const item = row.booking_items || {};
  const tt = item.ticket_types || {};
  const ev = tt.events || {};
  return {
    id: row.id,
    booking_item_id: row.booking_item_id,
    ticket_code: row.ticket_code,
    qr_token: row.qr_token,
    status: row.status,
    created_at: row.created_at,
    event_title: ev.title || 'Acara',
    event_code: ev.event_code || '-',
    ticket_type_name: tt.name || '-',
    customer_name: item.bookings?.profiles?.full_name || 'Pemegang tiket',
    event_date: ev.starts_at || new Date().toISOString(),
    event_location: ev.location || '-'
  };
}

export async function fetchMyBookings(): Promise<Booking[]> {
  const user = getCurrentUser();
  if (!user) return [];

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('bookings')
      .select(
        'id, user_id, booking_code, total_amount, status, created_at,' +
        'booking_items(id, booking_id, ticket_type_id, quantity, unit_price, ticket_types(name, events(title, event_code)))'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as Row[]).map((b) => ({
      id: b.id,
      user_id: b.user_id,
      booking_code: b.booking_code,
      total_amount: Number(b.total_amount),
      status: b.status,
      created_at: b.created_at,
      customer_name: user.name,
      customer_email: user.email,
      items: (b.booking_items || []).map((it: Row) => ({
        id: it.id,
        booking_id: it.booking_id,
        ticket_type_id: it.ticket_type_id,
        quantity: it.quantity,
        unit_price: Number(it.unit_price),
        ticket_type_name: it.ticket_types?.name,
        event_title: it.ticket_types?.events?.title,
        event_code: it.ticket_types?.events?.event_code
      }))
    }));
  }

  const { bookings } = initDemoStorage();
  return bookings.filter((b) => demoOwner(b.user_id) === user.id);
}

export async function fetchMyTickets(): Promise<Ticket[]> {
  const user = getCurrentUser();
  if (!user) return [];

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('tickets')
      .select(TICKET_SELECT)
      .eq('booking_items.bookings.user_id', user.id)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as Row[]).map(rowToTicket);
  }

  const { bookings, tickets } = initDemoStorage();
  const myItemIds = new Set(
    bookings.filter((b) => demoOwner(b.user_id) === user.id).flatMap((b) => (b.items || []).map((i) => i.id))
  );
  return tickets.filter((t) => myItemIds.has(t.booking_item_id));
}

export function resetDemoRegistry(): void {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
}

// ---------------------------------------------------------------------
// VERIFIKASI & CHECK-IN GERBANG (admin)
// ---------------------------------------------------------------------

export interface VerificationResult {
  valid: boolean;
  ticket?: Ticket;
  message: string;
  checkInTime?: string;
  isAlreadyUsed?: boolean;
}

async function findTicketSupabase(input: string): Promise<Ticket | null> {
  if (!supabase) return null;
  const code = input.match(/TK-RH-[A-Z0-9-]+/)?.[0];
  const token = input.match(/RD-SEC-[A-Z0-9-]+/)?.[0];
  const filters = [code && `ticket_code.eq.${code}`, token && `qr_token.eq.${token}`].filter(Boolean);
  if (filters.length === 0) return null;
  const { data } = await supabase.from('tickets').select(TICKET_SELECT).or(filters.join(',')).limit(1);
  return data && data.length > 0 ? rowToTicket(data[0]) : null;
}

function findTicketDemo(input: string, tickets: Ticket[]): Ticket | undefined {
  return tickets.find(
    (t) =>
      t.ticket_code.toUpperCase() === input ||
      t.qr_token.toUpperCase() === input ||
      input.includes(t.ticket_code.toUpperCase()) ||
      input.includes(t.qr_token.toUpperCase())
  );
}

export async function verifyTicket(codeOrToken: string): Promise<VerificationResult> {
  const cleanInput = codeOrToken.trim().toUpperCase();

  let found: Ticket | null | undefined;
  if (isSupabaseConfigured && supabase) {
    found = await findTicketSupabase(cleanInput);
  } else {
    found = findTicketDemo(cleanInput, initDemoStorage().tickets);
  }

  if (!found) {
    return { valid: false, message: 'Kode tiket atau token QR tidak ditemukan di database server Rhodes Dispatch.' };
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
    return { valid: false, ticket: found, message: 'Tiket ini telah dibatalkan atau dicabut oleh promotor.' };
  }

  return {
    valid: true,
    ticket: found,
    isAlreadyUsed: false,
    message: 'TIKET RESMI & VALID. Siap dipindai untuk akses masuk gerbang (Gate Entry).'
  };
}

export async function checkInTicket(ticketCode: string): Promise<{ success: boolean; ticket?: Ticket; message: string }> {
  if (!isAdmin()) {
    return { success: false, message: 'Hanya admin yang dapat melakukan check-in di gerbang.' };
  }
  const cleanCode = ticketCode.trim().toUpperCase();

  if (isSupabaseConfigured && supabase) {
    const target = await findTicketSupabase(cleanCode);
    if (!target) return { success: false, message: 'Tiket tidak ditemukan.' };
    if (target.status === 'used') {
      return { success: false, ticket: target, message: 'Tiket sudah pernah check-in sebelumnya. Akses gerbang ditolak untuk mencegah duplikasi.' };
    }
    if (target.status === 'revoked') {
      return { success: false, ticket: target, message: 'Tiket ini telah dibatalkan.' };
    }
    const { data, error } = await supabase.from('tickets').update({ status: 'used' }).eq('id', target.id).eq('status', 'valid').select('id');
    if (error || !data || data.length === 0) {
      return { success: false, ticket: target, message: 'Check-in gagal. Tiket mungkin sudah dipakai atau akses ditolak.' };
    }
    return { success: true, ticket: { ...target, status: 'used' }, message: 'Check-in berhasil! Pengunjung diizinkan memasuki arena venue.' };
  }

  const { tickets } = initDemoStorage();
  const idx = tickets.findIndex((t) => t.ticket_code.toUpperCase() === cleanCode || t.qr_token.toUpperCase() === cleanCode);
  if (idx === -1) return { success: false, message: 'Tiket tidak ditemukan.' };

  const target = tickets[idx];
  if (target.status === 'used') {
    return { success: false, ticket: target, message: 'Tiket sudah pernah check-in sebelumnya. Akses gerbang ditolak untuk mencegah duplikasi.' };
  }
  target.status = 'used';
  tickets[idx] = target;
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  return { success: true, ticket: target, message: 'Check-in berhasil! Pengunjung diizinkan memasuki arena venue.' };
}