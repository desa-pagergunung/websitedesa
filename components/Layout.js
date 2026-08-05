import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";
import AccessibilityBar from "./AccessibilityBar";

export default function Layout({
  children,
  title = "Desa Pagergunung",
  addTopSpacing = true,
}) {
  const [scrolled, setScrolled] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ukur tinggi navbar secara real-time, simpan sebagai CSS var --navbar-height.
  // TIDAK diberi transisi di sini — biar mengikuti tinggi asli tanpa "kejar-kejaran"
  // dengan animasi collapse AccessibilityBar (itu sudah cukup untuk kesan mulus).
  useEffect(() => {
    if (!wrapperRef.current) return;
    const el = wrapperRef.current;

    function updateHeight() {
      document.documentElement.style.setProperty(
        "--navbar-height",
        `${el.offsetHeight}px`
      );
    }

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrolled]);

  return (
    <>
      <Head>
        <title>{title} | Website Resmi Desa Pagergunung</title>
        <meta
          name="description"
          content="Website resmi Desa Pagergunung, Kecamatan Pangandaran."
        />
        <link rel="icon" href="/logopangandaran.png" />
      </Head>

      <div ref={wrapperRef} className="fixed top-0 left-0 w-full z-50">
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            scrolled ? "max-h-0 opacity-0" : "max-h-20 opacity-100"
          }`}
        >
          <AccessibilityBar />
        </div>
        <Navbar />
      </div>

      {/* paddingTop TANPA transisi CSS — snap mengikuti --navbar-height apa adanya,
          supaya tidak dobel-animasi dengan collapse AccessibilityBar di atas */}
      <main
        className="max-w-6xl mx-auto px-4 min-h-[70vh]"
        style={{
          paddingTop: addTopSpacing
            ? "calc(var(--navbar-height, 96px) + 32px)"
            : "var(--navbar-height, 96px)",
        }}
      >
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
