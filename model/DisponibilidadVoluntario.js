class DisponibilidadVoluntario {

    constructor(
        id,
        fecha,
        horaInicio,
        horaFin
    ) {
        this.id = id;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
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


    // =========================
    // DISPONIBILIDAD
    // =========================

    coincideCon(horario) {

        if (horario == null) {
            return false;
        }

        return (
            this.fecha === horario.getFecha() &&
            this.horaInicio <= horario.getHoraInicio() &&
            this.horaFin >= horario.getHoraFin()
        );
    }


    // =========================
    // MODIFICAR
    // =========================

    modificarDisponibilidad(
        fecha,
        horaInicio,
        horaFin
    ) {
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;

        return true;
    }


    // =========================
    // TO STRING
    // =========================

    toString() {

        return `Disponibilidad:
Fecha: ${this.fecha}
Hora inicio: ${this.horaInicio}
Hora fin: ${this.horaFin}`;
    }
}

module.exports = DisponibilidadVoluntario;