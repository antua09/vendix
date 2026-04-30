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
  formData.append("name", file.name);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_KEY}`, { method: "POST", body: formData });
  const data = await res.json();
  if (!data.success) throw new Error("Error al subir imagen");
  return data.data.url;
}

function validate(form) {
  const errors = {};
  const product = form.product.trim();
  if (!product) errors.product = "El nombre es obligatorio";
  else if (product.length < 2) errors.product = "Mínimo 2 caracteres";
  else if (product.length > 80) errors.product = "Máximo 80 caracteres";

  const price = Number(form.price);
  if (!form.price) errors.price = "El precio es obligatorio";
  else if (isNaN(price) || price <= 0) errors.price = "Debe ser mayor a $0";
  else if (price > 9_999_999) errors.price = "Precio demasiado alto";

  const qty = Number(form.quantity);
  if (!form.quantity) errors.quantity = "La cantidad es obligatoria";
  else if (!Number.isInteger(qty) || qty < 1) errors.quantity = "Debe ser entero mayor a 0";
  else if (qty > 9999) errors.quantity = "Máximo 9,999 unidades";

  return errors;
}

export default function RegisterSale() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [form, setForm] = useState({ product: "", quantity: 1, price: "", location: "", notes: "", category: "", isPrivate: false });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    if (touched[key]) {
      const next = { ...form, [key]: val };
      const e = validate(next);
      setErrors(prev => ({ ...prev, [key]: e[key] }));
    }
  }

  function touch(key) {
    setTouched(t => ({ ...t, [key]: true }));
    const e = validate(form);
    setErrors(prev => ({ ...prev, [key]: e[key] }));
  }

  function onPhoto(e) { const file = e.target.files[0]; if (!file) return; setPhoto(file); setPhotoPreview(URL.createObjectURL(file)); }
  function removePhoto() { setPhoto(null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ""; }

  async function handleSubmit(e) {
    e.preventDefault();
    const allTouched = { product: true, price: true, quantity: true };
    setTouched(allTouched);
    const e2 = validate(form);
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    setSaving(true);
    try {
      let photoURL = null;
      if (photo) photoURL = await uploadToImgBB(photo);
      const saleData = {
        product: form.product.trim(), quantity: Number(form.quantity), price: Number(form.price),
        location: form.location.trim(), notes: form.notes.trim(), category: form.category,
        photoURL, sellerId: user.uid, sellerName: user.displayName,
        isPrivate: form.isPrivate, createdAt: serverTimestamp(),
      };
      if (form.isPrivate) await addDoc(collection(db, "users", user.uid, "privateSales"), saleData);
      else await addDoc(collection(db, "sales"), saleData);
      setToast(form.isPrivate ? "Venta privada guardada ✓" : "Venta registrada en el equipo ✓");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) { setToast("Error: " + err.message); }
    setSaving(false);
  }

  const total = Number(form.price || 0) * Number(form.quantity || 0);
  const fmx = n => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
  const CARD = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: 12 };
  const LABEL = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--text2)", marginBottom: 6 };
  const ERR = { fontSize: 11, color: "#D93025", marginTop: 4, display: "block" };

  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, color: "var(--text)" }}>Registrar venta</h1>
      <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 16 }}>{user.displayName}</p>
      <form onSubmit={handleSubmit} noValidate>
        <div style={CARD}>
          <label style={LABEL}>Foto del producto</label>
          {photoPreview
            ? <div style={{ position: "relative", display: "inline-block" }}>
                <img src={photoPreview} alt="preview" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
                <button type="button" onClick={removePhoto} style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border2)", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text)" }}>✕</button>
              </div>
            : <div onClick={() => fileRef.current.click()} style={{ width: 100, height: 100, border: "1.5px dashed var(--border2)", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4 }}>
                <span style={{ fontSize: 22 }}>📷</span>
                <span style={{ fontSize: 10, color: "var(--text3)" }}>Agregar foto</span>
              </div>
          }
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPhoto} style={{ display: "none" }} />
        </div>

        <div style={CARD}>
          <div style={{ marginBottom: 12 }}>
            <label style={LABEL}>Producto *</label>
            <input
              type="text"
              placeholder="Nombre del producto"
              value={form.product}
              onChange={e => set("product", e.target.value)}
              onBlur={() => touch("product")}
              style={{ borderColor: errors.product && touched.product ? "#D93025" : undefined }}
            />
            {errors.product && touched.product && <span style={ERR}>{errors.product}</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={LABEL}>Cantidad *</label>
              <input
                type="number" min="1" step="1"
                value={form.quantity}
                onChange={e => set("quantity", e.target.value)}
                onBlur={() => touch("quantity")}
                style={{ borderColor: errors.quantity && touched.quantity ? "#D93025" : undefined }}
              />
              {errors.quantity && touched.quantity && <span style={ERR}>{errors.quantity}</span>}
            </div>
            <div>
              <label style={LABEL}>Precio (MXN) *</label>
              <input
                type="number" min="0" step="0.01" placeholder="0.00"
                value={form.price}
                onChange={e => set("price", e.target.value)}
                onBlur={() => touch("price")}
                style={{ borderColor: errors.price && touched.price ? "#D93025" : undefined }}
              />
              {errors.price && touched.price && <span style={ERR}>{errors.price}</span>}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div><label style={LABEL}>Categoría</label><select value={form.category} onChange={e => set("category", e.target.value)}><option value="">Sin categoría</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label style={LABEL}>Ubicación</label><input type="text" placeholder="ej. Juárez Centro" value={form.location} onChange={e => set("location", e.target.value)} /></div>
          </div>
          <div><label style={LABEL}>Notas</label><input type="text" placeholder="Cliente, condición, etc." value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
        </div>

        <div style={CARD}>
          {form.price && form.quantity && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, color: "var(--text3)" }}>Total</span>
              <span style={{ fontWeight: 600, fontSize: 20, color: "var(--teal)" }}>{fmx(total)}</span>
            </div>
          )}
          <Toggle checked={form.isPrivate} onChange={v => set("isPrivate", v)} label={form.isPrivate ? "Venta privada — solo tú la verás" : "Venta pública — visible para el equipo"} />
        </div>

        <button type="submit" disabled={saving} style={{ width: "100%", padding: "13px", background: saving ? "var(--border2)" : "var(--teal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 15, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Guardando..." : "Registrar venta"}
        </button>
      </form>
      <Toast message={toast} />
    </div>
  );
}
