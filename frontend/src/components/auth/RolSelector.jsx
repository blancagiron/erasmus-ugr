import React from 'react';
import TarjetaEstudiante from '../../assets/auth/tarjeta_estudiante_1.svg';
import TarjetaTutor from '../../assets/auth/tarjeta_tutor.svg';

export default function RolSelector({ seleccionarRol }) {
  const handleSeleccion = (rol) => {
    seleccionarRol(rol); // Esto cambia el modo a "registro" desde Auth.jsx
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl p-8">
      {/* Título */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-black" style={{ fontFamily: "Inter, sans-serif" }}>
          Bienvenido
        </h1>
        <p className="text-red-500 text-lg mt-1 font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>
          ¿Eres...?
        </p>
      </div>

      {/* Selección de rol */}
      <div className="flex gap-8 justify-center items-center">
        <div className="flex flex-col items-center">
          <img
            src={TarjetaEstudiante}
            alt="Estudiante"
            className="cursor-pointer hover:scale-105 transition-transform duration-200 w-48 h-48"
            onClick={() => handleSeleccion("estudiante")}
          />
          <span className="text-gray-800 font-semibold text-lg mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
            Alumno/a
          </span>
        </div>

        <div className="flex flex-col items-center">
          <img
            src={TarjetaTutor}
            alt="Tutor"
            className="cursor-pointer hover:scale-105 transition-transform duration-200 w-48 h-48"
            onClick={() => handleSeleccion("tutor")}
          />
          <span className="text-gray-800 font-semibold text-lg mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
            Tutor/a
          </span>
        </div>
      </div>
    </div>
  );
}
