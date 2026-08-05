import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabaseClient";
import {
  ChevronRight,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Wallet,
  ReceiptText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Palet warna konsisten dengan halaman lain
const CHART_COLORS = [
  "#2F5D3A", // Hijau tua
  "#D9A441", // Gold
  "#7A5A3A", // Coklat tanah
  "#4C8B5A", // Hijau daun
  "#B79B6C", // Bronze
  "#8A8168", // Olive
];

function formatRupiah(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function formatPersen(n) {
  return `${n.toFixed(1)}%`.replace(".", ",");
}

// ---------- Fade-in tipis saat elemen masuk layar — konsisten dengan halaman lain ----------
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function RevealBlock({ children, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`${className} transition-opacity duration-500 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

export default function Keuangan({ data }) {
  const tahunList = useMemo(
    () => [...new Set(data.map((d) => d.tahun_anggaran))].sort((a, b) => b - a),
    [data]
  );
  const [tahun, setTahun] = useState(tahunList[0]);
  const [tab, setTab] = useState("pendapatan");

  const filtered = useMemo(
    () => data.filter((d) => d.tahun_anggaran === tahun),
    [data, tahun]
  );
  const pendapatan = filtered.filter((d) => d.kategori === "pendapatan");
  const belanja = filtered.filter((d) => d.kategori === "belanja");

  const totalPendapatan = pendapatan.reduce(
    (sum, d) => sum + Number(d.jumlah),
    0
  );
  const totalBelanja = belanja.reduce((sum, d) => sum + Number(d.jumlah), 0);
  const selisih = totalPendapatan - totalBelanja;

  const items = tab === "pendapatan" ? pendapatan : belanja;
  const itemsTotal = tab === "pendapatan" ? totalPendapatan : totalBelanja;
  const sorted = [...items].sort((a, b) => Number(b.jumlah) - Number(a.jumlah));

  // Tren Pendapatan vs Belanja per tahun anggaran
  const yearlyTrend = useMemo(() => {
    const map = {};
    data.forEach((d) => {
      if (!map[d.tahun_anggaran]) {
        map[d.tahun_anggaran] = {
          tahun: d.tahun_anggaran,
          Pendapatan: 0,
          Belanja: 0,
        };
      }
      if (d.kategori === "pendapatan") {
        map[d.tahun_anggaran].Pendapatan += Number(d.jumlah);
      } else {
        map[d.tahun_anggaran].Belanja += Number(d.jumlah);
      }
    });
    return Object.values(map).sort((a, b) => a.tahun - b.tahun);
  }, [data]);

  // Komposisi kategori pada tab aktif — maksimal 6 + sisanya "Lainnya"
  const donutData = useMemo(() => {
    const top = sorted.slice(0, 6).map((d) => ({
      name: d.sub_kategori,
      value: Number(d.jumlah),
    }));
    const sisa = sorted.slice(6).reduce((sum, d) => sum + Number(d.jumlah), 0);
    if (sisa > 0) top.push({ name: "Lainnya", value: sisa });
    return top;
  }, [sorted]);

  return (
    <Layout title="Keuangan Desa">
      {/* ---------- Header ---------- */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-400 font-medium mb-4">
          <span>Beranda</span>
          <ChevronRight size={12} />
          <span className="text-desa-green font-semibold">Keuangan Desa</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.15em] font-bold text-gray-400 mb-3">
              <Landmark size={13} /> Transparansi Anggaran
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-desa-green tracking-tight mb-2">
              APBDes — Anggaran Pendapatan &amp; Belanja Desa
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
              Rincian pendapatan dan belanja desa yang dipublikasikan secara
              terbuka sesuai prinsip transparansi pengelolaan keuangan desa.
            </p>
          </div>

          {tahunList.length > 0 && (
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-desa-green/20 focus:border-desa-green/40 transition-colors shrink-0"
            >
              {tahunList.map((t) => (
                <option key={t} value={t}>
                  Tahun Anggaran {t}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {filtered.length ? (
        <>
          {/* ---------- Ringkasan ---------- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {[
              {
                label: "Total Pendapatan",
                value: totalPendapatan,
                icon: ArrowUpRight,
              },
              {
                label: "Total Belanja",
                value: totalBelanja,
                icon: ArrowDownRight,
              },
              {
                label: selisih >= 0 ? "Surplus" : "Defisit",
                value: Math.abs(selisih),
                icon: Scale,
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 ${
                    i === 2 ? "col-span-2 sm:col-span-1" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-gray-400">
                      {card.label}
                    </p>
                    <Icon size={16} className="text-gray-300" />
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">
                    {formatRupiah(card.value)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ---------- Grafik: arus per tahun & komposisi kategori ---------- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-bold text-gray-700">
                  Arus Anggaran per Tahun
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-desa-green" />
                    Pendapatan
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-desa-gold" />
                    Belanja
                  </span>
                </div>
              </div>

              <div className="h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyTrend} barGap={6}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="tahun"
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      width={44}
                      tickFormatter={(v) =>
                        v >= 1e9
                          ? `${(v / 1e9).toFixed(1)}M`
                          : `${(v / 1e6).toFixed(0)}jt`
                      }
                    />
                    <Tooltip
                      formatter={(v) => formatRupiah(v)}
                      cursor={{ fill: "#F6F3EA" }}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar
                      dataKey="Pendapatan"
                      fill="#2F5D3A"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={26}
                    />
                    <Bar
                      dataKey="Belanja"
                      fill="#D9A441"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={26}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 flex flex-col">
              <h3 className="text-sm font-bold text-gray-700 mb-1">
                Komposisi {tab === "pendapatan" ? "Pendapatan" : "Belanja"}
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Tahun anggaran {tahun}
              </p>

              <div className="relative h-40 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={68}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {donutData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatRupiah(v)}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase tracking-wide text-gray-400">
                    Total
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    {formatRupiah(itemsTotal)}
                  </span>
                </div>
              </div>

              <ul className="space-y-2 overflow-y-auto max-h-32 pr-1">
                {donutData.map((d, i) => (
                  <li
                    key={d.name}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="flex items-center gap-2 text-gray-600 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="truncate">{d.name}</span>
                    </span>
                    <span className="font-semibold text-gray-600 shrink-0">
                      {formatPersen((d.value / itemsTotal) * 100)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ---------- Rincian — tab + daftar kartu sederhana ---------- */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center border-b border-gray-100 px-2 sm:px-3">
              {[
                {
                  key: "pendapatan",
                  label: "Rincian Pendapatan",
                  icon: Wallet,
                },
                { key: "belanja", label: "Rincian Belanja", icon: ReceiptText },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`relative flex items-center gap-2 px-4 sm:px-5 py-4 text-sm font-semibold transition-colors ${
                      tab === t.key
                        ? "text-desa-green"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Icon size={15} />
                    {t.label}
                    {tab === t.key && (
                      <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-desa-green" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 sm:p-6">
              {sorted.length ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {sorted.map((d, i) => {
                    const jumlah = Number(d.jumlah);
                    const persen =
                      itemsTotal > 0 ? (jumlah / itemsTotal) * 100 : 0;
                    return (
                      <RevealBlock key={d.id}>
                        <div className="h-full border border-gray-100 rounded-xl p-3 sm:p-4">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <p className="text-xs sm:text-sm font-medium text-gray-700 leading-snug">
                              {d.sub_kategori}
                            </p>
                            <span className="text-[11px] sm:text-xs font-semibold text-gray-400 shrink-0">
                              {formatPersen(persen)}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base font-bold text-gray-900 mb-2">
                            {formatRupiah(jumlah)}
                          </p>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-desa-green"
                              style={{ width: `${Math.min(persen, 100)}%` }}
                            />
                          </div>
                        </div>
                      </RevealBlock>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-6 text-center">
                  Belum ada rincian.
                </p>
              )}

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-700">
                  Total {tab === "pendapatan" ? "Pendapatan" : "Belanja"}
                </span>
                <span className="text-sm sm:text-base font-bold text-gray-900">
                  {formatRupiah(itemsTotal)}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-16 text-center">
          <p className="text-gray-400 text-sm">
            Data keuangan belum tersedia untuk tahun ini.
          </p>
        </div>
      )}

      <div className="pb-16 sm:pb-24" />
    </Layout>
  );
}

export async function getServerSideProps() {
  const { data } = await supabase
    .from("keuangan_desa")
    .select("*")
    .order("tahun_anggaran", { ascending: false });
  return { props: { data: data || [] } };
}
