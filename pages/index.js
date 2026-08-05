import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { placeholderImage } from "../lib/placeholderImage";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Phone,
  Newspaper,
  Clock,
  Info,
  Home as HomeIcon,
  Users,
  Building2,
  BarChart3,
  Wallet,
  Map as MapIcon,
  Store,
  Camera,
  ArrowRight,
  Landmark,
  Sparkles,
  Leaf,
  HeartHandshake,
  Clock3,
  MapPin,
  X,
  ChevronRight,
} from "lucide-react";

// Kartu fitur — "Peta Desa" ditandai featured, mengisi slot besar di bento grid.
const MENU_UTAMA = [
  {
    href: "/geotagging",
    icon: MapIcon,
    label: "Peta Desa",
    desc: "Jelajahi lokasi rumah, fasilitas, dan UMKM secara interaktif",
    image: "/images/menu/peta-desa.jpg", // <- ganti path ini dengan foto asli
    featured: true,
  },
  {
    href: "/profil-desa",
    icon: HomeIcon,
    label: "Profil Desa",
    desc: "Sejarah, visi, dan misi desa",
    image: "/images/menu/profil-desa.jpg", // <- ganti path ini dengan foto asli
  },
  {
    href: "/struktur-organisasi",
    icon: Users,
    label: "Perangkat Desa",
    desc: "Kepala desa dan jajarannya",
    image: "/images/menu/perangkat-desa.jpg", // <- ganti path ini dengan foto asli
  },
  {
    href: "/berita",
    icon: Newspaper,
    label: "Berita & Kegiatan",
    desc: "Kabar terbaru dari desa",
    image: "/images/menu/berita.jpg", // <- ganti path ini dengan foto asli
  },
  {
    href: "/fasilitas",
    icon: Building2,
    label: "Fasilitas Umum",
    desc: "Puskesmas, sekolah, tempat ibadah",
    image: "/images/menu/fasilitas.jpg", // <- ganti path ini dengan foto asli
  },
  {
    href: "/data-kependudukan",
    icon: BarChart3,
    label: "Data Penduduk",
    desc: "Statistik warga desa",
  },
  {
    href: "/keuangan",
    icon: Wallet,
    label: "Keuangan Desa",
    desc: "Anggaran dan penggunaannya",
  },
  {
    href: "/umkm",
    icon: Store,
    label: "UMKM & Potensi Desa",
    desc: "Usaha warga di sekitar desa",
  },
  {
    href: "/galeri",
    icon: Camera,
    label: "Galeri Foto",
    desc: "Foto-foto kegiatan desa",
  },
];

// Kenapa desa kami — tiga alasan utama, dipasangkan dengan foto susun di sisi kiri.
const KEUNGGULAN = [
  {
    icon: Landmark,
    label: "Pelayanan Prima",
    desc: "Kantor desa siap membantu keperluan administrasi warga tanpa proses berbelit.",
  },
  {
    icon: Leaf,
    label: "Dekat dengan Alam",
    desc: "Dikelilingi sawah dan perbukitan yang menjaga suasana desa tetap asri sepanjang tahun.",
  },
  {
    icon: HeartHandshake,
    label: "Warga yang Ramah",
    desc: "Semangat gotong royong yang masih hidup dan menyambut hangat setiap tamu yang datang.",
  },
];

// Warna latar berselang-seling supaya grid menu tidak terasa monoton satu nada.
const CARD_BG = [
  "bg-desa-cream/60",
  "bg-white",
  "bg-white",
  "bg-desa-cream/60",
];

// Data 4 dusun — tiap dusun jadi "lingkaran terasering" yang bisa diklik.
const DUSUN_LIST = [
  {
    id: "pasuruan",
    nama: "Dusun Pasuruan",
    kadus: "Bapak ..... (isi nama)",
    telepon: "0812xxxxxxxx",
    size: 168,
  },
  {
    id: "pondok-mangir",
    nama: "Dusun Pondok Mangir",
    kadus: "Bapak ..... (isi nama)",
    telepon: "0812xxxxxxxx",
    size: 196,
  },
  {
    id: "bojongaren",
    nama: "Dusun Bojongaren",
    kadus: "Bapak ..... (isi nama)",
    telepon: "0812xxxxxxxx",
    size: 224,
  },
  {
    id: "pagergunung",
    nama: "Dusun Pagergunung",
    kadus: "Bapak ..... (isi nama)",
    telepon: "0812xxxxxxxx",
    size: 252,
  },
];

const FONT_DISPLAY = "'Plus Jakarta Sans', 'Inter', sans-serif";

// ---------- Sistem padding & container konsisten di seluruh halaman ----------
const SECTION_X = "px-5 sm:px-8 md:px-10 lg:px-12 xl:px-16 2xl:px-20";
const SECTION_Y = "py-16 sm:py-20 md:py-24 lg:py-28";
const CONTAINER = "max-w-7xl mx-auto";

// ---------- Util: parallax sederhana berbasis scroll position ----------
function useParallax(speed = 0.3) {
  const ref = useRef(null);
  useEffect(() => {
    function handleScroll() {
      if (!ref.current) return;
      const rect = ref.current.parentElement?.getBoundingClientRect();
      const offset = rect ? -rect.top * speed : window.scrollY * speed;
      ref.current.style.transform = `translate3d(0, ${offset}px, 0) scale(1.15)`;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [speed]);
  return ref;
}

export default function Home({ profil, kontakUtama, beritaTerbaru }) {
  const nomorTelepon = kontakUtama?.no_telepon;
  const heroImgRef = useParallax(0.25);
  const bannerImgRef = useParallax(0.25);

  const statistik = [
    { label: "Penduduk", value: profil?.jumlah_penduduk },
    { label: "Dusun", value: profil?.jumlah_dusun },
    { label: "Luas Wilayah", value: profil?.luas_wilayah },
    { label: "UMKM Aktif", value: profil?.jumlah_umkm },
  ].filter((s) => s.value);

  const featuredMenu = MENU_UTAMA.find((m) => m.featured);
  const restMenu = MENU_UTAMA.filter((m) => !m.featured);

  const { scrollYProgress } = useScroll();
  const [selectedDusun, setSelectedDusun] = useState(null);

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  return (
    <Layout title="Beranda" addTopSpacing={false}>
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
      </Head>

      <style jsx global>{`
        html,
        body {
          overflow-x: hidden;
          max-width: 100%;
        }
        @keyframes floatOrb {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-2%, 3%) scale(1.06);
          }
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-up {
          animation: fadeUp 0.6s ease-out both;
        }
        .ambient-orb {
          animation: floatOrb 14s ease-in-out infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        a:focus-visible,
        button:focus-visible {
          outline: 2px solid #d4af37;
          outline-offset: 3px;
          border-radius: 4px;
        }
        @media (prefers-reduced-motion: reduce) {
          .ambient-orb,
          .fade-up {
            animation: none !important;
          }
        }
      `}</style>

      {/* ================= HERO — gaya "clothesline", terang & playful ala landing page modern =================
          Headline besar dengan kata highlight, badge pill, CTA pijar,
          lalu deretan kartu foto yang "digantung" di atas garis melengkung. */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen overflow-hidden bg-white">
        {/* Ambient color blobs — lembut di pojok, ala referensi */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full bg-desa-gold/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -top-16 -right-16 w-[340px] h-[340px] rounded-full bg-desa-leaf/20 blur-3xl"
        />

        <div
          className={`relative z-10 ${CONTAINER} ${SECTION_X} pt-14 sm:pt-20 pb-6`}
        >
          {/* Badge pill */}
          <div className="flex justify-center mb-6 sm:mb-7">
            <span className="fade-up inline-flex items-center gap-2 text-[11px] sm:text-xs font-medium text-gray-600 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-full">
              {/* <Sparkles size={13} className="text-desa-gold" /> */}
              Situs Resmi Desa Pagergunung, Pangandaran, Jawa Barat
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{ fontFamily: FONT_DISPLAY }}
            className="fade-up text-center text-[30px] leading-[1.15] sm:text-5xl md:text-[56px] font-extrabold text-desa-green tracking-tight max-w-3xl mx-auto mb-4 sm:mb-5"
          >
            LAYANAN DESA UNTUK <span className="text-desa-leaf">WARGA</span>{" "}
            YANG MAJU
          </h1>

          {/* Subtitle */}
          <p className="fade-up text-center text-gray-500 text-sm sm:text-base max-w-md mx-auto mb-7 sm:mb-9">
            Dengan sistem digital terintegrasi untuk transparansi data dan
            kemudahan akses layanan warga
          </p>

          {/* CTA */}
          <div className="fade-up flex justify-center mb-14 sm:mb-20">
            <Link
              href="/geotagging"
              className="inline-flex items-center gap-2 bg-desa-leaf text-white font-semibold text-sm sm:text-base px-7 sm:px-8 py-3.5 sm:py-4 rounded-full hover:-translate-y-0.5 hover:shadow-xl hover:shadow-desa-leaf/30 transition-all duration-300"
            >
              <MapIcon size={18} /> Jelajahi Peta Desa
            </Link>
          </div>
        </div>

        {/* Clothesline — garis melengkung + kartu tergantung */}
        <div className="relative w-full pb-14 sm:pb-20">
          {/* Garis tali, hanya terlihat di desktop supaya tidak berantakan di mobile */}
          <svg
            aria-hidden="true"
            className="hidden sm:block absolute left-0 top-[38px] w-full h-16 pointer-events-none"
            viewBox="0 0 1400 80"
            preserveAspectRatio="none"
          >
            <path
              d="M0 20 Q 175 75, 350 55 T 700 15 T 1050 55 T 1400 20"
              stroke="#00000018"
              strokeWidth="2"
              fill="none"
            />
          </svg>

          {/* Mobile: scroll horizontal. Desktop: baris dengan offset naik-turun */}
          <div className="flex sm:hidden gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-5 pb-2">
            {MENU_UTAMA.slice(0, 5).map((item) => (
              <ClotheslineCard
                key={item.href}
                item={item}
                className="w-[68vw] shrink-0 snap-start"
              />
            ))}
          </div>

          <div
            className={`hidden sm:grid ${CONTAINER} ${SECTION_X} grid-cols-5 gap-5 lg:gap-6 items-start`}
          >
            {MENU_UTAMA.slice(0, 5).map((item, idx) => {
              const offsets = [56, 18, -22, 18, 40];
              return (
                <ClotheslineCard
                  key={item.href}
                  item={item}
                  style={{ marginTop: offsets[idx % offsets.length] }}
                />
              );
            })}
          </div>
        </div>

        {/* Statistik — baris tipis penutup hero */}
        {statistik.length > 0 && (
          <div className="relative border-t border-gray-100">
            <div
              className={`${CONTAINER} ${SECTION_X} py-7 sm:py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8`}
            >
              {statistik.map((s) => (
                <div key={s.label} className="text-center">
                  <p
                    style={{ fontFamily: FONT_DISPLAY }}
                    className="text-lg sm:text-xl font-semibold text-desa-green"
                  >
                    {s.value}
                  </p>
                  <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ================= TENTANG DESA — teks + statistik kiri, collage foto kanan ================= */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen bg-white">
        <div className={`${CONTAINER} ${SECTION_X} ${SECTION_Y}`}>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Teks & statistik */}
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.15em] font-bold text-desa-leaf mb-4">
                Tentang Desa
              </span>
              <h2
                style={{ fontFamily: FONT_DISPLAY }}
                className="text-3xl sm:text-4xl md:text-[44px] font-extrabold text-desa-green tracking-tight leading-[1.1] mb-5"
              >
                Desa yang Asri, Ramah, dan Penuh Potensi
              </h2>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                {profil?.deskripsi ||
                  `Desa ${profil?.nama_desa || "Pagergunung"} terletak di ${
                    profil?.kecamatan || "Pangandaran"
                  }, dikelilingi
                alam yang masih terjaga dan warga yang menjunjung tinggi
                gotong royong. Kami membuka pintu untuk siapa pun yang ingin
                mengenal, berkunjung, atau berkolaborasi dengan desa kami.`}
              </p>

              <Link
                href="/profil-desa"
                className="inline-flex items-center gap-2 bg-desa-green text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:-translate-y-0.5 hover:shadow-xl hover:shadow-desa-green/20 transition-all duration-300 w-fit"
              >
                Pelajari Lebih Lanjut <ArrowRight size={16} />
              </Link>
            </div>

            {/* Collage foto */}
            <div className="relative h-[360px] sm:h-[440px] md:h-[500px]">
              <div className="absolute top-0 left-0 w-[62%] h-[68%] rounded-3xl overflow-hidden shadow-xl shadow-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={placeholderImage("desa-story-utama", 700, 800)}
                  alt="Pemandangan utama desa"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-[52%] h-[54%] rounded-3xl overflow-hidden shadow-xl shadow-black/10 ring-4 ring-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={placeholderImage("desa-story-kecil", 600, 600)}
                  alt="Aktivitas warga desa"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-[38%] right-[2%] sm:right-[6%] w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-desa-green text-white flex flex-col items-center justify-center text-center p-3 shadow-xl shadow-desa-green/30">
                <Leaf size={18} className="mb-1 text-desa-gold" />
                <span className="text-[10px] sm:text-[11px] font-semibold leading-tight">
                  Jaga Tradisi
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4 DUSUN ================= */}
      <section>
        <div className={`${CONTAINER} ${SECTION_X} py-16 sm:py-20`}>
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.15em] font-bold text-desa-leaf mb-4">
              Wilayah Desa
            </span>
            <h2
              style={{ fontFamily: FONT_DISPLAY }}
              className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-desa-green tracking-tight leading-[1.1] mb-4"
            >
              4 Dusun di Desa Pagergunung
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Klik salah satu dusun untuk melihat Kepala Dusun dan nomor kontak
              yang bisa dihubungi.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {DUSUN_LIST.map((dusun) => (
              <button
                key={dusun.id}
                onClick={() => setSelectedDusun(dusun)}
                className="group text-left bg-white rounded-2xl shadow-sm ring-1 ring-black/5 hover:ring-black/10 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 p-5 sm:p-6"
              >
                <span className="w-11 h-11 rounded-xl bg-desa-green/8 text-desa-green flex items-center justify-center mb-4 group-hover:bg-desa-green group-hover:text-white transition-colors">
                  <MapPin size={20} strokeWidth={2} />
                </span>
                <p
                  style={{ fontFamily: FONT_DISPLAY }}
                  className="font-bold text-desa-green text-sm sm:text-base leading-snug mb-2"
                >
                  {dusun.nama}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-desa-leaf opacity-0 group-hover:opacity-100 transition-opacity">
                  Lihat Kadus <ChevronRight size={12} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= POPUP DUSUN ================= */}
      {selectedDusun && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedDusun(null)}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-desa-green/60 backdrop-blur-sm"
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7 sm:p-8 text-center fade-up"
          >
            <button
              onClick={() => setSelectedDusun(null)}
              aria-label="Tutup"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-desa-cream text-desa-green flex items-center justify-center hover:bg-desa-green hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <span className="mx-auto w-14 h-14 rounded-full bg-desa-green text-white flex items-center justify-center mb-4">
              <MapPin size={22} />
            </span>

            <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-desa-leaf mb-1">
              Kepala Dusun
            </p>
            <h3
              style={{ fontFamily: FONT_DISPLAY }}
              className="text-xl sm:text-2xl font-extrabold text-desa-green mb-1"
            >
              {selectedDusun.nama}
            </h3>
            <p className="text-gray-600 text-sm mb-6">{selectedDusun.kadus}</p>

            <a
              href={`tel:${selectedDusun.telepon}`}
              className="inline-flex items-center gap-2 bg-desa-gold text-desa-green font-semibold text-sm px-6 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
            >
              <Phone size={16} />
              {selectedDusun.telepon}
            </a>
          </div>
        </div>
      )}

      {/* ================= KENAPA DESA KAMI — foto susun kiri, kartu fitur kanan ================= */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen bg-desa-cream">
        <div className={`${CONTAINER} ${SECTION_X} ${SECTION_Y}`}>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Foto susun */}
            <div>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5">
                <div className="rounded-2xl sm:rounded-3xl overflow-hidden h-40 sm:h-52 md:h-60 shadow-lg shadow-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={placeholderImage("desa-why-1", 500, 600)}
                    alt="Suasana tenang desa"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl sm:rounded-3xl overflow-hidden h-40 sm:h-52 md:h-60 mt-6 sm:mt-8 shadow-lg shadow-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={placeholderImage("desa-why-2", 500, 600)}
                    alt="Jalan desa yang asri"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <p
                    style={{ fontFamily: FONT_DISPLAY }}
                    className="font-bold text-desa-green text-sm sm:text-base mb-1"
                  >
                    Tenteram
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                    Suasana desa yang jauh dari hiruk-pikuk kota.
                  </p>
                </div>
                <div>
                  <p
                    style={{ fontFamily: FONT_DISPLAY }}
                    className="font-bold text-desa-green text-sm sm:text-base mb-1"
                  >
                    Guyub Rukun
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                    Kekeluargaan warga yang masih terjaga erat.
                  </p>
                </div>
              </div>
            </div>

            {/* Teks & kartu fitur */}
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.15em] font-bold text-desa-leaf mb-4">
                Kenapa Desa Kami
              </span>
              <h2
                style={{ fontFamily: FONT_DISPLAY }}
                className="text-3xl sm:text-4xl font-extrabold text-desa-green tracking-tight leading-[1.1] mb-8"
              >
                Desa yang Nyaman untuk Ditinggali dan Dikunjungi
              </h2>

              <div className="space-y-6">
                {KEUNGGULAN.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-4">
                      <span className="w-11 h-11 rounded-2xl bg-desa-green text-white flex items-center justify-center shrink-0">
                        <Icon size={20} />
                      </span>
                      <div>
                        <p className="font-bold text-desa-green text-sm sm:text-base mb-1">
                          {item.label}
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= POTENSI DESA ================= */}
      <section
        className="
    relative 
    left-1/2 
    -translate-x-1/2 
    w-screen 
    overflow-hidden
    bg-[#F6F3EA]
  "
      >
        {/* ================= HERO HEADING ================= */}
        <div
          className="
      relative
    w-full
    overflow-hidden
    min-h-[520px]
    flex
    items-center
    "
        >
          {/* Background Image */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop"
              alt=""
              style={{
                y: bgY,
              }}
              className="
          absolute inset-0
          h-[130%]
          w-full
          object-cover
          scale-110
          saturate-[0.25]
          brightness-95
          contrast-90
        "
            />

            {/* Overlay Beige */}
            <div
              className="
          absolute inset-0
          bg-[#F6F3EA]/55
          backdrop-blur-[2px]
        "
            />

            {/* Gradient Atas */}
            <div
              className="
          absolute inset-x-0 top-0
          h-52
          bg-gradient-to-b
          from-[#F6F3EA]
          via-[#F6F3EA]/80
          to-transparent
        "
            />

            {/* Gradient Bawah */}
            <div
              className="
          absolute inset-x-0 bottom-0
          h-72
          bg-gradient-to-t
          from-[#F6F3EA]
          via-[#F6F3EA]/90
          to-transparent
        "
            />

            {/* Ambient Blur */}
            <div
              className="
          absolute
          -left-40
          top-40
          w-[450px]
          h-[450px]
          rounded-full
          bg-[#F6F3EA]
          blur-[150px]
        "
            />

            <div
              className="
          absolute
          -right-40
          bottom-20
          w-[450px]
          h-[450px]
          rounded-full
          bg-[#F6F3EA]
          blur-[150px]
        "
            />
          </div>

          {/* Heading Content */}
          <div
            className={`
        ${CONTAINER}
        ${SECTION_X}
       relative
       z-10
       py-20
      `}
          >
            <div className="max-w-3xl mx-auto text-center">
              <span
                className="
            inline-flex items-center
            rounded-full
            border border-desa-green/10
            bg-white/70
            backdrop-blur-md
            px-4 py-1
            text-xs
            font-semibold
            uppercase
            tracking-[0.18em]
            text-desa-leaf
          "
              >
                Potensi Desa
              </span>

              <h2
                style={{ fontFamily: FONT_DISPLAY }}
                className="
            mt-5
            text-3xl
            sm:text-5xl
            font-extrabold
            text-desa-green
          "
              >
                Kekayaan Alam
                <br />
                Desa Pagergunung
              </h2>

              <p
                className="
            mt-5
            text-gray-600
            leading-relaxed
          "
              >
                Potensi alam yang menjadi penggerak ekonomi masyarakat mulai
                dari perkebunan kelapa, kopi, cengkeh hingga industri pengolahan
                koprah.
              </p>
            </div>
          </div>
        </div>

        {/* ================= LIST POTENSI ================= */}

        <div
          className={`
    ${CONTAINER}
    ${SECTION_X}
    pt-16
    pb-32
  `}
        >
          <div className="space-y-16">
            {[
              {
                title: "Kelapa",
                image: "/images/kelapa.jpg",
                number: "10K+",
                desc: "Komoditas utama desa yang dipasarkan sebagai kelapa kupasan, kelapa butiran hingga diolah menjadi koprah.",
              },
              {
                title: "Kopi",
                image: "/images/kopi.jpeg",
                number: "5 Ton",
                desc: "Perkebunan kopi berkembang menjadi salah satu komoditas bernilai ekonomi tinggi.",
              },
              {
                title: "Cengkeh",
                image: "/images/potensi/cengkeh.webp",
                number: "300 Kg",
                desc: "Hasil perkebunan cengkeh menjadi pendukung pendapatan masyarakat pada musim panen.",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`
          grid
          lg:grid-cols-2
          gap-10
          items-center
          pb-16
          border-b
          border-desa-green/10
          last:border-none
          ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}
        `}
              >
                {/* Image */}
                <div className="overflow-hidden rounded-[24px]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="
              h-[280px]
              sm:h-[350px]
              w-full
              object-cover
              transition
              duration-700
              hover:scale-105
            "
                  />
                </div>

                {/* Text */}
                <div>
                  <p
                    className="
              uppercase
              tracking-[0.25em]
              text-desa-gold
              text-xs
              font-semibold
              mb-3
            "
                  >
                    Potensi Unggulan
                  </p>

                  <h3
                    style={{ fontFamily: FONT_DISPLAY }}
                    className="
              text-3xl
              sm:text-4xl
              font-extrabold
              text-desa-green
            "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
              mt-4
              text-gray-600
              leading-7
              max-w-md
            "
                  >
                    {item.desc}
                  </p>

                  <div className="mt-6">
                    <span
                      style={{ fontFamily: FONT_DISPLAY }}
                      className="
                text-4xl
                font-black
                text-desa-gold
              "
                    >
                      {item.number}
                    </span>

                    <span
                      className="
              ml-3
              text-sm
              text-gray-500
            "
                    >
                      Produksi
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BERITA TERBARU ================= */}
      <section
        className={`relative left-1/2 -translate-x-1/2 w-screen ${SECTION_Y} overflow-hidden`}
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/news-bg.webp')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/95 to-desa-cream" />

        <div className="relative">
          {/* Heading */}
          <div
            className={`${CONTAINER} ${SECTION_X} flex items-end justify-between mb-10`}
          >
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-bold text-desa-leaf mb-3">
                Kabar Desa
              </span>

              <h2
                style={{ fontFamily: FONT_DISPLAY }}
                className="text-3xl sm:text-4xl font-extrabold text-desa-green"
              >
                Berita & Kegiatan Terbaru
              </h2>

              <p className="text-gray-500 mt-2 max-w-lg">
                Ikuti perkembangan kegiatan, informasi, dan berbagai program
                terbaru Pemerintah Desa Pagergunung.
              </p>
            </div>

            <Link
              href="/berita"
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-desa-green/20 px-5 py-2 text-sm font-semibold text-desa-green hover:bg-desa-green hover:text-white transition"
            >
              Lihat Semua
              <ArrowRight size={16} />
            </Link>
          </div>

          {beritaTerbaru?.length ? (
            <div
              className={`${CONTAINER} ${SECTION_X} grid lg:grid-cols-12 gap-6`}
            >
              {/* Featured */}
              <Link
                href={`/berita/${beritaTerbaru[0].slug}`}
                className="group relative lg:col-span-7 rounded-[30px] overflow-hidden min-h-[460px]"
              >
                <img
                  src={
                    beritaTerbaru[0].gambar_url ||
                    "/images/news-placeholder.webp"
                  }
                  alt={beritaTerbaru[0].judul}
                  className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                <div className="absolute top-6 left-6">
                  <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/15 px-4 py-2 text-xs text-white font-semibold">
                    {beritaTerbaru[0].kategori}
                  </span>
                </div>

                <div className="absolute bottom-0 p-8 text-white">
                  <h3
                    style={{ fontFamily: FONT_DISPLAY }}
                    className="text-3xl font-bold leading-tight max-w-xl"
                  >
                    {beritaTerbaru[0].judul}
                  </h3>

                  <p className="mt-4 text-white/80 leading-relaxed max-w-lg">
                    {beritaTerbaru[0].ringkasan}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 font-semibold">
                    Baca Selengkapnya
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>

              {/* Side News */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                {beritaTerbaru.slice(1, 4).map((b) => (
                  <Link
                    key={b.id}
                    href={`/berita/${b.slug}`}
                    className="group rounded-3xl bg-white/75 backdrop-blur-md border border-white shadow-sm hover:shadow-xl transition-all p-5 flex gap-5"
                  >
                    <img
                      src={b.gambar_url || "/images/news-placeholder.webp"}
                      alt={b.judul}
                      className="w-32 h-28 rounded-2xl object-cover shrink-0"
                    />

                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-xs uppercase tracking-widest text-desa-leaf font-bold">
                          {b.kategori}
                        </span>

                        <h3
                          className="font-bold text-desa-green text-lg mt-2 line-clamp-2 group-hover:text-desa-leaf transition"
                          style={{ fontFamily: FONT_DISPLAY }}
                        >
                          {b.judul}
                        </h3>

                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {b.ringkasan}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-desa-green mt-4 group-hover:gap-3 transition-all">
                        Baca
                        <ArrowRight size={15} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className={`text-gray-500 ${CONTAINER} ${SECTION_X}`}>
              Belum ada berita yang dipublikasikan.
            </p>
          )}
        </div>
      </section>

      {/* ================= CTA — pita penutup sebelum footer ================= */}
      {/* ================= CTA ================= */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/kantor-desa.webp')",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-desa-green/95 via-desa-green/85 to-desa-green/75" />

        <div
          className={`${CONTAINER} ${SECTION_X} relative z-10 py-16 sm:py-20`}
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-semibold uppercase tracking-wider text-desa-gold mb-6">
              <Landmark size={14} />
              Pemerintah Desa Pagergunung
            </span>

            <h2
              style={{ fontFamily: FONT_DISPLAY }}
              className="text-3xl sm:text-5xl font-extrabold text-white leading-tight"
            >
              Kami siap melayani
              <br />
              masyarakat dengan sepenuh hati.
            </h2>

            <p className="mt-5 text-white/75 text-base sm:text-lg max-w-xl leading-relaxed">
              Dapatkan informasi desa, layanan administrasi, maupun berbagai
              kebutuhan masyarakat secara cepat dan mudah.
            </p>

            {/* Info */}
            <div className="flex flex-wrap gap-5 mt-7 text-sm text-white/70">
              <span className="inline-flex items-center gap-2">
                <Clock3 size={16} />
                Senin – Jumat • 08.00 – 15.00
              </span>

              <span className="inline-flex items-center gap-2">
                <MapPin size={16} />
                Pagergunung, Pangandaran
              </span>
            </div>

            {/* Button */}
            <div className="flex flex-wrap gap-3 mt-9">
              {nomorTelepon && (
                <a
                  href={`tel:${nomorTelepon}`}
                  className="inline-flex items-center gap-2 rounded-full bg-desa-gold px-7 py-3.5 text-sm font-semibold text-desa-green hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Phone size={16} />
                  Hubungi Kantor Desa
                </a>
              )}

              <Link
                href="/kontak"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/15 transition-all duration-300"
              >
                Lihat Lokasi
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// Kartu hero bergaya "jepitan baju" — dipakai di clothesline pada section HERO.
// Warna jepitan berselang-seling supaya tiap kartu terasa punya identitas sendiri.
const PIN_COLORS = [
  "bg-desa-leaf",
  "bg-desa-gold",
  "bg-desa-green",
  "bg-desa-leaf",
  "bg-desa-gold",
];

function ClotheslineCard({ item, className = "", style }) {
  const Icon = item.icon;
  const pinColor = PIN_COLORS[MENU_UTAMA.indexOf(item) % PIN_COLORS.length];

  return (
    <Link
      href={item.href}
      style={style}
      className={`group relative block rounded-2xl bg-white shadow-md ring-1 ring-black/5 overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Jepitan */}
      <span
        aria-hidden="true"
        className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-sm rotate-45 ${pinColor} shadow-sm z-10`}
      />
      <div className="h-24 sm:h-28 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            item.image || placeholderImage(`clothesline-${item.href}`, 400, 300)
          }
          alt={item.label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon size={13} className="text-desa-leaf shrink-0" />
          <p className="font-bold text-desa-green text-xs sm:text-sm leading-snug">
            {item.label}
          </p>
        </div>
        <p className="hidden sm:block text-[11px] text-gray-400 leading-relaxed line-clamp-1">
          {item.desc}
        </p>
      </div>
    </Link>
  );
}

// Kartu berita — dipisah agar bisa dipakai ulang di layout scroll (mobile)
// maupun layout grid (desktop) tanpa duplikasi markup.
function BeritaCard({ b, i, className = "" }) {
  return (
    <Link
      href={`/berita/${b.slug}`}
      className={`group flex flex-col rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${className}`}
    >
      <div className="relative h-44 sm:h-48 overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            b.gambar_url || placeholderImage(`berita-${b.slug || i}`, 500, 400)
          }
          alt={b.judul}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 inline-block text-[10px] sm:text-xs uppercase tracking-wide font-bold bg-desa-gold/95 text-desa-green px-2.5 py-1 rounded-full">
          {b.kategori}
        </span>
      </div>
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <h3
          style={{ fontFamily: FONT_DISPLAY }}
          className="font-bold text-base sm:text-lg text-desa-green mb-1.5 leading-snug line-clamp-2"
        >
          {b.judul}
        </h3>
        <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-4">
          {b.ringkasan}
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-desa-leaf group-hover:gap-2.5 transition-all">
          Baca selengkapnya <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

export async function getServerSideProps() {
  const [{ data: profil }, { data: kontak }, { data: beritaTerbaru }] =
    await Promise.all([
      supabase.from("profil_desa").select("*").eq("id", 1).single(),
      supabase.from("kontak_penting").select("*").order("urutan").limit(1),
      supabase
        .from("berita")
        .select("id, judul, slug, ringkasan, gambar_url, kategori")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

  return {
    props: {
      profil: profil || null,
      kontakUtama: kontak?.[0] || null,
      beritaTerbaru: beritaTerbaru || [],
    },
  };
}
