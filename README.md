

 **README.md completo y profesional** 

- Diagrama de arquitectura (ASCII)
- Descripción del problema
- Instalación local paso a paso
- Variables de entorno
- Endpoints completos (incluyendo autenticación)
- Pruebas sugeridas
- Tecnologías
- Autor

---

```markdown
# StudySync API - José Ricardo López Flores

**Sistema Distribuido para Coordinación de Grupos de Estudio con Notificaciones en Tiempo Real**

API REST completa para gestión de grupos de estudio, con autenticación JWT, mensajería en tiempo real con Redis Pub/Sub, persistencia en Supabase (PostgreSQL) y despliegue en Render.

---

## 🌐 URL de producción

**https://studysync-api-jrlopez.onrender.com**

**Documentación Swagger:** https://studysync-api-jrlopez.onrender.com/api-docs

**Frontend:** https://studysync-api-jrlopez.onrender.com (login, registro, panel en tiempo real)

---

## 👨‍💻 Autor

**José Ricardo López Flores**

---

## 🎯 Problema que resuelve

Los estudiantes universitarios enfrentan dificultades para coordinar grupos de estudio, compartir materiales y organizar sesiones de manera eficiente. Actualmente dependen de aplicaciones de mensajería dispersas (WhatsApp, Telegram) sin una herramienta centralizada que permita:

- Organizar sesiones de estudio por materia
- Saber quién creó cada sesión
- Recibir notificaciones en tiempo real cuando alguien crea una nueva sesión
- Autenticación segura para que cada usuario vea solo sus propias sesiones

**StudySync resuelve estos problemas** proporcionando una plataforma centralizada donde los estudiantes pueden:

1. Registrarse e iniciar sesión de forma segura (JWT)
2. Crear, ver, actualizar y eliminar sus propias sesiones de estudio
3. Recibir notificaciones en tiempo real cuando alguien crea una nueva sesión (Redis Pub/Sub + WebSockets)
4. Acceder desde cualquier lugar vía web (frontend integrado)

---

## 🏗️ Arquitectura del Sistema

```
                    ┌─────────────────────────────────────────┐
                    │              Navegador Web              │
                    │    (register.html / login.html /        │
                    │     index.html + Socket.io)             │
                    └───────────────┬─────────────────────────┘
                                    │ HTTP REST + WebSocket
                                    ▼
                    ┌─────────────────────────────────────────┐
                    │              Render.com                 │
                    │    (API Express + Frontend + WS)        │
                    │                                         │
                    │  • Helmet (seguridad HTTP)              │
                    │  • CORS (dominios autorizados)          │
                    │  • Rate Limiting (100 req/15min)        │
                    │  • JWT Authentication                   │
                    └───────────────┬─────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│    Supabase       │   │   Upstash Redis   │   │   Socket.io       │
│  (PostgreSQL)     │   │   (Pub/Sub)       │   │   (WebSockets)    │
│                   │   │                   │   │                   │
│  • Usuarios       │   │  canales:         │   │  • Broadcast      │
│  • Grupos/Sesiones│   │  - study:grupo:*  │   │    a todos los    │
│                   │   │                   │   │    clientes       │
│  Persistencia     │   │  Publicador: API  │   │                   │
│  permanente       │   │  Suscriptor: WS   │   │  Tiempo real      │
└───────────────────┘   └───────────────────┘   └───────────────────┘
```

**Flujo de datos:**

1. **Usuario** se registra → POST `/auth/register` → Supabase guarda usuario con contraseña hasheada
2. **Usuario** inicia sesión → POST `/auth/login` → API genera JWT token
3. **Usuario autenticado** crea grupo → POST `/api/grupos` con `Authorization: Bearer <token>`
   - API guarda en Supabase (usuario_id asociado)
   - API publica evento en Redis canal `study:grupo:creado`
4. **Suscriptor Redis** (notificaciones.js) recibe el evento
5. **Socket.io** emite `nuevo-evento` a TODOS los clientes conectados
6. **Frontend** actualiza el feed de eventos en tiempo real (sin recargar la página)

---

## 📦 Endpoints Completos

### Autenticación (públicos)

| Método | Ruta | Función | Códigos |
|--------|------|---------|---------|
| POST | `/auth/register` | Registrar nuevo usuario (bcrypt hashed) | 201, 400 |
| POST | `/auth/login` | Iniciar sesión → devuelve JWT token | 200, 401 |
| GET | `/auth/perfil` | Obtener perfil del usuario autenticado | 200, 401 |

### Gestión de Grupos (requieren JWT)

| Método | Ruta | Función | Códigos |
|--------|------|---------|---------|
| GET | `/api/grupos` | Listar grupos del usuario autenticado (con filtros) | 200, 401 |
| GET | `/api/grupos/:id` | Obtener grupo por ID | 200, 401, 404 |
| POST | `/api/grupos` | Crear nuevo grupo (asociado al usuario) | 201, 400, 401 |
| PUT | `/api/grupos/:id` | Actualizar grupo completo | 200, 400, 401, 404 |
| DELETE | `/api/grupos/:id` | Eliminar grupo | 200, 401, 404 |

### Filtros y paginación soportados en GET `/api/grupos`

| Parámetro | Ejemplo | Descripción |
|-----------|---------|-------------|
| `materia` | `?materia=Fisica` | Filtra por materia (case-insensitive) |
| `q` | `?q=algoritmos` | Búsqueda por nombre o materia |
| `page` | `?page=1` | Número de página |
| `limit` | `?limit=5` | Resultados por página |

### Ejemplo de respuesta GET `/api/grupos`

```json
[
  {
    "id": 1,
    "nombre": "Grupo Física",
    "materia": "Física II",
    "integrantes": 4,
    "usuarioId": 1,
    "createdAt": "2026-05-31T14:43:34.553Z",
    "updatedAt": "2026-05-31T14:43:34.553Z"
  }
]
```

### Ejemplo de petición POST `/api/grupos`

```json
{
  "nombre": "Grupo Álgebra",
  "materia": "Álgebra Lineal",
  "integrantes": 4
}
```

---

## 🛡️ Seguridad Implementada

| Medida | Tecnología | Configuración |
|--------|------------|---------------|
| Autenticación | JWT + bcrypt | Token expira en 1 hora, contraseñas hasheadas |
| Cabeceras HTTP | Helmet | X-Frame-Options, CSP, HSTS, etc. |
| CORS | cors | Solo dominio de Render autorizado |
| Rate Limiting | express-rate-limit | 100 peticiones por IP cada 15 minutos |
| Validación | Manual | Campos requeridos, email válido, password mínimo 6 caracteres |

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 20+ | Entorno de ejecución |
| Express.js | 4.18.2 | Framework web |
| Prisma ORM | 5.22.0 | Acceso a base de datos type-safe |
| Supabase (PostgreSQL) | - | Base de datos en la nube |
| Redis (Upstash) | - | Pub/Sub para mensajería |
| Socket.io | 4.7.2 | WebSockets en tiempo real |
| JWT + bcryptjs | - | Autenticación segura |
| Helmet | 7.1.0 | Cabeceras HTTP seguras |
| Swagger UI | 5.0.0 | Documentación interactiva |
| Render | - | Despliegue continuo |

---

## 📦 Instalación local

### Requisitos previos

- Node.js 20+ instalado
- Git
- Cuenta gratuita en [Supabase](https://supabase.com)
- Cuenta gratuita en [Upstash](https://upstash.com)
- (Opcional) Docker Desktop para LocalStack

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/JoseRicardo777/studysync-api-jrlopez.git
cd studysync-api-jrlopez
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar Supabase

1. Entra a [supabase.com](https://supabase.com) → **New Project**
2. Anota la contraseña de la base de datos
3. Ve a **Settings → Database → Connection string**
4. Copia la URL **Transaction pooler** (puerto 6543) → será tu `DATABASE_URL`
5. Copia la URL **Session mode** (puerto 5432) → será tu `DIRECT_URL`

### Paso 4: Configurar Upstash Redis

1. Entra a [upstash.com](https://upstash.com) → **Create Database** → tipo Redis
2. Copia la **REDIS_URL** (empieza con `rediss://`)

### Paso 5: Crear el archivo `.env`

Copia el siguiente contenido y completa con tus credenciales:

```env
PORT=3000
NODE_ENV=development

# Supabase
DATABASE_URL=postgresql://postgres.TU_PROYECTO:TU_CONTRASENA@aws-X.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.TU_PROYECTO:TU_CONTRASENA@aws-X.pooler.supabase.com:5432/postgres

# Upstash Redis
REDIS_URL=rediss://default:TOKEN@host.upstash.io:6379

# JWT
JWT_SECRET=cambia_esto_por_una_cadena_larga_y_aleatoria
JWT_EXPIRES_IN=1h

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Paso 6: Generar el cliente Prisma y crear las tablas

```bash
npx prisma generate
npx prisma db push
```

Verifica en Supabase → **Table Editor** que se crearon las tablas `Grupo` y `Usuario`.

### Paso 7: Iniciar el servidor

```bash
npm run dev
```

Verás:

```
✅ Servidor corriendo en http://localhost:3000
✅ Conectado a Redis (Publicador)
📚 API de grupos de estudio - José Ricardo López Flores
```

### Paso 8: Probar la API

Abre en el navegador:
- **Swagger:** http://localhost:3000/api-docs
- **Frontend:** http://localhost:3000

---

## 🧪 Verificación completa (9 sesiones de 3 grupos)

Sigue este flujo para demostrar que todo funciona correctamente:

### Paso 1 — Registrar 3 usuarios

**POST** `http://localhost:3000/auth/register`

```json
{ "nombre": "Ana Torres",    "email": "ana@estudio.bo",    "password": "grupo1pass" }
{ "nombre": "Carlos Mendez", "email": "carlos@estudio.bo", "password": "grupo2pass" }
{ "nombre": "Sofia Vargas",  "email": "sofia@estudio.bo",  "password": "grupo3pass" }
```

### Paso 2 — Login y obtener tokens

**POST** `http://localhost:3000/auth/login`

```json
{ "email": "ana@estudio.bo", "password": "grupo1pass" }
```

Copia el `token` de la respuesta.

### Paso 3 — Crear 3 sesiones por grupo (con token en Header)

**POST** `http://localhost:3000/api/grupos`  
**Header:** `Authorization: Bearer <token>`

**Grupo 1 (Ana Torres):**
```json
{ "nombre": "Algebra Lineal — Matrices", "materia": "Matematicas", "integrantes": 4 }
{ "nombre": "Algebra Lineal — Vectores", "materia": "Matematicas", "integrantes": 4 }
{ "nombre": "Algebra Lineal — Examen parcial", "materia": "Matematicas", "integrantes": 4 }
```

### Paso 4 — Verificar tiempo real

1. Abre `http://localhost:3000` en dos pestañas del navegador
2. En cada pestaña inicia sesión con un usuario diferente
3. Ambas deben mostrar el badge **🟢 Conectado**
4. Desde una pestaña crea una sesión → el feed de eventos se actualiza en **ambas pestañas instantáneamente**

### Paso 5 — Verificar seguridad

```bash
# Sin token → debe devolver 401
POST http://localhost:3000/api/grupos
Body: { "nombre": "Sin token", "materia": "Test", "integrantes": 1 }
```

---

## 📁 Estructura del proyecto

```
studysync-api-jrlopez/
├── cloudformation/
│   └── template.yaml              # Infraestructura como Código (IaC)
├── prisma/
│   └── schema.prisma              # Modelos Usuario y Grupo
├── public/
│   ├── index.html                 # Panel principal (tiempo real)
│   ├── login.html                 # Formulario de login
│   ├── register.html              # Formulario de registro
│   └── app.css                    # Estilos globales
├── src/
│   ├── config/
│   │   └── redis.js               # Cliente Redis (publicador)
│   ├── controllers/
│   │   ├── authController.js      # Registro, login, perfil
│   │   └── grupoController.js     # CRUD de grupos
│   ├── middlewares/
│   │   ├── authMiddleware.js      # Verificación JWT
│   │   └── errorHandler.js        # Manejo de errores
│   ├── routes/
│   │   ├── authRoutes.js          # /auth/*
│   │   └── grupoRoutes.js         # /api/grupos
│   ├── subscribers/
│   │   └── notificaciones.js      # Redis → Socket.io
│   ├── app.js                     # Configuración Express
│   └── server.js                  # HTTP + Socket.io
├── .env                           # Variables de entorno (no subir a GitHub)
├── .env.example                   # Plantilla de variables
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## ☁️ Despliegue en Render

1. Sube el código a GitHub
2. Entra a [render.com](https://render.com) → **New Web Service** → conecta tu repositorio
3. Configura:
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
4. Agrega las variables de entorno (NO agregues `PORT`):

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | (URL de Supabase con `?pgbouncer=true&connection_limit=1`) |
| `DIRECT_URL` | (URL de Supabase puerto 5432) |
| `REDIS_URL` | (URL de Upstash) |
| `JWT_SECRET` | (cadena larga y aleatoria) |
| `JWT_EXPIRES_IN` | `1h` |
| `CORS_ORIGIN` | `https://studysync-api-jrlopez.onrender.com` |

5. Haz clic en **Deploy**

> **Nota:** El tier gratuito de Render pausa el servicio tras 15 minutos de inactividad. El primer request puede tardar ~50 segundos en responder — es normal.

---

## ✅ Checklist de verificación

- [x] POST `/auth/register` crea usuario con contraseña hasheada
- [x] POST `/auth/login` devuelve token JWT
- [x] Rutas privadas devuelven 401 sin token
- [x] CRUD completo persiste en Supabase
- [x] Crear grupo dispara evento Redis
- [x] Suscriptor Redis recibe evento y lo envía a WebSockets
- [x] Frontend muestra eventos en tiempo real
- [x] `/api-docs` accesible con autenticación Bearer
- [x] CORS + Rate Limiting + Helmet activos
- [x] Infraestructura como Código (CloudFormation)

---

## 📎 Enlaces importantes

| Recurso | URL |
|---------|-----|
| **API en producción** | https://studysync-api-jrlopez.onrender.com |
| **Swagger UI** | https://studysync-api-jrlopez.onrender.com/api-docs |
| **Frontend** | https://studysync-api-jrlopez.onrender.com |
| **Repositorio GitHub** | https://github.com/JoseRicardo777/studysync-api-jrlopez |
| **Supabase Dashboard** | https://supabase.com/dashboard/projects |

---

## 📝 Notas adicionales

- Los datos persisten en Supabase (PostgreSQL en la nube) — no se pierden al reiniciar el servidor
- Redis (Upstash) maneja la mensajería Pub/Sub en la nube
- Socket.io proporciona comunicación bidireccional en tiempo real
- El frontend es vanilla HTML/CSS/JS — sin frameworks para facilitar la comprensión

---

## 👨‍💻 Autor

**José Ricardo López Flores**

*Proyecto Final — Programación IV — UPDS 2026*

---

*¡Gracias por revisar StudySync API! 🚀*
```

---

## ✅ Cómo actualizar tu README

1. Abre tu archivo `README.md` en VS Code
2. **Reemplaza TODO su contenido** con el código de arriba
3. Guarda el archivo (Ctrl+S)
4. Sube el cambio a GitHub:

```bash
git add README.md
git commit -m "docs: actualizar README con arquitectura, instalación y documentación completa"
git push origin main
```

---

## 🎯 Tu README ahora incluye:

| Sección | Contenido |
|---------|-----------|
| ✅ URL de producción | Render + Swagger + Frontend |
| ✅ Problema que resuelve | Contexto y solución |
| ✅ Diagrama de arquitectura | ASCII + flujo de datos explicado |
| ✅ Endpoints completos | Auth + Grupos + filtros |
| ✅ Seguridad | JWT, Helmet, CORS, Rate Limiting |
| ✅ Tecnologías | Tabla con versiones y propósitos |
| ✅ Instalación local | Paso a paso con Supabase + Upstash |
| ✅ Verificación completa | 9 sesiones de 3 grupos |
| ✅ Estructura del proyecto | Árbol de archivos |
| ✅ Despliegue en Render | Variables de entorno y comandos |
| ✅ Checklist | Verificación de requisitos |
| ✅ Enlaces | Todos los recursos importantes |

---
