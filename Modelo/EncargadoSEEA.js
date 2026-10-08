
const Usuario = require("./Usuario");

class EncargadoSEEA extends Usuario {

    constructor(id, nombre, correo, contrasena, puesto) {

        // Constructor de Usuario
        super(id, nombre, correo, contrasena);

        // Atributo propio de EncargadoSEEA
        this.puesto = puesto;
    }


    // =========================
    // GETTERS
    // =========================

    getPuesto() {
        return this.puesto;
    }


    // =========================
    // SETTERS
    // =========================

    setPuesto(puesto) {
        this.puesto = puesto;
    }


    // =========================
    // GESTIÓN DE SOLICITUDES
    // =========================

    aprobarSolicitud(solicitud) {

        if (solicitud == null) {
            return false;
        }

        return solicitud.aprobar();
    }


    rechazarSolicitud(solicitud) {

        if (solicitud == null) {
            return false;
        }

        return solicitud.rechazar();
    }


    cancelarSolicitud(solicitud) {

        if (solicitud == null) {
            return false;
        }

        return solicitud.cancelar();
    }


    // =========================
    // GESTIÓN DE HORARIOS
    // =========================

    habilitarHorario(horario) {

        if (horario == null) {
            return false;
        }

        return horario.liberar();
    }


    bloquearHorario(horario) {

        if (horario == null) {
            return false;
        }

        return horario.reservar();
    }


    // =========================
    // GESTIÓN DE VISITAS
    // =========================

    crearVisita(idVisita, solicitud) {

        if (solicitud == null) {
            return null;
        }

        const Visita = require("../Visita");

        return new Visita(
            idVisita,
            solicitud
        );
    }


    // =========================
    // TO STRING
    // =========================

    toString() {

        return `Encargado SEEA:
ID: ${this.id}
Nombre: ${this.nombre}
Correo: ${this.correo}
Puesto: ${this.puesto}`;
    }
}

module.exports = EncargadoSEEA;