'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from './Catalogo.module.css';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';
import { CatalogosData, Empresa, Unidad, Area } from '@/types';

export default function Catalogos() {
  // Uso de interfaz CatalogosData para eliminar 'any'
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

  const cargarDatos = useCallback(async () => {
    try {
      const headers = getHeaders();
      const [resE, resU, resA] = await Promise.all([
        fetch(ENDPOINTS.CATALOGOS.EMPRESAS, { headers }),
        fetch(ENDPOINTS.CATALOGOS.UNIDADES, { headers }),
        fetch(ENDPOINTS.CATALOGOS.AREAS, { headers })
      ]);

      setDatos({
        empresas: resE.ok ? await resE.json() : [],
        unidades: resU.ok ? await resU.json() : [],
        areas: resA.ok ? await resA.json() : []
      });
    } catch (e) {
      console.error("Error cargando catálogos", e);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const handleCrear = async (tipo: 'empresas' | 'unidades' | 'areas', nombre: string) => {
    if (!nombre.trim()) return;
    try {
      // Selección dinámica de endpoint
      const url = tipo === 'empresas' ? ENDPOINTS.CATALOGOS.EMPRESAS
                : tipo === 'unidades' ? ENDPOINTS.CATALOGOS.UNIDADES
                : ENDPOINTS.CATALOGOS.AREAS;

      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ nombre })
      });

      if (res.ok) {
        const inputKey = tipo === 'areas' ? 'area' : tipo === 'unidades' ? 'unidad' : 'empresa';
        setInputs({ ...inputs, [inputKey]: '' });
        cargarDatos();
      }
    } catch (e) {
      console.error("Error al crear:", e);
    }
  };

  const handleBorrar = async (tipo: 'empresas' | 'unidades' | 'areas', id: number) => {
    if (!confirm('¿Eliminar registro?')) return;
    try {
      const baseUrl = tipo === 'empresas' ? ENDPOINTS.CATALOGOS.EMPRESAS
                    : tipo === 'unidades' ? ENDPOINTS.CATALOGOS.UNIDADES
                    : ENDPOINTS.CATALOGOS.AREAS;

      const res = await fetch(`${baseUrl}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (res.ok) cargarDatos();
    } catch (e) {
      console.error("Error al borrar:", e);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>GESTIÓN DE CATÁLOGOS</h1>
        <p>Configuración base del sistema de compras</p>
      </header>

      <div className={styles.grid}>
        {/* EMPRESAS */}
        <section className={styles.glassCard}>
          <h3>🏢 Empresas</h3>
          <div className={styles.inputGroup}>
            <input
              value={inputs.empresa}
              onChange={e => setInputs({...inputs, empresa: e.target.value})}
              placeholder="Empresa"
            />
            <button onClick={() => handleCrear('empresas', inputs.empresa)}>Añadir</button>
          </div>
          <div className={styles.list}>
            {datos.empresas.map((e: Empresa) => (
              <div key={e.id} className={styles.item}>
                <span>{e.nombre}</span>
                <button onClick={() => handleBorrar('empresas', e.id)}>🗑️</button>
              </div>
            ))}
          </div>
        </section>

        {/* ÁREAS */}
        <section className={styles.glassCard}>
          <h3>🔧 Áreas</h3>
          <div className={styles.inputGroup}>
            <input
              value={inputs.area}
              onChange={e => setInputs({...inputs, area: e.target.value})}
              placeholder="Area"
            />
            <button onClick={() => handleCrear('areas', inputs.area)}>Añadir</button>
          </div>
          <div className={styles.list}>
            {datos.areas.map((a: Area) => (
              <div key={a.id} className={styles.item}>
                <span>{a.nombre}</span>
                <button onClick={() => handleBorrar('areas', a.id)}>🗑️</button>
              </div>
            ))}
          </div>
        </section>

        {/* UNIDADES */}
        <section className={styles.glassCard}>
          <h3>📏 Unidades</h3>
          <div className={styles.inputGroup}>
            <input
              value={inputs.unidad}
              onChange={e => setInputs({...inputs, unidad: e.target.value})}
              placeholder="Unidades"
            />
            <button onClick={() => handleCrear('unidades', inputs.unidad)}>Añadir</button>
          </div>
          <div className={styles.list}>
            {datos.unidades.map((u: Unidad) => (
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
