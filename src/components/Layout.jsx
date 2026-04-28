import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../App";

const NAV = [
  { to: "/", label: "Panel", icon: "◻", end: true },
  { to: "/registrar", label: "Registrar venta", icon: "＋" },
  { to: "/globales", label: "Ventas globales", icon: "◉" },
  { to: "/privadas", label: "Mis privadas", icon: "◈" },
];

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function logout() {
    await signOut(auth);
    navigate("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: "#fff", borderRight: "1px solid var(--gray-100)", display: "flex", flexDirection: "column", padding: "1.5rem 1rem", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "2rem", paddingLeft: 8 }}>
          <div style={{ width: 32, height: 32, background: "var(--teal-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Vendix</span>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: isActive ? 500 : 400,
              color: isActive ? "var(--teal-dark)" : "var(--gray-700)",
              background: isActive ? "var(--teal-light)" : "transparent",
              transition: "background .15s",
              textDecoration: "none",
            })}>
              <span style={{ fontSize: 12 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "1rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: "50%" }} />
              : <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--teal-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--teal-dark)", fontWeight: 600 }}>{user?.displayName?.[0]}</div>
            }
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.displayName}</div>
              <div style={{ fontSize: 11, color: "var(--gray-500)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: "100%", padding: "7px", background: "transparent", border: "1px solid var(--gray-300)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--gray-500)" }}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "2rem", maxWidth: 900, overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
