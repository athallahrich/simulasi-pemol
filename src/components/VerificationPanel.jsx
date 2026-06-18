export default function VerificationPanel({ items, checks, onCheck }) {
  const allChecked = items.every((item) => checks[item]);

  return (
    <div className="verification-panel">
      <h4>🪪 Checklist Verifikasi Identitas</h4>
      <p className="vp-hint">Centang semua item setelah Anda memverifikasi melalui Dukcapil:</p>
      <div className="checklist">
        {items.map((item, idx) => (
          <label key={idx} className={`check-item ${checks[item] ? "checked" : ""}`}>
            <input
              type="checkbox"
              checked={!!checks[item]}
              onChange={() => onCheck(item)}
            />
            <span className="check-label">{item}</span>
            {checks[item] && <span className="check-icon">✅</span>}
          </label>
        ))}
      </div>
      {allChecked && (
        <div className="vp-success">
          ✅ Semua verifikasi identitas sudah lengkap!
        </div>
      )}
    </div>
  );
}
