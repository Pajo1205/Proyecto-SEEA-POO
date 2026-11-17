"use strict";

const persistencia = require("../../database/persistencia");

// Rutas de actividades. Reciben dependencias compartidas del router principal.
module.exports = function registrarActividades(ctx) {
    const { router, datos, bcrypt, Colegio, Horario, Solicitud, Visita, Actividad, UsuarioColegio, EncargadoSEEA, Voluntario, DisponibilidadVoluntario, AsignacionVoluntario, error, buscarPorId, textoValido, correoValido, usuarioPublico, colegioDTO, horarioDTO, solicitudDTO, actividadDTO, asignacionDTO, visitaDTO, requiereSesion, requiereRol } = ctx;

// ==========================================
// ACTIVIDADES
// ==========================================

// Consultar actividades
router.get("/actividades", (req, res) => {
    return res.json(
        datos.actividades.map(actividadDTO)
    );
});

// Crear actividad
router.post(
    "/actividades",
    requiereRol("SEEA"),
    (req, res) => {
        try {
            const body = req.body || {};

            if (!textoValido(body.nombre)) {
                return error(res, 400, "Nombre requerido");
            }

            const actividad = new Actividad(
                datos.generarId("actividad"),
                body.nombre,
                body.tipo,
                body.descripcion || "",
                body.duracionMinutos,
                body.capacidadMaxima
            );

            datos.actividades.push(actividad);
            persistencia.guardarActividad(actividad);

            return res.status(201).json({
                mensaje: "Actividad registrada",
                actividad: actividadDTO(actividad)
            });

        } catch (err) {
            return error(res, 400, err.message);
        }
    }
);

// Agregar actividad a visita
router.post(
    "/visitas/:id/actividades",
    requiereRol("SEEA"),
    (req, res) => {
        const visita = buscarPorId(
            datos.visitas,
            req.params.id
        );

        const actividad = buscarPorId(
            datos.actividades,
            req.body?.idActividad
        );

        if (!visita || !actividad) {
            return error(
                res,
                404,
                "Visita o actividad no encontrada"
            );
        }

        const solicitud = visita.solicitud;

        const permitida =
            (actividad.tipo === "TOUR" &&
                solicitud.solicitaTour) ||

            (actividad.tipo === "CHARLA" &&
                solicitud.solicitaCharla) ||

            (actividad.tipo === "TALLER" &&
                solicitud.solicitaTaller);

        if (!permitida) {
            return error(
                res,
                409,
                "Actividad no solicitada"
            );
        }

        if (!actividad.tieneCapacidad(
            solicitud.cantidadEstudiantes
        )) {
            return error(
                res,
                409,
                "Capacidad insuficiente"
            );
        }

        if (!visita.agregarActividad(actividad)) {
            return error(
                res,
                409,
                "Actividad duplicada o visita cerrada"
            );
        }

        persistencia.agregarActividadVisita(
            visita.id,
            actividad.id
        );

        return res.json({
            mensaje: "Actividad agregada",
            visita: visitaDTO(visita)
        });
    }
);


};
