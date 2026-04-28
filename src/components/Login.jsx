import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../App";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { user } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError(""); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "register") {
        if (!form.name.trim()) { setError("Escribe tu nombre"); setLoading(false); return; }
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(cred.user, { displayName: form.name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      }
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": "Este correo ya está registrado",
        "auth/invalid-email": "Correo inválido",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
        "auth/user-not-found": "No existe una cuenta con ese correo",
        "auth/wrong-password": "Contraseña incorrecta",
        "auth/invalid-credential": "Correo o contraseña incorrectos",
      };
      setError(msgs[err.code] || "Ocurrió un error, intenta de nuevo");
    }
    setLoading(false);
  }

  const LABEL = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--gray-700)", marginBottom: 6 };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gray-50)" }}>
      <div style={{ background: "#fff", border: "1px solid var(--gray-100)", borderRadius: "var(--radius-lg)", padding: "2.5rem 2rem", width: "100%", maxWidth: 380, boxShadow: "var(--shadow-md)" }}>

        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ width: 52, height: 52, background: "var(--teal-light)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: 24 }}>📦</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Vendix</h1>
          <p style={{ fontSize: 13, color: "var(--gray-500)" }}>Registro compartido de ventas</p>
        </div>

        <div style={{ display: "flex", background: "var(--gray-100)", borderRadius: "var(--radius-sm)", padding: 3, marginBottom: "1.5rem" }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "7px", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 500, background: mode === m ? "#fff" : "transparent", color: mode === m ? "var(--gray-900)" : "var(--gray-500)", boxShadow: mode === m ? "var(--shadow-sm)" : "none", transition: ".15s", cursor: "pointer" }}>
              {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div style={{ marginBottom: 14 }}>
              <label style={LABEL}>Nombre</label>
              <input type="text" placeholder="Tu nombre completo" value={form.name} onChange={e => set("name", e.target.value)} required autoFocus />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Correo electrónico</label>
            <input type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={e => set("email", e.target.value)} required />
          </div>

          <div style={{ marginBottom: error ? 12 : 20 }}>
            <label style={LABEL}>Contraseña</label>
            <input type="password" placeholder={mode === "register" ? "Mínimo 6 caracteres" : "Tu contraseña"} value={form.password} onChange={e => set("password", e.target.value)} required />
          </div>

          {error && (
            <div style={{ background: "#FCEBEB", color: "#A32D2D", fontSize: 13, padding: "9px 12px", borderRadius: "var(--radius-sm)", marginBottom: 14, border: "1px solid #F7C1C1" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px", background: loading ? "var(--gray-300)" : "var(--teal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "background .15s" }}>
            {loading ? "Cargando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
