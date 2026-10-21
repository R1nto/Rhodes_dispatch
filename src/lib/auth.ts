// Login, daftar, logout, dan peran pengguna (admin / user)
// - Jika Supabase terhubung: memakai Supabase Auth + tabel profiles (kolom role).
// - Jika belum: mode demo dengan akun lokal di browser.

import { supabase, isSupabaseConfigured } from './supabaseClient';

export type AppRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
}

const DEMO_USERS_KEY = 'rd_demo_users_v1';
const DEMO_SESSION_KEY = 'rd_demo_session_v1';

interface DemoAccount extends AuthUser {
  password: string;
}

const SEED_ACCOUNTS: DemoAccount[] = [
  { id: 'demo-admin-01', name: 'Admin Rhodes', email: 'admin@rhodes.dev', password: 'admin123', role: 'admin' },
  { id: 'demo-user-01', name: 'Pengguna Demo', email: 'user@rhodes.dev', password: 'user123', role: 'user' }
];

export const DEMO_ACCOUNT_HINTS = SEED_ACCOUNTS.map(({ email, password, role }) => ({ email, password, role }));

let currentUser: AuthUser | null = null;
const listeners = new Set<(u: AuthUser | null) => void>();

function setCurrentUser(u: AuthUser | null) {
  currentUser = u;
  listeners.forEach((fn) => fn(u));
}

export function getCurrentUser(): AuthUser | null {
  return currentUser;
}

export function isAdmin(): boolean {
  return currentUser?.role === 'admin';
}

export function subscribeAuth(fn: (u: AuthUser | null) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ---------- Mode demo (tanpa Supabase) ----------

function readDemoAccounts(): DemoAccount[] {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY);
    if (raw) return JSON.parse(raw) as DemoAccount[];
  } catch {
    // abaikan
  }
  try {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(SEED_ACCOUNTS));
  } catch {
    // abaikan
  }
  return SEED_ACCOUNTS;
}

function toPublic(acc: DemoAccount): AuthUser {
  return { id: acc.id, name: acc.name, email: acc.email, role: acc.role };
}

// ---------- Supabase ----------

async function loadSupabaseUser(userId: string, email: string, fallbackName: string): Promise<AuthUser> {
  let name = fallbackName;
  let role: AppRole = 'user';
  if (supabase) {
    const { data } = await supabase.from('profiles').select('full_name, role').eq('id', userId).maybeSingle();
    if (data) {
      name = data.full_name || fallbackName;
      role = data.role === 'admin' ? 'admin' : 'user';
    }
  }
  return { id: userId, name, email, role };
}

// ---------- API publik ----------

export async function initAuth(): Promise<AuthUser | null> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (session?.user) {
      const u = session.user;
      const user = await loadSupabaseUser(u.id, u.email || '', (u.user_metadata?.full_name as string) || (u.email || '').split('@')[0]);
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setCurrentUser(null);
    });
    return currentUser;
  }

  const accounts = readDemoAccounts();
  try {
    const sessionId = localStorage.getItem(DEMO_SESSION_KEY);
    const found = accounts.find((a) => a.id === sessionId);
    setCurrentUser(found ? toPublic(found) : null);
  } catch {
    setCurrentUser(null);
  }
  return currentUser;
}

export async function signIn(email: string, password: string): Promise<{ user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) return { error: 'Email dan kata sandi wajib diisi.' };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error || !data.user) {
      const msg = error?.message || '';
      if (/email not confirmed/i.test(msg)) return { error: 'Email belum dikonfirmasi. Cek kotak masuk email kamu.' };
      return { error: 'Email atau kata sandi salah.' };
    }
    const u = data.user;
    const user = await loadSupabaseUser(u.id, u.email || cleanEmail, (u.user_metadata?.full_name as string) || cleanEmail.split('@')[0]);
    setCurrentUser(user);
    return { user };
  }

  const found = readDemoAccounts().find((a) => a.email.toLowerCase() === cleanEmail && a.password === password);
  if (!found) return { error: 'Email atau kata sandi salah.' };
  try {
    localStorage.setItem(DEMO_SESSION_KEY, found.id);
  } catch {
    // abaikan
  }
  const user = toPublic(found);
  setCurrentUser(user);
  return { user };
}

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<{ user?: AuthUser; needsConfirmation?: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  if (!cleanName || !cleanEmail || !password) return { error: 'Nama, email, dan kata sandi wajib diisi.' };
  if (password.length < 6) return { error: 'Kata sandi minimal 6 karakter.' };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { full_name: cleanName } }
    });
    if (error) {
      if (/already registered|already exists/i.test(error.message)) return { error: 'Email ini sudah terdaftar. Silakan masuk.' };
      return { error: error.message };
    }
    if (!data.session || !data.user) {
      // Konfirmasi email aktif di Supabase
      return { needsConfirmation: true };
    }
    const user = await loadSupabaseUser(data.user.id, cleanEmail, cleanName);
    setCurrentUser(user);
    return { user };
  }

  const accounts = readDemoAccounts();
  if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) return { error: 'Email ini sudah terdaftar. Silakan masuk.' };
  const acc: DemoAccount = {
    id: `demo-user-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    password,
    role: 'user'
  };
  try {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify([...accounts, acc]));
    localStorage.setItem(DEMO_SESSION_KEY, acc.id);
  } catch {
    // abaikan
  }
  const user = toPublic(acc);
  setCurrentUser(user);
  return { user };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  try {
    localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // abaikan
  }
  setCurrentUser(null);
}
