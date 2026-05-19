# StudySync API - José Ricardo López Flores

API REST para gestión de grupos de estudio, desarrollada con Node.js + Express y desplegada en Render.

---

## 🌐 URL de producción

https://studysync-api-jrlopez.onrender.com

---

## 👨‍💻 Autor

**José Ricardo López Flores**

---

## 🛠️ Tecnologías

- Node.js
- Express.js
- JavaScript
- MVC
- Render (deploy)

---

## 📦 Endpoints

| Método | Ruta               | Descripción                |
|--------|--------------------|----------------------------|
| GET    | /api/grupos        | Listar todos los grupos    |
| GET    | /api/grupos/:id    | Obtener grupo por ID       |
| POST   | /api/grupos        | Crear un nuevo grupo       |
| PUT    | /api/grupos/:id    | Actualizar grupo completo  |
| DELETE | /api/grupos/:id    | Eliminar un grupo          |

---

## 📝 Ejemplo de uso (POST)

```json
{
  "nombre": "Grupo Álgebra",
  "materia": "Álgebra Lineal",
  "integrantes": 4
}