class AsignacionVoluntario {

    constructor(
        id,
        voluntario,
        visita,
        fechaAsignacion
    ) {
        this.id = id;
        this.voluntario = voluntario;
        this.visita = visita;
        this.fechaAsignacion = fechaAsignacion;

        // Toda nueva asignación inicia confirmada
        this.estado = "CONFIRMADA";
    }


    // =========================
    // GETTERS
    // =========================

    getId() {
        return this.id;
    }

    getVoluntario() {
        return this.voluntario;
    }

    getVisita() {
        return this.visita;
    }

    getFechaAsignacion() {
        return this.fechaAsignacion;
    }

    getEstado() {
        return this.estado;
    }


    // =========================
    // SETTERS
    // =========================

    setVoluntario(voluntario) {
        this.voluntario = voluntario;
    }

    setVisita(visita) {
        this.visita = visita;
    }

    setFechaAsignacion(fechaAsignacion) {
        this.fechaAsignacion = fechaAsignacion;
    }


    // =========================
    // ESTADO
    // =========================

    confirmar() {

        if (this.estado === "CONFIRMADA") {
            return false;
        }

        this.estado = "CONFIRMADA";

        return true;
    }


    cancelar() {

        if (this.estado === "CANCELADA") {
            return false;
        }

        this.estado = "CANCELADA";

        return true;
    }


    registrarAsistencia() {

        if (this.estado !== "CONFIRMADA") {
            return false;
        }

        this.estado = "ASISTIO";

        return true;
    }


    registrarAusencia() {

        if (this.estado !== "CONFIRMADA") {
            return false;
        }

        this.estado = "NO_ASISTIO";

        return true;
    }


    // =========================
    // VALIDACIONES
    // =========================

    estaActiva() {
        return this.estado === "CONFIRMADA";
    }


    // =========================
    // TO STRING
    // =========================

    toString() {

        return `Asignación:
ID: ${this.id}
Voluntario: ${this.voluntario.getNombre()}
Visita: ${this.visita.getId()}
Fecha de asignación: ${this.fechaAsignacion}
Estado: ${this.estado}`;
    }
}

module.exports = AsignacionVoluntario;