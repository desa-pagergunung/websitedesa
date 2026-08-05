import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabaseClient";
import { MapPin, ImageIcon, Sparkles } from "lucide-react";

// Data contoh — dipakai sebagai fallback kalau tabel `fasilitas` di Supabase masih kosong.
// Hapus/ganti kapan saja setelah data asli tersedia.
const DUMMY_DATA = [
  {
    id: "dummy-1",
    nama: "Ambulans Desa",
    kategori: "kesehatan",
    deskripsi:
      "Layanan antar-jemput darurat 24 jam untuk warga yang membutuhkan rujukan ke fasilitas kesehatan terdekat.",
    alamat: "Kantor Desa Pagergunung",
    foto_url: "https://picsum.photos/seed/ambulans-desa/600/450",
  },
  {
    id: "dummy-2",
    nama: "Masjid Al-Ikhlas",
    kategori: "ibadah",
    deskripsi:
      "Masjid utama desa yang menjadi pusat kegiatan ibadah dan sosial keagamaan warga.",
    alamat: "Dusun 1, Desa Pagergunung",
    foto_url: "https://picsum.photos/seed/masjid-al-ikhlas/600/450",
  },
  {
    id: "dummy-3",
    nama: "SD Negeri 1 Pagergunung",
    kategori: "pendidikan",
    deskripsi:
      "Sekolah dasar negeri yang melayani pendidikan anak-anak di lingkungan desa.",
    alamat: "Dusun 2, Desa Pagergunung",
    foto_url: "https://picsum.photos/seed/sdn-1-pagergunung/600/450",
  },
  {
    id: "dummy-4",
    nama: "Puskesmas Pembantu",
    kategori: "kesehatan",
    deskripsi:
      "Fasilitas kesehatan tingkat pertama untuk pemeriksaan umum, imunisasi, dan pelayanan ibu & anak.",
    alamat: "Dusun 1, Desa Pagergunung",
    foto_url: "https://picsum.photos/seed/puskesmas-pembantu/600/450",
  },
  {
    id: "dummy-5",
    nama: "Balai Desa Pagergunung",
    kategori: "pemerintahan",
    deskripsi:
      "Pusat pelayanan administrasi warga sekaligus tempat musyawarah dan kegiatan pemerintahan desa.",
    alamat: "Jl. Raya Pagergunung",
    foto_url: "https://picsum.photos/seed/balai-desa/600/450",
  },
  {
    id: "dummy-6",
    nama: "Lapangan Olahraga Desa",
    kategori: "olahraga",
    deskripsi:
      "Lapangan serbaguna untuk sepak bola, voli, dan kegiatan olahraga warga setiap akhir pekan.",
    alamat: "Dusun 3, Desa Pagergunung",
    foto_url: "https://picsum.photos/seed/lapangan-desa/600/450",
  },
  {
    id: "dummy-7",
    nama: "Posyandu Melati",
    kategori: "kesehatan",
    deskripsi:
      "Layanan rutin bulanan untuk pemantauan tumbuh kembang balita dan kesehatan ibu hamil.",
    alamat: "Dusun 4, Desa Pagergunung",
    foto_url: "https://picsum.photos/seed/posyandu-melati/600/450",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

const ACCENTS = ["bg-desa-green", "bg-desa-gold", "bg-desa-leaf"];

function FacilityImage({ src, alt, className }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }
  return (
    <div
      className={`${className} bg-desa-green/5 flex items-center justify-center`}
    >
      <ImageIcon size={28} className="text-desa-green/20" />
    </div>
  );
}

function FloatingCard({ f, index }) {
  const [ref, inView] = useInView();
  const fromLeft = index % 2 === 0;
  const rotate = fromLeft ? "-rotate-1" : "rotate-1";
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <div
      ref={ref}
      className={`w-full sm:w-[85%] md:w-[70%] ${
        fromLeft ? "sm:mr-auto sm:pr-6" : "sm:ml-auto sm:pl-6"
      } mb-10 sm:mb-16 transition-all duration-700 ease-out ${
        inView
          ? "opacity-100 translate-x-0"
          : `opacity-0 ${fromLeft ? "-translate-x-20" : "translate-x-20"}`
      }`}
      style={{ transitionDelay: `${(index % 4) * 90}ms` }}
    >
      <div
        className="animate-float"
        style={{ animationDelay: `${(index % 5) * 0.4}s` }}
      >
        <div
          className={`group bg-white rounded-[28px] shadow-md hover:shadow-xl border border-black/5 overflow-hidden ${rotate} hover:rotate-0 transition-all duration-300`}
        >
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-2/5 relative">
              <FacilityImage
                src={f.foto_url}
                alt={f.nama}
                className="w-full h-44 sm:h-full object-cover"
              />
              <span
                className={`absolute top-3 left-3 ${accent} text-white text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full`}
              >
                {f.kategori || "Fasilitas"}
              </span>
            </div>
            <div className="sm:w-3/5 p-5 sm:p-6 flex flex-col justify-center">
              <h3 className="font-display text-lg sm:text-xl font-semibold text-desa-green mb-1.5">
                {f.nama}
              </h3>
              {f.deskripsi && (
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {f.deskripsi}
                </p>
              )}
              {f.alamat && (
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                  <MapPin size={12} />
                  {f.alamat}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Fasilitas({ data }) {
  const items = data.length ? data : DUMMY_DATA;

  return (
    <Layout title="Fasilitas Umum">
      <div className="mb-12 text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-desa-gold">
          <Sparkles size={12} />
          Sarana &amp; Prasarana
        </span>
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-desa-green mt-2">
          Fasilitas Umum Desa
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {items.length} fasilitas tersedia untuk warga
        </p>
      </div>

      <div className="relative">
        <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-desa-green/10 to-transparent -translate-x-1/2 pointer-events-none" />
        {items.map((f, i) => (
          <FloatingCard key={f.id} f={f} index={i} />
        ))}
      </div>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </Layout>
  );
}

export async function getServerSideProps() {
  const { data } = await supabase
    .from("fasilitas")
    .select("*")
    .order("created_at", { ascending: false });
  return { props: { data: data || [] } };
}
