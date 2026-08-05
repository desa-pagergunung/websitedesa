-- =========================================================
-- SCHEMA DATABASE WEBSITE DESA PAGERGUNUNG
-- Jalankan di: Supabase Dashboard > SQL Editor > New Query
-- =========================================================

-- 1. PROFIL DESA (single row, disimpan sebagai key-value agar fleksibel)
create table if not exists profil_desa (
  id int primary key default 1,
  nama_desa text not null default 'Pagergunung',
  kecamatan text not null default 'Pangandaran',
  kabupaten text not null default 'Pangandaran',
  provinsi text not null default 'Jawa Barat',
  sejarah text,
  visi text,
  misi text,
  luas_wilayah text,
  batas_utara text,
  batas_selatan text,
  batas_timur text,
  batas_barat text,
  logo_url text,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);
insert into profil_desa (id) values (1) on conflict (id) do nothing;

-- 2. STRUKTUR ORGANISASI
create table if not exists struktur_organisasi (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  jabatan text not null,
  urutan int default 0,
  foto_url text,
  periode text,
  created_at timestamptz default now()
);

-- 3. BERITA / KEGIATAN DESA
create table if not exists berita (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  slug text unique not null,
  ringkasan text,
  konten text not null,
  gambar_url text,
  kategori text default 'kegiatan', -- kegiatan | pengumuman | berita
  penulis text default 'Admin Desa',
  published boolean default true,
  created_at timestamptz default now()
);

-- 4. FASILITAS UMUM
create table if not exists fasilitas (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  kategori text, -- kesehatan | pendidikan | ibadah | olahraga | pemerintahan
  deskripsi text,
  alamat text,
  latitude double precision,
  longitude double precision,
  foto_url text,
  created_at timestamptz default now()
);

-- 5. GALERI FOTO
create table if not exists galeri (
  id uuid primary key default gen_random_uuid(),
  judul text,
  gambar_url text not null,
  kategori text,
  created_at timestamptz default now()
);

-- 6. DATA KEPENDUDUKAN (agregat per tahun, statistik saja)
create table if not exists data_kependudukan (
  id uuid primary key default gen_random_uuid(),
  tahun int not null,
  jumlah_kk int,
  jumlah_penduduk int,
  laki_laki int,
  perempuan int,
  usia_0_14 int,
  usia_15_64 int,
  usia_65_plus int,
  petani int,
  buruh int,
  pns int,
  wiraswasta int,
  lainnya_pekerjaan int,
  created_at timestamptz default now(),
  unique (tahun)
);

-- 7. KONTAK PENTING & JAM PELAYANAN
create table if not exists kontak_penting (
  id uuid primary key default gen_random_uuid(),
  nama_layanan text not null, -- Kantor Desa, Puskesmas, Babinsa, dll
  nama_kontak text,
  no_telepon text,
  jam_pelayanan text,
  urutan int default 0
);

-- 8. DATA KEUANGAN DESA (APBDes ringkas, transparansi anggaran)
create table if not exists keuangan_desa (
  id uuid primary key default gen_random_uuid(),
  tahun_anggaran int not null,
  kategori text not null, -- pendapatan | belanja
  sub_kategori text not null, -- Dana Desa, Belanja Infrastruktur, dst
  jumlah numeric not null,
  keterangan text,
  created_at timestamptz default now()
);

-- 9. GEOTAGGING (integrasi proker geotagging desa)
create table if not exists geotagging (
  id uuid primary key default gen_random_uuid(),
  nama_lokasi text not null,
  kategori text, -- rumah_warga | fasilitas | potensi_wisata | batas_wilayah | umkm
  deskripsi text,
  latitude double precision not null,
  longitude double precision not null,
  foto_url text,
  created_at timestamptz default now()
);

-- 10. UMKM & POTENSI DESA (integrasi proker pemetaan UMKM)
create table if not exists umkm (
  id uuid primary key default gen_random_uuid(),
  nama_usaha text not null,
  pemilik text,
  kategori text, -- kuliner | kerajinan | pertanian | jasa | perikanan
  deskripsi text,
  alamat text,
  latitude double precision,
  longitude double precision,
  no_kontak text,
  foto_url text,
  created_at timestamptz default now()
);

-- 11. RIWAYAT CHAT AI (opsional, untuk log & evaluasi chatbot)
create table if not exists chat_log (
  id uuid primary key default gen_random_uuid(),
  pertanyaan text not null,
  jawaban text not null,
  created_at timestamptz default now()
);

-- =========================================================
-- ROW LEVEL SECURITY
-- Semua tabel: publik boleh BACA (SELECT) saja.
-- Tulis (INSERT/UPDATE/DELETE) hanya lewat Supabase Dashboard
-- atau service_role key (bukan dari frontend publik).
-- =========================================================
alter table profil_desa enable row level security;
alter table struktur_organisasi enable row level security;
alter table berita enable row level security;
alter table fasilitas enable row level security;
alter table galeri enable row level security;
alter table data_kependudukan enable row level security;
alter table kontak_penting enable row level security;
alter table keuangan_desa enable row level security;
alter table geotagging enable row level security;
alter table umkm enable row level security;
alter table chat_log enable row level security;

create policy "public read profil_desa" on profil_desa for select using (true);
create policy "public read struktur_organisasi" on struktur_organisasi for select using (true);
create policy "public read berita" on berita for select using (published = true);
create policy "public read fasilitas" on fasilitas for select using (true);
create policy "public read galeri" on galeri for select using (true);
create policy "public read data_kependudukan" on data_kependudukan for select using (true);
create policy "public read kontak_penting" on kontak_penting for select using (true);
create policy "public read keuangan_desa" on keuangan_desa for select using (true);
create policy "public read geotagging" on geotagging for select using (true);
create policy "public read umkm" on umkm for select using (true);

-- chat_log: izinkan publik INSERT (agar chatbot bisa menyimpan log dari frontend), tanpa read publik
create policy "public insert chat_log" on chat_log for insert with check (true);

-- =========================================================
-- CONTOH DATA (opsional, hapus/ubah sesuai kebutuhan)
-- =========================================================
insert into kontak_penting (nama_layanan, nama_kontak, no_telepon, jam_pelayanan, urutan) values
('Kantor Desa Pagergunung', 'Sekretaris Desa', '0812xxxxxxx', 'Senin-Jumat, 08.00-15.00', 1),
('Puskesmas Pembantu', 'Bidan Desa', '0813xxxxxxx', 'Senin-Sabtu, 07.30-13.00', 2),
('Babinsa', 'Serma xxxx', '0821xxxxxxx', '24 Jam (kondisi darurat)', 3);
