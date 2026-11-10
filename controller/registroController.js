
const express = require("express");
const bcrypt = require("bcryptjs");

const datos = require("../datos");

const Colegio = require("../Modelo/Colegio");
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
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())
    );
}

function normalizarNombre(nombre) {
    return nombre
        .trim()
        .replace(/\s+/g, " ")
        .toLocaleLowerCase("es");
}

function buscarColegioPorNombre(nombre) {
    return datos.colegios.find(
        colegio =>
            normalizarNombre(colegio.getNombre()) ===
            normalizarNombre(nombre)
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
        resultado.colegio = usuario.getColegio().getNombre();
        resultado.aliado = usuario.getColegio().esAliado();
    }

    if (usuario.rol === "VOLUNTARIO") {
        resultado.carnet = usuario.getCarnet();
        resultado.carrera = usuario.getCarrera();
    }

    return resultado;
}

// ==========================================
// CONSULTAR COLEGIOS ALIADOS
// ==========================================

router.get("/colegios", (req, res) => {
    const colegios = datos.colegios
        .filter(colegio => colegio.esAliado())
        .map(colegio => ({
            id: colegio.getId(),
            nombre: colegio.getNombre(),
            direccion: colegio.getDireccion()
        }));

    return res.status(200).json(colegios);
});

// ==========================================
// CONSULTAR CARRERAS
// ==========================================

router.get("/carreras", (req, res) => {
    return res.status(200).json(
        Object.values(Carrera)
    );
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
            nombreColegio,
            direccionColegio,
            carnet,
            carrera,
            otraCarrera
        } = req.body || {};

        // ==================================
        // VALIDAR ROL
        // ==================================

        if (!["COLEGIO", "VOLUNTARIO"].includes(tipo)) {
            return responderError(
                res,
                403,
                "Solo pueden registrarse usuarios de colegio y voluntarios"
            );
        }

        // ==================================
        // VALIDAR DATOS GENERALES
        // ==================================

        if (
            !textoValido(nombre) ||
            nombre.trim().length > 120
        ) {
            return responderError(
                res,
                400,
                "El nombre es obligatorio y debe tener máximo 120 caracteres"
            );
        }

        if (!correoValido(correo)) {
            return responderError(
                res,
                400,
                "El correo electrónico no es válido"
            );
        }

        if (
            typeof contrasena !== "string" ||
            contrasena.length < 8
        ) {
            return responderError(
                res,
                400,
                "La contraseña debe tener al menos 8 caracteres"
            );
        }

        if (contrasena !== confirmarContrasena) {
            return responderError(
                res,
                400,
                "Las contraseñas no coinciden"
            );
        }

        const email = correo.trim().toLowerCase();

        const existe = datos.usuarios.some(
            usuario =>
                usuario.getCorreo().toLowerCase() === email
        );

        if (existe) {
            return responderError(
                res,
                409,
                "El correo ya está registrado"
            );
        }

        let colegio = null;
        let crearColegioNuevo = false;
        let carreraFinal = null;

        // ==================================
        // REGISTRO DE COLEGIO
        // ==================================

        if (tipo === "COLEGIO") {

            if (
                !textoValido(telefono) ||
                telefono.trim().length > 30
            ) {
                return responderError(
                    res,
                    400,
                    "El teléfono es obligatorio"
                );
            }

            // Caso 1: Colegio no registrado
            if (idColegio === "OTRO") {

                if (
                    !textoValido(nombreColegio) ||
                    nombreColegio.trim().length > 150
                ) {
                    return responderError(
                        res,
                        400,
                        "Escribí un nombre válido para el colegio"
                    );
                }

                if (
                    !textoValido(direccionColegio) ||
                    direccionColegio.trim().length > 250
                ) {
                    return responderError(
                        res,
                        400,
                        "La dirección del colegio es obligatoria"
                    );
                }

                // Evitar colegios duplicados
                const duplicado = buscarColegioPorNombre(
                    nombreColegio
                );

                if (duplicado) {
                    return responderError(
                        res,
                        409,
                        "Este colegio ya está registrado. Contactá a SEEA si no aparece en la lista."
                    );
                }

                crearColegioNuevo = true;

            } else {

                // Caso 2: Colegio aliado existente
                const id = Number(idColegio);

                if (
                    !Number.isSafeInteger(id) ||
                    id <= 0
                ) {
                    return responderError(
                        res,
                        400,
                        "Seleccioná un colegio válido"
                    );
                }

                colegio = datos.colegios.find(
                    c => c.getId() === id && c.esAliado()
                );

                if (!colegio) {
                    return responderError(
                        res,
                        404,
                        "Colegio aliado no encontrado"
                    );
                }
            }
        }

        // ==================================
        // REGISTRO DE VOLUNTARIO
        // ==================================

        if (tipo === "VOLUNTARIO") {

            if (!Voluntario.correoInstitucionalValido(email)) {
                return responderError(
                    res,
                    400,
                    "Debes utilizar un correo @uvg.edu.gt"
                );
            }

            if (
                !textoValido(carnet) ||
                carnet.trim().length > 30
            ) {
                return responderError(
                    res,
                    400,
                    "El carnet universitario es obligatorio"
                );
            }

            const carnetDuplicado = datos.usuarios.some(
                usuario =>
                    usuario.rol === "VOLUNTARIO" &&
                    usuario.getCarnet() === carnet.trim()
            );

            if (carnetDuplicado) {
                return responderError(
                    res,
                    409,
                    "Este carnet ya está registrado"
                );
            }

            if (!Object.values(Carrera).includes(carrera)) {
                return responderError(
                    res,
                    400,
                    "Seleccioná una carrera válida"
                );
            }

            if (carrera === Carrera.OTRO) {

                if (
                    !textoValido(otraCarrera) ||
                    otraCarrera.trim().length > 120
                ) {
                    return responderError(
                        res,
                        400,
                        "Escribí el nombre de tu carrera"
                    );
                }

                carreraFinal = otraCarrera.trim();

            } else {
                carreraFinal = carrera;
            }
        }

        // ==================================
        // PROTEGER CONTRASEÑA
        // ==================================

        const hash = await bcrypt.hash(contrasena, 12);

        // ==================================
        // CREAR COLEGIO NO ALIADO
        // ==================================

        if (crearColegioNuevo) {
            colegio = new Colegio(
                datos.generarId("colegio"),
                nombreColegio.trim(),
                direccionColegio.trim(),
                telefono.trim(),
                email,
                false
            );

            datos.colegios.push(colegio);
        }

        // ==================================
        // CREAR USUARIO
        // ==================================

        const id = datos.generarId("usuario");

        let usuario;

        if (tipo === "COLEGIO") {

            usuario = new UsuarioColegio(
                id,
                nombre.trim(),
                email,
                hash,
                telefono.trim(),
                colegio
            );

            usuario.rol = "COLEGIO";

        } else {

            usuario = new Voluntario(
                id,
                nombre.trim(),
                email,
                hash,
                carnet.trim(),
                carreraFinal
            );
        }

        // ==================================
        // GUARDAR USUARIO
        // ==================================

        datos.usuarios.push(usuario);

        return res.status(201).json({
            mensaje: "Cuenta registrada correctamente",
            usuario: usuarioPublico(usuario)
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
