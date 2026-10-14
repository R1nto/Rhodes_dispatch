// Menu: Pemesanan Tiket

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { EventItem, TicketType, Booking, Ticket } from '../types/database';
import { processBooking, getActiveUser } from '../lib/supabase';
import { X, ShieldCheck, QrCode, CreditCard, Building2 } from 'lucide-react';

interface BookingModalProps {
  event: EventItem | null;
  ticketType: TicketType | null;
  onClose: () => void;
  onBookingSuccess: (booking: Booking, tickets: Ticket[]) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  event,
  ticketType,
  onClose,
  onBookingSuccess
}) => {
  if (!event || !ticketType) return null;

  const defaultUser = getActiveUser();
  const [customerName, setCustomerName] = useState(defaultUser.name);
  const [customerEmail, setCustomerEmail] = useState(defaultUser.email);
  const [customerPhone, setCustomerPhone] = useState('081234567890');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va' | 'card'>('qris');
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Menu: Timer Sesi Reservasi
  const [timeLeft, setTimeLeft] = useState(899);
  const [qrisQrUrl, setQrisQrUrl] = useState<string>('');

  const remainingQuota = ticketType.quota - ticketType.sold_count;
  const unitPrice = ticketType.price;
  const totalAmount = unitPrice * quantity;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (paymentMethod === 'qris') {
      const qrisPayload = `00020101021226580014ID.GO.QRIS.WWW01189360099881122334450215ID10202688419910303UMI51440014ID.LINKAJA.WWW0215280215173219000520458125303360540${totalAmount}5802ID5919RHODES DISPATCH BOX6007JAKARTA61051011062210117INV-${Date.now().toString().slice(-6)}6304`;
      QRCode.toDataURL(qrisPayload, {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: { dark: '#05080C', light: '#FFFFFF' },
        width: 220
      })
        .then((url) => setQrisQrUrl(url))
        .catch(() => setQrisQrUrl(''));
    }
  }, [paymentMethod, totalAmount]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleQuantityChange = (newQty: number) => {
    if (newQty >= 1 && newQty <= remainingQuota) {
      setQuantity(newQty);
      setErrorMessage(null);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMessage('Harap lengkapi Nama Lengkap dan Alamat Email yang valid.');
      return;
    }

    if (!agreed) {
      setErrorMessage('Anda harus menyetujui Syarat & Ketentuan Pembelian Tiket.');
      return;
    }

    if (quantity > remainingQuota) {
      setErrorMessage(`Jumlah tiket melebihi sisa kuota yang tersedia (${remainingQuota} tiket tersisa).`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await processBooking({
        eventId: event.id,
        ticketTypeId: ticketType.id,
        quantity,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim()
      });

      if (result.success && result.booking && result.tickets) {
        onBookingSuccess(result.booking, result.tickets);
      } else {
        setErrorMessage(result.error || 'Gagal memproses pemesanan tiket.');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kendala teknis saat memproses transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-[#121721] border border-[#263345] rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu: Header Checkout */}
        <div className="bg-[#0E131B] px-6 py-4 border-b border-[#263345] flex items-center justify-between shrink-0">
          <div>
            <span className="font-extrabold text-sm text-[#EEF2F6] block">
              CHECKOUT PEMESANAN TIKET
            </span>
            <div className="flex items-center space-x-2 text-[10px] text-[#00E676] font-mono mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
              <span>Sesi Reservasi Aktif • Sisa Waktu: {formatTimer(timeLeft)}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-[#90A0B7] hover:text-[#EEF2F6] hover:bg-[#263345]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu: Formulir Checkout */}
        <form onSubmit={handleCheckout} className="overflow-y-auto p-5 sm:p-6 space-y-4 flex-1">
          
          {/* Menu: Rincian Tiket & Acara */}
          <div className="p-4 rounded-xl bg-[#0E131B] border border-[#263345] space-y-3">
            <div className="flex items-start space-x-3.5">
              <div className="w-16 h-16 rounded-lg bg-[#090D12] border border-[#263345] overflow-hidden shrink-0">
                <img src={event.poster_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center space-x-2 font-mono text-[11px] text-[#00F0FF] font-semibold">
                  <span>{event.event_code}</span>
                  <span>•</span>
                  <span className="text-[#FFB300]">{ticketType.name}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#EEF2F6] truncate">
                  {event.title}
                </h4>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#90A0B7]">
                    Sisa Kuota: <span className="font-mono text-[#00E676] font-bold">{remainingQuota} tiket</span>
                  </span>
                  <span className="font-mono font-bold text-[#FFB300]">
                    Rp {unitPrice.toLocaleString('id-ID')} / tiket
                  </span>
                </div>
              </div>
            </div>

            {/* Menu: Hak Akses Tiket Terpilih */}
            {ticketType.perks && ticketType.perks.length > 0 && (
              <div className="pt-2 border-t border-[#263345]/60">
                <span className="text-[10px] font-mono uppercase text-[#57687E] block mb-1">
                  FASILITAS KATEGORI TIKET INI:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ticketType.perks.map((perk, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#090D12] border border-[#263345] text-[10px] text-[#90A0B7]"
                    >
                      ✓ {perk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Menu: Form Identitas Pemesan */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#90A0B7] mb-1 font-mono">
                NAMA LENGKAP PEMESAN (SESUAI IDENTITAS RESMI)
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#090D12] border border-[#263345] focus:border-[#00F0FF] rounded-xl text-xs text-[#EEF2F6] outline-none font-medium transition-colors"
                placeholder="Nama lengkap pemegang tiket"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#90A0B7] mb-1 font-mono">
                  EMAIL PENGIRIMAN E-TIKET
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#090D12] border border-[#263345] focus:border-[#00F0FF] rounded-xl text-xs text-[#EEF2F6] outline-none font-medium transition-colors"
                  placeholder="email@domain.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#90A0B7] mb-1 font-mono">
                  NOMOR WHATSAPP / HP
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#090D12] border border-[#263345] focus:border-[#00F0FF] rounded-xl text-xs text-[#EEF2F6] outline-none font-medium transition-colors"
                  placeholder="0812xxxxxxxx"
                />
              </div>
            </div>

            {/* Menu: Pengatur Jumlah Tiket */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#90A0B7] mb-1 font-mono">
                JUMLAH TIKET
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-[#263345] rounded-xl bg-[#090D12] p-0.5">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-9 h-9 flex items-center justify-center text-sm font-bold text-[#90A0B7] hover:text-[#EEF2F6] hover:bg-[#171F2C] rounded-lg disabled:opacity-30 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-mono font-bold text-[#EEF2F6]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= Math.min(5, remainingQuota)}
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center text-sm font-bold text-[#90A0B7] hover:text-[#EEF2F6] hover:bg-[#171F2C] rounded-lg disabled:opacity-30 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-[#57687E]">
                  Maksimal 5 tiket per pesanan
                </span>
              </div>
            </div>
          </div>

          {/* Menu: Pilihan Metode Pembayaran */}
          <div className="space-y-3">
            <label className="block text-[11px] font-semibold uppercase text-[#90A0B7] font-mono">
              PILIH METODE PEMBAYARAN RESMI
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all ${
                  paymentMethod === 'qris'
                    ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.15)] font-bold'
                    : 'border-[#263345] bg-[#090D12] text-[#90A0B7] hover:border-[#263345]/80'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span className="text-[11px]">QRIS Instan</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('va')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all ${
                  paymentMethod === 'va'
                    ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.15)] font-bold'
                    : 'border-[#263345] bg-[#090D12] text-[#90A0B7] hover:border-[#263345]/80'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[11px]">BCA / Mandiri VA</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.15)] font-bold'
                    : 'border-[#263345] bg-[#090D12] text-[#90A0B7] hover:border-[#263345]/80'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[11px]">Kartu Kredit</span>
              </button>
            </div>

            {/* Menu: Tampilan QRIS Live */}
            {paymentMethod === 'qris' && (
              <div className="p-4 rounded-xl bg-[#090D12] border border-[#00F0FF]/30 flex flex-col items-center justify-center text-center space-y-2.5">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase text-[#00F0FF] font-bold tracking-wider">
                    SCAN QRIS PEMBAYARAN LANGSUNG
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                </div>

                {qrisQrUrl ? (
                  <div className="p-2.5 bg-white rounded-xl shadow-lg">
                    <img 
                      src={qrisQrUrl} 
                      alt="QRIS Pembayaran" 
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-xs font-mono text-[#90A0B7]">
                    Membuat QRIS...
                  </div>
                )}

                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#EEF2F6] block">
                    RHODES DISPATCH BOX OFFICE
                  </span>
                  <span className="text-[10px] text-[#90A0B7] font-mono block">
                    NMID: ID1020268841991 • Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-[11px] text-[#57687E] max-w-xs leading-tight">
                  Buka aplikasi e-wallet atau mobile banking Anda (BCA, Mandiri, GoPay, OVO, Dana), lalu arahkan kamera ke kode QR di atas.
                </p>
              </div>
            )}

            {/* Menu: Tampilan Virtual Account */}
            {paymentMethod === 'va' && (
              <div className="p-3.5 rounded-xl bg-[#090D12] border border-[#263345] space-y-2 text-xs">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#90A0B7]">
                  <span>NOMOR VIRTUAL ACCOUNT BCA</span>
                  <span className="text-[#00F0FF]">OTOMATIS DICEK</span>
                </div>
                <div className="font-mono text-sm font-bold text-[#00F0FF] select-all">
                  8841 0812 9901 2245
                </div>
                <p className="text-[10px] text-[#57687E]">
                  Salin nomor VA di atas dan selesaikan transfer melalui ATM atau Mobile Banking BCA/Mandiri.
                </p>
              </div>
            )}
          </div>

          {/* Menu: Rincian Biaya Tiket */}
          <div className="p-4 rounded-xl bg-[#0E131B] border border-[#263345] space-y-2 text-xs">
            <div className="flex justify-between text-[#90A0B7]">
              <span>Kategori Tiket:</span>
              <span className="font-mono text-[#EEF2F6]">{ticketType.name}</span>
            </div>
            <div className="flex justify-between text-[#90A0B7]">
              <span>Harga Satuan:</span>
              <span className="font-mono text-[#EEF2F6]">Rp {unitPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-[#90A0B7]">
              <span>Jumlah Tiket:</span>
              <span className="font-mono text-[#EEF2F6]">{quantity} tiket</span>
            </div>
            <div className="flex justify-between text-[#90A0B7]">
              <span>Biaya Layanan &amp; Penanganan:</span>
              <span className="text-[#00E676] font-mono font-bold">Gratis (Rp 0)</span>
            </div>
            <div className="pt-2 border-t border-[#263345] flex justify-between items-center text-sm font-extrabold text-[#EEF2F6]">
              <span>TOTAL PEMBAYARAN:</span>
              <span className="text-[#FFB300] font-mono text-base">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Menu: Persetujuan Ketentuan */}
          <div className="flex items-start space-x-2 pt-1">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-[#00F0FF] rounded cursor-pointer"
            />
            <label htmlFor="agree" className="text-[11px] text-[#90A0B7] cursor-pointer leading-tight">
              Saya menyetujui Syarat &amp; Ketentuan pembelian tiket dan menyatakan data identitas pemesan adalah sah.
            </label>
          </div>

          {/* Menu: Pesan Error */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* Menu: Tombol Bayar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || remainingQuota <= 0 || !agreed}
              className="w-full py-3.5 px-4 rounded-xl bg-[#00F0FF] hover:bg-[#33F4FF] text-black font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(0,240,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-101"
            >
              {isSubmitting ? (
                <span>MEMVERIFIKASI PEMBAYARAN...</span>
              ) : (
                <span>BAYAR SEKARANG DAN TERBITKAN E-TIKET</span>
              )}
            </button>
            <div className="flex items-center justify-center space-x-1 text-[10px] text-[#57687E] mt-2 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Transaksi dilindungi 256-Bit SSL • E-Tiket diterbitkan seketika</span>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
