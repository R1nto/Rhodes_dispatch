// Menu: Komponen Kartu Acara

import { categoryStyle } from '../lib/categoryColors';
import React from 'react';
import { EventItem } from '../types/database';

interface EventCardProps {
  event: EventItem;
  index: number;
  isCompared?: boolean;
  isSwapped?: boolean;
  isSearchChecked?: boolean;
  isSearchMatch?: boolean;
  isPivot?: boolean;
  onViewDetails: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  index,
  isCompared = false,
  isSwapped = false,
  isSearchChecked = false,
  isSearchMatch = false,
  isPivot = false,
  onViewDetails
}) => {
  const formattedDate = new Date(event.starts_at).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  let borderClasses = 'border-line hover:border-[#F2542D]/60 hover:shadow-[0_8px_30px_rgba(242,84,45,0.12)]';
  let badgeHighlight = null;

  if (isSearchMatch) {
    borderClasses = 'border-[#F2542D] ring-2 ring-[#F2542D]/40 bg-[#F2542D]/10 shadow-[0_4px_20px_rgba(242,84,45,0.35)]';
    badgeHighlight = { label: 'TARGET COCOK', color: 'bg-[#F2542D] text-white font-extrabold' };
  } else if (isPivot) {
    borderClasses = 'border-[#FFB81C] ring-2 ring-[#FFB81C]/40 bg-[#FFB81C]/10 shadow-[0_4px_15px_rgba(255,184,28,0.25)]';
    badgeHighlight = { label: 'PIVOT NODE', color: 'bg-[#FFB81C] text-black font-extrabold' };
  } else if (isSwapped) {
    borderClasses = 'border-[#FFB81C] ring-2 ring-[#FFB81C]/40 bg-[#FFB81C]/10 animate-pulse';
    badgeHighlight = { label: 'SWAP / MOVE', color: 'bg-[#FFB81C] text-black font-semibold' };
  } else if (isCompared) {
    borderClasses = 'border-[#F2542D]/80 bg-[#F2542D]/5 ring-1 ring-[#F2542D]/30';
    badgeHighlight = { label: 'MEMBANDINGKAN', color: 'bg-[#F2542D]/20 text-coral-ink border border-[#F2542D]/40' };
  } else if (isSearchChecked) {
    borderClasses = 'border-[#F2542D]/60 bg-card ring-1 ring-[#F2542D]/30';
    badgeHighlight = { label: 'RADAR SCAN', color: 'bg-[#F2542D]/20 text-coral-ink' };
  }

  const isSoldOut = event.available_stock <= 0;
  const isAlmostSoldOut = event.available_stock > 0 && event.available_stock <= 100;

  return (
    <div 
      className={`group bg-card rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative shadow-lg ${borderClasses}`}
    >
      {/* Scanning Radar Beam (when actively checked or compared) */}
      {(isSearchChecked || isCompared) && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F2542D]/20 to-transparent pointer-events-none animate-radar-sweep z-20" />
      )}

      {/* Top Header Ticket Strip */}
      <div className="bg-head px-4 py-2.5 border-b border-line/70 flex items-center justify-between text-[11px] font-sans">
        <div className="flex items-center space-x-2">
          <span className="text-coral-ink font-bold">{event.event_code}</span>
          <span className="text-line">&bull;</span>
          <span className="text-muted">Tiket Resmi</span>
        </div>

        {badgeHighlight ? (
          <span className={`px-2 py-0.5 rounded text-[10px] font-sans   ${badgeHighlight.color}`}>
            {badgeHighlight.label}
          </span>
        ) : (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            isSoldOut 
              ? 'text-red-ink bg-red-tint border border-rose-500/30' 
              : isAlmostSoldOut
              ? 'text-amber-ink bg-[#FFB81C]/15 border border-[#FFB81C]/30 animate-pulse'
              : 'text-green-ink bg-[#2BB673]/10 border border-[#2BB673]/30'
          }`}>
            {isSoldOut ? 'Habis' : isAlmostSoldOut ? `Sisa ${event.available_stock}` : 'Tersedia'}
          </span>
        )}
      </div>

      {/* Card Content & Thumbnail */}
      <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between relative z-10">
        
        {/* Poster Image with Category Overlay */}
        <div className="relative aspect-16/10 rounded-xl bg-paper overflow-hidden border border-line/60 shadow-inner">
          <img 
            src={event.poster_url} 
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-paper/90 via-transparent to-transparent pointer-events-none" />

          <div className="absolute top-2.5 left-2.5">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md ${categoryStyle(event.category).bg} ${categoryStyle(event.category).text}`}>
              {event.category}
            </span>
          </div>

          <div className="absolute bottom-2.5 right-2.5">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-sans bg-paper/90 border border-line text-amber-ink font-bold">
              {event.available_stock} kuota
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5 pt-0.5">
          <h3 className="font-bold text-sm sm:text-base text-ink line-clamp-2 leading-snug group-hover:text-coral-ink transition-colors">
            {event.title}
          </h3>
          <p className="text-xs text-ink2 line-clamp-2 leading-relaxed font-normal">
            {event.description}
          </p>
        </div>

        {/* Logistics (Date & Location) */}
        <div className="space-y-1 text-xs text-ink2 pt-2 border-t border-line/50">
          <div className="text-ink font-medium">{formattedDate}</div>
          <div className="truncate text-ink2">{event.location}</div>
        </div>
      </div>

      {/* Card Footer: Pricing & Buy Action */}
      <div className="bg-head px-4 py-3.5 border-t border-line/70 flex items-center justify-between relative z-10">
        <div>
          <span className="text-[10px] text-muted block">
            Mulai Dari
          </span>
          <span className="font-sans font-extrabold text-sm text-amber-ink">
            Rp {event.min_price.toLocaleString('id-ID')}
          </span>
        </div>

        <button
          onClick={() => onViewDetails(event)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F2542D] hover:bg-[#FF6A3D] text-white transition-all shadow-[0_4px_15px_rgba(242,84,45,0.2)]"
        >
          Beli Tiket
        </button>
      </div>
    </div>
  );
};