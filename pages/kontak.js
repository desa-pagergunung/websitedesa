import { useState, useMemo } from "react";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabaseClient";
import {
  Phone,
  Clock,
  UserRound,
  Search,
  PhoneCall,
  Building2,
  ChevronRight,
} from "lucide-react";

const FONT_DISPLAY = "'Plus Jakarta Sans', 'Inter', sans-serif";

export default function Kontak({ data }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter(
      (k) =>
        k.nama_layanan?.toLowerCase().includes(q) ||
        k.nama_kontak?.toLowerCase().includes(q) ||
        k.no_telepon?.toLowerCase().includes(q)
    );
  }, [data, query]);

  const totalDenganTelepon = useMemo(
    () => data.filter((k) => k.no_telepon).length,
    [data]
  );

  return (
    <Layout title="Kontak">
      {/* ---------- Header ---------- */}
      <div className="mb-8 pb-2">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-400 font-medium mb-4">
          <span>Beranda</span>
          <ChevronRight size={12} />
          <span className="text-desa-green font-semibold">Kontak</span>
        </div>

        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.15em] font-bold bg-desa-green/8 text-desa-green px-3.5 py-1.5 rounded-full mb-4">
          <PhoneCall size={13} /> Informasi Layanan
        </span>

        <h1
          style={{ fontFamily: FONT_DISPLAY }}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-desa-green tracking-tight mb-3"
        >
          Kontak Penting &amp; Jam Pelayanan
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-2xl leading-relaxed">
          Daftar kontak layanan desa yang dapat dihubungi warga sesuai
          kebutuhan, lengkap dengan jam operasional masing-masing layanan.
        </p>
      </div>

      {/* ---------- Ringkasan + pencarian, dibingkai satu kartu melayang ---------- */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-6 sm:gap-8 shrink-0">
          <div>
            <p
              style={{ fontFamily: FONT_DISPLAY }}
              className="text-xl sm:text-2xl font-extrabold text-desa-green leading-none"
            >
              {data.length}
            </p>
            <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 mt-1">
              Total Layanan
            </p>
          </div>
          <div className="w-px h-9 bg-gray-100" />
          <div>
            <p
              style={{ fontFamily: FONT_DISPLAY }}
              className="text-xl sm:text-2xl font-extrabold text-desa-green leading-none"
            >
              {totalDenganTelepon}
            </p>
            <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 mt-1">
              Bisa Dihubungi
            </p>
          </div>
        </div>

        <div className="hidden sm:block w-px h-9 bg-gray-100" />

        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari layanan, nama, atau nomor telepon..."
            className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-desa-green/25 focus:border-desa-green/40 transition-colors"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Menampilkan {filtered.length} dari {data.length} kontak
      </p>

      {/* ---------- Desktop: Table ---------- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wide text-gray-400">
                Layanan
              </th>
              <th className="text-left px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wide text-gray-400">
                Penanggung Jawab
              </th>
              <th className="text-left px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wide text-gray-400">
                No. Telepon
              </th>
              <th className="text-left px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wide text-gray-400">
                Jam Pelayanan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length ? (
              filtered.map((k) => (
                <tr
                  key={k.id}
                  className="hover:bg-desa-cream/30 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 shrink-0 rounded-lg bg-desa-green/8 flex items-center justify-center">
                        <Building2 size={14} className="text-desa-green" />
                      </span>
                      <span className="font-semibold text-desa-green">
                        {k.nama_layanan}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {k.nama_kontak || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    {k.no_telepon ? (
                      <a
                        href={`tel:${k.no_telepon}`}
                        className="inline-flex items-center gap-1.5 text-desa-leaf hover:text-desa-green hover:underline font-medium"
                      >
                        <Phone size={13} />
                        {k.no_telepon}
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {k.jam_pelayanan || (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>
                  <EmptyState hasQuery={!!query} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Mobile: Cards ---------- */}
      <div className="md:hidden space-y-3">
        {filtered.length ? (
          filtered.map((k) => (
            <div
              key={k.id}
              className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 shrink-0 rounded-lg bg-desa-green/8 flex items-center justify-center">
                  <Building2 size={16} className="text-desa-green" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-desa-green leading-snug">
                    {k.nama_layanan}
                  </p>
                  {k.nama_kontak && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <UserRound size={12} />
                      {k.nama_kontak}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-sm pl-12">
                {k.no_telepon ? (
                  <a
                    href={`tel:${k.no_telepon}`}
                    className="inline-flex items-center gap-1.5 text-desa-leaf font-medium"
                  >
                    <Phone size={13} />
                    {k.no_telepon}
                  </a>
                ) : null}
                {k.jam_pelayanan && (
                  <span className="inline-flex items-center gap-1.5 text-gray-500">
                    <Clock size={13} />
                    {k.jam_pelayanan}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
            <EmptyState hasQuery={!!query} />
          </div>
        )}
      </div>

      {/* padding bawah section supaya tidak mepet footer */}
      <div className="pb-16 sm:pb-24" />
    </Layout>
  );
}

function EmptyState({ hasQuery }) {
  return (
    <div className="px-4 py-12 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-desa-green/5 flex items-center justify-center mb-3">
        <PhoneCall size={20} className="text-desa-green/30" />
      </div>
      <p className="text-gray-500 text-sm">
        {hasQuery
          ? "Tidak ada kontak yang cocok dengan pencarian."
          : "Belum ada data kontak."}
      </p>
    </div>
  );
}

export async function getServerSideProps() {
  const { data } = await supabase
    .from("kontak_penting")
    .select("*")
    .order("urutan");
  return { props: { data: data || [] } };
}
