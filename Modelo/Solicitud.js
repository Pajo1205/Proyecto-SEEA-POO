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
        if (!colegio || !horario) {
            throw new Error(
                "La solicitud necesita un colegio y un horario."
            );
        }

        if (!Number.isInteger(cantidadEstudiantes) ||
            cantidadEstudiantes <= 0 ||
            !Number.isInteger(cantidadProfesores) ||
            cantidadProfesores < 0) {
            throw new Error("Cantidad de participantes inválida.");
        }

        if (!solicitaTour && !solicitaCharla && !solicitaTaller) {
            throw new Error("Debe seleccionar una actividad.");
        }

        if (solicitaTaller && !colegio.puedeSolicitarTaller()) {
            throw new Error(
                "Este colegio no tiene habilitada la opción de taller."
            );
        }

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
        this.estado = "PENDIENTE";
    }

    // GETTERS

    getId() { return this.id; }
    getColegio() { return this.colegio; }
    getHorario() { return this.horario; }
    getCantidadEstudiantes() { return this.cantidadEstudiantes; }
    getCantidadProfesores() { return this.cantidadProfesores; }
    getGrado() { return this.grado; }
    getTransporte() { return this.transporte; }
    getSolicitaTour() { return this.solicitaTour; }
    getSolicitaCharla() { return this.solicitaCharla; }
    getSolicitaTaller() { return this.solicitaTaller; }
    getObservaciones() { return this.observaciones; }
    getEstado() { return this.estado; }

    // SETTERS

    setCantidadEstudiantes(cantidad) {
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return false;
        }

        this.cantidadEstudiantes = cantidad;
        return true;
    }

    setCantidadProfesores(cantidad) {
        if (!Number.isInteger(cantidad) || cantidad < 0) {
            return false;
        }

        this.cantidadProfesores = cantidad;
        return true;
    }

    setGrado(grado) {
        this.grado = grado;
    }

    setTransporte(transporte) {
        this.transporte = transporte;
    }

    setObservaciones(observaciones) {
        this.observaciones = observaciones;
    }

    setSolicitaTour(valor) {
        this.solicitaTour = valor;
    }

    setSolicitaCharla(valor) {
        this.solicitaCharla = valor;
    }

    setSolicitaTaller(valor) {
        if (valor && !this.colegio.puedeSolicitarTaller()) {
            return false;
        }

        this.solicitaTaller = valor;
        return true;
    }

    // ESTADOS

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
        return this.solicitaTour ||
            this.solicitaCharla ||
            this.solicitaTaller;
    }

    // RESERVAS

    aprobar(horariosOcupados = []) {
        if (!this.estaPendiente()) {
            return false;
        }

        if (!this.horario.estaDisponible()) {
            return false;
        }

        const hayConflicto = horariosOcupados.some(
            ocupado =>
                ocupado !== this.horario &&
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

    rechazar() {
        if (!this.estaPendiente()) {
            return false;
        }

        this.estado = "RECHAZADA";
        return true;
    }

    cancelar() {
        if (this.estado === "CANCELADA" ||
            this.estado === "RECHAZADA" ||
            this.estado === "FINALIZADA") {
            return false;
        }

        if (this.estaAprobada()) {
            this.horario.liberar();
        }

        this.estado = "CANCELADA";
        return true;
    }

    // CAMBIAR HORARIO

    cambiarHorario(nuevoHorario, horariosOcupados = []) {
        if (!nuevoHorario ||
            !nuevoHorario.estaDisponible()) {
            return false;
        }

        if (this.estado !== "PENDIENTE" &&
            this.estado !== "APROBADA") {
            return false;
        }

        if (nuevoHorario === this.horario) {
            return true;
        }

        const hayConflicto = horariosOcupados.some(
            ocupado =>
                ocupado !== this.horario &&
                ocupado.seTraslapaCon(nuevoHorario)
        );

        if (hayConflicto) {
            return false;
        }

        const horarioAnterior = this.horario;

        if (this.estaAprobada()) {
            if (!nuevoHorario.reservar()) {
                return false;
            }

            horarioAnterior.liberar();
        }

        this.horario = nuevoHorario;
        return true;
    }

    // EDITAR DATOS

    editarDatos(
        cantidadEstudiantes,
        cantidadProfesores,
        grado,
        transporte,
        observaciones
    ) {
        if (!Number.isInteger(cantidadEstudiantes) ||
            cantidadEstudiantes <= 0 ||
            !Number.isInteger(cantidadProfesores) ||
            cantidadProfesores < 0) {
            return false;
        }

        this.cantidadEstudiantes = cantidadEstudiantes;
        this.cantidadProfesores = cantidadProfesores;
        this.grado = grado;
        this.transporte = transporte;
        this.observaciones = observaciones;

        return true;
    }

    // TO STRING

    toString() {
        return `Solicitud #${this.id}
Colegio: ${this.colegio}
Horario: ${this.horario}
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

module.exports = Solicitud;