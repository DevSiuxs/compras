'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from './recepcion.module.css';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';
import { SolicitudRecepcion, FinalizarRecepcionDTO, ItemSolicitud } from '@/types';

export default function Recepcion() {
  // 1. Tipado estricto para evitar errores de ESLint
  const [pendientes, setPendientes] = useState<SolicitudRecepcion[]>([]);
  const [seleccionada, setSeleccionada] = useState<SolicitudRecepcion | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FinalizarRecepcionDTO>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: ''
  });

  const cargarPendientes = useCallback(async () => {
    try {
      const res = await fetch(ENDPOINTS.RECEPCION.PENDIENTES, {
        headers: getHeaders(), // Envío de token para privilegios
      });
      if (!res.ok) throw new Error('Error al cargar');
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
      return alert("Debes indicar quién recibe el material");
    }

    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.RECEPCION.FINALIZAR(seleccionada.id), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setSeleccionada(null);
        setForm({ nombre: '', apellidoPaterno: '', apellidoMaterno: '' });
        await cargarPendientes();
        alert("Recepción finalizada con éxito");
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
        <div className={styles.sidebarHeader}>
          <span className={styles.miniTag}>LOGÍSTICA</span>
          <h2>RECEPCIÓN</h2>
        </div>
        <div className={styles.list}>
          {pendientes.map((sol) => (
            <div
              key={sol.id}
              className={`${styles.card} ${seleccionada?.id === sol.id ? styles.active : ''}`}
              onClick={() => setSeleccionada(sol)}
            >
              <span className={styles.folio}>#{sol.folio}</span>
              <p className={styles.empresa}>{sol.empresa?.nombre}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.main}>
        {seleccionada ? (
          <div className={styles.detailCard}>
            <div className={styles.headerDetail}>
              <h1>FOLIO {seleccionada.folio}</h1>
              <p className={styles.sub}>{seleccionada.empresa?.nombre} — {seleccionada.area?.nombre}</p>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.azulClaro}>MATERIAL A RECIBIR</h3>
              <div className={styles.itemsList}>
                {seleccionada.items?.map((item: ItemSolicitud) => (
                  <div key={item.id} className={styles.itemRow}>
                    • {item.cantidad} {item.unidad?.nombre} - {item.descripcion}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formEntrega}>
              <h3 className={styles.azulClaro}>DATOS DE QUIEN RECIBE</h3>
              <div className={styles.field}>
                <label className={styles.label}>NOMBRE COMPLETO</label>
                <input
                  className={styles.montoInput} // Usamos tu clase de diseño
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Nombre..."
                />
              </div>
              <div className={styles.rowInputs}>
                <div className={styles.field}>
                  <label className={styles.label}>APELLIDO PATERNO</label>
                  <input
                    className={styles.montoInput}
                    value={form.apellidoPaterno}
                    onChange={e => setForm({ ...form, apellidoPaterno: e.target.value })}
                    placeholder="Paterno..."
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>APELLIDO MATERNO</label>
                  <input
                    className={styles.montoInput}
                    value={form.apellidoMaterno}
                    onChange={e => setForm({ ...form, apellidoMaterno: e.target.value })}
                    placeholder="Materno..."
                  />
                </div>
              </div>
              <button
                className={styles.btnSurtir}
                onClick={handleEntregar}
                disabled={loading}
              >
                {loading ? 'PROCESANDO...' : 'CONFIRMAR RECEPCIÓN Y CERRAR FOLIO'}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.placeholderMain}>
            <div className={styles.radarIcon}>📦</div>
            <h2>Esperando selección de material...</h2>
          </div>
        )}
      </main>
    </div>
  );
}
