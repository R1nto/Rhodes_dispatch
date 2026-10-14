// Menu: Profil Pengguna

import React, { useState } from 'react';
import { getActiveUser, setActiveUser } from '../lib/supabase';

interface ProfilePageProps {
  onOpenDbStatus: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onOpenDbStatus
}) => {
  const activeUser = getActiveUser();
  const [name, setName] = useState(activeUser.name);
  const [email, setEmail] = useState(activeUser.email);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveUser(name.trim(), email.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 sm:py-8">
      
      {/* Title */}
      <div className="pb-3 border-b border-[#263345]">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#EEF2F6]">
          Profil Akun Pembeli
        </h1>
        <p className="text-xs text-[#90A0B7] mt-1">
          Kelola data identitas pemesan dan alamat email utama untuk pengiriman e-tiket resmi
        </p>
      </div>

      {/* Operative Card */}
      <div className="bg-[#121721] border border-[#263345] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        
        {/* Header Strip */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-[#090D12] border border-[#3A4D66] flex items-center justify-center text-2xl font-black text-[#00F0FF] font-mono">
            {name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-[#EEF2F6]">
              {name}
            </h2>
            <p className="text-xs text-[#90A0B7] font-mono">
              {email}
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 font-semibold">
                AKUN TERVERIFIKASI
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#090D12] text-[#00F0FF] border border-[#263345]">
                PRIORITY PASS
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-[#263345]">
          <h3 className="text-xs font-mono uppercase text-[#EEF2F6] font-bold">
            Informasi Identitas Pemesan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-[#90A0B7] mb-1.5 font-semibold">
                NAMA LENGKAP (SESUAI IDENTITAS)
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#090D12] border border-[#263345] focus:border-[#00F0FF] rounded-xl text-xs text-[#EEF2F6] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#90A0B7] mb-1.5 font-semibold">
                ALAMAT EMAIL E-TIKET
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#090D12] border border-[#263345] focus:border-[#00F0FF] rounded-xl text-xs text-[#EEF2F6] outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="text-xs text-[#57687E]">
              {saved ? 'Data profil berhasil diperbarui!' : 'Nama ini akan otomatis terisi saat memesan tiket.'}
            </span>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#00F0FF] text-black font-extrabold text-xs hover:bg-[#33F4FF] transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:scale-102"
            >
              <span>{saved ? 'Tersimpan!' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>

      </div>

    </div>
  );
};
