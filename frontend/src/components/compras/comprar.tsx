'use client';
import { useState, useEffect } from 'react';
import styles from './comprar.module.css'; // Ocupa el mismo CSS de Almacen o Compras
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';

export default function Recepcion() {
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [seleccionada, setSeleccionada] = useState<any>(null);
  const [form, setForm] = useState({ nombre: '', apellidoPaterno: '', apellidoMaterno: '' });

  const cargarDatos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recepcion/pendientes`, { headers: getHeaders() });
      if (res.ok) setPendientes(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const finalizarSurtido = async () => {
    if (!form.nombre || !form.apellidoPaterno) return alert("Faltan datos de quien recibe");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recepcion/${seleccionada.id}/finalizar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSeleccionada(null);
        cargarDatos();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.headerSidebar}>
          <span className={styles.subtext}>RECEPCIÓN DE MATERIAL</span>
          <h2 className={styles.azulClaro}>ORDENES EN CAMINO</h2>
        </div>
        <div className={styles.scrollArea}>
          {pendientes.map(s => (
            <div
              key={s.id}
              className={`${styles.cardSolicitud} ${seleccionada?.id === s.id ? styles.active : ''}`}
              onClick={() => setSeleccionada(s)}
            >
              <div className="flex justify-between">
                <span className="text-white font-mono">{s.folio}</span>
                <span className={styles.statusTag}>{s.status}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">{s.empresa?.nombre}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.mainContent}>
        {seleccionada ? (
          <div className={styles.detalleContainer}>
            <div className={styles.infoBox}>
              <h1 className={styles.azulClaro}>FOLIO: {seleccionada.folio}</h1>
              <p>PROVEEDOR: {seleccionada.proveedorFinal}</p>
              <div className={styles.itemsList}>
                {seleccionada.items?.map((item: any) => (
                  <div key={item.id} className={styles.itemRow}>
                    • {item.cantidad} {item.unidad?.nombre} - {item.descripcion}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formEntrega}>
              <h3 className={styles.azulClaro}>REGISTRAR ENTRADA A ALMACÉN</h3>
              <input
                placeholder="Nombre de quien recibe"
                value={form.nombre}
                onChange={e => setForm({...form, nombre: e.target.value})}
              />
              <div className={styles.rowInputs}>
                <input
                  placeholder="A. Paterno"
                  value={form.apellidoPaterno}
                  onChange={e => setForm({...form, apellidoPaterno: e.target.value})}
                />
                <input
                  placeholder="A. Materno"
                  value={form.apellidoMaterno}
                  onChange={e => setForm({...form, apellidoMaterno: e.target.value})}
                />
              </div>
              <button className={styles.btnSurtir} onClick={finalizarSurtido}>
                CONFIRMAR RECEPCIÓN Y CERRAR FOLIO
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.placeholderMain}>
            <div className={styles.radarIcon}>📦</div>
            <h2>Esperando llegada de material...</h2>
          </div>
        )}
      </main>
    </div>
  );
}
