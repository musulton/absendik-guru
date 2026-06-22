# Absendik Guru (mobile)

Aplikasi React Native (Expo) **khusus guru** — absensi dan nilai per kelas/mapel, rekap, export Excel. Cocok untuk wali kelas, pengampu mapel, bimbel, atau guru di beberapa sekolah.

## Fitur

| Area                        | Fitur                                                                         |
| --------------------------- | ----------------------------------------------------------------------------- |
| **Manajemen sekolah**       | Workspace per lembaga, jenjang SD–SMK, mode absensi per rombel atau per mapel |
| **Manajemen kelas & mapel** | CRUD kelas, mapel (mode subject), label warna                                 |
| **Manajemen siswa**         | CRUD siswa, nonaktifkan                                                       |
| **Absensi**                 | Hadir, sakit, izin, alpha — izin/sakit dengan catatan                         |
| **Rekap**                   | Mingguan & bulanan (Gratis), semester (Pro)                                   |
| **Export**                  | Excel (.xlsx) dari layar rekap                                                |
| **Cloud (Pro)**             | Backup ke cloud, pulihkan saat ganti HP                                       |

## Paket

Kuota dibaca dari **env backend** (`GURU_LOCAL_*`, `GURU_PRO_*`) dan disinkron ke app lewat `GET /api/guru/v1/quota-config`. Fallback offline: `EXPO_PUBLIC_GURU_*` di `mobile-guru/.env`. Nilai `unlimited`, `*`, atau `-1` = tidak dibatasi.

### Gratis

- 1 sekolah mandiri di HP
- 5 kelas per sekolah · mapel tanpa batas
- 120 siswa
- Rekap mingguan & bulanan
- Export Excel
- Data di perangkat (SQLite)
- Ada iklan

### Pro

- Sekolah mandiri tanpa batas
- Kelas tanpa batas per sekolah · mapel tanpa batas
- Siswa tanpa batas
- Rekap semester
- Backup & sinkron ke cloud (1 HP terdaftar per akun)
- Pulihkan data saat ganti HP (pindah perangkat di Pengaturan)
- Tanpa iklan

## Prasyarat

- Node.js 18+
- Backend Next.js (`npm run dev:demo` di root → port **3001**) — untuk login & cloud sync
- Skema Supabase (`supabase/install.sql`)

## Setup

```bash
cd mobile-guru
npm install
cp .env.example .env
# Salin NEXT_PUBLIC_SUPABASE_URL & ANON_KEY dari .env root (harus project yang sama!)
# isi EXPO_PUBLIC_API_BASE_URL
npm start
```

### Akun terhubung ke sekolah (Absendik Sekolah)

1. Admin sekolah undang guru → guru buka link undangan (web) dan hubungkan akun
2. Login di app dengan **akun yang sama**
3. Pilih workspace sekolah (otomatis jika terhubung) — kelas & siswa muncul dari data admin sekolah
4. Guru bisa **absensi & nilai**; tambah/edit kelas & siswa tetap lewat admin sekolah

Pastikan `EXPO_PUBLIC_SUPABASE_*` **sama** dengan backend dan `npm run dev:demo` jalan.

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

## Arsitektur data

- **Operasi harian** → SQLite di HP (offline-first)
- **Cloud** → cadangan JSON di Supabase (`guru_cloud_snapshots`, Pro). Siswa/kelas/mapel/absensi/nilai **tidak** masuk tenant sekolah.
- **Absendik sekolah** → hanya metadata sekolah yang guru daftarkan (`guru_workspaces` + cluster stats).

## Langganan Pro (Google Play — Android)

Butuh **dev build / EAS** (sama seperti iklan — tidak jalan di Expo Go).

### 1. Google Play Console

1. Buat app `com.absendik.guru` (Absendik Guru)
2. **Monetize → Subscriptions** → buat langganan dengan ID mis. `guru_pro_monthly`
3. Tambahkan **license testers** untuk uji coba
4. Upload minimal satu build ke **Internal testing**

### 2. Service account (verifikasi server)

1. Google Cloud Console → buat service account
2. Play Console → **Setup → API access** → link project → beri akses **View financial data** + manage orders
3. Download JSON key → encode base64 → set `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` di `.env` backend

### 3. Env

| Lingkungan         | Variabel                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------- |
| Backend `.env`     | `GOOGLE_PLAY_PACKAGE_NAME`, `GURU_IAP_ANDROID_PRODUCT_ID`, `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` |
| `mobile-guru/.env` | `EXPO_PUBLIC_GURU_IAP_ANDROID_PRODUCT_ID` (sama dengan Play Console)                          |

### 4. Database

Jalankan `supabase/setup-patches.sql` di Supabase SQL Editor (setelah `install.sql`). Lihat [`supabase/README.md`](../supabase/README.md).

### 5. Dev tanpa Play

Set `EXPO_PUBLIC_GURU_IAP_DEV_UNLOCK=true` di `mobile-guru/.env` (hanya `__DEV__`) untuk uji fitur Pro di Expo Go.

## Struktur

```
mobile-guru/
├── App.tsx
├── src/
│   ├── lib/          # SQLite, limits, sync, export Excel
│   ├── navigation/
│   ├── screens/
│   └── components/
```
