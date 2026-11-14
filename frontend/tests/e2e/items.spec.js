import { expect, test } from "@playwright/test";

function uniqueName(prefix) {
  return `${prefix} ${Date.now()}`;
}

async function cadastrar(page, name, description = "") {
  await page.getByLabel("Nome").fill(name);
  await page.getByLabel("Descrição").fill(description);
  await page.getByRole("button", { name: "Adicionar" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("carrega a interface com os itens da API", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Gerenciador de Itens" }),
  ).toBeVisible();
  await expect(page.getByText("Carregando itens...")).toBeHidden();
  await expect(page.getByRole("alert")).toBeHidden();
});

test("cadastra um item e ele persiste após recarregar a página", async ({
  page,
}) => {
  const name = uniqueName("Notebook");
  await cadastrar(page, name, "14 polegadas");

  const item = page.getByRole("listitem").filter({ hasText: name });
  await expect(item).toBeVisible();
  await expect(item).toContainText("14 polegadas");

  await page.reload();
  await expect(item).toBeVisible();
});

test("exibe erro ao cadastrar item sem nome", async ({ page }) => {
  await page.getByRole("button", { name: "Adicionar" }).click();

  await expect(page.getByRole("alert")).toHaveText("O nome é obrigatório.");
});

test("exibe erro ao cadastrar um nome que já existe", async ({ page }) => {
  const name = uniqueName("Monitor");
  await cadastrar(page, name);
  await expect(
    page.getByRole("listitem").filter({ hasText: name }),
  ).toBeVisible();

  await cadastrar(page, name);

  await expect(page.getByRole("alert")).toHaveText(
    "Já existe um item com esse nome",
  );
  await expect(page.getByLabel("Nome")).toHaveValue(name);
  await expect(
    page.getByRole("listitem").filter({ hasText: name }),
  ).toHaveCount(1);
});

test("edita um item e a alteração persiste", async ({ page }) => {
  const name = uniqueName("Teclado");
  const newName = uniqueName("Mouse");
  await cadastrar(page, name);

  await page.getByRole("button", { name: `Editar ${name}` }).click();
  await page.getByLabel("Nome").fill(newName);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(
    page.getByRole("listitem").filter({ hasText: newName }),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("listitem").filter({ hasText: newName }),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem").filter({ hasText: name }),
  ).toHaveCount(0);
});

test("remove um item e ele não volta após recarregar", async ({ page }) => {
  const name = uniqueName("Cadeira");
  await cadastrar(page, name);
  const item = page.getByRole("listitem").filter({ hasText: name });
  await expect(item).toBeVisible();

  await page.getByRole("button", { name: `Remover ${name}` }).click();
  await expect(item).toHaveCount(0);

  await page.reload();
  await expect(page.getByText("Carregando itens...")).toBeHidden();
  await expect(item).toHaveCount(0);
});
