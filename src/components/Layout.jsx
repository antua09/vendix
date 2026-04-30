import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../App";
import { useTheme } from "../theme.jsx";
import { ADMIN_UID } from "../config";

const NAV = [
  { to: "/",          label: "Panel",    end: true, icon: HomeIcon              },
  { to: "/registrar", label: "Vender",              icon: PlusIcon              },
  { to: "/globales",  label: "Equipo",              icon: TeamIcon              },
  { to: "/chat",      label: "Chat",                icon: ChatIcon              },
  { to: "/perfil",    label: "Perfil",              icon: UserIcon              },
  { to: "/admin",     label: "Admin",               icon: ShieldIcon, adminOnly: true },
];

function HomeIcon({ active }) { const c = active ? "var(--teal)" : "var(--text3)"; return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function PlusIcon({ active }) { const c = active ? "var(--teal)" : "var(--text3)"; return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>; }
function TeamIcon({ active }) { const c = active ? "var(--teal)" : "var(--text3)"; return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function ChatIcon({ active }) { const c = active ? "var(--teal)" : "var(--text3)"; return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>; }
function UserIcon({ active }) { const c = active ? "var(--teal)" : "var(--text3)"; return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function ShieldIcon({ active }) { const c = active ? "var(--teal)" : "var(--text3)"; return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function MoonIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>; }
function SunIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>; }

function Logo({ size = 28 }) {
  return <svg width={size} height={size} viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#1D9E75"/><polygon points="22,22 42,22 50,58 58,22 78,22 50,78" fill="white"/></svg>;
}

function AvatarComp({ user, size = 28 }) {
  if (user?.photoURL) return <img src={user.photoURL} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  return <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--teal-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, color: "var(--teal-dark)", fontWeight: 600, flexShrink: 0 }}>{user?.displayName?.[0]?.toUpperCase()}</div>;
}

function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 20, padding: "5px 10px", display: "flex", alignItems: "center", gap: 6, color: "var(--text2)", fontSize: 12, cursor: "pointer" }}>
      {dark ? <SunIcon /> : <MoonIcon />}
      {dark ? "Claro" : "Oscuro"}
    </button>
  );
}

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user?.uid === ADMIN_UID;

  async function logout() { await signOut(auth); navigate("/login"); }

  const visibleNav = NAV.filter(n => !n.adminOnly || isAdmin);

  const sideNavStyle = ({ isActive }) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
    borderRadius: 8, textDecoration: "none", fontSize: 14,
    fontWeight: isActive ? 500 : 400,
    color: isActive ? "var(--teal-dark)" : "var(--text2)",
    background: isActive ? "var(--teal-light)" : "transparent",
    transition: "background .15s",
  });

  const bottomStyle = () => ({
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 3, flex: 1, padding: "6px 0", textDecoration: "none",
  });

  const SideContent = ({ onClose }) => (
    <>
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {visibleNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} style={sideNavStyle} onClick={onClose}>
            {({ isActive }) => (<><Icon active={isActive} /><span>{label}</span></>)}
          </NavLink>
        ))}
      </nav>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: 10 }}>
        <ThemeToggle />
        <div onClick={() => { navigate("/perfil"); onClose?.(); }} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <AvatarComp user={user} size={30} />
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.displayName}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} style={{ width: "100%", padding: "6px", background: "transparent", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 12, color: "var(--text3)", cursor: "pointer" }}>
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

      {/* Desktop sidebar */}
      <aside className="desktop-sidebar" style={{ width: 220, background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "1.25rem 1rem", flexShrink: 0, height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.5rem", paddingLeft: 4 }}>
          <Logo size={30} /><span style={{ fontWeight: 600, fontSize: 16, color: "var(--text)" }}>Vendix</span>
        </div>
        <SideContent />
      </aside>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 }} />}

      {/* Mobile drawer */}
      <aside className="mobile-drawer" style={{ position: "fixed", top: 0, left: sidebarOpen ? 0 : "-260px", width: 240, height: "100%", background: "var(--surface)", zIndex: 201, display: "flex", flexDirection: "column", padding: "1.25rem 1rem", transition: "left .25s ease", boxShadow: sidebarOpen ? "4px 0 20px rgba(0,0,0,0.2)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Logo size={28} /><span style={{ fontWeight: 600, fontSize: 16, color: "var(--text)" }}>Vendix</span></div>
          <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text3)" }}>✕</button>
        </div>
        <SideContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", minWidth: 0 }}>

        {/* Mobile header */}
        <header className="mobile-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ width: 20, height: 2, background: "var(--text2)", borderRadius: 1 }} />
            <div style={{ width: 20, height: 2, background: "var(--text2)", borderRadius: 1 }} />
            <div style={{ width: 20, height: 2, background: "var(--text2)", borderRadius: 1 }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Logo size={24} /><span style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>Vendix</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThemeToggle />
            <div onClick={() => navigate("/perfil")} style={{ cursor: "pointer" }}><AvatarComp user={user} size={30} /></div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "16px", paddingBottom: "80px", background: "var(--bg)" }}>
          <Outlet />
        </main>

        {/* Bottom nav */}
        <nav className="mobile-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 60, background: "var(--surface)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
          {visibleNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} style={bottomStyle}>
              {({ isActive }) => (
                <>
                  <Icon active={isActive} />
                  <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? "var(--teal)" : "var(--text3)" }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .mobile-drawer, .mobile-header, .mobile-bottom-nav { display: none !important; }
          .desktop-sidebar { display: flex !important; }
          main { padding-bottom: 16px !important; }
        }
        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header, .mobile-bottom-nav, .mobile-drawer { display: flex !important; }
        }
      `}</style>
    </div>
  );
}