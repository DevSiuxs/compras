'use client';
import { useState, useEffect } from 'react';
import styles from './Almacen.module.css';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';
import { SolicitudAlmacen, AlmacenForm, ItemSolicitud } from '@/types'; // Importación de tipos reales

export default function Almacen() {
  const [pendientes, setPendientes] = useState<SolicitudAlmacen[]>([]); // Sin any
  const [filtroFecha, setFiltroFecha] = useState('');
  const [seleccionada, setSeleccionada] = useState<SolicitudAlmacen | null>(null); // Sin any
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<AlmacenForm>({ nombre: '', apellidoPaterno: '', apellidoMaterno: '' });

  

  const cargarPendientes = async () => {
    try {
      const res = await fetch(ENDPOINTS.ALMACEN.PENDIENTES, { headers: getHeaders() });
      if (res.ok) {
        const data: SolicitudAlmacen[] = await res.json();
        setPendientes(data);
      }
    } catch (e) {
      console.error("Error cargando pendientes", e);
    }
  };

  useEffect(() => { cargarPendientes(); }, []);

  const solicitudesFiltradas = pendientes.filter(s => {
    if (!filtroFecha) return true;
    const fechaSol = new Date(s.fechaCreacion).toISOString().split('T')[0];
    return fechaSol === filtroFecha;
  });

  const handleDecision = async (id: number, decision: 'surtir' | 'no-stock') => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.ALMACEN.PROCESAR(id), {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ decision })
      });

      if (res.ok) {
        alert(decision === 'surtir' ? "¡Material surtido!" : "Enviado a cotización");
        setSeleccionada(null);
        cargarPendientes();
      }
    } catch (e) {
      console.error(e);
      alert("Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const finalizarSurtido = () => {
    // 1. EL FIX: Verificamos que 'seleccionada' no sea null antes de usar su ID
    if (!seleccionada) return;

    if(!form.nombre || !form.apellidoPaterno) {
      alert("Por favor, ingresa quién recibe el material");
      return;
    }
    handleDecision(seleccionada.id, 'surtir');
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.headerSidebar}>
          <h2 className={styles.azulClaro}>ALMACÉN</h2>
          <p className={styles.subtext}>PENDIENTES DE SURTIDO</p>
          <input
            type="date"
            className={styles.dateFilter}
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
        </div>
        <div className={styles.scrollArea}>
          {solicitudesFiltradas.map((s) => (
            <div
              key={s.id}
              className={`${styles.cardSolicitud} ${seleccionada?.id === s.id ? styles.activeCard : ''}`}
              onClick={() => setSeleccionada(s)}
            >
              <div className={styles.folioRow}>
                <span className={styles.folio}>{s.folio}</span>
                <span className={styles.statusBadge}>{s.status}</span>
              </div>
              <div className={styles.empresaName}>{s.empresa?.nombre}</div>
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.mainContent}>
        {seleccionada ? (
          <div className={styles.detalleContainer}>
            <div className={styles.infoBox}>
              <h1 className={styles.azulClaro}>DETALLE DE SOLICITUD</h1>
              <p><strong>JUSTIFICACIÓN:</strong> {seleccionada.justificacion}</p>
              <div className={styles.itemsList}>
                {seleccionada.items?.map((item: any) => (
                  <div key={item.id} className={styles.itemRow}>
                    📦 {item.cantidad} {item.unidad?.nombre} - {item.descripcion}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.actionsGrid}>
              <div className={styles.formEntrega}>
                <h3 className={styles.azulClaro}>SI HAY STOCK - REGISTRAR ENTREGA</h3>
                <input
                  placeholder="Nombre de quien recibe"
                  value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                />
                <div className={styles.rowInputs}>
                  <input
                    placeholder="A. Paterno"
                    value={form.apellidoPaterno}
                    onChange={e => setForm({...form, apellidoPaterno: e.target.value})}
                  />
                  <input
                    placeholder="A. Materno"
                    value={form.apellidoMaterno}
                    onChange={e => setForm({...form, apellidoMaterno: e.target.value})}
                  />
                </div>
                <button
                  className={styles.btnSurtir}
                  onClick={finalizarSurtido}
                  disabled={loading}
                >
                  {loading ? 'PROCESANDO...' : 'SURTIR Y FINALIZAR'}
                </button>
              </div>

              <div className={styles.noStockZone}>
                <p>¿No cuentas con el material?</p>
                <button
                  className={styles.btnNoStock}
                  onClick={() => handleDecision(seleccionada.id, 'no-stock')}
                  disabled={loading}
                >
                  ENVIAR A COTIZACIÓN
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.placeholderMain}>
            <div className={styles.radarIcon}>📡</div>
            <h2>Selecciona una solicitud para procesar</h2>
          </div>
        )}
      </main>
    </div>
  );
}
