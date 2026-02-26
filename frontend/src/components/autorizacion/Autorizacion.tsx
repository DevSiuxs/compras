'use client';
import { useState, useEffect, useCallback } from 'react';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';
import { SolicitudAutorizable, PrioridadColor } from '@/types';
import styles from './Autorizacion.module.css';

export default function AutorizarPage() {
  const [pendientes, setPendientes] = useState<SolicitudAutorizable[]>([]);
  const [presupuesto, setPresupuesto] = useState<number>(0);
  const [seleccionada, setSeleccionada] = useState<SolicitudAutorizable | null>(null);
  const [nuevoMonto, setNuevoMonto] = useState<string>("");
  const [prioridadManual, setPrioridadManual] = useState<PrioridadColor>("AZUL");
  const [loading, setLoading] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      const headers = getHeaders();
      const [resP, resS] = await Promise.all([
        fetch(ENDPOINTS.AUTORIZACION.PRESUPUESTO, { headers }),
        fetch(ENDPOINTS.AUTORIZACION.PENDIENTES, { headers })
      ]);

      if (resP.ok) {
        const dataP = await resP.json();
        setPresupuesto(dataP?.presupuestoGlobal || 0);
      }

      if (resS.ok) {
        const dataS = await resS.json();
        setPendientes(Array.isArray(dataS) ? dataS : []);
      }
    } catch (e) {
      console.error("Error cargando datos de autorización:", e);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleDecision = async (cotizacionId: number) => {
    if (!seleccionada) return;
    setLoading(true);

    try {
      const res = await fetch(ENDPOINTS.AUTORIZACION.DECIDIR(seleccionada.id), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          cotizacionId,
          nuevaPrioridad: prioridadManual
        })
      });

      if (res.ok) {
        alert("Solicitud autorizada y enviada a Compras");
        setSeleccionada(null);
        cargarDatos();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePresupuesto = async () => {
    const monto = parseFloat(nuevoMonto);
    if (isNaN(monto)) return;

    try {
      const res = await fetch(ENDPOINTS.AUTORIZACION.PRESUPUESTO, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ monto })
      });
      if (res.ok) {
        setPresupuesto(monto);
        setNuevoMonto("");
        alert("Presupuesto actualizado");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.budgetCard}>
          <small>PRESUPUESTO GLOBAL</small>
          <h2>${presupuesto.toLocaleString()}</h2>
          <div className={styles.updateGroup}>
            <input
              type="number"
              value={nuevoMonto}
              onChange={e => setNuevoMonto(e.target.value)}
              placeholder="Nuevo monto"
            />
            <button onClick={handleUpdatePresupuesto}>Actualizar</button>
          </div>
        </div>

        <div className={styles.list}>
          <h3>PENDIENTES ({pendientes.length})</h3>
          {pendientes.map(sol => (
            <div
              key={sol.id}
              className={`${styles.solCard} ${seleccionada?.id === sol.id ? styles.active : ''}`}
              onClick={() => setSeleccionada(sol)}
            >
              <div className={styles.solHeader}>
                <span className={styles.folio}>{sol.folio}</span>
                <span className={styles.prioridadBadge} style={{backgroundColor: sol.prioridad}} />
              </div>
              <p>{sol.empresa?.nombre}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.main}>
        {seleccionada ? (
          <div className={styles.detailContainer}>
            <div className={styles.topHeader}>
              <h1>Gestión de Autorización: {seleccionada.folio}</h1>
              <select
                value={prioridadManual}
                onChange={e => setPrioridadManual(e.target.value as PrioridadColor)}
              >
                <option value="AZUL">Prioridad: Azul</option>
                <option value="VERDE">Prioridad: Verde</option>
                <option value="AMARILLO">Prioridad: Amarillo</option>
                <option value="NARANJA">Prioridad: Naranja</option>
                <option value="ROJO">Prioridad: Rojo</option>
              </select>
            </div>

            <div className={styles.cotizacionesGrid}>
              {seleccionada.cotizaciones.map((cot) => (
                <div key={cot.id} className={styles.cotCard}>
                  <div className={styles.cotHeader}>
                    <h4>{cot.proveedor}</h4>
                    <span className={styles.monto}>${cot.monto.toLocaleString()}</span>
                  </div>
                  <p><strong>Cotizó:</strong> {cot.quienCotizo}</p>
                  <p><strong>Notas:</strong> {cot.observaciones}</p>

                  <button
                    className={styles.btnAutorizar}
                    disabled={loading}
                    onClick={() => handleDecision(cot.id)}
                  >
                    {cot.monto > presupuesto ? "AUTORIZAR (SOBREPASA SALDO)" : "AUTORIZAR ESTA OPCIÓN"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.empty}>Selecciona una solicitud para revisar cotizaciones</div>
        )}
      </main>
    </div>
  );
}
