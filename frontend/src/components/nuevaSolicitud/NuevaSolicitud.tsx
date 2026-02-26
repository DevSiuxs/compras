'use client';
import { useState, useEffect } from 'react';
import styles from './NuevaSolicitud.module.css';
import { Empresa, Unidad, Area, CreateSolicitudDTO } from '@/types';
import { ENDPOINTS, getHeaders } from '@/config/apiConfig';

interface CatalogosState {
  empresas: Empresa[];
  unidades: Unidad[];
  areas: Area[];
}

export default function NuevaSolicitud() {
  const [catalogos, setCatalogos] = useState<CatalogosState>({
    empresas: [],
    unidades: [],
    areas: []
  });

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    idEmpresa: '',
    idArea: '',
    justificacion: '',
    material: '',
    cantidad: 1,
    idUnidad: ''
  });

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const headers = getHeaders();
        const [resE, resU, resA] = await Promise.all([
          fetch(ENDPOINTS.CATALOGOS.EMPRESAS, { headers }),
          fetch(ENDPOINTS.CATALOGOS.UNIDADES, { headers }),
          fetch(ENDPOINTS.CATALOGOS.AREAS, { headers })
        ]);

        setCatalogos({
          empresas: resE.ok ? await resE.json() : [],
          unidades: resU.ok ? await resU.json() : [],
          areas: resA.ok ? await resA.json() : []
        });
      } catch (error) {
        console.error("Error al cargar catálogos:", error);
      }
    };
    cargarCatalogos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de seguridad
    if (!form.idEmpresa || !form.idArea || !form.idUnidad) {
      alert("Por favor, selecciona todos los campos obligatorios.");
      return;
    }

    setLoading(true);

    try {
      // 1. Construimos el Payload asegurando el tipado numérico que pide el DTO
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

      // 2. Enviamos al endpoint configurado
      const res = await fetch(ENDPOINTS.SOLICITUDES.CREAR, {
        method: 'POST',
        headers: getHeaders(), // Esto incluye Content-Type: application/json
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("✨ Solicitud enviada con éxito");
        // Limpiamos el formulario
        setForm({ idEmpresa: '', idArea: '', justificacion: '', material: '', cantidad: 1, idUnidad: '' });
      } else {
        const errorMsg = await res.json();
        console.error("Respuesta de error del servidor:", errorMsg);
        alert(`Error al enviar: ${errorMsg.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.glassCard}>
        <header className={styles.header}>
          <h1>Nueva Solicitud</h1>

        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>EMPRESA</label>
              <select
                required
                value={form.idEmpresa}
                onChange={e => setForm({...form, idEmpresa: e.target.value})}
              >
                <option value="">Seleccione...</option>
                {catalogos.empresas.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>ÁREA SOLICITANTE</label>
              <select
                required
                value={form.idArea}
                onChange={e => setForm({...form, idArea: e.target.value})}
              >
                <option value="">Seleccione...</option>
                {catalogos.areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label>DESCRIPCIÓN DEL MATERIAL</label>
            <input
              required
              type="text"
              placeholder="¿Qué necesita?"
              value={form.material}
              onChange={e => setForm({...form, material: e.target.value})}
            />
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label>CANTIDAD</label>
              <input
                required
                type="number"
                min="1"
                value={form.cantidad}
                onChange={e => setForm({...form, cantidad: Number(e.target.value)})}
              />
            </div>

            <div className={styles.field}>
              <label>UNIDAD DE MEDIDA</label>
              <select
                required
                value={form.idUnidad}
                onChange={e => setForm({...form, idUnidad: e.target.value})}
              >
                <option value="">Seleccione...</option>
                {catalogos.unidades.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label>JUSTIFICACIÓN</label>
            <textarea
              required
              placeholder="Indique el motivo de la compra"
              value={form.justificacion}
              onChange={e => setForm({...form, justificacion: e.target.value})}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'PROCESANDO...' : 'GENERAR SOLICITUD'}
          </button>
        </form>
      </div>
    </div>
  );
}
