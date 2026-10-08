const Usuario = require("./Usuario");

class Voluntario extends Usuario {

    constructor(id, nombre, correo, contrasena, carnet, carrera) {
        super(id, nombre, correo, contrasena);

        this.carnet = carnet;
        this.carrera = carrera;
        this.disponibilidades = [];
    }

    // GETTERS

    getCarnet() {
        return this.carnet;
    }

    getCarrera() {
        return this.carrera;
    }

    getDisponibilidades() {
        return this.disponibilidades;
    }

    // SETTERS

    setCarnet(carnet) {
        this.carnet = carnet;
    }

    setCarrera(carrera) {
        this.carrera = carrera;
    }

    // DISPONIBILIDAD

    agregarDisponibilidad(disponibilidad) {
        if (disponibilidad == null) {
            return false;
        }

        if (this.disponibilidades.includes(disponibilidad)) {
            return false;
        }

        this.disponibilidades.push(disponibilidad);
        return true;
    }

    eliminarDisponibilidad(disponibilidad) {
        const posicion = this.disponibilidades.indexOf(disponibilidad);

        if (posicion === -1) {
            return false;
        }

        this.disponibilidades.splice(posicion, 1);
        return true;
    }

    estaDisponible(horario) {
        if (horario == null) {
            return false;
        }

        return this.disponibilidades.some(
            disponibilidad => disponibilidad.coincideCon(horario)
        );
    }

    // VISITAS

    puedeInscribirse(visita) {
        if (visita == null) {
            return false;
        }

        if (visita.getEstado() !== "PROGRAMADA") {
            return false;
        }

        const horario = visita.getSolicitud().getHorario();

        if (!this.estaDisponible(horario)) {
            return false;
        }

        // Verificar que no esté inscrito actualmente
        const yaInscrito = visita.getAsignaciones().some(
            asignacion =>
                asignacion.getVoluntario().getId() === this.id &&
                asignacion.getEstado() === "CONFIRMADA"
        );

        return !yaInscrito;
    }

    cancelarParticipacion(asignacion) {
        if (asignacion == null) {
            return false;
        }

        if (asignacion.getVoluntario().getId() !== this.id) {
            return false;
        }

        return asignacion.cancelar();
    }

    // TO STRING

    toString() {
        return `Voluntario:
ID: ${this.id}
Nombre: ${this.nombre}
Correo: ${this.correo}
Carnet: ${this.carnet}
Carrera: ${this.carrera}`;
    }
}

module.exports = Voluntario;