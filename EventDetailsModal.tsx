// Menu: Detail Acara & Kategori Tiket

import React from 'react';
import { EventItem, TicketType } from '../types/database';
import { X, Calendar, MapPin, Tag } from 'lucide-react';

interface EventDetailsModalProps {
  event: EventItem | null;
  onClose: () => void;
  onSelectTicketTierForBooking: (event: EventItem, ticketType: TicketType) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  onClose,
  onSelectTicketTierForBooking
}) => {
  if (!event) return null;

  const formattedStartDate = new Date(event.starts_at).toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formattedEndDate = new Date(event.ends_at).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-[#121721] border border-[#263345] rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu: Header Modal */}
        <div className="bg-[#0E131B] px-6 py-4 border-b border-[#263345] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs text-[#00F0FF] px-2.5 py-0.5 rounded bg-[#090D12] border border-[#263345] font-bold">
              {event.event_code}
            </span>
            <span className="text-xs uppercase font-mono tracking-wider text-[#90A0B7]">
              INFORMASI &amp; PEMESANAN TIKET
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-[#90A0B7] hover:text-[#EEF2F6] hover:bg-[#263345]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu: Konten Detail Acara */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          
          {/* Menu: Banner Poster & Meta Info */}
          <div className="relative rounded-2xl overflow-hidden border border-[#263345] aspect-[21/9] bg-[#0E131B] shadow-inner">
            <img 
              src={event.poster_url} 
              alt={event.title} 
              className="w-full h-full object-cover brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E131B] via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#121721]/90 backdrop-blur-md text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                {event.category.toUpperCase()}
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#121721]/90 backdrop-blur-md text-[#00E676] border border-[#00E676]/30 font-bold">
                TIKET TERSEDIA
              </span>
            </div>
          </div>

          {/* Menu: Judul & Jadwal Acara */}
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#EEF2F6] leading-tight">
              {event.title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-[#0E131B] border border-[#263345] flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-[#00F0FF] shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#57687E] block">WAKTU PELAKSANAAN</span>
                  <span className="text-[#EEF2F6] font-medium block">{formattedStartDate}</span>
                  <span className="text-[11px] text-[#90A0B7]">s/d {formattedEndDate} WIB</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0E131B] border border-[#263345] flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-[#FFB300] shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#57687E] block">LOKASI VENUE</span>
                  <span className="text-[#EEF2F6] font-medium block">{event.location}</span>
                  <span className="text-[11px] text-[#90A0B7]">Pintu Masuk Utama Gate 1 &amp; VIP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu: Deskripsi & Fasilitas Acara */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#263345] pb-2">
              <h4 className="text-xs font-mono uppercase text-[#00F0FF] tracking-wider font-bold">
                TENTANG ACARA INI
              </h4>
              <span className="text-[10px] font-mono text-[#00E676] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                Penyelenggaraan Resmi
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#EEF2F6] leading-relaxed">
              {event.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3.5 rounded-xl bg-[#090D12] border border-[#263345] space-y-1.5 text-xs">
                <span className="text-[10px] font-mono uppercase text-[#FFB300] font-bold block">
                  SOROTAN UTAMA ACARA
                </span>
                <ul className="text-[11px] text-[#90A0B7] space-y-1">
                  <li>• Panggung pertunjukan utama dengan audio visual spektakuler</li>
                  <li>• Lebih dari 50+ booth kreator merchandise resmi</li>
                  <li>• Temu sapa eksklusif pengisi acara dan bintang tamu</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-[#090D12] border border-[#263345] space-y-1.5 text-xs">
                <span className="text-[10px] font-mono uppercase text-[#00F0FF] font-bold block">
                  FASILITAS DI DALAM VENUE
                </span>
                <ul className="text-[11px] text-[#90A0B7] space-y-1">
                  <li>• Area pameran berpendingin udara (Full AC) &amp; Free Wi-Fi</li>
                  <li>• Pos Medis Rhodes Island 24 Jam &amp; Ruang Laktasi</li>
                  <li>• Food &amp; Beverage Area resmi serta Musholla</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Menu: Kategori Tiket Tersedia */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase text-[#EEF2F6] tracking-wider font-bold flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>KATEGORI TIKET TERSEDIA</span>
              </h4>
              <span className="text-xs text-[#90A0B7] font-mono">
                Sisa: {event.available_stock} dari {event.total_quota} Tiket
              </span>
            </div>

            <div className="space-y-3">
              {event.ticket_types && event.ticket_types.length > 0 ? (
                event.ticket_types.map((tier) => {
                  const remainingQuota = tier.quota - tier.sold_count;
                  const isSoldOut = remainingQuota <= 0;

                  return (
                    <div 
                      key={tier.id}
                      className="p-4 rounded-xl bg-[#0E131B] border border-[#263345] hover:border-[#00F0FF]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-bold text-sm sm:text-base text-[#EEF2F6]">
                            {tier.name}
                          </h5>
                          <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full ${
                            isSoldOut 
                              ? 'bg-rose-950/40 text-rose-400 border border-rose-500/30' 
                              : 'bg-[#121721] text-[#00F0FF] border border-[#00F0FF]/30'
                          }`}>
                            {remainingQuota} tiket tersisa
                          </span>
                        </div>

                        {tier.perks && tier.perks.length > 0 && (
                          <div className="flex flex-col space-y-1 pt-1">
                            {tier.perks.map((perk, i) => (
                              <span 
                                key={i}
                                className="inline-flex items-center space-x-2 text-xs text-[#90A0B7]"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] shrink-0" />
                                <span>{perk}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end sm:space-x-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#263345]/50">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] uppercase font-mono text-[#57687E] block">HARGA TIKET</span>
                          <span className="text-base font-mono font-black text-[#FFB300]">
                            Rp {tier.price.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <button
                          disabled={isSoldOut}
                          onClick={() => onSelectTicketTierForBooking(event, tier)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                            isSoldOut
                              ? 'bg-[#121721] text-[#57687E] border border-[#263345] cursor-not-allowed'
                              : 'bg-[#00F0FF] text-black hover:bg-[#33F4FF] shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:scale-102'
                          }`}
                        >
                          {isSoldOut ? 'Tiket Habis' : 'Pesan Sekarang'}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-[#90A0B7] bg-[#0E131B] rounded-xl border border-[#263345]">
                  Kategori tiket belum dibuka.
                </div>
              )}
            </div>
          </div>

          {/* Menu: Syarat & Ketentuan Masuk */}
          <div className="p-4 rounded-xl bg-[#090D12] border border-[#263345] space-y-2 text-xs">
            <h5 className="font-bold text-[#EEF2F6] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#FFB300]" />
              <span>Syarat &amp; Ketentuan Masuk Acara</span>
            </h5>
            <ul className="list-disc list-inside space-y-1 text-[#90A0B7] leading-relaxed">
              <li>Wajib menunjukkan E-Ticket QR Code pada menu &quot;Tiket Saya&quot; saat memasuki pintu masuk venue.</li>
              <li>Satu tiket berlaku untuk satu orang pengunjung. Tiket yang sudah dipindai tidak dapat digunakan kembali.</li>
              <li>Bawa kartu identitas resmi (KTP / SIM / Kartu Pelajar) yang namanya sesuai dengan pemesan.</li>
              <li>Dilarang membawa makanan dari luar, minuman keras, senjata tajam, dan benda berbahaya.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
