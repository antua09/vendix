import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../App";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { user } = useAuth();
  const [mode, setMode] = useState("login"); // login | register | reset
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError(""); setSuccess(""); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(""); setSuccess("");
    try {
      if (mode === "register") {
        if (!form.name.trim()) { setError("Escribe tu nombre"); setLoading(false); return; }
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(cred.user, { displayName: form.name.trim() });
      } else if (mode === "reset") {
        await sendPasswordResetEmail(auth, form.email);
        setSuccess("Te enviamos un correo para restablecer tu contraseña.");
        setLoading(false); return;
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      }
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": "Este correo ya está registrado",
        "auth/invalid-email": "Correo inválido",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
        "auth/invalid-credential": "Correo o contraseña incorrectos",
        "auth/user-not-found": "No existe una cuenta con ese correo",
      };
      setError(msgs[err.code] || "Ocurrió un error, intenta de nuevo");
    }
    setLoading(false);
  }

  const LABEL = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--text2)", marginBottom: 6 };
  const isReset = mode === "reset";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "2.5rem 2rem", width: "100%", maxWidth: 380, boxShadow: "var(--shadow-md)" }}>

        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ width: 52, height: 52, background: "var(--teal-light)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <svg width="28" height="28" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#1D9E75"/><polygon points="22,22 42,22 50,58 58,22 78,22 50,78" fill="white"/></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4, color: "var(--text)" }}>Vendix</h1>
          <p style={{ fontSize: 13, color: "var(--text3)" }}>{isReset ? "Recuperar contraseña" : "Registro compartido de ventas"}</p>
        </div>

        {!isReset && (
          <div style={{ display: "flex", background: "var(--surface2)", borderRadius: "var(--radius-sm)", padding: 3, marginBottom: "1.5rem" }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{ flex: 1, padding: "7px", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 500, background: mode === m ? "var(--surface)" : "transparent", color: mode === m ? "var(--text)" : "var(--text3)", boxShadow: mode === m ? "var(--shadow-sm)" : "none", transition: ".15s", cursor: "pointer" }}>
                {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div style={{ marginBottom: 14 }}>
              <label style={LABEL}>Nombre</label>
              <input type="text" placeholder="Tu nombre completo" value={form.name} onChange={e => set("name", e.target.value)} required autoFocus />
            </div>
          )}

          <div style={{ marginBottom: isReset ? 0 : 14 }}>
            <label style={LABEL}>Correo electrónico</label>
            <input type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={e => set("email", e.target.value)} required />
          </div>

          {!isReset && (
            <div style={{ marginBottom: 4 }}>
              <label style={LABEL}>Contraseña</label>
              <input type="password" placeholder={mode === "register" ? "Mínimo 6 caracteres" : "Tu contraseña"} value={form.password} onChange={e => set("password", e.target.value)} required />
            </div>
          )}

          {mode === "login" && (
            <div style={{ textAlign: "right", marginBottom: 16 }}>
              <button type="button" onClick={() => { setMode("reset"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", fontSize: 12, color: "var(--teal)", cursor: "pointer" }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", fontSize: 13, padding: "9px 12px", borderRadius: "var(--radius-sm)", marginBottom: 14, border: "1px solid #F7C1C1", marginTop: 12 }}>{error}</div>}
          {success && <div style={{ background: "var(--teal-light)", color: "var(--teal-dark)", fontSize: 13, padding: "9px 12px", borderRadius: "var(--radius-sm)", marginBottom: 14, marginTop: 12 }}>{success}</div>}

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px", background: loading ? "var(--border2)" : "var(--teal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: isReset ? 14 : 0 }}>
            {loading ? "Cargando..." : isReset ? "Enviar correo" : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>

          {isReset && (
            <button type="button" onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{ width: "100%", padding: "8px", background: "transparent", border: "none", fontSize: 13, color: "var(--text3)", cursor: "pointer", marginTop: 8 }}>
              ← Volver al inicio de sesión
            </button>
          )}
        </form>
      </div>
    </div>
  );
}