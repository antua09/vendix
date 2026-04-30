import { useEffect, useState, useMemo } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";
import { SaleCard, EmptyState, Badge } from "./ui";

function fmx(n) { return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n); }

function SalesView({ title, subtitle, sales, loading, emptyIcon, emptyTitle, emptySub }) {
  const [search, setSearch] = useState("");
  const [seller, setSeller] = useState("");
  const [category, setCategory] = useState("");

  const sellers = useMemo(() => [...new Set(sales.map(s => s.sellerName).filter(Boolean))], [sales]);
  const categories = useMemo(() => [...new Set(sales.map(s => s.category).filter(Boolean))], [sales]);
  const filtered = useMemo(() => sales.filter(s => {
    const q = search.toLowerCase();
    return (!q || s.product?.toLowerCase().includes(q) || s.notes?.toLowerCase().includes(q) || s.location?.toLowerCase().includes(q))
      && (!seller || s.sellerName === seller)
      && (!category || s.category === category);
  }), [sales, search, seller, category]);

  const total = useMemo(() => filtered.reduce((a, s) => a + s.price * s.quantity, 0), [filtered]);
  const hasFilters = search || seller || category;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 2, color: "var(--text)" }}>{title}</h1>
        <p style={{ fontSize: 13, color: "var(--text3)" }}>{subtitle}</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Total {hasFilters ? "filtrado" : ""}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--teal)" }}>{fmx(total)}</div>
        </div>
        <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Ventas</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)" }}>{filtered.length}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        <input type="text" placeholder="🔍 Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: "flex", gap: 8 }}>
          <select value={seller} onChange={e => setSeller(e.target.value)} style={{ flex: 1 }}>
            <option value="">Todos los vendedores</option>
            {sellers.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1 }}>
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {hasFilters && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {search && <span style={{ fontSize: 11, padding: "3px 10px", background: "var(--teal-light)", color: "var(--teal-dark)", borderRadius: 20 }}>"{search}"</span>}
          {seller && <span onClick={() => setSeller("")} style={{ fontSize: 11, padding: "3px 10px", background: "var(--teal-light)", color: "var(--teal-dark)", borderRadius: 20, cursor: "pointer" }}>{seller} ✕</span>}
          {category && <span onClick={() => setCategory("")} style={{ fontSize: 11, padding: "3px 10px", background: "var(--teal-light)", color: "var(--teal-dark)", borderRadius: 20, cursor: "pointer" }}>{category} ✕</span>}
          <span onClick={() => { setSearch(""); setSeller(""); setCategory(""); }} style={{ fontSize: 11, padding: "3px 10px", background: "var(--surface2)", color: "var(--text3)", borderRadius: 20, cursor: "pointer" }}>Limpiar todo</span>
        </div>
      )}

      {loading
        ? <div style={{ textAlign: "center", padding: 40, color: "var(--text3)" }}>Cargando...</div>
        : filtered.length === 0
          ? <EmptyState icon={emptyIcon} title={emptyTitle} sub={emptySub} />
          : <div style={{ display: "grid", gap: 10 }}>{filtered.map(s => <SaleCard key={s.id} sale={s} />)}</div>
      }
    </div>
  );
}

export function GlobalSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    return onSnapshot(query(collection(db, "sales"), orderBy("createdAt", "desc")), snap => { setSales(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); });
  }, []);
  return <SalesView title="Ventas del equipo" subtitle="Todas las ventas públicas" sales={sales} loading={loading} emptyIcon="🌐" emptyTitle="Sin ventas públicas" emptySub="Registra una venta con visibilidad pública" />;
}

export function PrivateSales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    return onSnapshot(query(collection(db, "users", user.uid, "privateSales"), orderBy("createdAt", "desc")), snap => { setSales(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); });
  }, [user.uid]);
  return <SalesView title="Mis ventas privadas" subtitle="Solo tú puedes verlas" sales={sales} loading={loading} emptyIcon="🔒" emptyTitle="Sin ventas privadas" emptySub='Registra una venta y activa "Venta privada"' />;
}

export default GlobalSales;