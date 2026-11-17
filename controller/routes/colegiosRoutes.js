"use strict";

const persistencia = require("../../database/persistencia");

// Rutas de colegios. Reciben dependencias compartidas del router principal.
module.exports = function registrarColegios(ctx) {
    const { router, datos, bcrypt, Colegio, Horario, Solicitud, Visita, Actividad, UsuarioColegio, EncargadoSEEA, Voluntario, DisponibilidadVoluntario, AsignacionVoluntario, error, buscarPorId, textoValido, correoValido, usuarioPublico, colegioDTO, horarioDTO, solicitudDTO, actividadDTO, asignacionDTO, visitaDTO, requiereSesion, requiereRol } = ctx;

// ==========================================
// COLEGIOS
// ==========================================

// Consultar colegios
router.get(
    "/colegios",
    requiereRol("SEEA"),
    (req, res) => {
        return res.json(
            datos.colegios.map(colegioDTO)
        );
    }
);


// ==========================================
// REGISTRAR COLEGIO ALIADO
// ==========================================

router.post(
    "/colegios",
    requiereRol("SEEA"),
    (req, res) => {

        try {

            const {
                nombre,
                direccion = "",
                telefono = "",
                correo = ""
            } = req.body || {};

            // ==================================
            // VALIDAR NOMBRE
            // ==================================

            if (!textoValido(nombre)) {
                return error(
                    res,
                    400,
                    "El nombre del colegio es obligatorio"
                );
            }

            // ==================================
            // VALIDAR CAMPOS
            // ==================================

            if (
                typeof direccion !== "string" ||
                typeof telefono !== "string" ||
                typeof correo !== "string"
            ) {
                return error(
                    res,
                    400,
                    "Los datos del colegio no son validos"
                );
            }

            // ==================================
            // COMPROBAR DUPLICADOS
            // ==================================

            const duplicado = datos.colegios.some(
                colegio =>
                    colegio.getNombre().trim().toLowerCase() ===
                    nombre.trim().toLowerCase()
            );

            if (duplicado) {
                return error(
                    res,
                    409,
                    "Ya existe un colegio con ese nombre"
                );
            }

            // ==================================
            // CREAR COLEGIO ALIADO
            // ==================================

            const colegio = new Colegio(
                datos.generarId("colegio"),
                nombre.trim(),
                direccion.trim(),
                telefono.trim(),
                correo.trim(),
                true
            );

            // ==================================
            // GUARDAR
            // ==================================

            datos.colegios.push(colegio);
            persistencia.guardarColegio(colegio);

            return res.status(201).json({
                mensaje: "Colegio aliado registrado correctamente",
                colegio: colegioDTO(colegio)
            });

        } catch (err) {

            return error(
                res,
                400,
                err.message
            );
        }
    }
);

// ==========================================
// ACTUALIZAR COLEGIO
// ==========================================

router.patch(
    "/colegios/:id",
    requiereRol("SEEA"),
    (req, res) => {

        const colegio = buscarPorId(
            datos.colegios,
            req.params.id
        );

        if (!colegio) {
            return error(
                res,
                404,
                "Colegio no encontrado"
            );
        }

        const body = req.body || {};

        // ==================================
        // NO PERMITIR CAMBIAR ALIADO
        // ==================================

        if (body.aliado !== undefined) {
            return error(
                res,
                403,
                "La condicion de aliado no puede modificarse desde esta ruta"
            );
        }

        // ==================================
        // VALIDAR NOMBRE
        // ==================================

        if (body.nombre !== undefined) {

            if (!textoValido(body.nombre)) {
                return error(
                    res,
                    400,
                    "El nombre del colegio no es valido"
                );
            }

            const duplicado = datos.colegios.some(
                c =>
                    c !== colegio &&
                    c.getNombre().trim().toLowerCase() ===
                    body.nombre.trim().toLowerCase()
            );

            if (duplicado) {
                return error(
                    res,
                    409,
                    "Ya existe otro colegio con ese nombre"
                );
            }
        }

        // ==================================
        // VALIDAR Y ACTUALIZAR CAMPOS
        // ==================================

        const cambios = [
            {
                campo: "nombre",
                metodo: "setNombre"
            },
            {
                campo: "direccion",
                metodo: "setDireccion"
            },
            {
                campo: "telefono",
                metodo: "setTelefono"
            },
            {
                campo: "correo",
                metodo: "setCorreo"
            }
        ];

        // Validar antes de modificar
        for (const { campo } of cambios) {

            if (
                body[campo] !== undefined &&
                typeof body[campo] !== "string"
            ) {
                return error(
                    res,
                    400,
                    `El campo ${campo} debe ser texto`
                );
            }
        }

        if (
            body.correo !== undefined &&
            body.correo !== "" &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.correo)
        ) {
            return error(
                res,
                400,
                "El correo no es valido"
            );
        }

        for (const { campo, metodo } of cambios) {

            if (body[campo] !== undefined) {

                const actualizado = colegio[metodo](
                    body[campo].trim()
                );

                if (actualizado === false) {
                    return error(
                        res,
                        400,
                        `No se pudo actualizar ${campo}`
                    );
                }
            }
        }

        // ==================================
        // GUARDAR Y RESPONDER
        // ==================================

        persistencia.guardarColegio(colegio);

        return res.status(200).json({
            mensaje: "Colegio actualizado correctamente",
            colegio: colegioDTO(colegio)
        });
    }
);


// Eliminar colegio
router.delete(
    "/colegios/:id",
    requiereRol("SEEA"),
    (req, res) => {
        const colegio = buscarPorId(
            datos.colegios,
            req.params.id
        );

        if (!colegio) {
            return error(res, 404, "Colegio no encontrado");
        }

        const tieneSolicitudes = datos.solicitudes.some(
            s => s.colegio === colegio
        );

        const tieneUsuarios = datos.usuarios.some(
            u => u.colegio === colegio
        );

        if (tieneSolicitudes || tieneUsuarios) {
            return error(
                res,
                409,
                "El colegio tiene registros relacionados"
            );
        }

        datos.colegios.splice(
            datos.colegios.indexOf(colegio),
            1
        );

        persistencia.eliminarColegio(colegio.id);

        return res.json({
            mensaje: "Colegio eliminado"
        });
    }
);


};
