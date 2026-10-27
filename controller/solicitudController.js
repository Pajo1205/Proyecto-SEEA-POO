
const Solicitud = require("../Modelo/Solicitud");
const datos = require("../datos");

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function responderError(res, codigo, mensaje) {
    return res.status(codigo).json({ mensaje });
}

function buscarSolicitudPorId(id) {
    return datos.solicitudes.find(
        solicitud => solicitud.getId() === Number(id)
    );
}

function buscarColegioPorId(id) {
    return datos.colegios.find(
        colegio => colegio.getId() === Number(id)
    );
}

function buscarHorarioPorId(id) {
    return datos.horarios.find(
        horario => horario.getId() === Number(id)
    );
}

function buscarVisitaPorSolicitud(solicitud) {
    return datos.visitas.find(
        visita => visita.getSolicitud() === solicitud
    );
}

// ==========================================
// PERMISOS
// ==========================================

function tieneAcceso(req, solicitud) {

    if (!req.usuario) {
        return false;
    }

    if (req.usuario.rol === "SEEA") {
        return true;
    }

    return (
        req.usuario.rol === "COLEGIO" &&
        solicitud.getColegio() === req.usuario.getColegio()
    );
}

function esEncargado(req) {
    return req.usuario?.rol === "SEEA";
}

// ==========================================
// CONVERTIR SOLICITUD A JSON
// ==========================================

function solicitudDTO(solicitud) {

    const colegio = solicitud.getColegio();
    const horario = solicitud.getHorario();

    return {
        id: solicitud.getId(),

        colegio: {
            id: colegio.getId(),
            nombre: colegio.getNombre(),
            aliado: colegio.getAliado()
        },

        horario: {
            id: horario.getId(),
            fecha: horario.getFecha(),
            horaInicio: horario.getHoraInicio(),
            horaFin: horario.getHoraFin(),
            disponible: horario.estaDisponible()
        },

        cantidadEstudiantes:
            solicitud.getCantidadEstudiantes(),

        cantidadProfesores:
            solicitud.getCantidadProfesores(),

        grado: solicitud.getGrado(),

        transporte: solicitud.getTransporte(),

        solicitaTour: solicitud.getSolicitaTour(),

        solicitaCharla: solicitud.getSolicitaCharla(),

        solicitaTaller: solicitud.getSolicitaTaller(),

        observaciones: solicitud.getObservaciones(),

        estado: solicitud.getEstado()
    };
}

// ==========================================
// CREAR SOLICITUD
// ==========================================

function crearSolicitud(req, res) {

    try {

        if (!req.usuario) {
            return responderError(
                res,
                401,
                "Debes iniciar sesion"
            );
        }

        if (!["SEEA", "COLEGIO"].includes(req.usuario.rol)) {
            return responderError(
                res,
                403,
                "No tienes permiso para crear solicitudes"
            );
        }

        const body = req.body || {};

        // El colegio se obtiene de la sesion
        // cuando el usuario es de tipo COLEGIO.
        const colegio = req.usuario.rol === "COLEGIO"
            ? req.usuario.getColegio()
            : buscarColegioPorId(body.idColegio);

        const horario = buscarHorarioPorId(
            body.idHorario
        );

        if (!colegio || !horario) {
            return responderError(
                res,
                404,
                "Colegio u horario no encontrado"
            );
        }

        if (!horario.estaDisponible()) {
            return responderError(
                res,
                409,
                "El horario no esta disponible"
            );
        }

        const solicitud = new Solicitud(
            datos.generarId("solicitud"),
            colegio,
            horario,
            body.cantidadEstudiantes,
            body.cantidadProfesores,
            body.grado,
            body.transporte,
            body.solicitaTour,
            body.solicitaCharla,
            body.solicitaTaller,
            body.observaciones || ""
        );

        datos.solicitudes.push(solicitud);

        return res.status(201).json({
            mensaje: "Solicitud creada correctamente",
            solicitud: solicitudDTO(solicitud)
        });

    } catch (error) {
        return responderError(
            res,
            400,
            error.message
        );
    }
}

// ==========================================
// CONSULTAR SOLICITUDES
// ==========================================

function obtenerSolicitudes(req, res) {

    if (!req.usuario) {
        return responderError(
            res,
            401,
            "Debes iniciar sesion"
        );
    }

    if (!["SEEA", "COLEGIO"].includes(req.usuario.rol)) {
        return responderError(
            res,
            403,
            "No tienes permiso para consultar solicitudes"
        );
    }

    const solicitudes = datos.solicitudes.filter(
        solicitud => tieneAcceso(req, solicitud)
    );

    return res.status(200).json(
        solicitudes.map(solicitudDTO)
    );
}

// ==========================================
// BUSCAR SOLICITUD
// ==========================================

function buscarSolicitud(req, res) {

    const solicitud = buscarSolicitudPorId(
        req.params.id
    );

    if (!solicitud) {
        return responderError(
            res,
            404,
            "Solicitud no encontrada"
        );
    }

    if (!tieneAcceso(req, solicitud)) {
        return responderError(
            res,
            403,
            "No tienes permiso para consultar esta solicitud"
        );
    }

    return res.status(200).json(
        solicitudDTO(solicitud)
    );
}

// ==========================================
// APROBAR SOLICITUD
// ==========================================

function aprobarSolicitud(req, res) {

    if (!esEncargado(req)) {
        return responderError(
            res,
            403,
            "Solo SEEA puede aprobar solicitudes"
        );
    }

    const solicitud = buscarSolicitudPorId(
        req.params.id
    );

    if (!solicitud) {
        return responderError(
            res,
            404,
            "Solicitud no encontrada"
        );
    }

    const horariosOcupados = datos.solicitudes
        .filter(
            s => s !== solicitud && s.estaAprobada()
        )
        .map(s => s.getHorario());

    if (!solicitud.aprobar(horariosOcupados)) {
        return responderError(
            res,
            409,
            "No se pudo aprobar la solicitud"
        );
    }

    return res.status(200).json({
        mensaje: "Solicitud aprobada correctamente",
        solicitud: solicitudDTO(solicitud)
    });
}

// ==========================================
// RECHAZAR SOLICITUD
// ==========================================

function rechazarSolicitud(req, res) {

    if (!esEncargado(req)) {
        return responderError(
            res,
            403,
            "Solo SEEA puede rechazar solicitudes"
        );
    }

    const solicitud = buscarSolicitudPorId(
        req.params.id
    );

    if (!solicitud) {
        return responderError(
            res,
            404,
            "Solicitud no encontrada"
        );
    }

    if (!solicitud.rechazar()) {
        return responderError(
            res,
            409,
            "No se puede rechazar esta solicitud"
        );
    }

    return res.status(200).json({
        mensaje: "Solicitud rechazada",
        solicitud: solicitudDTO(solicitud)
    });
}

// ==========================================
// CANCELAR SOLICITUD
// ==========================================

function cancelarSolicitud(req, res) {

    const solicitud = buscarSolicitudPorId(
        req.params.id
    );

    if (!solicitud) {
        return responderError(
            res,
            404,
            "Solicitud no encontrada"
        );
    }

    if (!tieneAcceso(req, solicitud)) {
        return responderError(
            res,
            403,
            "No tienes permiso para cancelar esta solicitud"
        );
    }

    const visita = buscarVisitaPorSolicitud(
        solicitud
    );

    // No cancelar visitas iniciadas o finalizadas
    if (
        visita &&
        !["PROGRAMADA", "CANCELADA"].includes(
            visita.getEstado()
        )
    ) {
        return responderError(
            res,
            409,
            "La visita ya inicio o finalizo"
        );
    }

    if (!solicitud.cancelar()) {
        return responderError(
            res,
            409,
            "No se puede cancelar esta solicitud"
        );
    }

    // Cancelar visita asociada
    if (
        visita &&
        visita.getEstado() === "PROGRAMADA"
    ) {
        visita.cancelar();
    }

    return res.status(200).json({
        mensaje: "Solicitud cancelada correctamente",
        solicitud: solicitudDTO(solicitud)
    });
}

// ==========================================
// REAGENDAR SOLICITUD
// ==========================================

function reagendarSolicitud(req, res) {

    const solicitud = buscarSolicitudPorId(
        req.params.id
    );

    if (!solicitud) {
        return responderError(
            res,
            404,
            "Solicitud no encontrada"
        );
    }

    if (!tieneAcceso(req, solicitud)) {
        return responderError(
            res,
            403,
            "No tienes permiso para reagendar esta solicitud"
        );
    }

    // No reagendar una visita ya creada
    const visita = buscarVisitaPorSolicitud(
        solicitud
    );

    if (visita) {
        return responderError(
            res,
            409,
            "La solicitud ya tiene una visita programada"
        );
    }

    const nuevoHorario = buscarHorarioPorId(
        req.body?.idHorario
    );

    if (!nuevoHorario) {
        return responderError(
            res,
            404,
            "Horario no encontrado"
        );
    }

    const horariosOcupados = datos.solicitudes
        .filter(
            s => s !== solicitud && s.estaAprobada()
        )
        .map(s => s.getHorario());

    if (!solicitud.cambiarHorario(
        nuevoHorario,
        horariosOcupados
    )) {
        return responderError(
            res,
            409,
            "No se puede reagendar la solicitud"
        );
    }

    return res.status(200).json({
        mensaje: "Solicitud reagendada correctamente",
        solicitud: solicitudDTO(solicitud)
    });
}

// ==========================================
// ELIMINAR SOLICITUD
// ==========================================

function eliminarSolicitud(req, res) {

    if (!esEncargado(req)) {
        return responderError(
            res,
            403,
            "Solo SEEA puede eliminar solicitudes"
        );
    }

    const solicitud = buscarSolicitudPorId(
        req.params.id
    );

    if (!solicitud) {
        return responderError(
            res,
            404,
            "Solicitud no encontrada"
        );
    }

    // No eliminar solicitudes con visitas
    const tieneVisita = datos.visitas.some(
        visita => visita.getSolicitud() === solicitud
    );

    if (tieneVisita) {
        return responderError(
            res,
            409,
            "La solicitud tiene una visita asociada"
        );
    }

    // No eliminar solicitudes aprobadas
    if (solicitud.estaAprobada()) {
        return responderError(
            res,
            409,
            "Primero debes cancelar la solicitud aprobada"
        );
    }

    const posicion = datos.solicitudes.indexOf(
        solicitud
    );

    datos.solicitudes.splice(posicion, 1);

    return res.status(200).json({
        mensaje: "Solicitud eliminada correctamente"
    });
}

// ==========================================
// EXPORTACIONES
// ==========================================

module.exports = {
    crearSolicitud,
    obtenerSolicitudes,
    buscarSolicitud,
    aprobarSolicitud,
    rechazarSolicitud,
    cancelarSolicitud,
    reagendarSolicitud,
    eliminarSolicitud,
    solicitudDTO
};
