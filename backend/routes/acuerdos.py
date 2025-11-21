from flask import Blueprint, request, jsonify, send_file
from db import db
from datetime import datetime
from models.acuerdo import crear_acuerdo
from utils.pdf import generar_pdf_acuerdo

acuerdos = Blueprint("acuerdos", __name__)

@acuerdos.route("/api/acuerdos", methods=["POST"])
def crear_version_nueva_o_primera():
    data = request.json
    email = data.get("email_estudiante")
    if not email:
        return jsonify({"error": "email_estudiante requerido"}), 400

    acuerdos_existentes = list(db.acuerdos.find({"email_estudiante": email}).sort("version", -1))
    nueva_version = 1 if not acuerdos_existentes else acuerdos_existentes[0]["version"] + 1

    nuevo_doc = crear_acuerdo(data, version=nueva_version)
    db.acuerdos.insert_one(nuevo_doc)

    #  Si el estado del acuerdo es borrador y el user estaba "con destino", pasa a "acuerdo_borrador"
    if (data.get("estado") or "borrador") == "borrador":
      db.usuarios.update_one(
          {"email": email, "estado_proceso": "con destino"},
          {"$set": {"estado_proceso": "acuerdo_borrador"}}
      )

    return jsonify({"msg": f"Nueva versión {nueva_version} creada", "version": nueva_version})

@acuerdos.route("/api/acuerdos/<email>/versiones/<int:version>", methods=["GET"])
def obtener_version_concreta(email, version):
    doc = db.acuerdos.find_one({"email_estudiante": email, "version": version})
    if not doc:
        return jsonify({"error": "Versión no encontrada"}), 404
    doc["_id"] = str(doc["_id"])
    return jsonify(doc)

@acuerdos.route("/api/acuerdos/<email>", methods=["GET"])
def listar_acuerdos_por_estudiante(email):
    acuerdos_list = list(db.acuerdos.find({"email_estudiante": email}).sort("version", -1))
    for a in acuerdos_list:
        a["_id"] = str(a["_id"])
    return jsonify(acuerdos_list)

@acuerdos.route("/api/acuerdos/<email>/ultima", methods=["GET"])
def acuerdo_ultimo(email):
    acuerdo = db.acuerdos.find_one({"email_estudiante": email}, sort=[("version", -1)])
    if not acuerdo:
        return jsonify({"msg": "No hay acuerdo"}), 404
    acuerdo["_id"] = str(acuerdo["_id"])
    return jsonify(acuerdo)


@acuerdos.route("/api/acuerdos/<email>", methods=["PUT"])
def actualizar_acuerdo_existente(email):
    data = request.json or {}
    acuerdo_actual = db.acuerdos.find_one({"email_estudiante": email}, sort=[("version", -1)])
    if not acuerdo_actual:
        return jsonify({"error": "No hay acuerdo que actualizar"}), 404

    estado_nuevo = data.get("estado", acuerdo_actual.get("estado", "borrador"))

    db.acuerdos.update_one(
        {"_id": acuerdo_actual["_id"]},
        {"$set": {
            "bloques": data.get("bloques", acuerdo_actual.get("bloques", [])),
            "datos_personales": data.get("datos_personales", acuerdo_actual.get("datos_personales", {})),
            "datos_movilidad": data.get("datos_movilidad", acuerdo_actual.get("datos_movilidad", {})),
            "estado": estado_nuevo,
            "fecha_ultima_modificacion": datetime.utcnow()
        }}
    )

  
    if estado_nuevo == "borrador":
        db.usuarios.update_one(
            {"email": email, "estado_proceso": "con destino"},
            {"$set": {"estado_proceso": "acuerdo_borrador"}}
        )

    return jsonify({"msg": "Acuerdo actualizado"})

@acuerdos.route("/api/acuerdos/<email>/versiones/<version>", methods=["DELETE"])
def eliminar_version(email, version):
    acuerdo = db.acuerdos.find_one({"email_estudiante": email, "version": int(version)})
    if not acuerdo:
        return jsonify({"error": "Acuerdo no encontrado"}), 404

    # Eliminar la versión del acuerdo
    db.acuerdos.delete_one({"email_estudiante": email, "version": int(version)})

    # Comprobar si quedan versiones
    restantes = list(db.acuerdos.find({"email_estudiante": email}))
    if not restantes:
        # Si no quedan, actualizar estado del usuario
        db.usuarios.update_one(
            {"email": email},
            {"$set": {"estado_proceso": "con destino"}}  # o "sin destino" según tu flujo
        )
        
        estudiante = db.usuarios.find_one({"email": email})
        tutor = db.usuarios.find_one({
            "rol": "tutor",
            "destinos_asignados.codigo": estudiante.get("destino_confirmado", {}).get("codigo")
        })
        if tutor:
            crear_notificacion(
                tutor["email"],
                "Acuerdo eliminado",
                f"El estudiante {estudiante['nombre']} ha eliminado su acuerdo.",
                tipo="warning",
                enlace=f"/tutor/acuerdo/{email}"
            )
        
    return jsonify({"msg": f"Versión {version} eliminada correctamente."}), 200

@acuerdos.route("/api/acuerdos/<email>/comentario", methods=["POST"])
def comentar_acuerdo(email):
    data = request.json or {}
    comentario_global = data.get("comentarios_tutor") or data.get("comentario") or ""
    bloques_comentados = data.get("bloques", [])

    doc = db.acuerdos.find_one({"email_estudiante": email}, sort=[("version", -1)])
    if not doc:
        return jsonify({"error": "Acuerdo no encontrado"}), 404

    bloques = doc.get("bloques", [])
    for b in bloques_comentados:
        i, txt = b.get("index"), (b.get("comentario") or "").strip()
        if i is not None and 0 <= i < len(bloques):
            bloques[i]["comentario_tutor"] = txt

    db.acuerdos.update_one(
        {"_id": doc["_id"]},
        {"$set": {
            "bloques": bloques,
            "comentarios_tutor": comentario_global,
            "estado": "cambios_solicitados",
            "fecha_ultima_modificacion": datetime.utcnow()
        }}
    )
    return jsonify({"msg": "Comentarios guardados"})

@acuerdos.route("/api/acuerdos/<email>/exportar", methods=["GET"])
def exportar_pdf_acuerdo(email):
    acuerdo = db.acuerdos.find_one({"email_estudiante": email}, sort=[("version", -1)])
    if not acuerdo:
        return jsonify({"error": "No hay acuerdo"}), 404
    path = generar_pdf_acuerdo(acuerdo)
    return send_file(path, as_attachment=True, download_name=f"AcuerdoEstudios_{email}.pdf")

@acuerdos.route("/api/tutor/<email>/dashboard", methods=["GET"])
def dashboard_tutor(email):
    tutor = db.usuarios.find_one({"email": email, "rol": "tutor"})
    if not tutor:
        return jsonify({"error": "Tutor no encontrado"}), 404

    codigos_destinos = [d["codigo"] for d in tutor.get("destinos_asignados", [])]

    estudiantes = list(db.usuarios.find({
        "rol": "estudiante",
        "destino_confirmado.codigo": {"$in": codigos_destinos}
    }))

    resultado = []
    for est in estudiantes:
        email_estudiante = est["email"]
        acuerdo = db.acuerdos.find_one(
            {"email_estudiante": email_estudiante},
            sort=[("version", -1)]
        )
        estado_acuerdo = "no enviado"
        if acuerdo and acuerdo.get("estado") in ("enviado", "cambios_solicitados", "aprobado"):
            estado_acuerdo = acuerdo["estado"]

        resultado.append({
            "nombre": est["nombre"],
            "email": est["email"],
            "apellido1": est.get("primer_apellido", ""),
            "apellido2": est.get("segundo_apellido", ""),
            "destino": est["destino_confirmado"]["nombre_uni"],
            "acuerdo": estado_acuerdo,
            "estado_proceso": est.get("estado_proceso", "sin estado")
        })

    return jsonify({
        "destinos": tutor.get("destinos_asignados", []),
        "estudiantes": resultado
    })

@acuerdos.route("/api/acuerdos/<email>/enviar", methods=["POST"])
def enviar_a_revision(email):
    doc = db.acuerdos.find_one({"email_estudiante": email}, sort=[("version", -1)])
    if not doc:
        return jsonify({"error": "Acuerdo no encontrado"}), 404

    db.acuerdos.update_one(
        {"_id": doc["_id"]},
        {"$set": {
            "estado": "enviado",
            "fecha_ultima_modificacion": datetime.utcnow()
        },
         "$push": {"historial": {
            "evento": "enviar", "por": email, "rol": "estudiante",
            "ts": datetime.utcnow(), "meta": {"version": doc["version"]}
         }}}
    )
    db.usuarios.update_one(
        {"email": email, "rol": "estudiante"},
        {"$set": {"estado_proceso": "en revision"}}
    )

    # 🔔 Notificar al tutor
    estudiante = db.usuarios.find_one({"email": email})
    tutor = db.usuarios.find_one({
        "rol": "tutor",
        "destinos_asignados.codigo": estudiante.get("destino_confirmado", {}).get("codigo")
    })
    if tutor:
        crear_notificacion(
            tutor["email"],
            "Nuevo acuerdo recibido",
            f"El estudiante {estudiante['nombre']} ha enviado su acuerdo para revisión.",
            tipo="info",
            enlace=f"/tutor/acuerdo/{email}"
        )

    return jsonify({"msg": "Acuerdo enviado a revisión"})


@acuerdos.route("/api/acuerdos/<email>/aprobar", methods=["POST"])
def aprobar_acuerdo(email):
    data = request.json or {}
    tutor_email = request.args.get("tutor") or data.get("tutor")
    comentario_global = data.get("comentarios_tutor")

    doc = db.acuerdos.find_one({"email_estudiante": email}, sort=[("version", -1)])
    if not doc:
        return jsonify({"error": "Acuerdo no encontrado"}), 404

    set_fields = {
        "estado": "aprobado",
        "fecha_ultima_modificacion": datetime.utcnow(),
        "aprobado_en": datetime.utcnow(),
        "revisado_por": tutor_email
    }
    if comentario_global is not None:
        set_fields["comentarios_tutor"] = comentario_global

    db.acuerdos.update_one(
        {"_id": doc["_id"]},
        {"$set": set_fields,
         "$push": {"historial": {
            "evento": "aprobar", "por": tutor_email, "rol": "tutor",
            "ts": datetime.utcnow(), "meta": {"version": doc["version"]}
         }}}
    )

    # >>> estado_proceso del estudiante a "aprobado" (tal y como pediste)
    db.usuarios.update_one(
        {"email": email, "rol": "estudiante"},
        {"$set": {"estado_proceso": "aprobado"}}
    )
    
    # 🔔 Notificar al estudiante
    estudiante = db.usuarios.find_one({"email": email})
    crear_notificacion(
        estudiante["email"],
        "Acuerdo aprobado",
        "Tu acuerdo de estudios ha sido aprobado por tu tutor.",
        tipo="success",
        enlace=f"/estudiante/comunicacion"
    )

    return jsonify({"msg": "Acuerdo aprobado"})

@acuerdos.route("/api/acuerdos/<email>/pedir-cambios", methods=["POST"])
def pedir_cambios(email):
    data = request.json or {}
    comentario_global = data.get("comentarios_tutor") or data.get("comentario") or ""
    bloques_comentados = data.get("bloques", [])
    tutor_email = data.get("tutor")

    doc = db.acuerdos.find_one({"email_estudiante": email}, sort=[("version", -1)])
    if not doc:
        return jsonify({"error": "Acuerdo no encontrado"}), 404

    bloques = doc.get("bloques", [])
    for b in bloques_comentados:
        i, txt = b.get("index"), (b.get("comentario") or "").strip()
        if i is not None and 0 <= i < len(bloques):
            bloques[i]["comentario_tutor"] = txt

    db.acuerdos.update_one(
        {"_id": doc["_id"]},
        {"$set": {
            "estado": "cambios_solicitados",
            "bloques": bloques,
            "comentarios_tutor": comentario_global,
            "fecha_ultima_modificacion": datetime.utcnow()
        },
         "$push": {
            "historial": {
                "evento": "pedir_cambios",
                "por": tutor_email,
                "rol": "tutor",
                "ts": datetime.utcnow(),
                "meta": {"version": doc["version"]}
            }
         }}
    )
    
    estudiante = db.usuarios.find_one({"email": email})
    crear_notificacion(
        estudiante["email"],
        "Cambios solicitados",
        "Tu tutor ha solicitado cambios en tu acuerdo de estudios.",
        tipo="warning",
        enlace=f"/estudiante/comunicacion"
    )
    
    return jsonify({"msg": "Cambios solicitados"})

@acuerdos.route("/api/acuerdos/<email>/mensajes", methods=["GET"])
def listar_mensajes(email):
    doc = db.acuerdos.find_one({"email_estudiante": email}, sort=[("version", -1)], projection={"mensajes": 1, "estado":1, "version":1})
    if not doc:
        return jsonify({"error":"Acuerdo no encontrado"}), 404
    return jsonify({"version": doc["version"], "estado": doc["estado"], "mensajes": doc.get("mensajes", [])})

@acuerdos.route("/api/acuerdos/<email>/mensajes", methods=["POST"])
def crear_mensaje(email):
    data = request.json or {}
    texto = (data.get("texto") or "").strip()
    autor = data.get("autor")
    rol = data.get("rol")
    if not texto or not autor or rol not in ("estudiante", "tutor"):
        return jsonify({"error": "texto, autor y rol requeridos"}), 400

    doc = db.acuerdos.find_one({"email_estudiante": email}, sort=[("version", -1)])
    if not doc:
        return jsonify({"error": "Acuerdo no encontrado"}), 404

    evento = {"texto": texto, "autor": autor, "rol": rol, "ts": datetime.utcnow(), "version": doc["version"]}
    db.acuerdos.update_one(
        {"_id": doc["_id"]},
        {"$push": {
            "mensajes": evento,
            "historial": {"evento": "mensaje", "por": autor, "rol": rol, "ts": datetime.utcnow(),
                          "meta": {"version": doc["version"]}}
        },
         "$set": {"fecha_ultima_modificacion": datetime.utcnow()}}
    )
    return jsonify({"msg": "Mensaje guardado"})

@acuerdos.route("/api/acuerdos/<email>/estado", methods=["GET"])
def estado_compacto(email):
    doc = db.acuerdos.find_one({"email_estudiante": email}, sort=[("version", -1)], projection={"estado":1,"version":1})
    if not doc:
        return jsonify({"estado":"no_enviado"}), 200
    return jsonify({"estado": doc["estado"], "version": doc["version"]})

def crear_notificacion(email, titulo, mensaje, tipo="info", enlace=None):
    db.notificaciones.insert_one({
        "usuario_email": email,
        "titulo": titulo,
        "mensaje": mensaje,
        "tipo": tipo,  # info, warning, success, error
        "leida": False,
        "enlace": enlace,
        "fecha_creacion": datetime.utcnow()
    })


def _iso(dt):
    # Asegura ISO string incluso si ya es str
    if isinstance(dt, str):
        return dt
    return (dt or datetime.utcnow()).isoformat()

@acuerdos.route("/api/progreso/<email>", methods=["GET"])
def progreso_por_email(email):
    """
    Devuelve un timeline unificado (notificaciones + historial de acuerdo) para el estudiante.
    """
    # 1) Notificaciones del alumno
    notifs = list(db.notificaciones.find(
        {"usuario_email": email},
        {"usuario_email": 0}  # devolvemos campos útiles
    ).sort("fecha_creacion", -1))

    timeline = []
    for n in notifs:
        timeline.append({
            "id": str(n["_id"]),
            "fuente": "notificacion",
            "titulo": n.get("titulo"),
            "mensaje": n.get("mensaje"),
            "tipo": n.get("tipo", "info"),      # info | warning | success | error
            "leida": n.get("leida", False),
            "enlace": n.get("enlace"),
            "timestamp": _iso(n.get("fecha_creacion")),
        })

    # 2) Último acuerdo + su historial
    acuerdos_cursor = db.acuerdos.find(
        {"email_estudiante": email},
        {"historial": 1, "estado": 1, "version": 1, "fecha_ultima_modificacion": 1}
    ).sort("version", -1)

    for a in acuerdos_cursor:
        aid = str(a.get("_id"))
        hist = a.get("historial") or []

        # Fallback mínimo si no hubiera historial
        if not hist:
            timeline.append({
                "id": f"{aid}:estado:{_iso(a.get('fecha_ultima_modificacion'))}",
                "fuente": "acuerdo",
                "titulo": f"Acuerdo — {a.get('estado','desconocido')}",
                "mensaje": f"Estado actual: {a.get('estado','—')}",
                "tipo": "estado",
                "leida": True,
                "enlace": "/estudiante/acuerdo",
                "timestamp": _iso(a.get("fecha_ultima_modificacion")),
            })
        else:
            for ev in hist:
                #  eventos almacenan campos: evento, por, rol, ts, meta...
                accion = ev.get("evento", "evento")
                ts = ev.get("ts") or ev.get("timestamp")
                timeline.append({
                    "id": f"{aid}:{accion}:{_iso(ts)}",
                    "fuente": "acuerdo",
                    "titulo": f"Acuerdo — {accion}",
                    "mensaje": ev.get("mensaje") or f"Evento: {accion}",
                    "tipo": "estado",
                    "leida": True,                       # los eventos del acuerdo no requieren “leer”
                    "enlace": "/estudiante/acuerdo",
                    "timestamp": _iso(ts),
                })

    # 3) Ordenar desc por timestamp
    timeline.sort(key=lambda x: x["timestamp"], reverse=True)
    return jsonify({"items": timeline}), 200