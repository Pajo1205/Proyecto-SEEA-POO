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

        if (typeof nombre !== "string" || !nombre.trim()) {
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
            c => c.getNombre().toLowerCase() ===
                nombre.trim().toLowerCase()
        );

        if (existe) {
            return res.status(409).json({
                mensaje: "El colegio ya existe"
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

// CONSULTAR COLEGIOS

function obtenerColegios(req, res) {
    return res.status(200).json(datos.colegios);
}

// BUSCAR COLEGIO

function buscarColegio(req, res) {
    const id = Number(req.params.id);

    const colegio = datos.colegios.find(
        c => c.getId() === id
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
        c => c.getId() === id
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
                mensaje: "Nombre invalido"
            });
        }

        const duplicado = datos.colegios.some(
            c => c.getId() !== id &&
                c.getNombre().toLowerCase() ===
                nombre.trim().toLowerCase()
        );

        if (duplicado) {
            return res.status(409).json({
                mensaje: "Ya existe otro colegio con ese nombre"
            });
        }
    }

    if (aliado !== undefined && typeof aliado !== "boolean") {
        return res.status(400).json({
            mensaje: "El campo aliado debe ser booleano"
        });
    }

    if (nombre !== undefined) colegio.setNombre(nombre.trim());
    if (direccion !== undefined) colegio.setDireccion(direccion);
    if (telefono !== undefined) colegio.setTelefono(telefono);
    if (correo !== undefined) colegio.setCorreo(correo);
    if (aliado !== undefined) colegio.setAliado(aliado);

    return res.status(200).json({
        mensaje: "Colegio actualizado correctamente",
        colegio
    });
}

// ELIMINAR COLEGIO

function eliminarColegio(req, res) {
    const id = Number(req.params.id);

    const posicion = datos.colegios.findIndex(
        c => c.getId() === id
    );

    if (posicion === -1) {
        return res.status(404).json({
            mensaje: "Colegio no encontrado"
        });
    }

    const tieneSolicitudes = datos.solicitudes.some(
        s => s.getColegio().getId() === id
    );

    if (tieneSolicitudes) {
        return res.status(409).json({
            mensaje: "No se puede eliminar un colegio con solicitudes"
        });
    }

    const tieneUsuarios = datos.usuarios.some(
        u => typeof u.getColegio === "function" &&
            u.getColegio() &&
            u.getColegio().getId() === id
    );

    if (tieneUsuarios) {
        return res.status(409).json({
            mensaje: "No se puede eliminar un colegio con usuarios asociados"
        });
    }

    datos.colegios.splice(posicion, 1);

    return res.status(200).json({
        mensaje: "Colegio eliminado correctamente"
    });
}

module.exports = {
    registrarColegio,
    obtenerColegios,
    buscarColegio,
    actualizarColegio,
    eliminarColegio
};