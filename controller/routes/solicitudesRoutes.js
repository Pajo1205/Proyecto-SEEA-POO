"use strict";

// Rutas de solicitudes. Reciben dependencias compartidas del router principal.
module.exports = function registrarSolicitudes(ctx) {
    const { router, datos, bcrypt, Colegio, Horario, Solicitud, Visita, Actividad, UsuarioColegio, EncargadoSEEA, Voluntario, DisponibilidadVoluntario, AsignacionVoluntario, error, buscarPorId, textoValido, correoValido, usuarioPublico, colegioDTO, horarioDTO, solicitudDTO, actividadDTO, asignacionDTO, visitaDTO, requiereSesion, requiereRol } = ctx;

// ==========================================
// SOLICITUDES
// ==========================================

// Consultar solicitudes
router.get(
    "/solicitudes",
    requiereRol("SEEA", "COLEGIO"),
    (req, res) => {
        const solicitudes = datos.solicitudes.filter(
            s => req.usuario.rol === "SEEA" ||
                s.colegio === req.usuario.colegio
        );

        return res.json(
            solicitudes.map(solicitudDTO)
        );
    }
);

// Crear solicitud
router.post(
    "/solicitudes",
    requiereRol("SEEA", "COLEGIO"),
    (req, res) => {
        try {
            const body = req.body || {};

            const colegio =
                req.usuario.rol === "COLEGIO"
                    ? req.usuario.colegio
                    : buscarPorId(datos.colegios, body.idColegio);

            const horario = buscarPorId(
                datos.horarios,
                body.idHorario
            );

            if (!colegio || !horario) {
                return error(
                    res,
                    404,
                    "Colegio u horario no encontrado"
                );
            }

            if (!horario.estaDisponible()) {
                return error(res, 409, "Horario ocupado");
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
                mensaje: "Solicitud enviada a SEEA",
                solicitud: solicitudDTO(solicitud)
            });

        } catch (err) {
            return error(res, 400, err.message);
        }
    }
);

// Aprobar solicitud
router.patch(
    "/solicitudes/:id/aprobar",
    requiereRol("SEEA"),
    (req, res) => {
        const solicitud = buscarPorId(
            datos.solicitudes,
            req.params.id
        );

        if (!solicitud) {
            return error(res, 404, "Solicitud no encontrada");
        }

        const ocupados = datos.solicitudes
            .filter(s => s !== solicitud && s.estaAprobada())
            .map(s => s.horario);

        if (!solicitud.aprobar(ocupados)) {
            return error(
                res,
                409,
                "No se pudo aprobar la solicitud"
            );
        }

        return res.json({
            mensaje: "Solicitud aprobada",
            solicitud: solicitudDTO(solicitud)
        });
    }
);

// Rechazar solicitud
router.patch(
    "/solicitudes/:id/rechazar",
    requiereRol("SEEA"),
    (req, res) => {
        const solicitud = buscarPorId(
            datos.solicitudes,
            req.params.id
        );

        if (!solicitud) {
            return error(res, 404, "Solicitud no encontrada");
        }

        if (!solicitud.rechazar()) {
            return error(res, 409, "No se puede rechazar");
        }

        return res.json({
            mensaje: "Solicitud rechazada",
            solicitud: solicitudDTO(solicitud)
        });
    }
);

// Cancelar solicitud
router.patch(
    "/solicitudes/:id/cancelar",
    requiereRol("SEEA", "COLEGIO"),
    (req, res) => {
        const solicitud = buscarPorId(
            datos.solicitudes,
            req.params.id
        );

        if (!solicitud) {
            return error(res, 404, "Solicitud no encontrada");
        }

        if (req.usuario.rol === "COLEGIO" &&
            solicitud.colegio !== req.usuario.colegio) {

            return error(res, 403, "Solicitud ajena");
        }

        const visita = datos.visitas.find(
            v => v.solicitud === solicitud
        );

        if (visita &&
            !["PROGRAMADA", "CANCELADA"].includes(visita.estado)) {

            return error(
                res,
                409,
                "La visita ya inicio o finalizo"
            );
        }

        if (!solicitud.cancelar()) {
            return error(res, 409, "No se puede cancelar");
        }

        if (visita && visita.estado === "PROGRAMADA") {
            visita.cancelar();
        }

        return res.json({
            mensaje: "Solicitud cancelada",
            solicitud: solicitudDTO(solicitud)
        });
    }
);

// Reagendar solicitud
router.patch(
    "/solicitudes/:id/reagendar",
    requiereRol("SEEA", "COLEGIO"),
    (req, res) => {
        const solicitud = buscarPorId(
            datos.solicitudes,
            req.params.id
        );

        if (!solicitud) {
            return error(res, 404, "Solicitud no encontrada");
        }

        if (req.usuario.rol === "COLEGIO" &&
            solicitud.colegio !== req.usuario.colegio) {

            return error(res, 403, "Solicitud ajena");
        }

        const tieneVisita = datos.visitas.some(
            v => v.solicitud === solicitud
        );

        if (tieneVisita) {
            return error(
                res,
                409,
                "La visita ya esta programada"
            );
        }

        const nuevoHorario = buscarPorId(
            datos.horarios,
            req.body?.idHorario
        );

        if (!nuevoHorario) {
            return error(res, 404, "Horario no encontrado");
        }

        const ocupados = datos.solicitudes
            .filter(s => s !== solicitud && s.estaAprobada())
            .map(s => s.horario);

        if (!solicitud.cambiarHorario(nuevoHorario, ocupados)) {
            return error(res, 409, "No se puede reagendar");
        }

        return res.json({
            mensaje: "Horario actualizado",
            solicitud: solicitudDTO(solicitud)
        });
    }
);

// Eliminar solicitud
router.delete(
    "/solicitudes/:id",
    requiereRol("SEEA"),
    (req, res) => {
        const solicitud = buscarPorId(
            datos.solicitudes,
            req.params.id
        );

        if (!solicitud) {
            return error(res, 404, "Solicitud no encontrada");
        }

        const tieneVisita = datos.visitas.some(
            v => v.solicitud === solicitud
        );

        if (solicitud.estaAprobada() || tieneVisita) {
            return error(
                res,
                409,
                "No se puede eliminar esta solicitud"
            );
        }

        datos.solicitudes.splice(
            datos.solicitudes.indexOf(solicitud),
            1
        );

        return res.json({
            mensaje: "Solicitud eliminada"
        });
    }
);


};
