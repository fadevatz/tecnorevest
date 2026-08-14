import { test, expect } from "@playwright/test";

test.describe("Agenda TecnoRevest - End-to-End Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Configura usuário pré-logado para bypass de login em testes de fluxo
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "tecnorevest_user",
        JSON.stringify({ name: "Administrador", role: "Gestor de Obras", username: "admin" })
      );
    });
    await page.goto("/");
  });

  test("deve carregar a aplicação e exibir a visualização 'Por Equipes' por padrão na Agenda", async ({ page }) => {
    // Navegar para a aba Agenda
    await page.click("text=Agenda");

    // Verificar se o título do cronograma está presente
    await expect(page.locator("h1:has-text('Cronograma de Obras')")).toBeVisible();

    // Verificar se o botão 'Por Equipes' está ativo por padrão
    const btnEquipes = page.locator("button:has-text('Por Equipes')");
    await expect(btnEquipes).toBeVisible();
    await expect(btnEquipes).toHaveClass(/active/);
  });

  test("deve abrir o modal responsivo de 2 colunas ao clicar em '+ Novo Projeto'", async ({ page }) => {
    await page.click("text=Agenda");
    await page.click("button:has-text('+ Novo Projeto')");

    // Verificar se o modal abriu com layout de 2 colunas
    const modalOverlay = page.locator(".modal-overlay");
    await expect(modalOverlay).toBeVisible();

    // Coluna 1: Dados da Obra
    await expect(page.locator("h4:has-text('Dados da Obra & Cliente')")).toBeVisible();
    // Coluna 2: Etapas
    await expect(page.locator("h4:has-text('Etapas & Pausas do Serviço')")).toBeVisible();

    // Rodapé Fixo
    await expect(page.locator("button:has-text('Salvar Alterações')")).toBeVisible();
  });

  test("deve permitir adicionar nova etapa no modal sem gerar scrollbar horizontal", async ({ page }) => {
    await page.click("text=Agenda");
    await page.click("button:has-text('+ Novo Projeto')");

    // Clicar no botão "+ Adicionar Etapa"
    await page.click("button:has-text('+ Adicionar Etapa')");

    // Verificar se o formulário agora contém 2 etapas
    const stageItems = page.locator(".stage-card-item");
    await expect(stageItems).toHaveCount(2);

    // Fechar o modal
    await page.click("button:has-text('Cancelar')");
    await expect(page.locator(".modal-overlay")).not.toBeVisible();
  });
});
