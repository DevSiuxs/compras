'use client';
import { useState, useEffect, useCallback } from 'react';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';
import { CatalogosData, CreateSolicitudDTO } from '@/types';
import styles from './NuevaSolicitud.module.css';

export default function NuevaSolicitud() {
  const [catalogos, setCatalogos] = useState<CatalogosData>({
    empresas: [],
    unidades: [],
    areas: []
  });

  // Agregamos la variable que faltaba
  const [loading, setLoading] = useState<boolean>(false);

  const [form, setForm] = useState({
    idEmpresa: '',
    idArea: '',
    justificacion: '',
    material: '',
    cantidad: 1,
    idUnidad: ''
  });

  const cargarCatalogos = useCallback(async () => {
    try {
      const [resE, resU, resA] = await Promise.all([
        fetch(ENDPOINTS.CATALOGOS.EMPRESAS, { headers: getHeaders() }),
        fetch(ENDPOINTS.CATALOGOS.UNIDADES, { headers: getHeaders() }),
        fetch(ENDPOINTS.CATALOGOS.AREAS, { headers: getHeaders() })
      ]);

      setCatalogos({
        empresas: resE.ok ? await resE.json() : [],
        unidades: resU.ok ? await resU.json() : [],
        areas: resA.ok ? await resA.json() : []
      });
    } catch (e) {
      console.error("Error al cargar catálogos:", e);
    }
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: CreateSolicitudDTO = {
      idEmpresa: Number(form.idEmpresa),
      idArea: Number(form.idArea),
      justificacion: form.justificacion,
      items: [{
        descripcion: form.material,
        cantidad: Number(form.cantidad),
        idUnidad: Number(form.idUnidad)
      }]
    };

    try {
      const res = await fetch(ENDPOINTS.SOLICITUDES.CREAR, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("¡Solicitud Generada con Éxito!");
        setForm({
          idEmpresa: '',
          idArea: '',
          justificacion: '',
          material: '',
          cantidad: 1,
          idUnidad: ''
        });
      } else {
        alert("Error al crear la solicitud");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>NUEVA SOLICITUD DE COMPRA</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>EMPRESA</label>
              <select
                required
                value={form.idEmpresa}
                onChange={e => setForm({...form, idEmpresa: e.target.value})}
              >
                <option value="">Seleccione...</option>
                {catalogos.empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>ÁREA</label>
              <select
                required
                value={form.idArea}
                onChange={e => setForm({...form, idArea: e.target.value})}
              >
                <option value="">Seleccione...</option>
                {catalogos.areas.map(area => (
                  <option key={area.id} value={area.id}>{area.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.sectionTitle}>DETALLE DEL PRODUCTO</div>
          <div className={styles.gridThree}>
            <div className={styles.field}>
              <label>MATERIAL</label>
              <input
                required
                value={form.material}
                onChange={e => setForm({...form, material: e.target.value})}
              />
            </div>
            <div className={styles.field}>
              <label>CANTIDAD</label>
              <input
                type="number"
                required
                value={form.cantidad}
                onChange={e => setForm({...form, cantidad: Number(e.target.value)})}
              />
            </div>
            <div className={styles.field}>
              <label>UNIDAD</label>
              <select
                required
                value={form.idUnidad}
                onChange={e => setForm({...form, idUnidad: e.target.value})}
              >
                <option value="">...</option>
                {catalogos.unidades.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label>JUSTIFICACIÓN</label>
            <textarea
              required
              value={form.justificacion}
              onChange={e => setForm({...form, justificacion: e.target.value})}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'ENVIANDO...' : 'GENERAR FOLIO'}
          </button>
        </form>
      </div>
    </div>
  );
}
