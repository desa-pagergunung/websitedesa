import { useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabaseClient";
import TiktokCTA from "../components/TiktokCTA";
import { PlayCircle } from "lucide-react";

function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/video\/(\d+)/);
  return match ? match[1] : null;
}

function useTikTokEmbedScript(shouldLoad) {
  useEffect(() => {
    if (!shouldLoad) return;
    if (document.getElementById("tiktok-embed-script")) return;
    const script = document.createElement("script");
    script.id = "tiktok-embed-script";
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, [shouldLoad]);
}

export default function Galeri({ data, videos }) {
  useTikTokEmbedScript(videos.length > 0);

  return (
    <Layout title="Galeri Foto & Video">
      <div className="pb-16 sm:pb-24">
        <h1 className="text-2xl font-bold text-desa-green mb-2">Galeri Desa</h1>
        <p className="text-sm text-gray-500 mb-6 max-w-xl">
          Dokumentasi kegiatan Desa Pagergunung, mulai dari foto hingga video
          pendek yang bisa kalian tonton langsung di TikTok resmi desa.
        </p>

        {/* ---------- CTA utama ke TikTok ---------- */}
        <div className="mb-10">
          <TiktokCTA variant="card" />
        </div>

        {/* ---------- Video terbaru (embed resmi TikTok, opsional) ---------- */}
        {videos.length > 0 && (
          <section className="mb-12">
            <h2 className="font-semibold text-desa-green text-lg mb-4">
              Video Terbaru
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((v) => {
                const videoId = extractVideoId(v.video_url);
                return (
                  <div
                    key={v.id}
                    className="rounded-2xl overflow-hidden bg-white border border-desa-green/10 shadow-sm flex justify-center p-2"
                  >
                    {videoId ? (
                      <blockquote
                        className="tiktok-embed"
                        cite={v.video_url}
                        data-video-id={videoId}
                        style={{ maxWidth: "100%", minWidth: "260px" }}
                      >
                        <section></section>
                      </blockquote>
                    ) : (
                      <a
                        href={v.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-2 h-52 w-full text-gray-400 hover:text-desa-green transition-colors"
                      >
                        <PlayCircle size={32} />
                        <span className="text-xs">Tonton di TikTok</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ---------- Dokumentasi foto (data lama tetap dipakai) ---------- */}
        <section>
          <h2 className="font-semibold text-desa-green text-lg mb-4">
            Dokumentasi Foto
          </h2>
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {data.length ? (
              data.map((g) => (
                <div
                  key={g.id}
                  className="break-inside-avoid rounded-lg overflow-hidden shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.gambar_url}
                    alt={g.judul || "Galeri desa"}
                    className="w-full object-cover"
                  />
                  {g.judul && (
                    <p className="text-xs text-gray-600 px-2 py-1 bg-white">
                      {g.judul}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Belum ada foto di galeri.</p>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  const { data } = await supabase
    .from("galeri")
    .select("*")
    .order("created_at", { ascending: false });

  // tabel opsional untuk video TikTok pilihan — kalau belum ada tabelnya,
  // query ini cukup mengembalikan array kosong tanpa error.
  const { data: videos } = await supabase
    .from("tiktok_videos")
    .select("id, video_url, caption")
    .order("created_at", { ascending: false })
    .limit(6);

  return { props: { data: data || [], videos: videos || [] } };
}
