import { useState } from "react";
import { ItemForm } from "./components/ItemForm";
import { ItemList } from "./components/ItemList";

export default function App() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const editingItem = items.find((item) => item.id === editingId);

  function addItem({ name, description }) {
    setItems((current) => [
      ...current,
      { id: crypto.randomUUID(), name, description },
    ]);
  }

  function updateItem({ name, description }) {
    setItems((current) =>
      current.map((item) =>
        item.id === editingId ? { ...item, name, description } : item,
      ),
    );
    setEditingId(null);
  }

  function removeItem(itemToRemove) {
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
            initialValues={editingItem}
            submitLabel="Salvar"
            onSubmit={updateItem}
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
        <ItemList
          items={items}
          onEdit={(item) => setEditingId(item.id)}
          onRemove={removeItem}
        />
      </section>
    </main>
  );
}
