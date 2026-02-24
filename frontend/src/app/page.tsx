"use client";
import { useState } from "react";
import styles from "./page.module.css";

// Importación de componentes
import Catalogo from "@/components/catalogo/Catalogo";
import NuevaSolicitud from "@/components/nuevaSolicitud/NuevaSolicitud";
import Almacen from "@/components/almacen/Almacen";
import Cotizacion from "@/components/cotizacion/Cotizacion";
import Autorizar from "@/components/autorizacion/Autorizacion";
import Comprar from "@/components/compras/comprar";
import Dashboard from "@/components/dashboard/Dashboard"; // <--- NUEVA IMPORTACIÓN

export default function MainApp() {
  const [seccion, setSeccion] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "DASHBOARD", icon: "📊" },
    { id: "nueva", label: "SOLICITUDES", icon: "📝" },
    { id: "almacen", label: "ALMACÉN", icon: "📦" },
    { id: "cotizacion", label: "COTIZACIÓN", icon: "⚖️" },
    { id: "autorizar", label: "AUTORIZAR", icon: "🔑" },
    { id: "comprar", label: "COMPRAR", icon: "🛒" },
    { id: "recibido", label: "RECIBIDO", icon: "📥" },
    { id: "admin", label: "ADMIN", icon: "⚙️" }
  ];

  const renderSeccion = () => {
    switch (seccion) {
      // ACTUALIZADO: Ahora renderiza el componente real
      case "dashboard": return <Dashboard />;

      case "nueva": return <NuevaSolicitud />;
      case "almacen": return <Almacen />;
      case "cotizacion": return <Cotizacion />;
      case "autorizar": return <Autorizar />;
      case "comprar": return <Comprar />;
      case "recibido": return <div className={styles.placeholder}>📥 Módulo de Recepción y Entrega</div>;
      case "admin": return <Catalogo />;
      default: return <div className={styles.placeholder}>Seleccione una opción</div>;
    }
  };

  return (
    <div className={styles.mainWrapper}>
      {/* NAVBAR ESTILO VIP */}
      <nav className={styles.navbar}>
        <div className={styles.logoArea}>
          <span className={styles.logoIcon}>💎</span>
          <span className={styles.logoText}>SISTEMA <br/><b>COMPRAS</b></span>
        </div>

        <div className={styles.navLinks}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSeccion(item.id)}
              className={`${styles.navBtn} ${seccion === item.id ? styles.active : ""}`}
            >
              <span className={styles.btnIcon}>{item.icon}</span>
              <span className={styles.btnLabel}>{item.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>A</div>
        </div>
      </nav>

      {/* ÁREA DE CONTENIDO */}
      <main className={styles.contentArea}>
        {renderSeccion()}
      </main>
    </div>
  );
}
