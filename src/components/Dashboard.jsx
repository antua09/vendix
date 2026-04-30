import { useEffect, useState, useMemo } from "react";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";
import { SaleCard, EmptyState } from "./ui";
import SalesChart from "./SalesChart";
import { useNavigate } from "react-router-dom";

function fmx(n) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>{label}</div>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, color: accent || "var(--text)" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function TopProductos({ sales }) {
  const productos = useMemo(() => {
    const map = {};
    sales.forEach(s => {
      if (!map[s.product]) map[s.product] = { name: s.product, total: 0, count: 0 };
      map[s.product].total += s.price * s.quantity;
      map[s.product].count += s.quantity;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 4);
  }, [sales]);

  if (!productos.length) return null;
  const max = productos[0]?.total || 1;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px", marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--text)" }}>🏆 Top productos</div>
      {productos.map((p, i) => (
        <div key={p.name} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text3)", width: 16 }}>#{i + 1}</span>
              <span style={{ fontSize: 13, color: "var(--text)" }}>{p.name}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--teal)" }}>{fmx(p.total)}</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>{p.count} u.</div>
            </div>
          </div>
          <div style={{ height: 5, background: "var(--surface2)", borderRadius: 3 }}>
            <div style={{ height: "100%", width: `${(p.total / max) * 100}%`, background: i === 0 ? "var(--teal)" : "var(--border2)", borderRadius: 3, transition: "width .4s" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [globalSales, setGlobalSales] = useState([]);
  const [myPublicStats, setMyPublicStats] = useState({ count: 0, revenue: 0 });
  const [myPrivateStats, setMyPrivateStats] = useState({ count: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qGlobal = query(collection(db, "sales"), orderBy("createdAt", "desc"), limit(50));
    const unsubGlobal = onSnapshot(qGlobal, snap => { setGlobalSales(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); });
    const qMine = query(collection(db, "sales"), where("sellerId", "==", user.uid));
    const unsubMine = onSnapshot(qMine, snap => { const d = snap.docs.map(d => d.data()); setMyPublicStats({ count: d.length, revenue: d.reduce((a, s) => a + s.price * s.quantity, 0) }); });
    const qPriv = query(collection(db, "users", user.uid, "privateSales"), orderBy("createdAt", "desc"));
    const unsubPriv = onSnapshot(qPriv, snap => { const d = snap.docs.map(d => d.data()); setMyPrivateStats({ count: d.length, revenue: d.reduce((a, s) => a + s.price * s.quantity, 0) }); });
    return () => { unsubGlobal(); unsubMine(); unsubPriv(); };
  }, [user.uid]);

  const teamRevenue = useMemo(() => globalSales.reduce((a, s) => a + s.price * s.quantity, 0), [globalSales]);
  const myTotalRevenue = myPublicStats.revenue + myPrivateStats.revenue;
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)" }}>{saludo}, {user.displayName?.split(" ")[0]} 👋</h1>
          <p style={{ fontSize: 12, color: "var(--text3)" }}>Resumen del equipo</p>
        </div>
        <button onClick={() => navigate("/registrar")} style={{ padding: "9px 14px", background: "var(--teal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Vender
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <StatCard label="Total equipo" value={fmx(teamRevenue)} sub={`${globalSales.length} ventas`} accent="var(--teal)" icon="🌐" />
        <StatCard label="Mis ingresos" value={fmx(myTotalRevenue)} sub={`${myPublicStats.count + myPrivateStats.count} ventas`} icon="💰" />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <StatCard label="Mis ventas públicas" value={fmx(myPublicStats.revenue)} sub={`${myPublicStats.count} registros`} icon="📢" />
        <StatCard label="Mis ventas privadas" value={fmx(myPrivateStats.revenue)} sub={`${myPrivateStats.count} registros`} accent="var(--amber)" icon="🔒" />
      </div>

      {!loading && <SalesChart sales={globalSales} />}
      {!loading && <TopProductos sales={globalSales} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Actividad reciente</h2>
        <button onClick={() => navigate("/globales")} style={{ fontSize: 12, color: "var(--teal)", background: "none", border: "none", fontWeight: 500, cursor: "pointer" }}>Ver todas →</button>
      </div>

      {loading
        ? <div style={{ textAlign: "center", padding: 40, color: "var(--text3)", fontSize: 13 }}>Cargando...</div>
        : globalSales.length === 0
          ? <EmptyState icon="📭" title="Sin ventas aún" sub="Registra la primera venta del equipo" />
          : <div style={{ display: "grid", gap: 10 }}>{globalSales.slice(0, 4).map(s => <SaleCard key={s.id} sale={s} />)}</div>
      }
    </div>
  );
}