import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";
import { Toggle, Toast } from "./ui";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["Ropa", "Electrónica", "Calzado", "Accesorios", "Alimentos", "Otro"];

async function uploadToImgBB(file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_KEY}`,
    { method: "POST", body: formData }
  );
  const data = await res.json();
  if (!data.data?.url) throw new Error("Error al subir imagen");
  return data.data.url;
}

export default function RegisterSale() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [form, setForm] = useState({
    product: "", quantity: 1, price: "", location: "",
    notes: "", category: "", isPrivate: false,
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function onPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.product || !form.price || !form.quantity) return;
    setSaving(true);

    try {
      let photoURL = null;
      if (photo) {
        photoURL = await uploadToImgBB(photo);
      }

      const saleData = {
        product: form.product,
        quantity: Number(form.quantity),
        price: Number(form.price),
        location: form.location,
        notes: form.notes,
        category: form.category,
        photoURL,
        sellerId: user.uid,
        sellerName: user.displayName,
        isPrivate: form.isPrivate,
        createdAt: serverTimestamp(),
      };

      if (form.isPrivate) {
        await addDoc(collection(db, "users", user.uid, "privateSales"), saleData);
      } else {
        await addDoc(collection(db, "sales"), saleData);
      }

      setToast(form.isPrivate ? "Venta privada guardada ✓" : "Venta registrada en el equipo ✓");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
      setToast("Error: " + err.message);
    }

    setSaving(false);
  }

  const total = Number(form.price || 0) * Number(form.quantity || 0);
  const fmx = n => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
  const CARD = { background: "#fff", border: "1px solid var(--gray-100)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: 12 };
  const LABEL = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--gray-700)", marginBottom: 6 };

  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Registrar venta</h1>
      <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 16 }}>{user.displayName}</p>

      <form onSubmit={handleSubmit}>
        <div style={CARD}>
          <label style={LABEL}>Foto del producto</label>
          {photoPreview
            ? <div style={{ position: "relative", display: "inline-block" }}>
                <img src={photoPreview} alt="preview" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid var(--gray-100)" }} />
                <button type="button" onClick={removePhoto} style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: "#fff", border: "1px solid var(--gray-300)", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>✕</button>
              </div>
            : <div onClick={() => fileRef.current.click()} style={{ width: 100, height: 100, border: "1.5px dashed var(--gray-300)", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4 }}>
                <span style={{ fontSize: 22 }}>📷</span>
                <span style={{ fontSize: 10, color: "var(--gray-500)" }}>Agregar foto</span>
              </div>
          }
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPhoto} style={{ display: "none" }} />
        </div>

        <div style={CARD}>
          <div style={{ marginBottom: 12 }}>
            <label style={LABEL}>Producto *</label>
            <input type="text" placeholder="Nombre del producto" value={form.product} onChange={e => set("product", e.target.value)} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={LABEL}>Cantidad *</label>
              <input type="number" min="1" step="1" value={form.quantity} onChange={e => set("quantity", e.target.value)} required />
            </div>
            <div>
              <label style={LABEL}>Precio (MXN) *</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e => set("price", e.target.value)} required />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={LABEL}>Categoría</label>
              <select value={form.category} onChange={e => set("category", e.target.value)}>
                <option value="">Sin categoría</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Ubicación</label>
              <input type="text" placeholder="ej. Juárez Centro" value={form.location} onChange={e => set("location", e.target.value)} />
            </div>
          </div>
          <div>
            <label style={LABEL}>Notas</label>
            <input type="text" placeholder="Cliente, condición, etc." value={form.notes} onChange={e => set("notes", e.target.value)} />
          </div>
        </div>

        <div style={CARD}>
          {form.price && form.quantity && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--gray-100)" }}>
              <span style={{ fontSize: 13, color: "var(--gray-500)" }}>Total</span>
              <span style={{ fontWeight: 600, fontSize: 20, color: "var(--teal)" }}>{fmx(total)}</span>
            </div>
          )}
          <Toggle
            checked={form.isPrivate}
            onChange={v => set("isPrivate", v)}
            label={form.isPrivate ? "Venta privada — solo tú la verás" : "Venta pública — visible para el equipo"}
          />
        </div>

        <button type="submit" disabled={saving} style={{ width: "100%", padding: "13px", background: saving ? "var(--gray-300)" : "var(--teal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 15, fontWeight: 600 }}>
          {saving ? "Guardando..." : "Registrar venta"}
        </button>
      </form>

      <Toast message={toast} />
    </div>
  );
}
