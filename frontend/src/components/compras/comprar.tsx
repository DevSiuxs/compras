'use client';
import { useState, useEffect } from 'react';
import styles from './comprar.module.css';

export default function Comprar() {
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [presupuesto, setPresupuesto] = useState(0);
  const [seleccionada, setSeleccionada] = useState<any>(null);
  const [mostrarModalMensaje, setMostrarModalMensaje] = useState(false);
  const [motivoMensaje, setMotivoMensaje] = useState('');

  // Colores para la interfaz
  const COLORES_MAP: any = {
    AZUL: '#00d2ff',
    VERDE: '#00ff41',
    AMARILLO: '#ffca28',
    NARANJA: '#ff9800',
    ROJO: '#ff4d4d'
  };

  const cargarDatos = async () => {
    try {
      const resP = await fetch('http://localhost:3000/autorizacion/presupuesto');
      const dataP = await resP.json();
      setPresupuesto(dataP?.presupuestoGlobal || 0);

      const resS = await fetch('http://localhost:3000/compras/pendientes');
      const dataS = await resS.json();
      setPendientes(dataS);
    } catch (e) { console.error("Error cargando compras", e); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const obtenerColorStatus = (sol: any) => {
    if (sol.prioridad && !['PENDIENTE', 'AZUL'].includes(sol.prioridad)) return sol.prioridad;
    if (sol.cotizaciones[0]?.monto > presupuesto) return 'ROJO';
    return 'AZUL';
  };

  const handleComprar = async (id: number) => {
    if (!confirm('¿Confirmar ejecución de compra?')) return;
    const res = await fetch(`http://localhost:3000/compras/${id}/ejecutar`, { method: 'POST' });
    if (res.ok) {
      alert("Compra ejecutada con éxito");
      setSeleccionada(null);
      cargarDatos();
    }
  };

  const enviarMensaje = async () => {
    if (!motivoMensaje) return alert("Escribe un motivo");
    const res = await fetch(`http://localhost:3000/compras/${seleccionada.id}/notificar-presupuesto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo: motivoMensaje })
    });
    if (res.ok) {
      alert("Mensaje enviado a Autorización");
      setMostrarModalMensaje(false);
      setMotivoMensaje('');
      setSeleccionada(null);
      cargarDatos();
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.budgetCard}>
          <p>Presupuesto Global Disponible</p>
          <h2 className={styles.blueValue}>${presupuesto.toLocaleString()}</h2>
        </div>

        <div className={styles.scrollArea}>
          {pendientes.map(sol => (
            <div
              key={sol.id}
              className={`${styles.solCard} ${seleccionada?.id === sol.id ? styles.active : ''}`}
              onClick={() => setSeleccionada(sol)}
              style={{ '--this-color': COLORES_MAP[obtenerColorStatus(sol)] } as any}
            >
              <div className={styles.statusLine}></div>
              <div>
                <p className={styles.folioText}>FOLIO #{sol.id.toString().padStart(4, '0')}</p>
                <p className={styles.empresaText}>{sol.empresa?.nombre}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.main}>
        {seleccionada ? (
          <div className={styles.content}>
            <header className={styles.header}>
              <div>
                <h1>{seleccionada.empresa?.nombre}</h1>
                <p className={styles.fecha}>Solicitado el {new Date(seleccionada.fechaCreacion).toLocaleDateString()}</p>
              </div>
              <div className={styles.badge} style={{ background: COLORES_MAP[obtenerColorStatus(seleccionada)] }}>
                PRIORIDAD {obtenerColorStatus(seleccionada)}
              </div>
            </header>

            <div className={styles.detailsGrid}>
              <div className={styles.box}>
                <p className={styles.label}>Proveedor Seleccionado</p>
                <h3>{seleccionada.cotizaciones[0]?.proveedor}</h3>
                <p className={styles.monto} style={{ color: COLORES_MAP[obtenerColorStatus(seleccionada)] }}>
                  ${seleccionada.cotizaciones[0]?.monto.toLocaleString()}
                </p>
              </div>
              <div className={styles.box}>
                <p className={styles.label}>Artículos a Comprar</p>
                <ul className={styles.list}>
                  {seleccionada.items?.map((it: any) => (
                    <li key={it.id}>{it.cantidad} {it.unidad?.nombre} - {it.descripcion}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.btnComprar}
                disabled={seleccionada.cotizaciones[0]?.monto > presupuesto}
                onClick={() => handleComprar(seleccionada.id)}
              >
                Aceptar Compra
              </button>

              <button className={styles.btnMensaje} onClick={() => setMostrarModalMensaje(true)}>
                Notificar Falta de Saldo
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>Selecciona un folio para procesar el pago</div>
        )}
      </main>

      {/* MODAL DE MENSAJE */}
      {mostrarModalMensaje && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.blueText}>REPORTAR PROBLEMA</h3>
            <p style={{fontSize: '11px', color: '#666', marginBottom: '1rem'}}>Indica por qué no se puede realizar la compra.</p>

            <textarea
              className={styles.modalTextarea}
              value={motivoMensaje}
              onChange={(e) => setMotivoMensaje(e.target.value)}
              placeholder="Ej: El presupuesto es insuficiente..."
            />

            <div className={styles.modalActions}>
              <button onClick={enviarMensaje} className={styles.btnSend}>
                Enviar a Autorización
              </button>
              <button onClick={() => setMostrarModalMensaje(false)} className={styles.btnCancel}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
