export default function StepPanel({ staticData, dynamicData, dukcapilData }) {
  return (
    <div className="step-panel">
      <h4>📊 Perbandingan Data Sistem vs Dukcapil</h4>

      <div className="data-section">
        <h5>Data Statis</h5>
        {staticData?.map((item, idx) => (
          <div key={idx} className="data-row">
            <span className="data-chain">📋 Sistem: {item}</span>
          </div>
        ))}
      </div>

      <div className="data-section">
        <h5>Data Dinamis</h5>
        {dynamicData?.map((item, idx) => (
          <div key={idx} className="data-row">
            <span className="data-chain">📋 Sistem: {item}</span>
          </div>
        ))}
      </div>

      {dukcapilData && (
        <div className="data-section dukcapil-section">
          <h5>🏛️ Data Dukcapil (Web Portal)</h5>
          <div className="dukcapil-grid">
            <div><span>NIK:</span> {dukcapilData.nik}</div>
            <div><span>Nama:</span> {dukcapilData.nama}</div>
            <div><span>TTL:</span> {dukcapilData.tempatLahir}, {dukcapilData.tanggalLahir}</div>
            <div><span>Alamat:</span> {dukcapilData.alamat}</div>
            <div><span>Pekerjaan:</span> {dukcapilData.pekerjaan}</div>
            <div><span>Status:</span> {dukcapilData.statusKawin}</div>
            <div><span>Agama:</span> {dukcapilData.agama}</div>
            <div><span>WN:</span> {dukcapilData.kewarganegaraan}</div>
          </div>
        </div>
      )}

      <div className="step-hint">
        <p>💡 Bandingkan data di sistem dengan data dukcapil. Pastikan semua data sesuai sebelum melanjutkan.</p>
      </div>
    </div>
  );
}
