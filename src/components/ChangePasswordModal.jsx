import React, { useState } from "react";
import { changePasswordApi } from "../services/apiService";

export default function ChangePasswordModal({ isOpen, onClose, username = "Admin" }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("A nova senha e a confirmação não coincidem.");
      return;
    }

    if (newPassword.length < 3) {
      setError("A nova senha deve ter no mínimo 3 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await changePasswordApi(username, oldPassword, newPassword);
      if (res.success) {
        setSuccess("Senha alterada com sucesso!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setSuccess("");
          onClose();
        }, 1500);
      } else {
        setError(res.message || "Erro ao alterar a senha. Verifique a senha atual.");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>🔑 Alterar Senha de Acesso</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-banner" style={{ marginBottom: "16px" }}>{error}</div>}
        {success && <div style={{ background: "#c6f6d5", color: "#22543d", padding: "10px 14px", borderRadius: "8px", fontSize: "0.88rem", marginBottom: "16px", fontWeight: "600" }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "0.84rem", fontWeight: "600" }}>Senha Atual</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Digite a senha atual"
            />
          </div>

          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "0.84rem", fontWeight: "600" }}>Nova Senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha"
            />
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "0.84rem", fontWeight: "600" }}>Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Nova Senha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
