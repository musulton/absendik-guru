# Catatan Guru (mobile)

Aplikasi React Native (Expo) **khusus guru** — absensi, nilai, jurnal, catatan siswa, rekap, dan export Excel. Cocok untuk wali kelas, pengampu mapel, bimbel, atau guru di beberapa sekolah.

## Fitur

| Area                        | Fitur                                                                         |
| --------------------------- | ----------------------------------------------------------------------------- |
| **Manajemen sekolah**       | Workspace per lembaga, jenjang SD–SMK, mode absensi per rombel atau per mapel |
| **Manajemen kelas & mapel** | CRUD kelas, mapel (mode subject), label warna                                 |
| **Manajemen siswa**         | CRUD siswa, nonaktifkan                                                       |
| **Absensi**                 | Hadir, sakit, izin, alpha — izin/sakit dengan catatan                         |
| **Rekap**                   | Mingguan & bulanan (Gratis), semester (Pro)                                   |
| **Export**                  | Excel (.xlsx) dari layar rekap                                                |
| **Supabase (Pro)**          | Backup ke Supabase, pulihkan saat ganti HP (termasuk jurnal & catatan)        |

## Paket

Kuota dibaca dari **env backend** (`GURU_LOCAL_*`, `GURU_PRO_*`) dan disinkron ke app lewat `GET /api/guru/v1/quota-config`. Fallback offline: `EXPO_PUBLIC_GURU_*` di `.env`. Nilai `unlimited`, `*`, atau `-1` = tidak dibatasi.

### Gratis

- 1 sekolah di HP
- 5 kelas per sekolah · mapel tanpa batas
- 120 siswa
- Rekap mingguan & bulanan
- Export Excel
- Data di perangkat (SQLite)
- Ada iklan

### Pro

- Sekolah tanpa batas
- Kelas tanpa batas per sekolah · mapel tanpa batas
- Siswa tanpa batas
- Rekap semester
- Backup & sinkron ke cloud (1 HP terdaftar per akun)
- Pulihkan data saat ganti HP (pindah perangkat di Pengaturan)
- Tanpa iklan

## Prasyarat

- Node.js 18+
- **Web Next.js** (`api/` → port **3001**) — API, callback Google OAuth, langganan Pro, cadangan cloud
- Skema Supabase — lihat [`supabase/README.md`](supabase/README.md); jalankan `001_guru_core.sql` dan `002_guru_pro.sql`

## Setup

```bash
npm install
cp .env.example .env
# Isi EXPO_PUBLIC_GURU_SUPABASE_* dari project Supabase Catatan Guru
# isi EXPO_PUBLIC_API_BASE_URL (mis. http://localhost:3001)

# Terminal 1 — backend Next.js
cd api && npm install && cp .env.example .env.local && npm run dev

# Terminal 2 — app mobile
npm start
```

Pastikan `EXPO_PUBLIC_GURU_SUPABASE_*` **sama** project dengan `NEXT_PUBLIC_SUPABASE_*` di `api/.env.local`, dan `EXPO_PUBLIC_OAUTH_WEB_ORIGIN` mengarah ke origin Next.js yang sama (mis. `http://localhost:3001` hanya untuk API lokal — OAuth butuh HTTPS publik, lihat `api/README.md`).

### API base URL

| Lingkungan                | `EXPO_PUBLIC_API_BASE_URL` |
| ------------------------- | -------------------------- |
| iOS Simulator + dev lokal | `http://localhost:3001`    |
| Android Emulator          | `http://10.0.2.2:3001`     |
| HP fisik (Wi‑Fi sama)     | `http://<IP-laptop>:3001`  |

## Perintah

| Perintah            | Fungsi           |
| ------------------- | ---------------- |
| `npm start`         | Expo dev server  |
| `npm run ios`       | Simulator iOS    |
| `npm run android`   | Emulator Android |
| `npm run typecheck` | TypeScript       |
| `cd api && npm run dev` | Backend Next.js (port 3001) |

## Arsitektur data

- **Operasi harian** → SQLite di HP (offline-first)
- **Supabase (Pro)** → cadangan JSON di project Guru (`guru_cloud_snapshots`). Mencakup absensi, nilai, jurnal, catatan siswa, jadwal, dan preferensi.

## Langganan Pro (Google Play — Android)

Butuh **dev build / EAS** (sama seperti iklan — tidak jalan di Expo Go).

### 1. Google Play Console

1. Buat app `com.catatanguru.app` (Catatan Guru)
2. **Monetize → Subscriptions** → buat langganan dengan ID mis. `guru_pro_monthly`
3. Tambahkan **license testers** untuk uji coba
4. Upload minimal satu build ke **Internal testing**

### 2. Service account (verifikasi server)

1. Google Cloud Console → buat service account
2. Play Console → **Setup → API access** → link project → beri akses **View financial data** + manage orders
3. Download JSON key → encode base64 → set `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` di `.env` backend

### 3. Env

| Lingkungan | Variabel                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------- |
| Backend (`api/.env.local`) | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_PLAY_PACKAGE_NAME`, `GURU_IAP_ANDROID_PRODUCT_ID`, `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` |
| `.env` | `EXPO_PUBLIC_GURU_IAP_ANDROID_PRODUCT_ID` (sama dengan Play Console)                          |

Set `GOOGLE_PLAY_PACKAGE_NAME=com.catatanguru.app` di backend.

### 4. Database

Jalankan `supabase/migrations/001_guru_core.sql` dan `002_guru_pro.sql` di SQL Editor project Supabase. Lihat [`supabase/README.md`](supabase/README.md).

### 5. Dev tanpa Play

Set `EXPO_PUBLIC_GURU_IAP_DEV_UNLOCK=true` di `.env` (hanya `__DEV__`) untuk uji fitur Pro di Expo Go.

## OAuth redirect URLs

Tambahkan di Supabase → Authentication → URL Configuration:

- Expo Go: `https://YOUR-DOMAIN/auth/catatan-guru/mobile-callback**`
- Dev/production build: `catatanguru://auth/callback`

## Struktur

```
├── api/              # Next.js — API + OAuth callback Google
├── App.tsx
├── src/
│   ├── lib/          # SQLite, limits, sync, export Excel
│   ├── navigation/
│   ├── screens/
│   └── components/
├── supabase/         # Migrasi SQL
```
