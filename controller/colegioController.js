
// ==========================================
// IMPORTACIONES
// ==========================================

const Colegio = require("../Modelo/Colegio");
const datos = require("../datos");

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function responderError(res, codigo, mensaje) {

    return res.status(codigo).json({
        mensaje
    });
}

// Buscar colegio por ID
function buscarColegioPorId(id) {

    return datos.colegios.find(
        colegio => colegio.getId() === Number(id)
    );
}

// Verificar si el usuario es encargado SEEA
function esEncargado(req) {

    return req.usuario?.rol === "SEEA";
}

// Convertir colegio a JSON
function colegioDTO(colegio) {

    return {
        id: colegio.getId(),
        nombre: colegio.getNombre(),
        direccion: colegio.getDireccion(),
        telefono: colegio.getTelefono(),
        correo: colegio.getCorreo(),
        aliado: colegio.getAliado()
    };
}

// Validar campos de colegio
function validarDatosColegio(datosColegio) {

    const {
        nombre,
        direccion,
        telefono,
        correo,
        aliado
    } = datosColegio;

    if (
        nombre !== undefined &&
        (
            typeof nombre !== "string" ||
            !nombre.trim()
        )
    ) {
        return "El nombre del colegio no es valido";
    }

    if (
        direccion !== undefined &&
        typeof direccion !== "string"
    ) {
        return "La direccion debe ser texto";
    }

    if (
        telefono !== undefined &&
        typeof telefono !== "string"
    ) {
        return "El telefono debe ser texto";
    }

    if (
        correo !== undefined &&
        (
            typeof correo !== "string" ||
            (
                correo !== "" &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
            )
        )
    ) {
        return "El correo del colegio no es valido";
    }

    if (
        aliado !== undefined &&
        typeof aliado !== "boolean"
    ) {
        return "El campo aliado debe ser true o false";
    }

    return null;
}

// ==========================================
// REGISTRAR COLEGIO
// ==========================================

function registrarColegio(req, res) {

    try {

        if (!esEncargado(req)) {
            return responderError(
                res,
                403,
                "Solo el encargado SEEA puede registrar colegios"
            );
        }

        const {
            nombre,
            direccion = "",
            telefono = "",
            correo = "",
            aliado = false
        } = req.body || {};

        const errorValidacion = validarDatosColegio({
            nombre,
            direccion,
            telefono,
            correo,
            aliado
        });

        if (errorValidacion) {
            return responderError(
                res,
                400,
                errorValidacion
            );
        }

        if (!nombre) {
            return responderError(
                res,
                400,
                "El nombre del colegio es obligatorio"
            );
        }

        // Comprobar colegios duplicados
        const existe = datos.colegios.some(
            colegio =>
                colegio.getNombre().toLowerCase() ===
                nombre.trim().toLowerCase()
        );

        if (existe) {
            return responderError(
                res,
                409,
                "El colegio ya existe"
            );
        }

        // Crear colegio
        const colegio = new Colegio(
            datos.generarId("colegio"),
            nombre.trim(),
            direccion,
            telefono,
            correo,
            aliado
        );

        datos.colegios.push(colegio);

        return res.status(201).json({
            mensaje: "Colegio registrado correctamente",
            colegio: colegioDTO(colegio)
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
// CONSULTAR COLEGIOS
// ==========================================

function obtenerColegios(req, res) {

    if (!esEncargado(req)) {
        return responderError(
            res,
            403,
            "Solo SEEA puede consultar todos los colegios"
        );
    }

    return res.status(200).json(
        datos.colegios.map(colegioDTO)
    );
}

// ==========================================
// BUSCAR COLEGIO
// ==========================================

function buscarColegio(req, res) {

    if (!esEncargado(req)) {
        return responderError(
            res,
            403,
            "Solo SEEA puede consultar colegios"
        );
    }

    const colegio = buscarColegioPorId(
        req.params.id
    );

    if (!colegio) {
        return responderError(
            res,
            404,
            "Colegio no encontrado"
        );
    }

    return res.status(200).json(
        colegioDTO(colegio)
    );
}

// ==========================================
// ACTUALIZAR COLEGIO
// ==========================================

function actualizarColegio(req, res) {

    if (!esEncargado(req)) {
        return responderError(
            res,
            403,
            "Solo SEEA puede modificar colegios"
        );
    }

    const colegio = buscarColegioPorId(
        req.params.id
    );

    if (!colegio) {
        return responderError(
            res,
            404,
            "Colegio no encontrado"
        );
    }

    const cambios = req.body || {};

    // Validar todos los cambios primero
    const errorValidacion = validarDatosColegio(
        cambios
    );

    if (errorValidacion) {
        return responderError(
            res,
            400,
            errorValidacion
        );
    }

    // Evitar nombres duplicados
    if (cambios.nombre !== undefined) {

        const duplicado = datos.colegios.some(
            otro =>
                otro !== colegio &&
                otro.getNombre().toLowerCase() ===
                cambios.nombre.trim().toLowerCase()
        );

        if (duplicado) {
            return responderError(
                res,
                409,
                "Ya existe otro colegio con ese nombre"
            );
        }
    }

    // Aplicar cambios validados
    if (cambios.nombre !== undefined) {
        colegio.setNombre(cambios.nombre);
    }

    if (cambios.direccion !== undefined) {
        colegio.setDireccion(cambios.direccion);
    }

    if (cambios.telefono !== undefined) {
        colegio.setTelefono(cambios.telefono);
    }

    if (cambios.correo !== undefined) {
        colegio.setCorreo(cambios.correo);
    }

    if (cambios.aliado !== undefined) {
        colegio.setAliado(cambios.aliado);
    }

    return res.status(200).json({
        mensaje: "Colegio actualizado correctamente",
        colegio: colegioDTO(colegio)
    });
}

// ==========================================
// ELIMINAR COLEGIO
// ==========================================

function eliminarColegio(req, res) {

    if (!esEncargado(req)) {
        return responderError(
            res,
            403,
            "Solo SEEA puede eliminar colegios"
        );
    }

    const colegio = buscarColegioPorId(
        req.params.id
    );

    if (!colegio) {
        return responderError(
            res,
            404,
            "Colegio no encontrado"
        );
    }

    // Verificar solicitudes asociadas
    const tieneSolicitudes = datos.solicitudes.some(
        solicitud =>
            solicitud.getColegio() === colegio
    );

    if (tieneSolicitudes) {
        return responderError(
            res,
            409,
            "No se puede eliminar un colegio con solicitudes"
        );
    }

    // Verificar usuarios asociados
    const tieneUsuarios = datos.usuarios.some(
        usuario =>
            typeof usuario.getColegio === "function" &&
            usuario.getColegio() === colegio
    );

    if (tieneUsuarios) {
        return responderError(
            res,
            409,
            "No se puede eliminar un colegio con usuarios asociados"
        );
    }

    // Eliminar colegio
    const posicion = datos.colegios.indexOf(
        colegio
    );

    datos.colegios.splice(posicion, 1);

    return res.status(200).json({
        mensaje: "Colegio eliminado correctamente"
    });
}

// ==========================================
// EXPORTACIONES
// ==========================================

module.exports = {
    registrarColegio,
    obtenerColegios,
    buscarColegio,
    actualizarColegio,
    eliminarColegio,
    colegioDTO
};
