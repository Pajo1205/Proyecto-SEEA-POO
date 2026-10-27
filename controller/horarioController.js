
// ==========================================
// IMPORTACIONES
// ==========================================

const Horario = require("../Modelo/Horario");
const datos = require("../datos");

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// Buscar horario por ID
function buscarHorarioPorId(id) {

    return datos.horarios.find(
        horario => horario.getId() === Number(id)
    );
}

// Verificar si el usuario es encargado SEEA
function esEncargado(req) {

    return req.usuario?.rol === "SEEA";
}

// Responder con error
function responderError(res, codigo, mensaje) {

    return res.status(codigo).json({
        mensaje
    });
}

// Convertir horario a JSON
function horarioDTO(horario) {

    return {
        id: horario.getId(),
        fecha: horario.getFecha(),
        horaInicio: horario.getHoraInicio(),
        horaFin: horario.getHoraFin(),
        disponible: horario.estaDisponible()
    };
}

// ==========================================
// CREAR HORARIO
// ==========================================

function crearHorario(req, res) {

    try {

        // Verificar permisos
        if (!esEncargado(req)) {
            return responderError(
                res,
                403,
                "Solo el encargado SEEA puede crear horarios"
            );
        }

        const {
            fecha,
            horaInicio,
            horaFin
        } = req.body || {};

        // Validar campos obligatorios
        if (!fecha || !horaInicio || !horaFin) {
            return responderError(
                res,
                400,
                "Faltan datos del horario"
            );
        }

        // Crear horario
        const horario = new Horario(
            datos.generarId("horario"),
            fecha,
            horaInicio,
            horaFin
        );

        // Comprobar traslapes
        const traslapado = datos.horarios.some(
            existente =>
                existente.seTraslapaCon(horario)
        );

        if (traslapado) {
            return responderError(
                res,
                409,
                "El horario se traslapa con otro existente"
            );
        }

        // Guardar horario
        datos.horarios.push(horario);

        return res.status(201).json({
            mensaje: "Horario creado correctamente",
            horario: horarioDTO(horario)
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
// CONSULTAR TODOS LOS HORARIOS
// ==========================================

function obtenerHorarios(req, res) {

    return res.status(200).json(
        datos.horarios.map(horarioDTO)
    );
}

// ==========================================
// CONSULTAR HORARIOS DISPONIBLES
// ==========================================

function obtenerDisponibles(req, res) {

    const disponibles = datos.horarios.filter(
        horario => horario.estaDisponible()
    );

    return res.status(200).json(
        disponibles.map(horarioDTO)
    );
}

// ==========================================
// BUSCAR HORARIO POR ID
// ==========================================

function buscarHorario(req, res) {

    const horario = buscarHorarioPorId(
        req.params.id
    );

    if (!horario) {
        return responderError(
            res,
            404,
            "Horario no encontrado"
        );
    }

    return res.status(200).json(
        horarioDTO(horario)
    );
}

// ==========================================
// ELIMINAR HORARIO
// ==========================================

function eliminarHorario(req, res) {

    // Verificar permisos
    if (!esEncargado(req)) {
        return responderError(
            res,
            403,
            "Solo el encargado SEEA puede eliminar horarios"
        );
    }

    const horario = buscarHorarioPorId(
        req.params.id
    );

    if (!horario) {
        return responderError(
            res,
            404,
            "Horario no encontrado"
        );
    }

    // No eliminar horarios reservados
    if (!horario.estaDisponible()) {
        return responderError(
            res,
            409,
            "No se puede eliminar un horario ocupado"
        );
    }

    // Verificar solicitudes asociadas
    const tieneSolicitudes = datos.solicitudes.some(
        solicitud =>
            solicitud.getHorario() === horario
    );

    if (tieneSolicitudes) {
        return responderError(
            res,
            409,
            "No se puede eliminar un horario asociado a solicitudes"
        );
    }

    // Eliminar horario
    const posicion = datos.horarios.indexOf(
        horario
    );

    datos.horarios.splice(posicion, 1);

    return res.status(200).json({
        mensaje: "Horario eliminado correctamente"
    });
}

// ==========================================
// EXPORTACIONES
// ==========================================

module.exports = {
    crearHorario,
    obtenerHorarios,
    obtenerDisponibles,
    buscarHorario,
    eliminarHorario,
    horarioDTO
};
