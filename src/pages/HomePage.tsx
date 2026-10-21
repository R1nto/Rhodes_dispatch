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
            <span className="text-[11px] font-semibold text-coral-ink block">
              Sorotan Utama Musim Ini
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              Event Pilihan &amp; Konser Eksklusif
            </h1>
          </div>
          <button
            onClick={onNavigateToOperations}
            className="text-xs text-ink2 hover:text-coral-ink transition-colors font-medium"
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
      <section className="p-6 sm:p-8 rounded-2xl bg-card border border-line">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="space-y-1.5 p-4 rounded-2xl border bg-coral-tint border-coral-edge">
            <span className="text-coral-ink font-bold text-xs block">
              Jaminan 100% Resmi
            </span>
            <p className="text-ink2 leading-relaxed">
              Seluruh tiket terhubung langsung dengan promotor resmi dan terdaftar sah di sistem ticketing.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl border bg-yellow-tint border-yellow-edge">
            <span className="text-amber-ink font-bold text-xs block">
              E-Ticket QR Otomatis
            </span>
            <p className="text-ink2 leading-relaxed">
              Tanpa perlu cetak kertas. Kode QR unik instan langsung tersimpan di akun Anda untuk scan di venue.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl border bg-green-tint border-green-edge">
            <span className="text-green-ink font-bold text-xs block">
              Pembayaran Terverifikasi
            </span>
            <p className="text-ink2 leading-relaxed">
              Mendukung QRIS instan, Virtual Account bank nasional (BCA, Mandiri, BNI), dan e-wallet.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl border bg-blue-tint border-blue-edge">
            <span className="text-blue-ink font-bold text-xs block">
              Tanpa Antrean Fisik
            </span>
            <p className="text-ink2 leading-relaxed">
              Penukaran wristband RFID di lokasi berlangsung cepat dengan sistem pemindaian QR terpadu.
            </p>
          </div>
        </div>
      </section>

      {/* Menu: Jadwal Acara Mendatang */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink">
              Jadwal Acara Mendatang
            </h2>
            <p className="text-xs text-ink2 mt-0.5">
              Pilihan konser simfoni, turnamen esports, dan festival cosplay siap dipesan
            </p>
          </div>

          <button
            onClick={onNavigateToOperations}
            className="text-xs text-coral-ink hover:text-[#FF6A3D] font-bold transition-colors"
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
                className="bg-card border border-line rounded-2xl hover:border-[#F2542D]/50 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
              >
                <div className="relative aspect-16/10 bg-paper overflow-hidden">
                  <img
                    src={evt.poster_url}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 filter brightness-95"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-paper/95 border border-line text-ink">
                      {evt.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-sans bg-paper/90 border border-line text-coral-ink font-bold">
                      {evt.event_code}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-sm sm:text-base text-ink line-clamp-2 leading-snug group-hover:text-coral-ink transition-colors">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-ink2 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-ink2 pt-2 border-t border-line/50">
                    <div className="text-ink font-medium">{formattedDate}</div>
                    <div className="truncate text-ink2">{evt.location}</div>
                  </div>

                  <div className="pt-3 border-t border-line/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted block">Mulai Dari</span>
                      <span className="font-sans font-bold text-sm text-amber-ink">
                        Rp {evt.min_price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      onClick={() => onViewEventDetails(evt)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F2542D] hover:bg-[#FF6A3D] text-white transition-all shadow-[0_4px_15px_rgba(242,84,45,0.2)]"
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
      <section className="rounded-2xl border border-line bg-card p-6 sm:p-10 space-y-6">
        <div>
          <span className="text-xs font-semibold text-coral-ink block">
            Alur Pembelian
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-ink mt-1 tracking-tight">
            Bagaimana Cara Mendapatkan Tiket?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-xl bg-coral-tint border border-coral-edge space-y-2">
            <span className="text-xs font-sans font-extrabold text-coral-ink">Langkah 01</span>
            <h4 className="font-bold text-sm text-ink">Pilih Acara &amp; Kategori</h4>
            <p className="text-ink2 leading-relaxed">
              Tentukan acara favorit Anda dan pilih jenis tiket (Regular Pass, VIP Vanguard, atau All-Access) sesuai ketersediaan kuota.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-yellow-tint border border-yellow-edge space-y-2">
            <span className="text-xs font-sans font-extrabold text-amber-ink">Langkah 02</span>
            <h4 className="font-bold text-sm text-ink">Isi Identitas &amp; Selesaikan Pembayaran</h4>
            <p className="text-ink2 leading-relaxed">
              Lengkapi nama pemegang tiket dan nomor kontak. Bayar menggunakan QRIS, Virtual Account, atau e-wallet pilihan Anda.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-green-tint border border-green-edge space-y-2">
            <span className="text-xs font-sans font-extrabold text-green-ink">Langkah 03</span>
            <h4 className="font-bold text-sm text-ink">Akses E-Ticket &amp; Scan di Lokasi</h4>
            <p className="text-ink2 leading-relaxed">
              E-Ticket dengan kode QR dinamis langsung terbit di halaman Tiket Saya. Cukup tunjukkan saat memasuki area acara.
            </p>
          </div>
        </div>
      </section>

      {/* Menu: Pertanyaan Umum FAQ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-ink tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-xs text-ink2 mt-0.5">
            Informasi penting seputar pemesanan dan penukaran tiket di lokasi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-xl bg-card border border-line space-y-1.5">
            <h4 className="font-bold text-sm text-ink">Apakah tiket yang diterbitkan resmi?</h4>
            <p className="text-ink2 leading-relaxed">
              Ya, Rhodes Dispatch merupakan mitra penjualan tiket resmi dari promotor acara. Setiap tiket memiliki kode unik yang terenkripsi.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-card border border-line space-y-1.5">
            <h4 className="font-bold text-sm text-ink">Bagaimana proses masuk di lokasi acara?</h4>
            <p className="text-ink2 leading-relaxed">
              Pengunjung cukup membuka menu Tiket Saya di ponsel, lalu menunjukkan kode QR pada petugas pemindai di pintu gerbang masuk.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-card border border-line space-y-1.5">
            <h4 className="font-bold text-sm text-ink">Berapa batas maksimal pembelian per transaksi?</h4>
            <p className="text-ink2 leading-relaxed">
              Setiap pemesan dapat membeli hingga maksimal 5 tiket per transaksi untuk menjaga ketersediaan kuota publik.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-card border border-line space-y-1.5">
            <h4 className="font-bold text-sm text-ink">Metode pembayaran apa saja yang didukung?</h4>
            <p className="text-ink2 leading-relaxed">
              Tersedia metode QRIS instan, Virtual Account BCA dan Mandiri, serta kartu kredit resmi.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};