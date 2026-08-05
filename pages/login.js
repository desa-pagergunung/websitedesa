import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Trees,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const FONT_DISPLAY = "'Plus Jakarta Sans', 'Inter', sans-serif";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", ingat: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      // TODO: sambungkan ke endpoint autentikasi yang sebenarnya
      await new Promise((resolve) => setTimeout(resolve, 900));
    } catch (err) {
      setError("Gagal masuk. Periksa kembali email dan kata sandi Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Masuk — Admin Website Desa Pagergunung</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-desa-cream/50 via-white to-white px-5 py-10">
        <Link
          href="/"
          className="fixed top-5 left-5 sm:top-6 sm:left-6 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-desa-green bg-white/80 backdrop-blur ring-1 ring-black/5 px-3.5 py-2 rounded-full transition-colors"
        >
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>

        <div className="w-full max-w-sm">
          {/* brand mark */}
          <div className="flex flex-col items-center mb-8">
            <span className="w-12 h-12 rounded-2xl bg-desa-green/8 text-desa-green flex items-center justify-center mb-4">
              <Trees size={22} strokeWidth={2} />
            </span>
            <h1
              style={{ fontFamily: FONT_DISPLAY }}
              className="text-xl font-extrabold text-desa-green tracking-tight"
            >
              Admin Desa
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Selamat Datang Admin Website Desa Pagergunung
            </p>
          </div>

          {/* kartu form — melayang di atas latar gradasi */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-desa-green/5 ring-1 ring-black/5 p-6 sm:p-8"
          >
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-600 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@contoh.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full text-sm rounded-xl border border-gray-200 pl-10 pr-3.5 py-2.5 text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-desa-green/25 focus:border-desa-green/40 transition-colors"
                />
              </div>
            </div>

            <div className="mb-3">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-600 mb-1.5"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full text-sm rounded-xl border border-gray-200 pl-10 pr-10 py-2.5 text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-desa-green/25 focus:border-desa-green/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="ingat"
                checked={form.ingat}
                onChange={handleChange}
                className="w-3.5 h-3.5 rounded border-gray-300 text-desa-green focus:ring-desa-green/30"
              />
              <span className="text-xs text-gray-500">Ingat saya</span>
            </label>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-desa-green text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:bg-desa-green/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Memproses..." : "Masuk"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
