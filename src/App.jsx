import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import SimulationPage from "./pages/SimulationPage";
import ResultPage from "./pages/ResultPage";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("sim_user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.setItem("sim_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem("sim_user");
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/simulation/:scenarioId"
            element={user ? <SimulationPage user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/result/:scenarioId"
            element={user ? <ResultPage user={user} /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
