import { useState } from "react";
import Layout from "../../components/Layout";
import TikTokCTA from "../../components/TikTokCTA";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Link2,
  Check,
  ImageIcon,
} from "lucide-react";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function estimateReadingTime(text) {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default function BeritaDetail({ berita, related }) {
  const [copied, setCopied] = useState(false);

  if (!berita) {
    return (
      <Layout title="Berita Tidak Ditemukan">
        <div className="max-w-lg mx-auto text-center py-20 pb-16 sm:pb-24">
          <div className="w-14 h-14 mx-auto rounded-full bg-desa-green/5 flex items-center justify-center mb-4">
            <ImageIcon size={22} className="text-desa-green/30" />
          </div>
          <h1 className="text-lg font-semibold text-desa-green mb-2">
            Berita tidak ditemukan
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Berita yang kamu cari mungkin sudah dihapus atau belum
            dipublikasikan.
          </p>
          <Link
            href="/berita"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-desa-green hover:underline"
          >
            <ArrowLeft size={15} />
            Kembali ke Berita
          </Link>
        </div>
      </Layout>
    );
  }

  const readingTime = estimateReadingTime(berita.konten);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${berita.judul} - ${shareUrl}`
  )}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Layout title={berita.judul}>
      {/* pb ekstra di bawah supaya halaman tidak "mepet" ke footer/navigasi bawah */}
      <div className="pb-16 sm:pb-24">
        <article className="max-w-3xl mx-auto">
          {/* ---------- Breadcrumb ---------- */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-desa-green transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link
              href="/berita"
              className="hover:text-desa-green transition-colors"
            >
              Berita
            </Link>
            {berita.kategori && (
              <>
                <span>/</span>
                <span className="text-gray-500 capitalize">
                  {berita.kategori}
                </span>
              </>
            )}
          </nav>

          {/* ---------- Header ---------- */}
          {berita.kategori && (
            <span className="inline-block text-xs uppercase text-desa-gold font-semibold mb-2">
              {berita.kategori}
            </span>
          )}
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-desa-green leading-tight mb-4">
            {berita.judul}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500 pb-5 mb-6 border-b border-black/5">
            {berita.penulis && (
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {berita.penulis}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDate(berita.created_at)}
            </span>
            <span className="text-gray-400">·</span>
            <span>{readingTime} menit baca</span>
          </div>

          {/* ---------- Gambar sampul ---------- */}
          {berita.gambar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={berita.gambar_url}
              alt={berita.judul}
              className="w-full rounded-2xl mb-8 object-cover max-h-[28rem]"
            />
          )}

          {/* ---------- Konten ---------- */}
          <div className="prose prose-sm sm:prose-base max-w-none whitespace-pre-line text-gray-800 leading-relaxed">
            {berita.konten}
          </div>

          {/* ---------- Bagikan ---------- */}
          <div className="flex items-center gap-3 mt-10 pt-6 border-t border-black/5">
            <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
              <Share2 size={14} />
              Bagikan:
            </span>
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-desa-green/40 hover:text-desa-green transition-colors"
            >
              WhatsApp
            </a>
            <button
              onClick={handleCopyLink}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-desa-green/40 hover:text-desa-green transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check size={13} /> : <Link2 size={13} />}
              {copied ? "Tersalin" : "Salin Tautan"}
            </button>
          </div>

          {/* ---------- Kembali ---------- */}
          <Link
            href="/berita"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-desa-green hover:underline mt-8"
          >
            <ArrowLeft size={15} />
            Kembali ke Berita
          </Link>
        </article>

        {/* ---------- Artikel terkait ---------- */}
        {related.length > 0 && (
          <section className="max-w-3xl mx-auto mt-14 pt-8 border-t border-black/5">
            <h2 className="font-semibold text-desa-green text-lg mb-5">
              Berita Terkait
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/berita/${r.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm border border-desa-green/10 hover:shadow-md transition-shadow"
                >
                  {r.gambar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.gambar_url}
                      alt={r.judul}
                      className="w-full h-24 sm:h-28 object-cover"
                    />
                  ) : (
                    <div className="w-full h-24 sm:h-28 bg-desa-green/5 flex items-center justify-center">
                      <ImageIcon size={20} className="text-desa-green/20" />
                    </div>
                  )}
                  <div className="p-2.5 sm:p-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-desa-green line-clamp-2 leading-snug group-hover:underline">
                      {r.judul}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-1.5">
                      {formatDate(r.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        <div className="max-w-3xl mx-auto mt-10">
          <TikTokCTA variant="banner" />
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  const { data: berita } = await supabase
    .from("berita")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  let related = [];
  if (berita) {
    const { data } = await supabase
      .from("berita")
      .select("id, judul, slug, gambar_url, created_at")
      .eq("published", true)
      .eq("kategori", berita.kategori)
      .neq("slug", berita.slug)
      .order("created_at", { ascending: false })
      .limit(3);
    related = data || [];
  }

  return { props: { berita: berita || null, related } };
}
