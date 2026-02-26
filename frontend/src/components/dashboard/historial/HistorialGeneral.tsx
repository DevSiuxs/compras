'use client';
import { useState, useEffect, useMemo } from 'react';
import styles from '../Dashboard.module.css';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';
import { Solicitud, TimelineEntry } from '@/types';

// Definimos interfaces específicas para las respuestas de este módulo
interface DashboardReportResponse {
  solicitudes?: Solicitud[];
  recientes?: Solicitud[];
}

interface TrazabilidadResponse {
  folio: string;
  empresa?: {
    nombre: string;
  };
  timeline: TimelineEntry[];
}

export default function HistorialGeneral() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [detallada, setDetallada] = useState<TrazabilidadResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ESTADOS PARA LOS FILTROS
  const [filtroFecha, setFiltroFecha] = useState<string>('');
  const [filtroFolio, setFiltroFolio] = useState<string>('');

  // Tipado estricto para el mapeo de colores por estado
  const STATUS_COLORS: Record<string, string> = {
    SOLICITADO: '#0070f3',
    COTIZANDO: '#7928ca',
    AUTORIZAR: '#ffca28',
    COMPRAR: '#ff0080',
    RECIBIDO: '#00ff41',
    ENTREGADO: '#00ff41',
    PAGADO: '#00ff41'
  };

  useEffect(() => {
    // Usamos ENDPOINTS y enviamos el Token de privilegios
    fetch(ENDPOINTS.REPORTES.DASHBOARD, {
      headers: getHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener el historial');
        return res.json();
      })
      .then((data: DashboardReportResponse) => {
        const lista = data.solicitudes || data.recientes || [];
        setSolicitudes(lista);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando historial:", err);
        setLoading(false);
      });
  }, []);

  const verTrazabilidad = (id: number) => {
    fetch(ENDPOINTS.REPORTES.TRAZABILIDAD(id), {
      headers: getHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener trazabilidad');
        return res.json();
      })
      .then((d: TrazabilidadResponse) => setDetallada(d))
      .catch(err => console.error("Error en detalle:", err));
  };

  // LÓGICA DE FILTRADO: Por fecha y por Número de Folio
  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter((s: Solicitud) => {
      const coincideFecha = filtroFecha ? s.fechaCreacion.includes(filtroFecha) : true;
      const coincideFolio = filtroFolio ? s.folio.toLowerCase().includes(filtroFolio.toLowerCase()) : true;
      return coincideFecha && coincideFolio;
    });
  }, [solicitudes, filtroFecha, filtroFolio]);

  if (loading) return <div className={styles.loading}>Sincronizando Historial...</div>;

  return (
    <div className={styles.main} style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: '#0070f3', letterSpacing: '2px', fontSize: '14px', margin: 0 }}>
            HISTORIAL DE OPERACIONES
          </h2>
          <p style={{ color: '#444', fontSize: '11px' }}>{solicitudesFiltradas.length} resultados encontrados</p>
        </div>

        {/* CONTENEDOR DE FILTROS */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={styles.filterGroup}>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              style={{ background: '#0d0d0d', border: '1px solid #222', color: '#fff', padding: '0.6rem', borderRadius: '8px' }}
            />
          </div>
          <div className={styles.filterGroup}>
            <input
              type="text"
              placeholder="Buscar Folio (ej: 001)"
              value={filtroFolio}
              onChange={(e) => setFiltroFolio(e.target.value)}
              style={{ background: '#0d0d0d', border: '1px solid #222', color: '#fff', padding: '0.6rem', borderRadius: '8px', width: '200px' }}
            />
          </div>
        </div>
      </header>

      <section className={styles.tableCard} style={{ background: '#0d0d0d', borderRadius: '15px', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead>
            <tr style={{ background: '#111' }}>
              <th style={{ padding: '1.2rem' }}>FOLIO</th>
              <th>EMPRESA</th>
              <th>FECHA</th>
              <th>ESTADO</th>
              <th style={{ textAlign: 'right' }}>MONTO</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {solicitudesFiltradas.length > 0 ? (
              solicitudesFiltradas.map((sol: Solicitud) => (
                <tr key={sol.id} className={styles.row}>
                  <td className={styles.folio} style={{ fontWeight: 'bold', color: '#0070f3' }}>{sol.folio}</td>
                  <td>{sol.empresa?.nombre || 'N/A'}</td>
                  <td className={styles.date}>{new Date(sol.fechaCreacion).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        background: `${STATUS_COLORS[sol.status] || '#222'}22`,
                        color: STATUS_COLORS[sol.status] || '#888',
                        borderColor: STATUS_COLORS[sol.status] || '#333',
                        padding: '4px 8px', borderRadius: '5px', fontSize: '10px', border: '1px solid'
                      }}
                    >
                      {sol.status}
                    </span>
                  </td>
                  <td className={styles.price} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    ${(sol.montoFinal || 0).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className={styles.btnTrace} onClick={() => verTrazabilidad(sol.id)}>
                      Detalles
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#444' }}>
                  No se encontraron registros con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* MODAL DE TRAZABILIDAD */}
      {detallada && (
        <div className={styles.overlay} onClick={() => setDetallada(null)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setDetallada(null)}>×</button>
            <h2 style={{ color: '#0070f3' }}>TRAZABILIDAD</h2>
            <p style={{ marginBottom: '2rem' }}>{detallada.folio} | {detallada.empresa?.nombre}</p>

            <div className={styles.timeline}>
              {detallada.timeline?.map((t: TimelineEntry, i: number) => (
                <div key={i} className={styles.timeEntry}>
                  <div className={styles.timeDot} style={{ background: t.color }}></div>
                  <div className={styles.timeBody}>
                    <div className={styles.timeHeader}>
                      <strong>{t.evento}</strong>
                      <span>{new Date(t.fecha).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#888' }}>{t.detalle}</p>
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
