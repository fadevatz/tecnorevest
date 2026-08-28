import React, { useState, useEffect, useRef } from "react";
import logo from "./assets/logo.png";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AgendaPanel from "./components/AgendaPanel";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ChangePasswordModal from "./components/ChangePasswordModal";
import { EmployeesModule, TeamsModule, ProjectsModule } from "./components/RegistrationModules";
import { DashboardSkeleton, AgendaSkeleton, ModuleTableSkeleton, TopProgressBar } from "./components/Skeleton";
import { initialTeams, initialEmployees, initialProjects } from "./utils/mockData";
import {
  loadInitialData,
  saveProjectApi,
  deleteProjectApi,
  saveTeamApi,
  deleteTeamApi,
  saveEmployeeApi,
  deleteEmployeeApi
} from "./services/apiService";

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const AgendaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const EmployeesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const TeamsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ProjectsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M15 2H9a1 1 0 0 0-1 1v2H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2V3a1 1 0 0 0-1-1Z" />
    <path d="M12 12h.01" />
    <path d="M16 6H8" />
    <path d="M12 16H8" />
    <path d="M16 20H8" />
  </svg>
);

// Helper de Normalização de Projetos com Etapas (stages)
export function normalizeProject(project, teams = []) {
  if (!project) return project;

  let stages = project.stages;
  if (typeof stages === "string") {
    try {
      stages = JSON.parse(stages);
    } catch (e) {
      stages = null;
    }
  }

  if (!Array.isArray(stages) || stages.length === 0) {
    stages = [
      {
        id: `stg-${project.id || Date.now()}-1`,
        name: "Etapa 1",
        startDate: project.startDate || new Date().toISOString().split("T")[0],
        endDate: project.endDate || new Date().toISOString().split("T")[0],
        teamId: project.teamId || (teams.length > 0 ? teams[0].id : ""),
        period: project.period || "full_day",
        startTime: project.startTime || "08:00",
        endTime: project.endTime || "17:00"
      }
    ];
  }

  const sortedStages = [...stages].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const minStartDate = sortedStages[0]?.startDate || project.startDate;
  const maxEndDate = sortedStages.reduce((max, s) => (s.endDate > max ? s.endDate : max), sortedStages[0]?.endDate || project.endDate);
  const primaryTeamId = sortedStages[0]?.teamId || project.teamId;

  return {
    ...project,
    teamId: primaryTeamId,
    startDate: minStartDate,
    endDate: maxEndDate,
    stages: sortedStages
  };
}

export default function App() {
  // Estado para esconder a barra lateral (Nav) - Inicia colapsado em mobile
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return typeof window !== "undefined" && window.innerWidth <= 768;
  });

  // Estado do usuário / Autenticação
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("tecnorevest_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Salvar sessão
  const handleLogin = (sessionData) => {
    setUser(sessionData);
    localStorage.setItem("tecnorevest_user", JSON.stringify(sessionData));
  };

  const handleLogout = () => {
    if (window.confirm("Deseja realmente sair da sua conta no sistema?")) {
      setUser(null);
      localStorage.removeItem("tecnorevest_user");
    }
  };

  // Estados Globais
  const [teams, setTeams] = useState(initialTeams);
  const [employees, setEmployees] = useState(initialEmployees);
  const [projects, setProjects] = useState(() => initialProjects.map(p => normalizeProject(p, initialTeams)));

  // Estados de Carregamento e Navegação com Transições Suaves (Motion Principles)
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  // Carregar dados da API MySQL / localStorage no carregamento inicial
  useEffect(() => {
    async function fetchData() {
      setIsLoadingData(true);
      const data = await loadInitialData(initialProjects, initialTeams, initialEmployees);
      const normalizedProjects = data.projects.map(p => normalizeProject(p, data.teams));
      setProjects(normalizedProjects);
      setTeams(data.teams);
      setEmployees(data.employees);
      setTimeout(() => {
        setIsLoadingData(false);
      }, 350);
    }
    fetchData();
  }, []);

  // Salvar mudanças no localStorage
  useEffect(() => {
    localStorage.setItem("tecnorevest_teams", JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem("tecnorevest_employees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("tecnorevest_projects", JSON.stringify(projects));
  }, [projects]);

  // Navegação com Transição Suave (Skeleton Lazy Loading)
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleSelectTab = (tab) => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setIsSidebarCollapsed(true);
    }
    if (tab === activeTab) return;
    setIsTabTransitioning(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsTabTransitioning(false);
    }, 280);
  };


  // Estado para Tema Escuro (Dark Mode)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("tecnorevest_theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("tecnorevest_theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("tecnorevest_theme", "light");
    }
  }, [darkMode]);

  // Estado para busca no menu da sidebar
  const [sidebarSearch, setSidebarSearch] = useState("");

  // Modais e Menu do Usuário
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // null = Criando novo

  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Campos do Formulário do Projeto
  const [formProjName, setFormProjName] = useState("");
  const [formProjClient, setFormProjClient] = useState("");
  const [formProjStatus, setFormProjStatus] = useState("planned");
  const [formProjStages, setFormProjStages] = useState([]);
  const [modalContextTeamId, setModalContextTeamId] = useState("");
  const [modalContextStartDate, setModalContextStartDate] = useState("");

  // Selecionar projeto existente no modal (especialmente para lançamento por equipe)
  const handleSelectExistingProject = (projectId) => {
    if (!projectId) {
      setEditingProject(null);
      setFormProjName("");
      setFormProjClient("");
      setFormProjStatus("planned");
      const dateToUse = modalContextStartDate || new Date().toISOString().split("T")[0];
      const teamToUse = modalContextTeamId || (teams.length > 0 ? teams[0].id : "");
      setFormProjStages([
        {
          id: `stg-${Date.now()}-1`,
          name: "Etapa 1",
          startDate: dateToUse,
          endDate: dateToUse,
          teamId: teamToUse,
          period: "full_day",
          startTime: "08:00",
          endTime: "17:00"
        }
      ]);
      return;
    }

    const found = projects.find(p => p.id === projectId);
    if (found) {
      const normalized = normalizeProject(found, teams);
      setEditingProject(normalized);
      setFormProjName(normalized.name);
      setFormProjClient(normalized.client);
      setFormProjStatus(normalized.status || "planned");

      const existingStages = (normalized.stages || []).map(s => ({ ...s }));
      const defaultTeam = modalContextTeamId || normalized.teamId || (teams.length > 0 ? teams[0].id : "");

      if (modalContextStartDate) {
        const alreadyHasStage = existingStages.some(
          s => s.startDate === modalContextStartDate && s.teamId === defaultTeam
        );
        if (!alreadyHasStage) {
          const newStageNumber = existingStages.length + 1;
          existingStages.push({
            id: `stg-${Date.now()}-${newStageNumber}`,
            name: `Etapa ${newStageNumber}`,
            startDate: modalContextStartDate,
            endDate: modalContextStartDate,
            teamId: defaultTeam,
            period: "full_day",
            startTime: "08:00",
            endTime: "17:00"
          });
        }
      }

      setFormProjStages(existingStages);
    }
  };

  // AÇÕES DE CADASTRO - EQUIPES E FUNCIONÁRIOS
  const handleAddTeam = (newTeam) => {
    setTeams(prev => [...prev, newTeam]);
    saveTeamApi(newTeam);
  };

  const handleDeleteTeam = (id) => {
    if (window.confirm("Deseja realmente excluir esta equipe? Os projetos vinculados a ela permanecerão.")) {
      setTeams(prev => prev.filter(t => t.id !== id));
      setEmployees(prev => prev.map(emp => emp.teamId === id ? { ...emp, teamId: "" } : emp));
      deleteTeamApi(id);
    }
  };

  const handleUpdateTeam = (updatedTeam) => {
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    saveTeamApi(updatedTeam);
  };

  const handleAddEmployee = (newEmp) => {
    setEmployees(prev => [...prev, newEmp]);
    saveEmployeeApi(newEmp);
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm("Deseja excluir este funcionário?")) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      deleteEmployeeApi(id);
    }
  };

  const handleUpdateEmployee = (updatedEmp) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    saveEmployeeApi(updatedEmp);
  };

  // AÇÕES DE CADASTRO - PROJETOS
  const handleAddProject = (newProj) => {
    const normalized = normalizeProject(newProj, teams);
    setProjects(prev => [...prev, normalized]);
    saveProjectApi(normalized);
  };

  const handleUpdateProject = (updatedProj) => {
    const normalized = normalizeProject(updatedProj, teams);
    setProjects(prev => prev.map(p => p.id === normalized.id ? normalized : p));
    saveProjectApi(normalized);
  };

  const handleDeleteProject = (id) => {
    if (window.confirm("Deseja excluir este projeto de serviço?")) {
      setProjects(prev => prev.filter(p => p.id !== id));
      deleteProjectApi(id);
      if (editingProject && editingProject.id === id) {
        closeProjectModal();
      }
    }
  };

  // Manipulação de Etapas no Formulário
  const handleAddStageItem = () => {
    const defaultTeam = teams.length > 0 ? teams[0].id : "";
    const lastStage = formProjStages[formProjStages.length - 1];
    let nextStart = new Date().toISOString().split("T")[0];
    let nextEnd = nextStart;

    if (lastStage && lastStage.endDate) {
      const lastEndDate = new Date(lastStage.endDate + "T00:00:00");
      lastEndDate.setDate(lastEndDate.getDate() + 2); // sugestão de pausa de 2 dias
      nextStart = lastEndDate.toISOString().split("T")[0];
      nextEnd = nextStart;
    }

    setFormProjStages(prev => [
      ...prev,
      {
        id: `stg-${Date.now()}-${prev.length + 1}`,
        name: `Etapa ${prev.length + 1}`,
        startDate: nextStart,
        endDate: nextEnd,
        teamId: lastStage?.teamId || defaultTeam,
        period: "full_day",
        startTime: "08:00",
        endTime: "17:00"
      }
    ]);
  };

  const handleRemoveStageItem = (index) => {
    if (formProjStages.length <= 1) {
      alert("O projeto deve possuir ao menos 1 etapa de trabalho.");
      return;
    }
    setFormProjStages(prev => prev.filter((_, i) => i !== index));
  };

  const handleStageItemChange = (index, field, value) => {
    setFormProjStages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Abrir modal adicionando uma nova etapa para uma data específica no projeto
  const openAddStageModal = (project, startDateStr, targetTeamId) => {
    const normalized = normalizeProject(project, teams);
    setModalContextTeamId(targetTeamId || normalized.teamId);
    setModalContextStartDate(startDateStr);
    setEditingProject(normalized);
    setFormProjName(normalized.name);
    setFormProjClient(normalized.client);
    setFormProjStatus(normalized.status || "planned");

    const existingStages = (normalized.stages || []).map(s => ({ ...s }));
    const defaultTeam = targetTeamId || normalized.teamId || (teams.length > 0 ? teams[0].id : "");

    const newStageNumber = existingStages.length + 1;
    const newStage = {
      id: `stg-${Date.now()}-${newStageNumber}`,
      name: `Etapa ${newStageNumber}`,
      startDate: startDateStr,
      endDate: startDateStr,
      teamId: defaultTeam,
      period: "full_day",
      startTime: "08:00",
      endTime: "17:00"
    };

    setFormProjStages([...existingStages, newStage]);
    setIsProjectModalOpen(true);
  };

  // Funções de Modal
  const openNewProjectModal = () => {
    setModalContextTeamId("");
    setModalContextStartDate("");
    setEditingProject(null);
    setFormProjName("");
    setFormProjClient("");
    setFormProjStatus("planned");
    const todayStr = new Date().toISOString().split("T")[0];
    const defaultTeam = teams.length > 0 ? teams[0].id : "";
    setFormProjStages([
      {
        id: `stg-${Date.now()}-1`,
        name: "Etapa 1",
        startDate: todayStr,
        endDate: todayStr,
        teamId: defaultTeam,
        period: "full_day",
        startTime: "08:00",
        endTime: "17:00"
      }
    ]);
    setIsProjectModalOpen(true);
  };

  const openQuickAddModal = (teamId, startDateStr) => {
    setModalContextTeamId(teamId || (teams.length > 0 ? teams[0].id : ""));
    setModalContextStartDate(startDateStr);
    setEditingProject(null);
    setFormProjName("");
    setFormProjClient("");
    setFormProjStatus("planned");
    setFormProjStages([
      {
        id: `stg-${Date.now()}-1`,
        name: "Etapa 1",
        startDate: startDateStr,
        endDate: startDateStr,
        teamId: teamId || (teams.length > 0 ? teams[0].id : ""),
        period: "full_day",
        startTime: "08:00",
        endTime: "17:00"
      }
    ]);
    setIsProjectModalOpen(true);
  };

  const openEditModal = (project) => {
    const normalized = normalizeProject(project, teams);
    setModalContextTeamId("");
    setModalContextStartDate("");
    setEditingProject(normalized);
    setFormProjName(normalized.name);
    setFormProjClient(normalized.client);
    setFormProjStatus(normalized.status || "planned");
    setFormProjStages(normalized.stages.map(s => ({ ...s })));
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
    setModalContextTeamId("");
    setModalContextStartDate("");
  };

  // Atalhos Globais de Teclado (Fase 3 - Adapt)
  useEffect(() => {
    function handleKeyDown(e) {
      const isInputFocused = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);

      if (e.key === "Escape") {
        setIsProjectModalOpen(false);
        setIsPasswordModalOpen(false);
        setIsUserMenuOpen(false);
        setEditingProject(null);
        return;
      }

      if (isInputFocused) return;

      // Alt + N: Novo Projeto
      if (e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        openNewProjectModal();
      }

      // / : Focar busca na interface
      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector(".sidebar-search-input") || document.querySelector("input[type='text']");
        if (searchInput) {
          searchInput.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [teams]);

  const handleSaveProject = (e) => {
    e.preventDefault();

    if (!formProjName || !formProjClient) {
      alert("Por favor, preencha o nome do projeto e o cliente.");
      return;
    }

    if (!formProjStages || formProjStages.length === 0) {
      alert("Adicione ao menos um período de serviço / etapa para o projeto.");
      return;
    }

    for (let i = 0; i < formProjStages.length; i++) {
      const stage = formProjStages[i];
      if (!stage.startDate || !stage.endDate || !stage.teamId) {
        alert(`Por favor, preencha a equipe e as datas para a Etapa ${i + 1}.`);
        return;
      }
      if (new Date(stage.startDate + "T00:00:00") > new Date(stage.endDate + "T00:00:00")) {
        alert(`Na Etapa ${i + 1}, a data de término não pode ser anterior à data de início.`);
        return;
      }
    }

    const sortedStages = [...formProjStages].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const minStartDate = sortedStages[0].startDate;
    const maxEndDate = sortedStages.reduce((max, s) => (s.endDate > max ? s.endDate : max), sortedStages[0].endDate);
    const primaryTeamId = sortedStages[0].teamId;

    const projectData = {
      id: editingProject ? editingProject.id : `proj-${Date.now()}`,
      name: formProjName,
      client: formProjClient,
      teamId: primaryTeamId,
      startDate: minStartDate,
      endDate: maxEndDate,
      period: sortedStages[0].period,
      startTime: sortedStages[0].startTime,
      endTime: sortedStages[0].endTime,
      status: formProjStatus,
      stages: sortedStages
    };

    if (editingProject) {
      handleUpdateProject(projectData);
    } else {
      handleAddProject(projectData);
    }

    closeProjectModal();
  };

  // Se não estiver logado, exibe apenas a tela de Login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Filtragem dos itens do menu lateral baseado na busca
  const checkMatch = (text) => {
    return text.toLowerCase().includes(sidebarSearch.toLowerCase());
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Indicador de Progresso de Carregamento Topo (Kyle Zantos Motion Principles) */}
      <TopProgressBar isAnimating={isLoadingData || isTabTransitioning} />

      {/* ==========================================
         TOP HEADER SUPERIOR (Azul Tecno Revest)
         ========================================== */}
      <header className="top-header">
        <div className="header-brand">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="header-icon-btn"
            title={isSidebarCollapsed ? "Mostrar Menu" : "Esconder Menu"}
            style={{ marginRight: "12px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", fontSize: "var(--font-size-lg)" }}
          >
            ☰
          </button>
          <img src={logo} alt="Tecno Revest" style={{ height: "30px", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          <span className="header-brand-name">Agenda - TecnoRevest</span>
        </div>

        <div className="header-right">
          {/* Botão de Tema Escuro */}
          <button 
            className="header-icon-btn" 
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
            style={{ fontSize: "var(--font-size-lg)" }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          
          {/* Perfil do Usuário Logado com Menu Suspenso (Dropdown) */}
          <div ref={userMenuRef} style={{ position: "relative" }}>
            <div 
              className="user-profile-badge" 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              title="Clique para abrir o menu do usuário"
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              <div className="user-profile-info">
                <span className="user-profile-name">{user.name} ▾</span>
                <span className="user-profile-role">{user.role}</span>
              </div>
              <div className="user-profile-avatar">
                {user.name.split(" ").map(n => n.charAt(0)).join("").toUpperCase()}
              </div>
            </div>

            {/* Menu Suspenso (Dropdown) */}
            {isUserMenuOpen && (
              <div 
                className="user-dropdown-menu"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "210px",
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-lg)",
                  padding: "6px 0",
                  zIndex: 9999
                }}
              >
                <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--card-border)" }}>
                  <div style={{ fontWeight: "700", fontSize: "var(--font-size-sm)", color: "var(--text-primary)" }}>{user.name}</div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginTop: "2px" }}>{user.role}</div>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsPasswordModalOpen(true);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    color: "var(--text-primary)",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "var(--transition)"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-light)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  🔑 Alterar Senha
                </button>

                <div style={{ borderTop: "1px solid var(--card-border)", margin: "4px 0" }} />

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    color: "var(--danger)",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "var(--transition)"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(229, 62, 62, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  🚪 Sair do Sistema
                </button>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Workspace Principal (Sidebar + Conteúdo) */}
      <div className="app-container">
        {!isSidebarCollapsed && (
          <div className="sidebar-backdrop" onClick={() => setIsSidebarCollapsed(true)} />
        )}
        
        {/* ==========================================
           SIDEBAR LATERAL (Branca categorizada)
           ========================================== */}

        <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
          <div>
            <ul className="sidebar-menu">
              <li 
                className={`menu-item ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => handleSelectTab("dashboard")}
              >
                <DashboardIcon /> Dashboard
              </li>
              <li 
                className={`menu-item ${activeTab === "agenda" ? "active" : ""}`}
                onClick={() => handleSelectTab("agenda")}
              >
                <AgendaIcon /> Agenda
              </li>
            </ul>

            <div className="menu-group-title">Módulos</div>
            <ul className="sidebar-menu">
              <li 
                className={`menu-item ${activeTab === "employees" ? "active" : ""}`}
                onClick={() => handleSelectTab("employees")}
              >
                <EmployeesIcon /> Funcionários
              </li>
              <li 
                className={`menu-item ${activeTab === "teams" ? "active" : ""}`}
                onClick={() => handleSelectTab("teams")}
              >
                <TeamsIcon /> Equipes
              </li>
              <li 
                className={`menu-item ${activeTab === "projects" ? "active" : ""}`}
                onClick={() => handleSelectTab("projects")}
              >
                <ProjectsIcon /> Lista de Projetos
              </li>
            </ul>
          </div>
          <div className="sidebar-footer" style={{ marginTop: "auto", padding: "16px 8px", display: "flex", justifyContent: "center", borderTop: "1px solid var(--card-border)" }}>
            <img src={logo} alt="Tecno Revest Logo" style={{ maxHeight: "36px", maxWidth: "80%", objectFit: "contain" }} />
          </div>
        </aside>

        {/* Área Principal de Conteúdo */}
        <main className="main-content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              TecnoRevest &gt; <span style={{ color: "var(--text-primary)", fontWeight: "500", textTransform: "capitalize" }}>{activeTab.replace("_", " ")}</span>
            </div>
            {activeTab === "agenda" && (
              <button className="btn-accent" onClick={openNewProjectModal}>
                <span>+</span> Novo Projeto
              </button>
            )}
          </div>

          {/* Abas com Skeleton Lazy Loading (Kyle Zantos Motion Principles) */}
          {(isLoadingData || isTabTransitioning) ? (
            activeTab === "dashboard" ? (
              <DashboardSkeleton />
            ) : activeTab === "agenda" ? (
              <AgendaSkeleton />
            ) : (
              <ModuleTableSkeleton title={`Carregando ${activeTab === "employees" ? "Funcionários" : activeTab === "teams" ? "Equipes" : "Projetos"}...`} />
            )
          ) : (
            <div key={activeTab} className="page-entrance">
              {activeTab === "dashboard" && (
                <Dashboard 
                  projects={projects} 
                  teams={teams} 
                  employees={employees} 
                  setActiveTab={handleSelectTab}
                  onEditProject={openEditModal}
                  onDeleteProject={handleDeleteProject}
                />
              )}

              {activeTab === "agenda" && (
                <ErrorBoundary>
                  <AgendaPanel 
                    projects={projects} 
                    teams={teams} 
                    onUpdateProject={handleUpdateProject}
                    onEditProject={openEditModal}
                    onQuickAdd={openQuickAddModal}
                    onAddStageOnDate={openAddStageModal}
                  />
                </ErrorBoundary>
              )}

              {activeTab === "employees" && (
                <EmployeesModule 
                  employees={employees} 
                  teams={teams} 
                  onAddEmployee={handleAddEmployee}
                  onUpdateEmployee={handleUpdateEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                />
              )}

              {activeTab === "teams" && (
                <TeamsModule 
                  teams={teams} 
                  onAddTeam={handleAddTeam}
                  onUpdateTeam={handleUpdateTeam}
                  onDeleteTeam={handleDeleteTeam}
                />
              )}

              {activeTab === "projects" && (
                <ProjectsModule 
                  projects={projects} 
                  teams={teams} 
                  onEditProject={openEditModal}
                  onDeleteProject={handleDeleteProject}
                />
              )}

              {/* Telas de Administração */}
              {activeTab === "my_account" && (
                <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <h2>Minha Conta</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                    <p><strong>Nome:</strong> {user.name}</p>
                    <p><strong>Cargo:</strong> {user.role}</p>
                    <p><strong>Usuário de Acesso:</strong> {user.username}</p>
                  </div>
                  <button className="btn-logout" onClick={handleLogout} style={{ marginTop: "12px", alignSelf: "flex-start" }}>
                    <span>🚪</span> Sair do Sistema
                  </button>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="glass-card">
                  <h2>Configurações do Sistema</h2>
                  <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
                    Definições globais de notificações, banco de dados local e preferências de fuso horário.
                  </p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                    <button className="btn-primary" onClick={() => alert("Configurações salvas!")}>Salvar</button>
                    <button className="btn-secondary" onClick={() => {
                      if(window.confirm("Deseja resetar todos os dados para o padrão?")) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}>Resetar Banco de Dados</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal Global para Criar/Editar Projetos */}
      {isProjectModalOpen && (
        <div className="modal-overlay" onClick={closeProjectModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header modal-header-fixed">
              <div>
                <h3 className="modal-title">
                  {editingProject ? `Programação: ${editingProject.name}` : "Nova Programação de Serviço"}
                </h3>
                {modalContextTeamId && (
                  <div style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: "600", marginTop: "2px" }}>
                    📍 Alocando para: {teams.find(t => t.id === modalContextTeamId)?.name || "Equipe"}
                    {modalContextStartDate && ` (${modalContextStartDate.split("-").reverse().join("/")})`}
                  </div>
                )}
              </div>
              <button className="btn-close" onClick={closeProjectModal}>&times;</button>
            </div>

            <form onSubmit={handleSaveProject} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div className="modal-body-scrollable">
                <div className="modal-grid-2col">
                  {/* COLUNA ESQUERDA: DADOS DO PROJETO / OBRA */}
                  <div className="modal-col-card">
                    <div className="modal-col-title">
                      🏢 Dados da Obra & Cliente
                    </div>

                    {/* Seletor de Obra / Projeto Existente */}
                    <div 
                      className="form-group" 
                      style={{ 
                        background: "var(--primary-light)", 
                        padding: "10px 12px", 
                        borderRadius: "8px", 
                        border: "1px solid rgba(34, 88, 163, 0.2)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px"
                      }}
                    >
                      <label 
                        htmlFor="select-existing-proj" 
                        style={{ 
                          fontWeight: "700", 
                          color: "var(--primary)", 
                          fontSize: "0.82rem", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between" 
                        }}
                      >
                        <span>📋 Selecionar Obra em Andamento</span>
                        {editingProject && (
                          <span style={{ fontSize: "var(--font-size-xs)", background: "var(--primary)", color: "#fff", padding: "1px 6px", borderRadius: "var(--radius-md)", fontWeight: "600" }}>
                            Cadastrada
                          </span>
                        )}
                      </label>
                      <select
                        id="select-existing-proj"
                        value={editingProject ? editingProject.id : ""}
                        onChange={(e) => handleSelectExistingProject(e.target.value)}
                        style={{ fontWeight: "600", fontSize: "var(--font-size-sm)", padding: "6px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--card-border)" }}
                      >
                        <option value="">+ [ Criar Nova Obra / Projeto do Zero ]</option>
                        {projects.filter(p => p.status !== "completed" && p.status !== "cancelled").map(proj => (
                          <option key={proj.id} value={proj.id}>
                            {proj.name} — {proj.client} ({proj.status === "progress" ? "Em Andamento" : "Programado"})
                          </option>
                        ))}
                      </select>
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>
                        {editingProject 
                          ? `Editando obra "${editingProject.name}".`
                          : "Escolha uma obra existente acima ou preencha os dados abaixo."}
                      </span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="proj-name" style={{ fontSize: "var(--font-size-xs)" }}>Nome do Projeto / Obra *</label>
                      <input
                        type="text"
                        id="proj-name"
                        value={formProjName}
                        onChange={(e) => setFormProjName(e.target.value)}
                        placeholder="Ex: Aplicação de Poliuretano em Galpão"
                        required
                        style={{ padding: "8px 10px", fontSize: "var(--font-size-sm)" }}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="proj-client" style={{ fontSize: "var(--font-size-xs)" }}>Cliente / Local *</label>
                      <input
                        type="text"
                        id="proj-client"
                        value={formProjClient}
                        onChange={(e) => setFormProjClient(e.target.value)}
                        placeholder="Ex: Indústrias Metalúrgicas S.A."
                        required
                        style={{ padding: "8px 10px", fontSize: "var(--font-size-sm)" }}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="proj-status" style={{ fontSize: "var(--font-size-xs)" }}>Status Geral do Projeto</label>

                      <select 
                        id="proj-status" 
                        value={formProjStatus} 
                        onChange={(e) => setFormProjStatus(e.target.value)}
                        style={{ padding: "8px 10px", fontSize: "var(--font-size-sm)" }}
                      >
                        <option value="planned">Programado (Futuro)</option>
                        <option value="progress">Em Andamento</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>
                  </div>

                  {/* COLUNA DIREITA: PERÍODOS & ETAPAS DE ATENDIMENTO */}
                  <div className="modal-col-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", paddingBottom: "8px" }}>
                      <div className="modal-col-title" style={{ borderBottom: "none", paddingBottom: 0 }}>
                        🗓️ Etapas & Pausas do Serviço
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleAddStageItem}
                        style={{ fontSize: "var(--font-size-xs)", padding: "4px 8px", borderColor: "var(--primary)", color: "var(--primary)", whiteSpace: "nowrap" }}
                      >
                        + Adicionar Etapa
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "380px", overflowY: "auto", paddingRight: "4px" }}>
                      {formProjStages.map((stage, idx) => (
                        <div
                          key={stage.id || idx}
                          style={{
                            padding: "12px",
                            borderRadius: "var(--radius-md)",
                            background: "var(--bg-light)",
                            border: "1px solid var(--card-border)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            position: "relative"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--card-border)", paddingBottom: "4px" }}>
                            <span style={{ fontWeight: "700", fontSize: "var(--font-size-xs)", color: "var(--primary)" }}>
                              Etapa {idx + 1}
                            </span>
                            {formProjStages.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveStageItem(idx)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--danger)",
                                  fontSize: "var(--font-size-xs)",
                                  fontWeight: "600",
                                  cursor: "pointer"
                                }}
                              >
                                ✕ Remover Etapa
                              </button>
                            )}
                          </div>

                          <div className="form-group">
                            <label style={{ fontSize: "var(--font-size-xs)" }}>Nome da Etapa</label>
                            <input
                              type="text"
                              value={stage.name}
                              onChange={(e) => handleStageItemChange(idx, "name", e.target.value)}
                              placeholder={`Ex: Etapa ${idx + 1} - Aplicação de Piso`}
                              required
                              style={{ padding: "5px 8px", fontSize: "var(--font-size-xs)" }}
                            />
                          </div>

                          <div className="form-group">
                            <label style={{ fontSize: "var(--font-size-xs)" }}>Equipe Responsável *</label>
                            <select
                              value={stage.teamId}
                              onChange={(e) => handleStageItemChange(idx, "teamId", e.target.value)}
                              required
                              style={{ padding: "5px 8px", fontSize: "var(--font-size-xs)" }}
                            >
                              {teams.length === 0 ? (
                                <option value="">Nenhuma equipe cadastrada</option>
                              ) : (
                                teams.map(t => (
                                  <option key={t.id} value={t.id}>{t.name} (Líder: {t.leader})</option>
                                ))
                              )}
                            </select>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label style={{ fontSize: "var(--font-size-xs)" }}>Data Início *</label>
                              <input
                                type="date"
                                value={stage.startDate}
                                onChange={(e) => handleStageItemChange(idx, "startDate", e.target.value)}
                                required
                                style={{ padding: "5px 8px", fontSize: "var(--font-size-xs)" }}
                              />
                            </div>
                            <div className="form-group">
                              <label style={{ fontSize: "var(--font-size-xs)" }}>Data Término *</label>
                              <input
                                type="date"
                                value={stage.endDate}
                                onChange={(e) => handleStageItemChange(idx, "endDate", e.target.value)}
                                required
                                style={{ padding: "5px 8px", fontSize: "var(--font-size-xs)" }}
                              />
                            </div>
                          </div>

                          {/* Horário da Etapa */}
                          <div className="form-group">
                            <label style={{ fontSize: "var(--font-size-xs)" }}>Horário</label>
                            <div className="period-toggle-group" style={{ height: "30px" }}>
                              <button
                                type="button"
                                className={`period-toggle-btn ${stage.period === "full_day" ? "active" : ""}`}
                                onClick={() => handleStageItemChange(idx, "period", "full_day")}
                                style={{ fontSize: "var(--font-size-xs)" }}
                              >
                                Dia Inteiro
                              </button>
                              <button
                                type="button"
                                className={`period-toggle-btn ${stage.period === "custom" ? "active" : ""}`}
                                onClick={() => handleStageItemChange(idx, "period", "custom")}
                                style={{ fontSize: "var(--font-size-xs)" }}
                              >
                                Específico
                              </button>
                            </div>
                          </div>

                          {stage.period === "custom" && (
                            <div className="form-row" style={{ marginTop: "-4px" }}>
                              <div className="form-group">
                                <label style={{ fontSize: "var(--font-size-xs)" }}>Hora Início</label>
                                <input
                                  type="time"
                                  value={stage.startTime || "08:00"}
                                  onChange={(e) => handleStageItemChange(idx, "startTime", e.target.value)}
                                  style={{ padding: "4px 6px", fontSize: "var(--font-size-xs)" }}
                                />
                              </div>
                              <div className="form-group">
                                <label style={{ fontSize: "var(--font-size-xs)" }}>Hora Fim</label>
                                <input
                                  type="time"
                                  value={stage.endTime || "17:00"}
                                  onChange={(e) => handleStageItemChange(idx, "endTime", e.target.value)}
                                  style={{ padding: "4px 6px", fontSize: "var(--font-size-xs)" }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* FOOTER FIXO COM BOTÕES DE AÇÃO SEMPRE VISÍVEIS */}
              <div className="modal-footer-fixed">
                <button type="button" className="btn-secondary" onClick={closeProjectModal}>
                  Cancelar
                </button>
                {editingProject && (
                  <button 
                    type="button" 
                    className="btn-danger" 
                    onClick={() => handleDeleteProject(editingProject.id)}
                  >
                    Excluir Obra
                  </button>
                )}
                <button type="submit" className="btn-primary">
                  {editingProject ? "Salvar Alterações" : "Criar Projeto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de Alteração de Senha */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        username={user?.username || "Admin"} 
      />
    </div>
  );
}
