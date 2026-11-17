"use strict";

const { obtenerDb } = require("./db");

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function ejecutar(sql, ...valores) {
    return obtenerDb()
        .prepare(sql)
        .run(...valores);
}

function booleano(valor) {
    return valor ? 1 : 0;
}

// ==========================================
// COLEGIOS
// ==========================================

function guardarColegio(colegio) {

    ejecutar(
        `INSERT INTO colegios (
            id, nombre, direccion, telefono, correo, aliado
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            nombre = excluded.nombre,
            direccion = excluded.direccion,
            telefono = excluded.telefono,
            correo = excluded.correo,
            aliado = excluded.aliado`,
        colegio.id,
        colegio.nombre,
        colegio.direccion || "",
        colegio.telefono || "",
        colegio.correo || "",
        booleano(colegio.aliado)
    );
}

function eliminarColegio(id) {
    ejecutar("DELETE FROM colegios WHERE id = ?", id);
}

// ==========================================
// USUARIOS
// ==========================================

function guardarUsuario(usuario) {

    const esSeea = usuario.rol === "SEEA";
    const esColegio = usuario.rol === "COLEGIO";
    const esVoluntario = usuario.rol === "VOLUNTARIO";

    ejecutar(
        `INSERT INTO usuarios (
            id, nombre, correo, contrasena, rol, puesto,
            telefono, colegio_id, rol_colegio, otro_rol_colegio,
            carnet, carrera
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            nombre = excluded.nombre,
            correo = excluded.correo,
            contrasena = excluded.contrasena,
            rol = excluded.rol,
            puesto = excluded.puesto,
            telefono = excluded.telefono,
            colegio_id = excluded.colegio_id,
            rol_colegio = excluded.rol_colegio,
            otro_rol_colegio = excluded.otro_rol_colegio,
            carnet = excluded.carnet,
            carrera = excluded.carrera`,
        usuario.id,
        usuario.nombre,
        usuario.correo,
        usuario.contrasena,
        usuario.rol,
        esSeea ? (usuario.puesto || "Encargado") : null,
        esColegio ? (usuario.telefono || "") : null,
        esColegio && usuario.colegio ? usuario.colegio.id : null,
        esColegio && typeof usuario.getRolColegio === "function"
            ? usuario.getRolColegio()
            : null,
        esColegio && typeof usuario.getOtroRolColegio === "function"
            ? usuario.getOtroRolColegio()
            : null,
        esVoluntario ? usuario.carnet : null,
        esVoluntario ? usuario.carrera : null
    );
}

function eliminarUsuario(id) {
    ejecutar("DELETE FROM usuarios WHERE id = ?", id);
}

// ==========================================
// HORARIOS
// ==========================================

function guardarHorario(horario) {

    ejecutar(
        `INSERT INTO horarios (
            id, fecha, hora_inicio, hora_fin, disponible
        ) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            fecha = excluded.fecha,
            hora_inicio = excluded.hora_inicio,
            hora_fin = excluded.hora_fin,
            disponible = excluded.disponible`,
        horario.id,
        horario.fecha,
        horario.horaInicio,
        horario.horaFin,
        booleano(horario.disponible)
    );
}

function eliminarHorario(id) {
    ejecutar("DELETE FROM horarios WHERE id = ?", id);
}

// ==========================================
// SOLICITUDES
// ==========================================

function guardarSolicitud(solicitud) {

    ejecutar(
        `INSERT INTO solicitudes (
            id, colegio_id, horario_id,
            cantidad_estudiantes, cantidad_profesores,
            grado, transporte,
            solicita_tour, solicita_charla, solicita_taller,
            observaciones, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            colegio_id = excluded.colegio_id,
            horario_id = excluded.horario_id,
            cantidad_estudiantes = excluded.cantidad_estudiantes,
            cantidad_profesores = excluded.cantidad_profesores,
            grado = excluded.grado,
            transporte = excluded.transporte,
            solicita_tour = excluded.solicita_tour,
            solicita_charla = excluded.solicita_charla,
            solicita_taller = excluded.solicita_taller,
            observaciones = excluded.observaciones,
            estado = excluded.estado`,
        solicitud.id,
        solicitud.colegio.id,
        solicitud.horario.id,
        solicitud.cantidadEstudiantes,
        solicitud.cantidadProfesores,
        solicitud.grado || "",
        solicitud.transporte || "",
        booleano(solicitud.solicitaTour),
        booleano(solicitud.solicitaCharla),
        booleano(solicitud.solicitaTaller),
        solicitud.observaciones || "",
        solicitud.estado
    );
}

function eliminarSolicitud(id) {
    ejecutar("DELETE FROM solicitudes WHERE id = ?", id);
}

// ==========================================
// VISITAS
// ==========================================

function guardarVisita(visita) {

    ejecutar(
        `INSERT INTO visitas (
            id, solicitud_id, estado, observaciones
        ) VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            solicitud_id = excluded.solicitud_id,
            estado = excluded.estado,
            observaciones = excluded.observaciones`,
        visita.id,
        visita.solicitud.id,
        visita.estado,
        visita.observaciones || ""
    );
}

// ==========================================
// ACTIVIDADES
// ==========================================

function guardarActividad(actividad) {

    ejecutar(
        `INSERT INTO actividades (
            id, nombre, tipo, descripcion,
            duracion_minutos, capacidad_maxima
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            nombre = excluded.nombre,
            tipo = excluded.tipo,
            descripcion = excluded.descripcion,
            duracion_minutos = excluded.duracion_minutos,
            capacidad_maxima = excluded.capacidad_maxima`,
        actividad.id,
        actividad.nombre,
        actividad.tipo,
        actividad.descripcion || "",
        actividad.duracionMinutos,
        actividad.capacidadMaxima
    );
}

function agregarActividadVisita(idVisita, idActividad) {

    ejecutar(
        `INSERT OR IGNORE INTO visita_actividades (
            visita_id, actividad_id
        ) VALUES (?, ?)`,
        idVisita,
        idActividad
    );
}

// ==========================================
// DISPONIBILIDADES
// ==========================================

function guardarDisponibilidad(idVoluntario, disponibilidad) {

    ejecutar(
        `INSERT INTO disponibilidades (
            id, voluntario_id, fecha, hora_inicio, hora_fin
        ) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            voluntario_id = excluded.voluntario_id,
            fecha = excluded.fecha,
            hora_inicio = excluded.hora_inicio,
            hora_fin = excluded.hora_fin`,
        disponibilidad.id,
        idVoluntario,
        disponibilidad.fecha,
        disponibilidad.horaInicio,
        disponibilidad.horaFin
    );
}

// ==========================================
// ASIGNACIONES
// ==========================================

function guardarAsignacion(asignacion) {

    ejecutar(
        `INSERT INTO asignaciones (
            id, voluntario_id, visita_id,
            fecha_asignacion, estado
        ) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            voluntario_id = excluded.voluntario_id,
            visita_id = excluded.visita_id,
            fecha_asignacion = excluded.fecha_asignacion,
            estado = excluded.estado`,
        asignacion.id,
        asignacion.voluntario.id,
        asignacion.visita.id,
        asignacion.fechaAsignacion,
        asignacion.estado
    );
}

module.exports = {
    guardarColegio,
    eliminarColegio,
    guardarUsuario,
    eliminarUsuario,
    guardarHorario,
    eliminarHorario,
    guardarSolicitud,
    eliminarSolicitud,
    guardarVisita,
    guardarActividad,
    agregarActividadVisita,
    guardarDisponibilidad,
    guardarAsignacion
};
