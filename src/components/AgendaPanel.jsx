import React, { useState, useMemo, useRef } from "react";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AgendaPanel({ projects = [], teams = [], onUpdateProject, onEditProject, onQuickAdd, onAddStageOnDate }) {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [filterGroupBy, setFilterGroupBy] = useState("teams"); // "teams" (Por Equipes) como padrão
  
  const [draggedOverCell, setDraggedOverCell] = useState(null); // { rowId, day }
  const [isDraggingProject, setIsDraggingProject] = useState(false);

  // Scroll horizontal pan ref e detecção de movimento para clique
  const scrollContainerRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const mouseStartPos = useRef({ x: 0, y: 0 });
  const hasPanned = useRef(false);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);

  // Navegação de mês
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Helper de dia da semana
  const getWeekday = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    return WEEKDAYS[date.getDay()];
  };

  const isWeekend = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const formatDateString = (year, month, day) => {
    const y = year;
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Extrair etapas do projeto ou gerar 1 padrão
  const getProjectStages = (project) => {
    let stages = project.stages;
    if (typeof stages === "string") {
      try { stages = JSON.parse(stages); } catch (e) { stages = null; }
    }
    if (Array.isArray(stages) && stages.length > 0) {
      return stages;
    }
    return [{
      id: `stg-${project.id}-1`,
      name: "Etapa 1",
      startDate: project.startDate,
      endDate: project.endDate,
      teamId: project.teamId,
      period: project.period || "full_day",
      startTime: project.startTime || "08:00",
      endTime: project.endTime || "17:00"
    }];
  };

  // Calcular faixa de exibição de uma etapa específica no mês
  const getStageVisibleRange = (stage) => {
    if (!stage || !stage.startDate || !stage.endDate) return null;
    const stageStart = new Date(stage.startDate + "T00:00:00");
    const stageEnd = new Date(stage.endDate + "T00:00:00");

    if (stageEnd < monthStart || stageStart > monthEnd) {
      return null;
    }

    const start = stageStart < monthStart ? 1 : stageStart.getDate();
    const end = stageEnd > monthEnd ? daysInMonth : stageEnd.getDate();

    return {
      start,
      end,
      span: Math.max(1, end - start + 1)
    };
  };

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "#38a169";
      case "progress": return "#dd6b20";
      case "cancelled": return "#e53e3e";
      default: return "#3182ce";
    }
  };

  // Handlers de Pan Horizontal por Mouse
  const handleMouseDown = (e) => {
    if (e.target.closest(".project-bar-card") || e.target.closest("button") || e.target.closest("a")) return;
    setIsMouseDown(true);
    hasPanned.current = false;
    mouseStartPos.current = { x: e.clientX, y: e.clientY };
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsMouseDown(false);
  const handleMouseUp = () => setIsMouseDown(false);
  const handleMouseMove = (e) => {
    if (!isMouseDown) return;
    const dist = Math.abs(e.clientX - mouseStartPos.current.x) + Math.abs(e.clientY - mouseStartPos.current.y);
    if (dist > 5) {
      hasPanned.current = true;
    }
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  // Drag & Drop Handlers
  const handleProjectDragStart = (e, project, stage) => {
    e.dataTransfer.setData("projectId", project.id);
    e.dataTransfer.setData("stageId", stage.id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => setIsDraggingProject(true), 0);
  };

  const handleProjectDragEnd = () => {
    setIsDraggingProject(false);
  };

  const handleCellDragOver = (e, rowId, day) => {
    e.preventDefault();
    if (draggedOverCell?.rowId !== rowId || draggedOverCell?.day !== day) {
      setDraggedOverCell({ rowId, day });
    }
  };

  const handleDragLeave = () => setDraggedOverCell(null);

  const handleDrop = (e, targetRowId, targetDay) => {
    e.preventDefault();
    setDraggedOverCell(null);
    setIsDraggingProject(false);

    const draggedProjectId = e.dataTransfer.getData("projectId");
    const draggedStageId = e.dataTransfer.getData("stageId");
    if (!draggedProjectId) return;

    const project = projects.find(p => p.id === draggedProjectId);
    if (!project) return;

    const stages = getProjectStages(project);
    const targetStageIndex = stages.findIndex(s => s.id === draggedStageId);
    const targetStage = targetStageIndex >= 0 ? stages[targetStageIndex] : stages[0];

    const sStart = new Date(targetStage.startDate + "T00:00:00");
    const sEnd = new Date(targetStage.endDate + "T00:00:00");
    const diffTime = Math.abs(sEnd - sStart);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const newStart = new Date(currentYear, currentMonth, targetDay);
    const newEnd = new Date(currentYear, currentMonth, targetDay + diffDays);

    const newStartDateStr = formatDateString(newStart.getFullYear(), newStart.getMonth(), newStart.getDate());
    const newEndDateStr = formatDateString(newEnd.getFullYear(), newEnd.getMonth(), newEnd.getDate());

    let updatedTeamId = targetStage.teamId;
    if (filterGroupBy === "teams" && targetRowId !== targetStage.teamId) {
      updatedTeamId = targetRowId;
    }

    const updatedStages = [...stages];
    const updatedStage = {
      ...targetStage,
      startDate: newStartDateStr,
      endDate: newEndDateStr,
      teamId: updatedTeamId
    };

    if (targetStageIndex >= 0) {
      updatedStages[targetStageIndex] = updatedStage;
    } else {
      updatedStages[0] = updatedStage;
    }

    updatedStages.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const minStartDate = updatedStages[0].startDate;
    const maxEndDate = updatedStages.reduce((max, s) => (s.endDate > max ? s.endDate : max), updatedStages[0].endDate);
    const primaryTeamId = updatedStages[0].teamId;

    onUpdateProject({
      ...project,
      teamId: primaryTeamId,
      startDate: minStartDate,
      endDate: maxEndDate,
      stages: updatedStages
    });
  };

  // Estrutura das Linhas da Tabela
  const rowsData = useMemo(() => {
    if (filterGroupBy === "teams") {
      return teams.map(team => {
        const teamItems = [];
        projects.forEach(project => {
          const stages = getProjectStages(project);
          stages.forEach(stage => {
            if (stage.teamId === team.id) {
              const range = getStageVisibleRange(stage);
              if (range) {
                teamItems.push({ project, stage, range });
              }
            }
          });
        });

        return {
          id: team.id,
          title: team.name,
          subtitle: `Líder: ${team.leader}`,
          color: team.color,
          items: teamItems
        };
      });
    }

    // Padrão: Agrupado por Obras / Projetos
    return projects.map(project => {
      const projectTeam = teams.find(t => t.id === project.teamId);
      const stages = getProjectStages(project);
      const projectItems = [];

      stages.forEach(stage => {
        const range = getStageVisibleRange(stage);
        if (range) {
          projectItems.push({ project, stage, range });
        }
      });

      return {
        id: project.id,
        title: project.name,
        subtitle: `Cliente: ${project.client}`,
        color: projectTeam ? projectTeam.color : "#2258A3",
        items: projectItems
      };
    });
  }, [projects, teams, filterGroupBy, currentYear, currentMonth]);

  // Helper para calcular faixas (sub-linhas) de etapas que sobrepõem na mesma linha
  const getStageLanes = (items) => {
    const sorted = [...items].sort((a, b) => new Date(a.stage.startDate) - new Date(b.stage.startDate));
    const lanes = [];

    sorted.forEach(item => {
      let assignedLane = -1;
      const pStart = new Date(item.stage.startDate + "T00:00:00");
      const pEnd = new Date(item.stage.endDate + "T23:59:59");

      for (let i = 0; i < lanes.length; i++) {
        const hasOverlap = lanes[i].some(existing => {
          const eStart = new Date(existing.stage.startDate + "T00:00:00");
          const eEnd = new Date(existing.stage.endDate + "T23:59:59");
          return pStart <= eEnd && pEnd >= eStart;
        });

        if (!hasOverlap) {
          assignedLane = i;
          lanes[i].push(item);
          break;
        }
      }

      if (assignedLane === -1) {
        lanes.push([item]);
      }
    });

    return lanes;
  };

  return (
    <div className="glass-card" style={{ padding: "24px 20px" }}>
      {/* Cabeçalho do Scheduler */}
      <div className="agenda-header" style={{ marginBottom: "20px" }}>
        <div>
          <h2>Cronograma de Obras</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "4px" }}>
            Arraste as etapas na linha do tempo para reagendar. Clique em um bloco para gerenciar o projeto.
          </p>
        </div>

        <div className="agenda-nav" style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Alternador de Agrupamento */}
          <div className="group-filter-toggle" style={{ display: "inline-flex", background: "var(--bg-light)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "3px", gap: "4px" }}>
            <button
              className={`btn-filter ${filterGroupBy === "projects" ? "active" : ""}`}
              onClick={() => setFilterGroupBy("projects")}
              style={{
                border: "none",
                background: filterGroupBy === "projects" ? "var(--primary)" : "transparent",
                color: filterGroupBy === "projects" ? "white" : "var(--text-secondary)",
                padding: "6px 14px",
                borderRadius: "16px",
                fontSize: "0.8rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "var(--transition)"
              }}
            >
              🏢 Por Obras
            </button>
            <button
              className={`btn-filter ${filterGroupBy === "teams" ? "active" : ""}`}
              onClick={() => setFilterGroupBy("teams")}
              style={{
                border: "none",
                background: filterGroupBy === "teams" ? "var(--primary)" : "transparent",
                color: filterGroupBy === "teams" ? "white" : "var(--text-secondary)",
                padding: "6px 14px",
                borderRadius: "16px",
                fontSize: "0.8rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "var(--transition)"
              }}
            >
              👥 Por Equipes
            </button>
          </div>

          {/* Navegação por Mês */}
          <button className="btn-secondary" onClick={handlePrevMonth} style={{ padding: "8px 14px" }}>
            &larr; Anterior
          </button>
          <span className="month-indicator" style={{ fontWeight: "700", minWidth: "160px", textAlign: "center" }}>
            {MONTHS[currentMonth]} de {currentYear}
          </span>
          <button className="btn-secondary" onClick={handleNextMonth} style={{ padding: "8px 14px" }}>
            Próximo &rarr;
          </button>
        </div>
      </div>

      {/* Tabela do Cronograma Gantt Scheduler */}
      <div 
        ref={scrollContainerRef}
        className="calendar-scroll-wrapper"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: isMouseDown ? "grabbing" : "grab", userSelect: "none" }}
      >
        <table className="calendar-grid-table">
          <thead>
            <tr>
              <th className="project-column">
                {filterGroupBy === "projects" ? "Obras / Projetos" : "Equipes de Trabalho"}
              </th>
              {daysArray.map(day => (
                <th 
                  key={day} 
                  className={isWeekend(day) ? "weekend-header" : ""}
                  style={{ width: `calc((100% - 200px) / ${daysInMonth})` }}
                >
                  <div style={{ fontSize: "0.92rem", fontWeight: "bold" }}>{String(day).padStart(2, "0")}</div>
                  <div style={{ fontSize: "0.68rem", opacity: 0.7, marginTop: "2px" }}>{getWeekday(day)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowsData.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth + 1} style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
                  Nenhum registro para este período.
                </td>
              </tr>
            ) : (
              rowsData.map(row => {
                const lanes = getStageLanes(row.items);
                const totalLanes = Math.max(1, lanes.length);
                const rowMinHeight = totalLanes === 1 ? 72 : totalLanes * 46 + 16;

                return (
                  <tr key={row.id} style={{ position: "relative", height: `${rowMinHeight}px` }}>
                    {/* Primeira Coluna: Detalhes do Recurso */}
                    <td className="project-column" style={{ height: `${rowMinHeight}px` }}>
                      <div className="project-badge-cell">
                        <div style={{ fontSize: "0.88rem", color: "var(--text-primary)", fontWeight: "600" }}>
                          {row.title}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                          {row.subtitle}
                        </div>
                      </div>
                    </td>

                    {/* Células de Dias para Drop e Interatividade */}
                    {daysArray.map(day => {
                      const isCellHovered = draggedOverCell?.rowId === row.id && draggedOverCell?.day === day;
                      const cellDateStr = formatDateString(currentYear, currentMonth, day);

                      return (
                        <td
                          key={day}
                          className={`day-cell ${isWeekend(day) ? "weekend-cell" : ""} ${isCellHovered ? "drag-hover" : ""}`}
                          style={{ height: `${rowMinHeight}px`, cursor: "pointer" }}
                          onDragOver={(e) => handleCellDragOver(e, row.id, day)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, row.id, day)}
                          onClick={(e) => {
                            if (e.target.closest(".project-bar-card") || hasPanned.current) return;

                            if (filterGroupBy === "projects") {
                              const project = projects.find(p => p.id === row.id);
                              if (project && onAddStageOnDate) {
                                onAddStageOnDate(project, cellDateStr);
                              }
                            } else if (filterGroupBy === "teams") {
                              if (onQuickAdd) {
                                onQuickAdd(row.id, cellDateStr);
                              }
                            }
                          }}
                          title={filterGroupBy === "projects" ? `Clique para incluir nova etapa na obra "${row.title}" em ${String(day).padStart(2, "0")}/${String(currentMonth + 1).padStart(2, "0")}` : `Clique para incluir nova obra para "${row.title}" em ${String(day).padStart(2, "0")}/${String(currentMonth + 1).padStart(2, "0")}`}
                        >
                          <span className="cell-add-icon">+</span>
                        </td>
                      );
                    })}

                    {/* Rendering dos Cards de Etapas na Linha */}
                    <td style={{ position: "static", border: "none", padding: 0, width: 0, height: 0 }}>
                      <div className="projects-container-row-new">
                        {row.items.map(item => {
                          const { project, stage, range } = item;
                          if (!range) return null;

                          const laneIndex = lanes.findIndex(lane => lane.some(i => i.stage.id === stage.id));
                          const safeLaneIndex = laneIndex >= 0 ? laneIndex : 0;

                          const stageTeam = teams.find(t => t.id === stage.teamId);
                          const cardColor = stageTeam ? stageTeam.color : row.color || "#2258A3";

                          const leftPct = ((range.start - 1) / daysInMonth) * 100;
                          const widthPct = (range.span / daysInMonth) * 100;

                          const topOffset = totalLanes === 1 ? 10 : 8 + safeLaneIndex * 44;
                          const cardHeight = totalLanes === 1 ? 52 : 38;

                          const cardTitleText = filterGroupBy === "teams" 
                            ? `${project.name} (${stage.name || 'Etapa'})` 
                            : `${stage.name || 'Etapa'} (${stageTeam ? stageTeam.name : 'Sem Equipe'})`;

                          return (
                            <div
                              key={stage.id}
                              className="project-bar-card"
                              draggable
                              onDragStart={(e) => handleProjectDragStart(e, project, stage)}
                              onDragEnd={handleProjectDragEnd}
                              onClick={() => onEditProject(project)}
                              style={{
                                top: `${topOffset}px`,
                                height: `${cardHeight}px`,
                                left: `calc(${leftPct}% + 4px)`,
                                width: `calc(${widthPct}% - 8px)`,
                                backgroundColor: cardColor,
                                boxShadow: `0 4px 12px ${cardColor}40`,
                                borderColor: cardColor,
                                display: "flex",
                                flexDirection: totalLanes > 1 ? "row" : "column",
                                justifyContent: totalLanes > 1 ? "space-between" : "center",
                                alignItems: totalLanes > 1 ? "center" : "flex-start",
                                padding: "0 10px",
                                borderRadius: "8px",
                                color: "#ffffff",
                                pointerEvents: isDraggingProject ? "none" : "auto"
                              }}
                              title={`Obra: ${project.name}\nEtapa: ${stage.name}\nCliente: ${project.client}\nEquipe: ${stageTeam ? `${stageTeam.name} (${stageTeam.leader})` : "Nenhuma"}\nPeríodo: ${stage.startDate.split("-").reverse().join("/")} até ${stage.endDate.split("-").reverse().join("/")}\nHorário: ${stage.period === "full_day" ? "Dia Inteiro" : `${stage.startTime} - ${stage.endTime}`}`}
                            >
                              <div 
                                className="project-title-bar" 
                                style={{ 
                                  fontSize: totalLanes > 1 ? "0.78rem" : "0.82rem", 
                                  fontWeight: "700", 
                                  whiteSpace: "nowrap", 
                                  overflow: "hidden", 
                                  textOverflow: "ellipsis",
                                  maxWidth: totalLanes > 1 ? "60%" : "100%"
                                }}
                              >
                                {cardTitleText}
                              </div>
                              <div 
                                className="project-time-bar" 
                                style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: "6px", 
                                  fontSize: totalLanes > 1 ? "0.72rem" : "0.74rem", 
                                  opacity: 0.95, 
                                  whiteSpace: "nowrap" 
                                }}
                              >
                                <span 
                                  className="project-status-dot" 
                                  style={{ backgroundColor: getStatusColor(project.status), width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0 }} 
                                />
                                {stage.period === "full_day" ? "Dia Inteiro" : `${stage.startTime} - ${stage.endTime}`}
                              </div>
                            </div>
                          );
                        })}
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
  );
}
