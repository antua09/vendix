import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";
import { StatCard, PageHeader, SaleCard, EmptyState } from "./ui";
import { useNavigate } from "react-router-dom";

function fmx(n) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentSales, setRecentSales] = useState([]);
  const [myStats, setMyStats] = useState({ count: 0, revenue: 0 });
  const [teamStats, setTeamStats] = useState({ count: 0, revenue: 0 });

  useEffect(() => {
    // Ventas globales recientes
    const qGlobal = query(collection(db, "sales"), orderBy("createdAt", "desc"), limit(6));
    const unsubGlobal = onSnapshot(qGlobal, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecentSales(data);
      const rev = data.reduce((a, s) => a + (s.price * s.quantity), 0);
      setTeamStats({ count: data.length, revenue: rev });
    });

    // Mis ventas (globales + privadas)
    const qMine = query(collection(db, "sales"), where("sellerId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubMine = onSnapshot(qMine, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const rev = data.reduce((a, s) => a + (s.price * s.quantity), 0);
      setMyStats({ count: data.length, revenue: rev });
    });

    return () => { unsubGlobal(); unsubMine(); };
  }, [user.uid]);

  return (
    <div>
      <PageHeader
        title={`Hola, ${user.displayName?.split(" ")[0]} 👋`}
        subtitle="Aquí tienes el resumen de ventas del equipo"
        action={
          <button onClick={() => navigate("/registrar")} style={{ padding: "9px 18px", background: "var(--teal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 500 }}>
            + Registrar venta
          </button>
        }
      />

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <StatCard label="Total del equipo (recientes)" value={fmx(teamStats.revenue)} sub={`${teamStats.count} ventas públicas`} accent="var(--teal)" />
        <StatCard label="Mis ventas (globales)" value={fmx(myStats.revenue)} sub={`${myStats.count} registros míos`} />
      </div>

      {/* Actividad reciente */}
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 15, fontWeight: 600 }}>Actividad reciente</h2>
        <button onClick={() => navigate("/globales")} style={{ fontSize: 12, color: "var(--teal)", background: "none", border: "none", fontWeight: 500 }}>
          Ver todas →
        </button>
      </div>

      {recentSales.length === 0
        ? <EmptyState icon="📭" title="Sin ventas aún" sub="Registra la primera venta del equipo" />
        : <div style={{ display: "grid", gap: 10 }}>
            {recentSales.map(s => <SaleCard key={s.id} sale={s} />)}
          </div>
      }
    </div>
  );
}
