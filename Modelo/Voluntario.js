
const Usuario = require("./Usuario");

// ==========================================
// CLASE VOLUNTARIO
// ==========================================

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

        // Atributos heredados
        super(id, nombre, correo, contrasena);

        // Identificar tipo de usuario
        this.rol = "VOLUNTARIO";

        // Atributos propios
        this.carnet = carnet;
        this.carrera = carrera;

        // Disponibilidades registradas
        this.disponibilidades = [];
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

        if (typeof carrera !== "string") {
            return false;
        }

        this.carrera = carrera;

        return true;
    }

    // ======================================
    // AGREGAR DISPONIBILIDAD
    // ======================================

    agregarDisponibilidad(disponibilidad) {

        if (disponibilidad == null) {
            return false;
        }

        // Evitar IDs duplicados
        const idDuplicado = this.disponibilidades.some(
            d => d.getId() === disponibilidad.getId()
        );

        if (idDuplicado) {
            return false;
        }

        // Evitar disponibilidades identicas
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

        // La visita debe estar programada
        if (visita.getEstado() !== "PROGRAMADA") {
            return false;
        }

        const horario = visita
            .getSolicitud()
            .getHorario();

        // Verificar disponibilidad
        if (!this.estaDisponible(horario)) {
            return false;
        }

        // Verificar que no este inscrito
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

        // Comprobar que la asignacion
        // pertenece al voluntario
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

// ==========================================
// EXPORTAR CLASE
// ==========================================

module.exports = Voluntario;
