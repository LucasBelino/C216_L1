import { useEffect, useState } from "react";
import { ItemForm } from "./components/ItemForm";
import { ItemList } from "./components/ItemList";
import {
  createItem,
  deleteItem,
  listItems,
  replaceItem,
} from "./services/items";

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [removeError, setRemoveError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const editingItem = items.find((item) => item.id === editingId);

  useEffect(() => {
    listItems()
      .then(setItems)
      .catch((error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  }, []);

  async function addItem(values) {
    const created = await createItem(values);
    setItems((current) => [...current, created]);
  }

  async function saveItem(values) {
    const updated = await replaceItem(editingId, values);
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setEditingId(null);
  }

  async function removeItem(itemToRemove) {
    setRemoveError("");
    try {
      await deleteItem(itemToRemove.id);
    } catch (error) {
      setRemoveError(error.message);
      return;
    }
    setItems((current) =>
      current.filter((item) => item.id !== itemToRemove.id),
    );
    if (itemToRemove.id === editingId) {
      setEditingId(null);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl space-y-6 p-4 sm:p-6">
      <h1 className="text-3xl font-bold">Gerenciador de Itens</h1>
      <section aria-labelledby="form-heading" className="space-y-3">
        <h2 id="form-heading" className="text-xl font-semibold">
          {editingItem ? "Editar item" : "Novo item"}
        </h2>
        {editingItem ? (
          <ItemForm
            key={editingItem.id}
            initialValues={{
              name: editingItem.name,
              description: editingItem.description ?? "",
            }}
            submitLabel="Salvar"
            onSubmit={saveItem}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <ItemForm key="novo" onSubmit={addItem} />
        )}
      </section>
      <section aria-labelledby="items-heading" className="space-y-3">
        <h2 id="items-heading" className="text-xl font-semibold">
          Itens cadastrados
        </h2>
        {removeError && (
          <p role="alert" className="text-sm text-red-700">
            {removeError}
          </p>
        )}
        {loading && <p className="text-slate-600">Carregando itens...</p>}
        {!loading && loadError && (
          <p role="alert" className="text-red-700">
            {loadError}
          </p>
        )}
        {!loading && !loadError && (
          <ItemList
            items={items}
            onEdit={(item) => setEditingId(item.id)}
            onRemove={removeItem}
          />
        )}
      </section>
    </main>
  );
}
