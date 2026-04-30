import { Component } from "react";

// ---- StatCard ----
export function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>{label}</div>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, color: accent || "var(--text)" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ---- Badge ----
export function Badge({ children, color = "gray" }) {
  const map = {
    teal: { bg: "var(--teal-light)", color: "var(--teal-dark)" },
    amber: { bg: "var(--amber-light)", color: "var(--amber)" },
    gray: { bg: "var(--surface2)", color: "var(--text3)" },
  };
  const s = map[color] || map.gray;
  return (
    <span style={{ display: "inline-block", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500, background: s.bg, color: s.color }}>
      {children}
    </span>
  );
}

// ---- PageHeader ----
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 2, color: "var(--text)" }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: "var(--text3)" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---- Toggle ----
export function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <div onClick={() => onChange(!checked)} style={{ width: 38, height: 22, borderRadius: 11, background: checked ? "var(--teal)" : "var(--border2)", cursor: "pointer", position: "relative", transition: ".2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", width: 16, height: 16, top: 3, left: checked ? 19 : 3, background: "var(--surface)", borderRadius: "50%", transition: ".2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
      </div>
      <span style={{ fontSize: 13, color: "var(--text2)" }}>{label}</span>
    </label>
  );
}

// ---- SaleCard ----
export function SaleCard({ sale }) {
  const total = sale.price * sale.quantity;
  const initials = (sale.sellerName || "?").split(" ").slice(0, 2).map(s => s[0]).join("").toUpperCase();
  const COLORS = [["#E1F5EE","#0F6E56"],["#E6F1FB","#185FA5"],["#FAEEDA","#854F0B"],["#FAECE7","#993C1D"],["#EEEDFE","#3C3489"]];
  const ci = (sale.sellerName?.charCodeAt(0) || 0) % COLORS.length;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1rem", display: "flex", gap: 12 }}>
      {sale.photoURL
        ? <img src={sale.photoURL} alt={sale.product} style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
        : <div style={{ width: 64, height: 64, borderRadius: 8, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📦</div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>{sale.product}</span>
          <span style={{ fontWeight: 600, color: "var(--teal)", whiteSpace: "nowrap" }}>
            {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(total)}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 6 }}>
          {sale.quantity} u. × {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(sale.price)}
          {sale.location ? ` · ${sale.location}` : ""}
          {sale.category ? ` · ${sale.category}` : ""}
        </div>
        {sale.notes && <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 6, fontStyle: "italic" }}>"{sale.notes}"</div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS[ci][0], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: COLORS[ci][1] }}>
              {initials}
            </div>
            <span style={{ fontSize: 12, color: "var(--text2)" }}>{sale.sellerName}</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>
            {sale.createdAt?.toDate?.().toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Toast ----
const TOAST_COLORS = {
  success: "var(--teal)",
  error: "#D93025",
  info: "#185FA5",
  warning: "var(--amber)",
};

export function Toast({ message, type = "success" }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: TOAST_COLORS[type] || TOAST_COLORS.success,
      color: "#fff", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 500,
      boxShadow: "var(--shadow-md)", zIndex: 999, pointerEvents: "none",
    }}>
      {message}
    </div>
  );
}

// ---- EmptyState ----
export function EmptyState({ icon = "📭", title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 500, marginBottom: 4, color: "var(--text2)" }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: "var(--text3)" }}>{sub}</div>}
    </div>
  );
}

// ---- ErrorBoundary ----
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12, padding: 20, background: "var(--bg)" }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <h2 style={{ fontWeight: 600, color: "var(--text)" }}>Algo salió mal</h2>
          <p style={{ fontSize: 13, color: "var(--text3)", textAlign: "center", maxWidth: 300 }}>{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ padding: "9px 20px", background: "var(--teal)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", marginTop: 4 }}
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
