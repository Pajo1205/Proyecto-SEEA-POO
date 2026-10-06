class Solicitud {

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
        this.id = id;
        this.colegio = colegio;
        this.horario = horario;

        this.cantidadEstudiantes = cantidadEstudiantes;
        this.cantidadProfesores = cantidadProfesores;

        this.grado = grado;
        this.transporte = transporte;

        this.solicitaTour = solicitaTour;
        this.solicitaCharla = solicitaCharla;
        this.solicitaTaller = solicitaTaller;

        this.observaciones = observaciones;

        // Toda solicitud nueva inicia pendiente
        this.estado = "PENDIENTE";
    }


    // =========================
    // GETTERS
    // =========================

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


    // =========================
    // SETTERS
    // =========================

    setColegio(colegio) {
        this.colegio = colegio;
    }

    setHorario(horario) {
        this.horario = horario;
    }

    setCantidadEstudiantes(cantidadEstudiantes) {
        if (cantidadEstudiantes > 0) {
            this.cantidadEstudiantes = cantidadEstudiantes;
            return true;
        }

        return false;
    }

    setCantidadProfesores(cantidadProfesores) {
        if (cantidadProfesores >= 0) {
            this.cantidadProfesores = cantidadProfesores;
            return true;
        }

        return false;
    }

    setGrado(grado) {
        this.grado = grado;
    }

    setTransporte(transporte) {
        this.transporte = transporte;
    }

    setSolicitaTour(solicitaTour) {
        this.solicitaTour = solicitaTour;
    }

    setSolicitaCharla(solicitaCharla) {
        this.solicitaCharla = solicitaCharla;
    }

    setSolicitaTaller(solicitaTaller) {
        this.solicitaTaller = solicitaTaller;
    }

    setObservaciones(observaciones) {
        this.observaciones = observaciones;
    }


    // =========================
    // ESTADO DE LA SOLICITUD
    // =========================

    aprobar() {
        if (this.estado !== "PENDIENTE") {
            return false;
        }

        this.estado = "APROBADA";

        // El horario queda ocupado
        this.horario.reservar();

        return true;
    }


    rechazar() {
        if (this.estado !== "PENDIENTE") {
            return false;
        }

        this.estado = "RECHAZADA";

        return true;
    }


    cancelar() {
        if (this.estado === "CANCELADA") {
            return false;
        }

        // Si estaba aprobada, liberamos el horario
        if (this.estado === "APROBADA") {
            this.horario.liberar();
        }

        this.estado = "CANCELADA";

        return true;
    }


    // =========================
    // CAMBIO DE HORARIO
    // =========================

    cambiarHorario(nuevoHorario) {

        if (nuevoHorario == null) {
            return false;
        }

        if (!nuevoHorario.estaDisponible()) {
            return false;
        }

        // Si la solicitud ya estaba aprobada,
        // liberamos el horario anterior.
        if (this.estado === "APROBADA") {

            this.horario.liberar();

            nuevoHorario.reservar();
        }

        this.horario = nuevoHorario;

        return true;
    }


    // =========================
    // EDITAR DATOS
    // =========================

    editarDatos(
        cantidadEstudiantes,
        cantidadProfesores,
        grado,
        transporte,
        observaciones
    ) {

        if (cantidadEstudiantes <= 0) {
            return false;
        }

        if (cantidadProfesores < 0) {
            return false;
        }

        this.cantidadEstudiantes = cantidadEstudiantes;
        this.cantidadProfesores = cantidadProfesores;
        this.grado = grado;
        this.transporte = transporte;
        this.observaciones = observaciones;

        return true;
    }


    // =========================
    // VALIDACIONES
    // =========================

    tieneActividadSeleccionada() {
        return (
            this.solicitaTour ||
            this.solicitaCharla ||
            this.solicitaTaller
        );
    }


    estaPendiente() {
        return this.estado === "PENDIENTE";
    }


    estaAprobada() {
        return this.estado === "APROBADA";
    }


    estaCancelada() {
        return this.estado === "CANCELADA";
    }


    // =========================
    // TO STRING
    // =========================

    toString() {
        return `
Solicitud #${this.id}
Colegio: ${this.colegio}
Horario: ${this.horario}
Estudiantes: ${this.cantidadEstudiantes}
Profesores: ${this.cantidadProfesores}
Grado: ${this.grado}
Transporte: ${this.transporte}
Tour: ${this.solicitaTour ? "Sí" : "No"}
Charla: ${this.solicitaCharla ? "Sí" : "No"}
Taller: ${this.solicitaTaller ? "Sí" : "No"}
Estado: ${this.estado}
Observaciones: ${this.observaciones}
        `;
    }
}

module.exports = Solicitud;