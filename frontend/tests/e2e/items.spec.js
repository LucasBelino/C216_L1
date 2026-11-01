import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("carrega a interface sem itens", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Gerenciador de Itens" }),
  ).toBeVisible();
  await expect(page.getByText("Nenhum item cadastrado.")).toBeVisible();
});

test("cadastra um item e o exibe na listagem", async ({ page }) => {
  await page.getByLabel("Nome").fill("Notebook");
  await page.getByLabel("Descrição").fill("14 polegadas");
  await page.getByRole("button", { name: "Adicionar" }).click();

  await expect(page.getByRole("listitem")).toContainText("Notebook");
  await expect(page.getByRole("listitem")).toContainText("14 polegadas");
  await expect(page.getByText("Nenhum item cadastrado.")).toBeHidden();
});

test("exibe erro ao cadastrar item sem nome", async ({ page }) => {
  await page.getByRole("button", { name: "Adicionar" }).click();

  await expect(page.getByRole("alert")).toHaveText("O nome é obrigatório.");
  await expect(page.getByText("Nenhum item cadastrado.")).toBeVisible();
});

test("edita um item cadastrado", async ({ page }) => {
  await page.getByLabel("Nome").fill("Notebook");
  await page.getByRole("button", { name: "Adicionar" }).click();

  await page.getByRole("button", { name: "Editar Notebook" }).click();
  await page.getByLabel("Nome").fill("Notebook Pro");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("listitem")).toContainText("Notebook Pro");
});

test("remove um item cadastrado", async ({ page }) => {
  await page.getByLabel("Nome").fill("Notebook");
  await page.getByRole("button", { name: "Adicionar" }).click();

  await page.getByRole("button", { name: "Remover Notebook" }).click();

  await expect(page.getByRole("listitem")).toHaveCount(0);
  await expect(page.getByText("Nenhum item cadastrado.")).toBeVisible();
});
