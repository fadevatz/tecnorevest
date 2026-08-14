import { describe, it, expect } from "vitest";
import { normalizeProject } from "../../App.jsx";

describe("normalizeProject - Unit Tests", () => {
  it("deve retornar null se o projeto for nulo ou indefinido", () => {
    expect(normalizeProject(null)).toBeNull();
    expect(normalizeProject(undefined)).toBeUndefined();
  });

  it("deve criar etapa padrão se o projeto não tiver stages válidas", () => {
    const rawProject = {
      id: "p1",
      name: "Obra Teste",
      startDate: "2026-08-10",
      endDate: "2026-08-15",
      teamId: "team-1"
    };

    const normalized = normalizeProject(rawProject, [{ id: "team-1", name: "Equipe Epóxi" }]);
    expect(normalized.stages).toHaveLength(1);
    expect(normalized.stages[0].name).toBe("Etapa 1");
    expect(normalized.stages[0].startDate).toBe("2026-08-10");
  });

  it("deve ordenar as etapas por data de início e calcular min/max das datas", () => {
    const rawProject = {
      id: "p2",
      name: "Obra Multi-Etapas",
      stages: [
        { id: "s2", name: "Etapa 2", startDate: "2026-08-15", endDate: "2026-08-20", teamId: "t2" },
        { id: "s1", name: "Etapa 1", startDate: "2026-08-01", endDate: "2026-08-10", teamId: "t1" }
      ]
    };

    const normalized = normalizeProject(rawProject, []);
    expect(normalized.stages[0].name).toBe("Etapa 1");
    expect(normalized.stages[1].name).toBe("Etapa 2");
    expect(normalized.startDate).toBe("2026-08-01");
    expect(normalized.endDate).toBe("2026-08-20");
    expect(normalized.teamId).toBe("t1");
  });
});
