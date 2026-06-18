import { useParams, useNavigate } from "react-router-dom";
import { customerScenarios, stepLabels, stepIcons } from "../data/simulationData";

export default function ResultPage({ user }) {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const result = JSON.parse(sessionStorage.getItem(`sim_result_${scenarioId}`) || "null");

  if (!result) {
    return (
      <div>
        <div className="chain-header">
          <div className="chain-header-left"><div><span className="chain-logo">SPRO</span><span className="chain-logo-sub">Simulasi Pembukaan Rekening Online</span></div></div>
          <div className="chain-header-right"><button className="header-logout" onClick={() => navigate("/dashboard")}>Dashboard</button></div>
        </div>
        <div className="result-page"><div className="result-content"><h2>Data tidak ditemukan</h2><button className="btn-primary" onClick={() => navigate("/dashboard")}>Kembali</button></div></div>
      </div>
    );
  }

  const scenario = customerScenarios.find(s => s.id === parseInt(scenarioId));
  const getGrade = (score) => {
    if (score >= 90) return { grade: "A", label: "Excellent", color: "#28a745" };
    if (score >= 75) return { grade: "B", label: "Good", color: "#0078d4" };
    if (score >= 60) return { grade: "C", label: "Fair", color: "#ffc107" };
    return { grade: "D", label: "Need Improvement", color: "#dc3545" };
  };
  const { grade, label, color } = getGrade(result.score);

  return (
    <div>
      <div className="chain-header">
        <div className="chain-header-left">
          <div><span className="chain-logo">SPRO</span><span className="chain-logo-sub">Simulasi Pembukaan Rekening Online</span></div>
          <span style={{ opacity: .3, margin: "0 8px" }}>|</span>
          <span style={{ fontSize: ".8rem", opacity: .7 }}>Hasil Simulasi</span>
        </div>
        <div className="chain-header-right">
          <span className="agent-name">{user.name}</span>
          <button className="header-logout" onClick={() => navigate("/dashboard")}>Dashboard</button>
        </div>
      </div>

      <div className="result-page">
        <div className="result-content">
          <div className="result-header">
            <h1>Hasil Simulasi</h1>
            <h2>{result.scenarioTitle}</h2>
          </div>

          <div className="score-section">
            <div className="score-circle" style={{ borderColor: color }}>
              <div className="score-number" style={{ color }}>{result.score}</div>
              <div className="score-label">dari 100</div>
            </div>
            <div className="score-details">
              <div className="grade-badge" style={{ background: color }}>
                <span className="grade-letter">{grade}</span>
                <span className="grade-text">{label}</span>
              </div>
              <div className="score-stats">
                <div className="stat"><span className="stat-value">{result.correctActions}</span><span className="stat-label">Benar</span></div>
                <div className="stat"><span className="stat-value">{result.totalActions - result.correctActions}</span><span className="stat-label">Salah</span></div>
                <div className="stat"><span className="stat-value">{result.totalActions}</span><span className="stat-label">Total</span></div>
              </div>
            </div>
          </div>

          <div className="result-detail-section">
            <h3>📋 Detail Setiap Langkah</h3>
            <div className="step-results-list">
              {result.stepResults.map((sr, idx) => (
                <div key={idx} className={`step-result-item ${sr.isCorrect ? "correct" : "wrong"}`}>
                  <div className="step-result-icon">{sr.isCorrect ? "✅" : "❌"}</div>
                  <div className="step-result-content">
                    <div className="step-result-header">
                      <span className="step-result-label">{stepIcons[sr.step] || "📌"} {sr.stepLabel}</span>
                      <span className={`step-result-badge ${sr.isCorrect ? "badge-success" : "badge-danger"}`}>{sr.isCorrect ? "Benar" : "Salah"}</span>
                    </div>
                    <p className="step-result-action">Tindakan: {sr.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="result-feedback">
            <h3>💡 Feedback</h3>
            {result.score >= 90 ? <p>Luar biasa! Anda sangat memahami prosedur pembukaan rekening online.</p>
              : result.score >= 75 ? <p>Bagus! Perhatikan langkah yang masih salah untuk peningkatan.</p>
              : result.score >= 60 ? <p>Cukup baik. Ada beberapa prosedur yang perlu dipelajari kembali.</p>
              : <p>Anda perlu mempelajari kembali materi pelatihan pembukaan rekening. Baca panduan dan coba lagi.</p>}
          </div>

          <div className="result-actions">
            <button className="btn-primary" onClick={() => navigate(`/simulation/${scenarioId}`)}>🔄 Ulangi Skenario</button>
            <button className="btn-secondary" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
}
