// Menu: E-Tiket Digital

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Ticket } from '../types/database';
import { X, Check, Copy, Download } from 'lucide-react';
import { RhodesLogo } from './RhodesLogo';

interface DigitalTicketModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onVerifyTicket?: (ticketCode: string) => void;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({
  ticket,
  onClose,
  onVerifyTicket
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Menu: URL Verifikasi QR
  const verifyUrl = ticket
    ? `${window.location.origin}${window.location.pathname}?verify_ticket=${encodeURIComponent(ticket.ticket_code)}&token=${encodeURIComponent(ticket.qr_token)}`
    : '';

  useEffect(() => {
    if (ticket && verifyUrl) {
      QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        color: {
          dark: '#05080C',
          light: '#FFFFFF'
        },
        width: 320
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => setQrDataUrl(''));
    }
  }, [ticket, verifyUrl]);

  if (!ticket) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formattedDate = new Date(ticket.event_date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const isUsed = ticket.status === 'used';
  const isVip = ticket.ticket_type_name.toLowerCase().includes('vip');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-card border border-line rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu: Header E-Tiket */}
        <div className="bg-head px-6 py-4 border-b border-line flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <RhodesLogo size="sm" withPulse={false} />
            <div>
              <span className="font-sans text-xs font-black text-ink block">
                OFFICIAL E-TICKET PASS
              </span>
              <span className={`text-[10px] font-sans ${isUsed ? 'text-amber-ink' : 'text-green-ink'}`}>
                {isUsed ? 'Sudah Check-In • Telah Digunakan' : 'Terverifikasi • Siap Masuk Venue'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-ink2 hover:text-ink hover:bg-line/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu: Isi E-Tiket */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Menu: Kode Tiket & Status */}
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <span className="text-[10px] font-sans text-muted block">
                KODE TIKET RESMI
              </span>
              <span className="text-base font-sans font-black text-coral-ink">
                {ticket.ticket_code}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-sans font-bold  border ${
              isUsed 
                ? 'bg-yellow-tint text-amber-ink border-amber-500/40' 
                : 'bg-[#2BB673]/15 text-green-ink border-[#2BB673]/40'
            }`}>
              {isUsed ? '● SUDAH CHECK-IN' : '● VALID'}
            </span>
          </div>

          {/* Menu: Ringkasan Acara */}
          <div className="space-y-1">
            <span className="text-[11px] font-sans font-bold text-amber-ink">
              [{ticket.event_code}] • {ticket.ticket_type_name}
            </span>
            <h3 className="font-bold text-base sm:text-lg text-ink leading-tight">
              {ticket.event_title}
            </h3>
          </div>

          {/* Menu: Jadwal & Lokasi */}
          <div className="p-3.5 rounded-xl bg-head border border-line space-y-1 text-xs">
            <div className="text-ink font-medium">{formattedDate}</div>
            <div className="text-ink2">{ticket.event_location}</div>
          </div>

          {/* Menu: Deskripsi Tiket & Hak Akses */}
          <div className="p-4 rounded-xl bg-head border border-line space-y-3">
            <div className="flex items-center justify-between border-b border-line/70 pb-2">
              <span className="text-[10px] font-sans text-coral-ink font-bold">
                RINCIAN TIKET &amp; AKSES MASUK
              </span>
              <span className="text-[10px] font-sans text-green-ink bg-[#2BB673]/10 px-2 py-0.5 rounded border border-[#2BB673]/25">
                {ticket.ticket_type_name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-paper border border-line/60">
                <span className="text-[10px] font-sans text-muted block">PINTU MASUK (GATE)</span>
                <span className="text-ink font-semibold text-xs">
                  {isVip ? 'Gate VIP Khusus A' : 'Gate Utama Masuk B'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-paper border border-line/60">
                <span className="text-[10px] font-sans text-muted block">ZONA AUDIENS</span>
                <span className="text-ink font-semibold text-xs">
                  {isVip ? 'Area Depan VIP' : 'Area Festival Reguler'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-sans text-ink2 font-semibold block">
                Fasilitas &amp; Ketentuan Tiket:
              </span>
              <ul className="text-[11px] text-ink2 space-y-1.5">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2BB673] mt-1 shrink-0" />
                  <span>Akses panggung pertunjukan utama dan hall pameran.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2BB673] mt-1 shrink-0" />
                  <span>Penukaran wristband gelang resmi di gerbang kedatangan.</span>
                </li>
                {isVip && (
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFB81C] mt-1 shrink-0" />
                    <span className="text-ink">Akses eksklusif VIP Lounge &amp; Official Merchandise Pack.</span>
                  </li>
                )}
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted mt-1 shrink-0" />
                  <span>1 tiket berlaku untuk 1 pengunjung. QR code divalidasi 1 kali di gate.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Menu: QR Code Verifikasi */}
          <div className="flex flex-col items-center justify-center p-5 bg-paper rounded-2xl border border-line relative">
            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-xl shadow-xl flex flex-col items-center">
                <img 
                  src={qrDataUrl} 
                  alt={`QR Code untuk ${ticket.ticket_code}`} 
                  className="w-44 h-44 object-contain"
                />
                <span className="text-[9px] font-sans text-black font-semibold mt-1">
                  RHODES DISPATCH BOX OFFICE
                </span>
              </div>
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-xs font-sans text-ink2">
                Membuat QR Code Resmi...
              </div>
            )}

            <p className="text-[11px] text-center text-ink2 mt-3 max-w-xs leading-relaxed">
              Tunjukkan QR Code ini pada scanner gerbang masuk venue untuk validasi otomatis.
            </p>

            {onVerifyTicket && (
              <button
                onClick={() => onVerifyTicket(ticket.ticket_code)}
                className="mt-3 py-2 px-4 rounded-xl text-xs font-bold bg-[#F2542D]/15 hover:bg-[#F2542D]/25 border border-[#F2542D]/40 text-coral-ink transition-all"
              >
                Uji Scan QR di Sini (Simulasi Gate Masuk)
              </button>
            )}

            <div className="mt-3 text-center">
              <span className="text-[10px] font-sans text-muted block">
                TOKEN ENKRIPSI ANTI-DUPLIKASI
              </span>
              <span className="font-sans text-xs text-coral-ink select-all break-all font-semibold">
                {ticket.qr_token}
              </span>
            </div>
          </div>

          {/* Menu: Identitas Pemegang */}
          <div className="flex items-center justify-between text-xs p-3.5 rounded-xl bg-head border border-line">
            <span className="text-ink2 font-sans">PEMEGANG TIKET:</span>
            <span className="text-ink font-bold">{ticket.customer_name}</span>
          </div>

          {/* Menu: Tombol Aksi */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold border border-line bg-head hover:border-[#F2542D]/50 text-ink transition-colors flex items-center justify-center space-x-1.5 text-center"
            >
              {copiedLink ? <Check className="w-4 h-4 text-green-ink" /> : <Copy className="w-4 h-4 text-ink2" />}
              <span>{copiedLink ? 'Tersalin!' : 'Salin Tautan'}</span>
            </button>

            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`${ticket.ticket_code}-E-Ticket.png`}
                className="py-2.5 px-3 rounded-xl text-xs font-bold border border-[#F2542D]/50 bg-[#F2542D] hover:bg-[#FF6A3D] text-white transition-all flex items-center justify-center space-x-1.5 text-center shadow-[0_4px_15px_rgba(242,84,45,0.2)]"
              >
                <Download className="w-4 h-4" />
                <span>Unduh QR Tiket</span>
              </a>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};