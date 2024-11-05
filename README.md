# FLACOW - Gym Progress Tracker App

FLACOW es una aplicación diseñada para ayudarte a llevar un registro detallado de tu progreso en el gimnasio. Con esta herramienta podrás monitorear los pesos, repeticiones y ejercicios que realizas a lo largo del tiempo, visualizando tu evolución de forma clara y sencilla.

## Características

- **Registro de Ejercicios**: Lleva un control detallado de cada uno de los ejercicios que realizas en el gimnasio, incluyendo el peso y el número de repeticiones.
- **Historial de Levantamientos**: Consulta y administra el historial de peso de tus ejercicios para observar tu progreso a lo largo del tiempo.
- **Gráficas de Progreso**: Visualiza cómo has aumentado tu fuerza y resistencia con gráficas claras y motivadoras.
- **Modo Claro/Oscuro**: Cambia fácilmente entre los modos claro y oscuro para una mejor experiencia de usuario.

## Instalación y Configuración

### Prerrequisitos

- [Node.js](https://nodejs.org/en/) v14 o superior
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/redflox/progresapp-flacow.git
   cd progresapp-flacow
   ```

2. Instala las dependencias:
   ```bash
   npm install
   # o si prefieres yarn
   yarn install
   ```

3. Configura las variables de entorno. Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   # o con yarn
   yarn dev
   ```

## Estructura del Proyecto

- **/src**: Contiene el código fuente de la aplicación.
  - **components**: Componentes reutilizables, como `Navbar`, `ExerciseListDashboard`, etc.
  - **pages**: Páginas principales del sitio, como `Dashboard`, `SignupForm`, `Login` y `AdminPanel`.
  - **store**: Estado global manejado con Zustand.
  - **api**: Servicios para la comunicación con el backend.
  - **themes**: Configuración de temas claro y oscuro usando Material UI.

## Uso

### Crear una Cuenta

1. Visita `/app/register` para crear una cuenta.
2. Llena el formulario de registro con tu nombre, correo electrónico y contraseña.
3. Una vez registrado, podrás iniciar sesión para acceder a las funcionalidades de la aplicación.

### Registrar Ejercicios y Pesos

1. Navega a la página del panel de administración (`/app/settings`) para agregar músculos y ejercicios.
2. Registra el progreso de tus levantamientos en la página del historial de levantamientos (`/app/lifting-histories/exercises/:exerciseId`).
3. Puedes visualizar gráficos del progreso en la página del Dashboard.

## Temas - Modo Claro y Oscuro

FLACOW cuenta con dos temas visuales: claro y oscuro, que se pueden alternar a través del botón correspondiente en la barra de navegación.

- **Paleta de Colores Utilizada**:
  - **Naranja**: `#e3a765`
  - **Amarillo**: `#fdd000`
  - **Claro**: `#f2efe2`
  - **Gris**: `#5d6d7c`
  - **Negro**: `#000000`

## Tecnologías Utilizadas

- **Frontend**: React, Material UI, Zustand (para gestión de estado).
- **Backend**: Se espera que la API esté desplegada localmente o en un servidor remoto accesible mediante `REACT_APP_API_URL`.
- **Gestión de Formularios y Validaciones**: Formik y Yup.
- **Notificaciones**: Notistack.

## Contribuir

FLACOW es un proyecto de código abierto. Puedes contribuir de las siguientes maneras:

1. **Propuestas de Mejora**: Si tienes una idea para mejorar la aplicación, abre un `issue` o envía una PR al [repositorio en GitHub](https://github.com/redflox/progresapp-flacow).
2. **Corrección de Errores**: Si encuentras un error, abre un `issue` describiendo el problema o crea una PR con una solución.

### Licencia

Este proyecto está licenciado bajo la Licencia **Creative Commons BY-NC-SA**. Puedes compartir, modificar y contribuir al proyecto, pero no se permite el uso comercial ni lucrativo.

## Contacto

- **Creador**: Bryan Felipe Muñoz Molina
- **Correo Electrónico**: [bfmumo@gmail.com](mailto:bfmumo@gmail.com)
- **GitHub**: [redflox](https://github.com/redflox)
- **Sitio Web**: [redflox.com](https://redflox.com)

## Demo

Prueba la aplicación en: [FLACOW App](https://flacow.bfmu.dev)

---

Esperamos que disfrutes utilizando FLACOW y que te ayude a alcanzar tus objetivos de fuerza y salud. ¡Únete a la comunidad y empieza a progresar hoy mismo!

