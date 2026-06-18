import { useState, useRef, useEffect } from "react";

const spvQuickQuestions = [
  "Apakah saya perlu melakukan KYC Normal atau Singkat?",
  "Data dukcapil tidak sesuai dengan KTP, bagaimana?",
  "Nasabah termasuk NRT, apa yang harus dilakukan?",
  "Apakah NPWP wajib untuk pembukaan rekening?",
  "Nasabah tidak bisa menunjukkan dokumen asli, bagaimana?",
  "Bagaimana jika koneksi video call terputus?",
];

const spvResponses = {
  "Apakah saya perlu melakukan KYC Normal atau Singkat?":
    "Jika KTP sudah lolos KYC sistem, lakukan KYC Singkat. Jika belum, lakukan KYC Normal dengan pertanyaan lengkap sesuai prosedur.",
  "Data dukcapil tidak sesuai dengan KTP, bagaimana?":
    "Konfirmasi ulang dengan nasabah. Jika ada perbedaan minor (typo), catat dan lanjutkan. Jika perbedaan signifikan, minta nasabah update data di dukcapil terlebih dahulu.",
  "Nasabah termasuk NRT, apa yang harus dilakukan?":
    "Lakukan Enhanced Due Diligence (EDD). Tanyakan sumber dana, tujuan rekening, dan aktivitas transaksi yang diperkirakan. Ajukan ke SPV untuk approval setelah EDD selesai.",
  "Apakah NPWP wajib untuk pembukaan rekening?":
    "NPWP tidak wajib, namun jika nasabah memiliki NPWP, sebaiknya dicatat. Jika tidak punya, nasabah bisa mengisi formulir pernyataan tidak memiliki NPWP.",
  "Nasabah tidak bisa menunjukkan dokumen asli, bagaimana?":
    "Dokumen asli wajib ditunjukkan saat video call. Jika tidak tersedia, minta nasabah menyiapkan terlebih dahulu dan jadwalkan ulang video call.",
  "Bagaimana jika koneksi video call terputus?":
    "Sistem akan menyimpan history panggilan terputus. Coba hubungi kembali nasabah dan verifikasi dari ringkasan panggilan sebelumnya.",
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      type: "system",
      text: "Selamat datang! Gunakan fitur ini untuk bertanya kepada SPV jika ada hal yang belum jelas dalam proses simulasi.",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isOpen, isTyping]);

  const getTime = () =>
    new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const sendQuestion = (question) => {
    const newMsgs = [
      ...chatMessages,
      { type: "cso", text: question, time: getTime() },
    ];
    setChatMessages(newMsgs);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const response =
        spvResponses[question] ||
        "Terima kasih atas pertanyaannya. Silakan ikuti prosedur standar yang berlaku. Jika masih ragu, baca kembali materi pelatihan atau hubungi supervisor Anda secara langsung.";
      setChatMessages((prev) => [
        ...prev,
        { type: "spv", text: response, time: getTime() },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleSendInput = () => {
    if (!inputText.trim()) return;
    sendQuestion(inputText.trim());
  };

  return (
    <div className="chat-widget">
      {isOpen && (
        <div className="chat-panel-float">
          <div className="chat-panel-head">
            <span>🎓 Tanya SPV - Konsultasi</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="chat-messages-float">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-msg-float ${
                  msg.type === "cso"
                    ? "agent"
                    : msg.type === "spv"
                    ? "customer"
                    : "system"
                }`}
              >
                {msg.type === "cso" && (
                  <div className="msg-sender">🎧 Anda (CSO)</div>
                )}
                {msg.type === "spv" && (
                  <div className="msg-sender">👨‍💼 SPV - Siti Astuti</div>
                )}
                {msg.type === "system" && (
                  <div className="msg-sender">ℹ️ Sistem</div>
                )}
                <div>{msg.text}</div>
                <div className="msg-time">{msg.time}</div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-msg-float customer">
                <div className="msg-sender">👨‍💼 SPV - Siti Astuti</div>
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-quick-questions">
            <div className="qq-label">💡 Pertanyaan Cepat:</div>
            <div className="qq-buttons">
              {spvQuickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  className="qq-btn"
                  onClick={() => sendQuestion(q)}
                  disabled={isTyping}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="chat-input-bar">
            <input
              type="text"
              placeholder="Ketik pertanyaan untuk SPV..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendInput()}
              disabled={isTyping}
            />
            <button onClick={handleSendInput} disabled={isTyping || !inputText.trim()}>
              Kirim
            </button>
          </div>
        </div>
      )}
      <button
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Tanya SPV"
      >
        🎓
      </button>
      {!isOpen && <span className="chat-toggle-label">Tanya SPV</span>}
    </div>
  );
}
