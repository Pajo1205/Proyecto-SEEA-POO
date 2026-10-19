const bcrypt = require("bcryptjs");

const UsuarioColegio = require("../Modelo/UsuarioColegio");
const EncargadoSEEA = require("../Modelo/EncargadoSEEA");
const Voluntario = require("../Modelo/Voluntario");

const datos = require("../datos");

// Mostrar usuario sin contraseña
function usuarioPublico(usuario) {
    const {
        contrasena,
        ...informacion
    } = usuario;

    return informacion;
}

// REGISTRAR USUARIO

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
        } = req.body;

        if (!nombre || !correo || !contrasena || !tipo) {
            return res.status(400).json({
                mensaje: "Faltan datos obligatorios"
            });
        }

        if (typeof contrasena !== "string" ||
            contrasena.length < 8) {
            return res.status(400).json({
                mensaje: "La contraseña debe tener al menos 8 caracteres"
            });
        }

        const existe = datos.usuarios.some(
            usuario => usuario.getCorreo() === correo
        );

        if (existe) {
            return res.status(409).json({
                mensaje: "El correo ya está registrado"
            });
        }

        const id = datos.generarId("usuario");

        const contrasenaHash = await bcrypt.hash(
            contrasena, 12
        );

        let usuario;

        switch (tipo) {

            case "COLEGIO": {
                const colegio = datos.colegios.find(
                    c => c.getId() === Number(idColegio)
                );

                if (!colegio) {
                    return res.status(404).json({
                        mensaje: "Colegio no encontrado"
                    });
                }

                usuario = new UsuarioColegio(
                    id, nombre, correo, contrasenaHash,
                    telefono || "", colegio
                );
                break;
            }

            case "SEEA":
                usuario = new EncargadoSEEA(
                    id, nombre, correo, contrasenaHash,
                    puesto || ""
                );
                break;

            case "VOLUNTARIO":
                if (!carnet) {
                    return res.status(400).json({
                        mensaje: "El carnet es obligatorio"
                    });
                }

                usuario = new Voluntario(
                    id, nombre, correo, contrasenaHash,
                    carnet, carrera || ""
                );
                break;

            default:
                return res.status(400).json({
                    mensaje: "Tipo de usuario inválido"
                });
        }

        datos.usuarios.push(usuario);

        return res.status(201).json({
            mensaje: "Usuario registrado",
            usuario: {
                ...usuarioPublico(usuario),
                tipo
            }
        });

    } catch (error) {
        return res.status(400).json({
            mensaje: error.message
        });
    }
}

// CONSULTAR USUARIOS

function obtenerUsuarios(req, res) {
    const usuarios = datos.usuarios.map(
        usuario => usuarioPublico(usuario)
    );

    return res.status(200).json(usuarios);
}

// BUSCAR USUARIO

function buscarUsuario(req, res) {
    const id = Number(req.params.id);

    const usuario = datos.usuarios.find(
        u => u.getId() === id
    );

    if (!usuario) {
        return res.status(404).json({
            mensaje: "Usuario no encontrado"
        });
    }

    return res.status(200).json(
        usuarioPublico(usuario)
    );
}

// INICIAR SESIÓN - COMPROBACIÓN DE CREDENCIALES

async function iniciarSesion(req, res) {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({
                mensaje: "Correo y contraseña obligatorios"
            });
        }

        const usuario = datos.usuarios.find(
            u => u.getCorreo() === correo
        );

        if (!usuario) {
            return res.status(401).json({
                mensaje: "Credenciales incorrectas"
            });
        }

        const valida = await bcrypt.compare(
            contrasena,
            usuario.getContrasena()
        );

        if (!valida) {
            return res.status(401).json({
                mensaje: "Credenciales incorrectas"
            });
        }

        return res.status(200).json({
            mensaje: "Credenciales correctas",
            usuario: usuarioPublico(usuario)
        });

    } catch (error) {
        return res.status(500).json({
            mensaje: "Error al verificar credenciales"
        });
    }
}

module.exports = {
    registrarUsuario,
    obtenerUsuarios,
    buscarUsuario,
    iniciarSesion
};