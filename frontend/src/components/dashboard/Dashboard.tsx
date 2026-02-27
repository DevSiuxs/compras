'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import styles from './Dashboard.module.css';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';
import { DashboardData } from '@/types';

interface DashboardProps { alVerHistorial?: () => void; }

// Interfaz para el objeto de las secciones
interface SeccionesStatus {
  [key: string]: number;
}

// Interfaz para el gráfico
interface GraficoGasto {
  name: string;
  gasto: number;
}

// Interfaz extendida localmente
interface DashboardResponse extends DashboardData {
  graficoGastos?: GraficoGasto[];
}

export default function Dashboard({ alVerHistorial }: DashboardProps) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Usamos el ENDPOINT centralizado que apunta al puerto 3000
    fetch(ENDPOINTS.REPORTES.DASHBOARD, {
      headers: getHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error('Error en la petición');
        return res.json();
      })
      .then((d: DashboardResponse) => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error en Dashboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className={styles.loading}>Sincronizando con base de datos...</div>;

  // --- VARIABLES DE SEGURIDAD (Mismo cálculo que tienes) ---
  const presupuesto = data?.presupuestoRestante ?? 0;
  const gasto = data?.gastoTotal ?? 0;
  const secciones: SeccionesStatus = data?.conteoSecciones ?? {
    ALMACEN: 0, COTIZANDO: 0, AUTORIZAR: 0, COMPRAS: 0, RECEPCION: 0, FINALIZADO: 0
  };
  const grafico: GraficoGasto[] = data?.graficoGastos ?? [];

  const presupuestoTotal = presupuesto + gasto;
  const porcentajeGastado = presupuestoTotal > 0
    ? ((gasto / presupuestoTotal) * 100).toFixed(1)
    : "0";

  return (
    <div className={styles.container} style={{ flexDirection: 'column', overflowY: 'auto', gap: '2rem', padding: '2rem' }}>

      {/* TARJETAS DE DINERO - TU DISEÑO ORIGINAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className={styles.chartCard} style={{ borderTop: '4px solid #00ff41' }}>
          <small style={{ color: '#666' }}>PRESUPUESTO DISPONIBLE</small>
          <h2 style={{ fontSize: '2.5rem', color: '#00ff41', margin: '0.5rem 0' }}>
            ${presupuesto.toLocaleString('es-MX')}
          </h2>
          <div style={{ width: '100%', height: '6px', background: '#1a1a1a', borderRadius: '10px' }}>
            <div style={{ width: `${100 - parseFloat(porcentajeGastado)}%`, height: '100%', background: '#00ff41', boxShadow: '0 0 10px #00ff41' }} />
          </div>
        </div>

        <div className={styles.chartCard} style={{ borderTop: '4px solid #ff0080' }}>
          <small style={{ color: '#666' }}>GASTO REALIZADO</small>
          <h2 style={{ fontSize: '2.5rem', color: '#ff0080', margin: '0.5rem 0' }}>
            ${gasto.toLocaleString('es-MX')}
          </h2>
          <span style={{ fontSize: '12px', color: '#ff0080' }}>{porcentajeGastado}% consumido</span>
        </div>
      </div>

      {/* ESTADO DEL FLUJO - TU DISEÑO ORIGINAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        {Object.entries(secciones).map(([key, val]: [string, number]) => (
          <div key={key} className={styles.miniCard} style={{ textAlign: 'center', border: val > 0 ? '1px solid #0070f3' : '1px solid #1a1a1a' }}>
            <span style={{ fontSize: '10px', color: '#444' }}>{key}</span>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: val > 0 ? '#0070f3' : '#333' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* GRÁFICA Y BOTÓN - TU DISEÑO ORIGINAL */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className={styles.chartCard} style={{ height: '350px' }}>
          <h3 style={{fontSize: '12px', marginBottom: '1rem'}}>HISTORIAL DE COMPRAS (Últimos 10 folios)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={grafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
              <XAxis dataKey="name" stroke="#444" fontSize={10} />
              <YAxis stroke="#444" fontSize={10} />
              <Tooltip contentStyle={{ background: '#000', border: '1px solid #222' }} />
              <Bar dataKey="gasto" radius={[5, 5, 0, 0]}>
                {grafico.map((_item: GraficoGasto, index: number) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0070f3' : '#7928ca'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '3rem' }}>📁</div>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ margin: 0 }}>Historial General</h4>
            <p style={{ fontSize: '11px', color: '#555' }}>Auditoría y trazabilidad completa</p>
          </div>
          <button
            onClick={alVerHistorial}
            className={styles.btnNavHistorial}
            style={{ width: '100%', background: '#0070f3', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            VER TODO EL REGISTRO
          </button>
        </div>
      </div>
    </div>
  );
}
