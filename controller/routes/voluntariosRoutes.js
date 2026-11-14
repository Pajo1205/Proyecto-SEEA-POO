"use strict";

// Rutas de voluntarios. Reciben dependencias compartidas del router principal.
module.exports = function registrarVoluntarios(ctx) {
    const { router, datos, bcrypt, Colegio, Horario, Solicitud, Visita, Actividad, UsuarioColegio, EncargadoSEEA, Voluntario, DisponibilidadVoluntario, AsignacionVoluntario, error, buscarPorId, textoValido, correoValido, usuarioPublico, colegioDTO, horarioDTO, solicitudDTO, actividadDTO, asignacionDTO, visitaDTO, requiereSesion, requiereRol } = ctx;

// ==========================================
// VOLUNTARIOS
// ==========================================

// Consultar voluntarios
router.get(
    "/voluntarios",
    requiereRol("SEEA"),
    (req, res) => {
        return res.json(
            datos.usuarios
                .filter(u => u.rol === "VOLUNTARIO")
                .map(usuarioPublico)
        );
    }
);

// Consultar disponibilidad propia
router.get(
    "/disponibilidades",
    requiereRol("VOLUNTARIO"),
    (req, res) => {
        return res.json(
            req.usuario.getDisponibilidades()
        );
    }
);

// Registrar disponibilidad
router.post(
    "/disponibilidades",
    requiereRol("VOLUNTARIO"),
    (req, res) => {
        try {
            const body = req.body || {};

            const disponibilidad =
                new DisponibilidadVoluntario(
                    datos.generarId("disponibilidad"),
                    body.fecha,
                    body.horaInicio,
                    body.horaFin
                );

            if (!req.usuario.agregarDisponibilidad(
                disponibilidad
            )) {
                return error(
                    res,
                    409,
                    "Disponibilidad duplicada"
                );
            }

            return res.status(201).json({
                mensaje: "Disponibilidad registrada",
                disponibilidad
            });

        } catch (err) {
            return error(res, 400, err.message);
        }
    }
);

// ==========================================
// ASIGNACIONES
// ==========================================

// Consultar asignaciones
router.get(
    "/asignaciones",
    requiereRol("SEEA", "VOLUNTARIO"),
    (req, res) => {
        const asignaciones = datos.asignaciones.filter(
            a => req.usuario.rol === "SEEA" ||
                a.voluntario === req.usuario
        );

        return res.json(
            asignaciones.map(asignacionDTO)
        );
    }
);

// Inscribir voluntario
router.post(
    "/asignaciones",
    requiereRol("SEEA", "VOLUNTARIO"),
    (req, res) => {
        const visita = buscarPorId(
            datos.visitas,
            req.body?.idVisita
        );

        const voluntario =
            req.usuario.rol === "VOLUNTARIO"
                ? req.usuario
                : buscarPorId(
                    datos.usuarios,
                    req.body?.idVoluntario
                );

        if (!visita || !voluntario ||
            voluntario.rol !== "VOLUNTARIO") {

            return error(
                res,
                404,
                "Visita o voluntario no encontrado"
            );
        }

        if (!voluntario.puedeInscribirse(visita)) {
            return error(
                res,
                409,
                "Voluntario no disponible o ya inscrito"
            );
        }

        const horario = visita.solicitud.horario;

        const conflicto = datos.asignaciones.some(a =>
            a.voluntario === voluntario &&
            a.estaActiva() &&
            a.visita.estado === "PROGRAMADA" &&
            a.visita.solicitud.horario.seTraslapaCon(horario)
        );

        if (conflicto) {
            return error(
                res,
                409,
                "Conflicto con otra visita"
            );
        }

        const asignacion = new AsignacionVoluntario(
            datos.generarId("asignacion"),
            voluntario,
            visita,
            new Date().toISOString()
        );

        if (!visita.agregarAsignacion(asignacion)) {
            return error(
                res,
                409,
                "No se pudo crear la asignacion"
            );
        }

        datos.asignaciones.push(asignacion);

        return res.status(201).json({
            mensaje: "Asignacion confirmada",
            asignacion: asignacionDTO(asignacion)
        });
    }
);

// Cancelar asignacion
router.patch(
    "/asignaciones/:id/cancelar",
    requiereRol("SEEA", "VOLUNTARIO"),
    (req, res) => {
        const asignacion = buscarPorId(
            datos.asignaciones,
            req.params.id
        );

        if (!asignacion) {
            return error(
                res,
                404,
                "Asignacion no encontrada"
            );
        }

        if (req.usuario.rol === "VOLUNTARIO" &&
            asignacion.voluntario !== req.usuario) {

            return error(res, 403, "Asignacion ajena");
        }

        if (asignacion.visita.estado !== "PROGRAMADA" ||
            !asignacion.cancelar()) {

            return error(
                res,
                409,
                "No se puede cancelar"
            );
        }

        return res.json({
            mensaje: "Asignacion cancelada",
            asignacion: asignacionDTO(asignacion)
        });
    }
);


};
