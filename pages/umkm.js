import Head from "next/head";
import dynamic from "next/dynamic";
import { useState, useMemo, useCallback } from "react";
import Layout from "../components/Layout";
import {
  MapPin,
  Coffee,
  Flower2,
  Trees,
  TrendingUp,
  Compass,
  X,
  Users,
  ChevronRight,
  BadgeCheck,
  ArrowRight,
  Layers,
  Calendar,
  ShieldCheck,
} from "lucide-react";

/**
 * ==== LEAFLET — dynamic import, wajib ssr:false karena butuh window ====
 * Leaflet CSS di-load lewat <link> di <Head> (lihat di bawah), bukan via
 * `import "leaflet/dist/leaflet.css"` langsung di file ini, supaya aman
 * dipakai di halaman biasa (bukan cuma _app.js).
 */
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

/**
 * ==== DATA MENTAH HASIL SURVEI ====
 * period: 'hari' (per hari), 'panen' (per periode panen / tidak spesifik), 'tahun' (per tahun)
 * Hanya entri dengan period 'hari' yang dipakai untuk estimasi rata-rata bulanan,
 * karena entri lain tidak punya basis waktu yang jelas dari hasil wawancara.
 */
const RAW_DATA = [
  {
    zona: "pagergunung",
    kategori: "kelapa",
    unit: "butir",
    min: 1200,
    max: 2000,
    period: "hari",
    catatan:
      "±60% pasokan berasal dari Pagergunung. Hasil bagus dikirim kupasan, sisanya diolah koprah.",
  },
  {
    zona: "wonoharjo",
    kategori: "kelapa",
    unit: "butir",
    min: 5000,
    max: 10000,
    period: "panen",
    catatan:
      "Seluruh hasil diolah jadi koprah di pabrik Wonoharjo. Total tahunan diperkirakan mencapai jutaan butir. Kadang menghasilkan kapol musiman.",
  },
  {
    zona: "lainnya",
    kategori: "kelapa",
    unit: "butir",
    min: 300,
    max: 300,
    period: "hari",
    catatan: "Dijual dalam bentuk butiran.",
  },
  {
    zona: "lainnya",
    kategori: "kelapa",
    unit: "butir",
    min: 500,
    max: 1000,
    period: "panen",
    catatan:
      "Volume tambahan dari narasumber yang sama, periode tidak spesifik.",
  },
  {
    zona: "lainnya",
    kategori: "kelapa",
    unit: "butir",
    min: 200,
    max: 500,
    period: "panen",
    catatan: "Dijual dalam bentuk kupasan, harga ±Rp200/butir.",
  },
  {
    zona: "lainnya",
    kategori: "kopi",
    unit: "kg",
    min: 100,
    max: 100,
    period: "panen",
    catatan: "Tanaman kopi mulai berproduksi setelah 2–3 tahun.",
  },
  {
    zona: "lainnya",
    kategori: "kopi",
    unit: "kg",
    min: 600,
    max: 600,
    period: "panen",
    catatan:
      "±1.000 pohon kopi. Bagi hasil kelompok tani sekitar 15%–30% per panen.",
  },
  {
    zona: "lainnya",
    kategori: "kopi",
    unit: "kg",
    min: 1000,
    max: 5000,
    period: "panen",
    catatan: "Skala produksi kopi terbesar di antara narasumber survei.",
  },
  {
    zona: "lainnya",
    kategori: "cengkeh",
    unit: "kg",
    min: 300,
    max: 300,
    period: "panen",
    catatan: "",
  },
  {
    zona: "lainnya",
    kategori: "cengkeh",
    unit: "kg",
    min: 25,
    max: 25,
    period: "panen",
    catatan: "",
  },
];

const ZONA_LABEL = {
  pagergunung: "Pagergunung",
  wonoharjo: "Wonoharjo",
  lainnya: "Wilayah Lainnya (belum terpetakan)",
};

/**
 * ==== TITIK PETA ====
 * Kec. Pangandaran, Kab. Pangandaran, Jawa Barat. Koordinat di bawah ini
 * diambil dari lokasi Kantor Desa masing-masing (Google Places) — cukup
 * akurat sebagai titik acuan pusat desa. Pin tetap bisa DI-DRAG kalau
 * kamu mau geser ke titik yang lebih spesifik (mis. lokasi kebun/pabrik
 * koprah), dan koordinat hasil geser tampil live di popup & panel kanan
 * supaya bisa disalin balik ke sini.
 * Zona "lainnya" sengaja tidak dipetakan karena belum ada titik pasti.
 */
const INITIAL_PINS = {
  pagergunung: { lat: -7.6294318, lng: 108.6370427 }, // Kantor Desa Pagergunung, Jl. Sukamelang No.84
  wonoharjo: { lat: -7.6773715, lng: 108.6336379 }, // Kantor Desa Wonoharjo
};

const PETA_CENTER = { lat: -7.653, lng: 108.6353 };

const KATEGORI_LABEL = {
  kelapa: { label: "Kelapa", unit: "butir", warna: "#2f7a4f", icon: Trees },
  kopi: { label: "Kopi", unit: "kg", warna: "#8a5a2b", icon: Coffee },
  cengkeh: { label: "Cengkeh", unit: "kg", warna: "#b8860b", icon: Flower2 },
};

const FONT_DISPLAY = "'Plus Jakarta Sans', 'Inter', sans-serif";
const SECTION_X = "px-5 sm:px-8 md:px-10 lg:px-12 xl:px-16 2xl:px-20";
const CONTAINER = "max-w-7xl mx-auto";

function useAggregate() {
  return useMemo(() => {
    const byKategori = {};
    const byZona = {};

    for (const item of RAW_DATA) {
      // agregasi per kategori
      if (!byKategori[item.kategori]) {
        byKategori[item.kategori] = {
          narasumber: 0,
          totalMin: 0,
          totalMax: 0,
          harianMin: 0,
          harianMax: 0,
          adaHarian: false,
          items: [],
        };
      }
      const k = byKategori[item.kategori];
      k.narasumber += 1;
      k.totalMin += item.min;
      k.totalMax += item.max;
      k.items.push(item);
      if (item.period === "hari") {
        k.harianMin += item.min;
        k.harianMax += item.max;
        k.adaHarian = true;
      }

      // agregasi per zona
      if (!byZona[item.zona]) byZona[item.zona] = [];
      byZona[item.zona].push(item);
    }

    return { byKategori, byZona };
  }, []);
}

function formatAngka(n) {
  return n.toLocaleString("id-ID");
}

// Ikon pin custom per zona (dibuat via divIcon supaya tidak bergantung pada
// aset default Leaflet yang sering patah di bundler Next.js).
function buatPinIcon(L, warna, aktif) {
  const size = aktif ? 34 : 26;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${warna};
      border:2.5px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

/**
 * ==== STAT ITEM (dipakai di pita statistik hero) ====
 */
function StatItem({ icon, value, label }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="shrink-0 w-8 h-8 rounded-full bg-desa-green/8 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p
          style={{ fontFamily: FONT_DISPLAY }}
          className="text-xl sm:text-2xl font-extrabold text-desa-green leading-none"
        >
          {value}
        </p>
        <p className="text-gray-400 text-[11px] uppercase tracking-wide font-semibold">
          {label}
        </p>
      </div>
    </div>
  );
}

/**
 * ==== BATAS WILAYAH DESA PAGERGUNUNG (VEKTOR ASLI) ====
 * Satu-satunya elemen vektor dekoratif yang dipertahankan di halaman ini:
 * ini adalah PETA, bukan ilustrasi. Path di bawah persis dari file SVG
 * hasil ekspor sendiri (viewBox 0 0 377 534) — bentuknya tidak diubah,
 * hanya gaya visualnya yang dirapikan.
 *
 * MARKER_KOMODITAS: posisinya BUKAN hasil geotagging asli, hanya
 * titik ilustratif di dalam poligon (sudah dicek dengan point-in-
 * polygon supaya jatuh di dalam bentuk desa). Ganti x/y-nya begitu
 * proses geotagging sudah punya koordinat riil per kebun/dusun.
 */
const BOUNDARY_VIEWBOX = "0 0 377 534";
const BOUNDARY_PATH =
  "M55.1367 27.1399L61.6367 0.639893L49.1367 27.1399L33.6367 49.1399L21.1367 70.1399V99.1399L27.6367 111.64L33.6367 140.64L27.6367 154.64L24.1367 190.64L4.63672 210.14L1.63672 227.14L16.1367 238.14L21.1367 248.14L4.63672 281.14L8.63672 292.14L49.1367 300.64L63.6367 296.64L80.6367 292.14H93.1367L121.137 305.64L131.637 296.64H145.637V305.64L167.637 321.14L180.137 334.64H196.137H200.137L191.137 348.14L196.137 355.14L191.137 370.64L212.637 384.64L225.137 381.64L236.637 384.64L233.137 397.64L196.137 494.64H205.137L196.137 525.14H233.137L258.137 532.14L277.637 519.64L291.637 494.64L305.637 474.64L316.637 447.14V419.64L305.637 381.64L299.137 364.14V355.14L311.137 348.14L321.137 327.64L325.137 305.64L321.137 281.14L329.137 260.14H334.137L343.637 252.64L334.137 243.14L353.637 248.14L343.637 238.14L348.137 230.64L363.137 225.14L367.137 238.14H375.137V230.64L367.137 221.14H375.137V210.14L367.137 197.64L363.137 188.14H343.637H311.137L279.137 174.64L274.637 179.64L268.137 174.64L255.637 163.64L227.637 157.64L195.137 136.14H179.637L153.637 118.14L130.637 99.1399L104.137 90.6399L93.1367 85.1399L81.1367 49.1399L55.1367 27.1399Z";

const MARKER_KOMODITAS = [
  { kategori: "kelapa", x: 221, y: 237 },
  { kategori: "kopi", x: 159, y: 138 },
  { kategori: "cengkeh", x: 285, y: 467 },
];

/**
 * ==== POPUP DETAIL KOMODITAS ====
 * Muncul saat titik pada peta vektor di-klik.
 */
function DetailPopupKomoditas({ kategori, data, onClose }) {
  if (!kategori) return null;
  const meta = KATEGORI_LABEL[kategori];
  const Icon = meta.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-desa-green/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-7 max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
        >
          <X size={16} />
        </button>

        <span
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: `${meta.warna}18`, color: meta.warna }}
        >
          <Icon size={20} />
        </span>

        <h3
          style={{ fontFamily: FONT_DISPLAY }}
          className="text-lg sm:text-xl font-extrabold text-desa-green mb-1"
        >
          {meta.label}
        </h3>
        <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Users size={12} /> {data.narasumber} narasumber disurvei
        </p>

        <div className="rounded-xl bg-desa-cream/50 p-4 mb-4">
          <p className="text-[11px] text-gray-400 mb-0.5">
            Total volume dilaporkan
          </p>
          <p
            style={{ fontFamily: FONT_DISPLAY }}
            className="text-xl font-extrabold text-gray-700"
          >
            {formatAngka(data.totalMin)}
            {data.totalMin !== data.totalMax
              ? `–${formatAngka(data.totalMax)}`
              : ""}{" "}
            <span className="text-xs font-semibold text-gray-400">
              {meta.unit}
            </span>
          </p>
          {data.adaHarian && (
            <p
              className="text-xs sm:text-sm font-semibold mt-1.5"
              style={{ color: meta.warna }}
            >
              ≈ {formatAngka(data.harianMin * 30)}
              {data.harianMin !== data.harianMax
                ? `–${formatAngka(data.harianMax * 30)}`
                : ""}{" "}
              {meta.unit} / bulan*
            </p>
          )}
        </div>

        <p className="text-[11px] uppercase tracking-wide font-bold text-gray-400 mb-2">
          Rincian per narasumber
        </p>
        <div className="space-y-3">
          {data.items.map((item, i) => (
            <div
              key={i}
              className="border-t border-gray-100 pt-3 first:border-0 first:pt-0"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-600">
                  {ZONA_LABEL[item.zona]}
                </span>
                <span className="text-sm font-bold text-gray-700 whitespace-nowrap">
                  {formatAngka(item.min)}
                  {item.min !== item.max
                    ? `–${formatAngka(item.max)}`
                    : ""}{" "}
                  {meta.unit}
                  {item.period === "hari" ? " / hari" : ""}
                </span>
              </div>
              {item.catatan && (
                <p className="text-xs text-gray-500 leading-relaxed">
                  {item.catatan}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="text-[11px] text-gray-400 mt-4">
          *Estimasi bulanan hanya dihitung dari data yang dilaporkan per hari
          (×30), bukan angka resmi.
        </p>
      </div>
    </div>
  );
}

export default function PotensiDesa() {
  const { byKategori, byZona } = useAggregate();
  const [selectedZona, setSelectedZona] = useState("pagergunung");
  const [hoverMarker, setHoverMarker] = useState(null);
  const [popupKategori, setPopupKategori] = useState(null);
  const [pins, setPins] = useState(INITIAL_PINS);
  const [leafletL, setLeafletL] = useState(null);

  const kategoriList = Object.keys(byKategori);
  const totalNarasumber = RAW_DATA.length;
  const totalZona = Object.keys(byZona).length;
  const maxNarasumber = Math.max(
    ...Object.values(byKategori).map((k) => k.narasumber)
  );

  // load modul `leaflet` mentah sekali saja (dipakai buat bikin divIcon)
  const handleMapReady = useCallback(() => {
    import("leaflet").then((L) => setLeafletL(L.default || L));
  }, []);

  const handleDragEnd = useCallback((zona, e) => {
    const { lat, lng } = e.target.getLatLng();
    setPins((prev) => ({
      ...prev,
      [zona]: { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) },
    }));
  }, []);

  return (
    <Layout title="Potensi Desa">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Leaflet CSS via CDN — aman dipakai di halaman biasa (bukan cuma _app.js) */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </Head>

      <style jsx global>{`
        .leaflet-container {
          font-family: "Inter", sans-serif;
          border-radius: 1rem;
        }
      `}</style>

      {/* ================= HERO — bersih, tanpa ilustrasi vektor ================= */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen bg-gradient-to-b from-desa-cream/50 via-white to-white">
        <div
          className={`relative ${CONTAINER} ${SECTION_X} pt-12 sm:pt-16 pb-14 sm:pb-16`}
        >
          {/* breadcrumb mini */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-400 font-medium mb-6">
            <span>Beranda</span>
            <ChevronRight size={12} />
            <span className="text-desa-green font-semibold">Potensi Desa</span>
          </div>

          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.15em] font-bold bg-desa-green/8 text-desa-green px-3.5 py-1.5 rounded-full mb-5">
              <BadgeCheck size={13} /> Data Survei Lapangan Terverifikasi
            </span>

            <h1
              style={{ fontFamily: FONT_DISPLAY }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-desa-green tracking-tight mb-4"
            >
              Potensi Desa Pagergunung
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl leading-relaxed mb-8">
              Rangkuman potensi komoditas desa seperti kelapa, kopi, dan cengkeh
              yang disusun dari hasil wawancara langsung dengan warga dan pelaku
              usaha tani.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#komoditas"
                className="inline-flex items-center gap-2 bg-desa-green text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:bg-desa-green/90 transition-colors"
              >
                Lihat Komoditas <ArrowRight size={16} />
              </a>
              <a
                href="#peta-wilayah"
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-semibold px-5 py-2.5 rounded-full hover:border-desa-green/30 hover:text-desa-green transition-colors"
              >
                Lihat Peta Wilayah
              </a>
            </div>
          </div>
        </div>

        {/* pita statistik — melayang, menjembatani hero ke section berikutnya */}
        <div
          className={`relative z-10 ${CONTAINER} ${SECTION_X} -mb-10 sm:-mb-12`}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-desa-green/5 ring-1 ring-black/5 px-5 sm:px-7 py-5 flex flex-wrap items-center gap-x-8 gap-y-4 translate-y-8 sm:translate-y-10">
            <StatItem
              icon={<Layers size={16} className="text-desa-green" />}
              value={kategoriList.length}
              label="Komoditas"
            />
            <div className="w-px h-8 bg-gray-100 hidden sm:block" />
            <StatItem
              icon={<Users size={16} className="text-desa-green" />}
              value={totalNarasumber}
              label="Narasumber"
            />
            <div className="w-px h-8 bg-gray-100 hidden sm:block" />
            <StatItem
              icon={<MapPin size={16} className="text-desa-green" />}
              value={totalZona}
              label="Zona"
            />
            <div className="w-px h-8 bg-gray-100 hidden sm:block" />
            <StatItem
              icon={<Calendar size={16} className="text-desa-green" />}
              value={new Date().getFullYear()}
              label="Tahun Survei"
            />

            <div className="ml-auto hidden md:flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
              <ShieldCheck size={13} className="text-desa-green/60" />
              Data terbaru oleh tim survei KKN UGM 2026
            </div>
          </div>
        </div>
      </section>

      {/* ================= PETA VEKTOR DESA PAGERGUNUNG ================= */}
      <section id="peta-wilayah" className="bg-desa-cream/25">
        <div
          className={`${CONTAINER} ${SECTION_X} pt-32 sm:pt-32 pb-10 sm:pb-14`}
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.15em] font-bold text-desa-leaf mb-3">
            <MapPin size={13} /> Peta Wilayah
          </span>
          <h2
            style={{ fontFamily: FONT_DISPLAY }}
            className="text-xl sm:text-2xl font-extrabold text-desa-green tracking-tight mb-2"
          >
            Desa Pagergunung
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mb-6">
            Klik titik komoditas pada peta untuk melihat detail lengkapnya.
          </p>

          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-sm ring-1 ring-black/5 p-6 sm:p-10 flex items-center justify-center">
            <span className="absolute top-5 right-5 w-9 h-9 rounded-full bg-desa-cream/70 flex items-center justify-center text-desa-green">
              <Compass size={16} />
            </span>

            <div className="relative w-full max-w-[360px] sm:max-w-[440px] md:max-w-[500px]">
              <svg
                viewBox={BOUNDARY_VIEWBOX}
                className="w-full h-auto drop-shadow-[0_10px_24px_rgba(47,122,79,0.16)]"
              >
                <path
                  d={BOUNDARY_PATH}
                  fill="#2f7a4f"
                  stroke="#f6c667"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />

                {MARKER_KOMODITAS.map((m) => {
                  const meta = KATEGORI_LABEL[m.kategori];
                  const Icon = meta.icon;
                  const isAktif = hoverMarker === m.kategori;
                  return (
                    <g
                      key={m.kategori}
                      onMouseEnter={() => setHoverMarker(m.kategori)}
                      onMouseLeave={() => setHoverMarker(null)}
                      onClick={() => setPopupKategori(m.kategori)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={m.x}
                        cy={m.y}
                        r={isAktif ? 26 : 20}
                        fill="white"
                        stroke={meta.warna}
                        strokeWidth="3"
                        style={{ transition: "r 150ms ease" }}
                      />
                      <g
                        transform={`translate(${m.x - 12}, ${m.y - 12})`}
                        style={{ pointerEvents: "none" }}
                      >
                        <Icon size={24} color={meta.warna} strokeWidth={2} />
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 text-center px-4">
              Peta batas desa — bukan peta berskala. Klik titik untuk detail.
            </p>
          </div>
        </div>
      </section>

      <div className={`${CONTAINER} ${SECTION_X} py-14 sm:py-16`}>
        {/* ==== RINGKASAN PER KOMODITAS ==== */}
        <span
          id="komoditas"
          className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.15em] font-bold text-desa-leaf mb-3 scroll-mt-24"
        >
          <TrendingUp size={13} /> Ringkasan
        </span>
        <h2
          style={{ fontFamily: FONT_DISPLAY }}
          className="text-xl sm:text-2xl font-extrabold text-desa-green tracking-tight mb-6"
        >
          Komoditas Unggulan
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-2">
          {kategoriList.map((kat) => {
            const k = byKategori[kat];
            const meta = KATEGORI_LABEL[kat];
            const Icon = meta.icon;
            return (
              <button
                key={kat}
                onClick={() => setPopupKategori(kat)}
                className="group text-left bg-white rounded-2xl shadow-sm ring-1 ring-black/5 hover:ring-black/10 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 p-5 sm:p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${meta.warna}14`,
                      color: meta.warna,
                    }}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <span className="text-[11px] font-semibold bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full">
                    {k.narasumber} sumber
                  </span>
                </div>

                <h3
                  style={{ fontFamily: FONT_DISPLAY }}
                  className="font-bold text-desa-green text-base sm:text-lg mb-3"
                >
                  {meta.label}
                </h3>

                <p className="text-[11px] text-gray-400 mb-0.5">
                  Total volume dilaporkan
                </p>
                <p
                  style={{ fontFamily: FONT_DISPLAY }}
                  className="text-xl sm:text-2xl font-extrabold text-gray-700 mb-1"
                >
                  {formatAngka(k.totalMin)}
                  {k.totalMin !== k.totalMax
                    ? `–${formatAngka(k.totalMax)}`
                    : ""}{" "}
                  <span className="text-xs sm:text-sm font-semibold text-gray-400">
                    {meta.unit}
                  </span>
                </p>

                {k.adaHarian && (
                  <p
                    className="text-xs sm:text-sm font-semibold mt-2"
                    style={{ color: meta.warna }}
                  >
                    ≈ {formatAngka(k.harianMin * 30)}
                    {k.harianMin !== k.harianMax
                      ? `–${formatAngka(k.harianMax * 30)}`
                      : ""}{" "}
                    {meta.unit} / bulan*
                  </p>
                )}

                <div className="mt-4">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(k.narasumber / maxNarasumber) * 100}%`,
                        backgroundColor: meta.warna,
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-gray-400 mt-4 mb-12 sm:mb-16">
          *Estimasi bulanan hanya dihitung dari data yang dilaporkan per hari
          (×30), bukan angka resmi.
        </p>

        {/* ==== PETA GIS ZONA (Leaflet) ==== */}
        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.15em] font-bold text-desa-leaf mb-3">
          <MapPin size={13} /> Sebaran Wilayah
        </span>
        <h2
          style={{ fontFamily: FONT_DISPLAY }}
          className="text-xl sm:text-2xl font-extrabold text-desa-green tracking-tight mb-6"
        >
          Potensi Desa, Satu Pandangan
        </h2>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 mb-4">
          {/* peta leaflet */}
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-sm ring-1 ring-black/5 p-4 sm:p-5 flex-1">
            <div
              className="relative rounded-2xl overflow-hidden ring-1 ring-black/5"
              style={{ height: 380 }}
            >
              <MapContainer
                center={[PETA_CENTER.lat, PETA_CENTER.lng]}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
                whenReady={handleMapReady}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {leafletL &&
                  Object.entries(pins).map(([zona, pos]) => {
                    const aktif = selectedZona === zona;
                    const warna = zona === "wonoharjo" ? "#b8860b" : "#2f7a4f";
                    return (
                      <Marker
                        key={zona}
                        position={[pos.lat, pos.lng]}
                        draggable
                        icon={buatPinIcon(leafletL, warna, aktif)}
                        eventHandlers={{
                          click: () => setSelectedZona(zona),
                          dragend: (e) => handleDragEnd(zona, e),
                        }}
                      >
                        <Popup>
                          <span className="font-semibold">
                            {ZONA_LABEL[zona]}
                          </span>
                          <br />
                          <span className="text-xs text-gray-500">
                            {pos.lat}, {pos.lng}
                          </span>
                        </Popup>
                      </Marker>
                    );
                  })}
              </MapContainer>
            </div>

            {/* legenda zona */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
              {Object.entries(ZONA_LABEL).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedZona(key)}
                  className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
                  style={
                    selectedZona === key
                      ? {
                          backgroundColor:
                            key === "wonoharjo" ? "#b8860b" : "#2f7a4f",
                          borderColor:
                            key === "wonoharjo" ? "#b8860b" : "#2f7a4f",
                          color: "white",
                        }
                      : {
                          backgroundColor: "white",
                          borderColor: "#e5e7eb",
                          color: "#6b7280",
                        }
                  }
                >
                  <MapPin size={12} />
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3 text-center">
              Peta OpenStreetMap, Kec. Pangandaran, Kab. Pangandaran. Titik pin
              masih estimasi awal — geser (drag) pin untuk kalibrasi ke lokasi
              sebenarnya; koordinat hasil geser muncul di popup &amp; panel
              kanan.
            </p>
          </div>

          {/* panel info zona terpilih — melayang sedikit di atas peta pada layar besar */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm ring-1 ring-black/5 p-5 sm:p-6 lg:w-80 shrink-0 lg:-mt-3 lg:mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-9 h-9 rounded-xl bg-desa-green/8 text-desa-green flex items-center justify-center shrink-0">
                <MapPin size={17} />
              </span>
              <h3
                style={{ fontFamily: FONT_DISPLAY }}
                className="font-bold text-desa-green text-sm sm:text-base"
              >
                {ZONA_LABEL[selectedZona]}
              </h3>
            </div>

            {pins[selectedZona] && (
              <p className="text-[11px] text-gray-400 mb-4 ml-11">
                {pins[selectedZona].lat}, {pins[selectedZona].lng}
              </p>
            )}
            {!pins[selectedZona] && <div className="mb-4" />}

            {byZona[selectedZona]?.length ? (
              <div className="space-y-4">
                {byZona[selectedZona].map((item, i) => {
                  const meta = KATEGORI_LABEL[item.kategori];
                  return (
                    <div
                      key={i}
                      className="border-t border-gray-100 pt-3 first:border-0 first:pt-0"
                    >
                      <span
                        className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mb-1.5"
                        style={{
                          backgroundColor: `${meta.warna}18`,
                          color: meta.warna,
                        }}
                      >
                        {meta.label}
                      </span>
                      <p className="text-sm font-semibold text-gray-700">
                        {formatAngka(item.min)}
                        {item.min !== item.max
                          ? `–${formatAngka(item.max)}`
                          : ""}{" "}
                        {meta.unit}
                        {item.period === "hari" ? " / hari" : ""}
                      </p>
                      {item.catatan && (
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {item.catatan}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Belum ada data untuk zona ini.
              </p>
            )}
          </div>
        </div>
      </div>

      <DetailPopupKomoditas
        kategori={popupKategori}
        data={popupKategori ? byKategori[popupKategori] : null}
        onClose={() => setPopupKategori(null)}
      />
    </Layout>
  );
}
