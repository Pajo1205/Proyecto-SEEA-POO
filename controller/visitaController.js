const Visita = require("../Modelo/Visita");
const Actividad = require("../Modelo/Actividad");

const datos = require("../datos");

// CREAR VISITA

function crearVisita(req, res) {
    try {
        const { idSolicitud } = req.body;

        const solicitud = datos.solicitudes.find(
            s => s.getId() === Number(idSolicitud)
        );

        if (!solicitud) {
            return res.status(404).json({
                mensaje: "Solicitud no encontrada"
            });
        }

        if (!solicitud.estaAprobada()) {
            return res.status(409).json({
                mensaje: "La solicitud no está aprobada"
            });
        }

        const existe = datos.visitas.some(
            v => v.getSolicitud().getId() === solicitud.getId()
        );

        if (existe) {
            return res.status(409).json({
                mensaje: "La solicitud ya tiene una visita"
            });
        }

        const visita = new Visita(
            datos.generarId("visita"),
            solicitud
        );

        datos.visitas.push(visita);

        return res.status(201).json({
            mensaje: "Visita creada correctamente",
            visita
        });

    } catch (error) {
        return res.status(400).json({
            mensaje: error.message
        });
    }
}

// CONSULTAR VISITAS

function obtenerVisitas(req, res) {
    return res.status(200).json(datos.visitas);
}

// BUSCAR VISITA

function buscarVisita(req, res) {
    const visita = datos.visitas.find(
        v => v.getId() === Number(req.params.id)
    );

    if (!visita) {
        return res.status(404).json({
            mensaje: "Visita no encontrada"
        });
    }

    return res.status(200).json(visita);
}

// REGISTRAR ACTIVIDAD EN EL CATÁLOGO

function crearActividad(req, res) {
    const {
        nombre,
        tipo,
        descripcion,
        duracionMinutos,
        capacidadMaxima
    } = req.body;

    if (!nombre ||
        !["TOUR", "CHARLA", "TALLER"].includes(tipo) ||
        !Number.isInteger(duracionMinutos) ||
        duracionMinutos <= 0 ||
        !Number.isInteger(capacidadMaxima) ||
        capacidadMaxima <= 0) {

        return res.status(400).json({
            mensaje: "Datos de actividad inválidos"
        });
    }

    const actividad = new Actividad(
        datos.generarId("actividad"),
        nombre,
        tipo,
        descripcion || "",
        duracionMinutos,
        capacidadMaxima
    );

    datos.actividades.push(actividad);

    return res.status(201).json({
        mensaje: "Actividad registrada",
        actividad
    });
}

// CONSULTAR ACTIVIDADES

function obtenerActividades(req, res) {
    return res.status(200).json(datos.actividades);
}

// AGREGAR ACTIVIDAD A VISITA

function agregarActividad(req, res) {
    const visita = datos.visitas.find(
        v => v.getId() === Number(req.params.id)
    );

    const actividad = datos.actividades.find(
        a => a.getId() === Number(req.body.idActividad)
    );

    if (!visita || !actividad) {
        return res.status(404).json({
            mensaje: "Visita o actividad no encontrada"
        });
    }

    if (visita.getEstado() !== "PROGRAMADA") {
        return res.status(409).json({
            mensaje: "La visita no admite modificaciones"
        });
    }

    const solicitud = visita.getSolicitud();

    const tipo = actividad.getTipo();

    const permitida =
        (tipo === "TOUR" && solicitud.getSolicitaTour()) ||
        (tipo === "CHARLA" && solicitud.getSolicitaCharla()) ||
        (tipo === "TALLER" && solicitud.getSolicitaTaller());

    if (!permitida) {
        return res.status(409).json({
            mensaje: "La actividad no fue solicitada"
        });
    }

    if (!actividad.tieneCapacidad(
        solicitud.getCantidadEstudiantes()
    )) {
        return res.status(409).json({
            mensaje: "La actividad no tiene capacidad suficiente"
        });
    }

    if (!visita.agregarActividad(actividad)) {
        return res.status(409).json({
            mensaje: "La actividad ya está asignada"
        });
    }

    return res.status(200).json({
        mensaje: "Actividad agregada",
        visita
    });
}

// INICIAR VISITA

function iniciarVisita(req, res) {
    const visita = datos.visitas.find(
        v => v.getId() === Number(req.params.id)
    );

    if (!visita) {
        return res.status(404).json({
            mensaje: "Visita no encontrada"
        });
    }

    if (!visita.iniciar()) {
        return res.status(409).json({
            mensaje: "No se puede iniciar la visita"
        });
    }

    return res.status(200).json({
        mensaje: "Visita iniciada",
        estado: visita.getEstado()
    });
}

// FINALIZAR VISITA

function finalizarVisita(req, res) {
    const visita = datos.visitas.find(
        v => v.getId() === Number(req.params.id)
    );

    if (!visita) {
        return res.status(404).json({
            mensaje: "Visita no encontrada"
        });
    }

    if (!visita.finalizar()) {
        return res.status(409).json({
            mensaje: "No se puede finalizar la visita"
        });
    }

    return res.status(200).json({
        mensaje: "Visita finalizada",
        estado: visita.getEstado()
    });
}

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