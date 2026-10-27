
const bcrypt = require("bcryptjs");

const UsuarioColegio = require("../Modelo/UsuarioColegio");
const EncargadoSEEA = require("../Modelo/EncargadoSEEA");
const Voluntario = require("../Modelo/Voluntario");

const datos = require("../datos");

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// Convertir usuario a informacion publica
function usuarioPublico(usuario) {

    const informacion = {
        id: usuario.getId(),
        nombre: usuario.getNombre(),
        correo: usuario.getCorreo(),
        rol: usuario.rol
    };

    if (usuario.rol === "COLEGIO") {

        informacion.telefono = usuario.getTelefono();

        informacion.idColegio =
            usuario.getColegio()?.getId() ?? null;
    }

    if (usuario.rol === "VOLUNTARIO") {

        informacion.carnet = usuario.getCarnet();
        informacion.carrera = usuario.getCarrera();
    }

    if (usuario.rol === "SEEA") {

        informacion.puesto = usuario.getPuesto();
    }

    return informacion;
}

// Buscar usuario por ID
function buscarUsuarioPorId(id) {

    return datos.usuarios.find(
        usuario => usuario.getId() === Number(id)
    );
}

// Buscar usuario por correo
function buscarUsuarioPorCorreo(correo) {

    if (typeof correo !== "string") {
        return null;
    }

    return datos.usuarios.find(
        usuario =>
            usuario.getCorreo().toLowerCase() ===
            correo.trim().toLowerCase()
    );
}

// Validar correo electronico
function correoValido(correo) {

    return (
        typeof correo === "string" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    );
}

// Responder con error
function responderError(res, codigo, mensaje) {

    return res.status(codigo).json({
        mensaje
    });
}

// ==========================================
// REGISTRAR USUARIO
// ==========================================

async function registrarUsuario(req, res) {

    try {

        const {
            nombre,
            correo,
            contrasena,
            tipo,
            telefono,
            idColegio,
            puesto,
            carnet,
            carrera
        } = req.body || {};

        // Validar campos obligatorios
        if (
            typeof nombre !== "string" ||
            !nombre.trim() ||
            !correoValido(correo) ||
            typeof contrasena !== "string" ||
            contrasena.length < 8
        ) {
            return responderError(
                res,
                400,
                "Nombre, correo o contrasena invalidos"
            );
        }

        // Verificar correo duplicado
        const existe = buscarUsuarioPorCorreo(correo);

        if (existe) {
            return responderError(
                res,
                409,
                "El correo ya esta registrado"
            );
        }

        // Validar tipo de usuario
        if (!["SEEA", "COLEGIO", "VOLUNTARIO"].includes(tipo)) {

            return responderError(
                res,
                400,
                "Tipo de usuario invalido"
            );
        }

        // Buscar colegio si corresponde
        let colegio = null;

        if (tipo === "COLEGIO") {

            colegio = datos.colegios.find(
                c => c.getId() === Number(idColegio)
            );

            if (!colegio) {
                return responderError(
                    res,
                    404,
                    "Colegio no encontrado"
                );
            }
        }

        // Validar carnet del voluntario
        if (
            tipo === "VOLUNTARIO" &&
            (
                typeof carnet !== "string" ||
                !carnet.trim()
            )
        ) {
            return responderError(
                res,
                400,
                "El carnet del voluntario es obligatorio"
            );
        }

        // Cifrar contrasena
        const contrasenaHash = await bcrypt.hash(
            contrasena,
            12
        );

        // Generar ID
        const id = datos.generarId("usuario");

        let usuario;

        // ==================================
        // CREAR SEGUN ROL
        // ==================================

        switch (tipo) {

            case "COLEGIO":

                usuario = new UsuarioColegio(
                    id,
                    nombre.trim(),
                    correo.trim().toLowerCase(),
                    contrasenaHash,
                    telefono || "",
                    colegio
                );

                break;

            case "SEEA":

                usuario = new EncargadoSEEA(
                    id,
                    nombre.trim(),
                    correo.trim().toLowerCase(),
                    contrasenaHash,
                    puesto || "Encargado"
                );

                break;

            case "VOLUNTARIO":

                usuario = new Voluntario(
                    id,
                    nombre.trim(),
                    correo.trim().toLowerCase(),
                    contrasenaHash,
                    carnet.trim(),
                    carrera || ""
                );

                break;
        }

        // Guardar usuario
        datos.usuarios.push(usuario);

        return res.status(201).json({
            mensaje: "Usuario registrado correctamente",
            usuario: usuarioPublico(usuario)
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
// CONSULTAR USUARIOS
// ==========================================

function obtenerUsuarios(req, res) {

    const usuarios = datos.usuarios.map(
        usuarioPublico
    );

    return res.status(200).json(usuarios);
}

// ==========================================
// BUSCAR USUARIO
// ==========================================

function buscarUsuario(req, res) {

    const usuario = buscarUsuarioPorId(
        req.params.id
    );

    if (!usuario) {
        return responderError(
            res,
            404,
            "Usuario no encontrado"
        );
    }

    return res.status(200).json(
        usuarioPublico(usuario)
    );
}

// ==========================================
// INICIAR SESION
// ==========================================

async function iniciarSesion(req, res, next) {

    try {

        const {
            correo,
            contrasena
        } = req.body || {};

        if (
            typeof correo !== "string" ||
            typeof contrasena !== "string" ||
            !correo.trim() ||
            !contrasena
        ) {
            return responderError(
                res,
                400,
                "Correo y contrasena obligatorios"
            );
        }

        // Buscar usuario
        const usuario = buscarUsuarioPorCorreo(correo);

        if (!usuario) {
            return responderError(
                res,
                401,
                "Credenciales incorrectas"
            );
        }

        // Comparar contrasena con bcrypt
        const valida = await bcrypt.compare(
            contrasena,
            usuario.getContrasena()
        );

        if (!valida) {
            return responderError(
                res,
                401,
                "Credenciales incorrectas"
            );
        }

        // Verificar que exista express-session
        if (!req.session) {
            return responderError(
                res,
                500,
                "El servidor no tiene sesiones configuradas"
            );
        }

        // Regenerar sesion por seguridad
        req.session.regenerate(error => {

            if (error) {
                return next(error);
            }

            // Guardar ID del usuario
            req.session.usuarioId = usuario.getId();

            req.session.save(error => {

                if (error) {
                    return next(error);
                }

                return res.status(200).json({
                    mensaje: "Sesion iniciada correctamente",
                    usuario: usuarioPublico(usuario)
                });
            });
        });

    } catch (error) {

        next(error);
    }
}

// ==========================================
// EXPORTAR CONTROLADOR
// ==========================================

module.exports = {
    registrarUsuario,
    obtenerUsuarios,
    buscarUsuario,
    iniciarSesion,
    usuarioPublico
};
