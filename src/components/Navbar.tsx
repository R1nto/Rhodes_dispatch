// Menu: Navigasi Utama

import React, { useState } from 'react';
import { Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import type { Theme } from '../lib/Theme';
import { RhodesLogo } from './RhodesLogo';
import type { AuthUser } from '../lib/auth';

export type ActiveTab = 'home' | 'operations' | 'tickets' | 'profile' | 'admin';

interface NavbarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  ticketCount: number;
  onOpenScanner?: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  user: AuthUser;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  ticketCount,
  onOpenScanner,
  theme,
  onToggleTheme,
  user,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminUser = user.role === 'admin';

  const navItems = [
    { id: 'home' as ActiveTab, label: 'Beranda' },
    { id: 'operations' as ActiveTab, label: 'Jelajahi Acara' },
    { id: 'tickets' as ActiveTab, label: 'Tiket Saya', badge: ticketCount },
    { id: 'profile' as ActiveTab, label: 'Akun Saya' },
    ...(isAdminUser ? [{ id: 'admin' as ActiveTab, label: 'Kelola Acara' }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-md border-b border-line select-none">
      <div className="h-1.5 w-full flex"><span className="flex-1 bg-[#F2542D]" /><span className="flex-1 bg-[#FFB81C]" /><span className="flex-1 bg-[#2BB673]" /><span className="flex-1 bg-[#3B7DDD]" /><span className="flex-1 bg-[#E8458B]" /></div>
      
      {/* Menu: Banner Pengumuman */}
      <div className="bg-gradient-to-r from-[#F2542D]/10 via-head to-[#FFB81C]/10 border-b border-line/50 px-4 py-1.5 text-center text-xs flex items-center justify-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F2542D] animate-ping" />
        <span className="text-ink font-medium">
          Box Office Resmi: Presale Phase 1 Dibuka • Jaminan E-Ticket QR Instan
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Menu: Brand & Logo */}
          <div 
            onClick={() => onSelectTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <RhodesLogo size="md" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-sans text-base font-black text-ink group-hover:text-coral-ink transition-colors">
                  RHODES DISPATCH
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-sans bg-[#F2542D]/10 text-coral-ink border border-[#F2542D]/30 font-bold">
                  BOX OFFICE
                </span>
              </div>
              <p className="text-[10px] font-sans text-ink2">
                Sistem Tiket Acara &amp; Konser Resmi
              </p>
            </div>
          </div>

          {/* Menu: Navigasi Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-card text-coral-ink border border-line shadow-sm font-bold'
                      : 'text-ink2 hover:text-ink hover:bg-card/50'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-sans bg-[#FFB81C] text-black font-bold">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#F2542D] rounded-full shadow-[0_4px_8px_#F2542D]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Menu: Tombol Scanner & Profil */}
          <div className="hidden md:flex items-center space-x-3">
            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-card hover:bg-soft border border-[#F2542D]/35 text-coral-ink text-xs font-sans transition-all"
                title="Buka Scanner Verifikasi Tiket"
              >
                <span className="w-2 h-2 rounded-full bg-[#2BB673] animate-pulse" />
                <span className="font-semibold">Scan &amp; Verifikasi QR</span>
              </button>
            )}

            <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-card border border-line text-ink2 hover:text-coral-ink hover:border-[#F2542D]/50 transition-colors"
            title={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
    >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onSelectTab('profile')}
              className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-card border border-line hover:border-[#F2542D]/50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-paper border border-line2 flex items-center justify-center text-coral-ink text-xs font-bold font-sans">
                {user.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-ink leading-tight">
                  {user.name}
                </div>
                <div className={`text-[10px] font-bold ${isAdminUser ? 'text-coral-ink' : 'text-green-ink'}`}>
                  {isAdminUser ? 'Admin' : 'Pengguna'}
                </div>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-card border border-line text-ink2 hover:text-red-ink hover:border-[#D93636]/50 transition-colors"
              title="Keluar"
              aria-label="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Menu: Tombol Hamburger Mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-card border border-line text-ink2 hover:text-coral-ink hover:border-[#F2542D]/50 transition-colors"
            title={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
    >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-card border border-line text-ink2 hover:text-ink"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menu: Drawer Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-line bg-card px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium ${
                  isActive
                    ? 'bg-paper text-coral-ink border border-[#F2542D]/40 font-semibold'
                    : 'text-ink2 hover:text-ink'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#FFB81C] text-black font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {onOpenScanner && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenScanner();
              }}
              className="w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-sans font-bold text-coral-ink bg-head border border-[#F2542D]/30 mt-2 flex items-center space-x-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#2BB673] animate-pulse" />
              <span>Buka Scanner Gate / Verifikasi QR</span>
            </button>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onLogout();
            }}
            className="w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold text-red-ink bg-red-tint border border-[#D93636]/30 mt-2 flex items-center space-x-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar ({user.name})</span>
          </button>
        </div>
      )}
    </header>
  );
};