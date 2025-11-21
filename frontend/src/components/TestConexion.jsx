import React from "react";

export default function TestConexion() {
  const probarRutaUsuarios = async () => {
    const usuario = {
      email: "blanca@correo.ugr.es",
      nombre: "Blanca Ruiz",
      rol: "estudiante",
      grado: "Grado en Ingeniería Informática",
      codigo_centro: "015",
      nivel_idioma: "B2",
      asignaturas_cursadas: ["FBD-015", "IS-015"],
      fecha_registro: new Date().toISOString().split("T")[0]
    };

    try {
      const res = await fetch("http://localhost:5000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
      });

      const data = await res.json();
      console.log("Resultado:", data);
      alert(`Usuario creado: ${data.id || data.message}`);
    } catch (err) {
      console.error("Error al conectar con el backend", err);
      alert("❌ No se pudo conectar con el backend");
    }
  };

  return (
    <div className="p-4">
      <h2>🔌 Probar conexión a /api/usuarios</h2>
      <button
        onClick={probarRutaUsuarios}
        className="bg-red-600 text-white px-4 py-2 rounded mt-2"
      >
        Probar conexión
      </button>
    </div>
  );
}
