import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ItemList } from "../../src/components/ItemList";

const ITEMS = [
  { id: "1", name: "Notebook", description: "14 polegadas" },
  { id: "2", name: "Mouse", description: "" },
];

describe("ItemList", () => {
  it("mostra mensagem quando não há itens", () => {
    render(<ItemList items={[]} onEdit={vi.fn()} onRemove={vi.fn()} />);

    expect(screen.getByText("Nenhum item cadastrado.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("exibe nome e descrição de cada item", () => {
    render(<ItemList items={ITEMS} onEdit={vi.fn()} onRemove={vi.fn()} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Notebook")).toBeInTheDocument();
    expect(screen.getByText("14 polegadas")).toBeInTheDocument();
    expect(screen.getByText("Mouse")).toBeInTheDocument();
  });

  it("chama onEdit com o item escolhido", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<ItemList items={ITEMS} onEdit={onEdit} onRemove={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Editar Mouse" }));

    expect(onEdit).toHaveBeenCalledWith(ITEMS[1]);
  });

  it("chama onRemove com o item escolhido", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<ItemList items={ITEMS} onEdit={vi.fn()} onRemove={onRemove} />);

    await user.click(screen.getByRole("button", { name: "Remover Notebook" }));

    expect(onRemove).toHaveBeenCalledWith(ITEMS[0]);
  });
});
