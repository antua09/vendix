import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useAuth } from "../App";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;

  async function loginGoogle() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gray-50)" }}>
      <div style={{ background: "#fff", border: "1px solid var(--gray-100)", borderRadius: "var(--radius-lg)", padding: "2.5rem 2rem", width: "100%", maxWidth: 360, boxShadow: "var(--shadow-md)", textAlign: "center" }}>

        <div style={{ width: 52, height: 52, background: "var(--teal-light)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: 24 }}>
          📦
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Vendix</h1>
        <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 2rem", lineHeight: 1.6 }}>
          Registro compartido de ventas para tu equipo
        </p>

        <button onClick={loginGoogle} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "10px 16px", background: "#fff", border: "1px solid var(--gray-300)", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 500, transition: "background .15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff"}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
          </svg>
          Entrar con Google
        </button>

        <p style={{ fontSize: 11, color: "var(--gray-500)", marginTop: "1.5rem" }}>
          Solo accesible para tu equipo
        </p>
      </div>
    </div>
  );
}
