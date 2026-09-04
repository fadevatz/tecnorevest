import React from "react";

export default function Dashboard({ projects, teams, employees, setActiveTab }) {
  // Calcular métricas
  const totalTeams = teams.length;
  const totalEmployees = employees.length;
  const totalProjects = projects.length;
  
  // Obras ativas / em operação (Em Andamento, Aguardando ou Indisponível)
  const activeObras = projects.filter(p => 
    p.status === "progress" || p.status === "waiting" || p.status === "unavailable"
  );
  const activeProjectsCount = activeObras.length;

  const getTeamName = (id) => {
    const team = teams.find(t => t.id === id);
    return team ? team.name : "Nenhuma";
  };

  const getTeamColor = (id) => {
    const team = teams.find(t => t.id === id);
    return team ? team.color : "var(--primary)";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "progress":
        return <span className="status-badge progress">Em Andamento</span>;
      case "waiting":
        return <span className="status-badge waiting">Aguardando</span>;
      case "unavailable":
        return <span className="status-badge unavailable">Indisponível</span>;
      case "completed":
        return <span className="status-badge completed">Concluído</span>;
      case "cancelled":
        return <span className="status-badge cancelled">Cancelado</span>;
      default:
        return <span className="status-badge planned">Programado</span>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Título */}
      <div>
        <h1>Dashboard Operacional</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "4px" }}>
          Bem-vindo ao Painel Tecno Revest. Veja abaixo o resumo da operação hoje.
        </p>
      </div>

      {/* ==========================================
         GRID DE INDICADORES
         ========================================== */}
      <div className="metrics-grid motion-cascade" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="glass-card metric-card">
          <div className="metric-details">
            <h3>Equipes Ativas</h3>
            <div className="metric-value">{totalTeams}</div>
          </div>
          <div className="metric-icon">👥</div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-details">
            <h3>Funcionários</h3>
            <div className="metric-value">{totalEmployees}</div>
          </div>
          <div className="metric-icon">👷</div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-details">
            <h3>Projetos Ativos</h3>
            <div className="metric-value" style={{ color: "var(--secondary)" }}>{activeProjectsCount}</div>
          </div>
          <div className="metric-icon">⚙️</div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-details">
            <h3>Total de Obras</h3>
            <div className="metric-value">{totalProjects}</div>
          </div>
          <div className="metric-icon">🏢</div>
        </div>
      </div>

      {/* Frentes de Trabalho */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
        
        {/* Projetos/Obras em Operação */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Frentes de Trabalho & Obras</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
            {activeObras.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
                Nenhuma obra em andamento, aguardando ou indisponível no momento.
              </div>
            ) : (
              activeObras.map(proj => {
                let stages = proj.stages;
                if (typeof stages === "string") {
                  try { stages = JSON.parse(stages); } catch (e) { stages = null; }
                }
                const stageList = Array.isArray(stages) && stages.length > 0 ? stages : [{ teamId: proj.teamId }];
                const uniqueTeamIds = [...new Set(stageList.map(s => s.teamId).filter(Boolean))];
                const teamNames = uniqueTeamIds.map(id => getTeamName(id)).join(", ") || "Nenhuma";
                const primaryTeamColor = getTeamColor(stageList[0]?.teamId || proj.teamId);

                return (
                  <div 
                    key={proj.id} 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: "16px",
                      background: "var(--bg-light)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--card-border)",
                      borderLeft: `5px solid ${primaryTeamColor}`
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <h4 style={{ fontSize: "0.92rem", fontWeight: "600", margin: 0 }}>{proj.name}</h4>
                        {getStatusBadge(proj.status)}
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                        Cliente: <strong>{proj.client}</strong> | Equipes: <strong>{teamNames}</strong> ({stageList.length} {stageList.length === 1 ? "etapa" : "etapas"})
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                        Término Previsto:
                      </span>
                      <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--secondary)" }}>
                        {proj.endDate ? proj.endDate.split("-").reverse().join("/") : "-"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Distribuição por Status */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Status das Obras</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "6px" }}>
            {/* Programado */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>Programado</span>
                <span>{totalProjects ? Math.round((projects.filter(p => p.status === "planned").length / totalProjects) * 100) : 0}%</span>
              </div>
              <div style={{ height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${totalProjects ? (projects.filter(p => p.status === "planned").length / totalProjects) * 100 : 0}%`, height: "100%", background: "#2b6cb0" }} />
              </div>
            </div>

            {/* Em Andamento */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>Em Andamento</span>
                <span>{totalProjects ? Math.round((projects.filter(p => p.status === "progress").length / totalProjects) * 100) : 0}%</span>
              </div>
              <div style={{ height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${totalProjects ? (projects.filter(p => p.status === "progress").length / totalProjects) * 100 : 0}%`, height: "100%", background: "#c05621" }} />
              </div>
            </div>

            {/* Aguardando */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>Aguardando</span>
                <span>{totalProjects ? Math.round((projects.filter(p => p.status === "waiting").length / totalProjects) * 100) : 0}%</span>
              </div>
              <div style={{ height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${totalProjects ? (projects.filter(p => p.status === "waiting").length / totalProjects) * 100 : 0}%`, height: "100%", background: "#d97706" }} />
              </div>
            </div>

            {/* Indisponível */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>Indisponível</span>
                <span>{totalProjects ? Math.round((projects.filter(p => p.status === "unavailable").length / totalProjects) * 100) : 0}%</span>
              </div>
              <div style={{ height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${totalProjects ? (projects.filter(p => p.status === "unavailable").length / totalProjects) * 100 : 0}%`, height: "100%", background: "#6b7280" }} />
              </div>
            </div>

            {/* Concluído */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>Concluído</span>
                <span>{totalProjects ? Math.round((projects.filter(p => p.status === "completed").length / totalProjects) * 100) : 0}%</span>
              </div>
              <div style={{ height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${totalProjects ? (projects.filter(p => p.status === "completed").length / totalProjects) * 100 : 0}%`, height: "100%", background: "#234e52" }} />
              </div>
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={() => setActiveTab("agenda")}
            style={{ marginTop: "auto", width: "100%", justifyContent: "center" }}
          >
            Ver Agenda Completa
          </button>
        </div>

      </div>
    </div>
  );
}
