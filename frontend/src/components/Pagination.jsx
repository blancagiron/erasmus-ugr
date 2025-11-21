import boton1 from "../assets/landing/estrella_roja_activa_pagina.svg";
import boton2 from "../assets/landing/estrella_roja_pagina.svg";

export default function Pagination({ total, actual, setActual }) {
  if (total <= 1) return null;

  const maxVisible = 5;
  const half = Math.floor(maxVisible / 2);

  let start = Math.max(1, actual - half);
  let end = Math.min(total, start + maxVisible - 1);

  // ajusta el inicio si estamos cerca del final
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const visiblePages = [];
  for (let i = start; i <= end; i++) {
    visiblePages.push(i);
  }

  return (
    <div className="flex justify-center items-center mt-6">
      {/* Anterior */}
      {actual > 1 && (
        <button
          onClick={() => setActual(actual - 1)}
          className="mr-3 p-2 bg-red-500 text-black rounded-full hover:bg-red-700 transition-transform hover:scale-110"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Números */}
      {visiblePages.map((page) => {
        const isActive = actual === page;
        return (
          <button
            key={page}
            onClick={() => setActual(page)}
            className="mx-1 relative transition-transform hover:scale-110"
          >
            <img
              src={isActive ? boton2 : boton1}
              alt={`Página ${page}`}
              className="w-12 h-12 drop-shadow-sm"
            />
            <span className={`absolute inset-0 flex items-center justify-center text-lg font-normal ${
              isActive ? "text-white" : "text-black"
            }`}>
              {page}
            </span>
          </button>
        );
      })}

      {/* Siguiente */}
      {actual < total && (
        <button
          onClick={() => setActual(actual + 1)}
          className="ml-3 p-2 bg-red-500 text-black rounded-full hover:bg-red-700 transition-transform hover:scale-110"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}