import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";
import { PageHeader, SaleCard, EmptyState, Badge } from "./ui";

function fmx(n) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

function SalesView({ title, subtitle, sales, loading, emptyIcon, emptyTitle, emptySub }) {
  const [search, setSearch] = useState("");
  const [filterSeller, setFilterSeller] = useState("all");

  const sellers = [...new Set(sales.map(s => s.sellerName).filter(Boolean))];

  const filtered = sales.filter(s => {
    const matchSearch = !search || s.product?.toLowerCase().includes(search.toLowerCase()) || s.notes?.toLowerCase().includes(search.toLowerCase());
    const matchSeller = filterSeller === "all" || s.sellerName === filterSeller;
    return matchSearch && matchSeller;
  });

  const total = filtered.reduce((a, s) => a + (s.price * s.quantity), 0);

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={<Badge color="teal">{fmx(total)}</Badge>}
      />

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 220 }}
        />
        {sellers.length > 1 && (
          <select value={filterSeller} onChange={e => setFilterSeller(e.target.value)} style={{ maxWidth: 180 }}>
            <option value="all">Todos los vendedores</option>
            {sellers.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--gray-500)", alignSelf: "center" }}>
          {filtered.length} {filtered.length === 1 ? "venta" : "ventas"}
        </span>
      </div>

      {loading
        ? <div style={{ textAlign: "center", padding: 40, color: "var(--gray-500)" }}>Cargando...</div>
        : filtered.length === 0
          ? <EmptyState icon={emptyIcon} title={emptyTitle} sub={emptySub} />
          : <div style={{ display: "grid", gap: 10 }}>
              {filtered.map(s => <SaleCard key={s.id} sale={s} />)}
            </div>
      }
    </div>
  );
}

export function GlobalSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "sales"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <SalesView
      title="Ventas del equipo"
      subtitle="Todas las ventas públicas registradas"
      sales={sales}
      loading={loading}
      emptyIcon="🌐"
      emptyTitle="Sin ventas públicas"
      emptySub="Registra una venta y activa la opción pública"
    />
  );
}

export function PrivateSales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "users", user.uid, "privateSales"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  return (
    <SalesView
      title="Mis ventas privadas"
      subtitle="Solo tú puedes ver estas ventas"
      sales={sales}
      loading={loading}
      emptyIcon="🔒"
      emptyTitle="Sin ventas privadas"
      emptySub='Registra una venta y activa "Venta privada"'
    />
  );
}

export default GlobalSales;
