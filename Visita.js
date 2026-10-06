class Visita {

    constructor(id, solicitud) {

        if (solicitud == null) {
            throw new Error(
                "La visita necesita una solicitud."
            );
        }

        if (!solicitud.estaAprobada()) {
            throw new Error(
                "La solicitud debe estar aprobada para crear una visita."
            );
        }

        this.id = id;

        this.solicitud = solicitud;

        this.actividades = [];

        this.voluntarios = [];

        this.estado = "PROGRAMADA";

        this.observaciones = "";
    }


    // =========================
    // GETTERS
    // =========================

    getId() {
        return this.id;
    }

    getSolicitud() {
        return this.solicitud;
    }

    getActividades() {
        return this.actividades;
    }

    getVoluntarios() {
        return this.voluntarios;
    }

    getEstado() {
        return this.estado;
    }

    getObservaciones() {
        return this.observaciones;
    }


    // =========================
    // SETTERS
    // =========================

    setObservaciones(observaciones) {
        this.observaciones = observaciones;
    }


    // =========================
    // ACTIVIDADES
    // =========================

    agregarActividad(actividad) {

        if (actividad == null) {
            return false;
        }

        this.actividades.push(actividad);

        return true;
    }


    eliminarActividad(actividad) {

        const posicion =
            this.actividades.indexOf(actividad);

        if (posicion === -1) {
            return false;
        }

        this.actividades.splice(posicion, 1);

        return true;
    }


    // =========================
    // VOLUNTARIOS
    // =========================

    agregarVoluntario(voluntario) {

        if (voluntario == null) {
            return false;
        }

        if (this.voluntarios.includes(voluntario)) {
            return false;
        }

        this.voluntarios.push(voluntario);

        return true;
    }


    eliminarVoluntario(voluntario) {

        const posicion =
            this.voluntarios.indexOf(voluntario);

        if (posicion === -1) {
            return false;
        }

        this.voluntarios.splice(posicion, 1);

        return true;
    }


    // =========================
    // CÁLCULO DE VOLUNTARIOS
    // =========================

    calcularVoluntariosNecesarios() {

        const estudiantes =
            this.solicitud.getCantidadEstudiantes();

        let necesarios =
            Math.ceil(estudiantes / 10);

        /*
         * Para grupos grandes dejamos
         * un voluntario adicional de respaldo.
         */
        if (estudiantes >= 30) {
            necesarios++;
        }

        return necesarios;
    }


    tieneVoluntariosSuficientes() {

        return (
            this.voluntarios.length >=
            this.calcularVoluntariosNecesarios()
        );
    }


    // =========================
    // ESTADO DE LA VISITA
    // =========================

    iniciar() {

        if (this.estado !== "PROGRAMADA") {
            return false;
        }

        this.estado = "EN_CURSO";

        return true;
    }


    finalizar() {

        if (this.estado !== "EN_CURSO") {
            return false;
        }

        this.estado = "FINALIZADA";

        return true;
    }


    cancelar() {

        if (this.estado === "FINALIZADA") {
            return false;
        }

        this.estado = "CANCELADA";

        return true;
    }


    // =========================
    // TO STRING
    // =========================

    toString() {

        return `Visita:
ID: ${this.id}
Solicitud: ${this.solicitud.getId()}
Estado: ${this.estado}
Actividades: ${this.actividades.length}
Voluntarios: ${this.voluntarios.length}
Voluntarios necesarios: ${this.calcularVoluntariosNecesarios()}
Observaciones: ${this.observaciones}`;
    }
}

module.exports = Visita;