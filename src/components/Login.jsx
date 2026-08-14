import React, { useState } from "react";
import logo from "../assets/logo.png";
import { loginApi } from "../services/apiService";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await loginApi(username, password);
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.message || "Usuário ou senha incorretos.");
      }
    } catch (err) {
      setError("Erro ao autenticar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="glass-card login-card">
        <div className="login-logo">
          <img src={logo} alt="Tecno Revest" />
        </div>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "8px", fontWeight: "700" }}>
          Agenda de Serviços
        </h2>
        <p className="login-subtitle">
          Painel de Programação Industrial
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: Admin"
              autoComplete="username"
            />
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ex: Admin"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "14px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Entrando..." : "Entrar no Painel"}
          </button>
        </form>

        <div style={{ marginTop: "24px", fontSize: "0.82rem", color: "var(--text-secondary)", background: "var(--bg-light)", padding: "12px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
          <p style={{ fontWeight: "600", marginBottom: "4px" }}>Primeiro Acesso:</p>
          <p style={{ fontFamily: "monospace" }}>
            Usuário: <span style={{ color: "var(--secondary)", fontWeight: "bold" }}>Admin</span> | Senha: <span style={{ color: "var(--secondary)", fontWeight: "bold" }}>Admin</span>
          </p>
        </div>
      </div>
    </div>
  );
}
