# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
React 19, Vite, @bitnoi.se/react-scheduler, Day.js, Oxlint, Biome, Vitest, Playwright, MySQL backend (schema.sql).

## Users
Gestores de Obras e Coordenadores da TecnoRevest que alocam equipes técnicas, agendam projetos de revestimento industrial e acompanham o status e execução das obras em tempo real.

## Product Purpose
Prover um sistema centralizado e intuitivo de agendamento, visualização em linha do tempo (timeline/scheduler) e gestão de equipes de revestimento epóxi, poliuretano, nivelamento cimentício e salas limpas.

## Positioning
Especializado na operação de revestimento industrial: controle detalhado de equipes, locais de aplicação, turnos e horários customizados, etapas de obra e prevenção de conflitos de alocação de profissionais e times.

## Operating Context
Painel web corporativo de alta densidade de informação utilizado por gestores de obras em desktop e notebooks de campo. Exige rápida leitura de status, busca imediata e navegabilidade sem atritos.

## Capabilities and Constraints
- **Capacidades**: Agendamento em linha do tempo por equipe, cadastro e edição de equipes e colaboradores, gestão de projetos com prazos e etapas, autenticação e perfil de usuário.
- **Restrições**: Interface Web responsiva; alinhamento rigoroso ao esquema do banco de dados MySQL (`users`, `teams`, `employees`, `projects`).

## Brand Commitments
- Identidade visual corporativa TecnoRevest.
- Sistema de cores distintivo por equipe (ex.: Equipe Azul `#2258A3`, Equipe Laranja `#F38221`, Equipe Verde `#38a169`).

## Evidence on Hand
- Estrutura completa de aplicação React em [package.json](file:///c:/Users/Devatz/Desktop/ANTIGRAVITY/Agenda-TecnoRevest-V2/package.json).
- Modelo de banco de dados e dados mock iniciais em [schema.sql](file:///c:/Users/Devatz/Desktop/ANTIGRAVITY/Agenda-TecnoRevest-V2/schema.sql).
- Componentes funcionais existentes em `src/components/` ([AgendaPanel.jsx](file:///c:/Users/Devatz/Desktop/ANTIGRAVITY/Agenda-TecnoRevest-V2/src/components/AgendaPanel.jsx), [Dashboard.jsx](file:///c:/Users/Devatz/Desktop/ANTIGRAVITY/Agenda-TecnoRevest-V2/src/components/Dashboard.jsx), [RegistrationModules.jsx](file:///c:/Users/Devatz/Desktop/ANTIGRAVITY/Agenda-TecnoRevest-V2/src/components/RegistrationModules.jsx)).

## Product Principles
1. **Clareza Visual Instantânea**: Identificação rápida de equipes, alocações e status das obras.
2. **Alta Produtividade Operacional**: Ações de agendamento e cadastro ágeis com mínima sobrecarga cognitiva.
3. **Integridade de Dados**: Coerência estrita entre projetos, colaboradores e equipes vinculadas.
4. **Craft & Polimento UX**: Design refinado, responsivo, acessível e com micro-interações fluidas.

## Accessibility & Inclusion
Contraste elevado para marcação de equipes, suporte a leitores de tela em elementos interativos e indicadores de status com dupla marcação (cor + texto/ícone).
