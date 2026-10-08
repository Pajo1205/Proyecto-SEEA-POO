class Horario {

    constructor(id, fecha, horaInicio, horaFin) {
        this.id = id;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.disponible = true;

        if (!this.esValido()) {
            throw new Error("El horario ingresado no es válido.");
        }
    }

    // GETTERS

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

    // SETTERS

    setFecha(fecha) {
        return this.modificarHorario(
            fecha,
            this.horaInicio,
            this.horaFin
        );
    }

    setHoraInicio(horaInicio) {
        return this.modificarHorario(
            this.fecha,
            horaInicio,
            this.horaFin
        );
    }

    setHoraFin(horaFin) {
        return this.modificarHorario(
            this.fecha,
            this.horaInicio,
            horaFin
        );
    }

    // VALIDACIONES

    esValido() {
        const fechaValida =
            typeof this.fecha === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(this.fecha) &&
            !Number.isNaN(Date.parse(this.fecha)) &&
            new Date(this.fecha + "T00:00:00Z")
                .toISOString().slice(0, 10) === this.fecha;

        const horaValida = hora =>
            typeof hora === "string" &&
            /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);

        return fechaValida &&
            horaValida(this.horaInicio) &&
            horaValida(this.horaFin) &&
            this.horaInicio < this.horaFin;
    }

    estaDisponible() {
        return this.disponible;
    }

    // RESERVAS

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

    // COMPARACIÓN DE HORARIOS

    coincideCon(otroHorario) {
        if (otroHorario == null) {
            return false;
        }

        return this.fecha === otroHorario.getFecha() &&
            this.horaInicio === otroHorario.getHoraInicio() &&
            this.horaFin === otroHorario.getHoraFin();
    }

    seTraslapaCon(otroHorario) {
        if (otroHorario == null) {
            return false;
        }

        if (this.fecha !== otroHorario.getFecha()) {
            return false;
        }

        return (
            this.horaInicio < otroHorario.getHoraFin() &&
            this.horaFin > otroHorario.getHoraInicio()
        );
    }

    // MODIFICAR HORARIO

    modificarHorario(fecha, horaInicio, horaFin) {
        if (!this.disponible) {
            return false;
        }

        const anterior = {
            fecha: this.fecha,
            inicio: this.horaInicio,
            fin: this.horaFin
        };

        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;

        if (!this.esValido()) {
            this.fecha = anterior.fecha;
            this.horaInicio = anterior.inicio;
            this.horaFin = anterior.fin;
            return false;
        }

        return true;
    }

    // TO STRING

    toString() {
        return `Horario:
ID: ${this.id}
Fecha: ${this.fecha}
Inicio: ${this.horaInicio}
Fin: ${this.horaFin}
Disponible: ${this.disponible ? "Sí" : "No"}`;
    }
}

module.exports = Horario;