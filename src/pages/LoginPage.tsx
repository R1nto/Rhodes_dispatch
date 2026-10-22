// Menu: Masuk & Daftar

import React, { useState } from 'react';
import { signIn, signUp, DEMO_ACCOUNT_HINTS } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { RhodesLogo } from '../components/RhodesLogo';
import { Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'login') {
        const res = await signIn(email, password);
        if (res.error) setError(res.error);
      } else {
        const res = await signUp(name, email, password);
        if (res.error) setError(res.error);
        else if (res.needsConfirmation) {
          setInfo('Pendaftaran berhasil! Cek email kamu untuk konfirmasi, lalu masuk.');
          setMode('login');
        }
      }
    } catch {
      setError('Terjadi kendala koneksi. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-paper border border-line focus:border-primary rounded-xl text-sm text-ink outline-none transition-colors placeholder:text-muted';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-paper">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-12 h-12">
            <RhodesLogo />
          </div>
          <div>
            <div className="font-extrabold text-xl text-ink leading-tight">RHODES DISPATCH</div>
            <div className="text-xs text-ink2">Sistem Tiket Acara &amp; Konser Resmi</div>
          </div>
        </div>

        <div className="bg-card border border-line rounded-2xl shadow-xl overflow-hidden">
          <div className="h-1.5 w-full flex">
            <span className="flex-1 bg-primary" />
            <span className="flex-1 bg-[#FFB81C]" />
            <span className="flex-1 bg-[#2BB673]" />
            <span className="flex-1 bg-[#3B7DDD]" />
            <span className="flex-1 bg-[#E8458B]" />
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-soft border border-line text-sm">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError(null);
                    setInfo(null);
                  }}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    mode === m ? 'bg-card text-accent-ink shadow-sm border border-line' : 'text-ink2 hover:text-ink'
                  }`}
                >
                  {m === 'login' ? 'Masuk' : 'Daftar'}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs text-ink2 mb-1.5 font-semibold">Nama lengkap</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama kamu"
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-ink2 mb-1.5 font-semibold">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs text-ink2 mb-1.5 font-semibold">Kata sandi</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink2 hover:text-ink"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-3.5 py-2.5 rounded-xl bg-red-tint border border-[#D93636]/40 text-red-ink text-xs font-semibold">
                  {error}
                </div>
              )}
              {info && (
                <div className="px-3.5 py-2.5 rounded-xl bg-green-tint border border-green-edge text-green-ink text-xs font-semibold">
                  {info}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-extrabold text-sm transition-all shadow-[0_4px_15px_rgba(68,161,164,0.25)] disabled:opacity-60"
              >
                {busy ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat Akun'}
              </button>
            </form>

            {mode === 'register' && (
              <p className="text-[11px] text-muted text-center">
                Akun baru otomatis berperan sebagai pengguna biasa. Peran admin diatur oleh pengelola.
              </p>
            )}

            {!isSupabaseConfigured && mode === 'login' && (
              <div className="rounded-xl border border-yellow-edge bg-yellow-tint p-3.5 space-y-2">
                <div className="text-xs font-bold text-amber-ink">Mode demo — akun contoh:</div>
                {DEMO_ACCOUNT_HINTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword(acc.password);
                    }}
                    className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg bg-card border border-line hover:border-primary/60 transition-colors"
                  >
                    <span className="text-xs text-ink">
                      <strong>{acc.role === 'admin' ? 'Admin' : 'User'}</strong> · {acc.email} / {acc.password}
                    </span>
                    <span className="text-[10px] text-accent-ink font-bold">Isi otomatis</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};