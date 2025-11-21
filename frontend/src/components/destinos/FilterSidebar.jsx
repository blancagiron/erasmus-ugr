import { useState, useEffect } from "react";
import {
  Search, MapPin, Languages, BookOpen,
  Plus, X, ChevronDown, ListFilter,
  Filter, RefreshCw
} from "lucide-react";
import AsignaturasSearch from "./AsignaturasSearch";

export default function FilterSidebar({ filtro, setFiltro, paises, idiomas, cursos }) {
  const [busqueda, setBusqueda] = useState("");
  const [asignaturasGrado, setAsignaturasGrado] = useState([]);
  const [asignaturasSuperadas, setAsignaturasSuperadas] = useState([]);
  const [asignaturasTemp, setAsignaturasTemp] = useState([]);
  const [seccionExpandida, setSeccionExpandida] = useState({
    basicos: true,
    asignaturas: true,
    avanzados: false,
    preferencias: false
  });

  useEffect(() => {
    const usuarioRaw = localStorage.getItem("usuario");
    if (!usuarioRaw) return;

    const usuario = JSON.parse(usuarioRaw);
    const { email, codigo_grado, asignaturas_superadas } = usuario;

    if (codigo_grado) {
      fetch(`http://localhost:5000/api/asignaturas?codigo_grado=${codigo_grado}`)
        .then(res => res.json())
        .then(data => setAsignaturasGrado(data));
    }

    if (asignaturas_superadas) {
      setAsignaturasSuperadas(asignaturas_superadas);
    } else if (email) {
      fetch(`http://localhost:5000/usuarios/${email}`)
        .then(res => res.json())
        .then(data => setAsignaturasSuperadas(data.asignaturas_superadas || []));
    }
  }, []);

  const normalizar = (texto) =>
    texto?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filtrar = asignaturasGrado.filter(
    (a) =>
      (normalizar(a.nombre).includes(normalizar(busqueda)) ||
        normalizar(a.codigo).includes(normalizar(busqueda))) &&
      !asignaturasSuperadas.includes(a.codigo)
  );

  const toggleAsignatura = (codigo) => {
    setAsignaturasTemp((prev) =>
      prev.includes(codigo)
        ? prev.filter((c) => c !== codigo)
        : [...prev, codigo]
    );
  };

  const aplicarFiltros = () => {
    setFiltro({ ...filtro, asignaturas: asignaturasTemp });
  };

  const limpiarFiltros = () => {
    setFiltro({
      pais: "",
      idioma: "",
      curso: "",
      asignaturas: []
    });
    setAsignaturasTemp([]);
    setBusqueda("");
  };

  const toggleSeccion = (seccion) => {
    setSeccionExpandida(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  const SeccionExpandible = ({ titulo, icono: Icono, nombre, children }) => (
    <div className="mb-6 border-b border-gray-100 pb-6 last:border-b-0">
      <button
        onClick={() => toggleSeccion(nombre)}
        className="flex items-center justify-between w-full mb-3 text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icono className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">{titulo}</h3>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${seccionExpandida[nombre] ? 'rotate-180' : ''
            }`}
        />
      </button>
      {seccionExpandida[nombre] && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full lg:w-80 bg-white rounded-2xl shadow-lg p-6 h-fit max-h-screen overflow-y-auto">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ListFilter className="w-5 h-5 text-gray-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Filtros</h2>
        </div>
        <button
          onClick={limpiarFiltros}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Limpiar
        </button>
      </div>

      {/* Filtros básicos */}
      <SeccionExpandible titulo="Filtros Básicos" icono={Filter} nombre="basicos">
        {/* País */}
        <div>
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4" />
            País de destino
          </label>
          <select
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            value={filtro.pais}
            onChange={(e) => setFiltro({ ...filtro, pais: e.target.value })}
          >
            <option value="">Todos los países</option>
            {paises.map((pais) => (
              <option key={pais} value={pais}>{pais}</option>
            ))}
          </select>
        </div>

        {/* Idioma */}
        <div>
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
            <Languages className="w-4 h-4" />
            Idioma de instrucción
          </label>
          <select
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            value={filtro.idioma}
            onChange={(e) => setFiltro({ ...filtro, idioma: e.target.value })}
          >
            <option value="">Todos los idiomas</option>
            {idiomas.map((idioma) => (
              <option key={idioma} value={idioma}>{idioma}</option>
            ))}
          </select>
        </div>

        {/* Curso */}
        <div>
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
            <BookOpen className="w-4 h-4" />
            Curso académico
          </label>
          <select
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            value={filtro.curso}
            onChange={(e) => setFiltro({ ...filtro, curso: e.target.value })}
          >
            <option value="">Todos los cursos</option>
            {cursos.map((c) => (
              <option key={c} value={c}>{`${c}º Curso`}</option>
            ))}
          </select>
        </div>
      </SeccionExpandible>

      {/* Búsqueda por asignaturas */}
      <SeccionExpandible titulo="Asignaturas a Convalidar" icono={BookOpen} nombre="asignaturas">
        <AsignaturasSearch
          asignaturasGrado={asignaturasGrado}
          asignaturasSuperadas={asignaturasSuperadas}
          value={asignaturasTemp}
          onChange={setAsignaturasTemp}
          maxSugerencias={10}
        />
      </SeccionExpandible>

      {/* Botón aplicar */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={aplicarFiltros}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition"
        >
          Búsqueda
        </button>
      </div>
    </div>
  );
}
