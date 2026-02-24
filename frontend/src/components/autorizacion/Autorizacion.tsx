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

  // --- LÓGICA DE MENSAJES ---
  const todosLosMensajes = pendientes.flatMap(sol =>
    (sol.mensajes || []).map((m: any) => ({ ...m, folio: sol.folio, solCompleta: sol }))
  );

  const noLeidos = todosLosMensajes.filter(m => !m.leido).length;
  const leidos = todosLosMensajes.filter(m => m.leido).length;

  const handleDecision = async (cotId: number, monto: number) => {
    if (monto > presupuesto) return alert("⚠️ Saldo Insuficiente");
    const res = await fetch(`http://localhost:3000/autorizacion/${seleccionada.id}/decidir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cotizacionId: cotId, nuevaPrioridad: colorManual, resetColor: true })
    });
    if (res.ok) {
      alert("✅ Solicitud Enviada a Compras");
      setSeleccionada(null);
      cargarDatos();
    }
  };

  const actualizarPresupuesto = async () => {
    const res = await fetch('http://localhost:3000/autorizacion/presupuesto', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monto: Number(nuevoMonto) })
    });
    if (res.ok) {
      alert("💰 Presupuesto Actualizado");
      setNuevoMonto("");
      cargarDatos();
    }
  };

  const handleToggleMsjs = () => {
    const abriendo = !showMsjs;
    setShowMsjs(abriendo);
    // Marcamos como leídos localmente al cerrar para limpiar la campana
    if (!abriendo) {
       setPendientes(prev => prev.map(sol => ({
        ...sol,
        mensajes: sol.mensajes?.map((m: any) => ({ ...m, leido: true }))
      })));
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>PENDIENTES</h2>
          <div className={styles.notifWrapper}>
            <button className={styles.bellBtn} onClick={handleToggleMsjs}>
              🔔 {noLeidos > 0 && <span className={styles.badgeCount}>{noLeidos}</span>}
            </button>
            {showMsjs && (
              <div className={styles.msgDropdown}>
                <div className={styles.msgStats}>
                  <span className={styles.statNew}>Nuevos: {noLeidos}</span>
                  <span className={styles.statOld}>Leídos: {leidos}</span>
                </div>
                <div className={styles.msgScroll}>
                  {todosLosMensajes.length === 0 ? (
                    <p className={styles.emptyMsg}>Sin mensajes</p>
                  ) : (
                    todosLosMensajes.map((m: any, idx: number) => (
                      <div
                        key={idx}
                        className={`${styles.msgItem} ${!m.leido ? styles.unread : styles.read}`}
                        onClick={() => { setSeleccionada(m.solCompleta); setShowMsjs(false); }}
                      >
                        <span className={styles.msgFolio}>{m.folio}</span>
                        <p>{m.motivo}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.solList}>
          {pendientes.map(sol => (
            <div
              key={sol.id}
              className={`${styles.solCard} ${seleccionada?.id === sol.id ? styles.active : ''}`}
              onClick={() => setSeleccionada(sol)}
            >
              <div className={styles.cardInfo}>
                <span className={styles.folioText}>{sol.folio}</span>
                <span className={styles.empresaText}>{sol.empresa?.nombre}</span>
              </div>
              {sol.mensajes?.some((m: any) => !m.leido) && <span className={styles.blueDot}></span>}
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.main}>
        {seleccionada ? (
          <div className={styles.contentArea}>
            <header className={styles.header}>
              <div className={styles.headerTitle}>
                <h1>Folio: {seleccionada.folio}</h1>
                <p>{seleccionada.empresa?.nombre} | {seleccionada.area}</p>
              </div>
              <div className={styles.budgetControl}>
                <p>SALDO GLOBAL: <span>${presupuesto.toLocaleString()}</span></p>
                <div className={styles.inputGroup}>
                  <input
                    type="number"
                    value={nuevoMonto}
                    onChange={(e) => setNuevoMonto(e.target.value)}
                    placeholder="Ajustar..."
                  />
                  <button onClick={actualizarPresupuesto}>AJUSTAR</button>
                </div>
              </div>
            </header>

            <section className={styles.itemsSection}>
              <h3 className={styles.sectionTitle}>CONCEPTOS DE LA SOLICITUD</h3>
              <div className={styles.itemsGrid}>
                {seleccionada.items?.map((it: any) => (
                  <div key={it.id} className={styles.itemCard}>
                    <span className={styles.itemQty}>{it.cantidad} {it.unidad?.nombre || 'PZ'}</span>
                    <p className={styles.itemDesc}>{it.descripcion}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.colorSelector}>
              <span className={styles.label}>SELECCIONAR PRIORIDAD:</span>
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
            </section>

            <div className={styles.cotizacionesGrid}>
              {seleccionada.cotizaciones?.map((cot: any) => (
                <div key={cot.id} className={`${styles.cotCard} ${cot.monto > presupuesto ? styles.locked : ''}`}>
                  <div className={styles.cotHeader}>
                    <span>PROVEEDOR: {cot.proveedor}</span>
                    <p className={styles.monto}>${cot.monto.toLocaleString()}</p>
                  </div>
                  <div className={styles.cotBody}>
                    <p><strong>Cotizó:</strong> {cot.quienCotizo}</p>
                    <p><strong>Notas:</strong> {cot.observaciones || "Sin observaciones"}</p>
                  </div>
                  <button
                    disabled={cot.monto > presupuesto}
                    onClick={() => handleDecision(cot.id, cot.monto)}
                    className={styles.mainAction}
                  >
                    {cot.monto > presupuesto ? "BLOQUEADO POR SALDO" : `AUTORIZAR`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.empty}>Seleccione una solicitud para revisar detalles</div>
        )}
      </main>
    </div>
  );
}
