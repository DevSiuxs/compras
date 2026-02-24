'use client';
import { useState, useEffect } from 'react';
import styles from './Cotizacion.module.css';

export default function Cotizacion() {
  const [pendientes, setPendientes] = useState([]);
  const [seleccionado, setSeleccionado] = useState<any>(null);

  // Estados para Propuesta A
  const [pA, setPA] = useState({ proveedor: '', monto: 0, quien: '', obs: '' });
  // Estados para Propuesta B
  const [pB, setPB] = useState({ proveedor: '', monto: 0, quien: '', obs: '' });

  const cargarPendientes = async () => {
    try {
      const res = await fetch('http://localhost:3000/cotizacion/pendientes');
      if (res.ok) setPendientes(await res.json());
    } catch (error) {
      console.error("Error al cargar pendientes");
    }
  };

  useEffect(() => { cargarPendientes(); }, []);

  const handleEnviar = async () => {
    // Validación de seguridad
    if (!pA.proveedor || !pB.proveedor || pA.monto <= 0 || pB.monto <= 0) {
      return alert('⚠️ Ambas propuestas deben tener al menos Proveedor y Monto.');
    }

    const payload = {
      c1_proveedor: pA.proveedor,
      c1_monto: Number(pA.monto),
      c1_quien: pA.quien,
      c1_observaciones: pA.obs,
      c2_proveedor: pB.proveedor,
      c2_monto: Number(pB.monto),
      c2_quien: pB.quien,
      c2_observaciones: pB.obs
    };

    const res = await fetch(`http://localhost:3000/cotizacion/${seleccionado.id}/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('✅ Comparativa registrada. La solicitud ahora está en AZUL y pasó a AUTORIZAR.');
      setSeleccionado(null);
      cargarPendientes();
    }
  };

  return (
    <div className={styles.container}>
      {/* LISTADO IZQUIERDO */}
      <aside className={styles.listSide}>
        <h2 className="text-[10px] text-gray-500 font-black mb-4 tracking-[2px]">BANDEJA DE COMPRAS</h2>
        {pendientes.length === 0 && <p className="text-xs text-gray-700">No hay folios pendientes...</p>}
        {pendientes.map((sol: any) => (
          <div
            key={sol.id}
            className={`${styles.solCard} ${seleccionado?.id === sol.id ? styles.solCardActive : ''}`}
            onClick={() => setSeleccionado(sol)}
          >
            <p className="text-[10px] text-[#00ff41] font-mono">{sol.folio}</p>
            <p className="text-sm font-medium">{sol.items[0]?.descripcion}</p>
          </div>
        ))}
      </aside>

      {/* PANEL DE CAPTURA DERECHO */}
      <main className={styles.formSide}>
        {seleccionado ? (
          <>
            <div className={styles.header}>
              <h1 className="text-2xl font-bold text-white">{seleccionado.folio}</h1>
              <p className="text-gray-500 text-xs italic uppercase mt-1">Status Actual: COTIZANDO</p>
            </div>

            {/* GRID DE LAS 2 PROPUESTAS */}
            <div className={styles.gridProps}>
              {/* PROPUESTA A */}
              <div className={styles.propBox}>
                <span className="text-[10px] text-[#00ff41] font-bold tracking-widest">PROPUESTA A</span>
                <div className="mt-4 space-y-3">
                  <input className={styles.input} placeholder="Proveedor" onChange={e => setPA({...pA, proveedor: e.target.value})} />
                  <input type="number" className={styles.input} placeholder="Monto Total $" onChange={e => setPA({...pA, monto: Number(e.target.value)})} />
                  <input className={styles.input} placeholder="¿Quién cotizó?" onChange={e => setPA({...pA, quien: e.target.value})} />
                  <textarea className={styles.textarea} placeholder="Observaciones / Razón de este proveedor" onChange={e => setPA({...pA, obs: e.target.value})} />
                </div>
              </div>

              {/* PROPUESTA B */}
              <div className={styles.propBox}>
                <span className="text-[10px] text-gray-400 font-bold tracking-widest">PROPUESTA B</span>
                <div className="mt-4 space-y-3">
                  <input className={styles.input} placeholder="Proveedor" onChange={e => setPB({...pB, proveedor: e.target.value})} />
                  <input type="number" className={styles.input} placeholder="Monto Total $" onChange={e => setPB({...pB, monto: Number(e.target.value)})} />
                  <input className={styles.input} placeholder="¿Quién cotizó?" onChange={e => setPB({...pB, quien: e.target.value})} />
                  <textarea className={styles.textarea} placeholder="Observaciones / Razón de este proveedor" onChange={e => setPB({...pB, obs: e.target.value})} />
                </div>
              </div>
            </div>

            <button className={styles.btnSubmit} onClick={handleEnviar}>
              Registrar y Enviar a Autorización (Reset Color a Azul)
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-20">
            <p className="text-4xl">📂</p>
            <p className="text-xs font-mono mt-4">SELECCIONA UN FOLIO PARA COMPARAR PRECIOS</p>
          </div>
        )}
      </main>
    </div>
  );
}
