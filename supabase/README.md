# Supabase — Catatan Guru

Database cloud **khusus aplikasi Catatan Guru** — auth, cadangan Pro, dan metadata sekolah.

## Apa yang disimpan di sini

| Tabel | Fungsi |
|-------|--------|
| `guru_cloud_snapshots` | Cadangan JSON Pro (seluruh data HP: kelas, siswa, absensi, nilai, jurnal, catatan, dll.) |
| `guru_workspaces` | Metadata sekolah yang guru daftarkan |
| `guru_pro_subscriptions` | Langganan Paket Pro per akun |
| `guru_pro_devices` | HP terdaftar untuk Pro (1 per akun) |

Data operasional harian tetap di **SQLite HP**. Supabase hanya menyimpan **cadangan** dan metadata ringan — bukan replika tabel per baris.

Backend Next.js (`api/`) memakai **service role** project ini. Halaman `/auth/catatan-guru/mobile-callback` meneruskan token login ke app mobile.

## Setup project baru

1. Buat project Supabase baru (mis. `catatan-guru-prod`).
2. **Authentication → Providers**: aktifkan Google.
3. **SQL Editor** → jalankan berurutan:
   - `migrations/001_guru_core.sql`
   - `migrations/002_guru_pro.sql`
4. Salin **Project URL** dan **anon key** ke env app; **service role key** ke `api/.env.local`.

## Env backend Next.js (`/api/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Lihat [`api/README.md`](../api/README.md) untuk OAuth, kuota, dan Google Play.

## Env aplikasi mobile (`/.env`)

```env
EXPO_PUBLIC_GURU_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_GURU_SUPABASE_ANON_KEY=eyJ...

EXPO_PUBLIC_API_BASE_URL=https://YOUR-DOMAIN
EXPO_PUBLIC_OAUTH_WEB_ORIGIN=https://YOUR-DOMAIN
```

`EXPO_PUBLIC_OAUTH_WEB_ORIGIN` harus sama dengan origin deploy Next.js (`api/`).

## Format cadangan (`schemaVersion`)

- **v1** — kelas, siswa, absensi, nilai (legacy)
- **v2** — + jurnal mengajar, catatan siswa, jadwal mengajar, preferensi modul, warna label, predikat nilai, urutan siswa

App mengirim v2 sejak rilis ini. Restore v1 tetap didukung (fitur baru kosong).

## OAuth redirect URLs

Tambahkan di Authentication → URL Configuration:

- Expo Go: `https://YOUR-DOMAIN/auth/catatan-guru/mobile-callback**`
- Dev/production build: `catatanguru://auth/callback`

Bundle ID / package: `com.catatanguru.app`
