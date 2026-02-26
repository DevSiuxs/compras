'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from './recepcion.module.css';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig'; // Ajusta la ruta según tu estructura
import { SolicitudRecepcion, FinalizarRecepcionDTO } from '@/types'; // Ajusta la ruta según tu estructura

export default function Recepcion() {
  // Tipado estricto eliminando 'any'
  const [pendientes, setPendientes] = useState<SolicitudRecepcion[]>([]);
  const [seleccionada, setSeleccionada] = useState<SolicitudRecepcion | null>(null);
  const [form, setForm] = useState<FinalizarRecepcionDTO>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: ''
  });

  // Usamos useCallback para evitar recrear la función en cada render
  const cargarPendientes = useCallback(async () => {
    try {
      const res = await fetch(ENDPOINTS.RECEPCION.PENDIENTES, {
        headers: getHeaders(), // Incluimos token por privilegios
      });
      if (!res.ok) throw new Error('Error al cargar pendientes');
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
    if (!form.nombre || !form.apellidoPaterno || !form.apellidoMaterno) {
      return alert("Por favor llene todos los campos obligatorios");
    }

    try {
      // Usamos el ENDPOINT dinámico del config
      const res = await fetch(ENDPOINTS.RECEPCION.ENTREGAR(seleccionada.id), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(form)
      });

      if (res.ok) {
        alert("✅ Orden entregada con éxito.");
        setSeleccionada(null);
        setForm({ nombre: '', apellidoPaterno: '', apellidoMaterno: '' });
        cargarPendientes();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || 'No se pudo procesar la entrega'}`);
      }
    } catch (error) {
      console.error("Error al entregar:", error);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.azulClaro} style={{ letterSpacing: '3px', fontSize: '14px' }}>
          ENTREGAS PENDIENTES
        </h2>
        <div style={{ marginTop: '2rem' }}>
          {pendientes.map((s) => (
            <div
              key={s.id}
              className={`${styles.card} ${seleccionada?.id === s.id ? styles.cardActive : ''}`}
              onClick={() => setSeleccionada(s)}
            >
              <strong className={styles.azulClaro}>#{s.folio}</strong>
              <p style={{ margin: '5px 0', fontSize: '13px' }}>{s.area?.nombre}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.main}>
        {seleccionada ? (
          <div className={styles.formulario}>
            <h1 className={styles.azulClaro}>REGISTRO DE SALIDA</h1>
            <p style={{ color: '#555' }}>Confirmar entrega física del material comprado.</p>

            <div className={styles.gridForm}>
              <div className={styles.field}>
                <label>Nombre Completo</label>
                <input
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Quien recibe..."
                />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label>Apellido Paterno</label>
                  <input
                    value={form.apellidoPaterno}
                    onChange={e => setForm({ ...form, apellidoPaterno: e.target.value })}
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label>Apellido Materno</label>
                  <input
                    value={form.apellidoMaterno}
                    onChange={e => setForm({ ...form, apellidoMaterno: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button className={styles.btnAceptar} onClick={handleEntregar}>
              FINALIZAR Y MARCAR COMO ENTREGADO
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '15%', opacity: 0.3 }}>
            <h2 style={{ fontSize: '3rem' }}>ESPERANDO SELECCIÓN</h2>
          </div>
        )}
      </main>
    </div>
  );
}
