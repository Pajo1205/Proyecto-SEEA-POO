
const Visita = require("../Modelo/Visita");
const Actividad = require("../Modelo/Actividad");

const datos = require("../datos");

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// Buscar visita por ID
function buscarVisitaPorId(id) {

    return datos.visitas.find(
        visita => visita.getId() === Number(id)
    );
}

// Buscar solicitud por ID
function buscarSolicitudPorId(id) {

    return datos.solicitudes.find(
        solicitud => solicitud.getId() === Number(id)
    );
}

// Buscar actividad por ID
function buscarActividadPorId(id) {

    return datos.actividades.find(
        actividad => actividad.getId() === Number(id)
    );
}

// Responder con error
function responderError(res, codigo, mensaje) {

    return res.status(codigo).json({
        mensaje
    });
}

// ==========================================
// CONVERTIR ACTIVIDAD A JSON
// ==========================================

function actividadDTO(actividad) {

    return {
        id: actividad.getId(),
        nombre: actividad.getNombre(),
        tipo: actividad.getTipo(),
        descripcion: actividad.getDescripcion(),
        duracionMinutos: actividad.getDuracionMinutos(),
        capacidadMaxima: actividad.getCapacidadMaxima()
    };
}

// ==========================================
// CONVERTIR VISITA A JSON
// ==========================================

function visitaDTO(visita) {

    const solicitud = visita.getSolicitud();

    const horario = solicitud.getHorario();

    return {
        id: visita.getId(),

        idSolicitud: solicitud.getId(),

        colegio: solicitud.getColegio().getNombre(),

        horario: {
            id: horario.getId(),
            fecha: horario.getFecha(),
            horaInicio: horario.getHoraInicio(),
            horaFin: horario.getHoraFin()
        },

        estado: visita.getEstado(),

        observaciones: visita.getObservaciones(),

        actividades: visita.getActividades().map(
            actividadDTO
        ),

        asignaciones: visita.getAsignaciones().map(
            asignacion => ({
                id: asignacion.getId(),

                idVoluntario:
                    asignacion.getVoluntario().getId(),

                nombreVoluntario:
                    asignacion.getVoluntario().getNombre(),

                estado: asignacion.getEstado()
            })
        ),

        voluntariosNecesarios:
            visita.calcularVoluntariosNecesarios(),

        voluntariosConfirmados:
            visita.contarVoluntariosConfirmados()
    };
}

// ==========================================
// CREAR VISITA
// ==========================================

function crearVisita(req, res) {

    try {

        const { idSolicitud } = req.body || {};

        const solicitud = buscarSolicitudPorId(
            idSolicitud
        );

        if (!solicitud) {
            return responderError(
                res,
                404,
                "Solicitud no encontrada"
            );
        }

        // Verificar que esté aprobada
        if (!solicitud.estaAprobada()) {
            return responderError(
                res,
                409,
                "La solicitud no esta aprobada"
            );
        }

        // Evitar visitas duplicadas
        const existe = datos.visitas.some(
            visita =>
                visita.getSolicitud().getId() ===
                solicitud.getId()
        );

        if (existe) {
            return responderError(
                res,
                409,
                "La solicitud ya tiene una visita"
            );
        }

        // Crear visita
        const visita = new Visita(
            datos.generarId("visita"),
            solicitud
        );

        datos.visitas.push(visita);

        return res.status(201).json({
            mensaje: "Visita creada correctamente",
            visita: visitaDTO(visita)
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
// CONSULTAR VISITAS
// ==========================================

function obtenerVisitas(req, res) {

    const visitas = datos.visitas.map(
        visitaDTO
    );

    return res.status(200).json(visitas);
}

// ==========================================
// BUSCAR VISITA
// ==========================================

function buscarVisita(req, res) {

    const visita = buscarVisitaPorId(
        req.params.id
    );

    if (!visita) {
        return responderError(
            res,
            404,
            "Visita no encontrada"
        );
    }

    return res.status(200).json(
        visitaDTO(visita)
    );
}

// ==========================================
// CREAR ACTIVIDAD
// ==========================================

function crearActividad(req, res) {

    try {

        const {
            nombre,
            tipo,
            descripcion = "",
            duracionMinutos,
            capacidadMaxima
        } = req.body || {};

        // Validaciones realizadas por Actividad.js
        const actividad = new Actividad(
            datos.generarId("actividad"),
            nombre,
            tipo,
            descripcion,
            duracionMinutos,
            capacidadMaxima
        );

        datos.actividades.push(actividad);

        return res.status(201).json({
            mensaje: "Actividad registrada correctamente",
            actividad: actividadDTO(actividad)
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
// CONSULTAR ACTIVIDADES
// ==========================================

function obtenerActividades(req, res) {

    return res.status(200).json(
        datos.actividades.map(actividadDTO)
    );
}

// ==========================================
// AGREGAR ACTIVIDAD A VISITA
// ==========================================

function agregarActividad(req, res) {

    const visita = buscarVisitaPorId(
        req.params.id
    );

    const actividad = buscarActividadPorId(
        req.body?.idActividad
    );

    if (!visita || !actividad) {
        return responderError(
            res,
            404,
            "Visita o actividad no encontrada"
        );
    }

    // Verificar que esté programada
    if (visita.getEstado() !== "PROGRAMADA") {
        return responderError(
            res,
            409,
            "La visita no admite modificaciones"
        );
    }

    // Verificar que la actividad fue solicitada
    const solicitud = visita.getSolicitud();

    const tipo = actividad.getTipo();

    const permitida =
        (tipo === "TOUR" && solicitud.getSolicitaTour()) ||
        (tipo === "CHARLA" && solicitud.getSolicitaCharla()) ||
        (tipo === "TALLER" && solicitud.getSolicitaTaller());

    if (!permitida) {
        return responderError(
            res,
            409,
            "La actividad no fue solicitada"
        );
    }

    // Verificar capacidad
    if (!actividad.tieneCapacidad(
        solicitud.getCantidadEstudiantes()
    )) {
        return responderError(
            res,
            409,
            "La actividad no tiene capacidad suficiente"
        );
    }

    // Agregar actividad
    if (!visita.agregarActividad(actividad)) {
        return responderError(
            res,
            409,
            "La actividad ya esta asignada o no se puede agregar"
        );
    }

    return res.status(200).json({
        mensaje: "Actividad agregada correctamente",
        visita: visitaDTO(visita)
    });
}

// ==========================================
// INICIAR VISITA
// ==========================================

function iniciarVisita(req, res) {

    const visita = buscarVisitaPorId(
        req.params.id
    );

    if (!visita) {
        return responderError(
            res,
            404,
            "Visita no encontrada"
        );
    }

    if (!visita.iniciar()) {
        return responderError(
            res,
            409,
            "No se puede iniciar la visita"
        );
    }

    return res.status(200).json({
        mensaje: "Visita iniciada correctamente",
        visita: visitaDTO(visita)
    });
}

// ==========================================
// FINALIZAR VISITA
// ==========================================

function finalizarVisita(req, res) {

    const visita = buscarVisitaPorId(
        req.params.id
    );

    if (!visita) {
        return responderError(
            res,
            404,
            "Visita no encontrada"
        );
    }

    if (!visita.finalizar()) {
        return responderError(
            res,
            409,
            "No se puede finalizar la visita"
        );
    }

    return res.status(200).json({
        mensaje: "Visita finalizada correctamente",
        visita: visitaDTO(visita)
    });
}

// ==========================================
// EXPORTAR CONTROLADOR
// ==========================================

module.exports = {
    crearVisita,
    obtenerVisitas,
    buscarVisita,
    crearActividad,
    obtenerActividades,
    agregarActividad,
    iniciarVisita,
    finalizarVisita
};
