import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { customerScenarios, stepLabels, stepIcons } from "../data/simulationData";
import ChatWidget from "../components/ChatWidget";
import SPVApproval from "../components/SPVApproval";

export default function SimulationPage({ user }) {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const scenario = customerScenarios.find((s) => s.id === parseInt(scenarioId));

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalActions, setTotalActions] = useState(0);
  const [correctActions, setCorrectActions] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionResult, setActionResult] = useState(null);
  const [showNextBtn, setShowNextBtn] = useState(false);
  const [verificationChecks, setVerificationChecks] = useState({});
  const [isInSPVMode, setIsInSPVMode] = useState(false);
  const [spvDecision, setSpvDecision] = useState(null);
  const [stepResults, setStepResults] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [captured, setCaptured] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [flashEffect, setFlashEffect] = useState(false);
  const [muteOn, setMuteOn] = useState(false);

  const totalSteps = scenario ? scenario.conversationFlow.length + 2 : 0;

  useEffect(() => {
    if (!scenario) { navigate("/dashboard"); return; }
    initStep(0);
  }, [scenario]);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const getTime = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const initStep = (stepIdx) => {
    setSelectedAction(null);
    setActionResult(null);
    setShowNextBtn(false);
    setVerificationChecks({});
    setCaptured(false);

    if (stepIdx < scenario.conversationFlow.length) {
      const step = scenario.conversationFlow[stepIdx];
      const msgs = [];
      if (step.systemInfo) msgs.push({ type: "system", text: step.systemInfo, time: getTime() });
      if (step.customerMessage) msgs.push({ type: "customer", sender: scenario.customer.nama, text: step.customerMessage, time: getTime() });
      if (step.customerQuestions?.length > 0) {
        msgs.push({ type: "system", text: "Nasabah mungkin bertanya:", time: getTime() });
        step.customerQuestions.forEach(q => msgs.push({ type: "customer", sender: scenario.customer.nama, text: `"${q}"`, time: getTime() }));
      }
      if (step.kycQuestions) {
        msgs.push({ type: "system", text: "Pertanyaan KYC yang harus ditanyakan:", time: getTime() });
        step.kycQuestions.forEach(q => msgs.push({ type: "system", text: `• ${q}`, time: getTime() }));
      }
      setChatMessages(msgs);
    } else if (stepIdx === scenario.conversationFlow.length) {
      setIsInSPVMode(true);
      setChatMessages([
        { type: "system", text: "Data telah disubmit ke Supervisor untuk approval.", time: getTime() },
        { type: "system", text: "Supervisor sedang melakukan verifikasi...", time: getTime() },
      ]);
    } else {
      setIsComplete(true);
    }
  };

  const handleActionSelect = (action) => {
    if (selectedAction) return;
    setSelectedAction(action);
    setTotalActions(p => p + 1);
    const isCorrect = action.isCorrect;
    if (isCorrect) { setCorrectActions(p => p + 1); setScore(p => p + 10); }
    setActionResult({
      type: isCorrect ? "correct" : "wrong",
      message: isCorrect ? "Benar! Tindakan Anda tepat." : "Kurang tepat. Perhatikan prosedur yang benar.",
      detail: isCorrect ? getCorrectDetail(currentStepIndex) : getWrongDetail(currentStepIndex),
    });
    setChatMessages(prev => [
      ...prev,
      { type: "agent", text: action.text, time: getTime() },
      { type: "system", text: isCorrect ? "Tindakan benar!" : "Tindakan kurang tepat.", time: getTime() },
    ]);
    setStepResults(prev => [...prev, {
      step: scenario.conversationFlow[currentStepIndex]?.step,
      stepLabel: stepLabels[scenario.conversationFlow[currentStepIndex]?.step] || "Unknown",
      action: action.text, isCorrect,
    }]);
    setShowNextBtn(true);
  };

  const handleNext = () => {
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < totalSteps) { setCurrentStepIndex(nextIdx); initStep(nextIdx); }
  };

  const handleSPVDecision = (decision) => {
    setSpvDecision(decision);
    setTotalActions(p => p + 1);
    if (decision === "approve") { setCorrectActions(p => p + 1); setScore(p => p + 10); }
    setChatMessages(prev => [...prev, {
      type: "system",
      text: decision === "approve" ? "Supervisor menyetujui pembukaan rekening." : "Supervisor meminta revisi.",
      time: getTime(),
    }]);
    setStepResults(prev => [...prev, { step: "spv_approval", stepLabel: "Approval Supervisor", action: decision === "approve" ? "Menyetujui" : "Request Revisi", isCorrect: decision === "approve" }]);
    setShowNextBtn(true);
  };

  const handleFinish = () => {
    const finalScore = Math.round((correctActions / Math.max(totalActions, 1)) * 100);
    const result = { scenarioId: scenario.id, scenarioTitle: scenario.title, score: finalScore, correctActions, totalActions, stepResults, timestamp: new Date().toISOString() };
    sessionStorage.setItem(`sim_result_${scenarioId}`, JSON.stringify(result));
    const completed = parseInt(sessionStorage.getItem("sim_completed") || "0") + 1;
    sessionStorage.setItem("sim_completed", completed.toString());
    const allScores = JSON.parse(sessionStorage.getItem("sim_scores") || "[]");
    allScores.push(finalScore);
    sessionStorage.setItem("sim_scores", JSON.stringify(allScores));
    sessionStorage.setItem("sim_avg_score", Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length).toString());
    navigate(`/result/${scenarioId}`);
  };

  if (!scenario) return null;
  const currentStep = scenario.conversationFlow[currentStepIndex];
  const currentStepKey = currentStep?.step || (isInSPVMode ? "spv_approval" : "ringkasan_transaksi");
  const allSteps = [...scenario.conversationFlow.map(s => s.step), "spv_approval", "ringkasan_transaksi"];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Selamat Pagi";
    if (h < 15) return "Selamat Siang";
    if (h < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="sim-page">
      {/* ===== CHAIN HEADER ===== */}
      <div className="chain-header">
        <div className="chain-header-left">
          <div>
            <span className="chain-logo">SPRO</span>
            <span className="chain-logo-sub">Simulasi Pembukaan Rekening Online</span>
          </div>
        </div>
        <div className="chain-header-center">Durasi : {formatTime(elapsed)}</div>
        <div className="chain-header-right">
          <span>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} - {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
          <span className="greeting">{greeting()},</span>
          <span className="agent-name">{user.name}</span>
          <button className="header-logout" onClick={() => navigate("/dashboard")}>Keluar</button>
        </div>
      </div>

      <div className="sim-wrap">
        {/* ===== STEP PROGRESS BAR ===== */}
        <div className="step-progress">
          {allSteps.map((step, idx) => (
            <span key={idx} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span className={`step-prog-item ${idx < currentStepIndex ? "completed" : idx === currentStepIndex ? "active" : ""}`}>
                {idx + 1}. {stepLabels[step]}
              </span>
              {idx < allSteps.length - 1 && <span className="step-prog-arrow">›</span>}
            </span>
          ))}
        </div>

        {/* ===== 3-COLUMN BODY ===== */}
        <div className="sim-body">
          {/* LEFT PANEL - Customer Info */}
          <div className="sim-left-panel">
            <div className="left-panel-title">Pembukaan Rekening via {scenario.channel}</div>
            <div className="customer-info">
              <div className="ci-name">{scenario.customer.nama}</div>
              <div className="ci-phone">{scenario.customer.noHP}</div>
              <div>
                {scenario.kycStatus === "lolos" ? (
                  <span className="kyc-badge-yellow">KTP Lolos KYC</span>
                ) : (
                  <span className="kyc-badge-green" style={{ background: "#fff3cd", color: "#856404" }}>KYC Normal</span>
                )}
              </div>
              {scenario.isNRT && <span className="nrt-tag">NRT</span>}
              {scenario.isHistoriTolak && <span className="reject-tag">TOLAK &gt;</span>}
            </div>
            <div className="pre-din-section">
              <div className="pre-din-label">DOKUMEN Pre-DIN</div>
              <div className="ktp-card">
                <div className="ktp-header">PROVINSI DKI JAKARTA</div>
                <div className="ktp-row"><span className="ktp-label">NIK</span><span className="ktp-value">: {scenario.customer.nik}</span></div>
                <div className="ktp-row"><span className="ktp-label">Nama</span><span className="ktp-value">: {scenario.customer.nama}</span></div>
                <div className="ktp-row"><span className="ktp-label">TTL</span><span className="ktp-value">: {scenario.customer.tempatLahir}, {scenario.customer.tanggalLahir}</span></div>
                <div className="ktp-row"><span className="ktp-label">Alamat</span><span className="ktp-value">: {scenario.customer.alamat.substring(0, 30)}...</span></div>
                <div className="ktp-row"><span className="ktp-label">Pekerjaan</span><span className="ktp-value">: {scenario.customer.pekerjaan}</span></div>
                <div className="ktp-photo">📷</div>
              </div>
            </div>
          </div>

          {/* CENTER - Camera + Content */}
          <div className="sim-center">
            {/* Video Call Camera */}
            <div className="camera-area">
              <div className="camera-main">
                {flashEffect && <div className="camera-flash" />}
                {cameraOn ? (
                  <>
                    <div className="camera-person">
                      <div className="camera-avatar camera-avatar-live">
                        <div className="avatar-pulse" />
                        👤
                      </div>
                      <div className="camera-name">{scenario.customer.nama}</div>
                      <div className="camera-status">Video Call - {scenario.channel}</div>
                      <div className="camera-live-badge"><span className="live-dot" /> LIVE</div>
                    </div>
                    <div className="camera-inset">
                      👤
                      <span className="camera-inset-label">Agent</span>
                    </div>
                  </>
                ) : (
                  <div className="camera-off-msg">
                    <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>📹</div>
                    <div>Kamera Dimatikan</div>
                    <div style={{ fontSize: ".7rem", opacity: .6, marginTop: 4 }}>Klik ikon kamera untuk mengaktifkan</div>
                  </div>
                )}
                <div className="camera-duration">
                  <span className="rec-dot"></span>
                  {formatTime(elapsed)}
                </div>
                {!captured && (
                  <button className="capture-btn" onClick={() => {
                    setFlashEffect(true);
                    setTimeout(() => { setFlashEffect(false); setCaptured(true); }, 400);
                  }}>📷 Ambil Foto</button>
                )}
                {captured && (
                  <span className="capture-btn captured-ok">✅ Foto Diambil</span>
                )}
              </div>
              <div className="camera-controls">
                <button className={`cam-btn ${muteOn ? "cam-off" : ""}`} title="Mute" onClick={() => setMuteOn(!muteOn)}>{muteOn ? "🔇" : "🎤"}</button>
                <button className={`cam-btn ${!cameraOn ? "cam-off" : ""}`} title="Camera" onClick={() => setCameraOn(!cameraOn)}>{cameraOn ? "📹" : "📷"}</button>
                <button className="cam-btn" title="Keyboard">⌨️</button>
                <button className="cam-btn" title="Gallery">🖼️</button>
                <button className="cam-btn record" title="Record">⏺</button>
                <button className="cam-btn hold">Hold</button>
              </div>
            </div>

            {/* Step Content Area */}
            <div className="content-area">
              {isComplete ? (
                <div className="complete-card">
                  <h2>🎉 Simulasi Selesai!</h2>
                  <p>Semua langkah telah diselesaikan. Rekening nasabah berhasil dibuat.</p>
                  <button className="btn-primary" onClick={handleFinish}>Lihat Hasil & Skor →</button>
                </div>
              ) : isInSPVMode ? (
                <SPVApproval scenario={scenario} stepResults={stepResults} onDecision={handleSPVDecision} decided={!!spvDecision} />
              ) : (
                <>
                  {/* Step Title */}
                  <div className="content-title">{stepIcons[currentStepKey]} {stepLabels[currentStepKey]}</div>
                  <p style={{ fontSize: ".82rem", color: "var(--text-light)", marginBottom: 12 }}>
                    {getStepDescription(currentStepKey, scenario)}
                  </p>

                  {/* Call History for Ringkasan */}
                  {currentStepKey === "ringkasan_panggilan" && (
                    <div className="call-history">
                      <h5>History Panggilan Terputus</h5>
                      <div className="call-entry">
                        <div className="ce-time">18 Jun 2026 - 14:22</div>
                        <div className="ce-agent">Agent Previous</div>
                        <div className="ce-reason">Aplikasi Maintenance - Aplikasi tiba-tiba tidak dapat diakses</div>
                      </div>
                      <div className="capture-area">
                        Klik dan Paste di sini
                        <br />
                        <button onClick={() => setCaptured(true)}>📷 Ambil Foto</button>
                      </div>
                    </div>
                  )}

                  {/* Verification checklist */}
                  {currentStepKey === "verifikasi_identitas" && currentStep?.verificationChecklist && (
                    <div>
                      <div className="content-title" style={{ fontSize: ".85rem" }}>Cocokkan Pre-DIN & Pastikan Kualitasnya Bagus</div>
                      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                        <div className="ktp-card" style={{ flex: 1 }}>
                          <div className="ktp-header">KTP-EL Pre-DIN</div>
                          <div className="ktp-row"><span className="ktp-label">NIK</span><span className="ktp-value">: {scenario.customer.nik}</span></div>
                          <div className="ktp-row"><span className="ktp-label">Nama</span><span className="ktp-value">: {scenario.customer.nama}</span></div>
                          <div className="ktp-photo">📷</div>
                        </div>
                        <div style={{ flex: 1, background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 4, padding: 10, textAlign: "center" }}>
                          <div style={{ fontSize: ".72rem", fontWeight: 600, marginBottom: 8 }}>TANDA TANGAN Pre-DIN</div>
                          <div style={{ fontSize: "2rem", color: "#999" }}>✍️</div>
                        </div>
                      </div>
                      <div className="verify-checklist">
                        {currentStep.verificationChecklist.map((item, idx) => (
                          <label key={idx} className={`verify-item ${verificationChecks[item] ? "checked" : ""}`}>
                            <input type="checkbox" checked={!!verificationChecks[item]} onChange={() => setVerificationChecks(p => ({ ...p, [item]: !p[item] }))} />
                            <span>{item}</span>
                            {verificationChecks[item] && <span style={{ marginLeft: "auto" }}>✅</span>}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Data confirmation */}
                  {currentStepKey === "konfirmasi_data" && (
                    <div className="data-compare">
                      <h5>Data Statis</h5>
                      {currentStep?.staticData?.map((item, idx) => (
                        <div key={idx} className="data-field"><span className="df-label">Sistem:</span><span className="df-value">{item}</span></div>
                      ))}
                      <h5 style={{ marginTop: 10 }}>Data Dinamis</h5>
                      {currentStep?.dynamicData?.map((item, idx) => (
                        <div key={idx} className="data-field"><span className="df-label">Sistem:</span><span className="df-value">{item}</span></div>
                      ))}
                      <div className="dukcapil-box">
                        <h5>🏛️ Data Dukcapil (Web Portal)</h5>
                        <div className="data-field"><span className="df-label">NIK</span><span className="df-value">{scenario.dukcapilData.nik}</span></div>
                        <div className="data-field"><span className="df-label">Nama</span><span className="df-value">{scenario.dukcapilData.nama}</span></div>
                        <div className="data-field"><span className="df-label">TTL</span><span className="df-value">{scenario.dukcapilData.tempatLahir}, {scenario.dukcapilData.tanggalLahir}</span></div>
                        <div className="data-field"><span className="df-label">Pekerjaan</span><span className="df-value">{scenario.dukcapilData.pekerjaan}</span></div>
                        <div className="data-field"><span className="df-label">Status</span><span className="df-value">{scenario.dukcapilData.statusKawin}</span></div>
                      </div>
                      <div className="hint-box">Bandingkan data dukcapil di web portal dengan isian field di sistem</div>
                    </div>
                  )}

                  {/* EDD for NRT */}
                  {currentStepKey === "konfirmasi_nasabah_edd" && currentStep?.eddFields && (
                    <div className="edd-box">
                      <h5>⚠️ Data EDD (Enhanced Due Diligence)</h5>
                      {currentStep.eddFields.map((field, idx) => (
                        <div key={idx} className="edd-field">
                          <label>{field.label}:</label>
                          <span>{field.answer}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* SPV show next */}
              {isInSPVMode && showNextBtn && !isComplete && (
                <div style={{ marginTop: 16 }}>
                  <button className="btn-primary btn-full" onClick={handleNext}>Lanjut ke Ringkasan Transaksi →</button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="sim-right-panel">
            <div className="right-panel-header">
              {isComplete ? "Selesai" : isInSPVMode ? "👔 Approval Supervisor" : `🎯 ${stepLabels[currentStepKey]}`}
            </div>
            <div className="right-panel-body">
              {isComplete ? (
                <p style={{ fontSize: ".85rem", color: "var(--text-light)" }}>Semua langkah telah diselesaikan.</p>
              ) : isInSPVMode ? (
                <div>
                  <p style={{ fontSize: ".82rem", color: "var(--text-light)", marginBottom: 12 }}>
                    Verifikasi 6 bagian data nasabah sebelum memberikan approval.
                  </p>
                  {spvDecision && (
                    <div className={`spv-result-msg ${spvDecision === "approve" ? "approved" : "revised"}`}>
                      {spvDecision === "approve" ? "✅ Supervisor menyetujui." : "🔄 Supervisor meminta revisi."}
                    </div>
                  )}
                  {!spvDecision && (
                    <div className="spv-actions" style={{ padding: 0, borderTop: "none" }}>
                      <button className="btn-approve" onClick={() => handleSPVDecision("approve")}>✅ Setuju</button>
                      <button className="btn-revisi" onClick={() => handleSPVDecision("revisi")}>🔄 Revisi</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Chat preview */}
                  {chatMessages.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      {chatMessages.slice(-3).map((msg, idx) => (
                        <div key={idx} className={`chat-msg-float ${msg.type === "customer" || msg.type === "customer_question" ? "customer" : msg.type === "agent" ? "agent" : "system"}`} style={{ marginBottom: 4 }}>
                          {msg.type === "customer" && <div className="msg-sender">👤 {msg.sender}</div>}
                          <div style={{ fontSize: ".8rem" }}>{msg.text}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action choices */}
                  {!isComplete && !isInSPVMode && currentStep?.correctActions && (
                    <div>
                      <div style={{ fontSize: ".82rem", fontWeight: 600, marginBottom: 8 }}>Pilih Tindakan yang Benar:</div>
                      <div className="action-choices">
                        {currentStep.correctActions.map((action) => (
                          <button
                            key={action.id}
                            className={`action-choice-btn ${selectedAction?.id === action.id ? (action.isCorrect ? "correct" : "wrong") : ""} ${selectedAction && !selectedAction.isCorrect && action.isCorrect ? "reveal-correct" : ""}`}
                            onClick={() => handleActionSelect(action)}
                            disabled={!!selectedAction}
                          >
                            {action.text}
                          </button>
                        ))}
                      </div>

                      {actionResult && (
                        <div className={`action-feedback ${actionResult.type}`}>
                          <strong>{actionResult.type === "correct" ? "✅" : "❌"} {actionResult.message}</strong>
                          <p>{actionResult.detail}</p>
                        </div>
                      )}

                      {showNextBtn && (
                        <button className="btn-primary btn-full" style={{ marginTop: 12 }} onClick={handleNext}>
                          {currentStepIndex + 1 >= scenario.conversationFlow.length ? "Lanjut ke Approval SPV →" : "Langkah Berikutnya →"}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ===== BOTTOM ACTION BAR ===== */}
        {!isComplete && (
          <div className="action-bar">
            <div className="action-bar-left">
              <button className="btn-back" onClick={() => navigate("/dashboard")}>← Kembali</button>
            </div>
            <div className="action-bar-right">
              <button className="btn-reject">Tolak</button>
              <button className="btn-continue" disabled={!showNextBtn && !isComplete} onClick={isComplete ? handleFinish : showNextBtn ? handleNext : undefined}>
                Lanjut
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}

function getStepDescription(stepKey, scenario) {
  const d = {
    incoming_call: "Terima panggilan masuk dari nasabah dan konfirmasi tujuan pembukaan rekening.",
    ringkasan_panggilan: `Capture layar video call dan periksa history panggilan terputus. Channel: ${scenario.channel}`,
    kyc_check: scenario.kycStatus === "lolos" ? "KTP Lolos KYC - Lakukan KYC Singkat." : "KTP Tidak Lolos - Lakukan KYC Normal.",
    verifikasi_identitas: "Verifikasi identitas: bandingkan foto KTP, Dukcapil, Pre-DIN, dan tandatangan.",
    konfirmasi_data: "Konfirmasi data statis (Nama, TTL) dan dinamis (Pekerjaan).",
    search_cis: "Cari CIS nasabah. Tentukan nasabah baru atau existing.",
    konfirmasi_nasabah: "Konfirmasi nama gadis ibu kandung dan pastikan semua data benar.",
    konfirmasi_nasabah_edd: "Konfirmasi data nasabah + lengkapi data EDD (nasabah NRT).",
    submit_spv: "Submit data ke Supervisor untuk approval.",
    spv_approval: "Supervisor melakukan verifikasi dan approval.",
    ringkasan_transaksi: "Transaksi selesai.",
  };
  return d[stepKey] || "";
}

function getCorrectDetail(i) {
  const d = [
    "CSO harus menyapa nasabah dan mengkonfirmasi tujuan pembukaan rekening.",
    "Agent wajib capture layar video call dan memeriksa history panggilan terputus.",
    "KYC harus sesuai status: Singkat jika lolos, Normal jika tidak.",
    "Verifikasi harus membandingkan foto KTP, dukcapil, Pre-DIN, dan tandatangan.",
    "Data statis DAN dinamis harus dikonfirmasi dan dibandingkan dukcapil.",
    "Periksa CIS. Pilih nasabah baru jika tidak ditemukan, atau verifikasi existing.",
    "Nama gadis ibu kandung wajib dikonfirmasi langsung ke nasabah.",
    "Semua field EDD WAJIB dilengkapi untuk nasabah NRT.",
    "Data wajib disubmit ke supervisor untuk approval.",
    "Supervisor menyetujui karena semua verifikasi benar.",
  ];
  return d[i] || "Tindakan sesuai prosedur.";
}

function getWrongDetail(i) {
  const d = [
    "Seharusnya CSO menyapa nasabah terlebih dahulu.",
    "Capture layar dan pemeriksaan history adalah langkah wajib.",
    "Perhatikan status KYC! Singkat jika lolos, Normal jika tidak.",
    "Verifikasi harus membandingkan semua foto dan tandatangan.",
    "Kedua data (statis DAN dinamis) harus dikonfirmasi ke nasabah.",
    "Periksa CIS dengan benar sesuai parameter.",
    "Nama gadis ibu kandung wajib dikonfirmasi langsung.",
    "Untuk NRT, semua EDD WAJIB dilengkapi.",
    "Rekening baru tidak bisa dibuat tanpa approval supervisor.",
    "Supervisor seharusnya menyetujui jika data benar.",
  ];
  return d[i] || "Perhatikan kembali prosedur yang benar.";
}
