import React from "react";

export default function Dashboard({ projects, teams, employees, setActiveTab }) {
  // Calcular métricas originais
  const totalTeams = teams.length;
  const totalEmployees = employees.length;
  const totalProjects = projects.length;
  const progressProjects = projects.filter(p => p.status === "progress").length;

  // Projetos em execução hoje (status === "progress")
  const activeToday = projects.filter(p => p.status === "progress");

  const getTeamName = (id) => {
    const team = teams.find(t => t.id === id);
    return team ? team.name : "Nenhuma";
  };

  const getTeamColor = (id) => {
    const team = teams.find(t => t.id === id);
    return team ? team.color : "var(--primary)";
  };

  // Agrupar frentes em andamento por data de início para um visual organizado
  const groupedProjects = {};
  activeToday.forEach(proj => {
    const dateKey = proj.startDate;
    if (!groupedProjects[dateKey]) {
      groupedProjects[dateKey] = [];
    }
    groupedProjects[dateKey].push(proj);
  });

  const sortedDates = Object.keys(groupedProjects).sort((a, b) => new Date(b) - new Date(a));

  const formatGroupHeaderDate = (dateKey) => {
    const [y, m, d] = dateKey.split("-");
    const dateObj = new Date(y, m - 1, d);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return dateObj.toLocaleDateString("pt-BR", options);
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
         GRID DE INDICADORES ORIGINAIS (Restaurado)
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
            <div className="metric-value" style={{ color: "var(--secondary)" }}>{progressProjects}</div>
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
        
        {/* Projetos em Execução */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Frentes de Trabalho em Andamento</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
            {activeToday.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
                Nenhum projeto em andamento no momento.
              </div>
            ) : (
              activeToday.map(proj => {
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
                      <h4 style={{ fontSize: "0.92rem", fontWeight: "600", marginBottom: "4px" }}>{proj.name}</h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
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

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "10px" }}>
            {/* Programado */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                <span>Programado</span>
                <span>{totalProjects ? Math.round((projects.filter(p => p.status === "planned").length / totalProjects) * 100) : 0}%</span>
              </div>
              <div style={{ height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${totalProjects ? (projects.filter(p => p.status === "planned").length / totalProjects) * 100 : 0}%`, height: "100%", background: "var(--info)" }} />
              </div>
            </div>

            {/* Em Andamento */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                <span>Em Andamento</span>
                <span>{totalProjects ? Math.round((projects.filter(p => p.status === "progress").length / totalProjects) * 100) : 0}%</span>
              </div>
              <div style={{ height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${totalProjects ? (projects.filter(p => p.status === "progress").length / totalProjects) * 100 : 0}%`, height: "100%", background: "var(--secondary)" }} />
              </div>
            </div>

            {/* Concluído */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                <span>Concluído</span>
                <span>{totalProjects ? Math.round((projects.filter(p => p.status === "completed").length / totalProjects) * 100) : 0}%</span>
              </div>
              <div style={{ height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${totalProjects ? (projects.filter(p => p.status === "completed").length / totalProjects) * 100 : 0}%`, height: "100%", background: "var(--success)" }} />
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
