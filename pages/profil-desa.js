import { useState } from "react";
import Image from "next/image";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabaseClient";
import {
  Target,
  Quote,
  MapPin,
  Users,
  Home,
  Landmark,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  UserRound,
  ChevronRight,
  X,
} from "lucide-react";

const DEFAULT_PROFIL = {
  nama_desa: "Pagergunung",
  kecamatan: "Pangandaran",
  kabupaten: "Pangandaran",
  provinsi: "Jawa Barat",
  luas_wilayah: "—",
  jumlah_dusun: "4",
  jumlah_kk: "1.061",
  jumlah_penduduk: "2.643",
  nama_kades: "Pak Sahili",
  foto_kantor: null,
  foto_kades: null,
  visi: "TERWUJUDNYA IMAN DAN TAQWA PEMERINTAH DESA PAGERGUNUNG MENJADIKAN PELAYANAN MASYARAKAT YANG HAKIKI, SUBUR MAKMUR GEMAH RIPAH LOHJINAWI",
  misi: [
    "Mewujudkan pelayanan yang hakiki — reformasi birokrasi, peningkatan SDM perangkat desa, dan pengelolaan keuangan desa yang transparan, akuntabel, dan profesional.",
    "Meningkatkan dan mengembangkan ekonomi masyarakat berbasis potensi desa, termasuk pembinaan kelompok ekonomi produktif dan pengembangan BUMDes.",
    "Mewujudkan pengembangan infrastruktur dasar dan sarana prasarana kebutuhan dasar masyarakat.",
    "Mewujudkan pelestarian budaya Pagergunung yang tumbuh dan berkembang di masyarakat.",
    "Mewujudkan sumber daya manusia yang berkualitas, berbudaya, dan bermoral.",
    "Mewujudkan masyarakat yang mandiri melalui pemanfaatan SDM dan SDA desa.",
    "Mewujudkan kehidupan masyarakat yang aman, tentram, dan damai.",
  ].join("\n"),
  alamat_kantor:
    "Jl. Raya Pagergunung, Kec. Pangandaran, Kab. Pangandaran, Jawa Barat",
  telepon_kantor: "(0265) 000-0000",
  whatsapp_kantor: "6280000000000",
  email_kantor: "desapagergunung@pangandarankab.go.id",
  jam_pelayanan: "Senin – Jumat, 08.00 – 15.00 WIB",
  maps_url: "https://maps.google.com/?q=Desa+Pagergunung+Pangandaran",
  // TODO: ganti dengan data kontak kadus asli (misal dari tabel Supabase terpisah)
  dusun_list: [
    { nama: "Dusun 1", nama_kadus: "Kadus Dusun 1", whatsapp: "6280000000001" },
    { nama: "Dusun 2", nama_kadus: "Kadus Dusun 2", whatsapp: "6280000000002" },
    { nama: "Dusun 3", nama_kadus: "Kadus Dusun 3", whatsapp: "6280000000003" },
    { nama: "Dusun 4", nama_kadus: "Kadus Dusun 4", whatsapp: "6280000000004" },
  ],
};

const STATS = (data) => [
  { icon: Landmark, label: "Luas Wilayah", value: data.luas_wilayah },
  { icon: Home, label: "Jumlah Dusun", value: data.jumlah_dusun },
  { icon: Users, label: "Jumlah KK", value: data.jumlah_kk },
  { icon: MapPin, label: "Penduduk", value: data.jumlah_penduduk },
];

/** Faint topographic contour lines — the page's one signature motif. */
function ContourPattern({ className = "" }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      {[40, 75, 110, 145, 180, 215].map((r, i) => (
        <path
          key={r}
          d={`M -20 ${300 - r} C 80 ${260 - r}, 150 ${340 - r}, 240 ${
            260 - r
          } S 380 ${190 - r}, 440 ${240 - r}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity={0.5 - i * 0.06}
        />
      ))}
    </svg>
  );
}

export default function ProfilDesa({ profil }) {
  const data = {
    ...DEFAULT_PROFIL,
    ...profil,
    nama_desa: profil?.nama_desa || DEFAULT_PROFIL.nama_desa,
    kecamatan: profil?.kecamatan || DEFAULT_PROFIL.kecamatan,
    kabupaten: profil?.kabupaten || DEFAULT_PROFIL.kabupaten,
    provinsi: profil?.provinsi || DEFAULT_PROFIL.provinsi,
    visi: profil?.visi || DEFAULT_PROFIL.visi,
    misi: profil?.misi || DEFAULT_PROFIL.misi,
    alamat_kantor: profil?.alamat_kantor || DEFAULT_PROFIL.alamat_kantor,
    telepon_kantor: profil?.telepon_kantor || DEFAULT_PROFIL.telepon_kantor,
    whatsapp_kantor: profil?.whatsapp_kantor || DEFAULT_PROFIL.whatsapp_kantor,
    email_kantor: profil?.email_kantor || DEFAULT_PROFIL.email_kantor,
    jam_pelayanan: profil?.jam_pelayanan || DEFAULT_PROFIL.jam_pelayanan,
    maps_url: profil?.maps_url || DEFAULT_PROFIL.maps_url,
    dusun_list:
      profil?.dusun_list && profil.dusun_list.length
        ? profil.dusun_list
        : DEFAULT_PROFIL.dusun_list,
  };
  const misiList = (data.misi || "").split("\n").filter(Boolean);

  // embed URL untuk peta langsung tanpa tombol
  const mapsEmbedUrl = `${data.maps_url}${
    data.maps_url.includes("?") ? "&" : "?"
  }output=embed`;

  // step kontak: "idle" -> "choose-role" -> "choose-dusun"
  const [contactStep, setContactStep] = useState("idle");

  function openWhatsApp(number) {
    window.open(`https://wa.me/${number}`, "_blank", "noopener,noreferrer");
    setContactStep("idle");
  }

  return (
    <Layout title="Profil Desa">
      {/* ---------- HERO: Foto Kantor Desa full satu halaman ---------- */}
      <div className="relative w-full h-screen">
        <div className="absolute inset-0">
          {data.foto_kantor ? (
            <Image
              src={data.foto_kantor}
              alt={`Kantor Desa ${data.nama_desa}`}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-desa-green via-desa-leaf to-desa-green" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-white" />
          <ContourPattern className="absolute -top-6 right-0 w-72 h-56 text-white/20 pointer-events-none" />
        </div>

        {/* judul singkat di atas foto */}
        <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 text-white">
          <p className="uppercase tracking-[0.25em] text-xs sm:text-sm text-white/70 mb-3">
            Profil Desa
          </p>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-semibold max-w-3xl leading-tight">
            Desa {data.nama_desa}
          </h1>
          <p className="mt-3 text-white/80 text-sm sm:text-base">
            {data.kecamatan}, {data.kabupaten}, {data.provinsi}
          </p>
        </div>

        {/* kartu statistik nempel di bagian bawah foto */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg border border-black/5 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-black/5 max-w-5xl mx-auto">
            {STATS(data).map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="px-4 py-5 sm:px-6 sm:py-6 flex flex-col items-center text-center gap-1.5"
              >
                <Icon size={18} className="text-desa-gold" />
                <span className="font-display text-lg sm:text-xl font-semibold text-desa-green">
                  {value}
                </span>
                <span className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* spacer supaya konten berikutnya tidak ketutup kartu statistik */}
      <div className="h-16 sm:h-20" />

      {/* ---------- VISI & MISI ---------- */}
      <section className="relative bg-white border-b border-black/5 overflow-hidden mb-10 sm:mb-16">
        <ContourPattern className="absolute inset-0 w-full h-full text-desa-green/[0.05] pointer-events-none" />

        <div className="relative grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-black/5">
          {/* Kiri — Visi */}
          <div className="p-6 sm:p-10 lg:p-12 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Target size={20} className="text-desa-gold" />
              <h2 className="font-display font-semibold text-desa-green text-2xl sm:text-3xl">
                Visi
              </h2>
            </div>
            <div className="relative flex-1 flex items-center">
              <Quote
                className="absolute -top-2 -left-1 text-desa-gold/20"
                size={56}
              />
              <p className="relative z-10 font-display text-desa-green font-medium text-xl sm:text-2xl lg:text-3xl italic leading-snug pl-8">
                &ldquo;{data.visi}&rdquo;
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-desa-green/15 shrink-0">
                {data.foto_kades ? (
                  <Image
                    src={data.foto_kades}
                    alt={data.nama_kades}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-desa-green/40 text-sm font-semibold">
                    {data.nama_kades?.[0] ?? "K"}
                  </div>
                )}
              </div>
              <div>
                <p className="text-base font-semibold text-desa-green">
                  {data.nama_kades}
                </p>
                <p className="text-sm text-gray-400">
                  Visi Pembangunan Desa {data.nama_desa}
                </p>
              </div>
            </div>
          </div>

          {/* Kanan — Misi */}
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="flex items-center gap-2 mb-6">
              <Landmark size={20} className="text-desa-gold" />
              <h2 className="font-display font-semibold text-desa-green text-2xl sm:text-3xl">
                Misi
              </h2>
            </div>
            <div className="space-y-6">
              {misiList.map((m, i) => (
                <div key={i} className="flex gap-4">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-desa-green/10 text-desa-green font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                    {m}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA: KONTAK DESA (kiri: hubungi, kanan: peta langsung) ---------- */}
      <section className="relative overflow-hidden mb-10 sm:mb-16">
        <div className="grid lg:grid-cols-2">
          {/* Kiri — Info + flow kontak */}
          <div className="relative bg-gradient-to-br from-desa-green via-desa-leaf to-desa-green text-white p-6 py-10 sm:p-10 sm:py-14 lg:p-12 lg:py-16">
            <ContourPattern className="absolute inset-0 w-full h-full text-white/10 pointer-events-none" />

            <div className="relative">
              <p className="uppercase tracking-[0.25em] text-xs text-white/70 mb-3">
                Hubungi Kami
              </p>
              <h2 className="font-display text-2xl sm:text-4xl font-semibold mb-3">
                Butuh layanan atau informasi dari Desa {data.nama_desa}?
              </h2>
              <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-8">
                Datang langsung ke kantor desa, atau hubungi kami melalui kontak
                di bawah ini. Kami siap membantu keperluan administrasi dan
                pelayanan warga.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col gap-1.5">
                  <MapPin size={18} className="text-desa-gold" />
                  <span className="text-xs uppercase tracking-wide text-white/60">
                    Alamat
                  </span>
                  <span className="text-sm leading-snug">
                    {data.alamat_kantor}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col gap-1.5">
                  <Clock size={18} className="text-desa-gold" />
                  <span className="text-xs uppercase tracking-wide text-white/60">
                    Jam Pelayanan
                  </span>
                  <span className="text-sm leading-snug">
                    {data.jam_pelayanan}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col gap-1.5">
                  <Phone size={18} className="text-desa-gold" />
                  <span className="text-xs uppercase tracking-wide text-white/60">
                    Telepon
                  </span>
                  <span className="text-sm leading-snug">
                    {data.telepon_kantor}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col gap-1.5">
                  <Mail size={18} className="text-desa-gold" />
                  <span className="text-xs uppercase tracking-wide text-white/60">
                    Email
                  </span>
                  <span className="text-sm leading-snug break-all">
                    {data.email_kantor}
                  </span>
                </div>
              </div>

              {/* ---- Flow: Hubungi -> Kades/Kadus -> pilih Dusun ---- */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6">
                {contactStep === "idle" && (
                  <button
                    onClick={() => setContactStep("choose-role")}
                    className="w-full inline-flex items-center justify-center gap-2 bg-desa-gold text-desa-green font-semibold rounded-full px-6 py-3 text-sm hover:opacity-90 transition"
                  >
                    <MessageCircle size={16} />
                    Hubungi via WhatsApp
                  </button>
                )}

                {contactStep === "choose-role" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-white">
                        Ingin menghubungi siapa?
                      </p>
                      <button
                        onClick={() => setContactStep("idle")}
                        aria-label="Tutup"
                        className="text-white/60 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => openWhatsApp(data.whatsapp_kantor)}
                        className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-4 text-sm transition"
                      >
                        <UserRound size={20} className="text-desa-gold" />
                        Kepala Desa
                      </button>
                      <button
                        onClick={() => setContactStep("choose-dusun")}
                        className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-4 text-sm transition"
                      >
                        <Home size={20} className="text-desa-gold" />
                        Kepala Dusun
                      </button>
                    </div>
                  </div>
                )}

                {contactStep === "choose-dusun" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setContactStep("choose-role")}
                        className="text-xs text-white/60 hover:text-white"
                      >
                        &larr; Kembali
                      </button>
                      <button
                        onClick={() => setContactStep("idle")}
                        aria-label="Tutup"
                        className="text-white/60 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-white mb-3">
                      Pilih dusun:
                    </p>
                    <div className="space-y-2">
                      {data.dusun_list.map((dusun) => (
                        <button
                          key={dusun.nama}
                          onClick={() => openWhatsApp(dusun.whatsapp)}
                          className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 text-sm transition"
                        >
                          <span className="text-left">
                            <span className="block font-medium">
                              {dusun.nama}
                            </span>
                            <span className="block text-white/60 text-xs">
                              {dusun.nama_kadus}
                            </span>
                          </span>
                          <ChevronRight size={16} className="text-white/60" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kanan — Peta langsung, tanpa tombol */}
          <div className="relative min-h-[360px] lg:min-h-0">
            <iframe
              src={mapsEmbedUrl}
              title={`Lokasi Desa ${data.nama_desa}`}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getServerSideProps() {
  const { data: profil } = await supabase
    .from("profil_desa")
    .select("*")
    .eq("id", 1)
    .single();
  return { props: { profil: profil || null } };
}
