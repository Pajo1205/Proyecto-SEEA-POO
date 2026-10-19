const DisponibilidadVoluntario =
    require("../Modelo/DisponibilidadVoluntario");

const AsignacionVoluntario =
    require("../Modelo/AsignacionVoluntario");

const datos = require("../datos");

// BUSCAR VOLUNTARIO

function buscarVoluntario(id) {
    return datos.usuarios.find(
        u => u.getId() === Number(id) &&
            typeof u.getCarnet === "function" &&
            typeof u.puedeInscribirse === "function"
    );
}

// REGISTRAR DISPONIBILIDAD

function registrarDisponibilidad(req, res) {
    const voluntario = buscarVoluntario(req.params.id);

    if (!voluntario) {
        return res.status(404).json({
            mensaje: "Voluntario no encontrado"
        });
    }

    const { fecha, horaInicio, horaFin } = req.body;

    const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;
    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (
        typeof fecha !== "string" ||
        !formatoFecha.test(fecha) ||
        !formatoHora.test(horaInicio || "") ||
        !formatoHora.test(horaFin || "") ||
        horaInicio >= horaFin ||
        Number.isNaN(Date.parse(fecha))
    ) {
        return res.status(400).json({
            mensaje: "Fecha u horas inválidas"
        });
    }

    const disponibilidad = new DisponibilidadVoluntario(
        datos.generarId("disponibilidad"),
        fecha,
        horaInicio,
        horaFin
    );

    if (!voluntario.agregarDisponibilidad(disponibilidad)) {
        return res.status(409).json({
            mensaje: "No se pudo agregar disponibilidad"
        });
    }

    return res.status(201).json({
        mensaje: "Disponibilidad registrada",
        disponibilidad
    });
}

// CONSULTAR DISPONIBILIDADES

function obtenerDisponibilidades(req, res) {
    const voluntario = buscarVoluntario(req.params.id);

    if (!voluntario) {
        return res.status(404).json({
            mensaje: "Voluntario no encontrado"
        });
    }

    return res.status(200).json(
        voluntario.getDisponibilidades()
    );
}

// INSCRIBIR VOLUNTARIO A VISITA

function inscribirVoluntario(req, res) {
    const voluntario = buscarVoluntario(
        req.body.idVoluntario
    );

    const visita = datos.visitas.find(
        v => v.getId() === Number(req.body.idVisita)
    );

    if (!voluntario || !visita) {
        return res.status(404).json({
            mensaje: "Voluntario o visita no encontrada"
        });
    }

    if (!voluntario.puedeInscribirse(visita)) {
        return res.status(409).json({
            mensaje: "El voluntario no puede inscribirse"
        });
    }

    // Evitar inscripciones simultáneas en horarios cruzados
    const horarioNuevo = visita.getSolicitud().getHorario();

    const conflicto = datos.asignaciones.some(a => {
        if (!a.estaActiva()) {
            return false;
        }

        if (a.getVoluntario().getId() !== voluntario.getId()) {
            return false;
        }

        const otraVisita = a.getVisita();

        if (otraVisita.getEstado() !== "PROGRAMADA") {
            return false;
        }

        return otraVisita.getSolicitud()
            .getHorario()
            .seTraslapaCon(horarioNuevo);
    });

    if (conflicto) {
        return res.status(409).json({
            mensaje: "El voluntario ya tiene otra visita en ese horario"
        });
    }

    const asignacion = new AsignacionVoluntario(
        datos.generarId("asignacion"),
        voluntario,
        visita,
        new Date()
    );

    if (!visita.agregarAsignacion(asignacion)) {
        return res.status(409).json({
            mensaje: "No se pudo crear la asignación"
        });
    }

    datos.asignaciones.push(asignacion);

    return res.status(201).json({
        mensaje: "Voluntario inscrito correctamente",
        idAsignacion: asignacion.getId(),
        idVoluntario: voluntario.getId(),
        idVisita: visita.getId(),
        estado: asignacion.getEstado()
    });
}

// CANCELAR ASIGNACIÓN

function cancelarAsignacion(req, res) {
    const asignacion = datos.asignaciones.find(
        a => a.getId() === Number(req.params.id)
    );

    if (!asignacion) {
        return res.status(404).json({
            mensaje: "Asignación no encontrada"
        });
    }

    if (!asignacion.cancelar()) {
        return res.status(409).json({
            mensaje: "No se puede cancelar esta asignación"
        });
    }

    return res.status(200).json({
        mensaje: "Asignación cancelada",
        idAsignacion: asignacion.getId(),
        estado: asignacion.getEstado()
    });
}

// CONSULTAR ASIGNACIONES SIN REFERENCIAS CIRCULARES

function obtenerAsignaciones(req, res) {
    const asignaciones = datos.asignaciones.map(a => ({
        id: a.getId(),
        idVoluntario: a.getVoluntario().getId(),
        nombreVoluntario: a.getVoluntario().getNombre(),
        idVisita: a.getVisita().getId(),
        fechaAsignacion: a.getFechaAsignacion(),
        estado: a.getEstado()
    }));

    return res.status(200).json(asignaciones);
}

module.exports = {
    registrarDisponibilidad,
    obtenerDisponibilidades,
    inscribirVoluntario,
    cancelarAsignacion,
    obtenerAsignaciones
};