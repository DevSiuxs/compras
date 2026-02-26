'use client';
import { useState, useEffect } from 'react';
import styles from './Cotizacion.module.css';
// Importación corregida basada en tus archivos de tipos
import { ItemSolicitud, Solicitud,CreateCotizacionesDTO } from '@/types';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';

export default function Cotizacion() {
  // Se usa 'Solicitud' que es el tipo real en tu index.ts
  const [pendientes, setPendientes] = useState<Solicitud[]>([]);
  const [seleccionado, setSeleccionado] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(false);

  const [pA, setPA] = useState({ proveedor: '', monto: 0, quien: '', obs: '' });
  const [pB, setPB] = useState({ proveedor: '', monto: 0, quien: '', obs: '' });

  const cargarPendientes = async () => {
    try {
      const res = await fetch(ENDPOINTS.COTIZACION.PENDIENTES, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data: Solicitud[] = await res.json();
        setPendientes(data);
      }
    } catch (error) {
      console.error("Error al cargar pendientes de cotización", error);
    }
  };

  useEffect(() => {
    cargarPendientes();
  }, []);

  const handleEnviar = async () => {
    if (!seleccionado) return;
    if (!pA.proveedor || !pB.proveedor || pA.monto <= 0 || pB.monto <= 0) {
      return alert('⚠️ Ambas propuestas deben tener al menos Proveedor y Monto.');
    }

    setLoading(true);
    // Se usa 'CreateCotizacionesDto' que es el tipo esperado por tu backend
    const payload: CreateCotizacionesDTO = {
      c1_proveedor: pA.proveedor,
      c1_monto: Number(pA.monto),
      c1_quien: pA.quien,
      c1_observaciones: pA.obs,
      c2_proveedor: pB.proveedor,
      c2_monto: Number(pB.monto),
      c2_quien: pB.quien,
      c2_observaciones: pB.obs,
    };

    try {
      const res = await fetch(ENDPOINTS.COTIZACION.REGISTRAR(seleccionado.id), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('✅ Cotizaciones registradas correctamente.');
        setSeleccionado(null);
        setPA({ proveedor: '', monto: 0, quien: '', obs: '' });
        setPB({ proveedor: '', monto: 0, quien: '', obs: '' });
        cargarPendientes();
      }
    } catch (error) {
      console.error(error);
      alert('❌ Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.listSide}>
        <h2 className="text-cyan-400 font-bold mb-4">COTIZACIÓN</h2>
        {pendientes.map((s) => (
          <div
            key={s.id}
            className={`${styles.solCard} ${seleccionado?.id === s.id ? styles.solCardActive : ''}`}
            onClick={() => setSeleccionado(s)}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono">{s.folio}</span>
              <span className="text-[9px] bg-yellow-900 text-yellow-200 px-2 py-0.5 rounded">{s.status}</span>
            </div>
            <div className="text-xs mt-2 text-gray-400">{s.empresa?.nombre}</div>
          </div>
        ))}
      </aside>

      <main className={styles.formSide}>
        {seleccionado ? (
          <>
            <div className={styles.header}>
              <h1 className="text-xl font-bold text-white mb-2">SOLICITUD: {seleccionado.folio}</h1>
              <p className="text-sm text-gray-400 italic">"{seleccionado.justificacion}"</p>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>CANTIDAD</th>
                  <th>DESCRIPCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {seleccionado.items?.map((item: ItemSolicitud) => (
                  <tr key={item.id}>
                    <td>{item.cantidad} {item.unidad?.nombre}</td>
                    <td>{item.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.gridProps}>
              <div className={styles.propBox}>
                <p className="text-[10px] text-cyan-400 mb-4 tracking-tighter">PROPUESTA A</p>
                <div className="flex flex-col gap-3">
                  <input className={styles.input} placeholder="Proveedor" value={pA.proveedor} onChange={e => setPA({...pA, proveedor: e.target.value})} />
                  <input type="number" className={styles.input} placeholder="Monto" value={pA.monto || ''} onChange={e => setPA({...pA, monto: Number(e.target.value)})} />
                  <input className={styles.input} placeholder="¿Quién cotizó?" value={pA.quien} onChange={e => setPA({...pA, quien: e.target.value})} />
                  <textarea className={styles.textarea} placeholder="Observaciones" value={pA.obs} onChange={e => setPA({...pA, obs: e.target.value})} />
                </div>
              </div>

              <div className={styles.propBox}>
                <p className="text-[10px] text-gray-500 mb-4 tracking-tighter">PROPUESTA B</p>
                <div className="flex flex-col gap-3">
                  <input className={styles.input} placeholder="Proveedor" value={pB.proveedor} onChange={e => setPB({...pB, proveedor: e.target.value})} />
                  <input type="number" className={styles.input} placeholder="Monto" value={pB.monto || ''} onChange={e => setPB({...pB, monto: Number(e.target.value)})} />
                  <input className={styles.input} placeholder="¿Quién cotizó?" value={pB.quien} onChange={e => setPB({...pB, quien: e.target.value})} />
                  <textarea className={styles.textarea} placeholder="Observaciones" value={pB.obs} onChange={e => setPB({...pB, obs: e.target.value})} />
                </div>
              </div>
            </div>

            <button
              className={styles.btnSubmit}
              onClick={handleEnviar}
              disabled={loading}
            >
              {loading ? 'REGISTRANDO...' : 'REGISTRAR Y ENVIAR A AUTORIZACIÓN'}
            </button>
          </>
        ) : (
          <div className="h-full flex items-center justify-center opacity-30">
            <p className="text-xs tracking-widest">SELECCIONA UNA SOLICITUD PARA COTIZAR</p>
          </div>
        )}
      </main>
    </div>
  );
}
