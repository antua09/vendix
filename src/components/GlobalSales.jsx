import { useEffect, useState, useMemo } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";
import { SaleCard, EmptyState } from "./ui";

function fmx(n) { return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n); }

function exportCSV(sales, filename) {
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
  a.download = filename || `vendix-ventas-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const PAGE_SIZE = 20;

function SalesView({ title, subtitle, sales, loading, emptyIcon, emptyTitle, emptySub }) {
  const [search, setSearch] = useState("");
  const [seller, setSeller] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const sellers = useMemo(() => [...new Set(sales.map(s => s.sellerName).filter(Boolean))], [sales]);
  const categories = useMemo(() => [...new Set(sales.map(s => s.category).filter(Boolean))], [sales]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const from = dateFrom ? new Date(dateFrom + "T00:00:00") : null;
    const to = dateTo ? new Date(dateTo + "T23:59:59") : null;
    return sales.filter(s => {
      const sDate = s.createdAt?.toDate?.();
      return (
        (!q || s.product?.toLowerCase().includes(q) || s.notes?.toLowerCase().includes(q) || s.location?.toLowerCase().includes(q))
        && (!seller || s.sellerName === seller)
        && (!category || s.category === category)
        && (!from || (sDate && sDate >= from))
        && (!to || (sDate && sDate <= to))
      );
    });
  }, [sales, search, seller, category, dateFrom, dateTo]);

  // Reset page when filters change
  useMemo(() => { setPage(1); }, [search, seller, category, dateFrom, dateTo]);

  const total = useMemo(() => filtered.reduce((a, s) => a + s.price * s.quantity, 0), [filtered]);
  const hasFilters = search || seller || category || dateFrom || dateTo;
  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  function clearFilters() { setSearch(""); setSeller(""); setCategory(""); setDateFrom(""); setDateTo(""); }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 2, color: "var(--text)" }}>{title}</h1>
          <p style={{ fontSize: 13, color: "var(--text3)" }}>{subtitle}</p>
        </div>
        <button
          onClick={() => exportCSV(filtered, `vendix-${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`)}
          disabled={filtered.length === 0}
          style={{ padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: filtered.length ? "pointer" : "not-allowed", color: "var(--text2)", opacity: filtered.length ? 1 : 0.5, whiteSpace: "nowrap" }}
        >
          ↓ CSV
        </button>
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
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: "100%" }} title="Desde" />
          </div>
          <div style={{ flex: 1 }}>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: "100%" }} title="Hasta" />
          </div>
        </div>
      </div>

      {hasFilters && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
          {search && <span style={{ fontSize: 11, padding: "3px 10px", background: "var(--teal-light)", color: "var(--teal-dark)", borderRadius: 20 }}>"{search}"</span>}
          {seller && <span onClick={() => setSeller("")} style={{ fontSize: 11, padding: "3px 10px", background: "var(--teal-light)", color: "var(--teal-dark)", borderRadius: 20, cursor: "pointer" }}>{seller} ✕</span>}
          {category && <span onClick={() => setCategory("")} style={{ fontSize: 11, padding: "3px 10px", background: "var(--teal-light)", color: "var(--teal-dark)", borderRadius: 20, cursor: "pointer" }}>{category} ✕</span>}
          {dateFrom && <span onClick={() => setDateFrom("")} style={{ fontSize: 11, padding: "3px 10px", background: "var(--teal-light)", color: "var(--teal-dark)", borderRadius: 20, cursor: "pointer" }}>Desde {dateFrom} ✕</span>}
          {dateTo && <span onClick={() => setDateTo("")} style={{ fontSize: 11, padding: "3px 10px", background: "var(--teal-light)", color: "var(--teal-dark)", borderRadius: 20, cursor: "pointer" }}>Hasta {dateTo} ✕</span>}
          <span onClick={clearFilters} style={{ fontSize: 11, padding: "3px 10px", background: "var(--surface2)", color: "var(--text3)", borderRadius: 20, cursor: "pointer" }}>Limpiar todo</span>
        </div>
      )}

      {loading
        ? <div style={{ textAlign: "center", padding: 40, color: "var(--text3)" }}>Cargando...</div>
        : filtered.length === 0
          ? <EmptyState icon={emptyIcon} title={emptyTitle} sub={emptySub} />
          : <>
              <div style={{ display: "grid", gap: 10 }}>
                {paginated.map(s => <SaleCard key={s.id} sale={s} />)}
              </div>
              {hasMore && (
                <button
                  onClick={() => setPage(p => p + 1)}
                  style={{ width: "100%", marginTop: 12, padding: "10px", background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 13, color: "var(--text2)", cursor: "pointer" }}
                >
                  Cargar más ({filtered.length - paginated.length} restantes)
                </button>
              )}
            </>
      }
    </div>
  );
}

export function GlobalSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    return onSnapshot(query(collection(db, "sales"), orderBy("createdAt", "desc")), snap => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);
  return <SalesView title="Ventas del equipo" subtitle="Todas las ventas públicas" sales={sales} loading={loading} emptyIcon="🌐" emptyTitle="Sin ventas públicas" emptySub="Registra una venta con visibilidad pública" />;
}

export function PrivateSales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    return onSnapshot(query(collection(db, "users", user.uid, "privateSales"), orderBy("createdAt", "desc")), snap => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user.uid]);
  return <SalesView title="Mis ventas privadas" subtitle="Solo tú puedes verlas" sales={sales} loading={loading} emptyIcon="🔒" emptyTitle="Sin ventas privadas" emptySub='Registra una venta y activa "Venta privada"' />;
}

export default GlobalSales;
