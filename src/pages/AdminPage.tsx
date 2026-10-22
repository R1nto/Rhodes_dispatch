// Menu: Kelola Acara (khusus admin) — Tambah, Ubah, Hapus

import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { EventItem } from '../types/database';
import { deleteEvent } from '../lib/supabase';
import { categoryStyle } from '../lib/categoryColors';
import { EventFormModal } from '../components/EventFormModal';

interface AdminPageProps {
  events: EventItem[];
  onChanged: () => void | Promise<void>;
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Aktif',
  upcoming: 'Segera',
  sold_out: 'Habis',
  concluded: 'Selesai'
};

const rupiah = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

export const AdminPage: React.FC<AdminPageProps> = ({ events, onChanged }) => {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<EventItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const showNotice = (type: 'ok' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4500);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.event_code.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }, [events, query]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const res = await deleteEvent(toDelete.id);
    setDeleting(false);
    if (res.success) {
      showNotice('ok', `Acara "${toDelete.title}" berhasil dihapus.`);
      setToDelete(null);
      await onChanged();
    } else {
      showNotice('err', res.error || 'Gagal menghapus acara.');
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-line">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-ink">Kelola Acara</h1>
          <p className="text-xs text-ink2 mt-1">
            Tambah, ubah, dan hapus acara beserta kategori tiketnya. Halaman ini hanya untuk admin.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-extrabold text-sm shadow-[0_4px_15px_rgba(68,161,164,0.25)]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Acara</span>
        </button>
      </div>

      {notice && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-semibold border ${
            notice.type === 'ok'
              ? 'bg-green-tint border-green-edge text-green-ink'
              : 'bg-red-tint border-[#D93636]/40 text-red-ink'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari acara berdasarkan judul, kode, atau kategori..."
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-line focus:border-primary rounded-xl text-sm text-ink outline-none placeholder:text-muted"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="p-10 text-center rounded-2xl bg-card border border-line text-sm text-ink2">
            {events.length === 0 ? 'Belum ada acara. Klik "Tambah Acara" untuk membuat yang pertama.' : 'Tidak ada acara yang cocok.'}
          </div>
        )}

        {filtered.map((ev) => {
          const sold = (ev.ticket_types || []).reduce((a, t) => a + t.sold_count, 0);
          const style = categoryStyle(ev.category);
          return (
            <div key={ev.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl bg-card border border-line shadow-sm">
              <img
                src={ev.poster_url}
                alt=""
                className="w-full md:w-28 h-32 md:h-20 rounded-xl object-cover bg-soft shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-accent-ink">{ev.event_code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}>{ev.category}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-soft border border-line text-ink2">
                    {STATUS_LABEL[ev.status] || ev.status}
                  </span>
                </div>
                <div className="font-bold text-ink truncate">{ev.title}</div>
                <div className="text-xs text-ink2 truncate">
                  {new Date(ev.starts_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} · {ev.location}
                </div>
                <div className="text-xs text-ink2">
                  {(ev.ticket_types || []).length} kategori · mulai {rupiah(ev.min_price)} · terjual{' '}
                  <strong className="text-ink">{sold}</strong> / {ev.total_quota}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditing(ev)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-card border border-line hover:border-primary/60 text-ink"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Ubah</span>
                </button>
                <button
                  onClick={() => setToDelete(ev)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-tint border border-[#D93636]/40 text-red-ink hover:opacity-90"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {(creating || editing) && (
        <EventFormModal
          event={editing}
          existingCodes={events.map((e) => e.event_code)}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={async () => {
            const wasEdit = Boolean(editing);
            setCreating(false);
            setEditing(null);
            showNotice('ok', wasEdit ? 'Perubahan acara berhasil disimpan.' : 'Acara baru berhasil ditambahkan.');
            await onChanged();
          }}
        />
      )}

      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim backdrop-blur-md animate-fade-in">
          <div className="bg-card border border-line rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-ink">Hapus acara ini?</h3>
            <p className="text-sm text-ink2">
              <strong className="text-ink">{toDelete.title}</strong> beserta semua kategori tiketnya akan dihapus permanen.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-ink2 border border-line bg-card"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm font-extrabold text-white bg-[#D93636] hover:opacity-90 disabled:opacity-60"
              >
                {deleting ? 'Menghapus...' : 'Ya, hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};