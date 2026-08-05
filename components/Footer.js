import {
  MapPin,
  Newspaper,
  Store,
  Phone,
  Mail,
  Landmark,
  Instagram,
  Facebook,
  ArrowUpRight,
} from "lucide-react";

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
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FAE184]/10 border border-[#FAE184]/30">
              <Landmark size={16} className="text-[#FAE184]" />
            </span>
            Desa Pagergunung
          </div>
          <p className="text-white/50 leading-relaxed flex items-start gap-2">
            <MapPin size={15} className="mt-0.5 shrink-0 text-[#FAE184]/70" />
            Kecamatan Pangandaran, Kabupaten Pangandaran, Jawa Barat.
          </p>

          <div className="flex items-center gap-3 mt-5">
            <a
              href="#"
              aria-label="Instagram Desa Pagergunung"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-[#FAE184] hover:border-[#FAE184]/40 transition-colors"
            >
              <Instagram size={14} />
            </a>
            <a
              href="#"
              aria-label="Facebook Desa Pagergunung"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-[#FAE184] hover:border-[#FAE184]/40 transition-colors"
            >
              <Facebook size={14} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#FAE184]/80 mb-4">
            Tautan Cepat
          </h3>
          <ul className="space-y-3 text-white/55">
            <li>
              <a
                href="/berita"
                className="group flex items-center gap-2 hover:text-white transition-colors"
              >
                <Newspaper
                  size={15}
                  className="text-white/30 group-hover:text-[#FAE184] transition-colors"
                />
                Berita &amp; Kegiatan
              </a>
            </li>
            <li>
              <a
                href="/umkm"
                className="group flex items-center gap-2 hover:text-white transition-colors"
              >
                <Store
                  size={15}
                  className="text-white/30 group-hover:text-[#FAE184] transition-colors"
                />
                UMKM &amp; Potensi Desa
              </a>
            </li>
            <li>
              <a
                href="/kontak"
                className="group flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone
                  size={15}
                  className="text-white/30 group-hover:text-[#FAE184] transition-colors"
                />
                Kontak Kantor Desa
              </a>
            </li>
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
              (0265) 000-000
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} className="text-white/30 shrink-0" />
              desapagergunung@mail.go.id
            </li>
          </ul>
        </div>

        {/* Credit / CTA card
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#FAE184]/80 mb-3">
            Website Ini Dibuat Oleh
          </h3>
          <p className="text-white/55 leading-relaxed">
            Mahasiswa KKN, sebagai bagian dari program kerja digitalisasi desa.
          </p>
          <a
            href="/tentang"
            className="inline-flex items-center gap-1 mt-3 text-[#FAE184] hover:text-[#E8C766] transition-colors"
          >
            Selengkapnya <ArrowUpRight size={14} />
          </a>
        </div> */}
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
