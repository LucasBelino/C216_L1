export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const ITEMS_URL = `${API_URL}/items`;
const LIST_LIMIT = 100;

async function request(url, options, defaultMessage) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error("Não foi possível conectar à API.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail;
    throw new Error(typeof detail === "string" ? detail : defaultMessage);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

function sendJson(method, data) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

export function listItems() {
  return request(
    `${ITEMS_URL}?limit=${LIST_LIMIT}`,
    undefined,
    "Erro ao carregar os itens.",
  );
}

export function getItem(id) {
  return request(`${ITEMS_URL}/${id}`, undefined, "Erro ao buscar o item.");
}

export function createItem({ name, description }) {
  return request(
    ITEMS_URL,
    sendJson("POST", { name, description: description || null }),
    "Erro ao cadastrar o item.",
  );
}

export function replaceItem(id, { name, description }) {
  return request(
    `${ITEMS_URL}/${id}`,
    sendJson("PUT", { name, description: description || null }),
    "Erro ao atualizar o item.",
  );
}

export function updateItem(id, changes) {
  return request(
    `${ITEMS_URL}/${id}`,
    sendJson("PATCH", changes),
    "Erro ao atualizar o item.",
  );
}

export function deleteItem(id) {
  return request(
    `${ITEMS_URL}/${id}`,
    { method: "DELETE" },
    "Erro ao remover o item.",
  );
}
