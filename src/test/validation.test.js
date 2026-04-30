import { describe, it, expect } from "vitest";

// Extracted pure validation logic — mirrors RegisterSale.jsx validate()
function validate(form) {
  const errors = {};
  const product = (form.product || "").trim();
  if (!product) errors.product = "El nombre es obligatorio";
  else if (product.length < 2) errors.product = "Mínimo 2 caracteres";
  else if (product.length > 80) errors.product = "Máximo 80 caracteres";

  const price = Number(form.price);
  if (!form.price) errors.price = "El precio es obligatorio";
  else if (isNaN(price) || price <= 0) errors.price = "Debe ser mayor a $0";
  else if (price > 9_999_999) errors.price = "Precio demasiado alto";

  const qty = Number(form.quantity);
  if (!form.quantity) errors.quantity = "La cantidad es obligatoria";
  else if (!Number.isInteger(qty) || qty < 1) errors.quantity = "Debe ser entero mayor a 0";
  else if (qty > 9999) errors.quantity = "Máximo 9,999 unidades";

  return errors;
}

describe("validate()", () => {
  it("pasa con datos válidos", () => {
    const errors = validate({ product: "Camiseta", price: "150", quantity: 2 });
    expect(errors).toEqual({});
  });

  it("falla sin producto", () => {
    const errors = validate({ product: "", price: "100", quantity: 1 });
    expect(errors.product).toBeDefined();
  });

  it("falla con producto menor a 2 caracteres", () => {
    const errors = validate({ product: "X", price: "100", quantity: 1 });
    expect(errors.product).toMatch(/2 caracteres/);
  });

  it("falla con producto mayor a 80 caracteres", () => {
    const errors = validate({ product: "A".repeat(81), price: "100", quantity: 1 });
    expect(errors.product).toMatch(/80/);
  });

  it("falla sin precio", () => {
    const errors = validate({ product: "Zapato", price: "", quantity: 1 });
    expect(errors.price).toBeDefined();
  });

  it("falla con precio cero", () => {
    const errors = validate({ product: "Zapato", price: "0", quantity: 1 });
    expect(errors.price).toMatch(/mayor/);
  });

  it("falla con precio negativo", () => {
    const errors = validate({ product: "Zapato", price: "-10", quantity: 1 });
    expect(errors.price).toBeDefined();
  });

  it("falla sin cantidad", () => {
    const errors = validate({ product: "Zapato", price: "100", quantity: "" });
    expect(errors.quantity).toBeDefined();
  });

  it("falla con cantidad decimal", () => {
    const errors = validate({ product: "Zapato", price: "100", quantity: "1.5" });
    expect(errors.quantity).toBeDefined();
  });

  it("falla con cantidad mayor a 9999", () => {
    const errors = validate({ product: "Zapato", price: "100", quantity: 10000 });
    expect(errors.quantity).toMatch(/9,999/);
  });
});
