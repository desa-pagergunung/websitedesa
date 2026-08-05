import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabaseClient";
import { placeholderImage } from "../lib/placeholderImage";
import {
  Users,
  Home,
  Baby,
  PersonStanding,
  GraduationCap,
  Briefcase,
  Heart,
  MapPin,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Data cadangan — hasil agregat dari Database_Desa_Pagergunung.xlsx (bukan data per-orang).
// Dipakai kalau kolom di Supabase belum di-seed. Jalankan SQL di atas untuk data permanen.
const DEFAULT_DATA = {
  tahun: 2026,
  jumlah_kk: 1061,
  jumlah_penduduk: 2643,
  laki_laki: 1280,
  perempuan: 1363,
  usia_0_14: 258,
  usia_15_64: 1894,
  usia_65_plus: 490,
  pekerjaan_json: {
    "Petani/Pekebun": 1133,
    "Belum/Tidak Bekerja": 687,
    "Mengurus Rumah Tangga": 389,
    Wiraswasta: 159,
    "Pelajar/Mahasiswa": 89,
    "Buruh Tani & Harian": 87,
    Pedagang: 31,
    Lainnya: 68,
  },
  pendidikan_json: {
    "Tamat SD/Sederajat": 1374,
    "Tidak/Belum Sekolah": 610,
    "SLTP/Sederajat": 326,
    "Belum Tamat SD": 157,
    "SLTA/Sederajat": 136,
    "Perguruan Tinggi": 40,
  },
  status_perkawinan_json: {
    Kawin: 1659,
    "Belum Kawin": 752,
    "Cerai Mati": 173,
    "Cerai Hidup": 59,
  },
  sebaran_rt_json: {
    "RT 01": 453,
    "RT 02": 574,
    "RT 03": 467,
    "RT 04": 503,
    "RT 05": 493,
    "RT 06": 152,
  },
};

// Palet warna konsisten dengan desain situs + beberapa aksen chart
const C = {
  green: "#2F5D3A",
  leaf: "#4C8B5A",
  cream: "#F6F3EA",
  soil: "#7A5A3A",
  gold: "#D9A441",
};
export const CHART_COLORS = [
  "#D6B25E", // Gold
  "#F3E9D2", // Cream
  "#2B2B2B", // Black
  "#B79B6C", // Bronze
  "#EFE7DA", // Ivory
  "#7A6A4F", // Olive Brown
  "#FFFFFF", // White
];

export const JOB_COLORS = [
  "#2F5D3A", // Hijau tua
  "#D9A441", // Kuning/gold
  "#7A5A3A", // Coklat tanah
  "#4C8B5A", // Hijau daun
  "#E8C468", // Kuning muda
  "#B8895A", // Coklat muda
  "#5B7B52", // Hijau lumut
  "#C97B4A", // Terracotta
];

// ---------- Util: animasi angka berjalan (count-up) saat elemen masuk layar ----------
function useCountUp(target, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const duration = 1200;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [active, target]);
  return val;
}

// ---------- Util: fade/slide-in saat elemen discroll masuk layar ----------
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function AnimatedNumber({ value, className }) {
  const [ref, visible] = useReveal();
  const val = useCountUp(value, visible);
  return (
    <span ref={ref} className={className}>
      {val.toLocaleString("id-ID")}
    </span>
  );
}

function RevealBlock({ children, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}

function toEntries(obj) {
  return Object.entries(obj || {}).sort((a, b) => b[1] - a[1]);
}

// ---------- Pictogram rasio gender: grid ikon orang, bukan angka doang ----------
function GenderPictogram({ laki, perempuan }) {
  const total = laki + perempuan;
  const totalIkon = 50; // tiap ikon mewakili ~2% populasi
  const jumlahLaki = Math.round((laki / total) * totalIkon);
  return (
    <div className="grid grid-cols-10 gap-2 max-w-md mx-auto">
      {Array.from({ length: totalIkon }).map((_, i) => (
        <PersonStanding
          key={i}
          size={22}
          className={i < jumlahLaki ? "text-sky-300" : "text-desa-gold"}
          style={{ animation: `popIn 0.4s ease ${i * 0.02}s both` }}
        />
      ))}
    </div>
  );
}

export default function DataKependudukan({ data }) {
  const d = data?.jumlah_penduduk ? data : DEFAULT_DATA;

  const pekerjaan = toEntries(
    d.pekerjaan_json || DEFAULT_DATA.pekerjaan_json
  ).map(([name, value]) => ({ name, value }));
  const pendidikan = toEntries(
    d.pendidikan_json || DEFAULT_DATA.pendidikan_json
  ).map(([name, value]) => ({ name, value }));
  const perkawinan = toEntries(
    d.status_perkawinan_json || DEFAULT_DATA.status_perkawinan_json
  ).map(([name, value]) => ({ name, value }));
  const rt = toEntries(d.sebaran_rt_json || DEFAULT_DATA.sebaran_rt_json)
    .map(([name, value]) => ({ name, value }))
    .reverse();

  const pctLaki = Math.round((d.laki_laki / d.jumlah_penduduk) * 100);
  const pctPerempuan = 100 - pctLaki;

  return (
    <Layout title="Data Kependudukan" addTopSpacing={false}>
      {/* ============ HERO — full-bleed, keluar dari max-width container Layout ============ */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen overflow-hidden bg-gradient-to-br from-desa-green via-[#254a2f] to-[#16281c] text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={placeholderImage("kependudukan-hero", 1920, 700)}
          alt="Warga Desa Pagergunung"
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-desa-gold/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 sm:py-28 text-center">
          <p className="uppercase tracking-[0.35em] text-xs text-white/60 mb-4">
            Data Kependudukan · {d.tahun}
          </p>
          <div className="flex items-end justify-center gap-2 mb-3">
            <AnimatedNumber
              value={d.jumlah_penduduk}
              className="text-6xl sm:text-8xl font-black tabular-nums"
            />
          </div>
          <p className="text-white/80 text-lg mb-10">
            Jiwa tinggal di Desa Pagergunung
          </p>

          <div className="flex justify-center gap-10 sm:gap-16 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Home size={22} />
              </span>
              <div className="text-left">
                <AnimatedNumber
                  value={d.jumlah_kk}
                  className="text-2xl font-bold block"
                />
                <span className="text-xs text-white/60">Kepala Keluarga</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Users size={22} />
              </span>
              <div className="text-left">
                <span className="text-2xl font-bold block">
                  {pctLaki}% / {pctPerempuan}%
                </span>
                <span className="text-xs text-white/60">
                  Laki-laki / Perempuan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gelombang dekoratif penutup hero */}
        <svg
          viewBox="0 0 1440 80"
          className="relative z-10 w-full -mb-1"
          preserveAspectRatio="none"
        >
          <path
            d="M0,32 C360,80 1080,0 1440,48 L1440,80 L0,80 Z"
            fill="#F6F3EA"
          />
        </svg>
      </section>

      {/* ============ RASIO GENDER — band hijau tua penuh, pictogram ikon ============ */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen bg-desa-cream py-16 sm:py-20">
        <RevealBlock className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-desa-green mb-2">
            Rasio Penduduk
          </h2>
          <p className="text-gray-500 mb-10">
            Setiap ikon mewakili kira-kira 2% dari total warga
          </p>
          <GenderPictogram laki={d.laki_laki} perempuan={d.perempuan} />
          <div className="flex justify-center gap-8 mt-8">
            <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <span className="w-3.5 h-3.5 rounded-full bg-sky-300" /> Laki-laki
              ({d.laki_laki.toLocaleString("id-ID")})
            </span>
            <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <span className="w-3.5 h-3.5 rounded-full bg-desa-gold" />{" "}
              Perempuan ({d.perempuan.toLocaleString("id-ID")})
            </span>
          </div>
        </RevealBlock>
        <style jsx global>{`
          @keyframes popIn {
            from {
              opacity: 0;
              transform: scale(0.4);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </section>

      {/* ============ STRUKTUR USIA — band putih, 3 kartu besar animasi ============ */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen bg-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <RevealBlock className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-desa-green mb-2">
              Struktur Usia
            </h2>
            <p className="text-gray-500">
              Perbandingan kelompok usia anak, produktif, dan lansia
            </p>
          </RevealBlock>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                label: "Anak-anak (0–14 th)",
                value: d.usia_0_14,
                icon: Baby,
                color: "bg-rose-50 text-rose-500",
              },
              {
                label: "Usia Produktif (15–64 th)",
                value: d.usia_15_64,
                icon: TrendingUp,
                color: "bg-desa-green/10 text-desa-green",
              },
              {
                label: "Lansia (65+ th)",
                value: d.usia_65_plus,
                icon: Heart,
                color: "bg-amber-50 text-amber-500",
              },
            ].map((item) => {
              const Icon = item.icon;
              const pct = Math.round((item.value / d.jumlah_penduduk) * 100);
              return (
                <RevealBlock key={item.label}>
                  <div className="text-center p-6">
                    <span
                      className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4`}
                    >
                      <Icon size={28} />
                    </span>
                    <AnimatedNumber
                      value={item.value}
                      className="text-3xl font-black text-desa-green block"
                    />
                    <p className="text-sm text-gray-500 mt-1 mb-4">
                      {item.label}
                    </p>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-desa-green rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {pct}% dari total penduduk
                    </p>
                  </div>
                </RevealBlock>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ PEKERJAAN — band hijau tua, donut chart + foto ============ */}
      {/* ============ PEKERJAAN — band putih, gauge setengah lingkaran + vektor dekoratif ============ */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen bg-white py-16 sm:py-20 overflow-hidden">
        {/* Elemen vektor dekoratif: lingkaran yang dipotong tepi section jadi terlihat setengah */}
        <div className="absolute -left-28 top-16 w-56 h-56 rounded-full bg-desa-cream" />
        <div className="absolute -left-16 top-24 w-32 h-32 rounded-full border-[3px] border-desa-gold/40" />
        <div className="absolute -right-32 bottom-10 w-72 h-72 rounded-full border-[3px] border-desa-green/15" />
        <div className="absolute -right-16 bottom-24 w-40 h-40 rounded-full bg-desa-gold/10" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-12 lg:px-8">
          <RevealBlock className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-desa-green mb-2 flex items-center justify-center gap-2">
              <Briefcase size={26} /> Mata Pencaharian
            </h2>
            <p className="text-gray-500">
              Sebagian besar warga bekerja di sektor pertanian
            </p>
          </RevealBlock>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Gauge setengah lingkaran untuk sektor teratas */}
            <RevealBlock>
              <div className="bg-desa-cream/50 rounded-3xl p-8">
                <div className="h-56 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pekerjaan}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="90%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={90}
                        outerRadius={140}
                        paddingAngle={2}
                      >
                        {pekerjaan.map((_, i) => (
                          <Cell
                            key={i}
                            fill={JOB_COLORS[i % JOB_COLORS.length]}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => `${v.toLocaleString("id-ID")} orang`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-x-0 bottom-2 text-center">
                    <p className="text-4xl font-black text-desa-green">
                      {Math.round(
                        (pekerjaan[0].value / d.jumlah_penduduk) * 100
                      )}
                      %
                    </p>
                    <p className="text-sm text-gray-500">{pekerjaan[0].name}</p>
                  </div>
                </div>

                {/* Bar tersegmentasi — ringkasan proporsi seluruh sektor */}
                <div className="mt-6 h-3 w-full rounded-full overflow-hidden flex">
                  {pekerjaan.map((p, i) => (
                    <div
                      key={p.name}
                      style={{
                        width: `${(p.value / d.jumlah_penduduk) * 100}%`,
                        background: JOB_COLORS[i % JOB_COLORS.length],
                      }}
                      title={p.name}
                    />
                  ))}
                </div>
              </div>
            </RevealBlock>

            {/* Daftar sektor pekerjaan */}
            <RevealBlock>
              <ul className="space-y-3">
                {pekerjaan.map((p, i) => {
                  const pct = Math.round((p.value / d.jumlah_penduduk) * 100);
                  const isTop = i === 0;
                  return (
                    <li
                      key={p.name}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
                        isTop ? "bg-desa-green/5" : "hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          background: JOB_COLORS[i % JOB_COLORS.length],
                        }}
                      />
                      <span
                        className={`text-sm flex-1 ${
                          isTop
                            ? "font-semibold text-desa-green"
                            : "text-gray-700"
                        }`}
                      >
                        {p.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {p.value.toLocaleString("id-ID")} orang
                      </span>
                      <span
                        className={`text-sm font-bold w-12 text-right ${
                          isTop ? "text-desa-green" : "text-gray-500"
                        }`}
                      >
                        {pct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </RevealBlock>
          </div>
        </div>
      </section>
      {/* ============ PENDIDIKAN — band krem, bar chart horizontal animasi ============ */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen bg-desa-cream py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <RevealBlock className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-desa-green mb-2 flex items-center justify-center gap-2">
              <GraduationCap size={26} /> Tingkat Pendidikan
            </h2>
            <p className="text-gray-500">
              Jenjang pendidikan terakhir warga Desa Pagergunung
            </p>
          </RevealBlock>

          <RevealBlock>
            <div className="bg-white rounded-3xl p-6 sm:p-8 h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pendidikan}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#eee"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={140}
                    tick={{ fontSize: 12, fill: "#4b5563" }}
                  />
                  <Tooltip
                    formatter={(v) => `${v.toLocaleString("id-ID")} orang`}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {pendidikan.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ============ STATUS PERKAWINAN + SEBARAN RT — band putih, 2 kolom ============ */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen bg-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12">
          <RevealBlock>
            <h2 className="text-xl sm:text-2xl font-bold text-desa-green mb-6 flex items-center gap-2">
              <Heart size={22} /> Status Perkawinan
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {perkawinan.map((p, i) => {
                const pct = Math.round((p.value / d.jumlah_penduduk) * 100);
                return (
                  <div
                    key={p.name}
                    className="bg-desa-cream rounded-2xl p-5 text-center"
                  >
                    <p
                      className="text-3xl font-black"
                      style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}
                    >
                      {pct}%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{p.name}</p>
                    <p className="text-xs text-gray-400">
                      {p.value.toLocaleString("id-ID")} orang
                    </p>
                  </div>
                );
              })}
            </div>
          </RevealBlock>

          <RevealBlock>
            <h2 className="text-xl sm:text-2xl font-bold text-desa-green mb-6 flex items-center gap-2">
              <MapPin size={22} /> Sebaran per RT
            </h2>
            <div className="space-y-3">
              {rt.map((r, i) => {
                const max = Math.max(...rt.map((x) => x.value));
                const pct = Math.round((r.value / max) * 100);
                return (
                  <div key={r.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        {r.name}
                      </span>
                      <span className="text-gray-400">
                        {r.value.toLocaleString("id-ID")} jiwa
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-desa-leaf transition-all duration-1000"
                        style={{
                          width: `${pct}%`,
                          transitionDelay: `${i * 100}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ============ CATATAN PRIVASI ============ */}
      <section className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-xs text-gray-400 leading-relaxed">
          Data di atas ditampilkan dalam bentuk agregat/statistik untuk menjaga
          kerahasiaan data pribadi warga. Data individu (NIK, nama, dsb.) tidak
          dipublikasikan dan hanya dikelola oleh perangkat desa sesuai ketentuan
          perlindungan data pribadi.
        </p>
      </section>
    </Layout>
  );
}

export async function getServerSideProps() {
  const { data } = await supabase
    .from("data_kependudukan")
    .select("*")
    .order("tahun", { ascending: false })
    .limit(1);
  return { props: { data: data?.[0] || null } };
}
