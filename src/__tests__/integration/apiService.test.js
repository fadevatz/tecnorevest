import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadInitialData, saveProjectApi, deleteProjectApi } from "../../services/apiService.js";

describe("apiService - Integration Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("deve carregar dados iniciais dos mocks quando o localStorage estiver vazio", async () => {
    const mockDefaultProjects = [{ id: "proj-1", name: "Projeto Padrão" }];
    const mockDefaultTeams = [{ id: "t1", name: "Equipe 1" }];
    const mockDefaultEmployees = [{ id: "e1", name: "Func 1" }];

    const data = await loadInitialData(mockDefaultProjects, mockDefaultTeams, mockDefaultEmployees);

    expect(data.projects).toEqual(mockDefaultProjects);
    expect(data.teams).toEqual(mockDefaultTeams);
    expect(data.employees).toEqual(mockDefaultEmployees);
  });

  it("deve salvar novo projeto no localStorage como fallback limpo", async () => {
    const newProject = { id: "proj-99", name: "Nova Obra Teste", status: "progress" };
    const saved = await saveProjectApi(newProject);

    expect(saved.id).toBe("proj-99");
    const stored = JSON.parse(localStorage.getItem("tecnorevest_projects"));
    expect(stored).toEqual([newProject]);
  });

  it("deve remover projeto ao invocar deleteProjectApi", async () => {
    const p1 = { id: "p1", name: "Projeto 1" };
    const p2 = { id: "p2", name: "Projeto 2" };
    localStorage.setItem("tecnorevest_projects", JSON.stringify([p1, p2]));

    await deleteProjectApi("p1");

    const stored = JSON.parse(localStorage.getItem("tecnorevest_projects"));
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("p2");
  });
});
