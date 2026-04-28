// ---- StatCard ----
export function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--gray-100)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", flex: 1 }}>
      <div style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: accent || "var(--gray-900)" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ---- Badge ----
export function Badge({ children, color = "gray" }) {
  const map = {
    teal: { bg: "var(--teal-light)", color: "var(--teal-dark)" },
    amber: { bg: "var(--amber-light)", color: "var(--amber)" },
    gray: { bg: "var(--gray-100)", color: "var(--gray-500)" },
    coral: { bg: "#FAECE7", color: "#993C1D" },
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
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: "var(--gray-500)" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---- Toggle ----
export function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <div
        onClick={() => onChange(!checked)}
        style={{ width: 38, height: 22, borderRadius: 11, background: checked ? "var(--teal)" : "var(--gray-300)", cursor: "pointer", position: "relative", transition: ".2s", flexShrink: 0 }}
      >
        <div style={{ position: "absolute", width: 16, height: 16, top: 3, left: checked ? 19 : 3, background: "#fff", borderRadius: "50%", transition: ".2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
      </div>
      <span style={{ fontSize: 13, color: "var(--gray-700)" }}>{label}</span>
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
    <div style={{ background: "#fff", border: "1px solid var(--gray-100)", borderRadius: "var(--radius-md)", padding: "1rem", display: "flex", gap: 12, transition: "box-shadow .15s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-sm)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Foto del producto */}
      {sale.photoURL
        ? <img src={sale.photoURL} alt={sale.product} style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
        : <div style={{ width: 64, height: 64, borderRadius: 8, background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📦</div>
      }

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{sale.product}</span>
          <span style={{ fontWeight: 600, color: "var(--teal)", whiteSpace: "nowrap" }}>
            {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(total)}
          </span>
        </div>

        <div style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 6 }}>
          {sale.quantity} u. × {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(sale.price)}
          {sale.location ? ` · ${sale.location}` : ""}
          {sale.category ? ` · ${sale.category}` : ""}
        </div>

        {sale.notes && <div style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 6, fontStyle: "italic" }}>"{sale.notes}"</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS[ci][0], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: COLORS[ci][1] }}>
              {initials}
            </div>
            <span style={{ fontSize: 12, color: "var(--gray-700)" }}>{sale.sellerName}</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--gray-500)" }}>
            {sale.createdAt?.toDate
              ? sale.createdAt.toDate().toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
              : "—"
            }
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Toast ----
export function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "var(--teal)", color: "#fff", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 500, boxShadow: "var(--shadow-md)", zIndex: 999, pointerEvents: "none" }}>
      {message}
    </div>
  );
}

// ---- EmptyState ----
export function EmptyState({ icon = "📭", title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--gray-500)" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 500, marginBottom: 4, color: "var(--gray-700)" }}>{title}</div>
      {sub && <div style={{ fontSize: 13 }}>{sub}</div>}
    </div>
  );
}
