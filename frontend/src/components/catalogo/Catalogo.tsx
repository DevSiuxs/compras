'use client';
import { useState, useEffect, useCallback } from 'react';
import { API_URL, getHeaders } from '@/config/apiConfig';
import { Empresa, Unidad, Area, CatalogosData } from '@/types';
import styles from './Catalogo.module.css';

export default function Catalogos() {
  const [datos, setDatos] = useState<CatalogosData>({
    empresas: [],
    unidades: [],
    areas: []
  });

  const [inputs, setInputs] = useState({
    empresa: '',
    unidad: '',
    area: ''
  });

  const [loading, setLoading] = useState<boolean>(true);

  // useCallback para evitar advertencias de dependencias en useEffect
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [resE, resU, resA] = await Promise.all([
        fetch(`${API_URL}/catalogos/empresas`, { headers: getHeaders() }),
        fetch(`${API_URL}/catalogos/unidades`, { headers: getHeaders() }),
        fetch(`${API_URL}/catalogos/areas`, { headers: getHeaders() })
      ]);

      setDatos({
        empresas: resE.ok ? await resE.json() : [],
        unidades: resU.ok ? await resU.json() : [],
        areas: resA.ok ? await resA.json() : []
      });
    } catch (e) {
      console.error("Error cargando catálogos", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCrear = async (tipo: 'empresas' | 'unidades' | 'areas', valor: string) => {
    if (!valor.trim()) return;
    try {
      const res = await fetch(`${API_URL}/catalogos/${tipo}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ nombre: valor })
      });
      if (res.ok) {
        // Limpiar el input correspondiente
        const key = tipo === 'empresas' ? 'empresa' : tipo === 'unidades' ? 'unidad' : 'area';
        setInputs(prev => ({ ...prev, [key]: '' }));
        cargarDatos();
      }
    } catch (e) {
      console.error("Error al crear", e);
    }
  };

  const handleBorrar = async (tipo: 'empresas' | 'unidades' | 'areas', id: number) => {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
      const res = await fetch(`${API_URL}/catalogos/${tipo}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) cargarDatos();
    } catch (e) {
      console.error("Error al borrar", e);
    }
  };

  if (loading && datos.empresas.length === 0) {
    return <div className={styles.loading}>Cargando catálogos del servidor...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>PANEL ADMINISTRATIVO</h2>
        <p>Gestión de catálogos globales</p>
      </header>

      <div className={styles.grid}>
        {/* SECCIÓN EMPRESAS */}
        <section className={styles.glassCard}>
          <h3>🏢 Empresas</h3>
          <div className={styles.inputGroup}>
            <input
              value={inputs.empresa}
              onChange={e => setInputs({ ...inputs, empresa: e.target.value })}
              placeholder="Nombre de la empresa"
            />
            <button onClick={() => handleCrear('empresas', inputs.empresa)}>Añadir</button>
          </div>
          <div className={styles.list}>
            {datos.empresas.map((e) => (
              <div key={e.id} className={styles.item}>
                <span>{e.nombre}</span>
                <button onClick={() => handleBorrar('empresas', e.id)}>🗑️</button>
              </div>
            ))}
          </div>
        </section>

        {/* SECCIÓN ÁREAS */}
        <section className={styles.glassCard}>
          <h3>📂 Áreas</h3>
          <div className={styles.inputGroup}>
            <input
              value={inputs.area}
              onChange={e => setInputs({ ...inputs, area: e.target.value })}
              placeholder="Nombre del área"
            />
            <button onClick={() => handleCrear('areas', inputs.area)}>Añadir</button>
          </div>
          <div className={styles.list}>
            {datos.areas.map((a) => (
              <div key={a.id} className={styles.item}>
                <span>{a.nombre}</span>
                <button onClick={() => handleBorrar('areas', a.id)}>🗑️</button>
              </div>
            ))}
          </div>
        </section>

        {/* SECCIÓN UNIDADES */}
        <section className={styles.glassCard}>
          <h3>📏 Unidades</h3>
          <div className={styles.inputGroup}>
            <input
              value={inputs.unidad}
              onChange={e => setInputs({ ...inputs, unidad: e.target.value })}
              placeholder="Unidad (Ej: Kg, Pieza)"
            />
            <button onClick={() => handleCrear('unidades', inputs.unidad)}>Añadir</button>
          </div>
          <div className={styles.list}>
            {datos.unidades.map((u) => (
              <div key={u.id} className={styles.item}>
                <span>{u.nombre}</span>
                <button onClick={() => handleBorrar('unidades', u.id)}>🗑️</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
