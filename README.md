# FLACOW - Gym Progress Tracker App

FLACOW es una aplicación diseñada para ayudarte a llevar un registro detallado de tu progreso en el gimnasio. Con esta herramienta podrás monitorear los pesos, repeticiones y ejercicios que realizas a lo largo del tiempo, visualizando tu evolución de forma clara y sencilla.

## Características

- **Registro de Ejercicios**: Lleva un control detallado de cada uno de los ejercicios que realizas en el gimnasio, incluyendo el peso y el número de repeticiones.
- **Historial de Levantamientos**: Consulta y administra el historial de peso de tus ejercicios para observar tu progreso a lo largo del tiempo.
- **Gráficas de Progreso**: Visualiza cómo has aumentado tu fuerza y resistencia con gráficas claras y motivadoras.
- **Modo Claro/Oscuro**: Cambia fácilmente entre los modos claro y oscuro para una mejor experiencia de usuario.


## Correr la Aplicación con Docker

Para ejecutar FLACOW usando Docker, sigue estos pasos:

1. Asegúrate de tener [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/) instalados.

2. Configura tus variables de entorno en un archivo `.env` en el mismo directorio que `docker-compose.yml`:

   ```env
   POSTGRES_USER=ejemplo_usuario
   POSTGRES_PASSWORD=ejemplo_password
   POSTGRES_DB=flacow_db
   POSTGRES_HOST=postgres
   POSTGRES_PORT=5432
   BACKEND_SYNCHRONIZE=false
   PUBLIC_API_BASE_URL=http://localhost:81/api
   ADMIN_EMAIL=admin@flacow.com
   ADMIN_PASSWORD=ejemplo_password_admin
   ```

3. Construye y levanta los contenedores:
   ```bash
   docker-compose up --build
   ```

4. Accede a la aplicación:
   - Frontend: `http://localhost`
   - Backend: Se maneja internamente por Nginx, todas las llamadas a `/api` se redirigen al backend.

## Variables de Entorno

| Variable            | Descripción                                     | Valor de Ejemplo                |
|---------------------|-------------------------------------------------|---------------------------------|
| POSTGRES_USER       | Usuario de la base de datos PostgreSQL          | `ejemplo_usuario`               |
| POSTGRES_PASSWORD   | Contraseña del usuario PostgreSQL               | `ejemplo_password`              |
| POSTGRES_DB         | Nombre de la base de datos                      | `flacow_db`                     |
| POSTGRES_HOST       | Host de la base de datos PostgreSQL             | `postgres` (nombre del contenedor) |
| POSTGRES_PORT       | Puerto de PostgreSQL                            | `5432`                          |
| BACKEND_SYNCHRONIZE | Sincronizar el esquema de la base de datos (NO en prod) | `false`                    |
| PUBLIC_API_BASE_URL | URL base de la API en prod             | `http://localhost:81/api`       |
| ADMIN_EMAIL         | Email del usuario administrador predeterminado  | `admin@flacow.com`              |
| ADMIN_PASSWORD      | Contraseña del usuario administrador predeterminado | `defaultpassword`     |

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
- **Backend**: NestJS, PostgreSQL.
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

