// Menu: Verifikasi Tiket & Gate Scanner

import React, { useState, useEffect } from 'react';
import { Ticket } from '../types/database';
import { verifyTicket, checkInTicket, VerificationResult, fetchMyTickets } from '../lib/supabase';
import { RhodesLogo } from './RhodesLogo';
import { X, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

interface TicketVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTicketCode?: string;
  onTicketStatusChanged?: () => void;
}

export const TicketVerificationModal: React.FC<TicketVerificationModalProps> = ({
  isOpen,
  onClose,
  initialTicketCode,
  onTicketStatusChanged
}) => {
  const [inputCode, setInputCode] = useState(initialTicketCode || '');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [checkInSuccessMsg, setCheckInSuccessMsg] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMyTickets().then((t) => setMyTickets(t));
      if (initialTicketCode) {
        setInputCode(initialTicketCode);
        handleRunVerify(initialTicketCode);
      } else {
        setResult(null);
        setCheckInSuccessMsg(null);
      }
    }
  }, [isOpen, initialTicketCode]);

  if (!isOpen) return null;

  const handleRunVerify = async (code: string) => {
    if (!code.trim()) return;
    setVerifying(true);
    setCheckInSuccessMsg(null);
    try {
      const res = await verifyTicket(code);
      setResult(res);
    } catch {
      setResult({
        valid: false,
        message: 'Gagal menghubungi server verifikasi gerbang.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handlePerformCheckIn = async (code: string) => {
    try {
      const checkInRes = await checkInTicket(code);
      if (checkInRes.success) {
        setCheckInSuccessMsg('Check-In berhasil! Status tiket telah diperbarui menjadi SUDAH DIGUNAKAN.');
        if (result && result.ticket) {
          setResult({
            ...result,
            isAlreadyUsed: true,
            message: 'Tiket berhasil divalidasi dan dicatat pada sistem pintu masuk.'
          });
        }
        if (onTicketStatusChanged) {
          onTicketStatusChanged();
        }
      } else {
        setCheckInSuccessMsg(checkInRes.message);
      }
    } catch {
      setCheckInSuccessMsg('Gagal memproses check-in gate.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-card border border-line rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu: Header Scanner */}
        <div className="bg-head px-6 py-4 border-b border-line flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <RhodesLogo size="sm" withPulse={false} />
            <div>
              <span className="font-extrabold text-sm text-ink block">
                VALIDASI GERBANG &amp; SCANNER QR
              </span>
              <span className="text-[10px] text-coral-ink font-sans">
                Pemeriksaan Status Keaslian E-Tiket
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

        {/* Menu: Konten Scanner */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Menu: Input Kode Tiket */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-ink2 font-sans">
              KODE TIKET RESMI / HASIL SCAN QR
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunVerify(inputCode);
                }}
                placeholder="Contoh: TK-RH-8841-A atau RD-SEC-..."
                className="flex-1 px-3.5 py-2.5 bg-paper border border-line focus:border-[#F2542D] rounded-xl text-xs text-ink font-sans outline-none"
              />
              <button
                onClick={() => handleRunVerify(inputCode)}
                disabled={verifying || !inputCode.trim()}
                className="px-4 py-2.5 bg-[#F2542D] hover:bg-[#FF6A3D] disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all"
              >
                {verifying ? 'Memeriksa...' : 'Validasi'}
              </button>
            </div>
          </div>

          {/* Menu: Sensor Laser Scanner */}
          <div className="p-4 rounded-xl bg-paper border border-line space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-sans text-[10px] text-ink2">
                SENSOR SCANNER GERBANG
              </span>
              <button
                onClick={() => setScannerActive(!scannerActive)}
                className="text-[10px] font-sans px-2 py-0.5 rounded bg-soft text-coral-ink hover:bg-line transition-colors"
              >
                {scannerActive ? 'Matikan Sensor Laser' : 'Aktifkan Sensor Laser'}
              </button>
            </div>

            {scannerActive && (
              <div className="relative h-20 bg-[#05080C] rounded-lg border border-[#F2542D]/30 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-x-0 h-0.5 bg-[#F2542D] shadow-[0_4px_12px_#F2542D] animate-pulse top-1/2 -translate-y-1/2" />
                <span className="text-[10px] font-sans text-coral-ink/80 text-center px-4">
                  Sensor Optik Siap Memindai QR Code dari Kamera / Layar HP
                </span>
              </div>
            )}

            {myTickets.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-sans text-muted block">
                  UJI CEPAT DARI DAFTAR TIKET TERSEDIA:
                </span>
                <div className="flex flex-wrap gap-2">
                  {myTickets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setInputCode(t.ticket_code);
                        handleRunVerify(t.ticket_code);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-card hover:bg-soft border border-line text-[11px] font-sans text-ink transition-colors flex items-center space-x-1.5"
                    >
                      <span className={t.status === 'valid' ? 'text-green-ink' : 'text-amber-ink'}>
                        ●
                      </span>
                      <span>{t.ticket_code}</span>
                      <span className="text-[10px] text-muted">({t.customer_name.split(' ')[0]})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Menu: Hasil Validasi */}
          {result && (
            <div className={`p-4 rounded-xl border space-y-3.5 transition-all ${
              !result.valid
                ? 'bg-red-tint border-rose-500/40 text-red-ink'
                : result.isAlreadyUsed
                ? 'bg-yellow-tint border-amber-500/40 text-amber-ink2'
                : 'bg-green-tint border-[#2BB673]/40 text-green-ink'
            }`}>
              
              <div className="flex items-center justify-between pb-2 border-b border-line/60">
                <div className="flex items-center space-x-2">
                  {!result.valid ? (
                    <ShieldAlert className="w-4 h-4 text-red-ink" />
                  ) : result.isAlreadyUsed ? (
                    <AlertTriangle className="w-4 h-4 text-amber-ink" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-ink" />
                  )}
                  <span className="font-sans text-xs font-bold">
                    {!result.valid 
                      ? 'TIKET TIDAK VALID' 
                      : result.isAlreadyUsed 
                      ? 'TIKET TELAH DIGUNAKAN' 
                      : 'TIKET RESMI &amp; VALID'}
                  </span>
                </div>
                <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-paper text-ink2">
                  {new Date().toLocaleTimeString('id-ID')} WIB
                </span>
              </div>

              <p className="text-xs text-ink leading-relaxed">
                {result.message}
              </p>

              {result.ticket && (
                <div className="p-3.5 rounded-xl bg-paper border border-line space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-line/50">
                    <span className="text-[10px] font-sans text-muted">KODE TIKET</span>
                    <span className="font-sans font-bold text-coral-ink">{result.ticket.ticket_code}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink2">Pemegang Tiket:</span>
                    <span className="font-semibold text-ink">{result.ticket.customer_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink2">Nama Acara:</span>
                    <span className="font-medium text-ink truncate max-w-[220px]">{result.ticket.event_title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink2">Kategori Tiket:</span>
                    <span className="font-sans font-bold text-amber-ink">{result.ticket.ticket_type_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink2">Pintu Masuk:</span>
                    <span className="font-sans text-green-ink font-semibold">
                      {result.ticket.ticket_type_name.toLowerCase().includes('vip') ? 'Gate A (VIP Fast-Track)' : 'Gate B (Pintu Utama)'}
                    </span>
                  </div>
                </div>
              )}

              {result.valid && !result.isAlreadyUsed && result.ticket && (
                <button
                  onClick={() => handlePerformCheckIn(result.ticket!.ticket_code)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2BB673] hover:bg-[#4CCB87] text-black font-bold text-xs transition-all shadow-lg"
                >
                  Tandai Check-In (Izinkan Masuk Venue)
                </button>
              )}

              {checkInSuccessMsg && (
                <div className="p-2.5 rounded-lg bg-paper text-xs font-sans text-green-ink text-center border border-[#2BB673]/30">
                  {checkInSuccessMsg}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Menu: Footer Scanner */}
        <div className="bg-head px-6 py-3.5 border-t border-line flex items-center justify-between text-xs text-ink2 shrink-0">
          <span className="text-[11px]">Sistem Scanner Rhodes Dispatch Resmi</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-ink2 hover:text-ink hover:bg-line/40 transition-colors"
          >
            Tutup Scanner
          </button>
        </div>

      </div>
    </div>
  );
};