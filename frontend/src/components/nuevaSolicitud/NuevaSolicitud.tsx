'use client';
import { useState, useEffect } from 'react';
import styles from './NuevaSolicitud.module.css';

// Definimos una interfaz para los catálogos para que TS no use 'never'
interface CatalogosState {
  empresas: any[];
  unidades: any[];
  areas: any[];
}

export default function NuevaSolicitud() {
  // 1. Corregimos el error asignando el tipo a la interfaz definida arriba
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
        const [resE, resU, resA] = await Promise.all([
          fetch('http://localhost:3000/catalogos/empresas'),
          fetch('http://localhost:3000/catalogos/unidades'),
          fetch('http://localhost:3000/catalogos/areas')
        ]);

        const empresas = resE.ok ? await resE.json() : [];
        const unidades = resU.ok ? await resU.json() : [];
        const areas = resA.ok ? await resA.json() : [];

        // Ahora TS aceptará estos datos porque definimos que son any[]
        setCatalogos({
          empresas: Array.isArray(empresas) ? empresas : [],
          unidades: Array.isArray(unidades) ? unidades : [],
          areas: Array.isArray(areas) ? areas : []
        });
      } catch (e) {
        console.error("Error cargando catálogos", e);
      }
    };
    cargarCatalogos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.idEmpresa || !form.idArea || !form.idUnidad) {
      alert("Por favor seleccione todos los campos de los catálogos");
      return;
    }

    setLoading(true);

    const payload = {
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
      const res = await fetch('http://localhost:3000/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("✨ Requisición generada exitosamente");
        setForm({ idEmpresa: '', idArea: '', justificacion: '', material: '', cantidad: 1, idUnidad: '' });
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.glassCard}>
        <header className={styles.header}>
          <div className={styles.iconCircle}>📝</div>
          <div>
            <h1>Nueva Requisición</h1>
            <p>Complete el formulario para iniciar el proceso de compra</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.sectionTitle}>1. Datos de Gestión</div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>EMPRESA</label>
              <select
                required
                value={form.idEmpresa}
                onChange={e => setForm({...form, idEmpresa: e.target.value})}
              >
                <option value="">Seleccione Empresa...</option>
                {catalogos.empresas?.map((e: any) => (
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
                <option value="">Seleccione Área...</option>
                {catalogos.areas?.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.sectionTitle}>2. Especificaciones</div>
          <div className={styles.field}>
            <label>MATERIAL / SERVICIO</label>
            <input
              required
              type="text"
              placeholder="Describa el artículo solicitado..."
              value={form.material}
              onChange={e => setForm({...form, material: e.target.value})}
            />
          </div>

          <div className={styles.row}>
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
                {catalogos.unidades?.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.sectionTitle}>3. Justificación Operativa</div>
          <div className={styles.field}>
            <label>MOTIVO DE LA SOLICITUD</label>
            <textarea
              required
              placeholder="Indique el proyecto o necesidad técnica..."
              value={form.justificacion}
              onChange={e => setForm({...form, justificacion: e.target.value})}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
          </button>
        </form>
      </div>
    </div>
  );
}
