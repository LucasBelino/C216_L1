import { describe, expect, it } from "vitest";
import { NAME_MAX_LENGTH, validateItem } from "../../src/validation";

describe("validateItem", () => {
  it("rejeita nome vazio ou só com espaços", () => {
    const { errors } = validateItem({ name: "   ", description: "" });
    expect(errors.name).toBe("O nome é obrigatório.");
  });

  it("rejeita nome acima do limite de caracteres", () => {
    const name = "a".repeat(NAME_MAX_LENGTH + 1);
    const { errors } = validateItem({ name, description: "" });
    expect(errors.name).toBe(
      `O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres.`,
    );
  });

  it("aceita nome com exatamente o limite de caracteres", () => {
    const name = "a".repeat(NAME_MAX_LENGTH);
    const { errors } = validateItem({ name, description: "" });
    expect(errors).toEqual({});
  });

  it("aceita item sem descrição", () => {
    const { errors, values } = validateItem({
      name: "Notebook",
      description: "",
    });
    expect(errors).toEqual({});
    expect(values.description).toBe("");
  });

  it("remove espaços das extremidades dos valores", () => {
    const { values } = validateItem({
      name: "  Notebook  ",
      description: "  14 polegadas  ",
    });
    expect(values).toEqual({ name: "Notebook", description: "14 polegadas" });
  });
});
