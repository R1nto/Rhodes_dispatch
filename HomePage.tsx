// Menu: Beranda Acara

import React from 'react';
import { EventItem } from '../types/database';
import { EventCarousel } from '../components/EventCarousel';

interface HomePageProps {
  events: EventItem[];
  onNavigateToOperations: () => void;
  onViewEventDetails: (event: EventItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  events,
  onNavigateToOperations,
  onViewEventDetails
}) => {
  return (
    <div className="space-y-14 py-8 sm:py-12">
      
      {/* Menu: Sorotan Acara Unggulan */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="text-[11px] font-semibold text-[#00F0FF] uppercase tracking-wider block">
              Sorotan Utama Musim Ini
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#EEF2F6] tracking-tight">
              Event Pilihan &amp; Konser Eksklusif
            </h1>
          </div>
          <button
            onClick={onNavigateToOperations}
            className="text-xs text-[#90A0B7] hover:text-[#00F0FF] transition-colors font-medium"
          >
            Lihat Semua Jadwal ({events.length})
          </button>
        </div>

        <EventCarousel 
          events={events} 
          onSelectEvent={onViewEventDetails} 
        />
      </section>

      {/* Menu: Keunggulan Layanan Box Office */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#121721] border border-[#263345]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="space-y-1.5">
            <span className="text-[#00F0FF] font-bold text-xs uppercase tracking-wide block">
              Jaminan 100% Resmi
            </span>
            <p className="text-[#90A0B7] leading-relaxed">
              Seluruh tiket terhubung langsung dengan promotor resmi dan terdaftar sah di sistem ticketing.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[#FFB300] font-bold text-xs uppercase tracking-wide block">
              E-Ticket QR Otomatis
            </span>
            <p className="text-[#90A0B7] leading-relaxed">
              Tanpa perlu cetak kertas. Kode QR unik instan langsung tersimpan di akun Anda untuk scan di venue.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[#00E676] font-bold text-xs uppercase tracking-wide block">
              Pembayaran Terverifikasi
            </span>
            <p className="text-[#90A0B7] leading-relaxed">
              Mendukung QRIS instan, Virtual Account bank nasional (BCA, Mandiri, BNI), dan e-wallet.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[#EEF2F6] font-bold text-xs uppercase tracking-wide block">
              Tanpa Antrean Fisik
            </span>
            <p className="text-[#90A0B7] leading-relaxed">
              Penukaran wristband RFID di lokasi berlangsung cepat dengan sistem pemindaian QR terpadu.
            </p>
          </div>
        </div>
      </section>

      {/* Menu: Jadwal Acara Mendatang */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#EEF2F6]">
              Jadwal Acara Mendatang
            </h2>
            <p className="text-xs text-[#90A0B7] mt-0.5">
              Pilihan konser simfoni, turnamen esports, dan festival cosplay siap dipesan
            </p>
          </div>

          <button
            onClick={onNavigateToOperations}
            className="text-xs text-[#00F0FF] hover:text-[#33F4FF] font-bold transition-colors"
          >
            Buka Katalog Lengkap
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.slice(0, 3).map((evt) => {
            const formattedDate = new Date(evt.starts_at).toLocaleDateString('id-ID', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={evt.id}
                className="bg-[#121721] border border-[#263345] rounded-2xl hover:border-[#00F0FF]/50 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
              >
                <div className="relative aspect-16/10 bg-[#090D12] overflow-hidden">
                  <img
                    src={evt.poster_url}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 filter brightness-95"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#090D12]/95 border border-[#263345] text-[#EEF2F6]">
                      {evt.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-[#090D12]/90 border border-[#263345] text-[#00F0FF] font-bold">
                      {evt.event_code}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-sm sm:text-base text-[#EEF2F6] line-clamp-2 leading-snug group-hover:text-[#00F0FF] transition-colors">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-[#90A0B7] line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-[#90A0B7] pt-2 border-t border-[#263345]/50">
                    <div className="text-[#EEF2F6] font-medium">{formattedDate}</div>
                    <div className="truncate text-[#90A0B7]">{evt.location}</div>
                  </div>

                  <div className="pt-3 border-t border-[#263345]/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#57687E] block uppercase tracking-wide">Mulai Dari</span>
                      <span className="font-mono font-bold text-sm text-[#FFB300]">
                        Rp {evt.min_price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      onClick={() => onViewEventDetails(evt)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00F0FF] hover:bg-[#33F4FF] text-black transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                    >
                      Beli Tiket
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Menu: Panduan Alur Pembelian */}
      <section className="rounded-2xl border border-[#263345] bg-[#121721] p-6 sm:p-10 space-y-6">
        <div>
          <span className="text-xs font-semibold text-[#00F0FF] uppercase tracking-wider block">
            Alur Pembelian
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#EEF2F6] mt-1 tracking-tight">
            Bagaimana Cara Mendapatkan Tiket?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-xl bg-[#090D12] border border-[#263345] space-y-2">
            <span className="text-xs font-mono font-extrabold text-[#00F0FF]">Langkah 01</span>
            <h4 className="font-bold text-sm text-[#EEF2F6]">Pilih Acara &amp; Kategori</h4>
            <p className="text-[#90A0B7] leading-relaxed">
              Tentukan acara favorit Anda dan pilih jenis tiket (Regular Pass, VIP Vanguard, atau All-Access) sesuai ketersediaan kuota.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#090D12] border border-[#263345] space-y-2">
            <span className="text-xs font-mono font-extrabold text-[#FFB300]">Langkah 02</span>
            <h4 className="font-bold text-sm text-[#EEF2F6]">Isi Identitas &amp; Selesaikan Pembayaran</h4>
            <p className="text-[#90A0B7] leading-relaxed">
              Lengkapi nama pemegang tiket dan nomor kontak. Bayar menggunakan QRIS, Virtual Account, atau e-wallet pilihan Anda.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#090D12] border border-[#263345] space-y-2">
            <span className="text-xs font-mono font-extrabold text-[#00E676]">Langkah 03</span>
            <h4 className="font-bold text-sm text-[#EEF2F6]">Akses E-Ticket &amp; Scan di Lokasi</h4>
            <p className="text-[#90A0B7] leading-relaxed">
              E-Ticket dengan kode QR dinamis langsung terbit di halaman Tiket Saya. Cukup tunjukkan saat memasuki area acara.
            </p>
          </div>
        </div>
      </section>

      {/* Menu: Pertanyaan Umum FAQ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#EEF2F6] tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-xs text-[#90A0B7] mt-0.5">
            Informasi penting seputar pemesanan dan penukaran tiket di lokasi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-xl bg-[#121721] border border-[#263345] space-y-1.5">
            <h4 className="font-bold text-sm text-[#EEF2F6]">Apakah tiket yang diterbitkan resmi?</h4>
            <p className="text-[#90A0B7] leading-relaxed">
              Ya, Rhodes Dispatch merupakan mitra penjualan tiket resmi dari promotor acara. Setiap tiket memiliki kode unik yang terenkripsi.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#121721] border border-[#263345] space-y-1.5">
            <h4 className="font-bold text-sm text-[#EEF2F6]">Bagaimana proses masuk di lokasi acara?</h4>
            <p className="text-[#90A0B7] leading-relaxed">
              Pengunjung cukup membuka menu Tiket Saya di ponsel, lalu menunjukkan kode QR pada petugas pemindai di pintu gerbang masuk.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#121721] border border-[#263345] space-y-1.5">
            <h4 className="font-bold text-sm text-[#EEF2F6]">Berapa batas maksimal pembelian per transaksi?</h4>
            <p className="text-[#90A0B7] leading-relaxed">
              Setiap pemesan dapat membeli hingga maksimal 5 tiket per transaksi untuk menjaga ketersediaan kuota publik.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#121721] border border-[#263345] space-y-1.5">
            <h4 className="font-bold text-sm text-[#EEF2F6]">Metode pembayaran apa saja yang didukung?</h4>
            <p className="text-[#90A0B7] leading-relaxed">
              Tersedia metode QRIS instan, Virtual Account BCA dan Mandiri, serta kartu kredit resmi.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
