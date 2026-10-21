// Menu: Form Tambah / Ubah Acara (admin)

import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { EventCategory, EventItem, EventStatus } from '../types/database';
import { saveEvent, EventInput, TierInput } from '../lib/supabase';

const CATEGORIES: EventCategory[] = ['Anime Con', 'Esports', 'Music & Symphony', 'Cosplay', 'Gaming'];
const STATUSES: { value: EventStatus; label: string }[] = [
  { value: 'active', label: 'Aktif (dijual)' },
  { value: 'upcoming', label: 'Segera hadir' },
  { value: 'sold_out', label: 'Habis terjual' },
  { value: 'concluded', label: 'Selesai' }
];

interface Props {
  event: EventItem | null; // null = tambah baru
  existingCodes: string[];
  onClose: () => void;
  onSaved: () => void;
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nextCode(codes: string[]): string {
  const max = codes.reduce((m, c) => {
    const n = parseInt(c.match(/RH-OP-(\d+)/)?.[1] || '0', 10);
    return Math.max(m, n);
  }, 0);
  return `RH-OP-${String(max + 1).padStart(2, '0')}`;
}

interface TierRow {
  key: string;
  id?: string;
  name: string;
  price: string;
  quota: string;
  sold: number;
}

export const EventFormModal: React.FC<Props> = ({ event, existingCodes, onClose, onSaved }) => {
  const isEdit = Boolean(event);
  const [code, setCode] = useState(event?.event_code || nextCode(existingCodes));
  const [title, setTitle] = useState(event?.title || '');
  const [category, setCategory] = useState<EventCategory>(event?.category || 'Anime Con');
  const [status, setStatus] = useState<EventStatus>(event?.status || 'active');
  const [startsAt, setStartsAt] = useState(event ? toLocalInput(event.starts_at) : '');
  const [endsAt, setEndsAt] = useState(event ? toLocalInput(event.ends_at) : '');
  const [location, setLocation] = useState(event?.location || '');
  const [posterUrl, setPosterUrl] = useState(event?.poster_url || '');
  const [description, setDescription] = useState(event?.description || '');
  const [tiers, setTiers] = useState<TierRow[]>(
    event?.ticket_types?.length
      ? event.ticket_types.map((t) => ({
          key: t.id,
          id: t.id,
          name: t.name,
          price: String(t.price),
          quota: String(t.quota),
          sold: t.sold_count
        }))
      : [{ key: 'new-0', name: 'Regular Pass', price: '100000', quota: '100', sold: 0 }]
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTier = (key: string, patch: Partial<TierRow>) =>
    setTiers((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const input: EventInput = {
      event_code: code,
      title,
      category,
      description,
      location,
      starts_at: startsAt ? new Date(startsAt).toISOString() : '',
      ends_at: endsAt ? new Date(endsAt).toISOString() : '',
      poster_url: posterUrl,
      status
    };
    const tierInputs: TierInput[] = tiers.map((r) => ({
      id: r.id,
      name: r.name,
      price: Number(r.price),
      quota: Number(r.quota)
    }));

    setBusy(true);
    try {
      const res = await saveEvent(event?.id || null, input, tierInputs);
      if (res.success) onSaved();
      else setError(res.error || 'Gagal menyimpan acara.');
    } finally {
      setBusy(false);
    }
  };

  const field =
    'w-full px-3 py-2 bg-paper border border-line focus:border-[#F2542D] rounded-xl text-sm text-ink outline-none transition-colors placeholder:text-muted';
  const label = 'block text-xs text-ink2 mb-1 font-semibold';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md animate-fade-in">
      <div className="bg-card border border-line rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-head px-6 py-4 border-b border-line flex items-center justify-between shrink-0">
          <span className="font-extrabold text-sm text-ink">{isEdit ? 'Ubah Acara' : 'Tambah Acara Baru'}</span>
          <button onClick={onClose} className="p-1 rounded-lg text-ink2 hover:text-ink hover:bg-line/50" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={label}>Kode acara</label>
              <input className={field} value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Judul acara</label>
              <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Kategori</label>
              <select className={field} value={category} onChange={(e) => setCategory(e.target.value as EventCategory)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Status</label>
              <select className={field} value={status} onChange={(e) => setStatus(e.target.value as EventStatus)}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Mulai</label>
              <input type="datetime-local" className={field} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
            </div>
            <div>
              <label className={label}>Selesai</label>
              <input type="datetime-local" className={field} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className={label}>Lokasi</label>
            <input className={field} value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>

          <div>
            <label className={label}>URL gambar poster</label>
            <input className={field} value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div>
            <label className={label}>Deskripsi</label>
            <textarea className={`${field} min-h-24`} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">Kategori tiket</span>
              <button
                type="button"
                onClick={() =>
                  setTiers((rows) => [...rows, { key: `new-${Date.now()}`, name: '', price: '0', quota: '50', sold: 0 }])
                }
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold text-coral-ink bg-card border border-[#F2542D]/40 hover:bg-soft"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah kategori</span>
              </button>
            </div>

            {tiers.map((r) => (
              <div key={r.key} className="grid grid-cols-12 gap-2 items-end p-3 rounded-xl bg-soft border border-line">
                <div className="col-span-12 sm:col-span-5">
                  <label className={label}>Nama</label>
                  <input className={field} value={r.name} onChange={(e) => updateTier(r.key, { name: e.target.value })} required />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className={label}>Harga (Rp)</label>
                  <input type="number" min={0} className={field} value={r.price} onChange={(e) => updateTier(r.key, { price: e.target.value })} required />
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <label className={label}>Kuota{r.sold > 0 ? ` (terjual ${r.sold})` : ''}</label>
                  <input type="number" min={r.sold} className={field} value={r.quota} onChange={(e) => updateTier(r.key, { quota: e.target.value })} required />
                </div>
                <div className="col-span-1 flex justify-end pb-2">
                  <button
                    type="button"
                    disabled={tiers.length === 1}
                    onClick={() => setTiers((rows) => rows.filter((x) => x.key !== r.key))}
                    className="p-1.5 rounded-lg text-red-ink hover:bg-red-tint disabled:opacity-30"
                    aria-label="Hapus kategori"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="px-3.5 py-2.5 rounded-xl bg-red-tint border border-[#D93636]/40 text-red-ink text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-bold text-ink2 hover:text-ink border border-line bg-card">
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2.5 rounded-xl bg-[#F2542D] hover:bg-[#FF6A3D] text-white font-extrabold text-sm disabled:opacity-60 shadow-[0_4px_15px_rgba(242,84,45,0.25)]"
            >
              {busy ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Acara'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
