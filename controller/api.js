
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

function error(res, codigo, mensaje) {
    return res.status(codigo).json({ mensaje });
}

function buscarPorId(lista, id) {
    return lista.find(
        elemento => elemento.getId() === Number(id)
    );
}

function textoValido(valor) {
    return typeof valor === "string" &&
           valor.trim().length > 0;
}

function correoValido(correo) {
    return typeof correo === "string" &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// ==========================================
// CONVERTIR OBJETOS A JSON
// ==========================================

function usuarioPublico(usuario) {
    const resultado = {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
    };

    if (usuario.rol === "COLEGIO") {
        resultado.idColegio = usuario.colegio.id;
        resultado.telefono = usuario.telefono;
    }

    if (usuario.rol === "VOLUNTARIO") {
        resultado.carnet = usuario.carnet;
        resultado.carrera = usuario.carrera;
    }

    if (usuario.rol === "SEEA") {
        resultado.puesto = usuario.puesto;
    }

    return resultado;
}

function colegioDTO(colegio) {
    return {
        id: colegio.id,
        nombre: colegio.nombre,
        direccion: colegio.direccion,
        telefono: colegio.telefono,
        correo: colegio.correo,
        aliado: colegio.aliado
    };
}

function horarioDTO(horario) {
    return {
        id: horario.id,
        fecha: horario.fecha,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin,
        disponible: horario.disponible
    };
}

function solicitudDTO(solicitud) {
    return {
        id: solicitud.id,
        colegio: colegioDTO(solicitud.colegio),
        horario: horarioDTO(solicitud.horario),
        cantidadEstudiantes: solicitud.cantidadEstudiantes,
        cantidadProfesores: solicitud.cantidadProfesores,
        grado: solicitud.grado,
        transporte: solicitud.transporte,
        solicitaTour: solicitud.solicitaTour,
        solicitaCharla: solicitud.solicitaCharla,
        solicitaTaller: solicitud.solicitaTaller,
        observaciones: solicitud.observaciones,
        estado: solicitud.estado
    };
}

function actividadDTO(actividad) {
    return {
        id: actividad.id,
        nombre: actividad.nombre,
        tipo: actividad.tipo,
        descripcion: actividad.descripcion,
        duracionMinutos: actividad.duracionMinutos,
        capacidadMaxima: actividad.capacidadMaxima
    };
}

function asignacionDTO(asignacion) {
    return {
        id: asignacion.id,
        idVisita: asignacion.visita.id,
        idVoluntario: asignacion.voluntario.id,
        nombreVoluntario: asignacion.voluntario.nombre,
        estado: asignacion.estado,
        fechaAsignacion: asignacion.fechaAsignacion
    };
}

function visitaDTO(visita) {
    return {
        id: visita.id,
        idSolicitud: visita.solicitud.id,
        colegio: visita.solicitud.colegio.nombre,
        horario: horarioDTO(visita.solicitud.horario),
        estado: visita.estado,

        actividades: visita.actividades.map(actividadDTO),
        asignaciones: visita.asignaciones.map(asignacionDTO),

        voluntariosNecesarios:
            visita.calcularVoluntariosNecesarios(),

        voluntariosConfirmados:
            visita.contarVoluntariosConfirmados()
    };
}

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

// ==========================================
// USUARIOS
// ==========================================

// Consultar usuarios
router.get(
    "/usuarios",
    requiereRol("SEEA"),
    (req, res) => {
        return res.json(
            datos.usuarios.map(usuarioPublico)
        );
    }
);

// Registrar usuario
router.post(
    "/usuarios",
    requiereRol("SEEA"),
    async (req, res, next) => {
        try {
            const {
                nombre,
                correo,
                contrasena,
                tipo,
                idColegio,
                telefono,
                carnet,
                carrera,
                puesto
            } = req.body || {};

            if (!textoValido(nombre) ||
                !correoValido(correo) ||
                typeof contrasena !== "string" ||
                contrasena.length < 8) {

                return error(
                    res,
                    400,
                    "Nombre, correo y contrasena validos requeridos"
                );
            }

            const existe = datos.usuarios.some(
                u => u.correo.toLowerCase() ===
                    correo.trim().toLowerCase()
            );

            if (existe) {
                return error(res, 409, "Correo ya registrado");
            }

            let usuario;

            const id = datos.generarId("usuario");

            const hash = await bcrypt.hash(contrasena, 12);

            if (tipo === "COLEGIO") {
                const colegio = buscarPorId(
                    datos.colegios,
                    idColegio
                );

                if (!colegio) {
                    return error(
                        res,
                        404,
                        "Colegio no encontrado"
                    );
                }

                usuario = new UsuarioColegio(
                    id,
                    nombre.trim(),
                    correo.trim().toLowerCase(),
                    hash,
                    telefono || "",
                    colegio
                );

            } else if (tipo === "VOLUNTARIO") {

                if (!textoValido(carnet)) {
                    return error(res, 400, "Carnet requerido");
                }

                usuario = new Voluntario(
                    id,
                    nombre.trim(),
                    correo.trim().toLowerCase(),
                    hash,
                    carnet,
                    carrera || ""
                );

            } else if (tipo === "SEEA") {

                usuario = new EncargadoSEEA(
                    id,
                    nombre.trim(),
                    correo.trim().toLowerCase(),
                    hash,
                    puesto || "Encargado"
                );

            } else {
                return error(res, 400, "Tipo de usuario invalido");
            }

            datos.usuarios.push(usuario);

            return res.status(201).json({
                mensaje: "Usuario registrado correctamente",
                usuario: usuarioPublico(usuario)
            });

        } catch (err) {
            next(err);
        }
    }
);

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

// Registrar colegio
router.post(
    "/colegios",
    requiereRol("SEEA"),
    (req, res) => {
        const {
            nombre,
            direccion = "",
            telefono = "",
            correo = "",
            aliado = false
        } = req.body || {};

        if (!textoValido(nombre) ||
            typeof aliado !== "boolean") {

            return error(
                res,
                400,
                "Nombre y estado de aliado invalidos"
            );
        }

        const duplicado = datos.colegios.some(
            c => c.nombre.toLowerCase() ===
                nombre.trim().toLowerCase()
        );

        if (duplicado) {
            return error(res, 409, "Colegio duplicado");
        }

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
            mensaje: "Colegio registrado",
            colegio: colegioDTO(colegio)
        });
    }
);

// Actualizar colegio
router.patch(
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

        const body = req.body || {};

        if (body.nombre !== undefined) {
            if (!textoValido(body.nombre)) {
                return error(res, 400, "Nombre invalido");
            }

            const duplicado = datos.colegios.some(
                c => c !== colegio &&
                    c.nombre.toLowerCase() ===
                    body.nombre.trim().toLowerCase()
            );

            if (duplicado) {
                return error(res, 409, "Nombre duplicado");
            }
        }

        if (body.aliado !== undefined &&
            typeof body.aliado !== "boolean") {

            return error(res, 400, "Aliado invalido");
        }

        const campos = [
            "nombre",
            "direccion",
            "telefono",
            "correo",
            "aliado"
        ];

        campos.forEach(campo => {
            if (body[campo] !== undefined) {
                colegio[campo] =
                    campo === "nombre"
                        ? body[campo].trim()
                        : body[campo];
            }
        });

        return res.json({
            mensaje: "Colegio actualizado",
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

        return res.json({
            mensaje: "Colegio eliminado"
        });
    }
);

// ==========================================
// HORARIOS
// ==========================================

// Consultar horarios
router.get("/horarios", (req, res) => {
    return res.json(
        datos.horarios.map(horarioDTO)
    );
});

// Consultar horarios disponibles
router.get("/horarios/disponibles", (req, res) => {
    return res.json(
        datos.horarios
            .filter(h => h.estaDisponible())
            .map(horarioDTO)
    );
});

// Crear horario
router.post(
    "/horarios",
    requiereRol("SEEA"),
    (req, res) => {
        try {
            const {
                fecha,
                horaInicio,
                horaFin
            } = req.body || {};

            const horario = new Horario(
                datos.generarId("horario"),
                fecha,
                horaInicio,
                horaFin
            );

            const conflicto = datos.horarios.some(
                h => h.seTraslapaCon(horario)
            );

            if (conflicto) {
                return error(
                    res,
                    409,
                    "El horario se traslapa con otro"
                );
            }

            datos.horarios.push(horario);

            return res.status(201).json({
                mensaje: "Horario creado",
                horario: horarioDTO(horario)
            });

        } catch (err) {
            return error(res, 400, err.message);
        }
    }
);

// Eliminar horario
router.delete(
    "/horarios/:id",
    requiereRol("SEEA"),
    (req, res) => {
        const horario = buscarPorId(
            datos.horarios,
            req.params.id
        );

        if (!horario) {
            return error(res, 404, "Horario no encontrado");
        }

        const tieneSolicitudes = datos.solicitudes.some(
            s => s.horario === horario
        );

        if (!horario.estaDisponible() || tieneSolicitudes) {
            return error(
                res,
                409,
                "Horario ocupado o asociado a solicitudes"
            );
        }

        datos.horarios.splice(
            datos.horarios.indexOf(horario),
            1
        );

        return res.json({
            mensaje: "Horario eliminado"
        });
    }
);

// ==========================================
// SOLICITUDES
// ==========================================

// Consultar solicitudes
router.get(
    "/solicitudes",
    requiereRol("SEEA", "COLEGIO"),
    (req, res) => {
        const solicitudes = datos.solicitudes.filter(
            s => req.usuario.rol === "SEEA" ||
                s.colegio === req.usuario.colegio
        );

        return res.json(
            solicitudes.map(solicitudDTO)
        );
    }
);

// Crear solicitud
router.post(
    "/solicitudes",
    requiereRol("SEEA", "COLEGIO"),
    (req, res) => {
        try {
            const body = req.body || {};

            const colegio =
                req.usuario.rol === "COLEGIO"
                    ? req.usuario.colegio
                    : buscarPorId(datos.colegios, body.idColegio);

            const horario = buscarPorId(
                datos.horarios,
                body.idHorario
            );

            if (!colegio || !horario) {
                return error(
                    res,
                    404,
                    "Colegio u horario no encontrado"
                );
            }

            if (!horario.estaDisponible()) {
                return error(res, 409, "Horario ocupado");
            }

            const solicitud = new Solicitud(
                datos.generarId("solicitud"),
                colegio,
                horario,
                body.cantidadEstudiantes,
                body.cantidadProfesores,
                body.grado,
                body.transporte,
                body.solicitaTour,
                body.solicitaCharla,
                body.solicitaTaller,
                body.observaciones || ""
            );

            datos.solicitudes.push(solicitud);

            return res.status(201).json({
                mensaje: "Solicitud enviada a SEEA",
                solicitud: solicitudDTO(solicitud)
            });

        } catch (err) {
            return error(res, 400, err.message);
        }
    }
);

// Aprobar solicitud
router.patch(
    "/solicitudes/:id/aprobar",
    requiereRol("SEEA"),
    (req, res) => {
        const solicitud = buscarPorId(
            datos.solicitudes,
            req.params.id
        );

        if (!solicitud) {
            return error(res, 404, "Solicitud no encontrada");
        }

        const ocupados = datos.solicitudes
            .filter(s => s !== solicitud && s.estaAprobada())
            .map(s => s.horario);

        if (!solicitud.aprobar(ocupados)) {
            return error(
                res,
                409,
                "No se pudo aprobar la solicitud"
            );
        }

        return res.json({
            mensaje: "Solicitud aprobada",
            solicitud: solicitudDTO(solicitud)
        });
    }
);

// Rechazar solicitud
router.patch(
    "/solicitudes/:id/rechazar",
    requiereRol("SEEA"),
    (req, res) => {
        const solicitud = buscarPorId(
            datos.solicitudes,
            req.params.id
        );

        if (!solicitud) {
            return error(res, 404, "Solicitud no encontrada");
        }

        if (!solicitud.rechazar()) {
            return error(res, 409, "No se puede rechazar");
        }

        return res.json({
            mensaje: "Solicitud rechazada",
            solicitud: solicitudDTO(solicitud)
        });
    }
);

// Cancelar solicitud
router.patch(
    "/solicitudes/:id/cancelar",
    requiereRol("SEEA", "COLEGIO"),
    (req, res) => {
        const solicitud = buscarPorId(
            datos.solicitudes,
            req.params.id
        );

        if (!solicitud) {
            return error(res, 404, "Solicitud no encontrada");
        }

        if (req.usuario.rol === "COLEGIO" &&
            solicitud.colegio !== req.usuario.colegio) {

            return error(res, 403, "Solicitud ajena");
        }

        const visita = datos.visitas.find(
            v => v.solicitud === solicitud
        );

        if (visita &&
            !["PROGRAMADA", "CANCELADA"].includes(visita.estado)) {

            return error(
                res,
                409,
                "La visita ya inicio o finalizo"
            );
        }

        if (!solicitud.cancelar()) {
            return error(res, 409, "No se puede cancelar");
        }

        if (visita && visita.estado === "PROGRAMADA") {
            visita.cancelar();
        }

        return res.json({
            mensaje: "Solicitud cancelada",
            solicitud: solicitudDTO(solicitud)
        });
    }
);

// Reagendar solicitud
router.patch(
    "/solicitudes/:id/reagendar",
    requiereRol("SEEA", "COLEGIO"),
    (req, res) => {
        const solicitud = buscarPorId(
            datos.solicitudes,
            req.params.id
        );

        if (!solicitud) {
            return error(res, 404, "Solicitud no encontrada");
        }

        if (req.usuario.rol === "COLEGIO" &&
            solicitud.colegio !== req.usuario.colegio) {

            return error(res, 403, "Solicitud ajena");
        }

        const tieneVisita = datos.visitas.some(
            v => v.solicitud === solicitud
        );

        if (tieneVisita) {
            return error(
                res,
                409,
                "La visita ya esta programada"
            );
        }

        const nuevoHorario = buscarPorId(
            datos.horarios,
            req.body?.idHorario
        );

        if (!nuevoHorario) {
            return error(res, 404, "Horario no encontrado");
        }

        const ocupados = datos.solicitudes
            .filter(s => s !== solicitud && s.estaAprobada())
            .map(s => s.horario);

        if (!solicitud.cambiarHorario(nuevoHorario, ocupados)) {
            return error(res, 409, "No se puede reagendar");
        }

        return res.json({
            mensaje: "Horario actualizado",
            solicitud: solicitudDTO(solicitud)
        });
    }
);

// Eliminar solicitud
router.delete(
    "/solicitudes/:id",
    requiereRol("SEEA"),
    (req, res) => {
        const solicitud = buscarPorId(
            datos.solicitudes,
            req.params.id
        );

        if (!solicitud) {
            return error(res, 404, "Solicitud no encontrada");
        }

        const tieneVisita = datos.visitas.some(
            v => v.solicitud === solicitud
        );

        if (solicitud.estaAprobada() || tieneVisita) {
            return error(
                res,
                409,
                "No se puede eliminar esta solicitud"
            );
        }

        datos.solicitudes.splice(
            datos.solicitudes.indexOf(solicitud),
            1
        );

        return res.json({
            mensaje: "Solicitud eliminada"
        });
    }
);

// ==========================================
// VISITAS
// ==========================================

// Consultar visitas
router.get("/visitas", (req, res) => {
    const visitas = datos.visitas.filter(visita => {

        if (req.usuario.rol === "SEEA") {
            return true;
        }

        if (req.usuario.rol === "COLEGIO") {
            return visita.solicitud.colegio ===
                req.usuario.colegio;
        }

        return visita.estado === "PROGRAMADA" ||
            visita.asignaciones.some(
                a => a.voluntario === req.usuario
            );
    });

    return res.json(visitas.map(visitaDTO));
});

// Crear visita
router.post(
    "/visitas",
    requiereRol("SEEA"),
    (req, res) => {
        const solicitud = buscarPorId(
            datos.solicitudes,
            req.body?.idSolicitud
        );

        if (!solicitud) {
            return error(res, 404, "Solicitud no encontrada");
        }

        const duplicada = datos.visitas.some(
            v => v.solicitud === solicitud
        );

        if (!solicitud.estaAprobada() || duplicada) {
            return error(
                res,
                409,
                "Solicitud no aprobada o visita duplicada"
            );
        }

        const visita = new Visita(
            datos.generarId("visita"),
            solicitud
        );

        datos.visitas.push(visita);

        return res.status(201).json({
            mensaje: "Visita programada",
            visita: visitaDTO(visita)
        });
    }
);

// Iniciar visita
router.patch(
    "/visitas/:id/iniciar",
    requiereRol("SEEA"),
    (req, res) => {
        const visita = buscarPorId(
            datos.visitas,
            req.params.id
        );

        if (!visita) {
            return error(res, 404, "Visita no encontrada");
        }

        if (!visita.iniciar()) {
            return error(res, 409, "Estado incompatible");
        }

        return res.json({
            mensaje: "Visita iniciada",
            visita: visitaDTO(visita)
        });
    }
);

// Finalizar visita
router.patch(
    "/visitas/:id/finalizar",
    requiereRol("SEEA"),
    (req, res) => {
        const visita = buscarPorId(
            datos.visitas,
            req.params.id
        );

        if (!visita) {
            return error(res, 404, "Visita no encontrada");
        }

        if (!visita.finalizar()) {
            return error(res, 409, "Estado incompatible");
        }

        return res.json({
            mensaje: "Visita finalizada",
            visita: visitaDTO(visita)
        });
    }
);

// ==========================================
// ACTIVIDADES
// ==========================================

// Consultar actividades
router.get("/actividades", (req, res) => {
    return res.json(
        datos.actividades.map(actividadDTO)
    );
});

// Crear actividad
router.post(
    "/actividades",
    requiereRol("SEEA"),
    (req, res) => {
        try {
            const body = req.body || {};

            if (!textoValido(body.nombre)) {
                return error(res, 400, "Nombre requerido");
            }

            const actividad = new Actividad(
                datos.generarId("actividad"),
                body.nombre,
                body.tipo,
                body.descripcion || "",
                body.duracionMinutos,
                body.capacidadMaxima
            );

            datos.actividades.push(actividad);

            return res.status(201).json({
                mensaje: "Actividad registrada",
                actividad: actividadDTO(actividad)
            });

        } catch (err) {
            return error(res, 400, err.message);
        }
    }
);

// Agregar actividad a visita
router.post(
    "/visitas/:id/actividades",
    requiereRol("SEEA"),
    (req, res) => {
        const visita = buscarPorId(
            datos.visitas,
            req.params.id
        );

        const actividad = buscarPorId(
            datos.actividades,
            req.body?.idActividad
        );

        if (!visita || !actividad) {
            return error(
                res,
                404,
                "Visita o actividad no encontrada"
            );
        }

        const solicitud = visita.solicitud;

        const permitida =
            (actividad.tipo === "TOUR" &&
                solicitud.solicitaTour) ||

            (actividad.tipo === "CHARLA" &&
                solicitud.solicitaCharla) ||

            (actividad.tipo === "TALLER" &&
                solicitud.solicitaTaller);

        if (!permitida) {
            return error(
                res,
                409,
                "Actividad no solicitada"
            );
        }

        if (!actividad.tieneCapacidad(
            solicitud.cantidadEstudiantes
        )) {
            return error(
                res,
                409,
                "Capacidad insuficiente"
            );
        }

        if (!visita.agregarActividad(actividad)) {
            return error(
                res,
                409,
                "Actividad duplicada o visita cerrada"
            );
        }

        return res.json({
            mensaje: "Actividad agregada",
            visita: visitaDTO(visita)
        });
    }
);

// ==========================================
// VOLUNTARIOS
// ==========================================

// Consultar voluntarios
router.get(
    "/voluntarios",
    requiereRol("SEEA"),
    (req, res) => {
        return res.json(
            datos.usuarios
                .filter(u => u.rol === "VOLUNTARIO")
                .map(usuarioPublico)
        );
    }
);

// Consultar disponibilidad propia
router.get(
    "/disponibilidades",
    requiereRol("VOLUNTARIO"),
    (req, res) => {
        return res.json(
            req.usuario.getDisponibilidades()
        );
    }
);

// Registrar disponibilidad
router.post(
    "/disponibilidades",
    requiereRol("VOLUNTARIO"),
    (req, res) => {
        try {
            const body = req.body || {};

            const disponibilidad =
                new DisponibilidadVoluntario(
                    datos.generarId("disponibilidad"),
                    body.fecha,
                    body.horaInicio,
                    body.horaFin
                );

            if (!req.usuario.agregarDisponibilidad(
                disponibilidad
            )) {
                return error(
                    res,
                    409,
                    "Disponibilidad duplicada"
                );
            }

            return res.status(201).json({
                mensaje: "Disponibilidad registrada",
                disponibilidad
            });

        } catch (err) {
            return error(res, 400, err.message);
        }
    }
);

// ==========================================
// ASIGNACIONES
// ==========================================

// Consultar asignaciones
router.get(
    "/asignaciones",
    requiereRol("SEEA", "VOLUNTARIO"),
    (req, res) => {
        const asignaciones = datos.asignaciones.filter(
            a => req.usuario.rol === "SEEA" ||
                a.voluntario === req.usuario
        );

        return res.json(
            asignaciones.map(asignacionDTO)
        );
    }
);

// Inscribir voluntario
router.post(
    "/asignaciones",
    requiereRol("SEEA", "VOLUNTARIO"),
    (req, res) => {
        const visita = buscarPorId(
            datos.visitas,
            req.body?.idVisita
        );

        const voluntario =
            req.usuario.rol === "VOLUNTARIO"
                ? req.usuario
                : buscarPorId(
                    datos.usuarios,
                    req.body?.idVoluntario
                );

        if (!visita || !voluntario ||
            voluntario.rol !== "VOLUNTARIO") {

            return error(
                res,
                404,
                "Visita o voluntario no encontrado"
            );
        }

        if (!voluntario.puedeInscribirse(visita)) {
            return error(
                res,
                409,
                "Voluntario no disponible o ya inscrito"
            );
        }

        const horario = visita.solicitud.horario;

        const conflicto = datos.asignaciones.some(a =>
            a.voluntario === voluntario &&
            a.estaActiva() &&
            a.visita.estado === "PROGRAMADA" &&
            a.visita.solicitud.horario.seTraslapaCon(horario)
        );

        if (conflicto) {
            return error(
                res,
                409,
                "Conflicto con otra visita"
            );
        }

        const asignacion = new AsignacionVoluntario(
            datos.generarId("asignacion"),
            voluntario,
            visita,
            new Date().toISOString()
        );

        if (!visita.agregarAsignacion(asignacion)) {
            return error(
                res,
                409,
                "No se pudo crear la asignacion"
            );
        }

        datos.asignaciones.push(asignacion);

        return res.status(201).json({
            mensaje: "Asignacion confirmada",
            asignacion: asignacionDTO(asignacion)
        });
    }
);

// Cancelar asignacion
router.patch(
    "/asignaciones/:id/cancelar",
    requiereRol("SEEA", "VOLUNTARIO"),
    (req, res) => {
        const asignacion = buscarPorId(
            datos.asignaciones,
            req.params.id
        );

        if (!asignacion) {
            return error(
                res,
                404,
                "Asignacion no encontrada"
            );
        }

        if (req.usuario.rol === "VOLUNTARIO" &&
            asignacion.voluntario !== req.usuario) {

            return error(res, 403, "Asignacion ajena");
        }

        if (asignacion.visita.estado !== "PROGRAMADA" ||
            !asignacion.cancelar()) {

            return error(
                res,
                409,
                "No se puede cancelar"
            );
        }

        return res.json({
            mensaje: "Asignacion cancelada",
            asignacion: asignacionDTO(asignacion)
        });
    }
);

// ==========================================
// EXPORTACIONES
// ==========================================

module.exports = {
    router,
    publico: usuarioPublico,
    visitaDTO
};
