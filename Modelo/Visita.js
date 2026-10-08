class Visita {

    constructor(id, solicitud) {
        if (solicitud == null) {
            throw new Error("La visita necesita una solicitud.");
        }

        if (!solicitud.estaAprobada()) {
            throw new Error(
                "La solicitud debe estar aprobada para crear una visita."
            );
        }

        this.id = id;
        this.solicitud = solicitud;
        this.actividades = [];
        this.asignaciones = [];
        this.estado = "PROGRAMADA";
        this.observaciones = "";
    }

    // GETTERS

    getId() {
        return this.id;
    }

    getSolicitud() {
        return this.solicitud;
    }

    getActividades() {
        return this.actividades;
    }

    getAsignaciones() {
        return this.asignaciones;
    }

    getEstado() {
        return this.estado;
    }

    getObservaciones() {
        return this.observaciones;
    }

    // SETTERS

    setObservaciones(observaciones) {
        this.observaciones = observaciones;
    }

    // ACTIVIDADES

    agregarActividad(actividad) {
        if (actividad == null) {
            return false;
        }

        if (this.actividades.some(a => a.getId() === actividad.getId())) {
            return false;
        }

        this.actividades.push(actividad);
        return true;
    }

    eliminarActividad(actividad) {
        if (actividad == null) {
            return false;
        }

        const posicion = this.actividades.findIndex(
            a => a.getId() === actividad.getId()
        );

        if (posicion === -1) {
            return false;
        }

        this.actividades.splice(posicion, 1);
        return true;
    }

    // ASIGNACIONES

    agregarAsignacion(asignacion) {
        if (asignacion == null) {
            return false;
        }

        if (this.estado !== "PROGRAMADA") {
            return false;
        }

        // Comprobar que la asignación pertenece a esta visita
        if (asignacion.getVisita().getId() !== this.id) {
            return false;
        }

        if (asignacion.getEstado() !== "CONFIRMADA") {
            return false;
        }

        const voluntario = asignacion.getVoluntario();

        if (!voluntario.puedeInscribirse(this)) {
            return false;
        }

        // Evitar IDs de asignación duplicados
        if (this.asignaciones.some(
            a => a.getId() === asignacion.getId()
        )) {
            return false;
        }

        this.asignaciones.push(asignacion);
        return true;
    }

    eliminarAsignacion(asignacion) {
        if (asignacion == null) {
            return false;
        }

        const encontrada = this.asignaciones.find(
            a => a.getId() === asignacion.getId()
        );

        if (!encontrada) {
            return false;
        }

        // Conservamos el registro y cambiamos su estado
        return encontrada.cancelar();
    }

    // CÁLCULO DE VOLUNTARIOS

    calcularVoluntariosNecesarios() {
        const estudiantes = this.solicitud.getCantidadEstudiantes();

        let necesarios = Math.ceil(estudiantes / 10);

        // Regla provisional: respaldo para grupos de 30 o más
        if (estudiantes >= 30) {
            necesarios++;
        }

        return necesarios;
    }

    contarVoluntariosConfirmados() {
        return this.asignaciones.filter(
            asignacion => asignacion.getEstado() === "CONFIRMADA"
        ).length;
    }

    tieneVoluntariosSuficientes() {
        return this.contarVoluntariosConfirmados() >=
               this.calcularVoluntariosNecesarios();
    }

    // ESTADOS

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
        if (this.estado === "FINALIZADA" ||
            this.estado === "CANCELADA") {
            return false;
        }

        this.estado = "CANCELADA";

        // Cancelar asignaciones activas
        this.asignaciones.forEach(asignacion => {
            if (asignacion.estaActiva()) {
                asignacion.cancelar();
            }
        });

        return true;
    }

    // TO STRING

    toString() {
        return `Visita:
ID: ${this.id}
Solicitud: ${this.solicitud.getId()}
Estado: ${this.estado}
Actividades: ${this.actividades.length}
Voluntarios confirmados: ${this.contarVoluntariosConfirmados()}
Voluntarios necesarios: ${this.calcularVoluntariosNecesarios()}
Observaciones: ${this.observaciones}`;
    }
}

module.exports = Visita;