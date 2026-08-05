import { useEffect, useState } from "react";
import { Minus, Plus, Contrast, Check } from "lucide-react";

const UKURAN = ["normal", "teks-besar", "teks-sangat-besar"];
const LABEL_UKURAN = {
  normal: "Ukuran Normal",
  "teks-besar": "Teks Besar",
  "teks-sangat-besar": "Teks Sangat Besar",
};

export default function AccessibilityBar() {
  const [ukuran, setUkuran] = useState("normal");
  const [kontrasTinggi, setKontrasTinggi] = useState(false);

  useEffect(() => {
    const savedUkuran =
      window.localStorage.getItem("desa_ukuran_teks") || "normal";
    const savedKontras =
      window.localStorage.getItem("desa_kontras_tinggi") === "1";
    setUkuran(savedUkuran);
    setKontrasTinggi(savedKontras);
    applyUkuran(savedUkuran);
    applyKontras(savedKontras);
  }, []);

  function applyUkuran(nilai) {
    UKURAN.forEach((u) => document.documentElement.classList.remove(u));
    if (nilai !== "normal") document.documentElement.classList.add(nilai);
  }

  function applyKontras(aktif) {
    document.documentElement.classList.toggle("kontras-tinggi", aktif);
  }

  function perbesarTeks() {
    const idx = UKURAN.indexOf(ukuran);
    const next = UKURAN[Math.min(idx + 1, UKURAN.length - 1)];
    setUkuran(next);
    applyUkuran(next);
    window.localStorage.setItem("desa_ukuran_teks", next);
  }

  function perkecilTeks() {
    const idx = UKURAN.indexOf(ukuran);
    const next = UKURAN[Math.max(idx - 1, 0)];
    setUkuran(next);
    applyUkuran(next);
    window.localStorage.setItem("desa_ukuran_teks", next);
  }

  function toggleKontras() {
    const next = !kontrasTinggi;
    setKontrasTinggi(next);
    applyKontras(next);
    window.localStorage.setItem("desa_kontras_tinggi", next ? "1" : "0");
  }

  return (
    <div className="bg-[#0F1A12] text-white text-sm">
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-white/70">Pengaturan Tampilan</span>
        <div className="flex items-center gap-2">
          <button
            onClick={perkecilTeks}
            aria-label="Perkecil teks"
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={perbesarTeks}
            aria-label="Perbesar teks"
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Plus size={16} />
          </button>
          <span className="hidden sm:inline text-white/60 text-xs px-1">
            {LABEL_UKURAN[ukuran]}
          </span>
          <button
            onClick={toggleKontras}
            aria-pressed={kontrasTinggi}
            className={`px-3 h-9 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors ${
              kontrasTinggi
                ? "bg-desa-gold text-desa-green"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {kontrasTinggi ? <Check size={14} /> : <Contrast size={14} />}
            Kontras Tinggi
          </button>
        </div>
      </div>
    </div>
  );
}
