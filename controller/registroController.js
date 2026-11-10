
const express = require("express");
const bcrypt = require("bcryptjs");

const datos = require("../datos");

const UsuarioColegio = require("../Modelo/UsuarioColegio");
const Voluntario = require("../Modelo/Voluntario");
const Carrera = require("../Modelo/Carrera");

const router = express.Router();

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function responderError(res, codigo, mensaje) {
    return res.status(codigo).json({ mensaje });
}

function textoValido(valor) {
    return (
        typeof valor === "string" &&
        valor.trim().length > 0
    );
}

function correoValido(correo) {
    return (
        typeof correo === "string" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    );
}

function usuarioPublico(usuario) {

    const resultado = {
        id: usuario.getId(),
        nombre: usuario.getNombre(),
        correo: usuario.getCorreo(),
        rol: usuario.rol
    };

    if (usuario.rol === "COLEGIO") {
        resultado.telefono = usuario.getTelefono();
        resultado.idColegio = usuario.getColegio().getId();
    }

    if (usuario.rol === "VOLUNTARIO") {
        resultado.carnet = usuario.getCarnet();
        resultado.carrera = usuario.getCarrera();
    }

    return resultado;
}

// ==========================================
// OBTENER COLEGIOS REGISTRADOS
// ==========================================

router.get("/colegios", (req, res) => {

    const colegios = datos.colegios.map(colegio => ({
        id: colegio.getId(),
        nombre: colegio.getNombre(),
        direccion: colegio.getDireccion()
    }));

    return res.status(200).json(colegios);
});

// ==========================================
// OBTENER CARRERAS UNIVERSITARIAS
// ==========================================

router.get("/carreras", (req, res) => {

    const carreras = Object.values(Carrera);

    return res.status(200).json(carreras);
});

// ==========================================
// REGISTRO PUBLICO
// ==========================================

router.post("/", async (req, res, next) => {

    try {

        const {
            tipo,
            nombre,
            correo,
            contrasena,
            confirmarContrasena,
            telefono,
            idColegio,
            carnet,
            carrera,
            otraCarrera
        } = req.body || {};

        // ==================================
        // VALIDAR TIPO DE USUARIO
        // ==================================

        if (!["COLEGIO", "VOLUNTARIO"].includes(tipo)) {

            return responderError(
                res,
                403,
                "Solo pueden registrarse colegios y voluntarios"
            );
        }

        // ==================================
        // VALIDAR DATOS GENERALES
        // ==================================

        if (!textoValido(nombre)) {

            return responderError(
                res,
                400,
                "El nombre es obligatorio"
            );
        }

        if (!correoValido(correo)) {

            return responderError(
                res,
                400,
                "El correo electronico no es valido"
            );
        }

        if (
            typeof contrasena !== "string" ||
            contrasena.length < 8
        ) {

            return responderError(
                res,
                400,
                "La contrasena debe tener al menos 8 caracteres"
            );
        }

        if (contrasena !== confirmarContrasena) {

            return responderError(
                res,
                400,
                "Las contrasenas no coinciden"
            );
        }

        const correoNormalizado =
            correo.trim().toLowerCase();

        // ==================================
        // COMPROBAR CORREO DUPLICADO
        // ==================================

        const correoExistente = datos.usuarios.some(
            usuario =>
                usuario.getCorreo().toLowerCase() ===
                correoNormalizado
        );

        if (correoExistente) {

            return responderError(
                res,
                409,
                "El correo ya esta registrado"
            );
        }

        let colegio = null;
        let carreraFinal = null;

        // ==================================
        // VALIDACIONES DE COLEGIO
        // ==================================

        if (tipo === "COLEGIO") {

            colegio = datos.colegios.find(
                c => c.getId() === Number(idColegio)
            );

            if (!colegio) {

                return responderError(
                    res,
                    404,
                    "Debes seleccionar un colegio registrado"
                );
            }

            if (!textoValido(telefono)) {

                return responderError(
                    res,
                    400,
                    "El telefono es obligatorio"
                );
            }
        }

        // ==================================
        // VALIDACIONES DE VOLUNTARIO
        // ==================================

        if (tipo === "VOLUNTARIO") {

            if (!Voluntario.correoInstitucionalValido(
                correoNormalizado
            )) {

                return responderError(
                    res,
                    400,
                    "Debes utilizar un correo @uvg.edu.gt"
                );
            }

            if (!textoValido(carnet)) {

                return responderError(
                    res,
                    400,
                    "El carnet universitario es obligatorio"
                );
            }

            const carrerasValidas = Object.values(Carrera);

            if (!carrerasValidas.includes(carrera)) {

                return responderError(
                    res,
                    400,
                    "Selecciona una carrera valida"
                );
            }

            if (carrera === Carrera.OTRO) {

                if (!textoValido(otraCarrera)) {

                    return responderError(
                        res,
                        400,
                        "Debes escribir el nombre de tu carrera"
                    );
                }

                carreraFinal = otraCarrera.trim();

            } else {

                carreraFinal = carrera;
            }
        }

        // ==================================
        // GENERAR HASH DE CONTRASENA
        // ==================================

        const hash = await bcrypt.hash(
            contrasena,
            12
        );

        // ==================================
        // CREAR USUARIO
        // ==================================

        const id = datos.generarId("usuario");

        let usuario;

        if (tipo === "COLEGIO") {

            usuario = new UsuarioColegio(
                id,
                nombre.trim(),
                correoNormalizado,
                hash,
                telefono.trim(),
                colegio
            );

        } else {

            usuario = new Voluntario(
                id,
                nombre.trim(),
                correoNormalizado,
                hash,
                carnet.trim(),
                carreraFinal
            );
        }

        // ==================================
        // GUARDAR USUARIO
        // ==================================

        datos.usuarios.push(usuario);

        // ==================================
        // RESPUESTA
        // ==================================

        return res.status(201).json({
            mensaje: "Cuenta registrada correctamente",
            usuario: usuarioPublico(usuario)
        });

    } catch (error) {

        next(error);
    }
});

// ==========================================
// EXPORTAR ROUTER
// ==========================================

module.exports = {
    router
};
