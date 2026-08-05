# Website Desa Pagergunung

Stack: **Next.js (Pages Router, .js) + Supabase + Gemini API**, full gratis, deploy di **Vercel**.

## 1. Struktur Project

```
pagergunung-website/
├─ components/       Navbar, Footer, Layout, ChatWidget, MapView
├─ lib/               supabaseClient.js
├─ pages/
│  ├─ api/chat.js     endpoint AI chatbot (panggil Gemini)
│  ├─ berita/         index.js (daftar) + [slug].js (detail)
│  ├─ index.js         beranda
│  ├─ profil-desa.js
│  ├─ struktur-organisasi.js
│  ├─ fasilitas.js
│  ├─ galeri.js
│  ├─ data-kependudukan.js
│  ├─ kontak.js
│  ├─ keuangan.js
│  ├─ geotagging.js    peta desa (integrasi proker geotagging)
│  └─ umkm.js           pemetaan UMKM (integrasi proker UMKaMi)
├─ styles/globals.css
├─ supabase/schema.sql  jalankan ini di Supabase SQL Editor
└─ .env.local.example
```

## 2. Setup Supabase (gratis)

1. Buat akun di https://supabase.com → **New Project** (pilih region Singapore untuk latensi terbaik).
2. Buka **SQL Editor** → New Query → copy-paste seluruh isi `supabase/schema.sql` → **Run**.
   Ini akan membuat 11 tabel + Row Level Security (RLS) agar publik hanya bisa **membaca**, tidak bisa mengubah data dari frontend.
3. Buka **Project Settings → API** → catat:
   - `Project URL` → jadi `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → jadi `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Isi data awal (profil desa, kontak, berita, dst) lewat **Table Editor** di dashboard Supabase — tidak perlu bikin form admin dulu, langsung input manual di tabel.

## 3. Setup Gemini API (gratis)

1. Buka https://aistudio.google.com/apikey → **Create API Key** (akun Google biasa, tanpa kartu kredit).
2. Simpan sebagai `GEMINI_API_KEY`.
3. Free tier Gemini punya limit request per menit/hari — cukup untuk chatbot desa skala kecil. Cek limit terbaru di https://ai.google.dev/gemini-api/docs/rate-limits.

## 4. Menjalankan di Lokal

```bash
# 1. Copy env
cp .env.local.example .env.local
# lalu isi NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GEMINI_API_KEY

# 2. Install dependencies
npm install

# 3. Jalankan dev server
npm run dev
# buka http://localhost:3000
```

## 5. Deploy ke Vercel (gratis)

1. Push project ini ke repo GitHub (bikin repo baru, `git init`, `git add .`, `git commit`, `git push`).
2. Buka https://vercel.com → **Add New Project** → import repo GitHub tadi.
3. Di step **Environment Variables**, tambahkan 3 variabel yang sama seperti di `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
4. Klik **Deploy**. Vercel otomatis build & kasih domain gratis `namaproject.vercel.app`.
5. (Opsional) Kalau punya domain custom dari Domainesia, tambahkan di **Project Settings → Domains** dan arahkan DNS-nya (CNAME/A record) sesuai instruksi Vercel.

## 6. Catatan Penting

- **Icon**: menggunakan library `lucide-react` (bukan emoji) supaya tampil konsisten dan profesional di semua perangkat/browser — emoji sering tampil beda-beda tergantung OS, sedangkan icon SVG dari lucide selalu konsisten.
- **Foto di beranda**: sementara menggunakan foto placeholder gratis dari Picsum Photos (`lib/placeholderImage.js`) supaya tampilan tidak kosong. Begitu ada foto asli Desa Pagergunung, upload lewat Supabase Storage lalu ganti pemanggilan `placeholderImage(...)` dengan URL foto asli (untuk hero di `pages/index.js`), atau isi kolom `gambar_url` di tabel `berita`/`galeri` (placeholder otomatis dipakai hanya kalau kolom itu kosong).
- **Koordinat peta**: ganti `DEFAULT_CENTER` di `components/MapView.js` dengan koordinat asli Desa Pagergunung (ambil dari Google Maps → klik kanan lokasi → koordinat muncul di menu).
- **Keamanan**: `GEMINI_API_KEY` hanya dipakai di `pages/api/chat.js` (server-side), jadi aman, tidak pernah terkirim ke browser. `NEXT_PUBLIC_SUPABASE_ANON_KEY` memang didesain untuk publik, aman dipakai di frontend selama RLS aktif (sudah diatur di schema.sql: publik hanya bisa SELECT).
- **Input data (CRUD admin)**: versi ini pakai Supabase Table Editor sebagai "admin panel" sederhana — cocok untuk mahasiswa KKN yang butuh solusi cepat tanpa biaya. Kalau nanti mau bikin halaman admin sendiri (form tambah berita, dsb), tinggal buat route baru misal `/admin` yang pakai Supabase Auth untuk login, lalu form yang insert/update ke tabel terkait.
- **Gambar**: bisa upload lewat Supabase Storage (bucket gratis 1GB di free tier) lalu simpan URL publiknya ke kolom `*_url` di tabel terkait, atau sementara pakai link gambar dari luar (misal Google Drive/Imgur) untuk uji coba cepat.
- **Format file**: semua komponen & halaman sengaja dibuat `.js` (bukan `.jsx`), Next.js tetap mendukung penuh sintaks JSX di dalam file `.js`.
- **Live chat AI Bot** membaca konteks nyata dari tabel `profil_desa`, `kontak_penting`, dan `berita` sebelum menjawab — supaya jawabannya berbasis data desa yang sebenarnya, bukan mengarang.

## 7. Rencana Pengembangan Lanjutan (opsional)

- Tambah halaman `/admin` dengan Supabase Auth untuk CRUD berita, galeri, UMKM tanpa buka dashboard Supabase.
- Tambah `sitemap.xml` & meta tags SEO agar mudah ditemukan warga di pencarian Google.
- Tambah fitur upload foto langsung dari form (pakai Supabase Storage SDK) untuk proker geotagging & UMKM di lapangan.
