import { supabase } from "../../lib/supabaseClient";

// Model gratis di tier Gemini API: gemini-1.5-flash / gemini-2.0-flash.
// Cek nama model terbaru yang tersedia di https://ai.google.dev/gemini-api/docs/models
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body;
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Pertanyaan tidak valid" });
  }

  try {
    // Ambil sedikit konteks nyata dari Supabase agar jawaban bot relevan dan tidak mengarang.
    const [{ data: profil }, { data: kontak }, { data: beritaTerbaru }] =
      await Promise.all([
        supabase.from("profil_desa").select("*").eq("id", 1).single(),
        supabase
          .from("kontak_penting")
          .select("nama_layanan, no_telepon, jam_pelayanan")
          .order("urutan"),
        supabase
          .from("berita")
          .select("judul, ringkasan")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

    const context = `
Kamu adalah asisten virtual resmi Website Desa Pagergunung, Kecamatan Pangandaran, Kabupaten Pangandaran, Jawa Barat.
Jawab HANYA berdasarkan data berikut. Jika informasi tidak tersedia, arahkan warga untuk menghubungi kantor desa langsung. Jawab singkat, ramah, dan dalam Bahasa Indonesia.

Profil Desa: ${JSON.stringify(profil || {})}
Kontak Penting: ${JSON.stringify(kontak || [])}
Berita Terbaru: ${JSON.stringify(beritaTerbaru || [])}
`.trim();

    const response = await fetch(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${context}\n\nPertanyaan warga: ${question}` }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 400,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return res
        .status(502)
        .json({
          answer: "Maaf, layanan AI sedang bermasalah. Coba lagi nanti.",
        });
    }

    const data = await response.json();
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, saya belum bisa menjawab pertanyaan itu. Silakan hubungi kantor desa.";

    // Simpan log percakapan (opsional, untuk evaluasi proker)
    supabase
      .from("chat_log")
      .insert({ pertanyaan: question, jawaban: answer })
      .then(() => {});

    return res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ answer: "Terjadi kesalahan pada server." });
  }
}
