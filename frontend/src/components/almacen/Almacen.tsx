'use client';
import { useState, useEffect } from 'react';
import styles from './Almacen.module.css';

export default function Almacen() {
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [seleccionada, setSeleccionada] = useState<any>(null);
  const [form, setForm] = useState({ nombre: '', apellidoPaterno: '', apellidoMaterno: '' });

  const cargarPendientes = async () => {
    try {
      const res = await fetch('http://localhost:3000/almacen/pendientes');
      if (res.ok) {
        const data = await res.json();
        setPendientes(data);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { cargarPendientes(); }, []);

  // Función para filtrar por fecha en el frontend
  const solicitudesFiltradas = pendientes.filter(s => {
    if (!filtroFecha) return true;
    const fechaSol = new Date(s.fechaCreacion).toISOString().split('T')[0];
    return fechaSol === filtroFecha;
  });

  const handleDecision = async (id: number, decision: 'surtir' | 'no-stock') => {
    if (decision === 'no-stock') {
      await fetch(`http://localhost:3000/almacen/${id}/procesar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'no-stock' })
      });
      setSeleccionada(null);
      cargarPendientes();
    }
  };

  const finalizarSurtido = async () => {
    if (!seleccionada) return; // Seguridad contra el error de null
    const res = await fetch(`http://localhost:3000/recepcion/${seleccionada.id}/entregar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      alert("✅ Surtido finalizado con éxito.");
      setSeleccionada(null);
      cargarPendientes();
    }
  };

  return (
    <div className={styles.container}>
      {/* PANEL IZQUIERDO: NUEVAS SOLICITUDES */}
      <aside className={styles.sidebar}>
        <div className={styles.headerSidebar}>
          <h2 className={styles.azulClaro}>SOLICITUDES</h2>
          <p className={styles.subtext}>POR REVISAR</p>
        </div>
        <div className={styles.scrollArea}>
          {solicitudesFiltradas.map((sol: any) => (
            <div
              key={sol.id}
              className={`${styles.cardSolicitud} ${seleccionada?.id === sol.id ? styles.cardActive : ''}`}
              onClick={() => setSeleccionada(sol)}
            >
              <span className={styles.folio}>{sol.folio}</span>
              <h4>{sol.area?.nombre || 'Sin Área'}</h4>
              <p className={styles.fechaCard}>{new Date(sol.fechaCreacion).toLocaleDateString()}</p>
            </div>
          ))}
          {solicitudesFiltradas.length === 0 && <p className={styles.emptyMsg}>No hay peticiones</p>}
        </div>
      </aside>

      {/* PANEL DERECHO: FILTRADO Y ACCIONES */}
      <main className={styles.mainPanel}>
        <div className={styles.topBar}>
          <div className={styles.filterGroup}>
            <label>FILTRAR POR FECHA RECIBIDA:</label>
            <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
          </div>
          <h3 className={styles.azulClaro}>GESTIÓN DE STOCK</h3>
        </div>

        {seleccionada ? (
          <div className={styles.detalleContainer}>
            <div className={styles.headerDetalle}>
              <h1>FOLIO: {seleccionada.folio}</h1>
              <p>{seleccionada.empresa?.nombre}</p>
            </div>

            <div className={styles.infoBox}>
              <p><strong>Justificación:</strong> {seleccionada.justificacion}</p>
              <div className={styles.itemsList}>
                {seleccionada.items?.map((item: any, i: number) => (
                  <div key={i} className={styles.itemRow}>
                    • {item.cantidad} {item.unidad?.nombre} - {item.descripcion}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.actionsGrid}>
              <div className={styles.formEntrega}>
                <h3 className={styles.azulClaro}>SI HAY STOCK - REGISTRAR ENTREGA</h3>
                <input placeholder="Nombre de quien recibe" onChange={e => setForm({...form, nombre: e.target.value})} />
                <div className={styles.rowInputs}>
                  <input placeholder="A. Paterno" onChange={e => setForm({...form, apellidoPaterno: e.target.value})} />
                  <input placeholder="A. Materno" onChange={e => setForm({...form, apellidoMaterno: e.target.value})} />
                </div>
                <button className={styles.btnSurtir} onClick={finalizarSurtido}>SURTIR Y FINALIZAR</button>
              </div>

              <div className={styles.noStockZone}>
                <p>¿No cuentas con el material?</p>
                <button className={styles.btnNoStock} onClick={() => handleDecision(seleccionada.id, 'no-stock')}>
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
