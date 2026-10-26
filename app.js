
const express = require("express");
const path = require("path");

// ======================================
// CREAR APLICACION EXPRESS
// ======================================

const app = express();
const PORT = 3000;

// Permitir recibir datos JSON desde Postman
app.use(express.json());

// Servir archivos estaticos (sonidos, imagenes, etc.)
app.use("/assets", express.static(path.join(__dirname, "view", "assets")));

// Servir Bootstrap instalado con npm
app.use(
    "/bootstrap",
    express.static(path.join(__dirname, "node_modules", "bootstrap", "dist"))
);

// Servir los estilos propios de la vista
app.get("/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "view", "style.css"));
});

// Servir el JavaScript propio de la vista
app.get("/BrowserView.js", (req, res) => {
    res.sendFile(path.join(__dirname, "view", "BrowserView.js"));
});

// ======================================
// IMPORTAR CONTROLADORES
// ======================================

const usuarioController = require("./controller/usuarioController");

const colegioController = require("./controller/colegioController");

const horarioController = require("./controller/horarioController");

const solicitudController = require("./controller/solicitudController");

const visitaController = require("./controller/visitaController");

const voluntarioController = require("./controller/voluntarioController");

// ======================================
// RUTA PRINCIPAL
// ======================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "view", "BrowserView.html"));
});

// ======================================
// RUTAS DE USUARIOS
// ======================================

// Registrar usuario
app.post("/usuarios", usuarioController.registrarUsuario);

// Obtener todos los usuarios
app.get("/usuarios", usuarioController.obtenerUsuarios);

// Buscar usuario por ID
app.get("/usuarios/:id", usuarioController.buscarUsuario);

// Iniciar sesion
app.post("/login", usuarioController.iniciarSesion);

// ======================================
// RUTAS DE COLEGIOS
// ======================================

// Registrar colegio
app.post("/colegios", colegioController.registrarColegio);

// Obtener todos los colegios
app.get("/colegios", colegioController.obtenerColegios);

// Buscar colegio por ID
app.get("/colegios/:id", colegioController.buscarColegio);

// Actualizar colegio
app.patch("/colegios/:id", colegioController.actualizarColegio);

// Eliminar colegio
app.delete("/colegios/:id", colegioController.eliminarColegio);

// ======================================
// RUTAS DE HORARIOS
// ======================================

// Crear horario
app.post("/horarios", horarioController.crearHorario);

// Obtener todos los horarios
app.get("/horarios", horarioController.obtenerHorarios);

// Obtener horarios disponibles
app.get(
    "/horarios/disponibles",
    horarioController.obtenerDisponibles
);

// Buscar horario por ID
app.get("/horarios/:id", horarioController.buscarHorario);

// Eliminar horario
app.delete("/horarios/:id", horarioController.eliminarHorario);

// ======================================
// RUTAS DE SOLICITUDES
// ======================================

// Crear solicitud
app.post(
    "/solicitudes",
    solicitudController.crearSolicitud
);

// Obtener solicitudes
app.get(
    "/solicitudes",
    solicitudController.obtenerSolicitudes
);

// Aprobar solicitud
app.patch(
    "/solicitudes/:id/aprobar",
    solicitudController.aprobarSolicitud
);

// Rechazar solicitud
app.patch(
    "/solicitudes/:id/rechazar",
    solicitudController.rechazarSolicitud
);

// Cancelar solicitud
app.patch(
    "/solicitudes/:id/cancelar",
    solicitudController.cancelarSolicitud
);

// Eliminar solicitud
app.delete(
    "/solicitudes/:id",
    solicitudController.eliminarSolicitud
);

// ======================================
// RUTAS DE VISITAS
// ======================================

// Crear visita
app.post("/visitas", visitaController.crearVisita);

// Obtener todas las visitas
app.get("/visitas", visitaController.obtenerVisitas);

// Buscar visita por ID
app.get("/visitas/:id", visitaController.buscarVisita);

// Agregar actividad a una visita
app.post(
    "/visitas/:id/actividades",
    visitaController.agregarActividad
);

// Iniciar visita
app.patch(
    "/visitas/:id/iniciar",
    visitaController.iniciarVisita
);

// Finalizar visita
app.patch(
    "/visitas/:id/finalizar",
    visitaController.finalizarVisita
);

// ======================================
// RUTAS DE ACTIVIDADES
// ======================================

// Registrar actividad
app.post(
    "/actividades",
    visitaController.crearActividad
);

// Obtener actividades
app.get(
    "/actividades",
    visitaController.obtenerActividades
);

// ======================================
// RUTAS DE VOLUNTARIOS
// ======================================

// Registrar disponibilidad
app.post(
    "/voluntarios/:id/disponibilidad",
    voluntarioController.registrarDisponibilidad
);

// Consultar disponibilidad
app.get(
    "/voluntarios/:id/disponibilidad",
    voluntarioController.obtenerDisponibilidades
);

// Inscribir voluntario a una visita
app.post(
    "/asignaciones",
    voluntarioController.inscribirVoluntario
);

// Obtener asignaciones
app.get(
    "/asignaciones",
    voluntarioController.obtenerAsignaciones
);

// Cancelar asignacion
app.patch(
    "/asignaciones/:id/cancelar",
    voluntarioController.cancelarAsignacion
);

// ======================================
// RUTA NO ENCONTRADA
// ======================================

app.use((req, res) => {
    res.status(404).json({
        mensaje: "La ruta solicitada no existe"
    });
});

// ======================================
// MANEJO GENERAL DE ERRORES
// ======================================

app.use((err, req, res, next) => {
    console.error("Error en el servidor:", err);

    res.status(500).json({
        mensaje: "Error interno del servidor"
    });
});

// ======================================
// INICIAR SERVIDOR
// ======================================

module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log("==================================");
        console.log("   SISTEMA SEEA - SERVIDOR");
        console.log("==================================");
        console.log(`Servidor funcionando en puerto ${PORT}`);
        console.log(`URL: http://localhost:${PORT}`);
        console.log("Esperando peticiones...");
    });
}
