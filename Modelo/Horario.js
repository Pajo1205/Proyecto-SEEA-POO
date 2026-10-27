
class Horario {

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    constructor(id, fecha, horaInicio, horaFin) {

        this.id = id;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;

        // Todos los horarios nuevos están disponibles
        this.disponible = true;

        // Validar los datos del horario
        if (!this.esValido()) {
            throw new Error(
                "El horario ingresado no es valido."
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

    getDisponible() {
        return this.disponible;
    }

    // ==========================================
    // SETTERS
    // ==========================================

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

    // ==========================================
    // VALIDACIONES
    // ==========================================

    esValido() {

        // Validar formato de fecha
        const formatoFecha =
            typeof this.fecha === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(this.fecha);

        if (!formatoFecha) {
            return false;
        }

        // Validar que la fecha exista
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
    // DISPONIBILIDAD
    // ==========================================

    estaDisponible() {
        return this.disponible;
    }

    // ==========================================
    // RESERVAR HORARIO
    // ==========================================

    reservar() {

        // No reservar un horario ocupado
        if (!this.disponible) {
            return false;
        }

        this.disponible = false;

        return true;
    }

    // ==========================================
    // LIBERAR HORARIO
    // ==========================================

    liberar() {

        // No liberar un horario que ya está libre
        if (this.disponible) {
            return false;
        }

        this.disponible = true;

        return true;
    }

    // ==========================================
    // COMPARAR HORARIOS
    // ==========================================

    coincideCon(otroHorario) {

        if (!otroHorario) {
            return false;
        }

        return (
            this.fecha === otroHorario.getFecha() &&
            this.horaInicio === otroHorario.getHoraInicio() &&
            this.horaFin === otroHorario.getHoraFin()
        );
    }

    // ==========================================
    // DETECTAR TRASLAPES
    // ==========================================

    seTraslapaCon(otroHorario) {

        if (!otroHorario) {
            return false;
        }

        // Si son fechas diferentes,
        // no existe traslape
        if (this.fecha !== otroHorario.getFecha()) {
            return false;
        }

        // Comparar intervalos de tiempo
        return (
            this.horaInicio < otroHorario.getHoraFin() &&
            this.horaFin > otroHorario.getHoraInicio()
        );
    }

    // ==========================================
    // MODIFICAR HORARIO
    // ==========================================

    modificarHorario(fecha, horaInicio, horaFin) {

        // No modificar horarios reservados
        if (!this.estaDisponible()) {
            return false;
        }

        // Guardar valores anteriores
        const anterior = {
            fecha: this.fecha,
            horaInicio: this.horaInicio,
            horaFin: this.horaFin
        };

        // Asignar nuevos valores
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;

        // Validar cambios
        if (!this.esValido()) {

            // Restaurar datos anteriores
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

        return `Horario:
ID: ${this.id}
Fecha: ${this.fecha}
Hora de inicio: ${this.horaInicio}
Hora de finalizacion: ${this.horaFin}
Disponible: ${this.disponible ? "Si" : "No"}`;
    }
}

// ==========================================
// EXPORTAR CLASE
// ==========================================

module.exports = Horario;
