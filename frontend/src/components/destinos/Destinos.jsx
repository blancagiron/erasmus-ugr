import { useState, useEffect } from "react";
import FilterSidebar from "./FilterSidebar";
import UniversityGrid from "../UniversityGrid";
import Pagination from "../Pagination";
import DashboardHeader from "../dashboard/DashboardHeader";
import Sidebar from "../dashboard/Sidebar";
import Hamburguesa from "../dashboard/Hamburguesa";

export default function Destinos() {
  const [universidades, setUniversidades] = useState([]);
  const [filtro, setFiltro] = useState({
    pais: "",
    idioma: "",
    curso: "",
    asignaturas: [],   // 👈 seguimos igual
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [paisesDisponibles, setPaisesDisponibles] = useState([]);
  const [idiomasDisponibles, setIdiomasDisponibles] = useState([]);
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const porPagina = 6;

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const centro = usuario?.codigo_centro;
    const grado = usuario?.codigo_grado;

    const url = new URL("http://localhost:5000/api/destinos");
    if (centro) url.searchParams.append("codigo_centro", centro);
    if (grado) url.searchParams.append("codigo_grado", grado);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setUniversidades(data);

        const paisesSet = new Set();
        const idiomasSet = new Set();
        const cursosSet = new Set();

        data.forEach((uni) => {
          if (uni.pais) paisesSet.add(uni.pais.trim());

          if (uni.requisitos_idioma) {
            uni.requisitos_idioma.split(",").forEach((idioma) => {
              const limpio = idioma.trim().split(" ").pop();
              idiomasSet.add(limpio);
            });
          }

          (uni.cursos || []).forEach((c) => cursosSet.add(c));
        });

        setPaisesDisponibles([...paisesSet].sort());
        setIdiomasDisponibles([...idiomasSet].sort());
        setCursosDisponibles([...cursosSet].sort((a, b) => a - b));
      });
  }, []);

  const universidadesFiltradas = universidades.filter((uni) => {
    const matchPais = !filtro.pais || uni.pais === filtro.pais;
    const matchIdioma =
      !filtro.idioma ||
      (uni.requisitos_idioma || "").toLowerCase().includes(filtro.idioma.toLowerCase());
    const matchCurso =
      !filtro.curso || (uni.cursos || []).includes(parseInt(filtro.curso));
    const matchAsignaturas =
      filtro.asignaturas.length === 0 ||
      filtro.asignaturas.every((codigo) =>
        (uni.asignaturas || []).some(
          (a) => a.codigo_ugr?.toLowerCase() === codigo.toLowerCase()
        )
      );

    return matchPais && matchIdioma && matchCurso && matchAsignaturas;
  });

  const totalPaginas = Math.ceil(universidadesFiltradas.length / porPagina);
  const universidadesPaginadas = universidadesFiltradas.slice(
    (paginaActual - 1) * porPagina,
    paginaActual * porPagina
  );

  return (
    <>
      <Hamburguesa onClick={() => setSidebarVisible((prev) => !prev)} />
      <Sidebar visible={sidebarVisible}>
        <div className="min-h-screen transition-all duration-300">
          <DashboardHeader
            titulo="Destinos Erasmus"
            subtitulo="Filtra y encuentra tu mejor opción"
          />
          <div className="lg:flex px-4 md:px-8 pt-6 max-w-screen-2xl mx-auto w-full gap-6">
            <div className="mb-6 lg:mb-0">
              <FilterSidebar
                filtro={filtro}
                setFiltro={setFiltro}
                paises={paisesDisponibles}
                idiomas={idiomasDisponibles}
                cursos={cursosDisponibles}
              />
            </div>

            <main className="flex-1 px-2 sm:px-4 md:px-0 pb-10">
              {universidadesPaginadas.length > 0 ? (
                <UniversityGrid universidades={universidadesPaginadas} />
              ) : (
                <div className="text-center text-gray-600 mt-12">
                  <p className="text-lg font-medium mb-2">No se encontraron destinos</p>
                  <p className="text-sm">Prueba a cambiar los filtros o buscar otras asignaturas.</p>
                </div>
              )}
              <Pagination
                total={totalPaginas}
                actual={paginaActual}
                setActual={setPaginaActual}
              />
            </main>
          </div>
        </div>
      </Sidebar>
    </>
  );
}

