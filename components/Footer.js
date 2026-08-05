import Image from "next/image";
import {
  MapPin,
  Newspaper,
  Store,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";

const tautanCepat = [
  { href: "/profil-desa", label: "Profil Desa" },
  { href: "/data-kependudukan", label: "Data Kependudukan" },
  { href: "/keuangan", label: "Keuangan Desa" },
  { href: "/berita", label: "Berita & Kegiatan" },
  { href: "/umkm", label: "Potensi alam desa" },
];

const layananAplikasi = [
  { href: "https://konsolidasi-apbdesa.kemendagri.go.id/", label: "Siskeudes" },
  { href: "https://coretaxdjp.pajak.go.id/", label: "Coretax" },
  { href: "https://spanint.kemenkeu.go.id/", label: "OM-SPAN" },
  { href: "https://sigampil.pangandarankab.go.id/", label: "Sigampil" },
];

function TikTokIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8.5a5.5 5.5 0 0 1-4-1.7v7.7a4.5 4.5 0 1 1-4-4.47" />
      <path d="M12 6.8V3h2.5a3.5 3.5 0 0 0 3.5 3.5" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative bg-[#0B140D] text-white overflow-hidden">
      {/* Signature: subtle contour-line motif referencing "Pagergunung" (mountain fence) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 800 300"
        fill="none"
      >
        <path
          d="M0 220 Q 200 140 400 200 T 800 160"
          stroke="#FAE184"
          strokeWidth="1"
        />
        <path
          d="M0 250 Q 200 180 400 230 T 800 190"
          stroke="#FAE184"
          strokeWidth="1"
        />
        <path
          d="M0 280 Q 200 220 400 260 T 800 220"
          stroke="#FAE184"
          strokeWidth="1"
        />
      </svg>

      {/* Top gradient divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#FAE184]/50 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5 font-semibold text-base mb-4">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white p-1.5 border border-[#FAE184]/30">
              <Image
                src="/logopangandaran.png"
                alt="Logo Desa Pagergunung"
                width={28}
                height={28}
                className="object-contain"
              />
            </span>
            <div className="leading-tight">
              <div>Desa Pagergunung</div>
              <div className="text-[11px] font-normal text-white/40">
                Pemerintah Desa
              </div>
            </div>
          </div>
          <p className="text-white/50 leading-relaxed flex items-start gap-2">
            <MapPin size={15} className="mt-0.5 shrink-0 text-[#FAE184]/70" />
            Kantor Desa Pagergunung, Kecamatan Pangandaran, Kabupaten
            Pangandaran, Jawa Barat.
          </p>

          <div className="flex items-center gap-3 mt-5">
            <a
              href="mailto:desa@pagergunung.id"
              aria-label="Email Desa Pagergunung"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-[#FAE184] hover:border-[#FAE184]/40 transition-colors"
            >
              <Mail size={14} />
            </a>
            <a
              href="https://www.tiktok.com/@info.pagergunung"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok Desa Pagergunung"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-[#FAE184] hover:border-[#FAE184]/40 transition-colors"
            >
              <TikTokIcon size={14} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#FAE184]/80 mb-4">
            Tautan Cepat
          </h3>
          <ul className="space-y-3 text-white/55">
            {tautanCepat.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Newspaper
                    size={15}
                    className="text-white/30 group-hover:text-[#FAE184] transition-colors shrink-0"
                  />
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/kontak"
                className="group flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone
                  size={15}
                  className="text-white/30 group-hover:text-[#FAE184] transition-colors shrink-0"
                />
                Kontak Kantor Desa
              </a>
            </li>
          </ul>
        </div>

        {/* Layanan / Aplikasi Keuangan */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#FAE184]/80 mb-4">
            Layanan
          </h3>
          <ul className="space-y-3 text-white/55">
            {layananAplikasi.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Store
                    size={15}
                    className="text-white/30 group-hover:text-[#FAE184] transition-colors shrink-0"
                  />
                  {item.label}
                  <ExternalLink
                    size={11}
                    className="text-white/20 group-hover:text-[#FAE184]/70 transition-colors"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Kontak */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#FAE184]/80 mb-4">
            Kontak
          </h3>
          <ul className="space-y-3 text-white/55">
            <li className="flex items-center gap-2">
              <Phone size={15} className="text-white/30 shrink-0" />
              0823-1698-4735 (Kades)
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} className="text-white/30 shrink-0" />
              desa@pagergunung.id
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={15} className="text-white/30 shrink-0 mt-0.5" />
              Kec. Pangandaran, Kab. Pangandaran, Jawa Barat 46396
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/35">
          <span>
            © {new Date().getFullYear()} Pemerintah Desa Pagergunung. Hak cipta
            dilindungi.
          </span>
          <span>
            Dibangun dengan dedikasi oleh Tim KKN-PPM UGM Selayang Pangandaran
          </span>
        </div>
      </div>
    </footer>
  );
}
