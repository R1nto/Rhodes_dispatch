// Warna per kategori acara agar tiap jenis acara mudah dikenali

const CATEGORY_STYLES: Record<string, { bg: string; text: string; soft: string }> = {
  'Anime Con': { bg: 'bg-[#E8458B]', text: 'text-white', soft: 'bg-pink-tint text-pink-ink border-pink-edge' },
  'Esports': { bg: 'bg-[#3B7DDD]', text: 'text-white', soft: 'bg-blue-tint text-blue-ink border-blue-edge' },
  'Music & Symphony': { bg: 'bg-[#8A5CD1]', text: 'text-white', soft: 'bg-purple-tint text-purple-ink border-purple-edge' },
  'Cosplay': { bg: 'bg-[#12A4A0]', text: 'text-white', soft: 'bg-teal-tint text-teal-ink border-teal-edge' },
  'Gaming': { bg: 'bg-[#2BB673]', text: 'text-white', soft: 'bg-green-tint text-green-ink border-green-edge' },
};

const FALLBACK = { bg: 'bg-[#F2542D]', text: 'text-white', soft: 'bg-coral-tint text-coral-ink2 border-coral-edge' };

export function categoryStyle(category: string) {
  return CATEGORY_STYLES[category] || FALLBACK;
}