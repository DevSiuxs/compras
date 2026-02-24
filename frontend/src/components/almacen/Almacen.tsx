'use client';
import { useState, useEffect } from 'react';
import styles from './Almacen.module.css'; // Reutiliza tus estilos neón

export default function Almacen() {
  const [pendientes, setPendientes] = useState([]);

  const cargarPendientes = async () => {
    const res = await fetch('http://localhost:3000/almacen/pendientes');
    if (res.ok) setPendientes(await res.json());
  };

  useEffect(() => { cargarPendientes(); }, []);

  const handleDecision = async (id: number, decision: 'surtir' | 'no-stock') => {
    const res = await fetch(`http://localhost:3000/almacen/${id}/procesar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision })
    });

    if (res.ok) {
      alert(decision === 'surtir' ? '✅ Material Surtido' : '⚠️ Enviado a Cotización');
      cargarPendientes();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-[#00ff41] font-bold mb-6 shadow-neon">PENDIENTES DE ALMACÉN</h2>

      <div className="grid gap-4">
        {pendientes.length === 0 && <p className="text-gray-500 text-center">No hay solicitudes pendientes.</p>}

        {pendientes.map((sol: any) => (
          <div key={sol.id} className="bg-[#111] border border-[#00ff41]/30 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex-1">
              <span className="text-[#00ff41] font-mono text-xs">{sol.folio}</span>
              <h3 className="text-white font-bold">{sol.area} - {sol.empresa.nombre}</h3>
              <p className="text-gray-400 text-sm mt-1">
                {sol.items.map((i: any) => `${i.cantidad} ${i.unidad.nombre} de ${i.descripcion}`).join(', ')}
              </p>
              <p className="italic text-gray-500 text-xs mt-2">"{sol.justificacion}"</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDecision(sol.id, 'surtir')}
                className="bg-[#00ff41] text-black px-4 py-2 text-xs font-bold rounded hover:shadow-[0_0_10px_#00ff41]"
              >
                SURTIR (HAY STOCK)
              </button>
              <button
                onClick={() => handleDecision(sol.id, 'no-stock')}
                className="border border-red-500 text-red-500 px-4 py-2 text-xs font-bold rounded hover:bg-red-500/10"
              >
                NO HAY STOCK
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
