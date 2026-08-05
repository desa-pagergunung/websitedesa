import { Music2, ArrowUpRight } from "lucide-react";

const TIKTOK_USERNAME = "info.pagergunung";

export default function TiktokCTA({ variant = "banner" }) {
  const profileUrl = `https://www.tiktok.com/@${TIKTOK_USERNAME}`;

  if (variant === "card") {
    return (
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-black text-white p-6 sm:p-10">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#25F4EE]/10 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-[#FE2C55]/10 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <Music2 size={26} />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-white/60 mb-1">
              Ikuti Kami di TikTok
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-semibold mb-1">
              @{TIKTOK_USERNAME}
            </h2>
            <p className="text-sm text-white/70">
              Dokumentasi kegiatan, keseharian warga, dan info terkini Desa
              Pagergunung dalam bentuk video pendek.
            </p>
          </div>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 bg-white text-black font-semibold rounded-full px-6 py-3 text-sm hover:bg-white/90 transition shrink-0"
          >
            Follow TikTok
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    );
  }

  // variant === "banner" — versi ringkas untuk disisipkan di halaman lain
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-2xl bg-gradient-to-r from-black via-neutral-900 to-black text-white p-4 sm:p-5 hover:opacity-95 transition"
    >
      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
        <Music2 size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">
          Simak keseruan kegiatan desa di TikTok
        </p>
        <p className="text-xs text-white/60 truncate">
          @{TIKTOK_USERNAME} · video pendek seputar Desa Pagergunung
        </p>
      </div>
      <ArrowUpRight
        size={18}
        className="shrink-0 text-white/60 group-hover:text-white transition-colors"
      />
    </a>
  );
}
