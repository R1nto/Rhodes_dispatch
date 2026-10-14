// Menu: Aplikasi Utama

import React, { useState, useEffect, useCallback } from 'react';
import { EventItem, TicketType, Booking, Ticket } from './types/database';
import { fetchEvents, fetchMyBookings, fetchMyTickets } from './lib/supabase';
import { Navbar, ActiveTab } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { OperationsPage } from './pages/OperationsPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { ProfilePage } from './pages/ProfilePage';
import { EventDetailsModal } from './components/EventDetailsModal';
import { BookingModal } from './components/BookingModal';
import { DigitalTicketModal } from './components/DigitalTicketModal';
import { TicketVerificationModal } from './components/TicketVerificationModal';
import { SupabaseStatusModal } from './components/SupabaseStatusModal';
import { RhodesLogo } from './components/RhodesLogo';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('home');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Menu: State Modal
  const [inspectingEvent, setInspectingEvent] = useState<EventItem | null>(null);
  const [bookingEvent, setBookingEvent] = useState<EventItem | null>(null);
  const [bookingTicketType, setBookingTicketType] = useState<TicketType | null>(null);
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [showDbStatus, setShowDbStatus] = useState(false);
  const [verificationScannerOpen, setVerificationScannerOpen] = useState(false);
  const [verificationTicketCode, setVerificationTicketCode] = useState<string | undefined>(undefined);

  // Menu: Notifikasi Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Menu: Muat Data Registri
  const loadData = useCallback(async () => {
    try {
      const [loadedEvents, loadedBookings, loadedTickets] = await Promise.all([
        fetchEvents(),
        fetchMyBookings(),
        fetchMyTickets()
      ]);
      setEvents(loadedEvents);
      setBookings(loadedBookings);
      setTickets(loadedTickets);
    } catch {
      // Fallback ditangani supabase.ts
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Menu: Deteksi Parameter URL Verifikasi QR
    const urlParams = new URLSearchParams(window.location.search);
    const verifyTicketParam = urlParams.get('verify_ticket') || urlParams.get('verify') || urlParams.get('token');
    if (verifyTicketParam) {
      setVerificationTicketCode(verifyTicketParam);
      setVerificationScannerOpen(true);
    }
  }, [loadData]);

  const handleViewEventDetails = (event: EventItem) => {
    setInspectingEvent(event);
  };

  const handleSelectTierForBooking = (event: EventItem, ticketType: TicketType) => {
    setInspectingEvent(null);
    setBookingEvent(event);
    setBookingTicketType(ticketType);
  };

  const handleBookingSuccess = async (newBooking: Booking, newTickets: Ticket[]) => {
    setBookingEvent(null);
    setBookingTicketType(null);

    await loadData();

    setToastMessage(`Pemesanan berhasil! ${newTickets.length} tiket diterbitkan. Kode: ${newBooking.booking_code}`);
    setTimeout(() => setToastMessage(null), 5000);

    if (newTickets.length > 0) {
      setViewingTicket(newTickets[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D12] text-[#EEF2F6] flex flex-col font-sans selection:bg-[#00F0FF]/30">
      
      {/* Menu: Navigasi Atas */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        ticketCount={tickets.length}
        onOpenScanner={() => {
          setVerificationTicketCode(undefined);
          setVerificationScannerOpen(true);
        }}
      />

      {/* Menu: Notifikasi Toast Sukses */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-xl bg-emerald-950/95 border border-emerald-500/60 text-xs text-emerald-200 shadow-2xl flex items-center space-x-3 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#00E676] shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Menu: Halaman Konten Utama */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-3 text-xs text-[#90A0B7]">
            <div className="w-10 h-10 rounded-full border-2 border-[#263345] border-t-[#00F0FF] animate-spin" />
            <p className="font-mono text-[11px] text-[#00F0FF]">MEMUAT BOX OFFICE RHODES DISPATCH...</p>
          </div>
        ) : (
          <>
            {currentTab === 'home' && (
              <HomePage
                events={events}
                onNavigateToOperations={() => setCurrentTab('operations')}
                onViewEventDetails={handleViewEventDetails}
              />
            )}

            {currentTab === 'operations' && (
              <OperationsPage
                events={events}
                onViewEventDetails={handleViewEventDetails}
              />
            )}

            {currentTab === 'tickets' && (
              <MyTicketsPage
                bookings={bookings}
                tickets={tickets}
                onOpenDigitalTicket={(tkt) => setViewingTicket(tkt)}
                onNavigateToOperations={() => setCurrentTab('operations')}
                onOpenVerificationScanner={(code) => {
                  setVerificationTicketCode(code);
                  setVerificationScannerOpen(true);
                }}
              />
            )}

            {currentTab === 'profile' && (
              <ProfilePage
                onOpenDbStatus={() => setShowDbStatus(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Menu: Footer Box Office */}
      <footer className="mt-20 bg-[#0E131B] border-t border-[#263345] text-xs text-[#90A0B7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center space-x-2.5">
                <RhodesLogo size="sm" withPulse={false} />
                <span className="font-extrabold text-[#EEF2F6] font-mono tracking-wider text-sm">
                  RHODES DISPATCH
                </span>
              </div>
              <p className="text-xs text-[#90A0B7] leading-relaxed">
                Platform resmi pemesanan tiket acara subkultur gaming, turnamen esports, konvensi anime, dan festival musik. E-Ticket QR Code unik langsung terbit dan terjamin 100% resmi.
              </p>
              <div className="pt-1 flex items-center space-x-2 text-[10px] text-[#00E676] font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Official Box Office</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase font-mono text-[#EEF2F6]">
                Navigasi Cepat
              </h4>
              <ul className="space-y-1.5 text-xs text-[#90A0B7]">
                <li onClick={() => setCurrentTab('home')} className="hover:text-[#00F0FF] cursor-pointer">Katalog Acara Terbaru</li>
                <li onClick={() => setCurrentTab('operations')} className="hover:text-[#00F0FF] cursor-pointer">Pencarian &amp; Log PRTS</li>
                <li onClick={() => setCurrentTab('tickets')} className="hover:text-[#00F0FF] cursor-pointer">Tiket Digital Saya</li>
                <li onClick={() => setCurrentTab('profile')} className="hover:text-[#00F0FF] cursor-pointer">Profil &amp; Akun Pembeli</li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase font-mono text-[#EEF2F6]">
                Pusat Bantuan &amp; FAQ
              </h4>
              <ul className="space-y-1.5 text-xs text-[#90A0B7]">
                <li className="hover:text-[#00F0FF] cursor-pointer">Panduan Beli Tiket Online</li>
                <li className="hover:text-[#00F0FF] cursor-pointer">Cara Penukaran Wristband di Venue</li>
                <li className="hover:text-[#00F0FF] cursor-pointer">Syarat &amp; Ketentuan Masuk Acara</li>
                <li className="hover:text-[#00F0FF] cursor-pointer">Kebijakan Privasi Pembeli</li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase font-mono text-[#EEF2F6]">
                Metode Pembayaran Resmi
              </h4>
              <p className="text-[11px] text-[#90A0B7]">
                Mendukung verifikasi pembayaran otomatis 24 jam melalui:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-1 rounded bg-[#171F2C] border border-[#263345] text-[10px] font-mono text-[#EEF2F6]">
                  QRIS Nasional
                </span>
                <span className="px-2 py-1 rounded bg-[#171F2C] border border-[#263345] text-[10px] font-mono text-[#EEF2F6]">
                  BCA VA
                </span>
                <span className="px-2 py-1 rounded bg-[#171F2C] border border-[#263345] text-[10px] font-mono text-[#EEF2F6]">
                  Mandiri VA
                </span>
                <span className="px-2 py-1 rounded bg-[#171F2C] border border-[#263345] text-[10px] font-mono text-[#EEF2F6]">
                  BNI VA
                </span>
                <span className="px-2 py-1 rounded bg-[#171F2C] border border-[#263345] text-[10px] font-mono text-[#EEF2F6]">
                  GoPay • OVO
                </span>
                <span className="px-2 py-1 rounded bg-[#171F2C] border border-[#263345] text-[10px] font-mono text-[#EEF2F6]">
                  Visa • Mastercard
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#263345]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#57687E]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
              <span className="text-[#EEF2F6] font-semibold">RHODES DISPATCH BOX OFFICE</span>
              <span>•</span>
              <span>Hak Cipta Dilindungi &copy; 2026</span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowDbStatus(true)}
                className="hover:text-[#00F0FF] transition-colors"
              >
                [Status Server &amp; Database]
              </button>
              <span className="text-[#57687E]">Keamanan Transaksi 256-Bit SSL</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Menu: Dialog Modal Interaktif */}
      <EventDetailsModal
        event={inspectingEvent}
        onClose={() => setInspectingEvent(null)}
        onSelectTicketTierForBooking={handleSelectTierForBooking}
      />

      <BookingModal
        event={bookingEvent}
        ticketType={bookingTicketType}
        onClose={() => {
          setBookingEvent(null);
          setBookingTicketType(null);
        }}
        onBookingSuccess={handleBookingSuccess}
      />

      <DigitalTicketModal
        ticket={viewingTicket}
        onClose={() => setViewingTicket(null)}
        onVerifyTicket={(code) => {
          setViewingTicket(null);
          setVerificationTicketCode(code);
          setVerificationScannerOpen(true);
        }}
      />

      <TicketVerificationModal
        isOpen={verificationScannerOpen}
        onClose={() => {
          setVerificationScannerOpen(false);
          setVerificationTicketCode(undefined);
        }}
        initialTicketCode={verificationTicketCode}
        onTicketStatusChanged={loadData}
      />

      <SupabaseStatusModal
        isOpen={showDbStatus}
        onClose={() => setShowDbStatus(false)}
        onDataReset={loadData}
      />

    </div>
  );
}
