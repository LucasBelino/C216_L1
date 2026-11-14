import { describe, expect, it, vi } from "vitest";
import {
  API_URL,
  createItem,
  deleteItem,
  getItem,
  listItems,
  replaceItem,
  updateItem,
} from "../../src/services/items";
import { jsonResponse } from "../helpers";

function mockFetch(response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("services/items", () => {
  it("lista os itens com GET", async () => {
    const items = [{ id: 1, name: "Notebook", description: null }];
    const fetchMock = mockFetch(jsonResponse(items));

    await expect(listItems()).resolves.toEqual(items);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/items?limit=100`,
      undefined,
    );
  });

  it("busca um item pelo id", async () => {
    const item = { id: 1, name: "Notebook", description: null };
    const fetchMock = mockFetch(jsonResponse(item));

    await expect(getItem(1)).resolves.toEqual(item);
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/items/1`, undefined);
  });

  it("cadastra um item com POST e descrição vazia como null", async () => {
    const created = { id: 1, name: "Notebook", description: null };
    const fetchMock = mockFetch(jsonResponse(created, 201));

    await expect(
      createItem({ name: "Notebook", description: "" }),
    ).resolves.toEqual(created);
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Notebook", description: null }),
    });
  });

  it("substitui um item com PUT", async () => {
    const updated = { id: 1, name: "Mouse", description: "Sem fio" };
    const fetchMock = mockFetch(jsonResponse(updated));

    await expect(
      replaceItem(1, { name: "Mouse", description: "Sem fio" }),
    ).resolves.toEqual(updated);
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/items/1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Mouse", description: "Sem fio" }),
    });
  });

  it("atualiza parte de um item com PATCH", async () => {
    const updated = { id: 1, name: "Mouse", description: "Sem fio" };
    const fetchMock = mockFetch(jsonResponse(updated));

    await expect(updateItem(1, { name: "Mouse" })).resolves.toEqual(updated);
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/items/1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Mouse" }),
    });
  });

  it("remove um item com DELETE", async () => {
    const fetchMock = mockFetch(jsonResponse(null, 204));

    await expect(deleteItem(1)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/items/1`, {
      method: "DELETE",
    });
  });

  it("avisa quando não consegue conectar à API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fail")));

    await expect(listItems()).rejects.toThrow(
      "Não foi possível conectar à API.",
    );
  });

  it("usa a mensagem de detail quando a API responde com erro", async () => {
    mockFetch(jsonResponse({ detail: "Já existe um item com esse nome" }, 409));

    await expect(createItem({ name: "Notebook" })).rejects.toThrow(
      "Já existe um item com esse nome",
    );
  });

  it("usa a mensagem padrão quando o erro não traz texto", async () => {
    mockFetch(jsonResponse({ detail: [{ msg: "invalid" }] }, 422));

    await expect(createItem({ name: "Notebook" })).rejects.toThrow(
      "Erro ao cadastrar o item.",
    );
  });
});
