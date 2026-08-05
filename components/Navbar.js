import Link from "next/link";
import { useState, useRef } from "react";
import Image from "next/image";
import { Menu, X, Landmark, ChevronDown, Phone, Mail } from "lucide-react";

const menu = [
  { href: "/", label: "Beranda" },

  {
    label: "Profil",
    children: [
      { href: "/profil-desa", label: "Profil Desa" },
      { href: "/struktur-organisasi", label: "Struktur Organisasi" },
    ],
  },

  {
    label: "Informasi",
    children: [
      { href: "/berita", label: "Berita" },
      { href: "/fasilitas", label: "Fasilitas" },
      { href: "/galeri", label: "Galeri" },
    ],
  },

  {
    label: "Data Desa",
    children: [
      { href: "/data-kependudukan", label: "Kependudukan" },
      { href: "/keuangan", label: "Keuangan Desa" },
      { href: "/geotagging", label: "Peta Desa" },
    ],
  },

  { href: "/umkm", label: "Potensi Desa" },
  { href: "/kontak", label: "Kontak" },

  // Tambahkan ini
  {
    label: "Masuk",
    children: [
      { href: "/login", label: "Login Admin Web" }, // hapus external: true, ganti href
      {
        href: "https://sigampil.pangandarankab.go.id/",
        label: "Login Sigampil",
        external: true,
      },
      {
        href: "https://pagergunung.id",
        label: "Situs Resmi Desa Lainnya",
        external: true,
      },
    ],
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const closeTimer = useRef(null);

  const handleEnter = (label) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(label);
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  return (
    <header>
      {/* Government info bar */}
      <div className="bg-desa-green text-white text-xs">
        <div className="max-w-6xl mx-auto px-4 h-8 flex items-center justify-between">
          <span className="hidden sm:block tracking-wide">
            Pemerintah Desa Pagergunung &bull; Kecamatan Pangandaran &bull;
            Kabupaten Pangandaran
          </span>
          <div className="flex items-center gap-4 ml-auto sm:ml-0">
            <a
              href="tel:+62000000000"
              className="flex items-center gap-1 hover:opacity-80"
            >
              <Phone size={12} />
              <span className="hidden md:inline">(0265) 000-000</span>
            </a>
            <a
              href="mailto:desa@pagergunung.id"
              className="flex items-center gap-1 hover:opacity-80"
            >
              <Mail size={12} />
              <span className="hidden md:inline">desa@pagergunung.id</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-white/95 backdrop-blur-md border-b border-black/5 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold text-desa-green tracking-tight"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-desa-green/10">
              <Image
                src="/logopangandaran.png"
                alt="Logo Desa Pagergunung"
                width={40}
                height={40}
                className="object-contain"
              />
            </span>
            <div className="leading-tight">
              <div className="text-sm sm:text-base">Desa Pagergunung</div>
              <div className="hidden sm:block text-[11px] font-normal text-gray-500">
                Kec. Pangandaran, Kab. Pangandaran
              </div>
            </div>
          </Link>

          <button
            className="lg:hidden text-desa-green"
            onClick={() => setOpen(!open)}
            aria-label="Buka menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>

          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-gray-600">
            {menu.map((item) => {
              if (item.children) {
                const isActive = activeDropdown === item.label;
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => handleEnter(item.label)}
                    onMouseLeave={handleLeave}
                  >
                    <button
                      className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                        isActive
                          ? "text-desa-green bg-desa-green/5"
                          : "hover:text-desa-green hover:bg-desa-green/5"
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${
                          isActive ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isActive && (
                      <div className="absolute top-full left-0 pt-2 w-56">
                        <div className="bg-white rounded-lg shadow-lg border border-black/5 py-2 overflow-hidden">
                          {item.children.map((child) =>
                            child.external ? (
                              <a
                                key={child.href}
                                href={child.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-desa-green/5 hover:text-desa-green transition-colors"
                              >
                                {child.label}
                              </a>
                            ) : (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-desa-green/5 hover:text-desa-green transition-colors"
                              >
                                {child.label}
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-md hover:text-desa-green hover:bg-desa-green/5 transition-colors"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav className="lg:hidden flex flex-col bg-white px-4 pb-4 text-sm font-medium text-gray-600 border-t border-black/5">
            {menu.map((item) => {
              if (item.children) {
                const isExpanded = mobileExpanded === item.label;
                return (
                  <div
                    key={item.label}
                    className="border-b border-black/5 last:border-0"
                  >
                    <button
                      className="w-full flex items-center justify-between py-3"
                      onClick={() =>
                        setMobileExpanded(isExpanded ? null : item.label)
                      }
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="pl-3 pb-2 flex flex-col gap-1">
                        {item.children.map((child) =>
                          child.external ? (
                            <a
                              key={child.href}
                              href={child.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2 text-gray-500 hover:text-desa-green transition-colors"
                              onClick={() => setOpen(false)}
                            >
                              {child.label}
                            </a>
                          ) : (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="py-2 text-gray-500 hover:text-desa-green transition-colors"
                              onClick={() => setOpen(false)}
                            >
                              {child.label}
                            </Link>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-3 border-b border-black/5 last:border-0 hover:text-desa-green transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
