'use client';

import { useState, useEffect, useMemo } from 'react';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';
import { SolicitudHistorial, DashboardData } from '@/types';
import styles from '../Dashboard.module.css';

const STATUS_COLORS: Record<string, string> = {
  SOLICITADO: '#0070f3',
  COTIZANDO: '#7928ca',
  AUTORIZAR: '#ffca28',
  COMPRAR: '#ff0080',
  RECIBIDO: '#00ff41',
  ENTREGADO: '#00ff41',
  PAGADO: '#00ff41'
};

export default function HistorialGeneral() {
  const [solicitudes, setSolicitudes] = useState<SolicitudHistorial[]>([]);
  const [detallada, setDetallada] = useState<SolicitudHistorial | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroFolio, setFiltroFolio] = useState('');

  useEffect(() => {
    fetch(ENDPOINTS.REPORTES.DASHBOARD, { headers: getHeaders() })
      .then(res => res.json())
      .then((data: DashboardData) => {
        setSolicitudes(data.solicitudes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchTrazabilidad = async (sol: SolicitudHistorial) => {
    try {
      const res = await fetch(ENDPOINTS.REPORTES.TRAZABILIDAD(sol.id), { headers: getHeaders() });
      const data = await res.json();
      setDetallada(data);
    } catch (error) {
      console.error("Error al obtener trazabilidad:", error);
    }
  };

  const listaFiltrada = useMemo(() => {
    return solicitudes.filter(s => {
      const matchFolio = s.folio.toLowerCase().includes(filtroFolio.toLowerCase());
      const matchFecha = filtroFecha ? s.fechaCreacion.startsWith(filtroFecha) : true;
      return matchFolio && matchFecha;
    });
  }, [solicitudes, filtroFolio, filtroFecha]);

  if (loading) return <div className={styles.loading}>Cargando historial...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.azulClaro}>HISTORIAL DE OPERACIONES</h1>
        <div className={styles.filtrosBar}>
          <input
            type="text"
            placeholder="Buscar por Folio..."
            value={filtroFolio}
            onChange={e => setFiltroFolio(e.target.value)}
            className={styles.inputFiltro}
          />
          <input
            type="date"
            value={filtroFecha}
            onChange={e => setFiltroFecha(e.target.value)}
            className={styles.inputFiltro}
          />
        </div>
      </header>

      <section className={styles.tableCard}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Empresa</th>
              <th>Fecha Creación</th>
              <th>Status</th>
              <th>Monto Final</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map(sol => (
              <tr key={sol.id}>
                <td className={styles.bold}>{sol.folio}</td>
                <td>{sol.empresa?.nombre}</td>
                <td>{new Date(sol.fechaCreacion).toLocaleDateString()}</td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: `${STATUS_COLORS[sol.status]}22`, color: STATUS_COLORS[sol.status] }}
                  >
                    {sol.status}
                  </span>
                </td>
                <td>{sol.montoFinal ? `$${sol.montoFinal.toLocaleString()}` : '---'}</td>
                <td>
                  <button className={styles.btnTrazabilidad} onClick={() => fetchTrazabilidad(sol)}>
                    Ver Trazabilidad
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* MODAL DE TRAZABILIDAD */}
      {detallada && (
        <div className={styles.overlay} onClick={() => setDetallada(null)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setDetallada(null)}>×</button>
            <h2 style={{ color: '#0070f3' }}>LÍNEA DE TIEMPO</h2>
            <p className={styles.drawerSub}>{detallada.folio} | {detallada.empresa?.nombre}</p>

            <div className={styles.timeline}>
              {detallada.timeline?.map((t, i) => (
                <div key={i} className={styles.timeEntry}>
                  <div className={styles.timeDot} style={{ background: t.color }}></div>
                  <div className={styles.timeBody}>
                    <div className={styles.timeHeader}>
                      <strong>{t.evento}</strong>
                      <span>{new Date(t.fecha).toLocaleDateString()}</span>
                    </div>
                    <p className={styles.timeDetail}>{t.detalle}</p>
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
