import { useState } from "react";
import Image from "next/image";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabaseClient";
import {
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
  ArrowLeft,
  X,
} from "lucide-react";

const DEFAULT_PROFIL = {
  nama_desa: "Pagergunung",
  kecamatan: "Pangandaran",
  kabupaten: "Pangandaran",
  provinsi: "Jawa Barat",
  luas_wilayah: "17,00 Ha (0,17 km²)",
  jumlah_dusun: "4",
  jumlah_kk: "1.061",
  jumlah_penduduk: "2.643",
  nama_kades: "Pak Sahili",
  foto_kantor: "/images/tulisan-kandes.webp",
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

// Sistem padding & container konsisten — sama dengan halaman lain.
const CONTAINER = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
const SECTION_Y = "py-12 sm:py-16 lg:py-20";

// Header seksi standar: eyebrow + judul + garis aksen tengah — pola umum
// dipakai di hampir semua website resmi pemerintah desa.
function SectionHeading({ eyebrow, title, center = true }) {
  return (
    <div className={center ? "text-center mb-10 sm:mb-12" : "mb-10 sm:mb-12"}>
      {eyebrow && (
        <p className="uppercase tracking-[0.15em] text-xs sm:text-sm font-semibold text-desa-gold mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-desa-green">
        {title}
      </h2>
      <div
        className={`h-1 w-14 bg-desa-gold rounded-full mt-4 ${
          center ? "mx-auto" : ""
        }`}
      />
    </div>
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
    luas_wilayah: profil?.luas_wilayah || DEFAULT_PROFIL.luas_wilayah,
    jumlah_dusun: profil?.jumlah_dusun || DEFAULT_PROFIL.jumlah_dusun,
    jumlah_kk: profil?.jumlah_kk || DEFAULT_PROFIL.jumlah_kk,
    jumlah_penduduk: profil?.jumlah_penduduk || DEFAULT_PROFIL.jumlah_penduduk,
    nama_kades: profil?.nama_kades || DEFAULT_PROFIL.nama_kades,
    foto_kantor: profil?.foto_kantor || DEFAULT_PROFIL.foto_kantor,
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
    <Layout title="Profil Desa" addTopSpacing={false}>
      {/* ================= HERO — standar: foto full-bleed, teks rata tengah ================= */}
      <div className="relative left-1/2 -translate-x-1/2 w-screen h-[40vh] min-h-[320px] sm:h-[46vh] sm:min-h-[380px] lg:h-[52vh] lg:min-h-[440px] lg:max-h-[520px]">
        <div className="absolute inset-0">
          {data.foto_kantor ? (
            <Image
              src={data.foto_kantor}
              alt={`Kantor Desa ${data.nama_desa}`}
              fill
              priority
              quality={90}
              className="object-cover object-center"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-desa-green" />
          )}
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div
          className={`relative h-full flex flex-col items-center justify-center text-center text-white ${CONTAINER}`}
        >
          <p className="uppercase tracking-[0.2em] text-xs sm:text-sm text-white/70 mb-3">
            Profil Desa
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight">
            Desa {data.nama_desa}
          </h1>
          <p className="mt-3 text-white/85 text-sm sm:text-base">
            Kecamatan {data.kecamatan}, Kabupaten {data.kabupaten},{" "}
            {data.provinsi}
          </p>
        </div>
      </div>

      {/* ---------- STATISTIK — overlap pakai margin negatif, jadi tetap pas walau tinggi kotak berubah-ubah di mobile ---------- */}
      <div className="relative left-1/2 -translate-x-1/2 w-screen z-30">
        <div
          className={`${CONTAINER} relative -mt-14 sm:-mt-16 lg:-mt-16 pb-10 sm:pb-12`}
        >
          <div className="w-full sm:w-[88%] max-w-6xl mx-auto rounded-[2.5rem] sm:rounded-[3rem] border border-black/5 bg-white shadow-xl px-6 sm:px-12 lg:px-16 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-0 sm:divide-x sm:divide-black/10">
              {STATS(data).map(({ icon: Icon, label, value }, i) => (
                <div
                  key={label}
                  className={`flex items-center gap-4 sm:flex-1 min-w-0 ${
                    i === 0 ? "" : "sm:pl-8 lg:pl-10"
                  } ${i !== STATS(data).length - 1 ? "sm:pr-2" : ""}`}
                >
                  <div className="w-11 h-11 rounded-full bg-desa-green/10 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-desa-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-sm sm:text-base font-bold text-desa-green uppercase tracking-wide leading-tight">
                      {label}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5 break-words sm:truncate">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= VISI & MISI ================= */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen bg-[#F7F7F5]">
        <div className={`${CONTAINER} ${SECTION_Y}`}>
          <SectionHeading eyebrow="Arah Pembangunan Desa" title="Visi & Misi" />

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
            {/* Visi */}
            <div className="bg-white rounded-xl border border-black/5 shadow-sm p-6 sm:p-8">
              <h3 className="font-display font-semibold text-desa-green text-lg mb-4">
                Visi
              </h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                &ldquo;{data.visi}&rdquo;
              </p>

              <div className="mt-6 pt-6 border-t border-black/5 flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-desa-green/10 shrink-0">
                  {data.foto_kades ? (
                    <Image
                      src={data.foto_kades}
                      alt={data.nama_kades}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-desa-green/40 text-sm font-semibold">
                      {data.nama_kades?.[0] ?? "K"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-desa-green">
                    {data.nama_kades}
                  </p>
                  <p className="text-xs text-gray-500">
                    Kepala Desa {data.nama_desa}
                  </p>
                </div>
              </div>
            </div>

            {/* Misi */}
            <div className="bg-white rounded-xl border border-black/5 shadow-sm p-6 sm:p-8">
              <h3 className="font-display font-semibold text-desa-green text-lg mb-4">
                Misi
              </h3>
              <ol className="space-y-4">
                {misiList.map((m, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-desa-green/10 text-desa-green font-bold text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {m}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ================= KONTAK & PETA ================= */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen bg-white">
        <div className={`${CONTAINER} ${SECTION_Y}`}>
          <SectionHeading eyebrow="Kami Siap Membantu" title="Hubungi Kami" />

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Kiri — info kontak + CTA */}
            <div className="rounded-xl border border-black/5 shadow-sm p-6 sm:p-8">
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Datang langsung ke kantor desa pada jam pelayanan, atau hubungi
                kami melalui kontak di bawah ini.
              </p>

              <div className="space-y-4 mb-8 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin
                    size={18}
                    className="text-desa-gold mt-0.5 shrink-0"
                  />
                  <span className="text-gray-700 leading-snug">
                    {data.alamat_kantor}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-desa-gold mt-0.5 shrink-0" />
                  <span className="text-gray-700 leading-snug">
                    {data.jam_pelayanan}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-desa-gold mt-0.5 shrink-0" />
                  <span className="text-gray-700 leading-snug">
                    {data.telepon_kantor}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-desa-gold mt-0.5 shrink-0" />
                  <span className="text-gray-700 leading-snug break-all">
                    {data.email_kantor}
                  </span>
                </div>
              </div>

              {/* Flow: Hubungi -> Kades/Kadus -> pilih Dusun */}
              <div className="rounded-lg bg-desa-green/[0.04] border border-desa-green/10 p-4 sm:p-5">
                {contactStep === "idle" && (
                  <button
                    onClick={() => setContactStep("choose-role")}
                    className="w-full inline-flex items-center justify-center gap-2 bg-desa-green text-white font-semibold rounded-lg px-6 py-3.5 text-sm shadow-sm hover:bg-desa-green/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desa-green transition"
                  >
                    <MessageCircle size={16} />
                    Hubungi via WhatsApp
                  </button>
                )}

                {contactStep === "choose-role" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-desa-green">
                        Ingin menghubungi siapa?
                      </p>
                      <button
                        onClick={() => setContactStep("idle")}
                        aria-label="Tutup"
                        className="text-gray-400 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desa-green rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => openWhatsApp(data.whatsapp_kantor)}
                        className="flex flex-col items-center gap-2 bg-white border border-black/5 hover:border-desa-green/30 hover:bg-desa-green/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desa-green rounded-lg px-4 py-4 text-sm text-desa-green font-medium transition"
                      >
                        <UserRound size={20} className="text-desa-gold" />
                        Kepala Desa
                      </button>
                      <button
                        onClick={() => setContactStep("choose-dusun")}
                        className="flex flex-col items-center gap-2 bg-white border border-black/5 hover:border-desa-green/30 hover:bg-desa-green/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desa-green rounded-lg px-4 py-4 text-sm text-desa-green font-medium transition"
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
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-desa-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desa-green rounded"
                      >
                        <ArrowLeft size={12} />
                        Kembali
                      </button>
                      <button
                        onClick={() => setContactStep("idle")}
                        aria-label="Tutup"
                        className="text-gray-400 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desa-green rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-desa-green mb-3">
                      Pilih dusun:
                    </p>
                    <div className="space-y-2">
                      {data.dusun_list.map((dusun) => (
                        <button
                          key={dusun.nama}
                          onClick={() => openWhatsApp(dusun.whatsapp)}
                          className="w-full flex items-center justify-between bg-white border border-black/5 hover:border-desa-green/30 hover:bg-desa-green/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desa-green rounded-lg px-4 py-3 text-sm transition"
                        >
                          <span className="text-left">
                            <span className="block font-medium text-desa-green">
                              {dusun.nama}
                            </span>
                            <span className="block text-gray-500 text-xs">
                              {dusun.nama_kadus}
                            </span>
                          </span>
                          <ChevronRight
                            size={16}
                            className="text-gray-400 shrink-0"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Kanan — peta */}
            <div className="relative min-h-[280px] lg:min-h-full rounded-xl overflow-hidden border border-black/5 shadow-sm">
              <iframe
                src={mapsEmbedUrl}
                title={`Lokasi Desa ${data.nama_desa}`}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
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
