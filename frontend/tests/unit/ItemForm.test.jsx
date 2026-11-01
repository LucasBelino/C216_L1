import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ItemForm } from "../../src/components/ItemForm";

describe("ItemForm", () => {
  it("mostra erro e não chama onSubmit com nome vazio", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ItemForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "O nome é obrigatório.",
    );
    expect(screen.getByLabelText("Nome")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envia os valores validados e limpa os campos", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ItemForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Nome"), "  Notebook ");
    await user.type(screen.getByLabelText("Descrição"), "14 polegadas");
    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Notebook",
      description: "14 polegadas",
    });
    expect(screen.getByLabelText("Nome")).toHaveValue("");
    expect(screen.getByLabelText("Descrição")).toHaveValue("");
  });

  it("preenche os campos com os valores iniciais na edição", () => {
    render(
      <ItemForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        initialValues={{ name: "Mouse", description: "Sem fio" }}
        submitLabel="Salvar"
      />,
    );

    expect(screen.getByLabelText("Nome")).toHaveValue("Mouse");
    expect(screen.getByLabelText("Descrição")).toHaveValue("Sem fio");
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("chama onCancel ao clicar em Cancelar", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ItemForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("não exibe Cancelar quando não há onCancel", () => {
    render(<ItemForm onSubmit={vi.fn()} />);

    expect(
      screen.queryByRole("button", { name: "Cancelar" }),
    ).not.toBeInTheDocument();
  });
});
