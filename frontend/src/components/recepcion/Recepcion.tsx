'use client';
import { useState, useEffect } from 'react';
import styles from './recepcion.module.css';

export default function Recepcion() {
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [seleccionada, setSeleccionada] = useState<any>(null);
  const [form, setForm] = useState({ nombre: '', apellidoPaterno: '', apellidoMaterno: '' });

  const cargarPendientes = () => {
    fetch('http://localhost:3000/recepcion/pendientes')
      .then(res => res.json())
      .then(data => setPendientes(Array.isArray(data) ? data : []));
  };

  useEffect(() => { cargarPendientes(); }, []);

  const handleEntregar = async () => {
    if (!form.nombre || !form.apellidoPaterno) return alert("Por favor llene los campos obligatorios");

    const res = await fetch(`http://localhost:3000/recepcion/${seleccionada.id}/entregar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      alert("✅ Orden entregada con éxito.");
      setSeleccionada(null);
      setForm({ nombre: '', apellidoPaterno: '', apellidoMaterno: '' });
      cargarPendientes();
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.azulClaro} style={{letterSpacing: '3px', fontSize: '14px'}}>ENTREGAS PENDIENTES</h2>
        <div style={{marginTop: '2rem'}}>
          {pendientes.map(s => (
            <div
              key={s.id}
              className={`${styles.card} ${seleccionada?.id === s.id ? styles.cardActive : ''}`}
              onClick={() => setSeleccionada(s)}
            >
              <strong className={styles.azulClaro}>#{s.folio}</strong>
              <p style={{margin: '5px 0', fontSize: '13px'}}>{s.area?.nombre}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.main}>
        {seleccionada ? (
          <div className={styles.formulario}>
            <h1 className={styles.azulClaro}>REGISTRO DE SALIDA</h1>
            <p style={{color: '#555'}}>Confirmar entrega física del material comprado.</p>

            <div className={styles.gridForm}>
              <div className={styles.field}>
                <label>Nombre Completo</label>
                <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Quien recibe..." />
              </div>
              <div style={{display: 'flex', gap: '15px'}}>
                <div className={styles.field} style={{flex: 1}}>
                  <label>Apellido Paterno</label>
                  <input value={form.apellidoPaterno} onChange={e => setForm({...form, apellidoPaterno: e.target.value})} />
                </div>
                <div className={styles.field} style={{flex: 1}}>
                  <label>Apellido Materno</label>
                  <input value={form.apellidoMaterno} onChange={e => setForm({...form, apellidoMaterno: e.target.value})} />
                </div>
              </div>
            </div>

            <button className={styles.btnAceptar} onClick={handleEntregar}>
              FINALIZAR Y MARCAR COMO ENTREGADO
            </button>
          </div>
        ) : (
          <div style={{textAlign: 'center', marginTop: '15%', opacity: 0.3}}>
            <h2 style={{fontSize: '3rem'}}>ESPERANDO SELECCIÓN</h2>
          </div>
        )}
      </main>
    </div>
  );
}
