'use client';
import { useState, useEffect } from 'react';
import styles from './NuevaSolicitud.module.css';

export default function NuevaSolicitud() {
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);

  // Estados para los 6 inputs requeridos
  const [material, setMaterial] = useState('');      // 1. Material
  const [cantidad, setCantidad] = useState(1);        // 2. Cantidad
  const [idUnidad, setIdUnidad] = useState('');       // 3. Unidad (Catálogo)
  const [justificacion, setJustificacion] = useState(''); // 4. Justificación
  const [area, setArea] = useState('');               // 5. Área (Texto libre)
  const [idEmpresa, setIdEmpresa] = useState('');     // 6. Empresa (Catálogo)

  // Carga de catálogos desde el backend (Puerto 3000)
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        // Apuntamos al puerto 3000 y a la ruta /catalogos que usa tu componente Catalogo.tsx
        const [resE, resU] = await Promise.all([
          fetch('http://localhost:3000/catalogos/empresas'),
          fetch('http://localhost:3000/catalogos/unidades')
        ]);

        if (resE.ok) setEmpresas(await resE.json());
        if (resU.ok) setUnidades(await resU.json());
      } catch (error) {
        console.error("Error al conectar con la API de catálogos:", error);
      }
    };
    cargarCatalogos();
  }, []);

  const handleEnviar = async () => {
    // Validación: El área ahora se valida como texto (string)
    if (!idEmpresa || !area || !justificacion || !material || !idUnidad) {
      return alert('Por favor, completa los 6 campos obligatorios.');
    }

    const data = {
      idEmpresa: Number(idEmpresa),
      area: area, // Se envía como texto plano para el nuevo schema
      justificacion,
      items: [{
        descripcion: material,
        cantidad: Number(cantidad),
        idUnidad: Number(idUnidad)
      }]
    };

    try {
      const res = await fetch('http://localhost:3000/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert('Solicitud creada con éxito');
        // Limpiar formulario
        setMaterial('');
        setCantidad(1);
        setIdUnidad('');
        setJustificacion('');
        setArea('');
        setIdEmpresa('');
      } else {
        alert('Error al guardar la solicitud en el servidor');
      }
    } catch (error) {
      alert('Error de conexión con el backend');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className="text-[#00ff41] shadow-neon mb-6 font-bold text-xl uppercase tracking-widest">
        Nueva Solicitud de Compra
      </h2>

      <div className="grid grid-cols-1 gap-6 bg-[#111] p-6 border border-[#00ff41]/20 rounded-lg">

        {/* Fila 1: Material, Cantidad y Unidad */}
        <div className="flex flex-wrap md:flex-nowrap gap-4">
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 block mb-1">1. MATERIAL / PRODUCTO</label>
            <input
              className={styles.input}
              placeholder="¿Qué se necesita?"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            />
          </div>
          <div className="w-24">
            <label className="text-[10px] text-gray-400 block mb-1">2. CANT.</label>
            <input
              type="number"
              className={styles.input}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
            />
          </div>
          <div className="w-40">
            <label className="text-[10px] text-gray-400 block mb-1">3. UNIDAD</label>
            <select
              className={styles.input}
              value={idUnidad}
              onChange={(e) => setIdUnidad(e.target.value)}
            >
              <option value="">Selecciona...</option>
              {unidades.map((u: any) => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila 2: Justificación */}
        <div>
          <label className="text-[10px] text-gray-400 block mb-1">4. JUSTIFICACIÓN DE COMPRA</label>
          <textarea
            className={`${styles.input} min-h-[80px]`}
            placeholder="Explica brevemente la necesidad..."
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
          />
        </div>

        {/* Fila 3: Área y Empresa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">5. ÁREA (ESCRIBE EL NOMBRE)</label>
            <input
              className={styles.input}
              placeholder="Ej: Mantenimiento, Sistemas..."
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">6. EMPRESA SOLICITANTE</label>
            <select
              className={styles.input}
              value={idEmpresa}
              onChange={(e) => setIdEmpresa(e.target.value)}
            >
              <option value="">Selecciona Empresa...</option>
              {empresas.map((e: any) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={handleEnviar} className={styles.btnNeon}>
          GENERAR FOLIO DE SOLICITUD
        </button>
      </div>
    </div>
  );
}
