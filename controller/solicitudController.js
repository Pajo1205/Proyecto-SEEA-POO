const Solicitud = require("../Modelo/Solicitud");
const datos = require("../datos");

// =========================
// CREAR SOLICITUD
// =========================

function crearSolicitud(req, res) {

    try {

        const {
            idColegio,
            idHorario,
            cantidadEstudiantes,
            cantidadProfesores,
            grado,
            transporte,
            solicitaTour,
            solicitaCharla,
            solicitaTaller,
            observaciones
        } = req.body;

        const colegio = datos.colegios.find(
            colegio => colegio.getId() === Number(idColegio)
        );

        const horario = datos.horarios.find(
            horario => horario.getId() === Number(idHorario)
        );

        if (!colegio || !horario) {
            return res.status(404).json({
                mensaje: "Colegio u horario no encontrado"
            });
        }

        if (!horario.estaDisponible()) {
            return res.status(409).json({
                mensaje: "El horario no está disponible"
            });
        }

        const id = datos.solicitudes.length + 1;

        const nuevaSolicitud = new Solicitud(
            id,
            colegio,
            horario,
            cantidadEstudiantes,
            cantidadProfesores,
            grado,
            transporte,
            solicitaTour,
            solicitaCharla,
            solicitaTaller,
            observaciones
        );

        datos.solicitudes.push(nuevaSolicitud);

        return res.status(201).json({
            mensaje: "Solicitud creada correctamente",
            solicitud: nuevaSolicitud
        });

    } catch (error) {

        return res.status(400).json({
            mensaje: error.message
        });
    }
}


// =========================
// CONSULTAR SOLICITUDES
// =========================

function obtenerSolicitudes(req, res) {

    return res.status(200).json(
        datos.solicitudes
    );
}


// =========================
// APROBAR SOLICITUD
// =========================

function aprobarSolicitud(req, res) {

    const id = Number(req.params.id);

    const solicitud = datos.solicitudes.find(
        solicitud => solicitud.getId() === id
    );

    if (!solicitud) {
        return res.status(404).json({
            mensaje: "Solicitud no encontrada"
        });
    }

    const horariosOcupados = datos.solicitudes
        .filter(s => s.estaAprobada())
        .map(s => s.getHorario());

    const aprobada = solicitud.aprobar(horariosOcupados);

    if (!aprobada) {
        return res.status(409).json({
            mensaje: "No se pudo aprobar la solicitud"
        });
    }

    return res.status(200).json({
        mensaje: "Solicitud aprobada correctamente",
        solicitud
    });
}


// =========================
// RECHAZAR SOLICITUD
// =========================

function rechazarSolicitud(req, res) {

    const id = Number(req.params.id);

    const solicitud = datos.solicitudes.find(
        solicitud => solicitud.getId() === id
    );

    if (!solicitud) {
        return res.status(404).json({
            mensaje: "Solicitud no encontrada"
        });
    }

    if (!solicitud.rechazar()) {
        return res.status(409).json({
            mensaje: "No se puede rechazar esta solicitud"
        });
    }

    return res.status(200).json({
        mensaje: "Solicitud rechazada",
        solicitud
    });
}


// =========================
// CANCELAR SOLICITUD
// =========================

function cancelarSolicitud(req, res) {

    const id = Number(req.params.id);

    const solicitud = datos.solicitudes.find(
        solicitud => solicitud.getId() === id
    );

    if (!solicitud) {
        return res.status(404).json({
            mensaje: "Solicitud no encontrada"
        });
    }

    if (!solicitud.cancelar()) {
        return res.status(409).json({
            mensaje: "No se puede cancelar esta solicitud"
        });
    }

    return res.status(200).json({
        mensaje: "Solicitud cancelada",
        solicitud
    });
}


module.exports = {
    crearSolicitud,
    obtenerSolicitudes,
    aprobarSolicitud,
    rechazarSolicitud,
    cancelarSolicitud
};