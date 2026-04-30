import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";
import { EmptyState } from "./ui";
import { Navigate } from "react-router-dom";

function fmx(n) { return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n); }
function fdate(ts) { return ts?.toDate?.().toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) || "—"; }

function exportCSV(sales) {
  const headers = ["Producto", "Categoría", "Cantidad", "Precio", "Total", "Vendedor", "Ubicación", "Notas", "Fecha"];
  const rows = sales.map(s => [
    s.product, s.category || "", s.quantity, s.price, s.price * s.quantity,
    s.sellerName, s.location || "", s.notes || "",
    s.createdAt?.toDate?.().toLocaleDateString("es-MX") || "",
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vendix-ventas-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.5rem", maxWidth: 320, width: "100%" }}>
        <h3 style={{ fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>{title}</h3>
        <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>{message}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "9px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "var(--text)" }}>Cancelar</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "9px", background: "#D93025", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ onToast, currentUserId }) {
  const [users, setUsers] = useState([]);
  const [banned, setBanned] = useState({});
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    return onSnapshot(collection(db, "users"), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "banned"), snap => {
      const map = {};
      snap.docs.forEach(d => map[d.id] = true);
      setBanned(map);
    });
  }, []);

  async function toggleBan(user) {
    const ref = doc(db, "banned", user.id);
    if (banned[user.id]) {
      await deleteDoc(ref);
      onToast(`${user.displayName} desbaneado ✓`);
    } else {
      await setDoc(ref, { bannedAt: new Date().toISOString(), displayName: user.displayName });
      onToast(`${user.displayName} baneado ✓`);
    }
    setConfirm(null);
  }

  async function toggleRole(user) {
    const newRole = user.role === "admin" ? "vendor" : "admin";
    await updateDoc(doc(db, "users", user.id), { role: newRole });
    onToast(`${user.displayName} ahora es ${newRole === "admin" ? "Admin" : "Vendedor"} ✓`);
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 14 }}>{users.length} usuarios registrados</p>
      {users.length === 0
        ? <EmptyState icon="👥" title="Sin usuarios" sub="Los usuarios aparecen cuando inician sesión" />
        : <div style={{ display: "grid", gap: 10 }}>
            {users.map(u => (
              <div key={u.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                {u.photoURL
                  ? <img src={u.photoURL} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  : <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--teal-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: "var(--teal-dark)", flexShrink: 0 }}>{u.displayName?.[0]?.toUpperCase()}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: "var(--text)" }}>{u.displayName}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{u.email}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {u.id === currentUserId
                    ? <span style={{ fontSize: 11, padding: "3px 10px", background: "var(--teal-light)", color: "var(--teal-dark)", borderRadius: 20, fontWeight: 500 }}>Tú</span>
                    : <>
                        <button
                          onClick={() => toggleRole(u)}
                          style={{ padding: "5px 10px", background: u.role === "admin" ? "var(--teal-light)" : "var(--surface2)", color: u.role === "admin" ? "var(--teal-dark)" : "var(--text3)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer" }}
                        >
                          {u.role === "admin" ? "Admin ✓" : "Vendedor"}
                        </button>
                        <button
                          onClick={() => setConfirm(u)}
                          style={{ padding: "5px 10px", background: banned[u.id] ? "var(--teal-light)" : "#FAECE7", color: banned[u.id] ? "var(--teal-dark)" : "#993C1D", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer" }}
                        >
                          {banned[u.id] ? "Desbanear" : "Banear"}
                        </button>
                      </>
                  }
                </div>
              </div>
            ))}
          </div>
      }
      {confirm && (
        <ConfirmModal
          title={banned[confirm.id] ? "¿Desbanear usuario?" : "¿Banear usuario?"}
          message={banned[confirm.id] ? `${confirm.displayName} podrá volver a acceder a la app.` : `${confirm.displayName} no podrá iniciar sesión hasta que lo desbanees.`}
          onConfirm={() => toggleBan(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function SalesTab({ onToast }) {
  const [sales, setSales] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    return onSnapshot(query(collection(db, "sales"), orderBy("createdAt", "desc")), snap => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  async function deleteSale(sale) {
    await deleteDoc(doc(db, "sales", sale.id));
    onToast("Venta eliminada ✓");
    setConfirm(null);
  }

  const filtered = sales.filter(s => !search || s.product?.toLowerCase().includes(search.toLowerCase()) || s.sellerName?.toLowerCase().includes(search.toLowerCase()));
  const totalRev = filtered.reduce((a, s) => a + s.price * s.quantity, 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Total ventas</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--teal)" }}>{fmx(totalRev)}</div>
        </div>
        <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Registros</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)" }}>{filtered.length}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input type="text" placeholder="🔍 Buscar venta o vendedor..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
        <button
          onClick={() => exportCSV(filtered)}
          disabled={filtered.length === 0}
          style={{ padding: "9px 14px", background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: filtered.length ? "pointer" : "not-allowed", color: "var(--text2)", whiteSpace: "nowrap", opacity: filtered.length ? 1 : 0.5 }}
        >
          ↓ CSV
        </button>
      </div>

      {filtered.length === 0
        ? <EmptyState icon="🧾" title="Sin ventas" sub="No hay ventas que mostrar" />
        : <div style={{ display: "grid", gap: 8 }}>
            {filtered.map(s => (
              <div key={s.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                {s.photoURL
                  ? <img src={s.photoURL} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  : <div style={{ width: 48, height: 48, borderRadius: 8, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📦</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{s.product}</span>
                    <span style={{ fontWeight: 600, color: "var(--teal)", fontSize: 14, whiteSpace: "nowrap" }}>{fmx(s.price * s.quantity)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{s.sellerName} · {s.quantity} u. · {fdate(s.createdAt)}</div>
                </div>
                <button onClick={() => setConfirm(s)} style={{ padding: "5px 10px", background: "#FAECE7", color: "#993C1D", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>
                  🗑
                </button>
              </div>
            ))}
          </div>
      }

      {confirm && (
        <ConfirmModal
          title="¿Eliminar venta?"
          message={`Se eliminará "${confirm.product}" de ${confirm.sellerName}. Esta acción no se puede deshacer.`}
          onConfirm={() => deleteSale(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState("users");
  const [toast, setToast] = useState("");

  if (!isAdmin) return <Navigate to="/" replace />;

  function onToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  const tabStyle = (t) => ({
    flex: 1, padding: "8px", border: "none", borderRadius: 6, fontSize: 13,
    fontWeight: tab === t ? 500 : 400,
    background: tab === t ? "var(--surface)" : "transparent",
    color: tab === t ? "var(--text)" : "var(--text3)",
    cursor: "pointer",
  });

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)" }}>Panel de administración</h1>
          <span style={{ fontSize: 11, padding: "3px 8px", background: "var(--teal-light)", color: "var(--teal-dark)", borderRadius: 20, fontWeight: 500 }}>Admin</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--text3)" }}>Gestiona usuarios y ventas del equipo</p>
      </div>

      <div style={{ display: "flex", background: "var(--surface2)", borderRadius: "var(--radius-sm)", padding: 3, marginBottom: 16 }}>
        <button style={tabStyle("users")} onClick={() => setTab("users")}>👥 Usuarios</button>
        <button style={tabStyle("sales")} onClick={() => setTab("sales")}>🧾 Ventas</button>
      </div>

      {tab === "users" && <UsersTab onToast={onToast} currentUserId={user?.uid} />}
      {tab === "sales" && <SalesTab onToast={onToast} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "var(--teal)", color: "#fff", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 500, zIndex: 999 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
