'use client';

import { useState, useEffect, useCallback } from 'react';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';
import { SolicitudRecepcion, FinalizarRecepcionDTO } from '@/types';
import styles from './recepcion.module.css';

export default function Recepcion() {
  const [pendientes, setPendientes] = useState<SolicitudRecepcion[]>([]);
  const [seleccionada, setSeleccionada] = useState<SolicitudRecepcion | null>(null);
  const [form, setForm] = useState<FinalizarRecepcionDTO>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: ''
  });

  const cargarPendientes = useCallback(async () => {
    try {
      const res = await fetch(ENDPOINTS.RECEPCION.PENDIENTES, {
        headers: getHeaders()
      });
      const data = await res.json();
      setPendientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando recepción:", error);
    }
  }, []);

  useEffect(() => {
    cargarPendientes();
  }, [cargarPendientes]);

  const handleEntregar = async () => {
    if (!seleccionada) return;
    if (!form.nombre || !form.apellidoPaterno) {
      alert("Por favor llene los campos obligatorios del receptor");
      return;
    }

    try {
      const res = await fetch(ENDPOINTS.RECEPCION.ENTREGAR(seleccionada.id), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(form)
      });

      if (res.ok) {
        alert("✅ Entrega física registrada y folio finalizado.");
        setSeleccionada(null);
        setForm({ nombre: '', apellidoPaterno: '', apellidoMaterno: '' });
        cargarPendientes();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error al procesar entrega:", error);
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>RECEPCIÓN</h2>
          <p>Materiales Listos para Entrega</p>
        </div>

        <div className={styles.scrollArea}>
          {pendientes.length === 0 ? (
            <p className={styles.noData}>No hay materiales por entregar</p>
          ) : (
            pendientes.map(sol => (
              <div
                key={sol.id}
                className={`${styles.solCard} ${seleccionada?.id === sol.id ? styles.activeCard : ''}`}
                onClick={() => setSeleccionada(sol)}
              >
                <div className={styles.cardMain}>
                  <span className={styles.folio}>#{sol.folio}</span>
                  <p className={styles.area}>{sol.area?.nombre}</p>
                </div>
                <div className={styles.empresaTag}>{sol.empresa?.nombre}</div>
              </div>
            ))
          )}
        </div>
      </aside>

      <main className={styles.mainContent}>
        {seleccionada ? (
          <div className={styles.detailView}>
            <div className={styles.recepcionHeader}>
              <h1 className={styles.azulClaro}>REGISTRO DE SALIDA</h1>
              <p>Confirme quién recibe el material físicamente.</p>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoBox}>
                <h3>Resumen de Solicitud</h3>
                <p><strong>Justificación:</strong> {seleccionada.justificacion}</p>
                <div className={styles.itemsList}>
                  {seleccionada.items?.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      {item.cantidad} x {item.descripcion} ({item.unidad?.nombre})
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.gridForm}>
              <div className={styles.field}>
                <label>Nombre de quien recibe</label>
                <input
                  value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  placeholder="Nombre(s)"
                />
              </div>
              <div className={styles.flexFields}>
                <div className={styles.field}>
                  <label>Apellido Paterno</label>
                  <input
                    value={form.apellidoPaterno}
                    onChange={e => setForm({...form, apellidoPaterno: e.target.value})}
                  />
                </div>
                <div className={styles.field}>
                  <label>Apellido Materno</label>
                  <input
                    value={form.apellidoMaterno}
                    onChange={e => setForm({...form, apellidoMaterno: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <button className={styles.btnAceptar} onClick={handleEntregar}>
              FINALIZAR Y MARCAR COMO ENTREGADO
            </button>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2 style={{ opacity: 0.3, fontSize: '2.5rem' }}>SELECCIONE UNA ORDEN</h2>
          </div>
        )}
      </main>
    </div>
  );
}
