import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toast, EmptyState, Badge } from "../components/ui";

describe("Toast", () => {
  it("no renderiza sin mensaje", () => {
    const { container } = render(<Toast message="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza el mensaje", () => {
    render(<Toast message="Venta guardada ✓" />);
    expect(screen.getByText("Venta guardada ✓")).toBeInTheDocument();
  });

  it("usa color rojo para type=error", () => {
    const { container } = render(<Toast message="Error" type="error" />);
    expect(container.firstChild).toHaveStyle({ background: "#D93025" });
  });
});

describe("EmptyState", () => {
  it("muestra título y subtítulo", () => {
    render(<EmptyState icon="📭" title="Sin ventas" sub="Registra la primera venta" />);
    expect(screen.getByText("Sin ventas")).toBeInTheDocument();
    expect(screen.getByText("Registra la primera venta")).toBeInTheDocument();
  });
});

describe("Badge", () => {
  it("renderiza children", () => {
    render(<Badge color="teal">Admin</Badge>);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });
});
