const UsuarioController = require("./UsuarioController");

const UsuarioColegio = require("../model/UsuarioColegio");
const EncargadoSEEA = require("../model/EncargadoSEEA");
const Voluntario = require("../model/Voluntario");
const Colegio = require("../model/Colegio");
const Horario = require("../model/Horario");
const Visita = require("../model/Visita");
const Actividad = require("../model/Activida");
const DisponibilidadVoluntario = require(
    "../model/DisponibilidadVoluntario"
);

class SEEAController {

    constructor() {

        this.usuarioController = new UsuarioController();

        this.colegios = [];
        this.voluntarios = [];
        this.solicitudes = [];
        this.visitas = [];
    }


    // =========================
    // COLEGIOS
    // =========================

    registrarColegio(colegio) {

        if (colegio == null) {
            return false;
        }

        if (this.buscarColegioPorId(colegio.getId()) != null) {
            return false;
        }

        this.colegios.push(colegio);

        return true;
    }

    buscarColegioPorId(id) {

        return this.colegios.find(
            colegio => colegio.getId() === id
        ) || null;
    }

    listarColegios() {
        return this.colegios;
    }


    // =========================
    // USUARIOS
    // =========================

    crearUsuarioColegio(
        id,
        nombre,
        correo,
        contrasena,
        telefono,
        colegio
    ) {

        const usuario = new UsuarioColegio(
            id,
            nombre,
            correo,
            contrasena,
            telefono,
            colegio
        );

        if (!this.usuarioController.registrarUsuario(usuario)) {
            return null;
        }

        return usuario;
    }

    crearEncargadoSEEA(id, nombre, correo, contrasena, puesto) {

        const encargado = new EncargadoSEEA(
            id,
            nombre,
            correo,
            contrasena,
            puesto
        );

        if (!this.usuarioController.registrarUsuario(encargado)) {
            return null;
        }

        return encargado;
    }

    crearVoluntario(
        id,
        nombre,
        correo,
        contrasena,
        carnet,
        carrera
    ) {

        const voluntario = new Voluntario(
            id,
            nombre,
            correo,
            contrasena,
            carnet,
            carrera
        );

        if (!this.usuarioController.registrarUsuario(voluntario)) {
            return null;
        }

        this.voluntarios.push(voluntario);

        return voluntario;
    }

    agregarDisponibilidad(
        voluntarioId,
        id,
        fecha,
        horaInicio,
        horaFin
    ) {

        const voluntario = this.buscarVoluntarioPorId(voluntarioId);

        if (voluntario == null) {
            return false;
        }

        return voluntario.agregarDisponibilidad(
            new DisponibilidadVoluntario(
                id,
                fecha,
                horaInicio,
                horaFin
            )
        );
    }

    buscarVoluntarioPorId(id) {

        return this.voluntarios.find(
            voluntario => voluntario.getId() === id
        ) || null;
    }

    listarVoluntarios() {
        return this.voluntarios;
    }

    listarUsuarios() {
        return this.usuarioController.listarUsuarios();
    }

    buscarUsuarioPorId(id) {
        return this.usuarioController.buscarPorId(id);
    }


    // =========================
    // SOLICITUDES
    // =========================

    crearSolicitud(
        usuarioColegioId,
        id,
        horario,
        cantidadEstudiantes,
        cantidadProfesores,
        grado,
        transporte,
        solicitaTour,
        solicitaCharla,
        solicitaTaller,
        observaciones = ""
    ) {

        const usuario = this.buscarUsuarioPorId(usuarioColegioId);

        if (usuario == null) {
            return null;
        }

        const solicitud = usuario.crearSolicitud(
            id,
            horario,
            cantidadEstudiantes,
            cantidadProfesores,
            grado,
            transporte,
            solicitaTour,
            solicitaCharla,
            solicitaTaller,
            observaciones
        );

        if (solicitud == null) {
            return null;
        }

        this.solicitudes.push(solicitud);

        return solicitud;
    }

    buscarSolicitudPorId(id) {

        return this.solicitudes.find(
            solicitud => solicitud.getId() === id
        ) || null;
    }

    listarSolicitudes() {
        return this.solicitudes;
    }

    aprobarSolicitud(encargadoId, solicitudId) {

        const encargado = this.buscarUsuarioPorId(encargadoId);
        const solicitud = this.buscarSolicitudPorId(solicitudId);

        if (encargado == null || solicitud == null) {
            return false;
        }

        return encargado.aprobarSolicitud(solicitud);
    }

    rechazarSolicitud(encargadoId, solicitudId) {

        const encargado = this.buscarUsuarioPorId(encargadoId);
        const solicitud = this.buscarSolicitudPorId(solicitudId);

        if (encargado == null || solicitud == null) {
            return false;
        }

        return encargado.rechazarSolicitud(solicitud);
    }

    cancelarSolicitud(solicitudId) {

        const solicitud = this.buscarSolicitudPorId(solicitudId);

        if (solicitud == null) {
            return false;
        }

        return solicitud.cancelar();
    }


    // =========================
    // VISITAS
    // =========================

    crearVisita(encargadoId, visitaId, solicitudId) {

        const encargado = this.buscarUsuarioPorId(encargadoId);
        const solicitud = this.buscarSolicitudPorId(solicitudId);

        if (encargado == null || solicitud == null) {
            return null;
        }

        // Visita solo existe sobre una solicitud aprobada
        if (!solicitud.estaAprobada()) {
            return null;
        }

        const visita = encargado.crearVisita(visitaId, solicitud);

        this.visitas.push(visita);

        return visita;
    }

    buscarVisitaPorId(id) {

        return this.visitas.find(
            visita => visita.getId() === id
        ) || null;
    }

    listarVisitas() {
        return this.visitas;
    }

    agregarActividad(
        visitaId,
        id,
        nombre,
        tipo,
        descripcion,
        duracionMinutos,
        capacidadMaxima
    ) {

        const visita = this.buscarVisitaPorId(visitaId);

        if (visita == null) {
            return false;
        }

        return visita.agregarActividad(
            new Actividad(
                id,
                nombre,
                tipo,
                descripcion,
                duracionMinutos,
                capacidadMaxima
            )
        );
    }

    inscribirVoluntario(visitaId, voluntarioId) {

        const visita = this.buscarVisitaPorId(visitaId);
        const voluntario = this.buscarVoluntarioPorId(voluntarioId);

        if (visita == null || voluntario == null) {
            return false;
        }

        return voluntario.inscribirseVisita(visita);
    }
}

module.exports = SEEAController;
