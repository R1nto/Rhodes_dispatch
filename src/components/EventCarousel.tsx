import { categoryStyle } from '../lib/categoryColors';
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
      className="relative rounded-2xl overflow-hidden border border-line bg-card shadow-2xl group"
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
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-paper/90 via-paper/40 to-transparent" />
      </div>

      {/* Slide Content Overlay */}
      <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between z-10">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryStyle(currentEvent.category).bg} ${categoryStyle(currentEvent.category).text}`}>
              {currentEvent.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-sans bg-paper/90 border border-line text-amber-ink font-bold">
              {currentEvent.event_code}
            </span>
            <span className="hidden sm:inline-block text-xs font-medium text-green-ink bg-[#2BB673]/10 px-2.5 py-0.5 rounded-full border border-[#2BB673]/30">
              Penjualan Resmi Dibuka
            </span>
          </div>

          <div className="text-xs font-sans text-ink2 bg-paper/80 px-3 py-1 rounded-full border border-line">
            {currentIndex + 1} / {featured.length}
          </div>
        </div>

        {/* Center / Bottom Info */}
        <div className="max-w-2xl space-y-3.5">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight leading-tight drop-shadow-md">
            {currentEvent.title}
          </h2>

          <p className="text-xs sm:text-sm text-ink2 line-clamp-2 leading-relaxed">
            {currentEvent.description}
          </p>

          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-ink pt-1">
            <span className="font-medium text-coral-ink">{formattedDate}</span>
            <span className="text-line2">•</span>
            <span className="text-ink2">{currentEvent.location}</span>
          </div>

          {/* Pricing & CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <div>
              <span className="text-[10px] text-ink2 block">Tiket Mulai Dari</span>
              <span className="text-xl sm:text-2xl font-extrabold font-sans text-amber-ink">
                Rp {currentEvent.min_price.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              onClick={() => onSelectEvent(currentEvent)}
              className="px-6 py-3 rounded-xl bg-[#F2542D] hover:bg-[#FF6A3D] text-white font-extrabold text-xs transition-all shadow-[0_4px_20px_rgba(242,84,45,0.3)] hover:scale-103"
            >
              Pesan Tiket Sekarang
            </button>
          </div>
        </div>

        {/* Bottom Carousel Pill Indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-line/40">
          <div className="flex items-center space-x-1.5">
            {featured.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-8 bg-[#F2542D]'
                    : 'w-2 bg-line hover:bg-line2'
                }`}
                title={`Pilih ${item.title}`}
              />
            ))}
          </div>

          {/* Manual Controls (Clean direct text, no arrow glyphs) */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-xl bg-paper/90 hover:bg-soft border border-line text-[11px] font-semibold text-ink hover:text-coral-ink transition-colors"
              title="Acara Sebelumnya"
            >
              Sebelumnya
            </button>
            <button
              onClick={handleNext}
              className="px-3 py-1.5 rounded-xl bg-paper/90 hover:bg-soft border border-line text-[11px] font-semibold text-ink hover:text-coral-ink transition-colors"
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