'use client';
import { useState, useEffect, useCallback } from 'react';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';
import { SolicitudCotizable, CotizacionPropuesta, CreateCotizacionesDTO } from '@/types';
import styles from './Cotizacion.module.css';

export default function CotizacionPage() {
  const [pendientes, setPendientes] = useState<SolicitudCotizable[]>([]);
  const [seleccionado, setSeleccionado] = useState<SolicitudCotizable | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para las 2 propuestas obligatorias
  const [pA, setPA] = useState<CotizacionPropuesta>({ proveedor: '', monto: 0, quien: '', obs: '' });
  const [pB, setPB] = useState<CotizacionPropuesta>({ proveedor: '', monto: 0, quien: '', obs: '' });

  const cargarPendientes = useCallback(async () => {
    try {
      const res = await fetch(ENDPOINTS.COTIZACION.PENDIENTES, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data: SolicitudCotizable[] = await res.json();
        setPendientes(data);
      }
    } catch (error) {
      console.error("Error al cargar pendientes:", error);
    }
  }, []);

  useEffect(() => {
    cargarPendientes();
  }, [cargarPendientes]);

  const handleEnviar = async () => {
    if (!seleccionado) return;

    if (!pA.proveedor || !pB.proveedor || pA.monto <= 0 || pB.monto <= 0) {
      alert('⚠️ Ambas propuestas deben tener Proveedor y Monto.');
      return;
    }

    setLoading(true);
    const payload: CreateCotizacionesDTO = {
      c1_proveedor: pA.proveedor,
      c1_monto: pA.monto,
      c1_quien: pA.quien,
      c1_observaciones: pA.obs,
      c2_proveedor: pB.proveedor,
      c2_monto: pB.monto,
      c2_quien: pB.quien,
      c2_observaciones: pB.obs,
    };

    try {
      const res = await fetch(ENDPOINTS.COTIZACION.REGISTRAR(seleccionado.id), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Cotizaciones registradas. Pasa a Autorización.");
        setSeleccionado(null);
        cargarPendientes();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>SOLICITUDES POR COTIZAR</h2>
        {pendientes.map(sol => (
          <div
            key={sol.id}
            className={`${styles.card} ${seleccionado?.id === sol.id ? styles.active : ''}`}
            onClick={() => setSeleccionado(sol)}
          >
            <p><strong>{sol.folio}</strong></p>
            <p>{sol.empresa?.nombre}</p>
          </div>
        ))}
      </aside>

      <main className={styles.content}>
        {seleccionado ? (
          <>
            <div className={styles.headerInfo}>
              <h3>Cotizando Folio: {seleccionado.folio}</h3>
              <p>Justificación: {seleccionado.justificacion}</p>
            </div>

            <div className={styles.gridPropuestas}>
              {/* PROPUESTA A */}
              <div className={styles.propBox}>
                <h4>PROPUESTA A</h4>
                <input placeholder="Proveedor" value={pA.proveedor} onChange={e => setPA({...pA, proveedor: e.target.value})} />
                <input type="number" placeholder="Monto" onChange={e => setPA({...pA, monto: Number(e.target.value)})} />
                <input placeholder="¿Quién cotizó?" value={pA.quien} onChange={e => setPA({...pA, quien: e.target.value})} />
                <textarea placeholder="Observaciones" value={pA.obs} onChange={e => setPA({...pA, obs: e.target.value})} />
              </div>

              {/* PROPUESTA B */}
              <div className={styles.propBox}>
                <h4>PROPUESTA B</h4>
                <input placeholder="Proveedor" value={pB.proveedor} onChange={e => setPB({...pB, proveedor: e.target.value})} />
                <input type="number" placeholder="Monto" onChange={e => setPB({...pB, monto: Number(e.target.value)})} />
                <input placeholder="¿Quién cotizó?" value={pB.quien} onChange={e => setPB({...pB, quien: e.target.value})} />
                <textarea placeholder="Observaciones" value={pB.obs} onChange={e => setPB({...pB, obs: e.target.value})} />
              </div>
            </div>

            <button
              className={styles.btnSubmit}
              onClick={handleEnviar}
              disabled={loading}
            >
              {loading ? 'ENVIANDO...' : 'REGISTRAR COTIZACIONES'}
            </button>
          </>
        ) : (
          <p>Selecciona una solicitud de la izquierda</p>
        )}
      </main>
    </div>
  );
}
