import { useState, useRef } from "react";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../App";
import { Toast } from "./ui";

async function uploadToImgBB(file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_KEY}`, { method: "POST", body: formData });
  const data = await res.json();
  if (!data.success) throw new Error("Error al subir imagen");
  return data.data.url;
}

export default function Profile() {
  const { user } = useAuth();
  const fileRef = useRef();
  const [preview, setPreview] = useState(user?.photoURL || null);
  const [name, setName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const CARD = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: 12 };
  const LABEL = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--text2)", marginBottom: 6 };

  function onPhoto(e) { const file = e.target.files[0]; if (!file) return; setPreview(URL.createObjectURL(file)); }

  async function handleSave() {
    setSaving(true);
    try {
      let photoURL = user.photoURL;
      const file = fileRef.current?.files[0];
      if (file) photoURL = await uploadToImgBB(file);
      await updateProfile(auth.currentUser, { displayName: name.trim() || user.displayName, photoURL });
      await setDoc(doc(db, "users", user.uid), { displayName: name.trim() || user.displayName, photoURL, email: user.email, updatedAt: new Date().toISOString() }, { merge: true });
      setToast("Perfil actualizado ✓");
    } catch (err) { setToast("Error: " + err.message); }
    setSaving(false);
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 2, color: "var(--text)" }}>Mi perfil</h1>
        <p style={{ fontSize: 13, color: "var(--text3)" }}>Personaliza tu cuenta</p>
      </div>

      <div style={CARD}>
        <label style={LABEL}>Foto de perfil</label>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            {preview
              ? <img src={preview} alt="avatar" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--teal-light)" }} />
              : <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--teal-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 600, color: "var(--teal-dark)" }}>{user?.displayName?.[0]?.toUpperCase()}</div>
            }
            <button onClick={() => fileRef.current.click()} type="button" style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "var(--teal)", border: "2px solid var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12 }}>📷</button>
          </div>
          <div>
            <button onClick={() => fileRef.current.click()} type="button" style={{ padding: "8px 14px", background: "transparent", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 13, cursor: "pointer", marginBottom: 6, display: "block", width: "100%", color: "var(--text)" }}>Elegir foto</button>
            <p style={{ fontSize: 11, color: "var(--text3)" }}>JPG, PNG · Máx 5MB</p>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: "none" }} />
      </div>

      <div style={CARD}>
        <div style={{ marginBottom: 14 }}>
          <label style={LABEL}>Nombre</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" />
        </div>
        <div>
          <label style={LABEL}>Correo</label>
          <input type="text" value={user?.email} disabled />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: "13px", background: saving ? "var(--border2)" : "var(--teal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 15, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
      <Toast message={toast} />
    </div>
  );
}