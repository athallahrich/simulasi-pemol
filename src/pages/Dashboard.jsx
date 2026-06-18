import { useNavigate } from "react-router-dom";
import { customerScenarios } from "../data/simulationData";

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Selamat Pagi";
    if (h < 15) return "Selamat Siang";
    if (h < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div>
      {/* CHAIN Header */}
      <div className="chain-header">
        <div className="chain-header-left">
          <div>
            <span className="chain-logo">SPRO</span>
            <span className="chain-logo-sub">Simulasi Pembukaan Rekening Online</span>
          </div>
          <span style={{ opacity: .3, margin: "0 8px" }}>|</span>
          <span style={{ fontSize: ".8rem", opacity: .7 }}>Menu Transaksi Pembukaan Rekening</span>
        </div>
        <div className="chain-header-right">
          <span>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span className="greeting">{greeting()},</span>
          <span className="agent-name">{user.name}</span>
          <button className="header-logout" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="dashboard-wrap">
        <div className="dashboard-content">
          <div className="welcome-bar">
            <h1>Selamat Datang, {user.name}!</h1>
            <p>Pilih skenario simulasi pembukaan rekening online. Setiap skenario memiliki tantangan berbeda sesuai materi pelatihan.</p>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-icon">📚</span>
              <div><div className="stat-val">{customerScenarios.length}</div><div className="stat-lbl">Skenario Tersedia</div></div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <div><div className="stat-val">{parseInt(sessionStorage.getItem("sim_completed") || "0")}</div><div className="stat-lbl">Selesai</div></div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">⭐</span>
              <div><div className="stat-val">{sessionStorage.getItem("sim_avg_score") || "-"}</div><div className="stat-lbl">Rata-rata Skor</div></div>
            </div>
          </div>

          <h2 className="section-title">Pilih Skenario Simulasi</h2>
          <div className="scenario-grid">
            {customerScenarios.map((s) => (
              <div key={s.id} className="scenario-card" onClick={() => navigate(`/simulation/${s.id}`)}>
                <div className="scenario-badges">
                  {s.kycStatus === "lolos" ? <span className="badge badge-success">KYC Lolos</span> : <span className="badge badge-warning">KYC Normal</span>}
                  {s.isNRT && <span className="badge badge-danger">NRT</span>}
                  <span className="badge badge-info">{s.channel}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <div className="scenario-meta">
                  <strong>Tipe:</strong> {s.customerType === "baru" ? "Nasabah Baru" : s.customerType === "existing_baru" ? "Existing (Isi Baru)" : "Existing"}
                </div>
                <div className="scenario-steps-info">
                  <strong>{s.conversationFlow.length + 2} langkah</strong> (termasuk SPV approval & ringkasan)
                </div>
                <button className="btn-primary" onClick={(e) => { e.stopPropagation(); navigate(`/simulation/${s.id}`); }}>
                  Mulai Simulasi →
                </button>
              </div>
            ))}
          </div>

          <div className="guide-section">
            <h2>📖 Panduan Simulasi</h2>
            <div className="guide-grid">
              <div className="guide-card">
                <h3>📞 Proses Panggilan</h3>
                <p>Terima panggilan dari nasabah. Perhatikan channel yang digunakan (myBCA/BCA Mobile/bca.co.id).</p>
              </div>
              <div className="guide-card">
                <h3>🔍 KYC & Verifikasi</h3>
                <p>Lakukan KYC Singkat (jika KTP Lolos) atau Normal. Verifikasi identitas melalui Dukcapil.</p>
              </div>
              <div className="guide-card">
                <h3>📝 Konfirmasi Data</h3>
                <p>Konfirmasi data statis dan dinamis. Isi EDD untuk nasabah NRT (5 field wajib).</p>
              </div>
              <div className="guide-card">
                <h3>👔 Approval SPV</h3>
                <p>Supervisor verifikasi 6 bagian: Pre-DIN, Data Nasabah, CIS, Verifikasi, EDD, Perubahan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
