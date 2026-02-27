'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from './comprar.module.css';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';
import { SolicitudAutorizable } from '@/types';

export default function ComprasPagina() {
  const [pendientes, setPendientes] = useState<SolicitudAutorizable[]>([]);
  const [seleccionada, setSeleccionada] = useState<SolicitudAutorizable | null>(null);
  const [loading, setLoading] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      // USAMOS EL ENDPOINT DE COMPRAS (que apunta a /compras/pendientes)
      const res = await fetch(ENDPOINTS.COMPRAS.PENDIENTES, {
        headers: getHeaders()
      });

      if (res.ok) {
        const data = await res.json();
        setPendientes(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Error cargando compras:", e);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const finalizarCompra = async () => {
    if (!seleccionada) return;

    setLoading(true);
    try {
      // USAMOS EL MÉTODO EJECUTAR QUE TIENES EN TU BACKEND
      const res = await fetch(ENDPOINTS.COMPRAS.EJECUTAR(seleccionada.id), {
        method: 'POST',
        headers: getHeaders()
      });

      if (res.ok) {
        alert("Compra ejecutada. El material ahora está en Recepción/Almacén.");
        setSeleccionada(null);
        await cargarDatos();
      } else {
        const err = await res.json();
        alert(err.message || "Error al ejecutar compra");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.miniTag}>ORDENES DE COMPRA</span>
          <h2>POR EJECUTAR</h2>
        </div>
        <div className={styles.list}>
          {pendientes.length === 0 ? (
            <p style={{ padding: '1rem', opacity: 0.5 }}>No hay compras pendientes</p>
          ) : (
            pendientes.map((sol) => (
              <div
                key={sol.id}
                className={`${styles.card} ${seleccionada?.id === sol.id ? styles.active : ''}`}
                onClick={() => setSeleccionada(sol)}
              >
                <span className={styles.folio}>#{sol.folio}</span>
                <p className={styles.empresa}>{sol.empresa?.nombre}</p>
                {/* Mostramos el monto de la cotización seleccionada */}
                <strong className={styles.azulClaro}>
                  ${sol.cotizaciones?.find(c => c.seleccionada)?.monto.toLocaleString()}
                </strong>
              </div>
            ))
          )}
        </div>
      </aside>

      <main className={styles.main}>
        {seleccionada ? (
          <div className={styles.detailCard}>
            <h1>ORDEN DE COMPRA: {seleccionada.folio}</h1>

            <div className={styles.infoSection}>
              <h3 className={styles.azulClaro}>PROVEEDOR ELEGIDO</h3>
              <p>{seleccionada.cotizaciones?.find(c => c.seleccionada)?.proveedor}</p>

              <h3 className={styles.azulClaro} style={{marginTop: '20px'}}>MATERIAL</h3>
              <ul>
                {seleccionada.items?.map(item => (
                  <li key={item.id}>{item.cantidad} {item.unidad?.nombre} - {item.descripcion}</li>
                ))}
              </ul>
            </div>

            <div className={styles.totalCard}>
               <p>TOTAL A PAGAR</p>
               <h2 className={styles.totalAmount}>
                 ${seleccionada.cotizaciones?.find(c => c.seleccionada)?.monto.toLocaleString()}
               </h2>
            </div>

            <button
              className={styles.btnConfirm}
              onClick={finalizarCompra}
              disabled={loading}
            >
              {loading ? 'PROCESANDO...' : 'CONFIRMAR COMPRA REALIZADA'}
            </button>
          </div>
        ) : (
          <div className={styles.placeholderMain}>
             <div className={styles.radarIcon}>💰</div>
             <h2>Selecciona una solicitud autorizada para confirmar la compra</h2>
          </div>
        )}
      </main>
    </div>
  );
}
