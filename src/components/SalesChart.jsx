import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

function fmx(n) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

function groupByDay(sales, days = 7) {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" });
    const daySales = sales.filter(s => s.createdAt?.toDate?.()?.toISOString().split("T")[0] === dateStr);
    return { label, total: daySales.reduce((a, s) => a + s.price * s.quantity, 0), ventas: daySales.length };
  });
}

function groupByWeek(sales, weeks = 6) {
  const now = new Date();
  return Array.from({ length: weeks }, (_, i) => {
    const start = new Date(now);
    start.setDate(start.getDate() - (weeks - 1 - i) * 7 - start.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const label = start.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
    const weekSales = sales.filter(s => { const d = s.createdAt?.toDate?.(); return d && d >= start && d <= end; });
    return { label, total: weekSales.reduce((a, s) => a + s.price * s.quantity, 0), ventas: weekSales.length };
  });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", boxShadow: "var(--shadow-md)" }}>
      <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 600, color: "var(--teal)", fontSize: 15 }}>{fmx(payload[0]?.value || 0)}</div>
      <div style={{ fontSize: 12, color: "var(--text3)" }}>{payload[1]?.value || 0} ventas</div>
    </div>
  );
}

export default function SalesChart({ sales }) {
  const [period, setPeriod] = useState("week");
  const [chartType, setChartType] = useState("area");

  const data = period === "week" ? groupByDay(sales, 7) : groupByWeek(sales, 6);
  const totalPeriod = data.reduce((a, d) => a + d.total, 0);
  const totalVentas = data.reduce((a, d) => a + d.ventas, 0);

  const TAB = (active) => ({
    padding: "5px 12px", border: "none", borderRadius: 6, fontSize: 12,
    fontWeight: active ? 600 : 400, cursor: "pointer",
    background: active ? "var(--teal)" : "transparent",
    color: active ? "#fff" : "var(--text3)",
    transition: ".15s",
  });

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1rem", marginBottom: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>Ingresos del período</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "var(--teal)" }}>{fmx(totalPeriod)}</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>{totalVentas} ventas</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          <div style={{ display: "flex", background: "var(--surface2)", borderRadius: 8, padding: 3, gap: 2 }}>
            <button style={TAB(period === "week")} onClick={() => setPeriod("week")}>7 días</button>
            <button style={TAB(period === "month")} onClick={() => setPeriod("month")}>6 sem</button>
          </div>
          <div style={{ display: "flex", background: "var(--surface2)", borderRadius: 8, padding: 3, gap: 2 }}>
            <button style={TAB(chartType === "area")} onClick={() => setChartType("area")}>Área</button>
            <button style={TAB(chartType === "bar")} onClick={() => setChartType("bar")}>Barras</button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={180}>
        {chartType === "area"
          ? <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#1D9E75" strokeWidth={2} fill="url(#tealGrad)" />
              <Area type="monotone" dataKey="ventas" stroke="transparent" fill="transparent" />
            </AreaChart>
          : <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="#1D9E75" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ventas" fill="transparent" />
            </BarChart>
        }
      </ResponsiveContainer>

      {/* Top vendedores */}
      {sales.length > 0 && <TopSellers sales={sales} />}
    </div>
  );
}

function TopSellers({ sales }) {
  const map = {};
  sales.forEach(s => {
    if (!map[s.sellerName]) map[s.sellerName] = { name: s.sellerName, total: 0, count: 0 };
    map[s.sellerName].total += s.price * s.quantity;
    map[s.sellerName].count += 1;
  });
  const sorted = Object.values(map).sort((a, b) => b.total - a.total).slice(0, 3);
  const max = sorted[0]?.total || 1;

  return (
    <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 10 }}>Top vendedores</div>
      {sorted.map((s, i) => (
        <div key={s.name} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 12, color: "var(--text2)" }}>
              {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {s.name}
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--teal)" }}>{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(s.total)}</span>
          </div>
          <div style={{ height: 5, background: "var(--surface2)", borderRadius: 3 }}>
            <div style={{ height: "100%", width: `${(s.total / max) * 100}%`, background: i === 0 ? "var(--teal)" : "var(--border2)", borderRadius: 3, transition: "width .4s" }} />
          </div>
        </div>
      ))}
    </div>
  );
}