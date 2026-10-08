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

        const id = datos.horarios.length + 1;

        const nuevoHorario = new Horario(
            id,
            fecha,
            horaInicio,
            horaFin
        );

        // Evitar horarios traslapados
        const existeConflicto = datos.horarios.some(
            horario =>
                horario.seTraslapaCon(nuevoHorario)
        );

        if (existeConflicto) {
            return res.status(409).json({
                mensaje: "El horario se traslapa con uno existente"
            });
        }

        datos.horarios.push(nuevoHorario);

        return res.status(201).json({
            mensaje: "Horario creado correctamente",
            horario: nuevoHorario
        });

    } catch (error) {

        return res.status(400).json({
            mensaje: error.message
        });
    }
}


// CONSULTAR HORARIOS


function obtenerHorarios(req, res) {

    return res.status(200).json(
        datos.horarios
    );
}



// HORARIOS DISPONIBLES


function obtenerDisponibles(req, res) {

    const disponibles = datos.horarios.filter(
        horario => horario.estaDisponible()
    );

    return res.status(200).json(disponibles);
}



// BUSCAR HORARIO


function buscarHorario(req, res) {

    const id = Number(req.params.id);

    const horario = datos.horarios.find(
        horario => horario.getId() === id
    );

    if (!horario) {
        return res.status(404).json({
            mensaje: "Horario no encontrado"
        });
    }

    return res.status(200).json(horario);
}


module.exports = {
    crearHorario,
    obtenerHorarios,
    obtenerDisponibles,
    buscarHorario
};