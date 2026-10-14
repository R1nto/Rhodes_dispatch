// Menu: Komponen Kartu Acara

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

  let borderClasses = 'border-[#263345] hover:border-[#00F0FF]/60 hover:shadow-[0_8px_30px_rgba(0,240,255,0.12)]';
  let badgeHighlight = null;

  if (isSearchMatch) {
    borderClasses = 'border-[#00F0FF] ring-2 ring-[#00F0FF]/40 bg-[#00F0FF]/10 shadow-[0_0_20px_rgba(0,240,255,0.35)]';
    badgeHighlight = { label: 'TARGET COCOK', color: 'bg-[#00F0FF] text-black font-extrabold' };
  } else if (isPivot) {
    borderClasses = 'border-[#FFB300] ring-2 ring-[#FFB300]/40 bg-[#FFB300]/10 shadow-[0_0_15px_rgba(255,179,0,0.25)]';
    badgeHighlight = { label: 'PIVOT NODE', color: 'bg-[#FFB300] text-black font-extrabold' };
  } else if (isSwapped) {
    borderClasses = 'border-[#FFB300] ring-2 ring-[#FFB300]/40 bg-[#FFB300]/10 animate-pulse';
    badgeHighlight = { label: 'SWAP / MOVE', color: 'bg-[#FFB300] text-black font-semibold' };
  } else if (isCompared) {
    borderClasses = 'border-[#00F0FF]/80 bg-[#00F0FF]/5 ring-1 ring-[#00F0FF]/30';
    badgeHighlight = { label: 'MEMBANDINGKAN', color: 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40' };
  } else if (isSearchChecked) {
    borderClasses = 'border-[#00F0FF]/60 bg-[#121721] ring-1 ring-[#00F0FF]/30';
    badgeHighlight = { label: 'RADAR SCAN', color: 'bg-[#00F0FF]/20 text-[#00F0FF]' };
  }

  const isSoldOut = event.available_stock <= 0;
  const isAlmostSoldOut = event.available_stock > 0 && event.available_stock <= 100;

  return (
    <div 
      className={`group bg-[#121721] rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative shadow-lg ${borderClasses}`}
    >
      {/* Scanning Radar Beam (when actively checked or compared) */}
      {(isSearchChecked || isCompared) && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F0FF]/20 to-transparent pointer-events-none animate-radar-sweep z-20" />
      )}

      {/* Top Header Ticket Strip */}
      <div className="bg-[#0E131B] px-4 py-2.5 border-b border-[#263345]/70 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-[#00F0FF] font-bold tracking-wider">{event.event_code}</span>
          <span className="text-[#263345]">&bull;</span>
          <span className="text-[#57687E]">Tiket Resmi</span>
        </div>

        {badgeHighlight ? (
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide ${badgeHighlight.color}`}>
            {badgeHighlight.label}
          </span>
        ) : (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            isSoldOut 
              ? 'text-rose-400 bg-rose-950/40 border border-rose-500/30' 
              : isAlmostSoldOut
              ? 'text-[#FFB300] bg-[#FFB300]/15 border border-[#FFB300]/30 animate-pulse'
              : 'text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/30'
          }`}>
            {isSoldOut ? 'Habis' : isAlmostSoldOut ? `Sisa ${event.available_stock}` : 'Tersedia'}
          </span>
        )}
      </div>

      {/* Card Content & Thumbnail */}
      <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between relative z-10">
        
        {/* Poster Image with Category Overlay */}
        <div className="relative aspect-16/10 rounded-xl bg-[#090D12] overflow-hidden border border-[#263345]/60 shadow-inner">
          <img 
            src={event.poster_url} 
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D12]/90 via-transparent to-transparent pointer-events-none" />

          <div className="absolute top-2.5 left-2.5">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-[#090D12]/95 border border-[#263345] text-[#EEF2F6] backdrop-blur-sm shadow-md">
              {event.category}
            </span>
          </div>

          <div className="absolute bottom-2.5 right-2.5">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-[#090D12]/90 border border-[#263345] text-[#FFB300] font-bold">
              {event.available_stock} kuota
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5 pt-0.5">
          <h3 className="font-bold text-sm sm:text-base text-[#EEF2F6] line-clamp-2 leading-snug group-hover:text-[#00F0FF] transition-colors">
            {event.title}
          </h3>
          <p className="text-xs text-[#90A0B7] line-clamp-2 leading-relaxed font-normal">
            {event.description}
          </p>
        </div>

        {/* Logistics (Date & Location) */}
        <div className="space-y-1 text-xs text-[#90A0B7] pt-2 border-t border-[#263345]/50">
          <div className="text-[#EEF2F6] font-medium">{formattedDate}</div>
          <div className="truncate text-[#90A0B7]">{event.location}</div>
        </div>
      </div>

      {/* Card Footer: Pricing & Buy Action */}
      <div className="bg-[#0E131B] px-4 py-3.5 border-t border-[#263345]/70 flex items-center justify-between relative z-10">
        <div>
          <span className="text-[10px] text-[#57687E] block uppercase tracking-wide">
            Mulai Dari
          </span>
          <span className="font-mono font-extrabold text-sm text-[#FFB300]">
            Rp {event.min_price.toLocaleString('id-ID')}
          </span>
        </div>

        <button
          onClick={() => onViewDetails(event)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00F0FF] hover:bg-[#33F4FF] text-black transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        >
          Beli Tiket
        </button>
      </div>
    </div>
  );
};
