class AsignacionVoluntario {

    constructor(id, voluntario, visita, fechaAsignacion) {
        if (voluntario == null || visita == null) {
            throw new Error(
                "La asignación necesita un voluntario y una visita."
            );
        }

        this.id = id;
        this.voluntario = voluntario;
        this.visita = visita;
        this.fechaAsignacion = fechaAsignacion;
        this.estado = "CONFIRMADA";
    }

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

    setFechaAsignacion(fechaAsignacion) {
        this.fechaAsignacion = fechaAsignacion;
    }

    confirmar() {
        if (this.estado !== "CANCELADA") {
            return false;
        }

        if (!this.voluntario.puedeInscribirse(this.visita)) {
            return false;
        }

        this.estado = "CONFIRMADA";
        return true;
    }

    cancelar() {
        if (this.estado !== "CONFIRMADA") {
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

    estaActiva() {
        return this.estado === "CONFIRMADA";
    }

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