// ============================================================
// SERVIÇO DE CONEXÃO MULTI-BACKEND (SUPABASE / MYSQL / LOCALSTORAGE)
// AGENDA TECNO REVEST
// ============================================================

import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

const API_URL = "./api.php";

/**
 * Autentica o usuário no Supabase ou API MySQL (com fallback para localStorage).
 */
export async function loginApi(username, password) {
  // 1. Tentar autenticação via Supabase se configurado
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, username, password, name, role")
        .ilike("username", username.trim())
        .maybeSingle();

      if (!error && data) {
        if (data.password === password) {
          console.log("🟢 Autenticado via Supabase!");
          return {
            success: true,
            user: {
              id: data.id,
              username: data.username,
              name: data.name,
              role: data.role
            }
          };
        } else {
          return { success: false, message: "Usuário ou senha incorretos." };
        }
      }
    } catch (err) {
      console.warn("Falha no login Supabase, tentando fallbacks:", err);
    }
  }

  // 2. Tentar API PHP MySQL
  try {
    const res = await fetch(`${API_URL}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data && data.success) {
      return { success: true, user: data.user };
    }
  } catch (err) {
    // API PHP indisponível
  }

  // 3. Fallback LocalStorage
  const storedPassword = localStorage.getItem("tecnorevest_admin_password") || "Admin";
  const isValidUser = username.toLowerCase() === "admin";
  const isValidPass = password === storedPassword || (storedPassword === "Admin" && password.toLowerCase() === "admin");

  if (isValidUser && isValidPass) {
    return {
      success: true,
      user: { username: "Admin", name: "Administrador", role: "Gestor de Obras" }
    };
  }

  return { success: false, message: "Usuário ou senha incorretos." };
}

/**
 * Altera a senha do usuário.
 */
export async function changePasswordApi(username, oldPassword, newPassword) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, password")
        .ilike("username", username.trim())
        .maybeSingle();

      if (!error && data) {
        if (data.password !== oldPassword) {
          return { success: false, message: "A senha atual está incorreta." };
        }
        const { error: updateError } = await supabase
          .from("users")
          .update({ password: newPassword })
          .eq("id", data.id);

        if (!updateError) {
          localStorage.setItem("tecnorevest_admin_password", newPassword);
          return { success: true, message: "Senha alterada no Supabase com sucesso!" };
        }
      }
    } catch (err) {
      console.warn("Erro ao alterar senha no Supabase:", err);
    }
  }

  // Fallback MySQL / LocalStorage
  try {
    const res = await fetch(`${API_URL}?action=change_password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, oldPassword, newPassword })
    });
    const data = await res.json();
    if (data && data.success) {
      localStorage.setItem("tecnorevest_admin_password", newPassword);
      return { success: true, message: data.message };
    }
  } catch (err) {
    // PHP offline
  }

  const storedPassword = localStorage.getItem("tecnorevest_admin_password") || "Admin";
  const isValidOld = oldPassword === storedPassword || (storedPassword === "Admin" && oldPassword.toLowerCase() === "admin");

  if (!isValidOld) {
    return { success: false, message: "A senha atual está incorreta." };
  }

  localStorage.setItem("tecnorevest_admin_password", newPassword);
  return { success: true, message: "Senha alterada com sucesso!" };
}

/**
 * Carrega todos os dados do Supabase, API MySQL PHP ou LocalStorage.
 */
export async function loadInitialData(fallbackProjects, fallbackTeams, fallbackEmployees) {
  // 1. Tentar carregar do Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const [teamsRes, empRes, projRes] = await Promise.all([
        supabase.from("teams").select("*").order("name", { ascending: true }),
        supabase.from("employees").select("*").order("name", { ascending: true }),
        supabase.from("projects").select("*").order("start_date", { ascending: true })
      ]);

      if (!teamsRes.error && !empRes.error && !projRes.error) {
        console.log("⚡ Dados carregados do Supabase com sucesso!");
        
        const teams = teamsRes.data.map(t => ({
          id: t.id,
          name: t.name,
          color: t.color,
          leader: t.leader
        }));

        const employees = empRes.data.map(e => ({
          id: e.id,
          name: e.name,
          role: e.role,
          teamId: e.team_id,
          phone: e.phone || '',
          email: e.email || '',
          status: e.status || 'active'
        }));

        const projects = projRes.data.map(p => ({
          id: p.id,
          name: p.name,
          client: p.client,
          teamId: p.team_id,
          startDate: p.start_date,
          endDate: p.end_date,
          period: p.period,
          startTime: p.start_time,
          endTime: p.end_time,
          status: p.status,
          location: p.location || '',
          description: p.description || '',
          stages: p.stages || null
        }));

        return {
          projects: projects.length > 0 ? projects : fallbackProjects,
          teams: teams.length > 0 ? teams : fallbackTeams,
          employees: employees.length > 0 ? employees : fallbackEmployees,
          isLiveDb: true,
          provider: "Supabase"
        };
      }
    } catch (err) {
      console.warn("⚠️ Erro ao consultar Supabase, utilizando fallback:", err.message);
    }
  }

  // 2. Tentar API MySQL PHP
  try {
    const response = await fetch(`${API_URL}?action=get_all`, { cache: "no-store" });
    if (response.ok) {
      const result = await response.json();
      if (result && result.success) {
        console.log("🟢 Dados carregados do MySQL (cPanel) com sucesso!");
        return {
          projects: result.projects.length > 0 ? result.projects : fallbackProjects,
          teams: result.teams.length > 0 ? result.teams : fallbackTeams,
          employees: result.employees.length > 0 ? result.employees : fallbackEmployees,
          isLiveDb: true,
          provider: "MySQL"
        };
      }
    }
  } catch (err) {
    // API PHP offline
  }

  // 3. Fallback LocalStorage
  const localProj = localStorage.getItem("tecnorevest_projects");
  const localTeams = localStorage.getItem("tecnorevest_teams");
  const localEmp = localStorage.getItem("tecnorevest_employees");

  return {
    projects: localProj ? JSON.parse(localProj) : fallbackProjects,
    teams: localTeams ? JSON.parse(localTeams) : fallbackTeams,
    employees: localEmp ? JSON.parse(localEmp) : fallbackEmployees,
    isLiveDb: false,
    provider: "LocalStorage"
  };
}

/**
 * Salva ou atualiza um projeto.
 */
export async function saveProjectApi(project) {
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        id: project.id,
        name: project.name,
        client: project.client || '',
        team_id: project.teamId || null,
        start_date: project.startDate,
        end_date: project.endDate,
        period: project.period || 'full_day',
        start_time: project.startTime || '08:00',
        end_time: project.endTime || '18:00',
        status: project.status || 'progress',
        location: project.location || '',
        description: project.description || '',
        stages: project.stages || null
      };

      const { error } = await supabase
        .from("projects")
        .upsert(payload, { onConflict: "id" });

      if (!error) return true;
      console.error("Erro ao salvar projeto no Supabase:", error);
    } catch (err) {
      console.warn("Erro ao comunicar com Supabase:", err);
    }
  }

  // Fallback PHP API
  try {
    const res = await fetch(`${API_URL}?action=save_project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project)
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    return false;
  }
}

/**
 * Exclui um projeto.
 */
export async function deleteProjectApi(projectId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (!error) return true;
    } catch (err) {
      console.warn("Erro ao deletar projeto no Supabase:", err);
    }
  }

  try {
    const res = await fetch(`${API_URL}?action=delete_project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId })
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    return false;
  }
}

/**
 * Salva ou atualiza uma equipe.
 */
export async function saveTeamApi(team) {
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        id: team.id,
        name: team.name,
        color: team.color || '#2258A3',
        leader: team.leader || ''
      };

      const { error } = await supabase
        .from("teams")
        .upsert(payload, { onConflict: "id" });

      if (!error) return true;
    } catch (err) {
      console.warn("Erro ao salvar equipe no Supabase:", err);
    }
  }

  try {
    const res = await fetch(`${API_URL}?action=save_team`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(team)
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    return false;
  }
}

/**
 * Exclui uma equipe.
 */
export async function deleteTeamApi(teamId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (!error) return true;
    } catch (err) {
      console.warn("Erro ao deletar equipe no Supabase:", err);
    }
  }

  try {
    const res = await fetch(`${API_URL}?action=delete_team`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: teamId })
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    return false;
  }
}

/**
 * Salva ou atualiza um funcionário.
 */
export async function saveEmployeeApi(employee) {
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        id: employee.id,
        name: employee.name,
        role: employee.role || '',
        team_id: employee.teamId || null,
        phone: employee.phone || '',
        email: employee.email || '',
        status: employee.status || 'active'
      };

      const { error } = await supabase
        .from("employees")
        .upsert(payload, { onConflict: "id" });

      if (!error) return true;
    } catch (err) {
      console.warn("Erro ao salvar funcionário no Supabase:", err);
    }
  }

  try {
    const res = await fetch(`${API_URL}?action=save_employee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee)
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    return false;
  }
}

/**
 * Exclui um funcionário.
 */
export async function deleteEmployeeApi(employeeId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", employeeId);

      if (!error) return true;
    } catch (err) {
      console.warn("Erro ao deletar funcionário no Supabase:", err);
    }
  }

  try {
    const res = await fetch(`${API_URL}?action=delete_employee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: employeeId })
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    return false;
  }
}
