'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';
import { DashboardData } from '@/types';
import styles from './Dashboard.module.css';

interface DashboardProps {
  alVerHistorial?: () => void;
}

export default function Dashboard({ alVerHistorial }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(ENDPOINTS.REPORTES.DASHBOARD, { headers: getHeaders() })
      .then(res => res.json())
      .then((d: DashboardData) => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error en Dashboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className={styles.loading}>Sincronizando con base de datos...</div>;

  const presupuesto = data?.presupuestoRestante ?? 0;
  const gasto = data?.gastoTotal ?? 0;
  const totalSolicitudes = data?.totalTickets ?? 0;

  const secciones = data?.conteoSecciones ?? {
    ALMACEN: 0, COTIZANDO: 0, AUTORIZAR: 0, COMPRAS: 0, RECIBIDO: 0
  };

  const grafico = [
    { name: 'ALM', gasto: secciones.ALMACEN },
    { name: 'COT', gasto: secciones.COTIZANDO },
    { name: 'AUT', gasto: secciones.AUTORIZAR },
    { name: 'COM', gasto: secciones.COMPRAS },
    { name: 'REC', gasto: secciones.RECIBIDO },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>PANEL DE CONTROL</h1>
        <p className={styles.subtitle}>Resumen operativo de solicitudes y presupuesto</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>PRESUPUESTO DISPONIBLE</span>
          <h2 className={styles.cardValue}>${presupuesto.toLocaleString('es-MX')}</h2>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>GASTO ACUMULADO</span>
          <h2 className={styles.cardValue}>${gasto.toLocaleString('es-MX')}</h2>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>TICKETS TOTALES</span>
          <h2 className={styles.cardValue}>{totalSolicitudes}</h2>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.chartCard}>
          <h3>Distribución por Departamento</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={grafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
              <XAxis dataKey="name" stroke="#444" fontSize={10} />
              <YAxis stroke="#444" fontSize={10} />
              <Tooltip contentStyle={{ background: '#000', border: '1px solid #222' }} />
              <Bar dataKey="gasto" radius={[5, 5, 0, 0]}>
                {grafico.map((_, index) => (
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
          <button onClick={alVerHistorial} className={styles.btnNavHistorial}>
            EXPLORAR REGISTROS
          </button>
        </div>
      </div>
    </div>
  );
}
