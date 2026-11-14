"use strict";

// Rutas de horarios. Reciben dependencias compartidas del router principal.
module.exports = function registrarHorarios(ctx) {
    const { router, datos, bcrypt, Colegio, Horario, Solicitud, Visita, Actividad, UsuarioColegio, EncargadoSEEA, Voluntario, DisponibilidadVoluntario, AsignacionVoluntario, error, buscarPorId, textoValido, correoValido, usuarioPublico, colegioDTO, horarioDTO, solicitudDTO, actividadDTO, asignacionDTO, visitaDTO, requiereSesion, requiereRol } = ctx;

// ==========================================
// HORARIOS
// ==========================================

// Consultar horarios
router.get("/horarios", (req, res) => {
    return res.json(
        datos.horarios.map(horarioDTO)
    );
});

// Consultar horarios disponibles
router.get("/horarios/disponibles", (req, res) => {
    return res.json(
        datos.horarios
            .filter(h => h.estaDisponible())
            .map(horarioDTO)
    );
});

// Crear horario
router.post(
    "/horarios",
    requiereRol("SEEA"),
    (req, res) => {
        try {
            const {
                fecha,
                horaInicio,
                horaFin
            } = req.body || {};

            const horario = new Horario(
                datos.generarId("horario"),
                fecha,
                horaInicio,
                horaFin
            );

            const conflicto = datos.horarios.some(
                h => h.seTraslapaCon(horario)
            );

            if (conflicto) {
                return error(
                    res,
                    409,
                    "El horario se traslapa con otro"
                );
            }

            datos.horarios.push(horario);

            return res.status(201).json({
                mensaje: "Horario creado",
                horario: horarioDTO(horario)
            });

        } catch (err) {
            return error(res, 400, err.message);
        }
    }
);

// Eliminar horario
router.delete(
    "/horarios/:id",
    requiereRol("SEEA"),
    (req, res) => {
        const horario = buscarPorId(
            datos.horarios,
            req.params.id
        );

        if (!horario) {
            return error(res, 404, "Horario no encontrado");
        }

        const tieneSolicitudes = datos.solicitudes.some(
            s => s.horario === horario
        );

        if (!horario.estaDisponible() || tieneSolicitudes) {
            return error(
                res,
                409,
                "Horario ocupado o asociado a solicitudes"
            );
        }

        datos.horarios.splice(
            datos.horarios.indexOf(horario),
            1
        );

        return res.json({
            mensaje: "Horario eliminado"
        });
    }
);


};
