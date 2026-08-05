import { useState } from "react";
import Layout from "../components/Layout";
import {
  Download,
  ExternalLink,
  Mountain,
  AlertTriangle,
  Leaf,
  Map as MapIcon,
} from "lucide-react";

// Dokumen peta desa — taruh file PDF-nya di /public/dokumen/ dengan nama file sesuai `file` di bawah
const DOKUMEN_PETA = [
  {
    id: "potensi",
    title: "Peta Sebaran Potensi Lokal Desa",
    description:
      "Peta persebaran potensi lokal per dusun (Pagergunung, Pondokmangir, Bojongaren, Pasuruan) beserta dokumentasi foto tiap titik potensi.",
    file: "/dokumen/potret-desa.pdf",
    size: "6.0 MB",
    icon: MapIcon,
  },
  {
    id: "longsor",
    title: "Peta Tingkat Kerawanan Bencana Tanah Longsor",
    description:
      "Peta klasifikasi tingkat kerawanan longsor (rendah, sedang, tinggi) di wilayah Desa Pagergunung.",
    file: "/dokumen/peta-kerawanan-longsor.pdf",
    size: "2.6 MB",
    icon: AlertTriangle,
  },
  {
    id: "flora",
    title: "Peta Persebaran Flora Potensi Tanaman Pangan",
    description:
      "Titik persebaran flora potensi tanaman pangan seperti kelapa, durian, kopi, mangga, dan rambutan di setiap dusun.",
    file: "/dokumen/peta-flora-tanaman-pangan.pdf",
    size: "5.9 MB",
    icon: Leaf,
  },
  {
    id: "geologi",
    title: "Peta Geologi Desa Pagergunung",
    description:
      "Peta formasi geologi desa: breksi andesit, perselingan batugamping dan napal, arah perlapisan, serta sesar naik.",
    file: "/dokumen/peta-geologi.pdf",
    size: "2.3 MB",
    icon: Mountain,
  },
];

export default function Geotagging() {
  const [activeDoc, setActiveDoc] = useState(DOKUMEN_PETA[0]);

  return (
    <Layout title="Peta Desa">
      <div className="pb-16">
        <h1 className="text-2xl font-bold text-desa-green mb-1">Peta Desa</h1>
        <p className="text-sm text-gray-500 mb-5">
          Kumpulan peta tematik hasil pemetaan Desa Pagergunung, dapat dilihat
          langsung atau diunduh dalam format PDF.
        </p>

        {/* Selector dokumen */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {DOKUMEN_PETA.map((doc) => {
            const Icon = doc.icon;
            const isActive = activeDoc.id === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc)}
                className={`text-left flex gap-3 p-3 rounded-lg border transition-colors ${
                  isActive
                    ? "border-desa-green bg-desa-green/5"
                    : "border-black/5 bg-white hover:border-desa-green/40"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center ${
                    isActive
                      ? "bg-desa-green text-white"
                      : "bg-desa-green/10 text-desa-green"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-xs font-semibold leading-tight ${
                      isActive ? "text-desa-green" : "text-gray-800"
                    }`}
                  >
                    {doc.title}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    {doc.size}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info dokumen aktif + aksi */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h2 className="font-semibold text-gray-800">{activeDoc.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5 max-w-xl">
              {activeDoc.description}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <a
              href={activeDoc.file}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:border-desa-green hover:text-desa-green transition-colors"
            >
              <ExternalLink size={14} />
              Buka Tab Baru
            </a>
            <a
              href={activeDoc.file}
              download
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-desa-green text-white hover:opacity-90 transition-opacity"
            >
              <Download size={14} />
              Unduh PDF
            </a>
          </div>
        </div>

        {/* Full-page PDF viewer */}
        <div className="rounded-lg overflow-hidden border border-black/5 bg-gray-50">
          <object
            data={activeDoc.file}
            type="application/pdf"
            className="w-full h-[80vh]"
            aria-label={activeDoc.title}
          >
            {/* Fallback kalau browser (terutama mobile) tidak bisa render PDF inline */}
            <div className="flex flex-col items-center justify-center h-[50vh] gap-3 text-center px-6">
              <p className="text-sm text-gray-500">
                Pratinjau PDF tidak didukung di perangkat ini. Silakan unduh
                atau buka di tab baru.
              </p>
              <a
                href={activeDoc.file}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-desa-green text-white"
              >
                <Download size={16} />
                Unduh PDF
              </a>
            </div>
          </object>
        </div>
      </div>
    </Layout>
  );
}
