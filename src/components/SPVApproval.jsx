import { useState } from "react";

export default function SPVApproval({ scenario, stepResults, onDecision, decided }) {
  const [activeTab, setActiveTab] = useState(0);

  const verificationParts = [
    {
      title: "Pre-DIN",
      content: `Foto Pre-DIN nasabah sudah dicapture saat video call.\nNama: ${scenario.customer.nama}\nNIK: ${scenario.customer.nik}`,
      status: "verified",
    },
    {
      title: "Data Nasabah",
      content: `NIK: ${scenario.customer.nik}\nNama: ${scenario.customer.nama}\nTTL: ${scenario.customer.tempatLahir}, ${scenario.customer.tanggalLahir}\nAlamat: ${scenario.customer.alamat}\nPekerjaan: ${scenario.customer.pekerjaan}`,
      status: "verified",
    },
    {
      title: "Data CIS",
      content:
        scenario.cisResult === "not_found"
          ? "Tidak ditemukan CIS existing. Nasabah baru."
          : `CIS existing ditemukan.\nRekening: ${scenario.existingCIS?.noRekening || "N/A"}\nProduk: ${scenario.existingCIS?.produk?.join(", ") || "N/A"}\nStatus: ${scenario.existingCIS?.statusRekening || "N/A"}`,
      status: scenario.cisResult === "not_found" ? "new" : "existing",
    },
    {
      title: "Hasil Verifikasi Nasabah",
      content:
        scenario.cisResult !== "not_found"
          ? `Verifikasi pertanyaan kelompok 1 dan 2 sudah dilakukan.\nNasabah dikonfirmasi sebagai pemilik CIS existing.`
          : "Nasabah baru - tidak perlu verifikasi CIS existing.",
      status: "verified",
    },
    {
      title: "Data EDD",
      content: scenario.isNRT && scenario.nrtData
        ? `Alasan Risiko: ${scenario.nrtData.alasanRisikoTinggi}\nLama Tinggal: ${scenario.nrtData.lamaTinggal}\nBank Lain: ${scenario.nrtData.rekeningBankLain}\nHubungan LN: ${scenario.nrtData.hubunganLuarNegeri}\nSumber Kekayaan: ${scenario.nrtData.sumberKekayaan}`
        : "Tidak diperlukan (nasabah bukan NRT).",
      status: scenario.isNRT ? "required" : "not_required",
    },
    {
      title: "Data Perubahan",
      content: "Tidak ada data yang mengalami perubahan selama proses ini.",
      status: "no_change",
    },
  ];

  return (
    <div className="spv-approval">
      <h4>👔 Approval Supervisor</h4>
      <p className="spv-desc">
        Verifikasi 6 bagian berikut sebelum memberikan approval:
      </p>

      <div className="spv-tabs">
        {verificationParts.map((part, idx) => (
          <button
            key={idx}
            className={`spv-tab ${activeTab === idx ? "active" : ""}`}
            onClick={() => setActiveTab(idx)}
          >
            {idx + 1}. {part.title}
          </button>
        ))}
      </div>

      <div className="spv-content">
        <div className="spv-part">
          <div className="spv-part-header">
            <h5>{verificationParts[activeTab].title}</h5>
            <span className={`spv-status ${verificationParts[activeTab].status}`}>
              {verificationParts[activeTab].status === "verified"
                ? "✅ Terverifikasi"
                : verificationParts[activeTab].status === "new"
                ? "🆕 Nasabah Baru"
                : verificationParts[activeTab].status === "existing"
                ? "📋 Existing"
                : verificationParts[activeTab].status === "required"
                ? "⚠️ Wajib Diisi"
                : verificationParts[activeTab].status === "not_required"
                ? "➖ Tidak Diperlukan"
                : "➖ Tidak Ada Perubahan"}
            </span>
          </div>
          <pre className="spv-part-content">
            {verificationParts[activeTab].content}
          </pre>
        </div>
      </div>

      {/* Dukcapil Reference */}
      <div className="spv-dukcapil">
        <h5>🏛️ Referensi Data Dukcapil</h5>
        <div className="dukcapil-ref">
          <p><strong>NIK:</strong> {scenario.dukcapilData.nik}</p>
          <p><strong>Nama:</strong> {scenario.dukcapilData.nama}</p>
          <p><strong>TTL:</strong> {scenario.dukcapilData.tempatLahir}, {scenario.dukcapilData.tanggalLahir}</p>
          <p><strong>Pekerjaan:</strong> {scenario.dukcapilData.pekerjaan}</p>
        </div>
      </div>

      {/* Step Results Summary */}
      <div className="spv-summary">
        <h5>📊 Ringkasan Tindakan CSO</h5>
        {stepResults.map((sr, idx) => (
          <div key={idx} className={`spv-step ${sr.isCorrect ? "correct" : "wrong"}`}>
            <span>{sr.isCorrect ? "✅" : "❌"}</span>
            <span>{sr.stepLabel}: {sr.action}</span>
          </div>
        ))}
      </div>

      {/* Decision Buttons */}
      {!decided && (
        <div className="spv-actions">
          <button
            className="btn-approve"
            onClick={() => onDecision("approve")}
          >
            ✅ Setuju - Approve
          </button>
          <button
            className="btn-revisi"
            onClick={() => onDecision("revisi")}
          >
            🔄 Request Revisi
          </button>
        </div>
      )}

      {decided && (
        <div className={`spv-result ${decided === "approve" ? "approved" : "revised"}`}>
          {decided === "approve"
            ? "✅ Supervisor menyetujui pembukaan rekening."
            : "🔄 Supervisor meminta revisi."}
        </div>
      )}
    </div>
  );
}
