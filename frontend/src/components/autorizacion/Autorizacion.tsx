'use client';
import { useState, useEffect } from 'react';
import styles from './Autorizacion.module.css';

export default function Autorizar() {
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [presupuesto, setPresupuesto] = useState(0);
  const [seleccionada, setSeleccionada] = useState<any>(null);
  const [nuevoMonto, setNuevoMonto] = useState<string>("");
  const [colorManual, setColorManual] = useState<string>("AZUL");
  const [showMsjs, setShowMsjs] = useState(false);

  const colores = ["AZUL", "VERDE", "AMARILLO", "NARANJA", "ROJO"];

  const cargarDatos = async () => {
    try {
      const resP = await fetch('http://localhost:3000/autorizacion/presupuesto');
      const dataP = await resP.json();
      setPresupuesto(dataP?.presupuestoGlobal || 0);

      const resS = await fetch('http://localhost:3000/autorizacion/pendientes');
      const dataS = await resS.json();
      setPendientes(Array.isArray(dataS) ? dataS : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleUpdatePresupuesto = async () => {
    const monto = parseFloat(nuevoMonto);
    if (isNaN(monto)) return;
    await fetch('http://localhost:3000/autorizacion/presupuesto', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monto })
    });
    setNuevoMonto("");
    cargarDatos();
  };

  const handleDecision = async (cotId: number) => {
    // API FUNCIONANDO: Envía ID y Prioridad sin validar saldo localmente
    await fetch(`http://localhost:3000/autorizacion/${seleccionada.id}/decidir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cotizacionId: cotId,
        nuevaPrioridad: colorManual
      })
    });
    setSeleccionada(null);
    cargarDatos();
  };

  const todosLosMensajes = pendientes.flatMap(s =>
    (s.mensajes || []).map((m: any) => ({ ...m, folio: s.folio }))
  );

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>SOLICITUDES</h2>
          <div className={styles.notifWrapper}>
            <button className={styles.bellBtn} onClick={() => setShowMsjs(true)}>
              🔔 {todosLosMensajes.length > 0 && <span className={styles.badge}>{todosLosMensajes.length}</span>}
            </button>
          </div>
        </div>

        <div className={styles.scrollArea}>
          {pendientes.map(sol => (
            <div
              key={sol.id}
              className={`${styles.solCard} ${seleccionada?.id === sol.id ? styles.activeCard : ''}`}
              onClick={() => {
                setSeleccionada(sol);
                setColorManual(sol.prioridad || "AZUL");
              }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.folio}>#{sol.folio}</span>
                <div className={styles.statusDot} style={{ background: `var(--${sol.prioridad?.toLowerCase() || 'azul'})` }} />
              </div>
              <p className={styles.empresaName}>{sol.empresa?.nombre}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <div className={styles.budgetDisplay}>
            <p className={styles.label}>PRESUPUESTO DISPONIBLE</p>
            <h1>${presupuesto.toLocaleString()}</h1>
          </div>
          <div className={styles.budgetActions}>
            <input
              type="number"
              className={styles.montoInput}
              placeholder="Monto..."
              value={nuevoMonto}
              onChange={(e) => setNuevoMonto(e.target.value)}
            />
            <button className={styles.btnActualizar} onClick={handleUpdatePresupuesto}>ACTUALIZAR</button>
          </div>
        </header>

        {seleccionada ? (
          <div className={styles.detailsView}>
            <div className={styles.detailHeader}>
              <div>
                <span className={styles.label}>ESTABLECER SEMÁFORO</span>
                <div className={styles.colorOptions}>
                  {colores.map(c => (
                    <button
                      key={c}
                      className={`${styles.colorBtn} ${colorManual === c ? styles.colorActive : ''}`}
                      style={{ background: `var(--${c.toLowerCase()})` }}
                      onClick={() => setColorManual(c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.cotizacionesGrid}>
              {seleccionada.cotizaciones?.map((cot: any) => (
                <div key={cot.id} className={styles.cotCard}>
                  <div className={styles.cotHeader}>
                    <span>OPCIÓN PROVEEDOR</span>
                    <h2 className={styles.monto}>${cot.monto.toLocaleString()}</h2>
                    <p className={styles.provName}>{cot.proveedor}</p>
                  </div>
                  <div className={styles.cotBody}>
                     <p className={styles.obs}>{cot.observaciones || "Sin observaciones adicionales"}</p>
                  </div>
                  <button onClick={() => handleDecision(cot.id)} className={styles.mainAction}>
                    {cot.monto > presupuesto ? "AUTORIZAR (EXCEDE SALDO)" : "AUTORIZAR PROPUESTA"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📂</div>
            <p>Selecciona una solicitud para gestionar la autorización</p>
          </div>
        )}
      </main>

      {showMsjs && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalMsj}>
            <div className={styles.modalHeader}>
              <h3>HISTORIAL DE MENSAJES</h3>
              <button onClick={() => setShowMsjs(false)} className={styles.btnClose}>&times;</button>
            </div>
            <div className={styles.msjList}>
              {todosLosMensajes.map((m: any, i: number) => (
                <div key={i} className={styles.msjItem}>
                  <span className={styles.msjFolio}>FOLIO #{m.folio}</span>
                  <p>{m.motivo}</p>
                  <small>{new Date(m.fecha).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
