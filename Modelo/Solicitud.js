
class Solicitud {

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    constructor(
        id,
        colegio,
        horario,
        cantidadEstudiantes,
        cantidadProfesores,
        grado,
        transporte,
        solicitaTour,
        solicitaCharla,
        solicitaTaller,
        observaciones = ""
    ) {

        // Validar colegio y horario
        if (!colegio || !horario) {
            throw new Error(
                "La solicitud necesita un colegio y un horario."
            );
        }

        // Validar cantidad de participantes
        if (
            !Number.isInteger(cantidadEstudiantes) ||
            cantidadEstudiantes <= 0 ||
            !Number.isInteger(cantidadProfesores) ||
            cantidadProfesores < 0
        ) {
            throw new Error(
                "Cantidad de participantes invalida."
            );
        }

        // Validar actividades
        if (
            !solicitaTour &&
            !solicitaCharla &&
            !solicitaTaller
        ) {
            throw new Error(
                "Debe seleccionar al menos una actividad."
            );
        }

        // Validar talleres para colegios aliados
        if (
            solicitaTaller &&
            !colegio.puedeSolicitarTaller()
        ) {
            throw new Error(
                "Este colegio no tiene habilitada la opcion de taller."
            );
        }

        // Atributos
        this.id = id;
        this.colegio = colegio;
        this.horario = horario;

        this.cantidadEstudiantes = cantidadEstudiantes;
        this.cantidadProfesores = cantidadProfesores;

        this.grado = grado;
        this.transporte = transporte;

        this.solicitaTour = Boolean(solicitaTour);
        this.solicitaCharla = Boolean(solicitaCharla);
        this.solicitaTaller = Boolean(solicitaTaller);

        this.observaciones = observaciones;

        this.estado = "PENDIENTE";
    }

    // ==========================================
    // GETTERS
    // ==========================================

    getId() {
        return this.id;
    }

    getColegio() {
        return this.colegio;
    }

    getHorario() {
        return this.horario;
    }

    getCantidadEstudiantes() {
        return this.cantidadEstudiantes;
    }

    getCantidadProfesores() {
        return this.cantidadProfesores;
    }

    getGrado() {
        return this.grado;
    }

    getTransporte() {
        return this.transporte;
    }

    getSolicitaTour() {
        return this.solicitaTour;
    }

    getSolicitaCharla() {
        return this.solicitaCharla;
    }

    getSolicitaTaller() {
        return this.solicitaTaller;
    }

    getObservaciones() {
        return this.observaciones;
    }

    getEstado() {
        return this.estado;
    }

    // ==========================================
    // SETTERS
    // ==========================================

    setCantidadEstudiantes(cantidad) {

        if (!this.puedeEditar()) {
            return false;
        }

        if (
            !Number.isInteger(cantidad) ||
            cantidad <= 0
        ) {
            return false;
        }

        this.cantidadEstudiantes = cantidad;

        return true;
    }

    setCantidadProfesores(cantidad) {

        if (!this.puedeEditar()) {
            return false;
        }

        if (
            !Number.isInteger(cantidad) ||
            cantidad < 0
        ) {
            return false;
        }

        this.cantidadProfesores = cantidad;

        return true;
    }

    setGrado(grado) {

        if (!this.puedeEditar()) {
            return false;
        }

        this.grado = grado;

        return true;
    }

    setTransporte(transporte) {

        if (!this.puedeEditar()) {
            return false;
        }

        this.transporte = transporte;

        return true;
    }

    setObservaciones(observaciones) {

        if (!this.puedeEditar()) {
            return false;
        }

        this.observaciones = observaciones;

        return true;
    }

    // ==========================================
    // VALIDAR CAMBIOS DE ACTIVIDADES
    // ==========================================

    actualizarActividades(tour, charla, taller) {

        if (!this.puedeEditar()) {
            return false;
        }

        if (!tour && !charla && !taller) {
            return false;
        }

        if (
            taller &&
            !this.colegio.puedeSolicitarTaller()
        ) {
            return false;
        }

        this.solicitaTour = Boolean(tour);
        this.solicitaCharla = Boolean(charla);
        this.solicitaTaller = Boolean(taller);

        return true;
    }

    setSolicitaTour(valor) {

        return this.actualizarActividades(
            Boolean(valor),
            this.solicitaCharla,
            this.solicitaTaller
        );
    }

    setSolicitaCharla(valor) {

        return this.actualizarActividades(
            this.solicitaTour,
            Boolean(valor),
            this.solicitaTaller
        );
    }

    setSolicitaTaller(valor) {

        return this.actualizarActividades(
            this.solicitaTour,
            this.solicitaCharla,
            Boolean(valor)
        );
    }

    // ==========================================
    // ESTADOS
    // ==========================================

    estaPendiente() {
        return this.estado === "PENDIENTE";
    }

    estaAprobada() {
        return this.estado === "APROBADA";
    }

    estaCancelada() {
        return this.estado === "CANCELADA";
    }

    tieneActividadSeleccionada() {

        return (
            this.solicitaTour ||
            this.solicitaCharla ||
            this.solicitaTaller
        );
    }

    puedeEditar() {

        return (
            this.estado === "PENDIENTE" ||
            this.estado === "APROBADA"
        );
    }

    // ==========================================
    // APROBAR SOLICITUD
    // ==========================================

    aprobar(horariosOcupados = []) {

        if (!this.estaPendiente()) {
            return false;
        }

        if (!this.horario.estaDisponible()) {
            return false;
        }

        const hayConflicto = horariosOcupados.some(
            ocupado =>
                ocupado.seTraslapaCon(this.horario)
        );

        if (hayConflicto) {
            return false;
        }

        if (!this.horario.reservar()) {
            return false;
        }

        this.estado = "APROBADA";

        return true;
    }

    // ==========================================
    // RECHAZAR SOLICITUD
    // ==========================================

    rechazar() {

        if (!this.estaPendiente()) {
            return false;
        }

        this.estado = "RECHAZADA";

        return true;
    }

    // ==========================================
    // CANCELAR SOLICITUD
    // ==========================================

    cancelar() {

        if (
            this.estado === "CANCELADA" ||
            this.estado === "RECHAZADA" ||
            this.estado === "FINALIZADA"
        ) {
            return false;
        }

        if (this.estaAprobada()) {

            this.horario.liberar();
        }

        this.estado = "CANCELADA";

        return true;
    }

    // ==========================================
    // CAMBIAR HORARIO
    // ==========================================

    cambiarHorario(
        nuevoHorario,
        horariosOcupados = []
    ) {

        if (!this.puedeEditar()) {
            return false;
        }

        if (!nuevoHorario) {
            return false;
        }

        // Si es el mismo horario, no cambiar
        if (nuevoHorario === this.horario) {
            return true;
        }

        // Verificar disponibilidad
        if (!nuevoHorario.estaDisponible()) {
            return false;
        }

        // Verificar conflictos
        const hayConflicto = horariosOcupados.some(
            ocupado =>
                ocupado !== this.horario &&
                ocupado.seTraslapaCon(nuevoHorario)
        );

        if (hayConflicto) {
            return false;
        }

        const horarioAnterior = this.horario;

        // Si estaba aprobada, reservar primero
        // el nuevo horario antes de liberar el anterior
        if (this.estaAprobada()) {

            if (!nuevoHorario.reservar()) {
                return false;
            }

            horarioAnterior.liberar();
        }

        this.horario = nuevoHorario;

        return true;
    }

    // ==========================================
    // EDITAR DATOS
    // ==========================================

    editarDatos(
        cantidadEstudiantes,
        cantidadProfesores,
        grado,
        transporte,
        observaciones
    ) {

        if (!this.puedeEditar()) {
            return false;
        }

        if (
            !Number.isInteger(cantidadEstudiantes) ||
            cantidadEstudiantes <= 0 ||
            !Number.isInteger(cantidadProfesores) ||
            cantidadProfesores < 0
        ) {
            return false;
        }

        this.cantidadEstudiantes = cantidadEstudiantes;
        this.cantidadProfesores = cantidadProfesores;

        this.grado = grado;
        this.transporte = transporte;
        this.observaciones = observaciones;

        return true;
    }

    // ==========================================
    // TO STRING
    // ==========================================

    toString() {

        return `Solicitud #${this.id}
Colegio: ${this.colegio.getNombre()}
Horario: ${this.horario.getFecha()}
Estudiantes: ${this.cantidadEstudiantes}
Profesores: ${this.cantidadProfesores}
Grado: ${this.grado}
Transporte: ${this.transporte}
Tour: ${this.solicitaTour}
Charla: ${this.solicitaCharla}
Taller: ${this.solicitaTaller}
Estado: ${this.estado}
Observaciones: ${this.observaciones}`;
    }
}

// ==========================================
// EXPORTAR CLASE
// ==========================================

module.exports = Solicitud;
