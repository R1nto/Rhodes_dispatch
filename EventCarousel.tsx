// Menu: Komponen Banner Carousel Acara

import React, { useState, useEffect } from 'react';
import { EventItem } from '../types/database';

interface EventCarouselProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
}

export const EventCarousel: React.FC<EventCarouselProps> = ({
  events,
  onSelectEvent
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const featured = events.slice(0, 5); // Top 5 featured events

  // Auto-slide every 5.5 seconds unless paused by mouse hover
  useEffect(() => {
    if (isPaused || featured.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [isPaused, featured.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  if (featured.length === 0) return null;

  const currentEvent = featured[currentIndex];

  const formattedDate = new Date(currentEvent.starts_at).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div 
      className="relative rounded-2xl overflow-hidden border border-[#263345] bg-[#121721] shadow-2xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Image Background with Gradient Wash */}
      <div className="relative h-[340px] sm:h-[420px] w-full overflow-hidden">
        <img
          key={currentEvent.id}
          src={currentEvent.poster_url}
          alt={currentEvent.title}
          className="w-full h-full object-cover filter brightness-[0.75] transition-all duration-700 ease-out scale-100 group-hover:scale-102"
        />

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D12] via-[#090D12]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090D12]/90 via-[#090D12]/40 to-transparent" />
      </div>

      {/* Slide Content Overlay */}
      <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between z-10">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00F0FF] text-black tracking-wide">
              {currentEvent.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#090D12]/90 border border-[#263345] text-[#FFB300] font-bold">
              {currentEvent.event_code}
            </span>
            <span className="hidden sm:inline-block text-xs font-medium text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full border border-[#00E676]/30">
              Penjualan Resmi Dibuka
            </span>
          </div>

          <div className="text-xs font-mono text-[#90A0B7] bg-[#090D12]/80 px-3 py-1 rounded-full border border-[#263345]">
            {currentIndex + 1} / {featured.length}
          </div>
        </div>

        {/* Center / Bottom Info */}
        <div className="max-w-2xl space-y-3.5">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#EEF2F6] tracking-tight leading-tight drop-shadow-md">
            {currentEvent.title}
          </h2>

          <p className="text-xs sm:text-sm text-[#90A0B7] line-clamp-2 leading-relaxed">
            {currentEvent.description}
          </p>

          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-[#EEF2F6] pt-1">
            <span className="font-medium text-[#00F0FF]">{formattedDate}</span>
            <span className="text-[#3A4D66]">•</span>
            <span className="text-[#90A0B7]">{currentEvent.location}</span>
          </div>

          {/* Pricing & CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <div>
              <span className="text-[10px] text-[#90A0B7] block uppercase tracking-wider">Tiket Mulai Dari</span>
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#FFB300]">
                Rp {currentEvent.min_price.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              onClick={() => onSelectEvent(currentEvent)}
              className="px-6 py-3 rounded-xl bg-[#00F0FF] hover:bg-[#33F4FF] text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-103"
            >
              Pesan Tiket Sekarang
            </button>
          </div>
        </div>

        {/* Bottom Carousel Pill Indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-[#263345]/40">
          <div className="flex items-center space-x-1.5">
            {featured.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-8 bg-[#00F0FF]'
                    : 'w-2 bg-[#263345] hover:bg-[#3A4D66]'
                }`}
                title={`Pilih ${item.title}`}
              />
            ))}
          </div>

          {/* Manual Controls (Clean direct text, no arrow glyphs) */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-xl bg-[#090D12]/90 hover:bg-[#171F2C] border border-[#263345] text-[11px] font-semibold text-[#EEF2F6] hover:text-[#00F0FF] transition-colors"
              title="Acara Sebelumnya"
            >
              Sebelumnya
            </button>
            <button
              onClick={handleNext}
              className="px-3 py-1.5 rounded-xl bg-[#090D12]/90 hover:bg-[#171F2C] border border-[#263345] text-[11px] font-semibold text-[#EEF2F6] hover:text-[#00F0FF] transition-colors"
              title="Acara Berikutnya"
            >
              Berikutnya
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
