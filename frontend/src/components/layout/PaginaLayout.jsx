import { useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import { Menu } from "lucide-react";

export default function PaginaLayout({ children }) {
  const [mostrarSidebar, setMostrarSidebar] = useState(false);

  return (
    <div className="relative min-h-screen bg-stone-100">
      {/* Botón fijo para abrir/cerrar el sidebar */}
      <button
        className="fixed bottom-4 left-4 z-50 p-3 bg-red-600 text-white rounded-full shadow-lg"
        onClick={() => setMostrarSidebar(!mostrarSidebar)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar toggleable */}
      <Sidebar visible={mostrarSidebar} onClose={() => setMostrarSidebar(false)} />

      {/* Contenido con desplazamiento si el sidebar está visible */}
      <main
        className={`transition-all duration-300 ${mostrarSidebar ? "ml-64" : ""} p-6`}
      >
        {children}
      </main>
    </div>
  );
}
