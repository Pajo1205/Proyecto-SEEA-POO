
class AsignacionVoluntario {

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    constructor(
        id,
        voluntario,
        visita,
        fechaAsignacion
    ) {

        // Validar voluntario y visita
        if (!voluntario || !visita) {
            throw new Error(
                "La asignacion necesita un voluntario y una visita."
            );
        }

        // Validar fecha de asignacion
        if (
            typeof fechaAsignacion !== "string" ||
            Number.isNaN(Date.parse(fechaAsignacion))
        ) {
            throw new Error(
                "La fecha de asignacion no es valida."
            );
        }

        // Solo permitir asignaciones a visitas programadas
        if (visita.getEstado() !== "PROGRAMADA") {
            throw new Error(
                "Solo se pueden asignar voluntarios a visitas programadas."
            );
        }

        // Atributos
        this.id = id;
        this.voluntario = voluntario;
        this.visita = visita;
        this.fechaAsignacion = fechaAsignacion;

        // Estado inicial
        this.estado = "CONFIRMADA";
    }

    // ==========================================
    // GETTERS
    // ==========================================

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

    // ==========================================
    // SETTERS
    // ==========================================

    setFechaAsignacion(fechaAsignacion) {

        if (
            typeof fechaAsignacion !== "string" ||
            Number.isNaN(Date.parse(fechaAsignacion))
        ) {
            return false;
        }

        this.fechaAsignacion = fechaAsignacion;

        return true;
    }

    // ==========================================
    // CONFIRMAR ASIGNACION
    // ==========================================

    confirmar() {

        // Solo se puede confirmar una cancelada
        if (this.estado !== "CANCELADA") {
            return false;
        }

        // La visita debe estar programada
        if (this.visita.getEstado() !== "PROGRAMADA") {
            return false;
        }

        // Verificar disponibilidad del voluntario
        if (!this.voluntario.puedeInscribirse(this.visita)) {
            return false;
        }

        this.estado = "CONFIRMADA";

        return true;
    }

    // ==========================================
    // CANCELAR ASIGNACION
    // ==========================================

    cancelar() {

        // Solo cancelar asignaciones confirmadas
        if (this.estado !== "CONFIRMADA") {
            return false;
        }

        // No cancelar si la visita ya inicio
        if (this.visita.getEstado() !== "PROGRAMADA") {
            return false;
        }

        this.estado = "CANCELADA";

        return true;
    }

    // ==========================================
    // REGISTRAR ASISTENCIA
    // ==========================================

    registrarAsistencia() {

        // Debe estar confirmada
        if (this.estado !== "CONFIRMADA") {
            return false;
        }

        // La visita debe haber iniciado o finalizado
        if (
            this.visita.getEstado() !== "EN_CURSO" &&
            this.visita.getEstado() !== "FINALIZADA"
        ) {
            return false;
        }

        this.estado = "ASISTIO";

        return true;
    }

    // ==========================================
    // REGISTRAR AUSENCIA
    // ==========================================

    registrarAusencia() {

        if (this.estado !== "CONFIRMADA") {
            return false;
        }

        if (this.visita.getEstado() !== "FINALIZADA") {
            return false;
        }

        this.estado = "NO_ASISTIO";

        return true;
    }

    // ==========================================
    // VERIFICAR ASIGNACION ACTIVA
    // ==========================================

    estaActiva() {
        return this.estado === "CONFIRMADA";
    }

    // ==========================================
    // TO STRING
    // ==========================================

    toString() {

        return `Asignacion de voluntario:
ID: ${this.id}
Voluntario: ${this.voluntario.getNombre()}
Visita: ${this.visita.getId()}
Fecha de asignacion: ${this.fechaAsignacion}
Estado: ${this.estado}`;
    }
}

// ==========================================
// EXPORTAR CLASE
// ==========================================

module.exports = AsignacionVoluntario;
