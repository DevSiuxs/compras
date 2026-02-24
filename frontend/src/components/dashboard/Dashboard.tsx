'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import styles from './Dashboard.module.css';

const STATUS_COLORS: any = {
  SOLICITADO: '#0070f3',
  COTIZANDO: '#7928ca',
  AUTORIZAR: '#ffca28',
  COMPRAR: '#ff0080',
  PAGADO: '#00ff41',
  COMPRADO: '#00ff41'
};

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [detallada, setDetallada] = useState<any>(null);
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/reportes/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => console.error("Error cargando dashboard:", err));
  }, []);

  const verTrazabilidad = (id: number) => {
    fetch(`http://localhost:3000/reportes/detalle/${id}`)
      .then(res => res.json())
      .then(d => setDetallada(d));
  };

  // Filtrado eficiente en memoria
  const solicitudesFiltradas = useMemo(() => {
    if (!data?.solicitudes) return [];
    if (filtroStatus === 'TODOS') return data.solicitudes;
    return data.solicitudes.filter((s: any) => s.status === filtroStatus);
  }, [data, filtroStatus]);

  if (loading) return (
    <div className={styles.loaderContainer}>
      <div className={styles.spinner}></div>
      <span>SINCRONIZANDO DATOS...</span>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* SIDEBAR ANALÍTICO */}
      <aside className={styles.sidebar}>
        <div className={styles.sideHeader}>
          <h2>BI ANALYTICS</h2>
          <p>SISTEMA DE COMPRAS V1.0</p>
        </div>

        <div className={styles.filterBox}>
          <label>ETAPA DEL FLUJO</label>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="TODOS">TODOS LOS REGISTROS</option>
            {data && Object.keys(data.porStatus).map(s => (
              <option key={s} value={s}>{s} ({data.porStatus[s]})</option>
            ))}
          </select>
        </div>

        <div className={styles.miniChart}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={Object.entries(data.porStatus).map(([name, value]) => ({ name, value }))}
                innerRadius={55}
                outerRadius={75}
                dataKey="value"
                stroke="none"
              >
                {Object.keys(data.porStatus).map((key, i) => (
                  <Cell key={i} fill={STATUS_COLORS[key] || '#333'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{background: '#111', border: '1px solid #333', fontSize: '12px'}} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.chartLegend}>DISTRIBUCIÓN OPERATIVA</div>
        </div>
      </aside>

      {/* PANEL PRINCIPAL */}
      <main className={styles.main}>
        {/* CARDS KPI */}
        <header className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>PRESUPUESTO DISPONIBLE</span>
            <h3 className={styles.valBlue}>${data.stats.presupuestoDisponible.toLocaleString()}</h3>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>INVERSIÓN EJECUTADA</span>
            <h3 className={styles.valRed}>${data.stats.gastoTotal.toLocaleString()}</h3>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>FLUJO DE SOLICITUDES</span>
            <h3>{data.stats.totalTickets} <small>unidades</small></h3>
          </div>
        </header>

        {/* GRÁFICA DE GASTOS */}
        <section className={styles.chartSection}>
          <div className={styles.sectionHeader}>
            <h3>HISTÓRICO DE GASTOS (PAGADOS)</h3>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.gastosHistorial}>
                <defs>
                  <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0070f3" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0070f3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="fecha" stroke="#444" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#444" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip
                  contentStyle={{background: '#000', border: '1px solid #222', borderRadius: '8px'}}
                  itemStyle={{color: '#0070f3'}}
                />
                <Area
                  type="monotone"
                  dataKey="monto"
                  stroke="#0070f3"
                  fillOpacity={1}
                  fill="url(#colorGasto)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* TABLA DE REGISTROS */}
        <section className={styles.tableSection}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>FOLIO</th>
                <th>EMPRESA</th>
                <th>MONTO FINAL</th>
                <th>PRIORIDAD</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesFiltradas.map((sol: any) => (
                <tr key={sol.id} onClick={() => verTrazabilidad(sol.id)} className={styles.tableRow}>
                  <td className={styles.folioCol}>{sol.folio}</td>
                  <td>{sol.empresa?.nombre || 'S/E'}</td>
                  <td className={styles.montoCol}>${(sol.montoFinal || 0).toLocaleString()}</td>
                  <td><div className={styles.priorityDot} style={{background: `var(--${sol.prioridad?.toLowerCase()})`}}></div></td>
                  <td>
                    <span className={styles.statusBadge} style={{borderColor: STATUS_COLORS[sol.status], color: STATUS_COLORS[sol.status]}}>
                      {sol.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* OVERLAY DE TRAZABILIDAD */}
      {detallada && (
        <div className={styles.overlay} onClick={() => setDetallada(null)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setDetallada(null)}>×</button>
            <div className={styles.drawerHeader}>
              <h2>TRAZABILIDAD</h2>
              <p>{detallada.folio} | {detallada.empresa?.nombre}</p>
            </div>

            <div className={styles.timeline}>
              {detallada.timeline?.map((t: any, i: number) => (
                <div key={i} className={styles.timeEntry}>
                  <div className={styles.timeDot} style={{background: t.color, boxShadow: `0 0 8px ${t.color}`}}></div>
                  <div className={styles.timeBody}>
                    <div className={styles.timeHeader}>
                      <strong>{t.evento}</strong>
                      <span>{new Date(t.fecha).toLocaleDateString()}</span>
                    </div>
                    <p>{t.detalle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
