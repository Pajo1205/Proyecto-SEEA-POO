"use strict";

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


module.exports = { usuarioPublico, colegioDTO, horarioDTO, solicitudDTO, actividadDTO, asignacionDTO, visitaDTO };
