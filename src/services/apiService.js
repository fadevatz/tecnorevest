// ============================================================
// SERVIÇO DE CONEXÃO COM A API MYSQL (cPanel) & FALLBACK LOCALSTORAGE
// ============================================================

const API_URL = "./api.php";

/**
 * Autentica o usuário na API MySQL (com fallback para localStorage).
 */
export async function loginApi(username, password) {
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
    console.warn("API Offline, validando via localStorage:", err);
  }

  // Fallback local
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
 * Altera a senha do usuário na API MySQL (com fallback para localStorage).
 */
export async function changePasswordApi(username, oldPassword, newPassword) {
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
    } else if (data && !data.success) {
      return { success: false, message: data.message };
    }
  } catch (err) {
    console.warn("API Offline, atualizando apenas localStorage:", err);
  }

  // Fallback local
  const storedPassword = localStorage.getItem("tecnorevest_admin_password") || "Admin";
  const isValidOld = oldPassword === storedPassword || (storedPassword === "Admin" && oldPassword.toLowerCase() === "admin");

  if (!isValidOld) {
    return { success: false, message: "A senha atual está incorreta." };
  }

  localStorage.setItem("tecnorevest_admin_password", newPassword);
  return { success: true, message: "Senha alterada com sucesso!" };
}

/**
 * Carrega todos os dados do servidor (MySQL via PHP) ou do localStorage se a API não estiver disponível.
 */
export async function loadInitialData(fallbackProjects, fallbackTeams, fallbackEmployees) {
  try {
    const response = await fetch(`${API_URL}?action=get_all`, { cache: "no-store" });
    if (!response.ok) throw new Error("API indisponível");

    const result = await response.json();
    if (result && result.success) {
      console.log("🟢 Dados carregados do MySQL (cPanel) com sucesso!");
      return {
        projects: result.projects.length > 0 ? result.projects : fallbackProjects,
        teams: result.teams.length > 0 ? result.teams : fallbackTeams,
        employees: result.employees.length > 0 ? result.employees : fallbackEmployees,
        isLiveDb: true
      };
    }
  } catch (err) {
    console.warn("⚠️ API MySQL não detectada (rodando via localStorage):", err.message);
  }

  // Fallback para LocalStorage se o backend PHP não responder
  const localProj = localStorage.getItem("tecnorevest_projects");
  const localTeams = localStorage.getItem("tecnorevest_teams");
  const localEmp = localStorage.getItem("tecnorevest_employees");

  return {
    projects: localProj ? JSON.parse(localProj) : fallbackProjects,
    teams: localTeams ? JSON.parse(localTeams) : fallbackTeams,
    employees: localEmp ? JSON.parse(localEmp) : fallbackEmployees,
    isLiveDb: false
  };
}

/**
 * Salva ou atualiza um projeto no MySQL.
 */
export async function saveProjectApi(project) {
  try {
    const res = await fetch(`${API_URL}?action=save_project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project)
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.warn("API Offline, salvando apenas localmente:", err);
    return false;
  }
}

/**
 * Exclui um projeto no MySQL.
 */
export async function deleteProjectApi(projectId) {
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
 * Salva ou atualiza uma equipe no MySQL.
 */
export async function saveTeamApi(team) {
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
 * Exclui uma equipe no MySQL.
 */
export async function deleteTeamApi(teamId) {
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
 * Salva ou atualiza um funcionário no MySQL.
 */
export async function saveEmployeeApi(employee) {
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
 * Exclui um funcionário no MySQL.
 */
export async function deleteEmployeeApi(employeeId) {
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
