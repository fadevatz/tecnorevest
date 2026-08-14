export const initialTeams = [
  {
    id: "team-1",
    name: "Equipe Epóxi",
    leader: "Carlos Silva",
    color: "#2258A3" // Azul Corporativo
  },
  {
    id: "team-2",
    name: "Equipe Poliuretano",
    leader: "Marcos Souza",
    color: "#F38221" // Laranja Corporativo
  },
  {
    id: "team-3",
    name: "Equipe Cimentícios",
    leader: "Fernando Lima",
    color: "#10B981" // Verde Esmeralda
  }
];

export const initialEmployees = [
  {
    id: "emp-1",
    name: "Carlos Silva",
    role: "Líder de Equipe / Aplicador Senior",
    teamId: "team-1",
    status: "active"
  },
  {
    id: "emp-2",
    name: "João Santos",
    role: "Auxiliar Técnico",
    teamId: "team-1",
    status: "active"
  },
  {
    id: "emp-3",
    name: "Marcos Souza",
    role: "Líder de Equipe / Especialista PU",
    teamId: "team-2",
    status: "active"
  },
  {
    id: "emp-4",
    name: "Roberto Dias",
    role: "Aplicador",
    teamId: "team-2",
    status: "active"
  },
  {
    id: "emp-5",
    name: "Fernando Lima",
    role: "Líder de Equipe / Autonivelantes",
    teamId: "team-3",
    status: "active"
  },
  {
    id: "emp-6",
    name: "Pedro Santos",
    role: "Auxiliar Técnico",
    teamId: "team-3",
    status: "active"
  }
];

export const initialProjects = [
  {
    id: "proj-1",
    name: "Revestimento Epóxi - Galpão Logístico",
    client: "LogiTech Transportes",
    teamId: "team-1",
    startDate: "2026-07-01",
    endDate: "2026-07-14",
    period: "full_day",
    startTime: "08:00",
    endTime: "18:00",
    status: "completed",
    stages: [
      {
        id: "stg-1-1",
        name: "Etapa 1 - Preparação e Aplicação Epóxi",
        startDate: "2026-07-01",
        endDate: "2026-07-05",
        teamId: "team-1",
        period: "full_day",
        startTime: "08:00",
        endTime: "18:00"
      },
      {
        id: "stg-1-2",
        name: "Etapa 2 - Selagem e Demarcação",
        startDate: "2026-07-10",
        endDate: "2026-07-14",
        teamId: "team-1",
        period: "full_day",
        startTime: "08:00",
        endTime: "18:00"
      }
    ]
  },
  {
    id: "proj-2",
    name: "Piso PU Antiderrapante - Cozinha Industrial",
    client: "Restaurante Sabor & Arte",
    teamId: "team-2",
    startDate: "2026-07-07",
    endDate: "2026-07-18",
    period: "custom",
    startTime: "13:30",
    endTime: "19:00",
    status: "completed",
    stages: [
      {
        id: "stg-2-1",
        name: "Etapa 1 - Base Poliuretano",
        startDate: "2026-07-07",
        endDate: "2026-07-10",
        teamId: "team-2",
        period: "custom",
        startTime: "13:30",
        endTime: "19:00"
      },
      {
        id: "stg-2-2",
        name: "Etapa 2 - Acabamento Antiderrapante",
        startDate: "2026-07-15",
        endDate: "2026-07-18",
        teamId: "team-3",
        period: "custom",
        startTime: "13:30",
        endTime: "19:00"
      }
    ]
  },
  {
    id: "proj-3",
    name: "Nivelamento Cimentício - Estacionamento Subterrâneo",
    client: "Condomínio Plaza",
    teamId: "team-3",
    startDate: "2026-07-13",
    endDate: "2026-07-20",
    period: "full_day",
    startTime: "08:00",
    endTime: "18:00",
    status: "progress",
    stages: [
      {
        id: "stg-3-1",
        name: "Etapa 1 - Desbaste e Nivelamento",
        startDate: "2026-07-13",
        endDate: "2026-07-20",
        teamId: "team-3",
        period: "full_day",
        startTime: "08:00",
        endTime: "18:00"
      }
    ]
  },
  {
    id: "proj-4",
    name: "Aplicação de Epóxi Autonivelante - Laboratório MedLab",
    client: "MedLab Diagnósticos",
    teamId: "team-1",
    startDate: "2026-07-22",
    endDate: "2026-07-28",
    period: "custom",
    startTime: "08:00",
    endTime: "12:00",
    status: "progress",
    stages: [
      {
        id: "stg-4-1",
        name: "Etapa 1 - Primers e Autonivelante",
        startDate: "2026-07-22",
        endDate: "2026-07-28",
        teamId: "team-1",
        period: "custom",
        startTime: "08:00",
        endTime: "12:00"
      }
    ]
  },
  {
    id: "proj-5",
    name: "Recuperação de Piso Cimentício - Depósito central",
    client: "Supermercados Baratão",
    teamId: "team-3",
    startDate: "2026-08-03",
    endDate: "2026-08-09",
    period: "full_day",
    startTime: "08:00",
    endTime: "18:00",
    status: "planned",
    stages: [
      {
        id: "stg-5-1",
        name: "Etapa 1 - Tratamento de Juntas e Trincas",
        startDate: "2026-08-03",
        endDate: "2026-08-09",
        teamId: "team-3",
        period: "full_day",
        startTime: "08:00",
        endTime: "18:00"
      }
    ]
  }
];
