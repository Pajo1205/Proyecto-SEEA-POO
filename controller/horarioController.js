const Horario = require("../Modelo/Horario");
const datos = require("../datos");

// CREAR HORARIO

function crearHorario(req, res) {
    try {
        const {
            fecha,
            horaInicio,
            horaFin
        } = req.body;

        if (!fecha || !horaInicio || !horaFin) {
            return res.status(400).json({
                mensaje: "Faltan datos del horario"
            });
        }

        const horario = new Horario(
            datos.generarId("horario"),
            fecha,
            horaInicio,
            horaFin
        );

        const traslapado = datos.horarios.some(
            h => h.seTraslapaCon(horario)
        );

        if (traslapado) {
            return res.status(409).json({
                mensaje: "El horario se traslapa con otro existente"
            });
        }

        datos.horarios.push(horario);

        return res.status(201).json({
            mensaje: "Horario creado correctamente",
            horario
        });

    } catch (error) {
        return res.status(400).json({
            mensaje: error.message
        });
    }
}

// OBTENER HORARIOS

function obtenerHorarios(req, res) {
    return res.status(200).json(datos.horarios);
}

// OBTENER DISPONIBLES

function obtenerDisponibles(req, res) {
    const disponibles = datos.horarios.filter(
        h => h.estaDisponible()
    );

    return res.status(200).json(disponibles);
}

// BUSCAR HORARIO

function buscarHorario(req, res) {
    const id = Number(req.params.id);

    const horario = datos.horarios.find(
        h => h.getId() === id
    );

    if (!horario) {
        return res.status(404).json({
            mensaje: "Horario no encontrado"
        });
    }

    return res.status(200).json(horario);
}

// ELIMINAR HORARIO

function eliminarHorario(req, res) {
    const id = Number(req.params.id);

    const posicion = datos.horarios.findIndex(
        h => h.getId() === id
    );

    if (posicion === -1) {
        return res.status(404).json({
            mensaje: "Horario no encontrado"
        });
    }

    const horario = datos.horarios[posicion];

    if (!horario.estaDisponible()) {
        return res.status(409).json({
            mensaje: "No se puede eliminar un horario ocupado"
        });
    }

    const tieneSolicitudes = datos.solicitudes.some(
        s => s.getHorario().getId() === id
    );

    if (tieneSolicitudes) {
        return res.status(409).json({
            mensaje: "No se puede eliminar un horario asociado a solicitudes"
        });
    }

    datos.horarios.splice(posicion, 1);

    return res.status(200).json({
        mensaje: "Horario eliminado correctamente"
    });
}

module.exports = {
    crearHorario,
    obtenerHorarios,
    obtenerDisponibles,
    buscarHorario,
    eliminarHorario
};