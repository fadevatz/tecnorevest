import React, { useState } from "react";

// ==========================================
// 1. MÓDULO DE FUNCIONÁRIOS (Com Edição e Confirmação)
// ==========================================
export function EmployeesModule({ employees, teams, onAddEmployee, onUpdateEmployee, onDeleteEmployee }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [teamId, setTeamId] = useState("");
  const [editingEmpId, setEditingEmpId] = useState(null); // null = Criando novo
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !role) {
      alert("Por favor, preencha o nome e a função do funcionário.");
      return;
    }

    if (editingEmpId) {
      onUpdateEmployee({
        id: editingEmpId,
        name,
        role,
        teamId,
        status: "active"
      });
      setEditingEmpId(null);
    } else {
      onAddEmployee({
        id: `emp-${Date.now()}`,
        name,
        role,
        teamId,
        status: "active"
      });
    }

    setName("");
    setRole("");
    setTeamId("");
  };

  const handleEditClick = (emp) => {
    setEditingEmpId(emp.id);
    setName(emp.name);
    setRole(emp.role);
    setTeamId(emp.teamId || "");
  };

  const handleCancelEdit = () => {
    setEditingEmpId(null);
    setName("");
    setRole("");
    setTeamId("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h2>Cadastro de Funcionários</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-sm)", marginTop: "4px" }}>
          Gerencie a equipe técnica da Tecno Revest e faça a atribuição de equipes.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
        {/* Formulário */}
        <form onSubmit={handleSubmit} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "var(--font-size-md)", borderBottom: "1px solid var(--card-border)", paddingBottom: "8px", marginBottom: "4px" }}>
            {editingEmpId ? "Editar Funcionário" : "Novo Funcionário"}
          </h3>
          
          <div className="form-group">
            <label htmlFor="emp-name">Nome Completo</label>
            <input
              type="text"
              id="emp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="emp-role">Função / Cargo</label>
            <input
              type="text"
              id="emp-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ex: Aplicador de Epóxi"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="emp-team">Equipe Vinculada</label>
            <select id="emp-team" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">Nenhuma (Sem Equipe)</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
              {editingEmpId ? "Salvar" : "Cadastrar"}
            </button>
            {editingEmpId && (
              <button type="button" className="btn-secondary" onClick={handleCancelEdit} style={{ flex: 1, justifyContent: "center" }}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Tabela de Listagem */}
        <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--card-border)" }}>
            <h3 style={{ fontSize: "var(--font-size-md)" }}>Profissionais Cadastrados</h3>
          </div>
          <div className="custom-table-container" style={{ border: "none" }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cargo</th>
                  <th>Equipe</th>
                  <th style={{ width: "150px", textAlign: "center" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)", padding: "30px" }}>
                      Nenhum funcionário cadastrado.
                    </td>
                  </tr>
                ) : (
                  employees.map(emp => (
                    <tr key={emp.id} style={{ background: editingEmpId === emp.id ? "var(--primary-light)" : "transparent" }}>
                      <td style={{ fontWeight: "600" }}>{emp.name}</td>
                      <td>{emp.role}</td>
                      <td>
                        {(() => {
                          const team = teams.find(t => t.id === emp.teamId);
                          if (!team) {
                            return <span style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-sm)" }}>Sem Equipe</span>;
                          }
                          return (
                            <span style={{ 
                              padding: "3.5px 8px", 
                              borderRadius: "var(--radius-sm)", 
                              background: `${team.color}15`,
                              color: team.color,
                              fontSize: "var(--font-size-xs)",
                              fontWeight: "600",
                              border: `1px solid ${team.color}30`
                            }}>
                              {team.name}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button 
                            className="btn-secondary btn-sm" 
                            onClick={() => handleEditClick(emp)}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn-danger btn-sm" 
                            onClick={() => setDeleteConfirmItem({ id: emp.id, name: emp.name })}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "420px" }}>
            <h3 style={{ fontSize: "var(--font-size-md)", marginBottom: "10px" }}>Confirmar Exclusão</h3>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Tem certeza de que deseja excluir o funcionário <strong>{deleteConfirmItem.name}</strong>? Esta ação não poderá ser desfeita.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" className="btn-secondary" onClick={() => setDeleteConfirmItem(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  onDeleteEmployee(deleteConfirmItem.id);
                  setDeleteConfirmItem(null);
                }}
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. MÓDULO DE EQUIPES (Com Edição e Confirmação)
// ==========================================
export function TeamsModule({ teams, onAddTeam, onUpdateTeam, onDeleteTeam }) {
  const [name, setName] = useState("");
  const [leader, setLeader] = useState("");
  const [color, setColor] = useState("#2258A3");
  const [editingTeamId, setEditingTeamId] = useState(null); // null = Criando novo
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !leader) {
      alert("Por favor, preencha o nome da equipe e o líder responsável.");
      return;
    }

    if (editingTeamId) {
      onUpdateTeam({
        id: editingTeamId,
        name,
        leader,
        color
      });
      setEditingTeamId(null);
    } else {
      onAddTeam({
        id: `team-${Date.now()}`,
        name,
        leader,
        color
      });
    }

    setName("");
    setLeader("");
    setColor("#2258A3");
  };

  const handleEditClick = (team) => {
    setEditingTeamId(team.id);
    setName(team.name);
    setLeader(team.leader);
    setColor(team.color || "#2258A3");
  };

  const handleCancelEdit = () => {
    setEditingTeamId(null);
    setName("");
    setLeader("");
    setColor("#2258A3");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h2>Cadastro de Equipes</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-sm)", marginTop: "4px" }}>
          Defina as frentes de trabalho da Tecno Revest e selecione as cores de exibição da agenda.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
        {/* Formulário */}
        <form onSubmit={handleSubmit} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "var(--font-size-md)", borderBottom: "1px solid var(--card-border)", paddingBottom: "8px", marginBottom: "4px" }}>
            {editingTeamId ? "Editar Equipe" : "Nova Equipe"}
          </h3>

          <div className="form-group">
            <label htmlFor="team-name">Nome da Equipe</label>
            <input
              type="text"
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Equipe Poliuretano 2"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="team-leader">Líder / Supervisor</label>
            <input
              type="text"
              id="team-leader"
              value={leader}
              onChange={(e) => setLeader(e.target.value)}
              placeholder="Ex: Carlos Albuquerque"
              required
            />
          </div>

          <div className="form-group">
            <label>Cor Identificadora da Agenda</label>
            <div className="color-picker-wrapper">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: "52px", height: "42px", padding: "2px", cursor: "pointer", border: "1px solid var(--card-border)", borderRadius: "var(--radius-sm)" }}
              />
              <span style={{ fontSize: "var(--font-size-sm)", fontFamily: "monospace" }}>{color.toUpperCase()}</span>
              <div className="color-preview-box" style={{ backgroundColor: color }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
              {editingTeamId ? "Salvar" : "Criar Equipe"}
            </button>
            {editingTeamId && (
              <button type="button" className="btn-secondary" onClick={handleCancelEdit} style={{ flex: 1, justifyContent: "center" }}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Tabela de Listagem */}
        <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--card-border)" }}>
            <h3 style={{ fontSize: "var(--font-size-md)" }}>Equipes Cadastradas</h3>
          </div>
          <div className="custom-table-container" style={{ border: "none" }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nome da Equipe</th>
                  <th>Líder Responsável</th>
                  <th>Cor Visual</th>
                  <th style={{ width: "150px", textAlign: "center" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)", padding: "30px" }}>
                      Nenhuma equipe cadastrada.
                    </td>
                  </tr>
                ) : (
                  teams.map(team => (
                    <tr key={team.id} style={{ background: editingTeamId === team.id ? "var(--primary-light)" : "transparent" }}>
                      <td style={{ fontWeight: "600" }}>{team.name}</td>
                      <td>{team.leader}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span 
                            style={{ backgroundColor: team.color, width: "14px", height: "14px", display: "inline-block", borderRadius: "50%", border: "1px solid var(--card-border)" }}
                          />
                          <span style={{ fontSize: "var(--font-size-sm)", fontFamily: "monospace", color: "var(--text-secondary)" }}>{team.color}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button 
                            className="btn-secondary btn-sm" 
                            onClick={() => handleEditClick(team)}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn-danger btn-sm" 
                            onClick={() => setDeleteConfirmItem({ id: team.id, name: team.name })}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "420px" }}>
            <h3 style={{ fontSize: "var(--font-size-md)", marginBottom: "10px" }}>Confirmar Exclusão</h3>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Tem certeza de que deseja excluir a equipe <strong>{deleteConfirmItem.name}</strong>? Esta ação não poderá ser desfeita.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" className="btn-secondary" onClick={() => setDeleteConfirmItem(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  onDeleteTeam(deleteConfirmItem.id);
                  setDeleteConfirmItem(null);
                }}
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. MÓDULO DE LISTAGEM DE PROJETOS (Com Confirmação)
// ==========================================
export function ProjectsModule({ projects, teams, onEditProject, onDeleteProject }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed": return "Concluído";
      case "progress": return "Em Andamento";
      case "waiting": return "Aguardando";
      case "unavailable": return "Indisponível";
      case "cancelled": return "Cancelado";
      default: return "Programado";
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Lista Geral de Projetos</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-sm)", marginTop: "4px" }}>
            Pesquise, filtre e edite ou exclua programações de obras.
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="glass-card" style={{ display: "flex", gap: "16px", padding: "16px 20px" }}>
        <div className="form-group" style={{ flex: "2", marginBottom: "0" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por projeto ou cliente..."
            style={{ width: "100%" }}
          />
        </div>
        <div className="form-group" style={{ flex: "1", marginBottom: "0" }}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: "100%" }}>
            <option value="">Todos os Status</option>
            <option value="planned">Programados</option>
            <option value="progress">Em Andamento</option>
            <option value="waiting">Aguardando</option>
            <option value="unavailable">Indisponíveis</option>
            <option value="completed">Concluídos</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Tabela de Projetos */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        <div className="custom-table-container" style={{ border: "none" }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nome do Projeto</th>
                <th>Cliente</th>
                <th>Equipe(s) Envolvida(s)</th>
                <th>Etapas</th>
                <th>Período Total</th>
                <th>Status</th>
                <th style={{ width: "160px", textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "var(--text-muted)", padding: "30px" }}>
                    Nenhum projeto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProjects.map(proj => {
                  let stages = proj.stages;
                  if (typeof stages === "string") {
                    try { stages = JSON.parse(stages); } catch (e) { stages = null; }
                  }
                  const stageList = Array.isArray(stages) && stages.length > 0 ? stages : [{ teamId: proj.teamId }];
                  const uniqueTeamIds = [...new Set(stageList.map(s => s.teamId).filter(Boolean))];
                  const projectTeams = uniqueTeamIds.map(id => teams.find(t => t.id === id)).filter(Boolean);

                  return (
                    <tr key={proj.id}>
                      <td style={{ fontWeight: "600" }}>{proj.name}</td>
                      <td>{proj.client}</td>
                      <td>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {projectTeams.length === 0 ? (
                            <span style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-sm)" }}>Sem Equipe</span>
                          ) : (
                            projectTeams.map(t => (
                              <span key={t.id} style={{ 
                                padding: "3px 7px", 
                                borderRadius: "var(--radius-sm)", 
                                background: `${t.color}15`,
                                color: t.color,
                                fontSize: "var(--font-size-xs)",
                                fontWeight: "600",
                                border: `1px solid ${t.color}30`
                              }}>
                                {t.name}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: "var(--font-size-sm)", fontWeight: "600" }}>
                        {stageList.length} {stageList.length === 1 ? "etapa" : "etapas"}
                      </td>
                      <td style={{ fontSize: "var(--font-size-sm)", whiteSpace: "nowrap" }}>
                        {proj.startDate ? proj.startDate.split("-").reverse().join("/") : "-"} - {proj.endDate ? proj.endDate.split("-").reverse().join("/") : "-"}
                      </td>
                      <td>
                        <span className={`status-badge ${proj.status}`}>
                          {getStatusLabel(proj.status)}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button 
                            className="btn-secondary btn-sm" 
                            onClick={() => onEditProject(proj)}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn-danger btn-sm" 
                            onClick={() => setDeleteConfirmItem({ id: proj.id, name: proj.name })}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "420px" }}>
            <h3 style={{ fontSize: "var(--font-size-md)", marginBottom: "10px" }}>Confirmar Exclusão</h3>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Tem certeza de que deseja excluir o projeto <strong>{deleteConfirmItem.name}</strong>? Esta ação não poderá ser desfeita.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" className="btn-secondary" onClick={() => setDeleteConfirmItem(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  onDeleteProject(deleteConfirmItem.id);
                  setDeleteConfirmItem(null);
                }}
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
