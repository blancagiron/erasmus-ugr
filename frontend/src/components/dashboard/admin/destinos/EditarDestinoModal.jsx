import { useState, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";

export default function EditarDestinoModal({ destino, onClose }) {
  const [indiceRecienCreado, setIndiceRecienCreado] = useState(null);
  const [datos, setDatos] = useState({
    ...destino,
    asignaturas: destino.asignaturas || [],
    cursos: destino.cursos || [],
    descripcion_uni: destino.descripcion_uni || "",
    descripcion_ciudad: destino.descripcion_ciudad || "",
    observaciones: destino.observaciones || "",
    info_contacto: destino.info_contacto || { email: "", telefono: "" },
    tutor_asignado: destino.tutor_asignado || "",
    ultimo_anio_reconocimiento: destino.ultimo_anio_reconocimiento || "",
    nota_minima: destino.nota_minima || "",
    web: destino.web || "",
    lat: destino.lat || "",
    lng: destino.lng || "",
    codigo_grado_ugr: destino.codigo_grado_ugr || "",
    codigo_centro_ugr: destino.codigo_centro_ugr || ""
  });

  const [mensaje, setMensaje] = useState("");
  const [grados, setGrados] = useState([]);

  useEffect(() => {
    if (mensaje) {
      const timeout = setTimeout(() => setMensaje(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [mensaje]);

  const añadirAsignatura = () => {
    setDatos(prev => ({
      ...prev,
      asignaturas: [
        {
          codigo_ugr: "",
          nombre_ugr: "",
          nombre_destino: "",
          creditos: 0,
          codigos_grado: [],
          ultimo_anio_reconocimiento: ""
        },
        ...prev.asignaturas 
      ]
    }));
  };

  useEffect(() => {
    fetch("http://localhost:5000/grados")
      .then((res) => res.json())
      .then(setGrados);
  }, []);


  const actualizarAsignatura = (index, campo, valor) => {
    const nuevas = [...datos.asignaturas];
    nuevas[index][campo] = valor;
    setDatos({ ...datos, asignaturas: nuevas });
  };

  const eliminarAsignatura = (index) => {
    const nuevas = [...datos.asignaturas];
    nuevas.splice(index, 1);
    setDatos({ ...datos, asignaturas: nuevas });
  };

  const toggleCurso = (num) => {
    const actual = datos.cursos || [];
    setDatos({
      ...datos,
      cursos: actual.includes(num) ? actual.filter(c => c !== num) : [...actual, num]
    });
  };

  const guardar = async () => {
    const obligatorios = ["codigo", "nombre_uni", "pais", "requisitos_idioma", "plazas", "meses"];
    for (const campo of obligatorios) {
      if (!datos[campo]) {
        setMensaje(`Falta el campo obligatorio: ${campo}`);
        return;
      }
    }

    const esNuevo = !destino._id;
    const metodo = esNuevo ? "POST" : "PATCH";
    const url = esNuevo
      ? "http://localhost:5000/api/destinos"
      : `http://localhost:5000/api/destinos/${destino._id}`;

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (res.ok) {
        setMensaje("Destino guardado correctamente.");
        setTimeout(() => onClose(), 2000);
      } else {
        const err = await res.json();
        setMensaje("Error al guardar: " + (err?.error || "desconocido"));
      }
    } catch (error) {
      console.error("Error al guardar destino", error);
      setMensaje("Error de red al guardar.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-stone-50 px-8 py-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "Inter, sans-serif" }}>
            {destino._id ? "Editar Destino" : "Nuevo Destino"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-8 py-6">
          {mensaje && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
              {mensaje}
            </div>
          )}

          <div className="space-y-8">
            {/* Información básica */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Información básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Código destino</label>
                  <input
                    value={datos.codigo || ""}
                    onChange={(e) => setDatos({ ...datos, codigo: e.target.value })}
                    placeholder="Código del destino"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Nombre universidad</label>
                  <input
                    value={datos.nombre_uni || ""}
                    onChange={(e) => setDatos({ ...datos, nombre_uni: e.target.value })}
                    placeholder="Nombre de la universidad"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">País</label>
                  <input
                    value={datos.pais || ""}
                    onChange={(e) => setDatos({ ...datos, pais: e.target.value })}
                    placeholder="País del destino"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Idioma requerido</label>
                  <input
                    value={datos.requisitos_idioma || ""}
                    onChange={(e) => setDatos({ ...datos, requisitos_idioma: e.target.value })}
                    placeholder="Idioma requerido"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Plazas</label>
                  <input
                    type="number"
                    value={datos.plazas || ""}
                    onChange={(e) => setDatos({ ...datos, plazas: parseInt(e.target.value) || 0 })}
                    placeholder="Número de plazas"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Meses</label>
                  <input
                    type="number"
                    value={datos.meses || ""}
                    onChange={(e) => setDatos({ ...datos, meses: parseInt(e.target.value) || 0 })}
                    placeholder="Duración en meses"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Nota mínima</label>
                  <input
                    type="number"
                    step="0.1"
                    value={datos.nota_minima || ""}
                    onChange={(e) => setDatos({ ...datos, nota_minima: parseFloat(e.target.value) || 0 })}
                    placeholder="Nota mínima requerida"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Código del centro UGR</label>
                  <input
                    value={datos.codigo_centro_ugr}
                    onChange={(e) => setDatos({ ...datos, codigo_centro_ugr: e.target.value })}
                    placeholder="Ej: 015"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Código del grado UGR</label>
                  <input
                    value={datos.codigo_grado_ugr}
                    onChange={(e) => setDatos({ ...datos, codigo_grado_ugr: e.target.value })}
                    placeholder="Ej: 296"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Cursos permitidos */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Cursos permitidos</h3>
              <div className="flex flex-wrap gap-6">
                {[1, 2, 3, 4].map(num => (
                  <label key={num} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={datos.cursos.includes(num)}
                      onChange={() => toggleCurso(num)}
                      className="w-4 h-4 text-red-600 bg-gray-50 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-base font-medium text-gray-700">Curso {num}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Información adicional */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Información adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Web</label>
                  <input
                    value={datos.web || ""}
                    onChange={(e) => setDatos({ ...datos, web: e.target.value })}
                    placeholder="Sitio web"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Tutor asignado</label>
                  <input
                    value={datos.tutor_asignado || ""}
                    onChange={(e) => setDatos({ ...datos, tutor_asignado: e.target.value })}
                    placeholder="Nombre del tutor"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Latitud</label>
                  <input
                    value={datos.lat || ""}
                    onChange={(e) => setDatos({ ...datos, lat: e.target.value })}
                    placeholder="Latitud"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Longitud</label>
                  <input
                    value={datos.lng || ""}
                    onChange={(e) => setDatos({ ...datos, lng: e.target.value })}
                    placeholder="Longitud"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Email de contacto</label>
                  <input
                    value={datos.info_contacto.email}
                    onChange={(e) => setDatos({ ...datos, info_contacto: { ...datos.info_contacto, email: e.target.value } })}
                    placeholder="Email de contacto"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Teléfono de contacto</label>
                  <input
                    value={datos.info_contacto.telefono}
                    onChange={(e) => setDatos({ ...datos, info_contacto: { ...datos.info_contacto, telefono: e.target.value } })}
                    placeholder="Teléfono de contacto"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            {/* Imágenes */}
            {/* Imágenes */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-6">Imágenes del destino</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Imagen principal */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-base font-medium text-gray-700">Imagen principal</label>
                    <span className="text-sm text-gray-500">Recomendado: 1200x800px</span>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:border-gray-400 transition-colors">
                    {datos.imagenes?.principal ? (
                      <div className="relative group">
                        <img
                          src={datos.imagenes.principal}
                          alt="Imagen principal"
                          className="w-full h-64 object-cover rounded-lg shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-all duration-200 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              setDatos((prev) => ({
                                ...prev,
                                imagenes: { ...prev.imagenes, principal: "" },
                              }))
                            }
                            className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-all duration-200 shadow-lg"
                            title="Eliminar imagen principal"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                          <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 mb-2">Selecciona la imagen principal</p>
                        <p className="text-sm text-gray-400">Esta será la imagen destacada del destino</p>
                      </div>
                    )}

                    <div className="mt-4">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const formData = new FormData();
                            formData.append("imagen", e.target.files[0]);
                            const res = await fetch("http://localhost:5000/api/destinos/subir-imagen", {
                              method: "POST",
                              body: formData,
                            });
                            const data = await res.json();
                            const url = typeof data.url === "string" ? data.url : data.url?.url;
                            if (url) {
                              setDatos((prev) => ({
                                ...prev,
                                imagenes: { ...prev.imagenes, principal: url },
                              }));
                            }
                          }}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                          <Plus className="w-4 h-4" />
                          {datos.imagenes?.principal ? "Cambiar imagen" : "Seleccionar imagen"}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Imágenes secundarias */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-base font-medium text-gray-700">Imágenes adicionales</label>
                    <span className="text-sm text-gray-500">Máximo 2 imágenes</span>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
                    {(datos.imagenes?.secundarias || []).length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {(datos.imagenes?.secundarias || []).map((img, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={img}
                              alt={`Imagen adicional ${i + 1}`}
                              className="w-full h-24 object-cover rounded-lg shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-all duration-200 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const nuevas = datos.imagenes.secundarias.filter((_, idx) => idx !== i);
                                  setDatos((prev) => ({
                                    ...prev,
                                    imagenes: { ...prev.imagenes, secundarias: nuevas },
                                  }));
                                }}
                                className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all duration-200 shadow-lg"
                                title="Eliminar imagen"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 mb-4">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                          <Plus className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm mb-1">Sin imágenes adicionales</p>
                        <p className="text-xs text-gray-400">Muestra más aspectos del destino</p>
                      </div>
                    )}

                    {(datos.imagenes?.secundarias || []).length < 2 && (
                      <label className="cursor-pointer block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const formData = new FormData();
                            formData.append("imagen", e.target.files[0]);
                            const res = await fetch("http://localhost:5000/api/destinos/subir-imagen", {
                              method: "POST",
                              body: formData,
                            });
                            const data = await res.json();
                            const url = typeof data.url === "string" ? data.url : data.url?.url;
                            if (url) {
                              const actuales = datos.imagenes?.secundarias || [];
                              setDatos((prev) => ({
                                ...prev,
                                imagenes: { ...prev.imagenes, secundarias: [...actuales, url] },
                              }));
                            }
                          }}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 w-full">
                          <Plus className="w-4 h-4" />
                          Añadir imagen adicional
                        </div>
                      </label>
                    )}

                    {(datos.imagenes?.secundarias || []).length >= 6 && (
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-500">Límite de imágenes alcanzado (6/6)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Descripciones */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Descripciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Descripción de la universidad</label>
                  <textarea
                    value={datos.descripcion_uni}
                    onChange={(e) => setDatos({ ...datos, descripcion_uni: e.target.value })}
                    placeholder="Descripción de la universidad"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent h-24 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Descripción de la ciudad</label>
                  <textarea
                    value={datos.descripcion_ciudad}
                    onChange={(e) => setDatos({ ...datos, descripcion_ciudad: e.target.value })}
                    placeholder="Descripción de la ciudad"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent h-24 resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-2">Observaciones</label>
                  <textarea
                    value={datos.observaciones}
                    onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
                    placeholder="Observaciones adicionales"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent h-24 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Equivalencias */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Equivalencias (UGR - Destino)</h3>
                <button
                  onClick={añadirAsignatura}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Añadir equivalencia
                </button>
              </div>

              <div className="space-y-4">
                {datos.asignaturas.map((a, i) => (
                  <div key={i} className="bg-stone-50 p-6 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-12 gap-4 mb-4">
                      <div className="col-span-12 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Código UGR</label>
                        <input
                          value={a.codigo_ugr}
                          onChange={(e) => actualizarAsignatura(i, "codigo_ugr", e.target.value)}
                          placeholder="Código UGR"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre UGR</label>
                        <input
                          value={a.nombre_ugr}
                          onChange={(e) => actualizarAsignatura(i, "nombre_ugr", e.target.value)}
                          placeholder="Nombre en UGR"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre en destino</label>
                        <input
                          value={a.nombre_destino}
                          onChange={(e) => actualizarAsignatura(i, "nombre_destino", e.target.value)}
                          placeholder="Nombre en destino"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-12">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grados en los que se reconoce
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {grados.map((g) => {
                            const seleccionado = a.codigos_grado?.includes(g.codigo);
                            return (
                              <button
                                key={g.codigo}
                                type="button"
                                onClick={() => {
                                  const actual = a.codigos_grado || [];
                                  const nuevo = seleccionado
                                    ? actual.filter(c => c !== g.codigo)
                                    : [...actual, g.codigo];
                                  actualizarAsignatura(i, "codigos_grado", nuevo);
                                }}
                                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${seleccionado
                                  ? "bg-red-100 text-red-700 border-red-300"
                                  : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                                  }`}
                              >
                                {g.nombre}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Pulsa para añadir o quitar grados. Se marcarán en rojo los seleccionados.
                        </p>
                      </div>
                      <div className="col-span-6 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Créditos</label>
                        <input
                          type="number"
                          step="0.5"
                          value={a.creditos || ""}
                          onChange={(e) => actualizarAsignatura(i, "creditos", parseFloat(e.target.value) || 0)}
                          placeholder="6"
                          className="w-full px-3 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-6 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Semestre</label>
                        <input
                          value={a.semestre || ""}
                          onChange={(e) => actualizarAsignatura(i, "semestre", e.target.value)}
                          placeholder="1 o 2"
                          className="w-full px-3 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
                        <input
                          value={a.curso || ""}
                          onChange={(e) => actualizarAsignatura(i, "curso", e.target.value)}
                          placeholder="Ej: 3º"
                          className="w-full px-3 py-3 bg-white border border-gray-200 rounded-lg text-center"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Último año de reconocimiento
                        </label>
                        <input
                          type="text"
                          value={a.ultimo_anio_reconocimiento || ""}
                          onChange={(e) => actualizarAsignatura(i, "ultimo_anio_reconocimiento", e.target.value)}
                          placeholder="Ej: 24/25"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-11">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Guía docente (URL)</label>
                        <input
                          value={a.guia || ""}
                          onChange={(e) => actualizarAsignatura(i, "guia", e.target.value)}
                          placeholder="https://..."
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-12 flex justify-end">
                        <button
                          onClick={() => eliminarAsignatura(i)}
                          className="px-5 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-colors duration-200 text-sm"
                        >
                          Eliminar asignatura
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
                {datos.asignaturas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay equivalencias añadidas
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-8 py-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            className="px-6 py-3 bg-red-500 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Guardar destino
          </button>
        </div>
      </div>
    </div>
  );
}