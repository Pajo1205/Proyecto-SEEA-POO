class Horario {

    constructor(id, fecha, horaInicio, horaFin) {
        this.id = id;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;

        // Por defecto, un horario nuevo está disponible
        this.disponible = true;
    }


    // =========================
    // GETTERS
    // =========================

    getId() {
        return this.id;
    }

    getFecha() {
        return this.fecha;
    }

    getHoraInicio() {
        return this.horaInicio;
    }

    getHoraFin() {
        return this.horaFin;
    }

    getDisponible() {
        return this.disponible;
    }


    // =========================
    // SETTERS
    // =========================

    setFecha(fecha) {
        this.fecha = fecha;
    }

    setHoraInicio(horaInicio) {
        this.horaInicio = horaInicio;
    }

    setHoraFin(horaFin) {
        this.horaFin = horaFin;
    }

    setDisponible(disponible) {
        this.disponible = disponible;
    }


    // =========================
    // DISPONIBILIDAD
    // =========================

    estaDisponible() {
        return this.disponible;
    }


    reservar() {

        if (!this.disponible) {
            return false;
        }

        this.disponible = false;

        return true;
    }


    liberar() {

        if (this.disponible) {
            return false;
        }

        this.disponible = true;

        return true;
    }


    // =========================
    // MODIFICAR HORARIO
    // =========================

    modificarHorario(fecha, horaInicio, horaFin) {

        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;

        return true;
    }


    // =========================
    // COMPARAR HORARIOS
    // =========================

    coincideCon(otroHorario) {

        if (otroHorario == null) {
            return false;
        }

        return (
            this.fecha === otroHorario.getFecha() &&
            this.horaInicio === otroHorario.getHoraInicio() &&
            this.horaFin === otroHorario.getHoraFin()
        );
    }


    // =========================
    // TO STRING
    // =========================

    toString() {

        return `Horario:
ID: ${this.id}
Fecha: ${this.fecha}
Hora de inicio: ${this.horaInicio}
Hora de finalización: ${this.horaFin}
Disponible: ${this.disponible ? "Sí" : "No"}`;
    }
}

module.exports = Horario;