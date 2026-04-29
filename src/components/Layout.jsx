import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../App";

const NAV = [
  { to: "/",          label: "Panel",    end: true, icon: HomeIcon  },
  { to: "/registrar", label: "Vender",              icon: PlusIcon  },
  { to: "/globales",  label: "Equipo",              icon: TeamIcon  },
  { to: "/privadas",  label: "Privadas",             icon: LockIcon  },
  { to: "/perfil",    label: "Perfil",               icon: UserIcon  },
];

function HomeIcon({ active }) {
  const c = active ? "#1D9E75" : "#888780";
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function PlusIcon({ active }) {
  const c = active ? "#1D9E75" : "#888780";
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
}
function TeamIcon({ active }) {
  const c = active ? "#1D9E75" : "#888780";
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
}
function LockIcon({ active }) {
  const c = active ? "#1D9E75" : "#888780";
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
}
function UserIcon({ active }) {
  const c = active ? "#1D9E75" : "#888780";
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="47" fill="#1D9E75"/>
      <polygon points="22,22 42,22 50,58 58,22 78,22 50,78" fill="white"/>
    </svg>
  );
}

function Avatar({ user, size = 28 }) {
  if (user?.photoURL) {
    return <img src={user.photoURL} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, color: "#0F6E56", fontWeight: 600, flexShrink: 0 }}>
      {user?.displayName?.[0]?.toUpperCase()}
    </div>
  );
}

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function logout() {
    await signOut(auth);
    navigate("/login");
  }

  const sideNavLinkStyle = ({ isActive }) => ({
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 14px", borderRadius: 8, textDecoration: "none",
    fontSize: 14, fontWeight: isActive ? 500 : 400,
    color: isActive ? "#0F6E56" : "#444441",
    background: isActive ? "#E1F5EE" : "transparent",
    transition: "background .15s",
  });

  const bottomNavLinkStyle = () => ({
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 3, flex: 1, padding: "6px 0",
    textDecoration: "none",
  });

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", position: "relative" }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="desktop-sidebar" style={{ width: 220, background: "#fff", borderRight: "1px solid #EFEFED", display: "flex", flexDirection: "column", padding: "1.25rem 1rem", flexShrink: 0, height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "2rem", paddingLeft: 4 }}>
          <Logo size={30} />
          <span style={{ fontWeight: 600, fontSize: 16 }}>Vendix</span>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} style={sideNavLinkStyle}>
              {({ isActive }) => (<><Icon active={isActive} /><span>{label}</span></>)}
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid #EFEFED", paddingTop: "1rem" }}>
          <div onClick={() => navigate("/perfil")} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer" }}>
            <Avatar user={user} size={30} />
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.displayName}</div>
              <div style={{ fontSize: 11, color: "#888780", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: "100%", padding: "6px", background: "transparent", border: "1px solid #C5C5C0", borderRadius: 8, fontSize: 12, color: "#888780", cursor: "pointer" }}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }} />}

      {/* ── MOBILE DRAWER ── */}
      <aside className="mobile-drawer" style={{ position: "fixed", top: 0, left: sidebarOpen ? 0 : "-260px", width: 240, height: "100%", background: "#fff", zIndex: 201, display: "flex", flexDirection: "column", padding: "1.25rem 1rem", transition: "left .25s ease", boxShadow: sidebarOpen ? "4px 0 20px rgba(0,0,0,0.15)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={28} />
            <span style={{ fontWeight: 600, fontSize: 16 }}>Vendix</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888780" }}>✕</button>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} style={sideNavLinkStyle} onClick={() => setSidebarOpen(false)}>
              {({ isActive }) => (<><Icon active={isActive} /><span>{label}</span></>)}
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid #EFEFED", paddingTop: "1rem" }}>
          <div onClick={() => { navigate("/perfil"); setSidebarOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer" }}>
            <Avatar user={user} size={30} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{user?.displayName}</div>
              <div style={{ fontSize: 11, color: "#888780" }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: "100%", padding: "6px", background: "transparent", border: "1px solid #C5C5C0", borderRadius: 8, fontSize: 12, color: "#888780", cursor: "pointer" }}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", minWidth: 0 }}>

        {/* Mobile header */}
        <header className="mobile-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#fff", borderBottom: "1px solid #EFEFED", flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ width: 20, height: 2, background: "#444441", borderRadius: 1 }} />
            <div style={{ width: 20, height: 2, background: "#444441", borderRadius: 1 }} />
            <div style={{ width: 20, height: 2, background: "#444441", borderRadius: 1 }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Logo size={24} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>Vendix</span>
          </div>
          <div onClick={() => navigate("/perfil")} style={{ cursor: "pointer" }}>
            <Avatar user={user} size={30} />
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "16px", paddingBottom: "80px" }}>
          <Outlet />
        </main>

        {/* Bottom nav */}
        <nav className="mobile-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 60, background: "#fff", borderTop: "1px solid #EFEFED", display: "flex", alignItems: "center", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} style={bottomNavLinkStyle}>
              {({ isActive }) => (
                <>
                  <Icon active={isActive} />
                  <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? "#1D9E75" : "#888780" }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .mobile-drawer { display: none !important; }
          .mobile-header { display: none !important; }
          .mobile-bottom-nav { display: none !important; }
          .desktop-sidebar { display: flex !important; }
          main { padding-bottom: 16px !important; }
        }
        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
          .mobile-bottom-nav { display: flex !important; }
          .mobile-drawer { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
