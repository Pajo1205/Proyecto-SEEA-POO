
class Visita {

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

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
        this.asignaciones = [];

        this.estado = "PROGRAMADA";
        this.observaciones = "";
    }

    // ==========================================
    // GETTERS
    // ==========================================

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

    // ==========================================
    // SETTERS
    // ==========================================

    setObservaciones(observaciones) {

        if (typeof observaciones !== "string") {
            return false;
        }

        this.observaciones = observaciones;

        return true;
    }

    // ==========================================
    // AGREGAR ACTIVIDAD
    // ==========================================

    agregarActividad(actividad) {

        if (actividad == null) {
            return false;
        }

        // Solo modificar visitas programadas
        if (this.estado !== "PROGRAMADA") {
            return false;
        }

        // Evitar actividades duplicadas
        const duplicada = this.actividades.some(
            a => a.getId() === actividad.getId()
        );

        if (duplicada) {
            return false;
        }

        // Verificar que la actividad fue solicitada
        const tipo = actividad.getTipo();

        const permitida =
            (tipo === "TOUR" && this.solicitud.getSolicitaTour()) ||
            (tipo === "CHARLA" && this.solicitud.getSolicitaCharla()) ||
            (tipo === "TALLER" && this.solicitud.getSolicitaTaller());

        if (!permitida) {
            return false;
        }

        // Verificar capacidad
        if (!actividad.tieneCapacidad(
            this.solicitud.getCantidadEstudiantes()
        )) {
            return false;
        }

        this.actividades.push(actividad);

        return true;
    }

    // ==========================================
    // ELIMINAR ACTIVIDAD
    // ==========================================

    eliminarActividad(actividad) {

        if (actividad == null) {
            return false;
        }

        if (this.estado !== "PROGRAMADA") {
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

    // ==========================================
    // AGREGAR ASIGNACION
    // ==========================================

    agregarAsignacion(asignacion) {

        if (asignacion == null) {
            return false;
        }

        if (this.estado !== "PROGRAMADA") {
            return false;
        }

        // La asignacion debe pertenecer
        // a esta visita
        if (asignacion.getVisita() !== this) {
            return false;
        }

        if (!asignacion.estaActiva()) {
            return false;
        }

        const voluntario = asignacion.getVoluntario();

        // Evitar IDs duplicados
        const idDuplicado = this.asignaciones.some(
            a => a.getId() === asignacion.getId()
        );

        if (idDuplicado) {
            return false;
        }

        // Evitar duplicar voluntarios activos
        const voluntarioDuplicado = this.asignaciones.some(
            a => a.getVoluntario() === voluntario &&
                 a.estaActiva()
        );

        if (voluntarioDuplicado) {
            return false;
        }

        // Verificar disponibilidad
        if (!voluntario.puedeInscribirse(this)) {
            return false;
        }

        this.asignaciones.push(asignacion);

        return true;
    }

    // ==========================================
    // ELIMINAR ASIGNACION
    // ==========================================

    eliminarAsignacion(asignacion) {

        if (asignacion == null) {
            return false;
        }

        if (this.estado !== "PROGRAMADA") {
            return false;
        }

        const encontrada = this.asignaciones.find(
            a => a.getId() === asignacion.getId()
        );

        if (!encontrada) {
            return false;
        }

        // Conservar historial
        return encontrada.cancelar();
    }

    // ==========================================
    // CALCULAR VOLUNTARIOS NECESARIOS
    // ==========================================

    calcularVoluntariosNecesarios() {

        const estudiantes =
            this.solicitud.getCantidadEstudiantes();

        let necesarios = Math.ceil(estudiantes / 10);

        // Regla provisional de respaldo
        // para grupos de 30 o mas estudiantes
        if (estudiantes >= 30) {
            necesarios++;
        }

        return necesarios;
    }

    // ==========================================
    // CONTAR VOLUNTARIOS CONFIRMADOS
    // ==========================================

    contarVoluntariosConfirmados() {

        return this.asignaciones.filter(
            asignacion => asignacion.estaActiva()
        ).length;
    }

    // ==========================================
    // VERIFICAR VOLUNTARIOS SUFICIENTES
    // ==========================================

    tieneVoluntariosSuficientes() {

        return (
            this.contarVoluntariosConfirmados() >=
            this.calcularVoluntariosNecesarios()
        );
    }

    // ==========================================
    // INICIAR VISITA
    // ==========================================

    iniciar() {

        if (this.estado !== "PROGRAMADA") {
            return false;
        }

        this.estado = "EN_CURSO";

        return true;
    }

    // ==========================================
    // FINALIZAR VISITA
    // ==========================================

    finalizar() {

        if (this.estado !== "EN_CURSO") {
            return false;
        }

        this.estado = "FINALIZADA";

        return true;
    }

    // ==========================================
    // CANCELAR VISITA
    // ==========================================

    cancelar() {

        // Solo cancelar visitas programadas
        if (this.estado !== "PROGRAMADA") {
            return false;
        }

        // Primero cancelar las asignaciones
        // mientras la visita esta programada
        this.asignaciones.forEach(asignacion => {

            if (asignacion.estaActiva()) {
                asignacion.cancelar();
            }
        });

        // Despues cambiar el estado
        this.estado = "CANCELADA";

        return true;
    }

    // ==========================================
    // TO STRING
    // ==========================================

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

// ==========================================
// EXPORTAR CLASE
// ==========================================

module.exports = Visita;
