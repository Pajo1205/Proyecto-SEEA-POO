const Usuario = require("./Modelo/Usuario");

class Voluntario extends Usuario {

    constructor(
        id,
        nombre,
        correo,
        contrasena,
        carnet,
        carrera
    ) {

        // Atributos heredados de Usuario
        super(id, nombre, correo, contrasena);

        // Atributos propios
        this.carnet = carnet;
        this.carrera = carrera;

        // Disponibilidades del voluntario
        this.disponibilidades = [];
    }


    // =========================
    // GETTERS
    // =========================

    getCarnet() {
        return this.carnet;
    }

    getCarrera() {
        return this.carrera;
    }

    getDisponibilidades() {
        return this.disponibilidades;
    }


    // =========================
    // SETTERS
    // =========================

    setCarnet(carnet) {
        this.carnet = carnet;
    }

    setCarrera(carrera) {
        this.carrera = carrera;
    }


    // =========================
    // DISPONIBILIDAD
    // =========================

    agregarDisponibilidad(disponibilidad) {

        if (disponibilidad == null) {
            return false;
        }

        this.disponibilidades.push(disponibilidad);

        return true;
    }


    eliminarDisponibilidad(disponibilidad) {

        const posicion =
            this.disponibilidades.indexOf(disponibilidad);

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
            disponibilidad =>
                disponibilidad.coincideCon(horario)
        );
    }


    // =========================
    // VISITAS
    // =========================

    inscribirseVisita(visita) {

        if (visita == null) {
            return false;
        }

        const horario =
            visita.getSolicitud().getHorario();

        if (!this.estaDisponible(horario)) {
            return false;
        }

        return visita.agregarVoluntario(this);
    }


    cancelarParticipacion(visita) {

        if (visita == null) {
            return false;
        }

        return visita.eliminarVoluntario(this);
    }


    // =========================
    // TO STRING
    // =========================

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