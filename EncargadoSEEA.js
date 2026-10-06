
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

        solicitud.aprobar();

        return true;
    }


    rechazarSolicitud(solicitud) {

        if (solicitud == null) {
            return false;
        }

        solicitud.rechazar();

        return true;
    }


    cancelarSolicitud(solicitud) {

        if (solicitud == null) {
            return false;
        }

        solicitud.cancelar();

        return true;
    }


    // =========================
    // GESTIÓN DE HORARIOS
    // =========================

    habilitarHorario(horario) {

        if (horario == null) {
            return false;
        }

        horario.liberar();

        return true;
    }


    bloquearHorario(horario) {

        if (horario == null) {
            return false;
        }

        horario.reservar();

        return true;
    }


    // =========================
    // GESTIÓN DE VISITAS
    // =========================

    crearVisita(idVisita, solicitud) {

        if (solicitud == null) {
            return null;
        }

        const Visita = require("./Visita");

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