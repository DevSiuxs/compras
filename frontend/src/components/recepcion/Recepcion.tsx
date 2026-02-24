"use client";
import { useState, useEffect } from 'react';
import styles from './Recepcion.module.css';

export default function Recepcion() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [seleccionada, setSeleccionada] = useState<any>(null);

  useEffect(() => {
    cargarRecepcion();
  }, []);

  const cargarRecepcion = async () => {
    const res = await fetch('http://localhost:3000/solicitudes');
    const data = await res.json();
    setSolicitudes(data.filter((s: any) => s.status === 'RECEPCION'));
  };

  const finalizarCiclo = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const updateData = {
      status: 'ENTREGADO', // Status final para el historial
      nombreRecibe: formData.get('nombre'),
      paternoRecibe: formData.get('paterno'),
      maternoRecibe: formData.get('materno'),
      fechaRecepcion: new Date()
    };

    const res = await fetch(`http://localhost:3000/solicitudes/${seleccionada.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (res.ok) {
      alert("¡CICLO COMPLETADO! El registro ha sido guardado en el historial.");
      setSeleccionada(null);
      cargarRecepcion();
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.neonText}>Confirmación de Recepción</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LISTA DE ESPERA */}
        <div className={styles.listSide}>
          <h2 className="text-sky-400 mb-4 font-bold text-sm uppercase">Paquetes por Recibir</h2>
          {solicitudes.map((s: any) => (
            <div
              key={s.id}
              className={`${styles.solCard} ${seleccionada?.id === s.id ? styles.active : ''}`}
              onClick={() => setSeleccionada(s)}
            >
              <p className="font-bold">{s.folio}</p>
              <p className="text-xs italic">{s.concepto}</p>
            </div>
          ))}
        </div>

        {/* FORMULARIO DE ENTREGA */}
        <div>
          {seleccionada ? (
            <form onSubmit={finalizarCiclo} className={styles.glassForm}>
              <h2 className="text-lg font-bold mb-4 text-[#00ff41]">DATOS DE QUIEN RECIBE</h2>
              <div className="space-y-4">
                <input name="nombre" placeholder="Nombre(s)" className={styles.input} required />
                <input name="paterno" placeholder="Apellido Paterno" className={styles.input} required />
                <input name="materno" placeholder="Apellido Materno" className={styles.input} required />

                <div className={styles.infoBox}>
                  <p className="text-[10px] text-gray-500 uppercase">Detalle del Producto</p>
                  <p className="text-sm">{seleccionada.concepto} x {seleccionada.cantidad}</p>
                </div>

                <button type="submit" className={styles.btnFinalizar}>
                  CONCLUIR Y ARCHIVAR
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.emptyState}>Selecciona un folio para registrar la entrega</div>
          )}
        </div>
      </div>
    </div>
  );
}
