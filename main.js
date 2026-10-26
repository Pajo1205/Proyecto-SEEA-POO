const express = require("express");
const path = require("path");

const usuarioController = require("./controller/usuarioController");
const colegioController = require("./controller/colegioController");
const horarioController = require("./controller/horarioController");
const solicitudController = require("./controller/solicitudController");
const visitaController = require("./controller/visitaController");
const voluntarioController = require("./controller/voluntarioController");

const app = express();
const PORT = 3000;

// Recibir JSON
app.use(express.json());

// Archivos del frontend
app.use(express.static(path.join(__dirname, "view")));

// Pagina principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "view", "BrowserView.html"));
});

// USUARIOS
app.post("/usuarios", usuarioController.registrarUsuario);
app.get("/usuarios", usuarioController.obtenerUsuarios);
app.get("/usuarios/:id", usuarioController.buscarUsuario);
app.post("/login", usuarioController.iniciarSesion);

// COLEGIOS
app.post("/colegios", colegioController.registrarColegio);
app.get("/colegios", colegioController.obtenerColegios);
app.get("/colegios/:id", colegioController.buscarColegio);
app.patch("/colegios/:id", colegioController.actualizarColegio);
app.delete("/colegios/:id", colegioController.eliminarColegio);

// HORARIOS
app.post("/horarios", horarioController.crearHorario);
app.get("/horarios", horarioController.obtenerHorarios);
app.get("/horarios/disponibles", horarioController.obtenerDisponibles);
app.get("/horarios/:id", horarioController.buscarHorario);
app.delete("/horarios/:id", horarioController.eliminarHorario);

// SOLICITUDES
app.post("/solicitudes", solicitudController.crearSolicitud);
app.get("/solicitudes", solicitudController.obtenerSolicitudes);
app.patch("/solicitudes/:id/aprobar", solicitudController.aprobarSolicitud);
app.patch("/solicitudes/:id/rechazar", solicitudController.rechazarSolicitud);
app.patch("/solicitudes/:id/cancelar", solicitudController.cancelarSolicitud);
app.delete("/solicitudes/:id", solicitudController.eliminarSolicitud);

// VISITAS
app.post("/visitas", visitaController.crearVisita);
app.get("/visitas", visitaController.obtenerVisitas);
app.get("/visitas/:id", visitaController.buscarVisita);
app.post("/visitas/:id/actividades", visitaController.agregarActividad);
app.patch("/visitas/:id/iniciar", visitaController.iniciarVisita);
app.patch("/visitas/:id/finalizar", visitaController.finalizarVisita);

// ACTIVIDADES
app.post("/actividades", visitaController.crearActividad);
app.get("/actividades", visitaController.obtenerActividades);

// VOLUNTARIOS
app.post(
    "/voluntarios/:id/disponibilidad",
    voluntarioController.registrarDisponibilidad
);

app.get(
    "/voluntarios/:id/disponibilidad",
    voluntarioController.obtenerDisponibilidades
);

app.post("/asignaciones", voluntarioController.inscribirVoluntario);
app.get("/asignaciones", voluntarioController.obtenerAsignaciones);

app.patch(
    "/asignaciones/:id/cancelar",
    voluntarioController.cancelarAsignacion
);

// Ruta inexistente
app.use((req, res) => {
    res.status(404).json({
        mensaje: "Ruta no encontrada"
    });
});

// Manejo de errores
app.use((error, req, res, next) => {
    console.error(error);

    res.status(500).json({
        mensaje: "Error interno del servidor"
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log("================================");
    console.log("      SISTEMA SEEA");
    console.log("================================");
    console.log(`Servidor: http://localhost:${PORT}`);
});