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
import { Theme, getInitialTheme, applyTheme } from './lib/Theme';
import { AuthUser, initAuth, signOut, subscribeAuth } from './lib/auth';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { RhodesLogo } from './components/RhodesLogo';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface MainAppProps {
  user: AuthUser;
  theme: Theme;
  onToggleTheme: () => void;
}

function MainApp({ user, theme, onToggleTheme }: MainAppProps) {
  const isAdminUser = user.role === 'admin';
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
    if (verifyTicketParam && isAdminUser) {
      setVerificationTicketCode(verifyTicketParam);
      setVerificationScannerOpen(true);
    }
  }, [loadData, isAdminUser]);

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
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-primary/30">
      
      {/* Menu: Navigasi Atas */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        ticketCount={tickets.length}
        theme={theme}
        onToggleTheme={onToggleTheme}
        user={user}
        onLogout={() => {
          void signOut();
        }}
        onOpenScanner={
          isAdminUser
            ? () => {
                setVerificationTicketCode(undefined);
                setVerificationScannerOpen(true);
              }
            : undefined
        }
      />

      {/* Menu: Notifikasi Toast Sukses */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-xl bg-green-tint border border-emerald-500/60 text-xs text-green-ink shadow-2xl flex items-center space-x-3 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-green-ink shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Menu: Halaman Konten Utama */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-3 text-xs text-ink2">
            <div className="w-10 h-10 rounded-full border-2 border-line border-t-primary animate-spin" />
            <p className="font-sans text-[11px] text-accent-ink">MEMUAT BOX OFFICE RHODES DISPATCH...</p>
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
                onOpenVerificationScanner={
                  isAdminUser
                    ? (code) => {
                        setVerificationTicketCode(code);
                        setVerificationScannerOpen(true);
                      }
                    : undefined
                }
              />
            )}

            {currentTab === 'admin' && isAdminUser && (
              <AdminPage events={events} onChanged={loadData} />
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
      <footer className="mt-20 bg-head border-t border-line text-xs text-ink2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center space-x-2.5">
                <RhodesLogo size="sm" withPulse={false} />
                <span className="font-extrabold text-ink font-sans text-sm">
                  RHODES DISPATCH
                </span>
              </div>
              <p className="text-xs text-ink2 leading-relaxed">
                Platform resmi pemesanan tiket acara subkultur gaming, turnamen esports, konvensi anime, dan festival musik. E-Ticket QR Code unik langsung terbit dan terjamin 100% resmi.
              </p>
              <div className="pt-1 flex items-center space-x-2 text-[10px] text-green-ink font-sans">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Official Box Office</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-xs font-sans text-ink">
                Navigasi Cepat
              </h4>
              <ul className="space-y-1.5 text-xs text-ink2">
                <li onClick={() => setCurrentTab('home')} className="hover:text-accent-ink cursor-pointer">Katalog Acara Terbaru</li>
                <li onClick={() => setCurrentTab('operations')} className="hover:text-accent-ink cursor-pointer">Pencarian &amp; Log PRTS</li>
                <li onClick={() => setCurrentTab('tickets')} className="hover:text-accent-ink cursor-pointer">Tiket Digital Saya</li>
                <li onClick={() => setCurrentTab('profile')} className="hover:text-accent-ink cursor-pointer">Profil &amp; Akun Pembeli</li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-xs font-sans text-ink">
                Pusat Bantuan &amp; FAQ
              </h4>
              <ul className="space-y-1.5 text-xs text-ink2">
                <li className="hover:text-accent-ink cursor-pointer">Panduan Beli Tiket Online</li>
                <li className="hover:text-accent-ink cursor-pointer">Cara Penukaran Wristband di Venue</li>
                <li className="hover:text-accent-ink cursor-pointer">Syarat &amp; Ketentuan Masuk Acara</li>
                <li className="hover:text-accent-ink cursor-pointer">Kebijakan Privasi Pembeli</li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-xs font-sans text-ink">
                Metode Pembayaran Resmi
              </h4>
              <p className="text-[11px] text-ink2">
                Mendukung verifikasi pembayaran otomatis 24 jam melalui:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-1 rounded bg-soft border border-line text-[10px] font-sans text-ink">
                  QRIS Nasional
                </span>
                <span className="px-2 py-1 rounded bg-soft border border-line text-[10px] font-sans text-ink">
                  BCA VA
                </span>
                <span className="px-2 py-1 rounded bg-soft border border-line text-[10px] font-sans text-ink">
                  Mandiri VA
                </span>
                <span className="px-2 py-1 rounded bg-soft border border-line text-[10px] font-sans text-ink">
                  BNI VA
                </span>
                <span className="px-2 py-1 rounded bg-soft border border-line text-[10px] font-sans text-ink">
                  GoPay • OVO
                </span>
                <span className="px-2 py-1 rounded bg-soft border border-line text-[10px] font-sans text-ink">
                  Visa • Mastercard
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-ink font-semibold">RHODES DISPATCH BOX OFFICE</span>
              <span>•</span>
              <span>Hak Cipta Dilindungi &copy; 2026</span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowDbStatus(true)}
                className="hover:text-accent-ink transition-colors"
              >
                [Status Server &amp; Database]
              </button>
              <span className="text-muted">Keamanan Transaksi 256-Bit SSL</span>
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
        onVerifyTicket={
          isAdminUser
            ? (code) => {
                setViewingTicket(null);
                setVerificationTicketCode(code);
                setVerificationScannerOpen(true);
              }
            : undefined
        }
      />

      <TicketVerificationModal
        isOpen={verificationScannerOpen && isAdminUser}
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

export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = subscribeAuth(setUser);
    initAuth()
      .catch(() => undefined)
      .finally(() => setAuthReady(true));
    return unsubscribe;
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 bg-paper">
        <div className="w-10 h-10 rounded-full border-2 border-line border-t-primary animate-spin" />
        <p className="text-xs text-accent-ink">Memuat...</p>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <MainApp
      key={user.id}
      user={user}
      theme={theme}
      onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
    />
  );
}