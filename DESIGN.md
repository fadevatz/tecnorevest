---
name: Agenda TecnoRevest
description: Sistema de agendamento e gestão de obras de revestimento industrial
colors:
  primary: "#2258A3"
  secondary: "#F38221"
  primary-light: "#eff6ff"
  secondary-light: "#fff7ed"
  success: "#38a169"
  warning: "#d69e2e"
  danger: "#e53e3e"
  info: "#3182ce"
  neutral-bg: "#f7fafc"
  neutral-surface: "#ffffff"
  neutral-border: "#e2e8f0"
  text-primary: "#1a202c"
  text-secondary: "#4a5568"
  text-muted: "#718096"
typography:
  display:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 600
    lineHeight: "1.2"
  headline:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.3"
  title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: "1.4"
  body:
    fontFamily: "Roboto, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: "1.5"
  label:
    fontFamily: "Roboto, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    lineHeight: "1.2"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "#194683"
  button-secondary:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-accent:
    backgroundColor: "{colors.secondary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "20px"
---

# Design System: Agenda TecnoRevest

## Overview

**Creative North Star: "A Linha do Tempo Dinâmica"**

O sistema de design da Agenda TecnoRevest foi concebido para entregar uma experiência fluida, moderna e de altíssima clareza visual para a gestão operacional de obras e cronogramas de revestimento industrial. Ele harmoniza a solidez e confiabilidade necessárias no setor de engenharia com a agilidade de um painel de agendamento em tempo real.

A interface prioriza a legibilidade instantânea de status, a diferenciação imediata de equipes técnicas por cor e a navegação sem atritos em dados de alta densidade. O visual utiliza superfícies limpas e iluminadas em modo claro corporativo, com suporte total a modo escuro técnico para ambientes de baixa luminosidade.

**Key Characteristics:**
- **Estrutura Corporativa Confiável**: Header em Azul TecnoRevest (#2258A3) ancorando a navegação e garantindo reconhecimento de marca.
- **Acentos Energéticos**: Laranja TecnoRevest (#F38221) para botões de ação proeminentes, notificações e destaques.
- **Alta Densidade de Informação**: Layout compacto com grids ordenados, contadores em cards pastel e timelines de alta visibilidade.
- **Transições Suaves**: Animações baseadas em curvas de física natural (`cubic-bezier(0.16, 1, 0.3, 1)`) para feedback tátil e responsivo.

## Colors

A paleta de cores balanceia a sobriedade do azul corporativo com a vivacidade do laranja industrial e suporte a indicadores de status unificados.

### Primary
- **Azul TecnoRevest** (#2258A3): Usado no cabeçalho superior (`.top-header`), itens ativos da sidebar, links primários e botões principais de confirmação.

### Secondary
- **Laranja Vibrante TecnoRevest** (#F38221): Usado para botões de ação de destaque (`.btn-accent`), badges de atenção e estados ativos de cronograma.

### Neutral
- **Fundo Principal (Light)** (#f7fafc): Superfície de fundo da aplicação, oferecendo alto contraste sem cansaço visual.
- **Superfície de Card** (#ffffff): Fundo para containers de dados, modais e painéis de tabela.
- **Borda de Contorno** (#e2e8f0): Divisórias discretas e contornos de cards.
- **Texto Principal** (#1a202c): Tom escuro de alta legibilidade para títulos e dados primários.
- **Texto Secundário** (#4a5568): Utilizado em rótulos, subtítulos e textos descritivos.
- **Texto Atenuado** (#718096): Para metadados, placeholders e datas secundárias.

### Named Rules
**The Team Color Identity Rule.** Cada equipe técnica possui uma cor distintiva fixa (ex: Equipe Azul `#2258A3`, Equipe Laranja `#F38221`, Equipe Verde `#38a169`) que se manifesta em badges, barras de cronograma e cartões de projeto.
**The Accent Hierarchy Rule.** O Laranja (#F38221) é reservado estritamente para ações ativas e destaques operacionais; nunca deve ser utilizado como fundo de grandes contêineres.

## Typography

A tipografia combina a modernidade geométrica de Poppins para títulos com a legibilidade universal da Roboto para textos e tabelas operacionais.

**Display Font:** Poppins (com fallback sans-serif)
**Body Font:** Roboto (com fallback sans-serif)

**Character:** Estruturada, direta e legível, permitindo escaneamento ágil em tabelas densas e cronogramas.

### Hierarchy
- **Display** (600, 1.6rem / 25.6px, line-height 1.2): Utilizado nos títulos de páginas principais (h1) e cabeçalhos de seções de topo.
- **Headline** (600, 1.25rem / 20px, line-height 1.3): Títulos de modais, subtítulos de painéis (h2) e nome de projetos.
- **Title** (600, 1.05rem / 16.8px, line-height 1.4): Títulos de cards de suporte, cabeçalhos de grupos de menu e grupos de data.
- **Body** (400, 0.9rem / 14.4px, line-height 1.5): Corpo de texto em tabelas, células de cronograma, formulários e listas.
- **Label** (600, 0.8rem / 12.8px, line-height 1.2): Rótulos de campos de entrada, etiquetas de formulário e contadores.

### Named Rules
**The Header Contrast Rule.** Todos os títulos sobre fundos escuros ou barras azuis devem utilizar font-weight 600/700 na família Poppins com cor branca (#ffffff) pura para garantir leitura imediata.

## Layout

O layout baseia-se em uma estrutura de duas colunas com Header Superior Fixo de 56px de altura e Sidebar Lateral de 240px.

- **Grid de Métricas**: 5 colunas responsivas (`repeat(5, 1fr)`) com suporte a wrap em telas menores que 1100px.
- **Espaçamento Rhythm**: Escala modular de 4px (`xs`), 8px (`sm`), 16px (`md`), 24px (`lg`) e 32px (`xl`).
- **Containers**: Cards expansíveis em formato flexbox/grid com rolagem interna em modais grandes (`.modal-large`).

## Elevation & Depth

O sistema utiliza a filosofia **Clean & Flat-by-default**. As superfícies permanecem planas e delimitadas por bordas sutis (#e2e8f0) no estado de repouso, elevando-se suavemente mediante interação (hover/foco).

### Shadow Vocabulary
- **Sombra Baixa (`--shadow-sm`)** (`0 1px 3px 0 rgba(0, 0, 0, 0.05)`): Aplicada em cards em repouso, sidebar e métricas.
- **Sombra Média (`--shadow-md`)** (`0 4px 6px -1px rgba(0, 0, 0, 0.05)`): Aplicada ao passar o mouse sobre cards (`.glass-card:hover`).
- **Sombra Alta (`--shadow-lg`)** (`0 10px 15px -3px rgba(0, 0, 0, 0.05)`): Reservada para a camada de modais sobrepostos (`.modal-content`).

### Named Rules
**The Flat-By-Default Rule.** Superfícies não utilizam sombras pesadas em repouso; a separação espacial é alcançada primariamente via bordas sutis e contraste de cor de fundo.

## Shapes

O idioma de formas é limpo, com cantos levemente arredondados para transmitir modernidade sem perder a sobriedade corporativa.

- **Arredondamento Pequeno (`--radius-sm`)** (6px): Botões, campos de entrada, selects e badges.
- **Arredondamento Médio (`--radius-md`)** (8px): Cards principais, contêineres de métricas e caixas de modais.
- **Arredondamento Grande (`--radius-lg`)** (12px): Sub-cards internos de formulários e grupos de colunas de modal.

## Components

### Buttons
- **Shape:** Arredondado 6px (`--radius-sm`).
- **Primary:** Fundo Azul (#2258A3), texto branco, padding 8px 16px, font-weight 500. Hover: `#194683`.
- **Secondary:** Fundo Branco (#ffffff), texto cinza (#4a5568), borda 1px (#e2e8f0). Hover: Fundo `#f7fafc`.
- **Accent:** Fundo Laranja (#F38221), texto branco. Hover: Fundo `#d96f16`.

### Cards / Containers
- **Corner Style:** 8px (`--radius-md`).
- **Background:** Branco (#ffffff) em modo claro; Slate 800 (#1e293b) em modo escuro.
- **Border:** 1px solid `#e2e8f0`.
- **Padding:** 20px no container padrão.

### Inputs / Fields
- **Style:** Fundo branco, borda 1px solid `#cbd5e1`, raio 6px (`--radius-sm`), padding 8px 12px.
- **Focus:** Borda shift para Azul TecnoRevest (#2258A3) com anel de foco `0 0 0 3px rgba(34, 88, 163, 0.12)`.

### Metrics Grid Cards
- **Style:** Fundo em tons pastel dinâmicos conforme status (ex: Total `#EBF8FF`, Pendente `#FFFAF0`, Concluído `#E6FFFA`).
- **Icon Circle:** Círculo com 38px de diâmetro, ícone centralizado em branco e fundo na cor sólida do status.

## Do's and Don'ts

### Do:
- **Do** manter a sidebar e a topbar fixas durante a rolagem de tabelas e cronogramas longos.
- **Do** utilizar os tokens de cores de equipe em barras de progresso e cartões de obras.
- **Do** aplicar transições de hover suaves (`0.2s ease-in-out`) em botões e linhas de tabela interativas.

### Don't:
- **Don't** utilizar cores de alerta ou status fora dos padrões semânticos estabelecidos.
- **Don't** remover os contornos de borda sutis (`#e2e8f0`) dos cards em modo claro.
- **Don't** misturar fontes no corpo das tabelas; utilizar estritamente a família Roboto.
