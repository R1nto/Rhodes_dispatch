// Menu: Profil Pengguna

import React from 'react';
import { getCurrentUser } from '../lib/auth';

interface ProfilePageProps {
  onOpenDbStatus: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenDbStatus }) => {
  const user = getCurrentUser();
  if (!user) return null;
  const isAdminUser = user.role === 'admin';

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 sm:py-8">
      <div className="pb-3 border-b border-line">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink">Akun Saya</h1>
        <p className="text-xs text-ink2 mt-1">Informasi akun yang sedang masuk dan hak aksesnya.</p>
      </div>

      <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-paper border border-line2 flex items-center justify-center text-2xl font-black text-coral-ink font-sans">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-ink">{user.name}</h2>
            <p className="text-xs text-ink2 font-sans">{user.email}</p>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isAdminUser
                  ? 'bg-coral-tint text-coral-ink border-coral-edge'
                  : 'bg-green-tint text-green-ink border-green-edge'
              }`}
            >
              {isAdminUser ? 'ADMIN' : 'PENGGUNA'}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-line space-y-2">
          <h3 className="text-xs text-ink font-bold">Hak akses</h3>
          <ul className="text-xs text-ink2 space-y-1.5 list-disc list-inside">
            <li>Melihat acara, memesan tiket, dan melihat e-tiket milik sendiri</li>
            {isAdminUser ? (
              <>
                <li>
                  <strong className="text-ink">Menambah, mengubah, dan menghapus acara</strong> (menu Kelola Acara)
                </li>
                <li>
                  <strong className="text-ink">Scan &amp; verifikasi tiket</strong> serta check-in di gerbang
                </li>
              </>
            ) : (
              <li>Pengelolaan acara dan check-in gerbang hanya untuk admin</li>
            )}
          </ul>
        </div>

        <div className="pt-4 border-t border-line">
          <button
            onClick={onOpenDbStatus}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-card border border-line hover:border-[#F2542D]/60 text-ink"
          >
            Status Server &amp; Database
          </button>
        </div>
      </div>
    </div>
  );
};