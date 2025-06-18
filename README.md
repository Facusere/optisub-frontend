# OptiSub – Frontend

OptiSub es una aplicación para gestionar y optimizar tus suscripciones de servicios digitales como Netflix, Spotify, Youtube Premium, entre otros. Permite a los usuarios registrar y administrar servicios, pagos, recordatorios y perfiles asociados. Este repositorio contiene el frontend de la aplicación, desarrollado con React, React Router DOM, Material UI y Context API para la gestión de la autenticación, integrándose con una API REST mediante Axios.  

## 🖥️ Tecnologías utilizadas

- **React** 19
- **React Router DOM** 7
- **Material UI (MUI)** 7
- **Axios**
- **Context API** (autenticación)
- **Recharts** (gráficos)
- **React Scripts** (CRA)

## ⚙️ Requisitos previos

- Node.js (v16 o superior)
- npm (v8 o superior)

## 🚀 Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/Facusere/optisub-frontend.git
cd optisub-frontend

# 2. Instalar dependencias
npm install

# 3. Ejecutar la app en git bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`.

## 🔐 Funcionalidades

- Registro e inicio de sesión con autenticación JWT
- CRUD de:
  - Usuarios
  - Perfiles
  - Servicios (con categorías y sugerencias populares)
  - Suscripciones (frecuencia, monto, moneda, estado activo)
  - Pagos (validación automática, fecha sugerida)
  - Recordatorios (email, SMS, notificaciones)
- Navegación protegida mediante rutas privadas (`PrivateRoute`)
- Interfaz moderna con Material UI
