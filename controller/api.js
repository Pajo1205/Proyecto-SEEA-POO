const express = require("express");
const bcrypt = require("bcryptjs");

// ==========================================
// IMPORTAR DATOS Y MODELOS
// ==========================================

const datos = require("../datos");

const Colegio = require("../Modelo/Colegio");
const Horario = require("../Modelo/Horario");
const Solicitud = require("../Modelo/Solicitud");
const Visita = require("../Modelo/Visita");
const Actividad = require("../Modelo/Actividad");

const UsuarioColegio = require("../Modelo/UsuarioColegio");
const EncargadoSEEA = require("../Modelo/EncargadoSEEA");
const Voluntario = require("../Modelo/Voluntario");

const DisponibilidadVoluntario =
    require("../Modelo/DisponibilidadVoluntario");

const AsignacionVoluntario =
    require("../Modelo/AsignacionVoluntario");

// ==========================================
// CREAR ROUTER
// ==========================================

const router = express.Router();

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

const { error, buscarPorId, textoValido, correoValido } = require("./utils/httpHelpers");
const { usuarioPublico, colegioDTO, horarioDTO, solicitudDTO, actividadDTO, asignacionDTO, visitaDTO } = require("./serializers/dto");

// ==========================================
// AUTENTICACION Y AUTORIZACION
// ==========================================

// Verificar si existe una sesion
function requiereSesion(req, res, next) {
    if (!req.session || !req.session.usuarioId) {
        return error(res, 401, "Debes iniciar sesion");
    }

    next();
}

// Verificar el rol del usuario
function requiereRol(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario ||
            !rolesPermitidos.includes(req.usuario.rol)) {

            return error(
                res,
                403,
                "No tienes permisos para esta operacion"
            );
        }

        next();
    };
}

// Recuperar el usuario autenticado
router.use((req, res, next) => {
    if (req.session && req.session.usuarioId) {

        req.usuario = buscarPorId(
            datos.usuarios,
            req.session.usuarioId
        );

        if (!req.usuario) {
            return req.session.destroy(() => {
                error(res, 401, "Sesion no valida");
            });
        }
    }

    next();
});

// ==========================================
// INICIAR SESION
// ==========================================

router.post("/login", async (req, res, next) => {
    try {
        const { correo, contrasena } = req.body || {};

        const usuario = datos.usuarios.find(
            u => u.correo.toLowerCase() ===
                String(correo || "").trim().toLowerCase()
        );

        if (!usuario ||
            typeof contrasena !== "string") {

            return error(res, 401, "Credenciales incorrectas");
        }

        const correcta = await bcrypt.compare(
            contrasena,
            usuario.contrasena
        );

        if (!correcta) {
            return error(res, 401, "Credenciales incorrectas");
        }

        req.session.regenerate(err => {
            if (err) return next(err);

            req.session.usuarioId = usuario.id;

            req.session.save(err => {
                if (err) return next(err);

                return res.status(200).json({
                    mensaje: "Sesion iniciada correctamente",
                    usuario: usuarioPublico(usuario)
                });
            });
        });

    } catch (err) {
        next(err);
    }
});

// ==========================================
// CERRAR SESION
// ==========================================

router.post("/logout", requiereSesion, (req, res, next) => {
    req.session.destroy(err => {
        if (err) return next(err);

        res.clearCookie("seea.sid");

        return res.status(200).json({
            mensaje: "Sesion cerrada correctamente"
        });
    });
});

// ==========================================
// USUARIO ACTUAL
// ==========================================

router.get("/me", requiereSesion, (req, res) => {
    return res.status(200).json(
        usuarioPublico(req.usuario)
    );
});

// Proteger todas las rutas siguientes
router.use(requiereSesion);


// Las rutas se distribuyen por dominio; se conserva el orden original.
const contextoRutas = {
    router, datos, bcrypt, Colegio, Horario, Solicitud, Visita, Actividad,
    UsuarioColegio, EncargadoSEEA, Voluntario, DisponibilidadVoluntario,
    AsignacionVoluntario, error, buscarPorId, textoValido, correoValido,
    usuarioPublico, colegioDTO, horarioDTO, solicitudDTO, actividadDTO,
    asignacionDTO, visitaDTO, requiereSesion, requiereRol
};

require("./routes/usuariosRoutes")(contextoRutas);
require("./routes/colegiosRoutes")(contextoRutas);
require("./routes/horariosRoutes")(contextoRutas);
require("./routes/solicitudesRoutes")(contextoRutas);
require("./routes/visitasRoutes")(contextoRutas);
require("./routes/actividadesRoutes")(contextoRutas);
require("./routes/voluntariosRoutes")(contextoRutas);

// ==========================================
// EXPORTACIONES
// ==========================================

module.exports = {
    router,
    publico: usuarioPublico,
    visitaDTO
};