# Rhodes Dispatch

Aplikasi web pemesanan tiket acara (anime con, esports, konser simfoni, cosplay, gaming) dengan e-tiket berkode QR, login berperan **admin** dan **user**, serta katalog yang memakai algoritma pengurutan dan pencarian yang bisa dilihat langsung di panel log.

Dibangun dengan React 19, TypeScript, Vite, dan Tailwind CSS v4. Data bisa disimpan di **Supabase** (PostgreSQL) atau berjalan dalam **mode demo** memakai localStorage tanpa konfigurasi apa pun.

## Fitur

**Untuk semua pengguna (login diperlukan)**
- Beranda dengan carousel acara pilihan, daftar acara, dan panduan pembelian.
- Katalog acara dengan filter kategori, pencarian, dan pengurutan.
- Checkout dengan pilihan pembayaran (QRIS, Virtual Account, kartu), batas 5 tiket per pesanan, dan timer reservasi.
- E-tiket digital dengan QR code unik per tiket.
- Halaman "Tiket Saya" berisi e-tiket dan riwayat pesanan milik sendiri.
- Mode terang dan gelap (tombol matahari/bulan di navbar). Pilihan tersimpan di browser dan awalnya mengikuti pengaturan sistem.

**Khusus admin**
- Menu **Kelola Acara**: tambah, ubah, dan hapus acara beserta kategori tiketnya.
- **Scan & Verifikasi QR** dan check-in tiket di gerbang.

| | User | Admin |
|---|:---:|:---:|
| Lihat acara, pesan tiket, lihat tiket sendiri | ✔ | ✔ |
| Tambah / ubah / hapus acara dan kategori tiket | – | ✔ |
| Verifikasi QR dan check-in gerbang | – | ✔ |

Pembatasan ini dijaga di dua lapis: tampilan (menu disembunyikan) dan database (Row Level Security di Supabase). User biasa tidak bisa mengubah data walau memanggil API langsung.

## Algoritma di katalog

Panel **PRTS System Log** di halaman Jelajahi Acara menampilkan langkah-langkah algoritma yang berjalan.

- **Pengurutan (11):** Radix, Timsort, Heapsort, Quick, Merge, Comb, Insertion, Selection, Bubble, Shell, Cocktail. Atribut: harga terendah, judul, kode acara, tanggal, stok tersedia.
- **Pencarian (8):** Hash, Trie, Fibonacci, Binary, Jump, Exponential, Interpolation, Linear.
- Implementasi TypeScript ada di `src/algorithms/sorting.ts` dan `searching.ts`. Versi C-nya ada di `rhodes_algorithms.c` dan `.h`.

Saat kolom pencarian diisi, katalog hanya menampilkan acara yang cocok dengan kata kunci (kode, judul, atau kategori).

## Menjalankan di komputer

Prasyarat: [Node.js](https://nodejs.org) 20.19 atau lebih baru (atau 22.12+).

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

> **Windows PowerShell** kadang memblokir `npm` dengan pesan *running scripts is disabled*. Pakai `npm.cmd install` dan `npm.cmd run dev`, atau jalankan sekali:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan (port 3000) |
| `npm run build` | Build produksi ke folder `dist/` |
| `npm run preview` | Menjalankan hasil build |
| `npm run lint` | Pengecekan tipe TypeScript (`tsc --noEmit`) |

## Mode demo (tanpa Supabase)

Jika variabel Supabase belum diisi, aplikasi otomatis berjalan dalam mode demo. Data acara, pesanan, dan akun disimpan di localStorage browser.

Akun contoh (juga muncul di halaman login):

| Peran | Email | Kata sandi |
|---|---|---|
| Admin | `admin@rhodes.dev` | `admin123` |
| User | `user@rhodes.dev` | `user123` |

Daftar akun baru lewat tab **Daftar** otomatis berperan user. Admin dapat mengembalikan data contoh lewat **Status Server & Database → Reset Data** (tombol di footer atau halaman Akun Saya).

> Di mode demo, kata sandi tersimpan polos di browser. Itu hanya cukup untuk demo, jangan pakai kata sandi asli.

## Menyambungkan ke Supabase

1. Buat project di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** dan jalankan dua file berikut secara berurutan:
   1. `supabase/schema.sql`: tabel, indeks, kebijakan RLS dasar, dan data awal.
   2. `supabase/auth_roles.sql`: profil otomatis saat daftar, hak akses admin, dan fungsi pemesanan yang aman.
3. Salin `.env.example` menjadi `.env.local`, lalu isi:
   ```env
   VITE_SUPABASE_URL="https://xxxxxxxx.supabase.co"
   VITE_SUPABASE_ANON_KEY="sb_publishable_..."
   ```
   `VITE_SUPABASE_URL` diambil dari **Project URL**. `VITE_SUPABASE_ANON_KEY` diisi **Publishable key** (nama baru dari anon key) di **Project Settings → API Keys**.
4. Restart `npm run dev`. File `.env` hanya dibaca saat server dinyalakan.
5. Buka **Authentication → Providers → Email**. Jika tidak ingin memakai konfirmasi email, matikan *Confirm email* supaya pendaftaran langsung bisa masuk.

> **Jangan pernah memakai `secret` atau `service_role` key di aplikasi ini.** Key tersebut melewati semua aturan keamanan dan akan ikut terkirim ke browser. Hanya publishable/anon key yang aman.

### Membuat admin pertama

Akun baru selalu berperan user. Untuk menjadikan sebuah akun admin:

1. Daftar akun itu lewat halaman login aplikasi.
2. Jalankan di SQL Editor (ganti emailnya):
   ```sql
   UPDATE public.profiles SET role = 'admin'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'emailkamu@gmail.com');
   ```
3. Keluar lalu masuk lagi di aplikasi. Menu **Kelola Acara** akan muncul.

### Aturan data di Supabase

- Pemesanan lewat fungsi database `book_tickets_secure`, yang mengunci baris kuota dan memakai ID akun yang login. Kuota tidak bisa terjual melebihi stok walau ada pembelian bersamaan.
- Acara dan kategori tiket yang sudah punya pemesanan tidak bisa dihapus. Ubah statusnya menjadi "Selesai".
- Kuota tidak bisa diturunkan di bawah jumlah tiket yang sudah terjual.
- Tiket hanya bisa dilihat pemiliknya. Admin bisa melihat semua tiket untuk verifikasi.

## Struktur project

```
rhodes-dispatch/
├── index.html
├── .env.example
├── supabase/
│   ├── schema.sql           # tabel, RLS dasar, data awal
│   └── auth_roles.sql       # peran admin/user, RLS admin, fungsi booking
└── src/
    ├── App.tsx              # gerbang login, tab, modal
    ├── index.css            # token warna tema terang/gelap
    ├── algorithms/          # sorting.ts, searching.ts, versi C
    ├── components/          # Navbar, modal booking/tiket/verifikasi, EventFormModal, dll.
    ├── data/mockEvents.ts   # data awal mode demo
    ├── lib/
    │   ├── supabaseClient.ts  # koneksi Supabase
    │   ├── auth.ts            # login, daftar, logout, peran
    │   ├── supabase.ts        # data acara, CRUD, booking, verifikasi
    │   ├── theme.ts           # tema terang/gelap
    │   └── categoryColors.ts  # warna per kategori acara
    ├── pages/               # Home, Operations (katalog), MyTickets, Profile, Login, Admin
    └── types/
```

## Tema dan warna

Semua warna memakai token (CSS variable) di `src/index.css`, dengan nilai terpisah untuk mode terang dan gelap.

| Token | Mode gelap | Mode terang |
|---|---|---|
| `paper` (latar halaman) | `#224248` | `#FDFCE4` |
| `head` (header, area terpilih) | `#325E6A` | `#F3F1C4` |
| `primary` (tombol, tab aktif) | `#44A1A4` | `#2A8286` |
| `ink` (teks utama) | `#FAF7BB` | `#16363B` |

Untuk mengubah warna, edit nilai di blok `:root` (terang) dan `:root[data-theme='dark']` (gelap). Pemakaiannya di komponen lewat nama token, misalnya `bg-primary` dan `text-ink`.

## Catatan keamanan

- Hanya `VITE_SUPABASE_URL` dan publishable/anon key yang boleh berada di `.env.local`. Berkas `.env*` sudah masuk `.gitignore`.
- Aturan akses admin ditegakkan di database lewat RLS, bukan hanya di tampilan.
- Fungsi lama `book_tickets_atomic` (menerima ID pengguna dari klien) dicabut aksesnya oleh `auth_roles.sql`.
