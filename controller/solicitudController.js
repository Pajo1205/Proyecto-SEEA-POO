const Solicitud = require("../Modelo/Solicitud");
const datos = require("../datos");

// CREAR SOLICITUD

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
            c => c.getId() === Number(idColegio)
        );

        const horario = datos.horarios.find(
            h => h.getId() === Number(idHorario)
        );

        if (!colegio || !horario) {
            return res.status(404).json({
                mensaje: "Colegio u horario no encontrado"
            });
        }

        if (!horario.estaDisponible()) {
            return res.status(409).json({
                mensaje: "El horario no esta disponible"
            });
        }

        const solicitud = new Solicitud(
            datos.generarId("solicitud"),
            colegio,
            horario,
            cantidadEstudiantes,
            cantidadProfesores,
            grado,
            transporte,
            solicitaTour,
            solicitaCharla,
            solicitaTaller,
            observaciones || ""
        );

        datos.solicitudes.push(solicitud);

        return res.status(201).json({
            mensaje: "Solicitud creada correctamente",
            solicitud
        });

    } catch (error) {
        return res.status(400).json({
            mensaje: error.message
        });
    }
}

// CONSULTAR SOLICITUDES

function obtenerSolicitudes(req, res) {
    return res.status(200).json(datos.solicitudes);
}

// BUSCAR SOLICITUD

function buscarSolicitud(req, res) {
    const id = Number(req.params.id);

    const solicitud = datos.solicitudes.find(
        s => s.getId() === id
    );

    if (!solicitud) {
        return res.status(404).json({
            mensaje: "Solicitud no encontrada"
        });
    }

    return res.status(200).json(solicitud);
}

// APROBAR SOLICITUD

function aprobarSolicitud(req, res) {
    const id = Number(req.params.id);

    const solicitud = datos.solicitudes.find(
        s => s.getId() === id
    );

    if (!solicitud) {
        return res.status(404).json({
            mensaje: "Solicitud no encontrada"
        });
    }

    const horariosOcupados = datos.solicitudes
        .filter(s => s.estaAprobada())
        .map(s => s.getHorario());

    if (!solicitud.aprobar(horariosOcupados)) {
        return res.status(409).json({
            mensaje: "No se pudo aprobar la solicitud"
        });
    }

    return res.status(200).json({
        mensaje: "Solicitud aprobada correctamente",
        solicitud
    });
}

// RECHAZAR SOLICITUD

function rechazarSolicitud(req, res) {
    const id = Number(req.params.id);

    const solicitud = datos.solicitudes.find(
        s => s.getId() === id
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

// CANCELAR SOLICITUD

function cancelarSolicitud(req, res) {
    const id = Number(req.params.id);

    const solicitud = datos.solicitudes.find(
        s => s.getId() === id
    );

    if (!solicitud) {
        return res.status(404).json({
            mensaje: "Solicitud no encontrada"
        });
    }

    const visita = datos.visitas.find(
        v => v.getSolicitud().getId() === id
    );

    if (visita && (
        visita.getEstado() === "EN_CURSO" ||
        visita.getEstado() === "FINALIZADA"
    )) {
        return res.status(409).json({
            mensaje: "No se puede cancelar una visita iniciada o finalizada"
        });
    }

    if (!solicitud.cancelar()) {
        return res.status(409).json({
            mensaje: "No se puede cancelar esta solicitud"
        });
    }

    if (visita && visita.getEstado() === "PROGRAMADA") {
        visita.cancelar();
    }

    return res.status(200).json({
        mensaje: "Solicitud cancelada correctamente",
        solicitud
    });
}

// ELIMINAR SOLICITUD

function eliminarSolicitud(req, res) {
    const id = Number(req.params.id);

    const posicion = datos.solicitudes.findIndex(
        s => s.getId() === id
    );

    if (posicion === -1) {
        return res.status(404).json({
            mensaje: "Solicitud no encontrada"
        });
    }

    const solicitud = datos.solicitudes[posicion];

    const tieneVisita = datos.visitas.some(
        v => v.getSolicitud().getId() === id
    );

    if (tieneVisita) {
        return res.status(409).json({
            mensaje: "No se puede eliminar una solicitud con visita asociada"
        });
    }

    if (solicitud.estaAprobada()) {
        return res.status(409).json({
            mensaje: "Primero debe cancelar la solicitud aprobada"
        });
    }

    datos.solicitudes.splice(posicion, 1);

    return res.status(200).json({
        mensaje: "Solicitud eliminada correctamente"
    });
}

module.exports = {
    crearSolicitud,
    obtenerSolicitudes,
    buscarSolicitud,
    aprobarSolicitud,
    rechazarSolicitud,
    cancelarSolicitud,
    eliminarSolicitud
};