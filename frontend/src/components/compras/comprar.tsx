'use client';
import { useState, useEffect } from 'react';
import styles from './comprar.module.css';

export default function Comprar() {
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [presupuesto, setPresupuesto] = useState(0);
  const [seleccionada, setSeleccionada] = useState<any>(null);
  const [mostrarModalMensaje, setMostrarModalMensaje] = useState(false);
  const [motivoMensaje, setMotivoMensaje] = useState('');

  // Prioridad: ROJO(5) > NARANJA(4) > AMARILLO(3) > VERDE(2) > AZUL(1)
  const COLORES_PRIORIDAD: any = { ROJO: 5, NARANJA: 4, AMARILLO: 3, VERDE: 2, AZUL: 1 };

  const cargarDatos = async () => {
    try {
      const resP = await fetch('http://localhost:3000/autorizacion/presupuesto');
      const dataP = await resP.json();
      setPresupuesto(dataP?.presupuestoGlobal || 0);

      const resS = await fetch('http://localhost:3000/compras/pendientes');
      const dataS = await resS.json();

      const ordenados = dataS.sort((a: any, b: any) => {
        const pA = COLORES_PRIORIDAD[a.prioridad] || 0;
        const pB = COLORES_PRIORIDAD[b.prioridad] || 0;
        if (pB !== pA) return pB - pA;
        return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime();
      });
      setPendientes(ordenados);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleComprar = async (id: number) => {
    // API ejecutando compra (resta saldo en el backend)
    const res = await fetch(`http://localhost:3000/compras/${id}/ejecutar`, { method: 'POST' });
    if (res.ok) {
      setSeleccionada(null);
      cargarDatos();
    } else {
      const err = await res.json();
      alert(err.message || "Error al procesar el pago");
    }
  };

  const enviarMensaje = async () => {
    if (!motivoMensaje) return;
    await fetch(`http://localhost:3000/compras/${seleccionada.id}/notificar-presupuesto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo: motivoMensaje })
    });
    setMostrarModalMensaje(false);
    setMotivoMensaje('');
    setSeleccionada(null);
    cargarDatos();
  };

  const cotizacion = seleccionada?.cotizaciones?.find((c: any) => c.seleccionada);

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <p className={styles.miniTag}>PAGOS PENDIENTES</p>
          <h2>CENTRAL DE COMPRAS</h2>
        </div>

        <div className={styles.budgetCard}>
          <span className={styles.label}>SALDO GLOBAL</span>
          <p className={styles.blueValue}>${presupuesto.toLocaleString()}</p>
        </div>

        <div className={styles.scrollArea}>
          {pendientes.map(sol => (
            <div
              key={sol.id}
              className={`${styles.solCard} ${seleccionada?.id === sol.id ? styles.activeCard : ''}`}
              onClick={() => setSeleccionada(sol)}
            >
              <div className={styles.cardInfo}>
                <span className={styles.folio}>#{sol.folio}</span>
                <p className={styles.empresa}>{sol.empresa?.nombre}</p>
              </div>
              <div className={styles.priorityDot} style={{ background: `var(--${sol.prioridad?.toLowerCase()})` }} />
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.mainContent}>
        {seleccionada && cotizacion ? (
          <div className={styles.detailView}>
            <header className={styles.detailHeader}>
              <div className={styles.headerInfo}>
                <div className={styles.priorityLabel} style={{ borderColor: `var(--${seleccionada.prioridad?.toLowerCase()})`, color: `var(--${seleccionada.prioridad?.toLowerCase()})` }}>
                  URGENCIA: {seleccionada.prioridad}
                </div>
                <h1>Solicitud #{seleccionada.folio}</h1>
              </div>
              <div className={styles.provInfo}>
                <span className={styles.label}>PROVEEDOR ADJUDICADO</span>
                <p>{cotizacion.proveedor}</p>
              </div>
            </header>

            <div className={styles.contentGrid}>
              <section className={styles.itemsSection}>
                <h3>LISTA DE ARTÍCULOS</h3>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                    <thead>
                        <tr>
                        <th>Cant.</th>
                        <th>Descripción</th>
                        <th>Unidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seleccionada.items?.map((item: any, i: number) => (
                        <tr key={i}>
                            <td className={styles.bold}>{item.cantidad}</td>
                            <td>{item.descripcion}</td>
                            <td>{item.unidad?.nombre}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              </section>

              <section className={styles.paymentSection}>
                <div className={styles.totalCard}>
                  <span className={styles.label}>MONTO A DISPERSAR</span>
                  <p className={styles.totalAmount}>${cotizacion.monto.toLocaleString()}</p>
                  <div className={styles.divider} />
                  <p className={styles.obs}>{cotizacion.observaciones || 'Sin observaciones de autorización'}</p>
                </div>

                <div className={styles.actions}>
                  {/* BOTÓN SIEMPRE HABILITADO - SOLO CAMBIA EL TEXTO SEGÚN SALDO */}
                  <button
                    className={`${styles.btnConfirm} ${cotizacion.monto > presupuesto ? styles.btnWarning : ''}`}
                    onClick={() => handleComprar(seleccionada.id)}
                  >
                    {cotizacion.monto > presupuesto ? "AUTORIZAR PAGO (SIN SALDO)" : "CONFIRMAR Y PAGAR"}
                  </button>

                  <button
                    className={styles.btnMensaje}
                    onClick={() => setMostrarModalMensaje(true)}
                  >
                    NOTIFICAR INCIDENCIA / FALTA SALDO
                  </button>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.scanline} />
            <p>TERMINAL DE PAGOS LISTA</p>
          </div>
        )}
      </main>

      {mostrarModalMensaje && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>NOTIFICACIÓN DE COMPRAS</h3>
            <p className={styles.label}>Motivo del reporte para autorización:</p>
            <textarea
              value={motivoMensaje}
              onChange={(e) => setMotivoMensaje(e.target.value)}
              placeholder="Ej. El proveedor no tiene stock o el presupuesto es insuficiente..."
            />
            <div className={styles.modalActions}>
              <button onClick={enviarMensaje} className={styles.btnSend}>ENVIAR MENSAJE</button>
              <button onClick={() => setMostrarModalMensaje(false)} className={styles.btnCancel}>VOLVER</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
