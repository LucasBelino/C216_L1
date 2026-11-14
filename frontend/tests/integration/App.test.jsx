import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import { API_URL } from "../../src/services/items";
import { jsonResponse } from "../helpers";

const NOTEBOOK = { id: 1, name: "Notebook", description: "14 polegadas" };
const MOUSE = { id: 2, name: "Mouse", description: null };

function mockFetch(...responses) {
  const fetchMock = vi.fn();
  for (const response of responses) {
    fetchMock.mockResolvedValueOnce(response);
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function renderApp() {
  render(<App />);
  await waitForElementToBeRemoved(() =>
    screen.queryByText("Carregando itens..."),
  );
}

async function cadastrar(user, name, description = "") {
  await user.type(screen.getByLabelText("Nome"), name);
  if (description) {
    await user.type(screen.getByLabelText("Descrição"), description);
  }
  await user.click(screen.getByRole("button", { name: "Adicionar" }));
}

describe("App", () => {
  it("mostra carregando enquanto busca os itens", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    render(<App />);

    expect(screen.getByText("Carregando itens...")).toBeInTheDocument();
  });

  it("mostra a lista vazia quando a API não tem itens", async () => {
    const fetchMock = mockFetch(jsonResponse([]));
    render(<App />);

    expect(
      await screen.findByText("Nenhum item cadastrado."),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/items?limit=100`,
      undefined,
    );
  });

  it("exibe os itens vindos da API", async () => {
    mockFetch(jsonResponse([NOTEBOOK, MOUSE]));
    render(<App />);

    expect(await screen.findByText("Notebook")).toBeInTheDocument();
    expect(screen.getByText("14 polegadas")).toBeInTheDocument();
    expect(screen.getByText("Mouse")).toBeInTheDocument();
  });

  it("mostra erro quando não consegue conectar à API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fail")));
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível conectar à API.",
    );
    expect(screen.queryByText("Carregando itens...")).not.toBeInTheDocument();
  });

  it("cadastra um item enviando POST e o exibe na lista", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch(jsonResponse([]), jsonResponse(NOTEBOOK, 201));
    await renderApp();

    await cadastrar(user, "Notebook", "14 polegadas");

    expect(await screen.findByText("Notebook")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(`${API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Notebook", description: "14 polegadas" }),
    });
    expect(screen.getByLabelText("Nome")).toHaveValue("");
  });

  it("mostra o erro de nome duplicado e mantém o que foi digitado", async () => {
    const user = userEvent.setup();
    mockFetch(
      jsonResponse([NOTEBOOK]),
      jsonResponse({ detail: "Já existe um item com esse nome" }, 409),
    );
    await renderApp();

    await cadastrar(user, "Notebook");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Já existe um item com esse nome",
    );
    expect(screen.getByLabelText("Nome")).toHaveValue("Notebook");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("não chama a API quando o nome está vazio", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch(jsonResponse([]));
    await renderApp();

    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "O nome é obrigatório.",
    );
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("edita um item enviando PUT", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch(
      jsonResponse([NOTEBOOK]),
      jsonResponse({ ...NOTEBOOK, name: "Notebook Pro" }),
    );
    await renderApp();

    await user.click(screen.getByRole("button", { name: "Editar Notebook" }));
    expect(
      screen.getByRole("heading", { name: "Editar item" }),
    ).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Nome"));
    await user.type(screen.getByLabelText("Nome"), "Notebook Pro");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByText("Notebook Pro")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(`${API_URL}/items/1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Notebook Pro",
        description: "14 polegadas",
      }),
    });
    expect(
      screen.getByRole("heading", { name: "Novo item" }),
    ).toBeInTheDocument();
  });

  it("cancela a edição sem chamar a API", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch(jsonResponse([MOUSE]));
    await renderApp();

    await user.click(screen.getByRole("button", { name: "Editar Mouse" }));
    await user.clear(screen.getByLabelText("Nome"));
    await user.type(screen.getByLabelText("Nome"), "Teclado");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByText("Mouse")).toBeInTheDocument();
    expect(screen.queryByText("Teclado")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("remove um item enviando DELETE", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch(
      jsonResponse([NOTEBOOK, MOUSE]),
      jsonResponse(null, 204),
    );
    await renderApp();

    await user.click(screen.getByRole("button", { name: "Remover Notebook" }));

    expect(await screen.findAllByRole("listitem")).toHaveLength(1);
    expect(screen.queryByText("Notebook")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(`${API_URL}/items/1`, {
      method: "DELETE",
    });
  });

  it("mantém o item e mostra erro quando a remoção falha", async () => {
    const user = userEvent.setup();
    mockFetch(
      jsonResponse([NOTEBOOK]),
      jsonResponse({ detail: "Item 1 não encontrado" }, 404),
    );
    await renderApp();

    await user.click(screen.getByRole("button", { name: "Remover Notebook" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Item 1 não encontrado",
    );
    expect(screen.getByText("Notebook")).toBeInTheDocument();
  });

  it("volta ao cadastro ao remover o item em edição", async () => {
    const user = userEvent.setup();
    mockFetch(jsonResponse([NOTEBOOK]), jsonResponse(null, 204));
    await renderApp();

    await user.click(screen.getByRole("button", { name: "Editar Notebook" }));
    await user.click(screen.getByRole("button", { name: "Remover Notebook" }));

    expect(
      await screen.findByText("Nenhum item cadastrado."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Novo item" }),
    ).toBeInTheDocument();
  });
});
