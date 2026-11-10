
const Usuario = require("./Usuario");
const Carrera = require("./Carrera");

class Voluntario extends Usuario {

    // ======================================
    // CONSTRUCTOR
    // ======================================

    constructor(
        id,
        nombre,
        correo,
        contrasena,
        carnet,
        carrera
    ) {

        super(id, nombre, correo, contrasena);

        if (!Voluntario.correoInstitucionalValido(correo)) {
            throw new Error(
                "El correo debe terminar en @uvg.edu.gt"
            );
        }

        if (
            typeof carnet !== "string" ||
            carnet.trim() === ""
        ) {
            throw new Error(
                "El carnet universitario es obligatorio"
            );
        }

        if (
            typeof carrera !== "string" ||
            carrera.trim() === ""
        ) {
            throw new Error(
                "La carrera universitaria es obligatoria"
            );
        }

        this.rol = "VOLUNTARIO";

        this.carnet = carnet.trim();
        this.carrera = carrera.trim();

        this.disponibilidades = [];
    }

    // ======================================
    // VALIDACIONES
    // ======================================

    static correoInstitucionalValido(correo) {

        return (
            typeof correo === "string" &&
            /^[^\s@]+@uvg\.edu\.gt$/i.test(correo.trim())
        );
    }

    static obtenerCarreras() {
        return Object.values(Carrera);
    }

    // ======================================
    // GETTERS
    // ======================================

    getRol() {
        return this.rol;
    }

    getCarnet() {
        return this.carnet;
    }

    getCarrera() {
        return this.carrera;
    }

    getDisponibilidades() {
        return this.disponibilidades;
    }

    // ======================================
    // SETTERS
    // ======================================

    setCarnet(carnet) {

        if (
            typeof carnet !== "string" ||
            carnet.trim() === ""
        ) {
            return false;
        }

        this.carnet = carnet.trim();

        return true;
    }

    setCarrera(carrera) {

        if (
            typeof carrera !== "string" ||
            carrera.trim() === ""
        ) {
            return false;
        }

        this.carrera = carrera.trim();

        return true;
    }

    // ======================================
    // AGREGAR DISPONIBILIDAD
    // ======================================

    agregarDisponibilidad(disponibilidad) {

        if (disponibilidad == null) {
            return false;
        }

        const idDuplicado = this.disponibilidades.some(
            d => d.getId() === disponibilidad.getId()
        );

        if (idDuplicado) {
            return false;
        }

        const duplicada = this.disponibilidades.some(
            d =>
                d.getFecha() === disponibilidad.getFecha() &&
                d.getHoraInicio() === disponibilidad.getHoraInicio() &&
                d.getHoraFin() === disponibilidad.getHoraFin()
        );

        if (duplicada) {
            return false;
        }

        this.disponibilidades.push(disponibilidad);

        return true;
    }

    // ======================================
    // ELIMINAR DISPONIBILIDAD
    // ======================================

    eliminarDisponibilidad(disponibilidad) {

        if (disponibilidad == null) {
            return false;
        }

        const posicion = this.disponibilidades.findIndex(
            d => d.getId() === disponibilidad.getId()
        );

        if (posicion === -1) {
            return false;
        }

        this.disponibilidades.splice(posicion, 1);

        return true;
    }

    // ======================================
    // VERIFICAR DISPONIBILIDAD
    // ======================================

    estaDisponible(horario) {

        if (horario == null) {
            return false;
        }

        return this.disponibilidades.some(
            disponibilidad =>
                disponibilidad.coincideCon(horario)
        );
    }

    // ======================================
    // VERIFICAR INSCRIPCION
    // ======================================

    puedeInscribirse(visita) {

        if (visita == null) {
            return false;
        }

        if (visita.getEstado() !== "PROGRAMADA") {
            return false;
        }

        const horario = visita
            .getSolicitud()
            .getHorario();

        if (!this.estaDisponible(horario)) {
            return false;
        }

        const yaInscrito = visita.getAsignaciones().some(
            asignacion =>
                asignacion.getVoluntario().getId() === this.id &&
                asignacion.estaActiva()
        );

        if (yaInscrito) {
            return false;
        }

        return true;
    }

    // ======================================
    // CANCELAR PARTICIPACION
    // ======================================

    cancelarParticipacion(asignacion) {

        if (asignacion == null) {
            return false;
        }

        if (
            asignacion.getVoluntario().getId() !== this.id
        ) {
            return false;
        }

        return asignacion.cancelar();
    }

    // ======================================
    // TO STRING
    // ======================================

    toString() {

        return `Voluntario:
ID: ${this.id}
Nombre: ${this.nombre}
Correo: ${this.correo}
Rol: ${this.rol}
Carnet: ${this.carnet}
Carrera: ${this.carrera}
Disponibilidades registradas: ${this.disponibilidades.length}`;
    }
}

module.exports = Voluntario;
