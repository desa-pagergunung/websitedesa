import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Halo! Saya asisten virtual Desa Pagergunung. Ada yang bisa saya bantu?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.answer || "Maaf, saya belum bisa menjawab pertanyaan itu.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Terjadi kesalahan koneksi. Silakan coba lagi." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="w-80 sm:w-96 h-[480px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-3 border border-black/5">
          <div className="bg-desa-green text-white px-4 py-3 flex justify-between items-center">
            <span className="flex items-center gap-2 font-semibold text-sm">
              <Bot size={18} /> Asisten Desa Pagergunung
            </span>
            <button onClick={() => setOpen(false)} aria-label="Tutup chat">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm bg-desa-cream">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                  m.role === "user"
                    ? "bg-desa-leaf text-white ml-auto rounded-br-sm"
                    : "bg-white text-gray-800 mr-auto rounded-bl-sm shadow-sm"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="bg-white text-gray-400 mr-auto px-3 py-2 rounded-2xl text-xs italic">
                Sedang mengetik...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="flex border-t border-black/5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaan..."
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-desa-green text-white px-4 flex items-center justify-center disabled:opacity-50"
              aria-label="Kirim pesan"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="bg-desa-green text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Buka chat AI"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
