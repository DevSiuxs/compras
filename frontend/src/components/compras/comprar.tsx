'use client';

import { useState, useEffect, useCallback } from 'react';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';
import {
  SolicitudAutorizable as SolicitudCompra,
  PrioridadColor
} from '@/types';
import { calcularColorPrioridad } from '@/utils/semaforo';
import styles from './comprar.module.css';

// Mapeo numérico para ordenar por urgencia visualmente
const PRIORIDAD_VALOR: Record<PrioridadColor, number> = {
  ROJO: 5,
  NARANJA: 4,
  AMARILLO: 3,
  VERDE: 2,
  AZUL: 1
};

export default function Comprar() {
  const [pendientes, setPendientes] = useState<SolicitudCompra[]>([]);
  const [presupuesto, setPresupuesto] = useState<number>(0);
  const [seleccionada, setSeleccionada] = useState<SolicitudCompra | null>(null);
  const [mostrarModalMensaje, setMostrarModalMensaje] = useState<boolean>(false);
  const [motivoMensaje, setMotivoMensaje] = useState<string>('');

  /**
   * Carga de datos iniciales: Presupuesto Global y Solicitudes en cola de compra
   */
  const cargarDatos = useCallback(async () => {
    try {
      const headers = getHeaders();

      // 1. Obtener Presupuesto Global
      const resP = await fetch(ENDPOINTS.AUTORIZACION.PRESUPUESTO, { headers });
      const dataP = await resP.json();
      setPresupuesto(dataP?.presupuestoGlobal || 0);

      // 2. Obtener Solicitudes Pendientes de Compra
      const resS = await fetch(ENDPOINTS.COMPRAS.PENDIENTES, { headers });
      const dataS: SolicitudCompra[] = await resS.json();

      // Ordenar por prioridad (Color calculado) y luego por fecha
      const ordenados = dataS.sort((a, b) => {
        const colorA = calcularColorPrioridad(a.fechaResetColor).color;
        const colorB = calcularColorPrioridad(b.fechaResetColor).color;

        const pA = PRIORIDAD_VALOR[colorA] || 0;
        const pB = PRIORIDAD_VALOR[colorB] || 0;

        if (pB !== pA) return pB - pA;
        return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime();
      });

      setPendientes(ordenados);
    } catch (e) {
      console.error("Error al sincronizar con el servidor de compras:", e);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  /**
   * Ejecuta la transacción de compra en el backend
   */
  const handleComprar = async (id: number) => {
    const res = await fetch(ENDPOINTS.COMPRAS.EJECUTAR(id), {
      method: 'POST',
      headers: getHeaders()
    });

    if (res.ok) {
      setSeleccionada(null);
      cargarDatos();
    } else {
      const err = await res.json();
      alert(err.message || "Error crítico en la dispersión de fondos");
    }
  };

  /**
   * Notifica al autorizador sobre falta de presupuesto o incidencias
   */
  const enviarMensaje = async () => {
    if (!motivoMensaje || !seleccionada) return;

    const res = await fetch(ENDPOINTS.COMPRAS.NOTIFICAR(seleccionada.id), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ motivo: motivoMensaje })
    });

    if (res.ok) {
      setMostrarModalMensaje(false);
      setMotivoMensaje('');
      setSeleccionada(null);
      cargarDatos();
    }
  };

  // Identificar la cotización que fue marcada como "ganadora" en el paso de Autorizar
  const cotizacionGanadora = seleccionada?.cotizaciones?.find(c => c.seleccionada);

  return (
    <div className={styles.container}>
      {/* Barra Lateral: Lista de Solicitudes */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <p className={styles.miniTag}>PAGOS PENDIENTES</p>
          <h2>CENTRAL DE COMPRAS</h2>
        </div>

        <div className={styles.budgetCard}>
          <span className={styles.label}>SALDO DISPONIBLE GLOBAL</span>
          <p className={styles.blueValue}>${presupuesto.toLocaleString('es-MX')}</p>
        </div>

        <div className={styles.scrollArea}>
          {pendientes.map(sol => {
            const { color } = calcularColorPrioridad(sol.fechaResetColor);
            return (
              <div
                key={sol.id}
                className={`${styles.solCard} ${seleccionada?.id === sol.id ? styles.activeCard : ''}`}
                onClick={() => setSeleccionada(sol)}
              >
                <div className={styles.cardInfo}>
                  <span className={styles.folio}>#{sol.folio}</span>
                  <p className={styles.empresa}>{sol.empresa?.nombre}</p>
                </div>
                {/* El color del punto ahora es dinámico por fecha */}
                <div className={styles.priorityDot} style={{ background: `var(--${color.toLowerCase()})` }} />
              </div>
            );
          })}
        </div>
      </aside>

      {/* Área Principal: Detalle y Ejecución */}
      <main className={styles.mainContent}>
        {seleccionada && cotizacionGanadora ? (
          <div className={styles.detailView}>
            <header className={styles.detailHeader}>
              <div className={styles.headerInfo}>
                {/* Cálculo dinámico de urgencia para el badge */}
                <div
                  className={styles.priorityLabel}
                  style={{
                    borderColor: `var(--${calcularColorPrioridad(seleccionada.fechaResetColor).color.toLowerCase()})`,
                    color: `var(--${calcularColorPrioridad(seleccionada.fechaResetColor).color.toLowerCase()})`
                  }}
                >
                  URGENCIA: {calcularColorPrioridad(seleccionada.fechaResetColor).color} ({calcularColorPrioridad(seleccionada.fechaResetColor).dias} días)
                </div>
                <h1>Solicitud #{seleccionada.folio}</h1>
              </div>
              <div className={styles.provInfo}>
                <span className={styles.label}>PROVEEDOR ADJUDICADO</span>
                <p>{cotizacionGanadora.proveedor}</p>
              </div>
            </header>

            <div className={styles.contentGrid}>
              <section className={styles.itemsSection}>
                <h3>ARTÍCULOS A ADQUIRIR</h3>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Cant.</th>
                        <th>Descripción</th>
                        <th>Unidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seleccionada.items?.map((item, i) => (
                        <tr key={item.id || i}>
                          <td className={styles.bold}>{item.cantidad}</td>
                          <td>{item.descripcion}</td>
                          <td>{item.unidad?.nombre}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className={styles.paymentSection}>
                <div className={styles.totalCard}>
                  <span className={styles.label}>MONTO A DISPERSAR</span>
                  <p className={styles.totalAmount}>${cotizacionGanadora.monto.toLocaleString('es-MX')}</p>
                  <div className={styles.divider} />
                  <p className={styles.obs}>
                    <strong>Obs. Autorización:</strong> {cotizacionGanadora.observaciones || 'Sin notas adicionales'}
                  </p>
                </div>

                <div className={styles.actions}>
                  <button
                    className={`${styles.btnConfirm} ${cotizacionGanadora.monto > presupuesto ? styles.btnWarning : ''}`}
                    onClick={() => handleComprar(seleccionada.id)}
                  >
                    {cotizacionGanadora.monto > presupuesto
                      ? "FONDOS INSUFICIENTES (REVISAR)"
                      : "CONFIRMAR Y PAGAR"}
                  </button>

                  <button
                    className={styles.btnMensaje}
                    onClick={() => setMostrarModalMensaje(true)}
                  >
                    SOLICITAR AJUSTE DE PRESUPUESTO
                  </button>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.scanline} />
            <p>SISTEMA DE PAGOS ESPERANDO SELECCIÓN</p>
          </div>
        )}
      </main>

      {/* Modal para Notificaciones/Mensajes */}
      {mostrarModalMensaje && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>NOTIFICAR A AUTORIZACIÓN</h3>
            <p className={styles.label}>Describa el motivo del ajuste o incidencia:</p>
            <textarea
              value={motivoMensaje}
              onChange={(e) => setMotivoMensaje(e.target.value)}
              placeholder="Ej. Se requiere ampliación de presupuesto para cubrir impuestos..."
            />
            <div className={styles.modalActions}>
              <button onClick={enviarMensaje} className={styles.btnSend}>ENVIAR REPORTE</button>
              <button onClick={() => setMostrarModalMensaje(false)} className={styles.btnCancel}>CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
