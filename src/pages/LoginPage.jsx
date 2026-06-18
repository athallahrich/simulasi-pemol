import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId || !password) {
      setError("User ID dan Password wajib diisi!");
      return;
    }
    onLogin({
      id: userId,
      name: userId === "spv01" ? "Siti Astuti" : "Joko Santoso",
      role: userId === "spv01" ? "spv" : "cso",
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">🏦</div>
            <h1>SPRO</h1>
            <span className="subtitle">Simulasi Pembukaan Rekening Online</span>
          </div>
        </div>
        <div className="login-card">
          <h2>Login Agent</h2>
          <p className="login-desc">Masuk untuk memulai sesi simulasi pembukaan rekening</p>
          {error && <div className="alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>User ID</label>
              <input
                type="text"
                placeholder="Masukkan User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-login">LOGIN</button>
          </form>
          <div className="login-hint">
            <p><strong>Hint:</strong> CSO: <code>agent01</code> | SPV: <code>spv01</code></p>
            <p>Password: bebas (ketik apapun)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
