// src/app/layout.tsx
import SidebarLeft from "../components/SidebarLeft/SidebarLeft";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="app-container">
          {/* Columna Izquierda: Sidebar */}
          <aside className="sidebar-container">
            <SidebarLeft />
          </aside>

          {/* Columna Derecha: Contenido dinámico */}
          <main className="main-content-grid">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
