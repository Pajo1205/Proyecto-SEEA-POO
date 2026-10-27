
class DisponibilidadVoluntario {

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    constructor(id, fecha, horaInicio, horaFin) {

        this.id = id;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;

        // Validar disponibilidad inicial
        if (!this.esValida()) {
            throw new Error(
                "La disponibilidad ingresada no es valida."
            );
        }
    }

    // ==========================================
    // GETTERS
    // ==========================================

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

    // ==========================================
    // SETTERS
    // ==========================================

    setFecha(fecha) {

        return this.modificarDisponibilidad(
            fecha,
            this.horaInicio,
            this.horaFin
        );
    }

    setHoraInicio(horaInicio) {

        return this.modificarDisponibilidad(
            this.fecha,
            horaInicio,
            this.horaFin
        );
    }

    setHoraFin(horaFin) {

        return this.modificarDisponibilidad(
            this.fecha,
            this.horaInicio,
            horaFin
        );
    }

    // ==========================================
    // VALIDAR DISPONIBILIDAD
    // ==========================================

    esValida() {

        // Validar formato de fecha
        if (
            typeof this.fecha !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(this.fecha)
        ) {
            return false;
        }

        // Comprobar que la fecha exista
        const fechaObjeto = new Date(
            this.fecha + "T00:00:00Z"
        );

        if (
            Number.isNaN(fechaObjeto.getTime()) ||
            fechaObjeto.toISOString().slice(0, 10) !== this.fecha
        ) {
            return false;
        }

        // Validar formato de horas
        const horaValida = hora => {

            return (
                typeof hora === "string" &&
                /^([01]\d|2[0-3]):[0-5]\d$/.test(hora)
            );
        };

        if (
            !horaValida(this.horaInicio) ||
            !horaValida(this.horaFin)
        ) {
            return false;
        }

        // La hora inicial debe ser menor
        // que la hora final
        if (this.horaInicio >= this.horaFin) {
            return false;
        }

        return true;
    }

    // ==========================================
    // COMPROBAR DISPONIBILIDAD
    // ==========================================

    coincideCon(horario) {

        if (!horario) {
            return false;
        }

        // Debe ser la misma fecha
        if (this.fecha !== horario.getFecha()) {
            return false;
        }

        // La disponibilidad debe cubrir
        // completamente el horario de visita
        return (
            this.horaInicio <= horario.getHoraInicio() &&
            this.horaFin >= horario.getHoraFin()
        );
    }

    // ==========================================
    // MODIFICAR DISPONIBILIDAD
    // ==========================================

    modificarDisponibilidad(
        fecha,
        horaInicio,
        horaFin
    ) {

        // Guardar los datos anteriores
        const anterior = {
            fecha: this.fecha,
            horaInicio: this.horaInicio,
            horaFin: this.horaFin
        };

        // Asignar nuevos valores
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;

        // Verificar los cambios
        if (!this.esValida()) {

            // Restaurar los valores anteriores
            this.fecha = anterior.fecha;
            this.horaInicio = anterior.horaInicio;
            this.horaFin = anterior.horaFin;

            return false;
        }

        return true;
    }

    // ==========================================
    // TO STRING
    // ==========================================

    toString() {

        return `Disponibilidad del voluntario:
ID: ${this.id}
Fecha: ${this.fecha}
Hora de inicio: ${this.horaInicio}
Hora de finalizacion: ${this.horaFin}`;
    }
}

// ==========================================
// EXPORTAR CLASE
// ==========================================

module.exports = DisponibilidadVoluntario;
