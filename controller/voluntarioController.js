
const DisponibilidadVoluntario =
    require("../Modelo/DisponibilidadVoluntario");

const AsignacionVoluntario =
    require("../Modelo/AsignacionVoluntario");

const datos = require("../datos");

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// Buscar voluntario por ID
function buscarVoluntario(id) {

    return datos.usuarios.find(
        usuario =>
            usuario.getId() === Number(id) &&
            usuario.rol === "VOLUNTARIO"
    );
}

// Buscar visita por ID
function buscarVisita(id) {

    return datos.visitas.find(
        visita => visita.getId() === Number(id)
    );
}

// Buscar asignacion por ID
function buscarAsignacion(id) {

    return datos.asignaciones.find(
        asignacion =>
            asignacion.getId() === Number(id)
    );
}

// Responder con error
function responderError(res, codigo, mensaje) {

    return res.status(codigo).json({
        mensaje
    });
}

// Verificar permisos
function tienePermiso(req, idVoluntario) {

    if (!req.usuario) {
        return false;
    }

    if (req.usuario.rol === "SEEA") {
        return true;
    }

    return (
        req.usuario.rol === "VOLUNTARIO" &&
        req.usuario.getId() === Number(idVoluntario)
    );
}

// ==========================================
// REGISTRAR DISPONIBILIDAD
// ==========================================

function registrarDisponibilidad(req, res) {

    try {

        const voluntario = buscarVoluntario(
            req.params.id
        );

        if (!voluntario) {
            return responderError(
                res,
                404,
                "Voluntario no encontrado"
            );
        }

        // Verificar permisos
        if (!tienePermiso(req, voluntario.getId())) {
            return responderError(
                res,
                403,
                "No tienes permiso para modificar esta disponibilidad"
            );
        }

        const {
            fecha,
            horaInicio,
            horaFin
        } = req.body || {};

        // Crear disponibilidad
        const disponibilidad =
            new DisponibilidadVoluntario(
                datos.generarId("disponibilidad"),
                fecha,
                horaInicio,
                horaFin
            );

        // Registrar disponibilidad
        if (!voluntario.agregarDisponibilidad(
            disponibilidad
        )) {

            return responderError(
                res,
                409,
                "Disponibilidad duplicada"
            );
        }

        return res.status(201).json({
            mensaje: "Disponibilidad registrada correctamente",
            disponibilidad
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
// CONSULTAR DISPONIBILIDADES
// ==========================================

function obtenerDisponibilidades(req, res) {

    const voluntario = buscarVoluntario(
        req.params.id
    );

    if (!voluntario) {
        return responderError(
            res,
            404,
            "Voluntario no encontrado"
        );
    }

    if (!tienePermiso(req, voluntario.getId())) {
        return responderError(
            res,
            403,
            "No tienes permiso para consultar esta disponibilidad"
        );
    }

    return res.status(200).json(
        voluntario.getDisponibilidades()
    );
}

// ==========================================
// INSCRIBIR VOLUNTARIO A VISITA
// ==========================================

function inscribirVoluntario(req, res) {

    try {

        const {
            idVoluntario,
            idVisita
        } = req.body || {};

        // Identificar voluntario
        const voluntario = req.usuario?.rol === "VOLUNTARIO"
            ? req.usuario
            : buscarVoluntario(idVoluntario);

        const visita = buscarVisita(idVisita);

        if (!voluntario || !visita) {
            return responderError(
                res,
                404,
                "Voluntario o visita no encontrada"
            );
        }

        // Verificar permisos
        if (!tienePermiso(req, voluntario.getId())) {
            return responderError(
                res,
                403,
                "No tienes permiso para realizar esta inscripcion"
            );
        }

        // Verificar disponibilidad
        if (!voluntario.puedeInscribirse(visita)) {
            return responderError(
                res,
                409,
                "El voluntario no esta disponible o ya esta inscrito"
            );
        }

        // Obtener horario de la visita
        const horarioNuevo = visita
            .getSolicitud()
            .getHorario();

        // Comprobar conflictos con otras visitas
        const conflicto = datos.asignaciones.some(
            asignacion => {

                if (!asignacion.estaActiva()) {
                    return false;
                }

                if (
                    asignacion.getVoluntario().getId() !==
                    voluntario.getId()
                ) {
                    return false;
                }

                const otraVisita =
                    asignacion.getVisita();

                if (
                    otraVisita.getEstado() === "CANCELADA" ||
                    otraVisita.getEstado() === "FINALIZADA"
                ) {
                    return false;
                }

                return otraVisita
                    .getSolicitud()
                    .getHorario()
                    .seTraslapaCon(horarioNuevo);
            }
        );

        if (conflicto) {
            return responderError(
                res,
                409,
                "El voluntario tiene otra visita en ese horario"
            );
        }

        // Crear asignacion
        const asignacion = new AsignacionVoluntario(
            datos.generarId("asignacion"),
            voluntario,
            visita,
            new Date().toISOString()
        );

        // Agregar a la visita
        if (!visita.agregarAsignacion(asignacion)) {
            return responderError(
                res,
                409,
                "No se pudo crear la asignacion"
            );
        }

        // Guardar asignacion
        datos.asignaciones.push(asignacion);

        return res.status(201).json({
            mensaje: "Voluntario inscrito correctamente",
            asignacion: {
                id: asignacion.getId(),
                idVoluntario: voluntario.getId(),
                idVisita: visita.getId(),
                fechaAsignacion:
                    asignacion.getFechaAsignacion(),
                estado: asignacion.getEstado()
            }
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
// CANCELAR ASIGNACION
// ==========================================

function cancelarAsignacion(req, res) {

    const asignacion = buscarAsignacion(
        req.params.id
    );

    if (!asignacion) {
        return responderError(
            res,
            404,
            "Asignacion no encontrada"
        );
    }

    const voluntario = asignacion.getVoluntario();

    // Verificar permisos
    if (!tienePermiso(req, voluntario.getId())) {
        return responderError(
            res,
            403,
            "No tienes permiso para cancelar esta asignacion"
        );
    }

    if (!asignacion.cancelar()) {
        return responderError(
            res,
            409,
            "No se puede cancelar esta asignacion"
        );
    }

    return res.status(200).json({
        mensaje: "Asignacion cancelada",
        idAsignacion: asignacion.getId(),
        estado: asignacion.getEstado()
    });
}

// ==========================================
// CONSULTAR ASIGNACIONES
// ==========================================

function obtenerAsignaciones(req, res) {

    if (!req.usuario) {
        return responderError(
            res,
            401,
            "Debes iniciar sesion"
        );
    }

    // El encargado puede consultar todas
    // El voluntario solo las suyas
    const asignaciones = datos.asignaciones.filter(
        asignacion =>
            req.usuario.rol === "SEEA" ||
            asignacion.getVoluntario().getId() ===
                req.usuario.getId()
    );

    const resultado = asignaciones.map(
        asignacion => ({
            id: asignacion.getId(),

            idVoluntario:
                asignacion.getVoluntario().getId(),

            nombreVoluntario:
                asignacion.getVoluntario().getNombre(),

            idVisita:
                asignacion.getVisita().getId(),

            fechaAsignacion:
                asignacion.getFechaAsignacion(),

            estado:
                asignacion.getEstado()
        })
    );

    return res.status(200).json(resultado);
}

// ==========================================
// EXPORTAR CONTROLADOR
// ==========================================

module.exports = {
    registrarDisponibilidad,
    obtenerDisponibilidades,
    inscribirVoluntario,
    cancelarAsignacion,
    obtenerAsignaciones
};
