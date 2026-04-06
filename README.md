# 🍷 Vinacoteca Control Panel (Fullstack MERN)

Panel de administración integral para la gestión de inventario de vinos, cervezas y control de usuarios. Desarrollado con el stack MERN (MongoDB, Express, React, Node.js) y estilizado con Tailwind CSS.

---

## 🚀 Características principales

- **Gestión de Inventario:** CRUD completo (Crear, Leer, Actualizar, Borrar) de Vinos y Cervezas.
- **Control de Usuarios:** Registro y gestión de perfiles con diferentes niveles de acceso.
- **Sistema de Roles:**
  - `Admin`: Acceso total, incluyendo gestión de usuarios.
  - `Editor`: Gestión exclusiva de productos (vinos/cervezas).
- **Seguridad:** Autenticación mediante JWT (JSON Web Tokens) y protección de rutas en Frontend/Backend.
- **Diseño Responsive:** Interfaz moderna y minimalista adaptada a dispositivos móviles y escritorio.

---

## 🛠️ Tecnologías utilizadas

**Frontend:**

- React.js
- Tailwind CSS (Diseño UI)
- Axios (Peticiones API)
- React Router Dom (Navegación)

**Backend:**

- Node.js & Express
- MongoDB & Mongoose (Base de datos)
- JSON Web Token (Seguridad)
- Bcrypt (Encriptación de contraseñas)

---

## 📦 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

### 2. Configuración del Backend

Entra en la carpeta del servidor e instala las dependencias:

```bash
cd backend
npm install
```

Crea un archivo `.env` en la raíz de `backend` con lo siguiente:

```env
PORT=3000
MONGODB_URI=tu_cadena_de_conexion_mongodb
JWT_SECRET=tu_palabra_secreta_super_segura
```

Lanza el servidor:

```bash
npm run dev
```

### 3. Configuración del Frontend

Entra en la carpeta del cliente e instala las dependencias:

```bash
cd ../frontend
npm install
```

Lanza la aplicación:

```bash
npm run dev
```

---

## 🔌 API Endpoints (Resumen)

| Método   | Ruta                        | Descripción                       |
| -------- | --------------------------- | --------------------------------- |
| `GET`    | `/api/vinos`                | Obtener todos los vinos           |
| `POST`   | `/api/vinos`                | Crear nuevo vino (Requiere Token) |
| `DELETE` | `/api/cervezas/id/:id`      | Eliminar cerveza por ID           |
| `POST`   | `/api/auth/registro`        | Registrar nuevo usuario           |
| `PUT`    | `/api/auth/admin/users/:id` | Editar usuario (Solo Admin)       |

---

## 📝 Notas de Despliegue (SPA)

Si despliegas el frontend en Vercel, asegúrate de que el archivo `vercel.json` esté en la raíz para evitar errores 404 al refrescar (F5):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## ✒️ Autor

- **Tu Nombre** — [Tu GitHub](https://github.com/tu-usuario)
