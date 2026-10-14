// Menu: Tiket Saya & Riwayat Pesanan

import React, { useState } from 'react';
import { Booking, Ticket } from '../types/database';

interface MyTicketsPageProps {
  bookings: Booking[];
  tickets: Ticket[];
  onOpenDigitalTicket: (ticket: Ticket) => void;
  onNavigateToOperations: () => void;
  onOpenVerificationScanner?: (ticketCode?: string) => void;
}

export const MyTicketsPage: React.FC<MyTicketsPageProps> = ({
  bookings,
  tickets,
  onOpenDigitalTicket,
  onNavigateToOperations,
  onOpenVerificationScanner
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'passes' | 'bookings'>('passes');

  return (
    <div className="space-y-6 py-6 sm:py-8">
      
      {/* Menu: Header & Pilihan Tab */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#263345]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#EEF2F6]">
            Tiket Digital &amp; Pesanan Saya
          </h1>
          <p className="text-xs text-[#90A0B7] mt-1">
            Akses seluruh e-tiket resmi yang telah diterbitkan dan riwayat transaksi box office Anda
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenVerificationScanner && (
            <button
              onClick={() => onOpenVerificationScanner()}
              className="px-3.5 py-2 rounded-xl bg-[#0E131B] hover:bg-[#171F2C] border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-semibold transition-colors"
            >
              Uji Scanner Gate
            </button>
          )}

          <div className="flex items-center space-x-1 bg-[#121721] p-1 rounded-xl border border-[#263345] text-xs">
            <button
              onClick={() => setActiveSubTab('passes')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeSubTab === 'passes'
                  ? 'bg-[#090D12] text-[#00F0FF] border border-[#00F0FF]/40 font-bold'
                  : 'text-[#90A0B7] hover:text-[#EEF2F6]'
              }`}
            >
              E-Tiket Siap Pakai ({tickets.length})
            </button>
            <button
              onClick={() => setActiveSubTab('bookings')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeSubTab === 'bookings'
                  ? 'bg-[#090D12] text-[#00F0FF] border border-[#00F0FF]/40 font-bold'
                  : 'text-[#90A0B7] hover:text-[#EEF2F6]'
              }`}
            >
              Riwayat Pesanan ({bookings.length})
            </button>
          </div>
        </div>
      </div>

      {/* Menu: Daftar E-Tiket Aktif */}
      {activeSubTab === 'passes' ? (
        <div>
          {tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {tickets.map((tkt) => {
                const formattedDate = new Date(tkt.event_date).toLocaleDateString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });
                const isUsed = tkt.status === 'used';
                const isVip = tkt.ticket_type_name.toLowerCase().includes('vip');

                return (
                  <div
                    key={tkt.id}
                    className="bg-[#121721] border border-[#263345] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#00F0FF]/50 transition-all shadow-lg"
                  >
                    {/* Menu: Header Kartu Tiket */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-[#00F0FF] uppercase tracking-wide font-bold block">
                          [{tkt.event_code}] • {tkt.ticket_type_name}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-[#EEF2F6] leading-snug">
                          {tkt.event_title}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                        isUsed 
                          ? 'bg-amber-950/20 text-[#FFB300] border-amber-500/40' 
                          : 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30'
                      }`}>
                        {isUsed ? 'SUDAH DIGUNAKAN' : 'VALID'}
                      </span>
                    </div>

                    {/* Menu: Deskripsi & Rincian Lokasi */}
                    <div className="p-3.5 rounded-xl bg-[#0E131B] border border-[#263345]/60 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[#EEF2F6]">
                        <span className="font-medium">{formattedDate}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#121721] text-[#90A0B7]">
                          {isVip ? 'Gate VIP A' : 'Gate Utama B'}
                        </span>
                      </div>
                      <div className="text-[#90A0B7] text-[11px] truncate">{tkt.event_location}</div>
                      <div className="pt-1.5 border-t border-[#263345]/40 flex justify-between text-[11px]">
                        <span className="text-[#57687E]">Pemegang Tiket:</span>
                        <span className="text-[#EEF2F6] font-semibold">{tkt.customer_name}</span>
                      </div>
                    </div>

                    {/* Menu: Kode Tiket & Aksi */}
                    <div className="pt-3 border-t border-[#263345]/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#57687E] block font-mono">KODE TIKET RESMI</span>
                        <span className="text-xs font-mono font-bold text-[#FFB300]">
                          {tkt.ticket_code}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {onOpenVerificationScanner && (
                          <button
                            onClick={() => onOpenVerificationScanner(tkt.ticket_code)}
                            className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#121721] text-[#00F0FF] hover:bg-[#1A2332] border border-[#00F0FF]/30 transition-all"
                          >
                            Verifikasi Gate
                          </button>
                        )}
                        <button
                          onClick={() => onOpenDigitalTicket(tkt)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00F0FF] text-black hover:bg-[#33F4FF] transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:scale-102"
                        >
                          Buka E-Tiket &amp; QR
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#121721] border border-[#263345] space-y-3">
              <span className="text-xs font-mono text-[#00F0FF] uppercase tracking-wider block">
                [KOTAK TIKET KOSONG]
              </span>
              <h3 className="text-base font-bold text-[#EEF2F6]">Belum Ada Tiket yang Dipesan</h3>
              <p className="text-xs text-[#90A0B7] max-w-sm mx-auto leading-relaxed">
                Anda belum memiliki tiket digital aktif. Buka katalog acara untuk memesan tiket resmi secara instan.
              </p>
              <button
                onClick={onNavigateToOperations}
                className="px-5 py-2.5 rounded-xl bg-[#00F0FF] text-black font-extrabold text-xs transition-all shadow-md hover:scale-102 mt-2"
              >
                Jelajahi Acara Sekarang
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Menu: Riwayat Transaksi Pesanan */
        <div className="space-y-3">
          {bookings.map((bk) => (
            <div
              key={bk.id}
              className="bg-[#121721] border border-[#263345] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[#00F0FF] font-mono font-bold">{bk.booking_code}</span>
                  <span className="text-[#263345]">•</span>
                  <span className="text-[#90A0B7] font-mono">
                    {new Date(bk.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-xs text-[#EEF2F6]">
                  Pemesan: <span className="text-[#EEF2F6] font-medium">{bk.customer_name}</span> ({bk.customer_email})
                </div>
                {bk.items && bk.items.length > 0 && (
                  <div className="text-xs text-[#90A0B7]">
                    {bk.items[0].event_title} • {bk.items[0].quantity}x {bk.items[0].ticket_type_name}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end sm:space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#263345]/50">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-[#57687E] block font-mono">TOTAL PEMBAYARAN</span>
                  <span className="font-mono font-bold text-sm text-[#FFB300]">
                    Rp {bk.total_amount.toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 font-bold">
                  {bk.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
