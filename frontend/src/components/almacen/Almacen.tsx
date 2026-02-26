'use client';
import { useState, useEffect, useCallback } from 'react';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';
import { SolicitudAlmacen, AlmacenForm } from '@/types';
import styles from './Almacen.module.css';

export default function Almacen() {
  const [pendientes, setPendientes] = useState<SolicitudAlmacen[]>([]);
  const [filtroFecha, setFiltroFecha] = useState<string>('');
  const [seleccionada, setSeleccionada] = useState<SolicitudAlmacen | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [form, setForm] = useState<AlmacenForm>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: ''
  });

  const cargarPendientes = useCallback(async () => {
    try {
      const res = await fetch(ENDPOINTS.ALMACEN.PENDIENTES, {
        headers: getHeaders() // Uso de token y privilegios
      });
      if (res.ok) {
        const data: SolicitudAlmacen[] = await res.json();
        setPendientes(data);
      }
    } catch (e) {
      console.error("Error en Almacén:", e);
    }
  }, []);

  useEffect(() => {
    cargarPendientes();
  }, [cargarPendientes]);

  const handleDecision = async (id: number, decision: 'surtir' | 'no-stock') => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.ALMACEN.PROCESAR(id), {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          decision,
          // Si es surtir, enviamos los datos de quien recibe
          ...(decision === 'surtir' && form)
        })
      });

      if (res.ok) {
        alert(decision === 'surtir' ? "Material entregado" : "Enviado a cotización");
        setSeleccionada(null);
        cargarPendientes();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const solicitudesFiltradas = pendientes.filter(s => {
    if (!filtroFecha) return true;
    return s.fechaCreacion.split('T')[0] === filtroFecha;
  });

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>PENDIENTES ALMACÉN</h2>
        <input
          type="date"
          value={filtroFecha}
          onChange={e => setFiltroFecha(e.target.value)}
        />
        <div className={styles.scrollList}>
          {solicitudesFiltradas.map(sol => (
            <div
              key={sol.id}
              className={`${styles.card} ${seleccionada?.id === sol.id ? styles.active : ''}`}
              onClick={() => setSeleccionada(sol)}
            >
              <p><strong>{sol.folio}</strong></p>
              <p>{sol.empresa?.nombre}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.content}>
        {seleccionada ? (
          <div className={styles.detail}>
            <h3>Detalle: {seleccionada.folio}</h3>
            {/* Mapeo de items sin 'any' */}
            {seleccionada.items?.map(item => (
              <div key={item.id}>
                {item.cantidad} {item.unidad?.nombre} - {item.descripcion}
              </div>
            ))}

            <div className={styles.actions}>
              <input
                placeholder="Nombre recibe"
                value={form.nombre}
                onChange={e => setForm({...form, nombre: e.target.value})}
              />
              <button
                disabled={loading || !form.nombre}
                onClick={() => handleDecision(seleccionada.id, 'surtir')}
              >
                SURTIR
              </button>
              <button
                disabled={loading}
                onClick={() => handleDecision(seleccionada.id, 'no-stock')}
              >
                NO HAY STOCK
              </button>
            </div>
          </div>
        ) : (
          <p>Selecciona una solicitud</p>
        )}
      </main>
    </div>
  );
}
