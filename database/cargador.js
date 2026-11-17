"use strict";

const { obtenerDb } = require("./db");

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

const RolesColegio = require("../Modelo/RolesColegio");

// ==========================================
// HIDRATACION DE REGISTROS SQL
// ==========================================

function crearUsuario(fila, colegios) {

    if (fila.rol === "SEEA") {
        return new EncargadoSEEA(
            fila.id,
            fila.nombre,
            fila.correo,
            fila.contrasena,
            fila.puesto || "Encargado"
        );
    }

    if (fila.rol === "COLEGIO") {

        const colegio = colegios.get(fila.colegio_id);

        if (!colegio) {
            throw new Error(
                `El usuario ${fila.id} referencia un colegio inexistente`
            );
        }

        return new UsuarioColegio(
            fila.id,
            fila.nombre,
            fila.correo,
            fila.contrasena,
            fila.telefono || "",
            colegio,
            fila.rol_colegio || RolesColegio.OTRO,
            fila.otro_rol_colegio || "No especificado"
        );
    }

    if (fila.rol === "VOLUNTARIO") {
        return new Voluntario(
            fila.id,
            fila.nombre,
            fila.correo,
            fila.contrasena,
            fila.carnet || "",
            fila.carrera || ""
        );
    }

    throw new Error(`Rol de usuario desconocido: ${fila.rol}`);
}

// Las visitas y asignaciones pueden estar canceladas, por lo que
// no siempre cumplen las validaciones del constructor. Se hidratan
// directamente desde SQL para conservar el historial.
function crearVisita(fila, solicitudes) {

    const solicitud = solicitudes.get(fila.solicitud_id);

    if (!solicitud) {
        throw new Error(
            `La visita ${fila.id} referencia una solicitud inexistente`
        );
    }

    const visita = Object.create(Visita.prototype);

    visita.id = fila.id;
    visita.solicitud = solicitud;
    visita.actividades = [];
    visita.asignaciones = [];
    visita.estado = fila.estado;
    visita.observaciones = fila.observaciones || "";

    return visita;
}

function crearAsignacion(fila, usuarios, visitas) {

    const voluntario = usuarios.get(fila.voluntario_id);
    const visita = visitas.get(fila.visita_id);

    if (!voluntario || !visita) {
        throw new Error(
            `La asignacion ${fila.id} referencia datos inexistentes`
        );
    }

    const asignacion = Object.create(
        AsignacionVoluntario.prototype
    );

    asignacion.id = fila.id;
    asignacion.voluntario = voluntario;
    asignacion.visita = visita;
    asignacion.fechaAsignacion = fila.fecha_asignacion;
    asignacion.estado = fila.estado;

    return asignacion;
}

// ==========================================
// CARGA COMPLETA EN MEMORIA
// ==========================================

function cargarDatos(datos) {

    const db = obtenerDb();

    // Vaciar los arreglos conservando la misma referencia.
    for (const lista of [
        datos.colegios,
        datos.usuarios,
        datos.horarios,
        datos.solicitudes,
        datos.visitas,
        datos.actividades,
        datos.asignaciones
    ]) {
        lista.length = 0;
    }

    const colegios = new Map();

    const filasColegios = db.prepare(
        "SELECT * FROM colegios ORDER BY id"
    ).all();

    for (const fila of filasColegios) {

        const colegio = new Colegio(
            fila.id,
            fila.nombre,
            fila.direccion,
            fila.telefono,
            fila.correo,
            Boolean(fila.aliado)
        );

        colegios.set(colegio.id, colegio);
        datos.colegios.push(colegio);
    }

    const usuarios = new Map();

    const filasUsuarios = db.prepare(
        "SELECT * FROM usuarios ORDER BY id"
    ).all();

    for (const fila of filasUsuarios) {

        const usuario = crearUsuario(fila, colegios);

        usuarios.set(usuario.id, usuario);
        datos.usuarios.push(usuario);
    }

    const horarios = new Map();

    const filasHorarios = db.prepare(
        "SELECT * FROM horarios ORDER BY id"
    ).all();

    for (const fila of filasHorarios) {

        const horario = new Horario(
            fila.id,
            fila.fecha,
            fila.hora_inicio,
            fila.hora_fin
        );

        horario.disponible = Boolean(fila.disponible);

        horarios.set(horario.id, horario);
        datos.horarios.push(horario);
    }

    const solicitudes = new Map();

    const filasSolicitudes = db.prepare(
        "SELECT * FROM solicitudes ORDER BY id"
    ).all();

    for (const fila of filasSolicitudes) {

        const colegio = colegios.get(fila.colegio_id);
        const horario = horarios.get(fila.horario_id);

        if (!colegio || !horario) {
            throw new Error(
                `La solicitud ${fila.id} referencia datos inexistentes`
            );
        }

        const solicitud = new Solicitud(
            fila.id,
            colegio,
            horario,
            fila.cantidad_estudiantes,
            fila.cantidad_profesores,
            fila.grado,
            fila.transporte,
            Boolean(fila.solicita_tour),
            Boolean(fila.solicita_charla),
            Boolean(fila.solicita_taller),
            fila.observaciones
        );

        solicitud.estado = fila.estado;

        solicitudes.set(solicitud.id, solicitud);
        datos.solicitudes.push(solicitud);
    }

    const visitas = new Map();

    const filasVisitas = db.prepare(
        "SELECT * FROM visitas ORDER BY id"
    ).all();

    for (const fila of filasVisitas) {

        const visita = crearVisita(fila, solicitudes);

        visitas.set(visita.id, visita);
        datos.visitas.push(visita);
    }

    const actividades = new Map();

    const filasActividades = db.prepare(
        "SELECT * FROM actividades ORDER BY id"
    ).all();

    for (const fila of filasActividades) {

        const actividad = new Actividad(
            fila.id,
            fila.nombre,
            fila.tipo,
            fila.descripcion,
            fila.duracion_minutos,
            fila.capacidad_maxima
        );

        actividades.set(actividad.id, actividad);
        datos.actividades.push(actividad);
    }

    const filasVisitaActividades = db.prepare(
        "SELECT * FROM visita_actividades"
    ).all();

    for (const fila of filasVisitaActividades) {

        const visita = visitas.get(fila.visita_id);
        const actividad = actividades.get(fila.actividad_id);

        if (visita && actividad) {
            visita.actividades.push(actividad);
        }
    }

    const filasDisponibilidades = db.prepare(
        "SELECT * FROM disponibilidades ORDER BY id"
    ).all();

    for (const fila of filasDisponibilidades) {

        const voluntario = usuarios.get(fila.voluntario_id);

        if (!voluntario ||
            voluntario.rol !== "VOLUNTARIO") {
            continue;
        }

        const disponibilidad = new DisponibilidadVoluntario(
            fila.id,
            fila.fecha,
            fila.hora_inicio,
            fila.hora_fin
        );

        voluntario.disponibilidades.push(disponibilidad);
    }

    const filasAsignaciones = db.prepare(
        "SELECT * FROM asignaciones ORDER BY id"
    ).all();

    for (const fila of filasAsignaciones) {

        const asignacion = crearAsignacion(
            fila,
            usuarios,
            visitas
        );

        asignacion.visita.asignaciones.push(asignacion);
        datos.asignaciones.push(asignacion);
    }

    datos.sincronizarContadores();
}

module.exports = { cargarDatos };
