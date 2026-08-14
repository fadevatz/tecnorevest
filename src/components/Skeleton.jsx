import React from "react";

// Componente genérico de bloco Skeleton com efeito Shimmer
export function SkeletonBlock({ width = "100%", height = "20px", borderRadius = "6px", style = {} }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
}

// Skeleton para o Dashboard
export function DashboardSkeleton() {
  return (
    <div className="dashboard-container page-entrance">
      {/* 5 Cards de Métricas Skeleton */}
      <div className="metrics-grid">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="metric-card glass-card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              <SkeletonBlock width="60%" height="12px" />
              <SkeletonBlock width="40%" height="24px" borderRadius="8px" />
            </div>
            <SkeletonBlock width="38px" height="38px" borderRadius="10px" />
          </div>
        ))}
      </div>

      {/* Grid de Seções do Dashboard Skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginTop: "20px" }}>
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <SkeletonBlock width="200px" height="20px" />
            <SkeletonBlock width="80px" height="20px" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <SkeletonBlock width="40px" height="40px" borderRadius="8px" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <SkeletonBlock width="70%" height="14px" />
                <SkeletonBlock width="40%" height="10px" />
              </div>
              <SkeletonBlock width="80px" height="24px" borderRadius="12px" />
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <SkeletonBlock width="150px" height="20px" />
          <SkeletonBlock width="100%" height="180px" borderRadius="12px" />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <SkeletonBlock width="100%" height="12px" />
            <SkeletonBlock width="80%" height="12px" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton para a Agenda Gantt
export function AgendaSkeleton() {
  return (
    <div className="agenda-container page-entrance">
      {/* Header do Cronograma */}
      <div className="glass-card" style={{ padding: "16px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SkeletonBlock width="220px" height="24px" />
        <div style={{ display: "flex", gap: "10px" }}>
          <SkeletonBlock width="120px" height="34px" borderRadius="8px" />
          <SkeletonBlock width="100px" height="34px" borderRadius="8px" />
        </div>
      </div>

      {/* Tabela do Cronograma Gantt Skeleton */}
      <div className="glass-card" style={{ padding: "16px" }}>
        <div style={{ display: "flex", gap: "10px", paddingBottom: "12px", borderBottom: "1px solid var(--card-border)" }}>
          <SkeletonBlock width="200px" height="24px" />
          <div style={{ flex: 1, display: "flex", gap: "6px" }}>
            {[...Array(15)].map((_, i) => (
              <SkeletonBlock key={i} width="100%" height="24px" borderRadius="4px" />
            ))}
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: "flex", gap: "10px", padding: "14px 0", borderBottom: "1px solid var(--card-border)" }}>
            <SkeletonBlock width="200px" height="32px" borderRadius="6px" />
            <div style={{ flex: 1, display: "flex", gap: "6px", alignItems: "center" }}>
              <SkeletonBlock width="35%" height="28px" borderRadius="6px" style={{ marginLeft: `${(i * 12) % 40}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton para Tabelas de Módulos (Funcionários, Equipes, Lista de Projetos)
export function ModuleTableSkeleton({ title = "Carregando Módulo..." }) {
  return (
    <div className="module-container page-entrance">
      <div className="glass-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <SkeletonBlock width="200px" height="26px" />
          <SkeletonBlock width="140px" height="38px" borderRadius="8px" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", gap: "12px", padding: "10px", background: "var(--bg-light)", borderRadius: "8px" }}>
            <SkeletonBlock width="25%" height="16px" />
            <SkeletonBlock width="25%" height="16px" />
            <SkeletonBlock width="25%" height="16px" />
            <SkeletonBlock width="25%" height="16px" />
          </div>

          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px 10px", borderBottom: "1px solid var(--card-border)" }}>
              <SkeletonBlock width="36px" height="36px" borderRadius="50%" />
              <SkeletonBlock width="22%" height="14px" />
              <SkeletonBlock width="22%" height="14px" />
              <SkeletonBlock width="20%" height="24px" borderRadius="12px" />
              <SkeletonBlock width="15%" height="14px" />
              <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                <SkeletonBlock width="28px" height="28px" borderRadius="6px" />
                <SkeletonBlock width="28px" height="28px" borderRadius="6px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Top Bar Loading Progress Indicator (Kyle Zantos Motion Principle)
export function TopProgressBar({ isAnimating = false }) {
  return (
    <div className={`top-progress-bar-container ${isAnimating ? "active" : ""}`}>
      <div className="top-progress-bar-fill" />
    </div>
  );
}
