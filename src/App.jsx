import { createContext, useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import RegisterSale from "./components/RegisterSale";
import { GlobalSales } from "./components/GlobalSales";
import { PrivateSales } from "./components/GlobalSales";
import Profile from "./components/Profile";
import Chat from "./components/Chat";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--text3)" }}>Cargando...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="registrar" element={<RegisterSale />} />
          <Route path="globales" element={<GlobalSales />} />
          <Route path="privadas" element={<PrivateSales />} />
          <Route path="chat" element={<Chat />} />
          <Route path="perfil" element={<Profile />} />
        </Route>
      </Routes>
    </AuthContext.Provider>
  );
}