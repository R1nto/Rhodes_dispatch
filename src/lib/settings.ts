// Pengaturan algoritma katalog: diatur admin, berlaku untuk semua pengguna.
// - Supabase terhubung -> tabel app_settings (baca: semua yang login, tulis: admin saja)
// - Mode demo -> localStorage

import { SearchAlgorithmType, SearchAttribute, SortAlgorithmType, SortAttribute, SortDirection } from '../types/algorithms';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { isAdmin } from './auth';

export interface AlgoSettings {
  sortAlgorithm: SortAlgorithmType;
  sortAttribute: SortAttribute;
  sortDirection: SortDirection;
  searchAlgorithm: SearchAlgorithmType;
  searchAttribute: SearchAttribute;
}

export const DEFAULT_ALGO_SETTINGS: AlgoSettings = {
  sortAlgorithm: 'radix',
  sortAttribute: 'min_price',
  sortDirection: 'asc',
  searchAlgorithm: 'hash',
  searchAttribute: 'event_code'
};

const STORAGE_KEY = 'rd_algo_settings_v1';
const SETTINGS_KEY = 'algorithms';

const SORT_ALGOS: SortAlgorithmType[] = ['radix', 'timsort', 'heapsort', 'quick', 'merge', 'combsort', 'insertion', 'selection', 'bubble', 'shell', 'cocktail'];
const SORT_ATTRS: SortAttribute[] = ['min_price', 'title', 'event_code', 'starts_at', 'available_stock'];
const SEARCH_ALGOS: SearchAlgorithmType[] = ['hash', 'trie', 'fibonacci', 'binary', 'jump', 'exponential', 'interpolation', 'linear'];
const SEARCH_ATTRS: SearchAttribute[] = ['event_code', 'title'];

// Pastikan nilai dari penyimpanan valid; yang tidak valid diganti nilai bawaan
function sanitize(raw: unknown): AlgoSettings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<AlgoSettings>;
  const d = DEFAULT_ALGO_SETTINGS;
  return {
    sortAlgorithm: SORT_ALGOS.includes(r.sortAlgorithm as SortAlgorithmType) ? (r.sortAlgorithm as SortAlgorithmType) : d.sortAlgorithm,
    sortAttribute: SORT_ATTRS.includes(r.sortAttribute as SortAttribute) ? (r.sortAttribute as SortAttribute) : d.sortAttribute,
    sortDirection: r.sortDirection === 'desc' ? 'desc' : 'asc',
    searchAlgorithm: SEARCH_ALGOS.includes(r.searchAlgorithm as SearchAlgorithmType) ? (r.searchAlgorithm as SearchAlgorithmType) : d.searchAlgorithm,
    searchAttribute: SEARCH_ATTRS.includes(r.searchAttribute as SearchAttribute) ? (r.searchAttribute as SearchAttribute) : d.searchAttribute
  };
}

export async function fetchAlgoSettings(): Promise<AlgoSettings> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('app_settings').select('value').eq('key', SETTINGS_KEY).maybeSingle();
    if (!error && data) return sanitize(data.value);
    return DEFAULT_ALGO_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return sanitize(JSON.parse(raw));
  } catch {
    // abaikan
  }
  return DEFAULT_ALGO_SETTINGS;
}

/** Simpan pengaturan algoritma. Hanya admin. */
export async function saveAlgoSettings(settings: AlgoSettings): Promise<{ success: boolean; error?: string }> {
  if (!isAdmin()) return { success: false, error: 'Hanya admin yang boleh mengatur algoritma.' };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: SETTINGS_KEY, value: settings, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) {
      return {
        success: false,
        error: /app_settings/.test(error.message) && /does not exist|schema cache/i.test(error.message)
          ? 'Tabel app_settings belum ada. Jalankan ulang supabase/auth_roles.sql.'
          : error.message
      };
    }
    return { success: true };
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    return { success: false, error: 'Gagal menyimpan pengaturan di browser.' };
  }
  return { success: true };
}