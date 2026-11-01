import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../src/App";

async function cadastrar(user, name, description = "") {
  await user.type(screen.getByLabelText("Nome"), name);
  if (description) {
    await user.type(screen.getByLabelText("Descrição"), description);
  }
  await user.click(screen.getByRole("button", { name: "Adicionar" }));
}

describe("App", () => {
  it("começa sem itens cadastrados", () => {
    render(<App />);

    expect(screen.getByText("Nenhum item cadastrado.")).toBeInTheDocument();
  });

  it("cadastra um item e o exibe na lista", async () => {
    const user = userEvent.setup();
    render(<App />);

    await cadastrar(user, "Notebook", "14 polegadas");

    expect(screen.getByText("Notebook")).toBeInTheDocument();
    expect(screen.getByText("14 polegadas")).toBeInTheDocument();
    expect(
      screen.queryByText("Nenhum item cadastrado."),
    ).not.toBeInTheDocument();
  });

  it("não cadastra item com nome vazio", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "O nome é obrigatório.",
    );
    expect(screen.getByText("Nenhum item cadastrado.")).toBeInTheDocument();
  });

  it("edita um item cadastrado", async () => {
    const user = userEvent.setup();
    render(<App />);
    await cadastrar(user, "Notebook", "14 polegadas");

    await user.click(screen.getByRole("button", { name: "Editar Notebook" }));
    expect(
      screen.getByRole("heading", { name: "Editar item" }),
    ).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Nome"));
    await user.type(screen.getByLabelText("Nome"), "Notebook Pro");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(screen.getByText("Notebook Pro")).toBeInTheDocument();
    expect(screen.getByText("14 polegadas")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Novo item" }),
    ).toBeInTheDocument();
  });

  it("cancela a edição sem alterar o item", async () => {
    const user = userEvent.setup();
    render(<App />);
    await cadastrar(user, "Mouse");

    await user.click(screen.getByRole("button", { name: "Editar Mouse" }));
    await user.clear(screen.getByLabelText("Nome"));
    await user.type(screen.getByLabelText("Nome"), "Teclado");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByText("Mouse")).toBeInTheDocument();
    expect(screen.queryByText("Teclado")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveValue("");
  });

  it("remove um item da lista", async () => {
    const user = userEvent.setup();
    render(<App />);
    await cadastrar(user, "Notebook");
    await cadastrar(user, "Mouse");

    await user.click(screen.getByRole("button", { name: "Remover Notebook" }));

    expect(screen.queryByText("Notebook")).not.toBeInTheDocument();
    expect(screen.getByText("Mouse")).toBeInTheDocument();
  });

  it("volta ao cadastro ao remover o item em edição", async () => {
    const user = userEvent.setup();
    render(<App />);
    await cadastrar(user, "Notebook");

    await user.click(screen.getByRole("button", { name: "Editar Notebook" }));
    await user.click(screen.getByRole("button", { name: "Remover Notebook" }));

    expect(
      screen.getByRole("heading", { name: "Novo item" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nenhum item cadastrado.")).toBeInTheDocument();
  });
});
