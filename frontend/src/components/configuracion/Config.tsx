"use client";
import { useState, useEffect } from 'react';
import styles from './Config.module.css';

export default function Config() {
  const [catalogos, setCatalogos] = useState({
    empresas: [], proveedores: [], categorias: [], tipos: [], prioridades: []
  });

  // Formularios (Todos con Inputs de texto, sin selects)
  const [empresaForm, setEmpresaForm] = useState({ nombre: '', presupuesto: '' });
  const [provForm, setProvForm] = useState({
    nombre: '', razonSocial: '', rfc: '', clabe: '', banco: '', tipo: '', categoria: ''
  });
  const [catForm, setCatForm] = useState({ nombre: '' });
  const [tipoForm, setTipoForm] = useState({ nombre: '' });

  const refresh = async () => {
    try {
      const endpoints = ['empresas', 'proveedores', 'categorias', 'tipos', 'prioridades'];
      const results = await Promise.all(
        endpoints.map(async (e) => {
          const res = await fetch(`http://localhost:3000/catalogos/${e}`);
          if (!res.ok) return [];
          return res.json();
        })
      );
      setCatalogos({
        empresas: results[0], proveedores: results[1],
        categorias: results[2], tipos: results[3], prioridades: results[4]
      });
    } catch (err) { console.error("Error conexión:", err); }
  };

  useEffect(() => { refresh(); }, []);

  const handlePost = async (endpoint: string, data: any, reset: () => void) => {
    try {
      const res = await fetch(`http://localhost:3000/catalogos/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) { reset(); refresh(); }
    } catch (e) { alert("Error al guardar"); }
  };

  const handleDelete = async (endpoint: string, id: number) => {
    if (!confirm("¿Eliminar este registro permanentemente?")) return;
    try {
      await fetch(`http://localhost:3000/catalogos/${endpoint}/${id}`, { method: 'DELETE' });
      refresh();
    } catch (e) { alert("Error al eliminar"); }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.neonText}>Panel de Configuración</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* PROVEEDORES */}
        <div className={styles.glassCard}>
          <h2 className="text-[#39ff14] mb-4 font-bold uppercase">Alta Proveedores</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handlePost('proveedores', provForm, () => setProvForm({nombre:'', razonSocial:'', rfc:'', clabe:'', banco:'', tipo:'', categoria:''}));
          }} className="grid grid-cols-2 gap-3">
            <input className={styles.inputDark} placeholder="Nombre Comercial" value={provForm.nombre} onChange={e=>setProvForm({...provForm, nombre:e.target.value})} required />
            <input className={styles.inputDark} placeholder="Razón Social" value={provForm.razonSocial} onChange={e=>setProvForm({...provForm, razonSocial:e.target.value})} required />
            <input className={styles.inputDark} placeholder="RFC" value={provForm.rfc} onChange={e=>setProvForm({...provForm, rfc:e.target.value})} required />
            <input className={styles.inputDark} placeholder="CLABE" value={provForm.clabe} onChange={e=>setProvForm({...provForm, clabe:e.target.value})} required />
            <input className={styles.inputDark} placeholder="Banco" value={provForm.banco} onChange={e=>setProvForm({...provForm, banco:e.target.value})} required />
            <input className={styles.inputDark} placeholder="Tipo (Nacional/Ext)" value={provForm.tipo} onChange={e=>setProvForm({...provForm, tipo:e.target.value})} required />
            <input className={styles.inputDark} placeholder="Categoría" value={provForm.categoria} onChange={e=>setProvForm({...provForm, categoria:e.target.value})} required />
            <button className={styles.btnNeon}>Guardar</button>
          </form>
        </div>

        {/* EMPRESAS */}
        <div className={styles.glassCard}>
          <h2 className="text-[#39ff14] mb-4 font-bold uppercase">Alta Empresa</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handlePost('empresas', { nombre: empresaForm.nombre, presupuesto: Number(empresaForm.presupuesto) }, () => setEmpresaForm({nombre:'', presupuesto:''}));
          }} className="space-y-4">
            <input className={styles.inputDark} placeholder="Nombre Empresa" value={empresaForm.nombre} onChange={e=>setEmpresaForm({...empresaForm, nombre:e.target.value})} required />
            <input className={styles.inputDark} type="number" placeholder="Presupuesto" value={empresaForm.presupuesto} onChange={e=>setEmpresaForm({...empresaForm, presupuesto:e.target.value})} required />
            <button className={styles.btnNeon + " w-full"}>Guardar Empresa</button>
          </form>
        </div>
      </div>

      <hr className="border-zinc-800 my-10" />

      {/* SECCIÓN DE BORRADO Y GESTIÓN */}
      <h2 className={styles.neonText + " text-2xl mb-6 text-center"}>Gestión de Datos en BD</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Lista Empresas */}
        <div className={styles.glassCard}>
          <h3 className="text-sm font-bold text-zinc-500 mb-3 uppercase">Empresas</h3>
          <div className="max-h-40 overflow-y-auto">
            {catalogos.empresas.map((item: any) => (
              <div key={item.id} className={styles.listItem}>
                <span>{item.nombre}</span>
                <button onClick={() => handleDelete('empresas', item.id)} className="text-red-500 font-bold ml-2 hover:scale-125 transition">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Lista Proveedores */}
        <div className={styles.glassCard}>
          <h3 className="text-sm font-bold text-zinc-500 mb-3 uppercase">Proveedores</h3>
          <div className="max-h-40 overflow-y-auto">
            {catalogos.proveedores.map((item: any) => (
              <div key={item.id} className={styles.listItem}>
                <span>{item.nombre}</span>
                <button onClick={() => handleDelete('proveedores', item.id)} className="text-red-500 font-bold ml-2 hover:scale-125 transition">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Otros (Categorías/Tipos) */}
        <div className={styles.glassCard}>
          <h3 className="text-sm font-bold text-zinc-500 mb-3 uppercase">Clasificaciones</h3>
          <div className="flex gap-2 mb-4">
             <input className={styles.inputDark} placeholder="Categoría..." value={catForm.nombre} onChange={e=>setCatForm({nombre:e.target.value})} />
             <button onClick={()=>handlePost('categorias', catForm, ()=>setCatForm({nombre:''}))} className={styles.btnNeon}>+</button>
          </div>
          <div className="max-h-32 overflow-y-auto border-t border-zinc-800 pt-2">
            {catalogos.categorias.map((item: any) => (
              <div key={item.id} className={styles.listItem}>
                <span>{item.nombre}</span>
                <button onClick={() => handleDelete('categorias', item.id)} className="text-red-500 font-bold ml-2">×</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
