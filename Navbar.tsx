// Menu: Navigasi Utama

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { RhodesLogo } from './RhodesLogo';
import { getActiveUser } from '../lib/supabase';

export type ActiveTab = 'home' | 'operations' | 'tickets' | 'profile';

interface NavbarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  ticketCount: number;
  onOpenScanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  ticketCount,
  onOpenScanner
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = getActiveUser();

  const navItems = [
    { id: 'home' as ActiveTab, label: 'Beranda' },
    { id: 'operations' as ActiveTab, label: 'Jelajahi Acara' },
    { id: 'tickets' as ActiveTab, label: 'Tiket Saya', badge: ticketCount },
    { id: 'profile' as ActiveTab, label: 'Akun Saya' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090D12]/95 backdrop-blur-md border-b border-[#263345] select-none">
      
      {/* Menu: Banner Pengumuman */}
      <div className="bg-gradient-to-r from-[#00F0FF]/10 via-[#0E131B] to-[#FFB300]/10 border-b border-[#263345]/50 px-4 py-1.5 text-center text-xs flex items-center justify-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
        <span className="text-[#EEF2F6] font-medium tracking-wide">
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
                <span className="font-mono text-base font-black tracking-wider text-[#EEF2F6] group-hover:text-[#00F0FF] transition-colors">
                  RHODES DISPATCH
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                  BOX OFFICE
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#90A0B7]">
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
                      ? 'bg-[#121721] text-[#00F0FF] border border-[#263345] shadow-sm font-bold'
                      : 'text-[#90A0B7] hover:text-[#EEF2F6] hover:bg-[#121721]/50'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#FFB300] text-black font-bold">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#00F0FF] rounded-full shadow-[0_0_8px_#00F0FF]" />
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
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-[#121721] hover:bg-[#1A2332] border border-[#00F0FF]/35 text-[#00F0FF] text-xs font-mono transition-all"
                title="Buka Scanner Verifikasi Tiket"
              >
                <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                <span className="font-semibold">Scan &amp; Verifikasi QR</span>
              </button>
            )}

            <button
              onClick={() => onSelectTab('profile')}
              className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-[#121721] border border-[#263345] hover:border-[#00F0FF]/50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#090D12] border border-[#3A4D66] flex items-center justify-center text-[#00F0FF] text-xs font-bold font-mono">
                {user.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-[#EEF2F6] leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-[#00E676] font-medium">
                  Terverifikasi
                </div>
              </div>
            </button>
          </div>

          {/* Menu: Tombol Hamburger Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#121721] border border-[#263345] text-[#90A0B7] hover:text-[#EEF2F6]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menu: Drawer Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#263345] bg-[#121721] px-4 pt-2 pb-4 space-y-1">
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
                    ? 'bg-[#090D12] text-[#00F0FF] border border-[#00F0FF]/40 font-semibold'
                    : 'text-[#90A0B7] hover:text-[#EEF2F6]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFB300] text-black font-bold">
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
              className="w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-mono font-bold text-[#00F0FF] bg-[#0E131B] border border-[#00F0FF]/30 mt-2 flex items-center space-x-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
              <span>Buka Scanner Gate / Verifikasi QR</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
