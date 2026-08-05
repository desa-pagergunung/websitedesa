import { useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabaseClient";
import { User, Search, X, ChevronDown } from "lucide-react";

// Data cadangan — dipakai kalau tabel struktur_organisasi di Supabase masih kosong.
// Struktur diverifikasi manual terhadap STRUKTUR_ORGANISAI_PEMDES_PGGN.pdf:
// Kepala Desa membawahi langsung Sekretariat, 3 Kasi, dan 4 Kadus.
// Sekretariat membawahi 3 Kaur. Operator menempel di bawah Kaur/Kasi terkait.
const DEFAULT_STRUKTUR = [
  { id: "d1", nama: "Sahili", jabatan: "Kepala Desa", urutan: 1 },
  { id: "d2", nama: "Karna", jabatan: "Sekretaris Desa", urutan: 2 },
  {
    id: "d3",
    nama: "Karsih Indriyanthie",
    jabatan: "Kepala Urusan Tata Usaha dan Umum",
    urutan: 3,
  },
  {
    id: "d4",
    nama: "Ani Puspitasari",
    jabatan: "Kepala Urusan Keuangan",
    urutan: 4,
  },
  {
    id: "d5",
    nama: "Kusyana",
    jabatan: "Kepala Urusan Perencanaan",
    urutan: 5,
  },
  {
    id: "d6",
    nama: "Ii Sopiyah",
    jabatan: "Operator Urusan Keuangan",
    urutan: 6,
  },
  {
    id: "d7",
    nama: "Gugun Gunawan",
    jabatan: "Kepala Seksi Pemerintahan",
    urutan: 7,
  },
  {
    id: "d8",
    nama: "Saliman Suroso",
    jabatan: "Kepala Seksi Kesejahteraan",
    urutan: 8,
  },
  {
    id: "d9",
    nama: "Sahi Suryana",
    jabatan: "Kepala Seksi Pelayanan",
    urutan: 9,
  },
  {
    id: "d10",
    nama: "Icha Sukma Octaviani",
    jabatan: "Operator Seksi Pemerintahan",
    urutan: 10,
  },
  {
    id: "d11",
    nama: "Daswan Susanto",
    jabatan: "Kepala Dusun Pagergunung",
    urutan: 11,
  },
  {
    id: "d12",
    nama: "Darman Adi Saputra",
    jabatan: "Kepala Dusun Pondokmangir",
    urutan: 12,
  },
  { id: "d13", nama: "Saefuloh", jabatan: "Kepala Dusun Pasuruan", urutan: 13 },
  {
    id: "d14",
    nama: "Dadang Nursahidin",
    jabatan: "Kepala Dusun Bojongaren",
    urutan: 14,
  },
];

const LEGEND = [
  { label: "Kepala Desa", badge: "bg-desa-gold text-white" },
  { label: "Sekretaris", badge: "bg-desa-green text-white" },
  { label: "Kepala Urusan", badge: "bg-desa-green/70 text-white" },
  { label: "Kepala Seksi", badge: "bg-desa-gold/70 text-white" },
  { label: "Operator", badge: "bg-stone-400 text-white" },
  { label: "Kepala Dusun", badge: "bg-stone-700 text-white" },
];

function tierAccent(jabatan = "") {
  const j = jabatan.toLowerCase();
  if (j.includes("kepala desa"))
    return {
      ring: "ring-desa-gold",
      bg: "bg-desa-gold/10",
      text: "text-desa-gold",
      badge: "bg-desa-gold text-white",
    };
  if (j.includes("sekretaris"))
    return {
      ring: "ring-desa-green",
      bg: "bg-desa-green/10",
      text: "text-desa-green",
      badge: "bg-desa-green text-white",
    };
  if (j.includes("kepala urusan"))
    return {
      ring: "ring-desa-green/40",
      bg: "bg-desa-green/5",
      text: "text-desa-green",
      badge: "bg-desa-green/70 text-white",
    };
  if (j.includes("kepala seksi"))
    return {
      ring: "ring-desa-gold/40",
      bg: "bg-desa-gold/5",
      text: "text-desa-gold",
      badge: "bg-desa-gold/70 text-white",
    };
  if (j.includes("operator"))
    return {
      ring: "ring-stone-300",
      bg: "bg-stone-50",
      text: "text-stone-500",
      badge: "bg-stone-400 text-white",
    };
  if (j.includes("kepala dusun"))
    return {
      ring: "ring-stone-400",
      bg: "bg-stone-100",
      text: "text-stone-700",
      badge: "bg-stone-700 text-white",
    };
  return {
    ring: "ring-stone-300",
    bg: "bg-stone-50",
    text: "text-stone-500",
    badge: "bg-stone-400 text-white",
  };
}

function kelompokkanTingkat(data) {
  const cari = (kw) =>
    data.filter((p) => p.jabatan?.toLowerCase().includes(kw));
  return {
    kepalaDesa: cari("kepala desa"),
    sekretaris: cari("sekretaris"),
    kaur: cari("kepala urusan"),
    operatorKeuangan: cari("operator urusan keuangan"),
    kasi: cari("kepala seksi"),
    operatorPemerintahan: cari("operator seksi pemerintahan"),
    kadus: cari("kepala dusun"),
  };
}

// Kepala Desa -> [Sekretariat (-> 3 Kaur, Kaur Keuangan -> Operator Keuangan),
//                 3 Kasi (Kasi Pemerintahan -> Operator Pemerintahan),
//                 4 Kadus]  — sesuai bagan resmi PDF.
function buildTree(t) {
  if (!t.kepalaDesa[0]) return null;

  const kaurWithOperator = t.kaur.map((k) =>
    k.jabatan.toLowerCase().includes("keuangan") && t.operatorKeuangan.length
      ? { ...k, children: t.operatorKeuangan }
      : k
  );
  const kasiWithOperator = t.kasi.map((k) =>
    k.jabatan.toLowerCase().includes("pemerintahan") &&
    t.operatorPemerintahan.length
      ? { ...k, children: t.operatorPemerintahan }
      : k
  );
  const sekretarisNode = t.sekretaris[0]
    ? { ...t.sekretaris[0], children: kaurWithOperator }
    : null;

  return {
    ...t.kepalaDesa[0],
    children: [
      ...(sekretarisNode ? [sekretarisNode] : []),
      ...kasiWithOperator,
      ...t.kadus,
    ],
  };
}

function nodeMatches(node, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    node.nama.toLowerCase().includes(q) ||
    node.jabatan.toLowerCase().includes(q)
  );
}

function nodeOrDescendantMatches(node, query) {
  if (nodeMatches(node, query)) return true;
  return (node.children || []).some((c) => nodeOrDescendantMatches(c, query));
}

function NodeCard({ p, dim, onClick }) {
  const c = tierAccent(p.jabatan);
  return (
    <button
      onClick={onClick}
      className={`inline-flex flex-col items-center gap-2 bg-white rounded-2xl border border-black/5 shadow-sm px-4 py-4 w-40 transition-all hover:shadow-lg hover:-translate-y-1 ${
        dim ? "opacity-30" : "opacity-100"
      }`}
    >
      <span
        className={`w-16 h-16 rounded-full ${c.bg} ${c.text} flex items-center justify-center ring-2 ${c.ring}`}
      >
        <User size={26} />
      </span>
      <span className="font-bold text-desa-green text-xs leading-snug text-center">
        {p.nama}
      </span>
      <span
        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-center ${c.badge}`}
      >
        {p.jabatan}
      </span>
    </button>
  );
}

/* ---------------------------------------------------------------------- *
 * DESKTOP: bagan horizontal dengan garis SVG yang diukur langsung dari
 * posisi asli tiap kartu (via ref), bukan hasil kalkulasi persentase.
 * Ini yang bikin garis selalu nyambung persis ke tengah kartu, berapa pun
 * jumlah anak / lebar cabangnya (Sekretariat vs Kasi vs Kadus tidak simetris).
 * ---------------------------------------------------------------------- */

function OrgNode({ node, registerNode, onSelect, query }) {
  const match = nodeMatches(node, query);
  const hasChildren = node.children?.length > 0;

  return (
    <div className="flex flex-col items-center">
      <div ref={(el) => registerNode(node.id, el, node)}>
        <NodeCard
          p={node}
          dim={Boolean(query) && !match}
          onClick={() => onSelect(node)}
        />
      </div>
      {hasChildren && (
        <div className="flex items-start mt-16">
          {node.children.map((c) => (
            <div key={c.id} className="flex justify-center px-4">
              <OrgNode
                node={c}
                registerNode={registerNode}
                onSelect={onSelect}
                query={query}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function useTreeConnectors(containerRef, nodeMapRef, deps) {
  const [lines, setLines] = useState([]);

  useLayoutEffect(() => {
    function recompute() {
      const container = containerRef.current;
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      const next = [];

      nodeMapRef.current.forEach((entry, id) => {
        const { el, node } = entry;
        if (!el || !node.children?.length) return;

        const pRect = el.getBoundingClientRect();
        const px = pRect.left + pRect.width / 2 - cRect.left;
        const pBottom = pRect.bottom - cRect.top;

        const childPts = node.children
          .map((c) => nodeMapRef.current.get(c.id))
          .filter((e) => e?.el)
          .map((e) => {
            const r = e.el.getBoundingClientRect();
            return {
              x: r.left + r.width / 2 - cRect.left,
              y: r.top - cRect.top,
            };
          });
        if (!childPts.length) return;

        const gap = Math.max(childPts[0].y - pBottom, 8);
        const midY = pBottom + gap / 2;

        next.push({ id: `${id}-trunk`, x1: px, y1: pBottom, x2: px, y2: midY });

        if (childPts.length > 1) {
          const minX = Math.min(...childPts.map((p) => p.x));
          const maxX = Math.max(...childPts.map((p) => p.x));
          next.push({
            id: `${id}-branch`,
            x1: minX,
            y1: midY,
            x2: maxX,
            y2: midY,
          });
        }

        childPts.forEach((pt, i) => {
          next.push({
            id: `${id}-drop-${i}`,
            x1: pt.x,
            y1: midY,
            x2: pt.x,
            y2: pt.y,
          });
        });
      });

      setLines(next);
    }

    recompute();
    const raf = requestAnimationFrame(recompute);
    const lateFix = setTimeout(recompute, 200); // jaga-jaga font/layout telat load
    const ro = new ResizeObserver(recompute);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", recompute);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(lateFix);
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return lines;
}

function DesktopOrgChart({ tree, onSelect, query }) {
  const containerRef = useRef(null);
  const nodeMapRef = useRef(new Map());

  const registerNode = (id, el, node) => {
    if (el) nodeMapRef.current.set(id, { el, node });
  };

  const lines = useTreeConnectors(containerRef, nodeMapRef, [tree]);

  return (
    <div className="hidden md:block overflow-x-auto scroll-clean pb-6">
      <div
        ref={containerRef}
        className="relative inline-flex justify-center min-w-full px-6"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {lines.map((l) => (
            <line
              key={l.id}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="#b8ab84"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}
        </svg>
        <OrgNode
          node={tree}
          registerNode={registerNode}
          onSelect={onSelect}
          query={query}
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 * MOBILE: accordion vertikal, tap kartu untuk detail, tap chevron untuk
 * buka/tutup cabang. Tidak ada scroll horizontal sama sekali.
 * ---------------------------------------------------------------------- */

function MobileNode({ node, query, onSelect, depth = 0 }) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = node.children?.length > 0;
  const match = nodeMatches(node, query);
  const descendantMatch =
    hasChildren && node.children.some((c) => nodeOrDescendantMatches(c, query));
  const isOpen = open || (Boolean(query) && (match || descendantMatch));
  const c = tierAccent(node.jabatan);

  return (
    <div
      className={depth > 0 ? "ml-3 pl-3 border-l-2 border-desa-gold/20" : ""}
    >
      <div
        className={`flex items-center gap-2 bg-white rounded-xl border border-black/5 shadow-sm my-1.5 transition-opacity ${
          Boolean(query) && !match && !descendantMatch
            ? "opacity-40"
            : "opacity-100"
        }`}
      >
        <button
          onClick={() => onSelect(node)}
          className="flex-1 min-w-0 flex items-center gap-3 px-3 py-2.5 text-left"
        >
          <span
            className={`w-10 h-10 shrink-0 rounded-full ${c.bg} ${c.text} flex items-center justify-center ring-2 ${c.ring}`}
          >
            <User size={18} />
          </span>
          <span className="min-w-0">
            <span className="block font-bold text-desa-green text-sm truncate">
              {node.nama}
            </span>
            <span
              className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.badge}`}
            >
              {node.jabatan}
            </span>
          </span>
        </button>
        {hasChildren && (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={isOpen ? "Tutup cabang" : "Buka cabang"}
            className="p-2.5 mr-1 text-gray-400 hover:text-gray-600 shrink-0"
          >
            <ChevronDown
              size={18}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <div className="mb-1">
          {node.children.map((child) => (
            <MobileNode
              key={child.id}
              node={child}
              query={query}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StrukturOrganisasi({ data }) {
  const sumber = data.length ? data : DEFAULT_STRUKTUR;
  const tree = buildTree(kelompokkanTingkat(sumber));
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  return (
    <Layout title="Struktur Organisasi">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-desa-green">
            Struktur Organisasi
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Pemerintah Desa Pagergunung —{" "}
            <span className="hidden md:inline">klik kartu untuk detail</span>
            <span className="md:hidden">ketuk kartu untuk detail</span>
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama / jabatan..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-desa-green/30"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {LEGEND.map((l) => (
          <span
            key={l.label}
            className={`text-xs font-medium px-3 py-1 rounded-full ${l.badge}`}
          >
            {l.label}
          </span>
        ))}
      </div>

      {tree ? (
        <>
          <DesktopOrgChart tree={tree} onSelect={setSelected} query={query} />
          <div className="md:hidden">
            <MobileNode node={tree} query={query} onSelect={setSelected} />
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-sm text-center">
          Data struktur organisasi belum tersedia.
        </p>
      )}

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Tutup"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <span
                className={`w-20 h-20 rounded-full ${
                  tierAccent(selected.jabatan).bg
                } ${
                  tierAccent(selected.jabatan).text
                } flex items-center justify-center ring-4 ${
                  tierAccent(selected.jabatan).ring
                } mb-4`}
              >
                <User size={36} />
              </span>
              <h3 className="font-bold text-desa-green text-lg">
                {selected.nama}
              </h3>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full mt-2 ${
                  tierAccent(selected.jabatan).badge
                }`}
              >
                {selected.jabatan}
              </span>
              <p className="text-sm text-gray-500 mt-4">
                Untuk keperluan administrasi atau pengaduan terkait bidang ini,
                silakan hubungi kantor desa.
              </p>
              <Link
                href="/kontak"
                className="mt-4 text-sm font-semibold text-desa-green hover:underline"
              >
                Lihat Kontak Kantor Desa →
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scroll-clean {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scroll-clean::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Layout>
  );
}

export async function getServerSideProps() {
  const { data } = await supabase
    .from("struktur_organisasi")
    .select("*")
    .order("urutan");
  return { props: { data: data || [] } };
}
