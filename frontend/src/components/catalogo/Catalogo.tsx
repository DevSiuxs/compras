'use client';
import { useState, useEffect } from 'react';
import styles from './Catalogo.module.css';

export default function Catalogos() {
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [inputEmpresa, setInputEmpresa] = useState('');
  const [inputUnidad, setInputUnidad] = useState('');

  const cargarDatos = async () => {
    try {
      const [resE, resU] = await Promise.all([
        fetch('http://localhost:3000/catalogos/empresas'),
        fetch('http://localhost:3000/catalogos/unidades')
      ]);
      setEmpresas(await resE.json());
      setUnidades(await resU.json());
    } catch (e) { console.error("Error cargando catálogos", e); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleCrear = async (tipo: 'empresas' | 'unidades', nombre: string, setter: any) => {
    if (!nombre.trim()) return;
    const res = await fetch(`http://localhost:3000/catalogos/${tipo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre })
    });
    if (res.ok) { setter(''); cargarDatos(); }
  };

  const handleBorrar = async (tipo: 'empresas' | 'unidades', id: number) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    const res = await fetch(`http://localhost:3000/catalogos/${tipo}/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) cargarDatos();
    else alert("No se puede borrar: El registro está siendo usado en una solicitud.");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Configuración de Catálogos</h1>
          <p>Gestiona las entidades y unidades de medida del sistema</p>
        </div>
      </header>

      <div className={styles.mainGrid}>
        {/* PANEL EMPRESAS */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>🏢</span>
            <h2>Empresas</h2>
          </div>

          <div className={styles.inputBox}>
            <input
              value={inputEmpresa}
              onChange={(e) => setInputEmpresa(e.target.value)}
              placeholder="Nueva empresa..."
            />
            <button onClick={() => handleCrear('empresas', inputEmpresa, setInputEmpresa)}>Añadir</button>
          </div>

          <div className={styles.listContainer}>
            {empresas.map((e: any) => (
              <div key={e.id} className={styles.listItem}>
                <span>{e.nombre}</span>
                <button onClick={() => handleBorrar('empresas', e.id)} className={styles.btnDelete}>
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* PANEL UNIDADES */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>📏</span>
            <h2>Unidades de Medida</h2>
          </div>

          <div className={styles.inputBox}>
            <input
              value={inputUnidad}
              onChange={(e) => setInputUnidad(e.target.value)}
              placeholder="Ej: Kilogramos, Piezas..."
            />
            <button onClick={() => handleCrear('unidades', inputUnidad, setInputUnidad)}>Añadir</button>
          </div>

          <div className={styles.listContainer}>
            {unidades.map((u: any) => (
              <div key={u.id} className={styles.listItem}>
                <span>{u.nombre}</span>
                <button onClick={() => handleBorrar('unidades', u.id)} className={styles.btnDelete}>
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
