-- ============================================================
-- ESQUEMA DO BANCO DE DADOS MYSQL PARA AGENDA TECNO REVEST (cPanel)
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL DEFAULT 'Administrador',
  `role` VARCHAR(50) NOT NULL DEFAULT 'Gestor de Obras',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `teams` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `color` VARCHAR(20) NOT NULL DEFAULT '#2258A3',
  `leader` VARCHAR(100) NOT NULL DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `employees` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(100) NOT NULL,
  `team_id` VARCHAR(50) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT '',
  `email` VARCHAR(100) DEFAULT '',
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_employees_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `projects` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `client` VARCHAR(150) NOT NULL,
  `team_id` VARCHAR(50) DEFAULT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `period` VARCHAR(20) NOT NULL DEFAULT 'full_day',
  `start_time` VARCHAR(10) NOT NULL DEFAULT '08:00',
  `end_time` VARCHAR(10) NOT NULL DEFAULT '18:00',
  `status` VARCHAR(30) NOT NULL DEFAULT 'progress',
  `location` VARCHAR(255) DEFAULT '',
  `description` TEXT,
  `stages` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_projects_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DADOS INICIAIS (MOCK DATA)
-- ============================================================

INSERT INTO `users` (`username`, `password`, `name`, `role`) VALUES
('Admin', 'Admin', 'Administrador', 'Gestor de Obras')
ON DUPLICATE KEY UPDATE `username`=`username`;

INSERT INTO `teams` (`id`, `name`, `color`, `leader`) VALUES
('team_1', 'Equipe Azul', '#2258A3', 'Felipe'),
('team_2', 'Equipe Laranja', '#F38221', 'Marcos Souza'),
('team_3', 'Equipe Verde', '#38a169', 'Fernando Lima')
ON DUPLICATE KEY UPDATE `name`=`name`;

INSERT INTO `employees` (`id`, `name`, `role`, `team_id`, `phone`, `email`, `status`) VALUES
('emp_1', 'Carlos Silva', 'Aplicador Epóxi', 'team_1', '(11) 98765-4321', 'carlos@tecnorevest.com.br', 'active'),
('emp_2', 'Roberto Santos', 'Preparador de Piso', 'team_1', '(11) 97654-3210', 'roberto@tecnorevest.com.br', 'active'),
('emp_3', 'Lucas Mendes', 'Técnico Poliuretano', 'team_2', '(11) 96543-2109', 'lucas@tecnorevest.com.br', 'active'),
('emp_4', 'André Oliveira', 'Auxiliar de Aplicação', 'team_3', '(11) 95432-1098', 'andre@tecnorevest.com.br', 'active')
ON DUPLICATE KEY UPDATE `name`=`name`;

INSERT INTO `projects` (`id`, `name`, `client`, `team_id`, `start_date`, `end_date`, `period`, `start_time`, `end_time`, `status`, `location`, `description`) VALUES
('proj_1', 'Revestimento Epóxi - Galpão 01', 'Logística Brasil Ltda', 'team_1', '2026-07-06', '2026-07-10', 'full_day', '08:00', '18:00', 'progress', 'Av. Industrial, 1000 - Barueri/SP', 'Aplicação de autonivelante epóxi 2mm'),
('proj_2', 'Piso PU Antiderrapante', 'Cervejaria Artesanal', 'team_2', '2026-07-08', '2026-07-14', 'custom', '13:30', '19:00', 'planned', 'Rua das Flores, 500 - Jundiaí/SP', 'Piso uretano 4mm para área molhada'),
('proj_3', 'Nivelamento Cimentício - Estacionamento', 'Shopping Plaza', 'team_3', '2026-07-13', '2026-07-20', 'full_day', '08:00', '18:00', 'progress', 'Al. Rio Negro, 200 - Alphaville/SP', 'Recuperação de substrato cimentício'),
('proj_4', 'Laboratório MedLab', 'Farmacêutica SP', 'team_1', '2026-07-20', '2026-07-22', 'custom', '08:00', '12:00', 'planned', 'Rua Vergueiro, 1200 - São Paulo/SP', 'Piso condutivo para sala limpa')
ON DUPLICATE KEY UPDATE `name`=`name`;
