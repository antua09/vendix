import { createContext, useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import RegisterSale from "./components/RegisterSale";
import { GlobalSales, PrivateSales } from "./components/GlobalSales";
import Profile from "./components/Profile";
import Chat from "./components/Chat";
import Admin from "./components/Admin";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function ProtectedRoute({ children }) {
  const { user, loading, banned } = useAuth();
  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--text3)" }}>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (banned) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12, padding: 20, background: "var(--bg)" }}>
      <div style={{ fontSize: 48 }}>🚫</div>
      <h2 style={{ fontWeight: 600, color: "var(--text)" }}>Acceso bloqueado</h2>
      <p style={{ fontSize: 13, color: "var(--text3)", textAlign: "center" }}>Tu cuenta ha sido suspendida. Contacta al administrador.</p>
      <button onClick={() => auth.signOut()} style={{ padding: "9px 20px", background: "var(--teal)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", marginTop: 8 }}>Cerrar sesión</button>
    </div>
  );
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banned, setBanned] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let unsubBanned = null;
    let unsubRole = null;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);

      unsubBanned?.();
      unsubRole?.();

      if (u) {
        unsubBanned = onSnapshot(doc(db, "banned", u.uid), snap => {
          setBanned(snap.exists());
        });
        unsubRole = onSnapshot(doc(db, "users", u.uid), snap => {
          const data = snap.data();
          if (u.uid === "tbAqMUa7VmOQutt5gTM0nr1oKd52" && data?.role !== "admin") {
            setDoc(doc(db, "users", u.uid), { role: "admin" }, { merge: true });
          }
          setIsAdmin(data?.role === "admin");
        });
      } else {
        setBanned(false);
        setIsAdmin(false);
      }
    });

    return () => {
      unsubAuth();
      unsubBanned?.();
      unsubRole?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, banned, isAdmin }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="registrar" element={<RegisterSale />} />
          <Route path="globales" element={<GlobalSales />} />
          <Route path="privadas" element={<PrivateSales />} />
          <Route path="chat" element={<Chat />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </AuthContext.Provider>
  );
}
