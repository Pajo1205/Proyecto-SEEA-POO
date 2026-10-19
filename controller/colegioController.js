const Colegio = require("../Modelo/Colegio");
const datos = require("../datos");

// REGISTRAR COLEGIO

function registrarColegio(req, res) {
    try {
        const {
            nombre,
            direccion,
            telefono,
            correo,
            aliado
        } = req.body;

        if (!nombre || typeof nombre !== "string") {
            return res.status(400).json({
                mensaje: "El nombre del colegio es obligatorio"
            });
        }

        if (typeof aliado !== "boolean") {
            return res.status(400).json({
                mensaje: "El campo aliado debe ser true o false"
            });
        }

        const existe = datos.colegios.some(
            colegio => colegio.getNombre().toLowerCase() ===
                nombre.trim().toLowerCase()
        );

        if (existe) {
            return res.status(409).json({
                mensaje: "El colegio ya está registrado"
            });
        }

        const colegio = new Colegio(
            datos.generarId("colegio"),
            nombre.trim(),
            direccion || "",
            telefono || "",
            correo || "",
            aliado
        );

        datos.colegios.push(colegio);

        return res.status(201).json({
            mensaje: "Colegio registrado correctamente",
            colegio
        });

    } catch (error) {
        return res.status(400).json({
            mensaje: error.message
        });
    }
}

// OBTENER TODOS LOS COLEGIOS

function obtenerColegios(req, res) {
    return res.status(200).json(datos.colegios);
}

// BUSCAR COLEGIO POR ID

function buscarColegio(req, res) {
    const id = Number(req.params.id);

    const colegio = datos.colegios.find(
        colegio => colegio.getId() === id
    );

    if (!colegio) {
        return res.status(404).json({
            mensaje: "Colegio no encontrado"
        });
    }

    return res.status(200).json(colegio);
}

// ACTUALIZAR COLEGIO

function actualizarColegio(req, res) {
    const id = Number(req.params.id);

    const colegio = datos.colegios.find(
        colegio => colegio.getId() === id
    );

    if (!colegio) {
        return res.status(404).json({
            mensaje: "Colegio no encontrado"
        });
    }

    const {
        nombre,
        direccion,
        telefono,
        correo,
        aliado
    } = req.body;

    if (nombre !== undefined) {
        if (typeof nombre !== "string" || !nombre.trim()) {
            return res.status(400).json({
                mensaje: "Nombre inválido"
            });
        }
        colegio.setNombre(nombre.trim());
    }

    if (direccion !== undefined) colegio.setDireccion(direccion);
    if (telefono !== undefined) colegio.setTelefono(telefono);
    if (correo !== undefined) colegio.setCorreo(correo);

    if (aliado !== undefined) {
        if (typeof aliado !== "boolean") {
            return res.status(400).json({
                mensaje: "Aliado debe ser true o false"
            });
        }
        colegio.setAliado(aliado);
    }

    return res.status(200).json({
        mensaje: "Colegio actualizado",
        colegio
    });
}

module.exports = {
    registrarColegio,
    obtenerColegios,
    buscarColegio,
    actualizarColegio
};