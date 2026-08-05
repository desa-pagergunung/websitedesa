import { useMemo, useState } from "react";
import Layout from "../../components/Layout";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { Calendar, Newspaper, ImageIcon, ArrowRight } from "lucide-react";
import TikTokCTA from "../../components/TiktokCTA";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function NewsImage({ src, alt, className }) {
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

export default function BeritaList({ data }) {
  const kategoriList = useMemo(() => {
    const unique = Array.from(
      new Set(data.map((b) => b.kategori).filter(Boolean))
    );
    return ["semua", ...unique];
  }, [data]);

  const [filter, setFilter] = useState("semua");

  const featured = data[0];
  const rest = data.slice(1);
  const filtered =
    filter === "semua" ? rest : rest.filter((b) => b.kategori === filter);

  return (
    <Layout title="Berita & Kegiatan">
      {/* pb ekstra di bawah supaya halaman tidak "mepet" ke footer/navigasi bawah */}
      <div className="pb-16 sm:pb-24">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-desa-gold">
            <Newspaper size={12} />
            Informasi Desa
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-desa-green mt-2">
            Berita &amp; Kegiatan Desa
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kabar terbaru dan dokumentasi kegiatan warga Desa Pagergunung
          </p>
        </div>

        {!data.length ? (
          <div className="bg-white rounded-xl border border-desa-green/10 px-4 py-16 text-center">
            <p className="text-gray-500 text-sm">
              Belum ada berita yang dipublikasikan.
            </p>
          </div>
        ) : (
          <>
            {/* ---------- Featured: berita terbaru ---------- */}
            <Link
              href={`/berita/${featured.slug}`}
              className="group relative block rounded-3xl overflow-hidden mb-8 sm:mb-10 h-56 sm:h-96"
            >
              <NewsImage
                src={featured.gambar_url}
                alt={featured.judul}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2">
                <span className="bg-desa-gold text-desa-green text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                  Terbaru
                </span>
                {featured.kategori && (
                  <span className="bg-white/15 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                    {featured.kategori}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 text-white">
                <h2 className="font-display text-base sm:text-3xl font-semibold mb-1.5 sm:mb-2 max-w-2xl leading-snug line-clamp-2">
                  {featured.judul}
                </h2>
                {featured.ringkasan && (
                  <p className="hidden sm:block text-sm sm:text-base text-white/80 max-w-2xl line-clamp-2 mb-3">
                    {featured.ringkasan}
                  </p>
                )}
                <p className="text-[11px] sm:text-sm text-white/60 flex items-center gap-1.5">
                  <Calendar size={12} />
                  {formatDate(featured.created_at)}
                </p>
              </div>
            </Link>

            {/* ---------- Filter kategori ---------- */}
            {kategoriList.length > 2 && (
              <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
                {kategoriList.map((k) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium capitalize border transition-colors ${
                      filter === k
                        ? "bg-desa-green text-white border-desa-green"
                        : "border-gray-200 text-gray-500 hover:border-desa-green/40 hover:text-desa-green"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            )}

            {/* ---------- Grid berita: 2 kolom di mobile, 3 kolom di desktop ---------- */}
            {filtered.length ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {filtered.map((b) => (
                  <Link
                    key={b.id}
                    href={`/berita/${b.slug}`}
                    className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-desa-green/10 hover:shadow-lg hover:border-desa-green/20 transition-all flex flex-col"
                  >
                    <div className="overflow-hidden">
                      <NewsImage
                        src={b.gambar_url}
                        alt={b.judul}
                        className="w-full h-24 sm:h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-2.5 sm:p-4 flex flex-col flex-1">
                      {b.kategori && (
                        <span className="text-[9px] sm:text-xs uppercase text-desa-gold font-semibold">
                          {b.kategori}
                        </span>
                      )}
                      <h3 className="text-xs sm:text-base font-semibold text-desa-green mt-1 sm:mt-1.5 line-clamp-2 leading-snug">
                        {b.judul}
                      </h3>
                      {b.ringkasan && (
                        <p className="hidden sm:block text-sm text-gray-500 mt-1.5 line-clamp-2 flex-1">
                          {b.ringkasan}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-black/5">
                        <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 sm:gap-1.5">
                          <Calendar size={11} className="hidden sm:block" />
                          {formatDate(b.created_at)}
                        </span>
                        <span className="hidden sm:flex text-desa-green text-xs font-medium items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Baca <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-12">
                Tidak ada berita di kategori ini.
              </p>
            )}
            <div className="mt-10">
              <TikTokCTA variant="banner" />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  const { data } = await supabase
    .from("berita")
    .select("id, judul, slug, ringkasan, gambar_url, kategori, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return { props: { data: data || [] } };
}
