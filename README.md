# Plataforma de Gestión Erasmus UGR

![Logo TFG](frontend/src/assets/logo-tfg-final-v2.svg)

Este repositorio contiene el desarrollo del **Trabajo Fin de Grado de Ingeniería Informatica** en la **Universidad de Granada**.

El proyecto consiste en una **plataforma web** que facilita la gestión de los acuerdos de estudios Erasmus+, permitiendo a **estudiantes, tutores y administradores** interactuar de manera ágil y transparente en los procesos de movilidad internacional.

---

## Descripción del proyecto

La plataforma aborda las principales dificultades detectadas en la gestión manual de acuerdos Erasmus+ en la UGR:

* Falta de digitalización.
* Lentitud en la revisión de equivalencias.
* Escasa visibilidad de destinos y asignaturas.

Se implementa una aplicación web monolítica con arquitectura cliente-servidor que permite:

* **Estudiantes**: explorar destinos, consultar asignaturas, preparar su acuerdo de estudios y enviarlo al tutor para revisión.
* **Tutores**: revisar, aceptar o rechazar propuestas de acuerdo, y gestionar destinos asignados.
* **Administradores**: gestionar usuarios, centros, grados y destinos disponibles en la plataforma.

Además, el sistema genera automáticamente los **PDF oficiales** de acuerdos de estudios y mantiene un historial de **notificaciones y revisiones**.

---

## Tecnologías empleadas

### Frontend

* React.js + Vite – interfaz principal.
* Tailwind CSS – sistema de estilos responsive.
* Lucide-react – librería de iconos.
* React Router – navegación SPA.
* Fetch API + LocalStorage – comunicación con el backend y gestión de sesión.
* Cloudinary – gestión de imágenes de perfil y destinos.

### Backend

* Flask (Python) – API REST.
* MongoDB – base de datos NoSQL (usuarios, destinos, acuerdos, equivalencias).
* Werkzeug – hash seguro de contraseñas.
* python-dotenv – gestión de variables sensibles.
* ReportLab / WeasyPrint – generación automática de PDFs institucionales.

---

# Instalación y despliegue

## Requisitos previos

- Node.js y npm instalados.
- Python 3.9+.
- Docker Desktop (recomendado) o MongoDB instalado localmente.

## 1. Base de Datos (Docker)

El proyecto incluye un archivo `docker-compose.yml` para levantar la base de datos fácilmente.
```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Esto iniciará MongoDB en el puerto 27017 y Mongo Express (interfaz visual) en el 8081.

⚠️ **Importante sobre los datos:**

Al iniciar el proyecto por primera vez, la base de datos estará vacía. Esto es intencionado: la carpeta de persistencia de datos (`data/`) está excluida del repositorio (`.gitignore`) para no compartir información de bases de datos locales.

Para cargar datos iniciales (grados, asignaturas y experiencias), debes utilizar los scripts de utilidad incluidos en el backend una vez hayas instalado las dependencias (ver paso siguiente).

## 2. Backend
```bash
# Clonar el repositorio
git clone <URL_REPOSITORIO>
cd backend/

# Crear y activar entorno virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt
```

### Poblado de datos (Opcional pero recomendado)

Antes de iniciar el servidor, puedes poblar la base de datos utilizando los scripts ubicados en `utils/` (asegúrate de tener los archivos CSV necesarios):

**Insertar Grados:** Requiere código, siglas, nombre y código de centro.
```bash
# Ejemplo:
python utils/insertar_grados.py 296 GII "Grado en Ingeniería Informática" 015
```

**Insertar Asignaturas:** Carga asignaturas desde un CSV para un grado específico.
```bash
# Uso:
python utils/insertar_asignaturas.py <ruta_csv> <siglas_grado> <codigo_grado> <codigo_centro>

# Ejemplo:
python utils/insertar_asignaturas.py utils/Asignaturas_GIIT.csv GII 296 015
```

**Insertar Experiencias:** Carga reseñas y valoraciones desde un CSV.
```bash
python utils/insertar_experiencias.py utils/EXPERIENCIAS.csv
```

### Ejecutar servidor
```bash
# Ejecutar servidor (Ubuntu/Mac)
python3 app.py
```

El servidor estará disponible en http://localhost:5000.

## 3. Frontend
```bash
cd frontend/

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en http://localhost:5173.

---

De momento sólo está disponible en local, pero se está trabajando para desplegarla.


## Funcionalidades principales

* **Autenticación de usuarios**:

  * Hash seguro de contraseñas.
  * Verificación de cuenta por correo electrónico.
  * Recuperación de contraseña mediante enlace temporal enviado por email.

* **Gestión de perfiles** con información académica.

* **Exploración de destinos Erasmus** mediante fichas y mapas interactivos.

* **Visualización y edición de asignaturas** de cada destino (con guías docentes).

* **Reconocimiento de asignaturas** con bloques 1↔2 (ejemplo: 6 ECTS ↔ 4+3 ECTS).

* **Creación, revisión y aprobación** de acuerdos de estudios.

* **Generación automática de PDF** del acuerdo.

* **Sistema de notificaciones** sobre cambios en el proceso.

* **Panel de administración** para gestión de usuarios, centros, grados y destinos.

---

## Organización básica del repositorio

```
├── backend/
│   ├── models/          # Modelos (usuarios, destinos, acuerdos, etc.)
│   ├── routes/          # Rutas y lógica de negocio
│   ├── db.py            # Conexión a MongoDB
│   ├── app.py           # Punto de entrada del servidor Flask
│   └── requirements.txt # Dependencias del backend
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── assets/      # Recursos estáticos (imágenes, logos, etc.)
│   │   └── App.jsx      # Enrutamiento principal
│   └── package.json     # Dependencias del frontend
│
└── README.md

```

## Autoría

Trabajo Fin de Grado realizado en la **Universidad de Granada**.

Autora: **Blanca Girón**
