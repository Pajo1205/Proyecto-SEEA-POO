"use strict";

// Rutas de visitas. Reciben dependencias compartidas del router principal.
module.exports = function registrarVisitas(ctx) {
    const { router, datos, bcrypt, Colegio, Horario, Solicitud, Visita, Actividad, UsuarioColegio, EncargadoSEEA, Voluntario, DisponibilidadVoluntario, AsignacionVoluntario, error, buscarPorId, textoValido, correoValido, usuarioPublico, colegioDTO, horarioDTO, solicitudDTO, actividadDTO, asignacionDTO, visitaDTO, requiereSesion, requiereRol } = ctx;

// ==========================================
// VISITAS
// ==========================================

// Consultar visitas
router.get("/visitas", (req, res) => {
    const visitas = datos.visitas.filter(visita => {

        if (req.usuario.rol === "SEEA") {
            return true;
        }

        if (req.usuario.rol === "COLEGIO") {
            return visita.solicitud.colegio ===
                req.usuario.colegio;
        }

        return visita.estado === "PROGRAMADA" ||
            visita.asignaciones.some(
                a => a.voluntario === req.usuario
            );
    });

    return res.json(visitas.map(visitaDTO));
});

// Crear visita
router.post(
    "/visitas",
    requiereRol("SEEA"),
    (req, res) => {
        const solicitud = buscarPorId(
            datos.solicitudes,
            req.body?.idSolicitud
        );

        if (!solicitud) {
            return error(res, 404, "Solicitud no encontrada");
        }

        const duplicada = datos.visitas.some(
            v => v.solicitud === solicitud
        );

        if (!solicitud.estaAprobada() || duplicada) {
            return error(
                res,
                409,
                "Solicitud no aprobada o visita duplicada"
            );
        }

        const visita = new Visita(
            datos.generarId("visita"),
            solicitud
        );

        datos.visitas.push(visita);

        return res.status(201).json({
            mensaje: "Visita programada",
            visita: visitaDTO(visita)
        });
    }
);

// Iniciar visita
router.patch(
    "/visitas/:id/iniciar",
    requiereRol("SEEA"),
    (req, res) => {
        const visita = buscarPorId(
            datos.visitas,
            req.params.id
        );

        if (!visita) {
            return error(res, 404, "Visita no encontrada");
        }

        if (!visita.iniciar()) {
            return error(res, 409, "Estado incompatible");
        }

        return res.json({
            mensaje: "Visita iniciada",
            visita: visitaDTO(visita)
        });
    }
);

// Finalizar visita
router.patch(
    "/visitas/:id/finalizar",
    requiereRol("SEEA"),
    (req, res) => {
        const visita = buscarPorId(
            datos.visitas,
            req.params.id
        );

        if (!visita) {
            return error(res, 404, "Visita no encontrada");
        }

        if (!visita.finalizar()) {
            return error(res, 409, "Estado incompatible");
        }

        return res.json({
            mensaje: "Visita finalizada",
            visita: visitaDTO(visita)
        });
    }
);


};
