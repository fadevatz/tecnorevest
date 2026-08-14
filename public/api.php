<?php
// ============================================================
// API REST PHP + MYSQL PARA AGENDA TECNO REVEST (cPanel)
// ============================================================

// Permitir requisições CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Tratar requisição prévia OPTIONS CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ============================================================
// CONFIGURAÇÕES DO BANCO DE DADOS (Preencha com seus dados do cPanel)
// ============================================================
$db_host = 'localhost';
$db_name = 'SEU_BANCO_DE_DADOS'; // Ex: usuario_tecnorevest
$db_user = 'SEU_USUARIO_MYSQL';  // Ex: usuario_tecno_user
$db_pass = 'SUA_SENHA_MYSQL';    // Ex: SuaSenhaForte123!

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Falha ao conectar no banco de dados MySQL.",
        "error" => $e->getMessage()
    ]);
    exit();
}

// Obter ação
$action = $_GET['action'] ?? $_POST['action'] ?? '';
$inputData = json_decode(file_get_contents('php_input'), true) ?? $_POST;

try {
    switch ($action) {

        // ----------------------------------------------------
        // LOGIN: Autenticação de Usuário
        // ----------------------------------------------------
        case 'login':
            $username = trim($inputData['username'] ?? '');
            $password = trim($inputData['password'] ?? '');

            $stmt = $pdo->prepare("SELECT id, username, password, name, role FROM users WHERE LOWER(username) = LOWER(:username)");
            $stmt->execute([':username' => $username]);
            $user = $stmt->fetch();

            if ($user && $user['password'] === $password) {
                echo json_encode([
                    "success" => true,
                    "user" => [
                        "id" => $user['id'],
                        "username" => $user['username'],
                        "name" => $user['name'],
                        "role" => $user['role']
                    ]
                ]);
            } else {
                echo json_encode(["success" => false, "message" => "Usuário ou senha incorretos."]);
            }
            break;

        // ----------------------------------------------------
        // CHANGE PASSWORD: Alterar Senha do Usuário
        // ----------------------------------------------------
        case 'change_password':
            $username = trim($inputData['username'] ?? 'Admin');
            $oldPassword = trim($inputData['oldPassword'] ?? '');
            $newPassword = trim($inputData['newPassword'] ?? '');

            $stmt = $pdo->prepare("SELECT id, password FROM users WHERE LOWER(username) = LOWER(:username)");
            $stmt->execute([':username' => $username]);
            $user = $stmt->fetch();

            if (!$user || $user['password'] !== $oldPassword) {
                echo json_encode(["success" => false, "message" => "A senha atual está incorreta."]);
                break;
            }

            $updateStmt = $pdo->prepare("UPDATE users SET password = :newPassword WHERE id = :id");
            $updateStmt->execute([
                ':newPassword' => $newPassword,
                ':id' => $user['id']
            ]);

            echo json_encode(["success" => true, "message" => "Senha alterada com sucesso!"]);
            break;

        // ----------------------------------------------------
        // GET ALL: Retorna todos os projetos, equipes e funcionários
        // ----------------------------------------------------
        case 'get_all':
            $teamsStmt = $pdo->query("SELECT id, name, color, leader FROM teams ORDER BY name ASC");
            $teams = $teamsStmt->fetchAll();

            $empStmt = $pdo->query("SELECT id, name, role, team_id as teamId, phone, email, status FROM employees ORDER BY name ASC");
            $employees = $empStmt->fetchAll();

            $projStmt = $pdo->query("SELECT id, name, client, team_id as teamId, DATE_FORMAT(start_date, '%Y-%m-%d') as startDate, DATE_FORMAT(end_date, '%Y-%m-%d') as endDate, period, start_time as startTime, end_time as endTime, status, location, description, stages FROM projects ORDER BY start_date ASC");
            $rawProjects = $projStmt->fetchAll();
            $projects = array_map(function($p) {
                if (!empty($p['stages'])) {
                    $decoded = json_decode($p['stages'], true);
                    if (is_array($decoded)) {
                        $p['stages'] = $decoded;
                    }
                }
                return $p;
            }, $rawProjects);

            echo json_encode([
                "success" => true,
                "teams" => $teams,
                "employees" => $employees,
                "projects" => $projects
            ]);
            break;

        // ----------------------------------------------------
        // SAVE PROJECT: Inserir ou Atualizar Projeto
        // ----------------------------------------------------
        case 'save_project':
            $stagesJson = null;
            if (isset($inputData['stages']) && is_array($inputData['stages'])) {
                $stagesJson = json_encode($inputData['stages']);
            } elseif (isset($inputData['stages']) && is_string($inputData['stages'])) {
                $stagesJson = $inputData['stages'];
            }

            $stmt = $pdo->prepare("
                INSERT INTO projects (id, name, client, team_id, start_date, end_date, period, start_time, end_time, status, location, description, stages)
                VALUES (:id, :name, :client, :teamId, :startDate, :endDate, :period, :startTime, :endTime, :status, :location, :description, :stages)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    client = VALUES(client),
                    team_id = VALUES(team_id),
                    start_date = VALUES(start_date),
                    end_date = VALUES(end_date),
                    period = VALUES(period),
                    start_time = VALUES(start_time),
                    end_time = VALUES(end_time),
                    status = VALUES(status),
                    location = VALUES(location),
                    description = VALUES(description),
                    stages = VALUES(stages)
            ");
            $stmt->execute([
                ':id' => $inputData['id'],
                ':name' => $inputData['name'],
                ':client' => $inputData['client'] ?? '',
                ':teamId' => !empty($inputData['teamId']) ? $inputData['teamId'] : null,
                ':startDate' => $inputData['startDate'],
                ':endDate' => $inputData['endDate'],
                ':period' => $inputData['period'] ?? 'full_day',
                ':startTime' => $inputData['startTime'] ?? '08:00',
                ':endTime' => $inputData['endTime'] ?? '18:00',
                ':status' => $inputData['status'] ?? 'progress',
                ':location' => $inputData['location'] ?? '',
                ':description' => $inputData['description'] ?? '',
                ':stages' => $stagesJson
            ]);

            echo json_encode(["success" => true, "message" => "Projeto salvo com sucesso!"]);
            break;

        // ----------------------------------------------------
        // DELETE PROJECT: Excluir Projeto
        // ----------------------------------------------------
        case 'delete_project':
            $stmt = $pdo->prepare("DELETE FROM projects WHERE id = :id");
            $stmt->execute([':id' => $inputData['id']]);
            echo json_encode(["success" => true, "message" => "Projeto excluído!"]);
            break;

        // ----------------------------------------------------
        // SAVE TEAM: Inserir ou Atualizar Equipe
        // ----------------------------------------------------
        case 'save_team':
            $stmt = $pdo->prepare("
                INSERT INTO teams (id, name, color, leader)
                VALUES (:id, :name, :color, :leader)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    color = VALUES(color),
                    leader = VALUES(leader)
            ");
            $stmt->execute([
                ':id' => $inputData['id'],
                ':name' => $inputData['name'],
                ':color' => $inputData['color'] ?? '#2258A3',
                ':leader' => $inputData['leader'] ?? ''
            ]);

            echo json_encode(["success" => true, "message" => "Equipe salva com sucesso!"]);
            break;

        // ----------------------------------------------------
        // DELETE TEAM: Excluir Equipe
        // ----------------------------------------------------
        case 'delete_team':
            $stmt = $pdo->prepare("DELETE FROM teams WHERE id = :id");
            $stmt->execute([':id' => $inputData['id']]);
            echo json_encode(["success" => true, "message" => "Equipe excluída!"]);
            break;

        // ----------------------------------------------------
        // SAVE EMPLOYEE: Inserir ou Atualizar Funcionário
        // ----------------------------------------------------
        case 'save_employee':
            $stmt = $pdo->prepare("
                INSERT INTO employees (id, name, role, team_id, phone, email, status)
                VALUES (:id, :name, :role, :teamId, :phone, :email, :status)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    role = VALUES(role),
                    team_id = VALUES(team_id),
                    phone = VALUES(phone),
                    email = VALUES(email),
                    status = VALUES(status)
            ");
            $stmt->execute([
                ':id' => $inputData['id'],
                ':name' => $inputData['name'],
                ':role' => $inputData['role'] ?? '',
                ':teamId' => !empty($inputData['teamId']) ? $inputData['teamId'] : null,
                ':phone' => $inputData['phone'] ?? '',
                ':email' => $inputData['email'] ?? '',
                ':status' => $inputData['status'] ?? 'active'
            ]);

            echo json_encode(["success" => true, "message" => "Funcionário salvo com sucesso!"]);
            break;

        // ----------------------------------------------------
        // DELETE EMPLOYEE: Excluir Funcionário
        // ----------------------------------------------------
        case 'delete_employee':
            $stmt = $pdo->prepare("DELETE FROM employees WHERE id = :id");
            $stmt->execute([':id' => $inputData['id']]);
            echo json_encode(["success" => true, "message" => "Funcionário excluído!"]);
            break;

        default:
            echo json_encode(["success" => false, "message" => "Ação não especificada ou inválida."]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erro no servidor ao processar requisição.",
        "error" => $e->getMessage()
    ]);
}
