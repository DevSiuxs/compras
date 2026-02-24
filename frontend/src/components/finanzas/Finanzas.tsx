"use client";
import { useState, useEffect } from 'react';
import styles from './Finanzas.module.css';

export default function Finanzas() {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    cargarFinanzas();
  }, []);

  const cargarFinanzas = async () => {
    const res = await fetch('http://localhost:3000/solicitudes');
    const data = await res.json();

    // Filtrar solo las que están en etapa de Finanzas
    const filtradas = data.filter((s: any) => s.status === 'FINANZAS');

    // Ordenar: 1. Prioridad (Rojo es 1, Azul es 5), 2. Fecha más vieja (createdAt)
    const ordenadas = filtradas.sort((a: any, b: any) => {
      if (a.prioridadOrden !== b.prioridadOrden) {
        return (a.prioridadOrden || 99) - (b.prioridadOrden || 99);
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    setSolicitudes(ordenadas);
  };

  const aceptarSolicitud = async (id: number) => {
    const res = await fetch(`http://localhost:3000/solicitudes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RECEPCION' }),
    });

    if (res.ok) {
      alert("Solicitud aceptada y enviada a Recepción.");
      cargarFinanzas();
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.neonText}>Módulo de Finanzas</h1>

      <div className={styles.glassTableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>FOLIO</th>
              <th>CONCEPTO</th>
              <th>EMPRESA</th>
              <th>MONTO APROBADO</th>
              <th>PRIORIDAD</th>
              <th>FECHA SOLICITUD</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.length > 0 ? solicitudes.map((s: any) => (
              <tr key={s.id} className={styles.row}>
                <td className="font-bold text-sky-400">{s.folio}</td>
                <td>{s.concepto}</td>
                <td>{s.empresa?.nombre}</td>
                <td className="text-[#00ff41] font-mono">
                  ${Number(s.montoAprobado).toLocaleString('es-MX')}
                </td>
                <td>
                  <span className={styles.badge} data-priority={s.prioridadFinal}>
                    {s.prioridadFinal?.toUpperCase()}
                  </span>
                </td>
                <td className="text-xs text-gray-400">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <button
                    onClick={() => aceptarSolicitud(s.id)}
                    className={styles.btnAceptar}
                  >
                    ACEPTAR / PAGADO
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  NO HAY PAGOS PENDIENTES POR PROCESAR
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
