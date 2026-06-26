# Iklan — Catatan Guru (mode gratis)

Tujuan: pendapatan iklan maksimal **tanpa mengganggu** alur kerja guru.
Profil saat ini: **seimbang**.

## Prinsip (nyaman + cuan)

| Jenis | Di mana | Batas |
|-------|---------|--------|
| **Banner** | Beranda kelas, list kelas pengelolaan, pilih sekolah, hub pengelolaan, hub kelas, pilih kelas (mapel/siswa), daftar siswa, daftar mapel, rekap | Footer layar, tidak ikut scroll konten |
| **Interstitial** | Setelah simpan absensi/nilai lalu keluar; setelah ekspor Excel; setelah sinkron | Maks. 6×/hari; jeda global 4 menit; bucket simpan vs utilitas terpisah; 2 menit pertama sesi bebas iklan |
| **Tanpa iklan** | Input absensi/nilai, form siswa/mapel/kelas, login | Zona fokus kerja |

- Interstitial **tidak pernah** muncul saat sedang input — hanya saat user
  meninggalkan layar setelah berhasil menyimpan.
- Cloud + langganan aktif → **semua iklan mati**.
- Semua batas frekuensi terpusat di `frequency.ts` (`AD_CAPS`) agar mudah disetel.

## Arsitektur

- `index.ts` — API publik subsistem iklan (impor dari sini bila memungkinkan).
- `native-module.ts` — deteksi modul native + lazy-load SDK (aman di Expo Go).
- `placements.ts` — daftar slot banner & momen interstitial.
- `policy.ts` — boleh tampil atau tidak (langganan + frekuensi).
- `frequency.ts` — batas harian, jeda waktu, grace sesi (profil "seimbang").
- `consent.ts` — UMP/GDPR: `gatherConsent`, opsi privasi, personalisasi iklan.
- `admob.ts` — init SDK, banner, interstitial.
- `context/AdContext.tsx` — runtime `off | native | preview`.

### Mode runtime

| Mode | Kapan | Perilaku |
|------|-------|----------|
| `off` | Langganan Cloud aktif | Tanpa iklan |
| `preview` | Expo Go / modul belum link | Placeholder banner + modal interstitial |
| `native` | Dev build + consent OK | AdMob asli |

Error `RNGoogleMobileAdsModule` di Expo Go **normal** — app otomatis fallback ke mode preview.
Untuk iklan asli: `npx expo prebuild` lalu dev client / EAS build.

## Consent UMP / GDPR (wajib EEA)

1. Aktifkan **Privacy & messaging** (GDPR + IDFA bila perlu) di
   [AdMob Console → Privacy & messaging](https://apps.admob.com/v2/privacymessaging).
2. App memanggil `AdsConsent.gatherConsent()` saat launch (user gratis) —
   form Google tampil otomatis bila diperlukan.
3. `delayAppMeasurementInit: true` sudah diset di plugin AdMob (`app.json`).
4. Pengguna bisa ubah pilihan lewat **Pengaturan → Privasi iklan** (form UMP).
5. Iklan personal / non-personal mengikuti pilihan consent (`getUserChoices`).

### Uji consent di dev build

Set di `.env` (lihat `.env.example`):

- `EXPO_PUBLIC_ADMOB_CONSENT_DEBUG_GEOGRAPHY=EEA` — paksa form GDPR muncul
- `EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS=<device-hash>` — whitelist perangkat uji

Emulator Android otomatis di-whitelist. Reset state UMP: `AdsConsent.reset()` (dev).

## Production: AdMob

1. SDK sudah terpasang: `react-native-google-mobile-ads` + config plugin di
   `app.json` (key `androidAppId` / `iosAppId`). Iklan **butuh dev build /
   production build** — tidak jalan di Expo Go.
2. Ganti **app id** test di `app.json` dengan AdMob app id milik Anda
   (`ca-app-pub-XXXX~YYYY`).
3. Set **ad unit id** di `.env` (lihat `.env.example`):
   - `EXPO_PUBLIC_ADMOB_BANNER_ANDROID` / `_IOS`
   - `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID` / `_IOS`
4. Build: `npx expo prebuild` lalu `eas build` (atau dev client).

Saat dev (env kosong) otomatis memakai **TestIds** Google — aman, tidak
melanggar kebijakan AdMob. Jangan rilis ke store dengan test id.
