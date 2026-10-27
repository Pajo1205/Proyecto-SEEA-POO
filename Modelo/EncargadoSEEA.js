
const Usuario = require("./Usuario");
const Visita = require("./Visita");

// ==========================================
// CLASE ENCARGADO SEEA
// ==========================================

class EncargadoSEEA extends Usuario {

    // ======================================
    // CONSTRUCTOR
    // ======================================

    constructor(id, nombre, correo, contrasena, puesto) {

        // Constructor de la clase padre
        super(id, nombre, correo, contrasena);

        // Identificar el tipo de usuario
        this.rol = "SEEA";

        // Atributo propio del encargado
        this.puesto = puesto;
    }

    // ======================================
    // GETTERS
    // ======================================

    getPuesto() {
        return this.puesto;
    }

    getRol() {
        return this.rol;
    }

    // ======================================
    // SETTERS
    // ======================================

    setPuesto(puesto) {

        if (!puesto || !puesto.trim()) {
            return false;
        }

        this.puesto = puesto;

        return true;
    }

    // ======================================
    // GESTION DE SOLICITUDES
    // ======================================

    aprobarSolicitud(solicitud, horariosOcupados = []) {

        if (solicitud == null) {
            return false;
        }

        return solicitud.aprobar(horariosOcupados);
    }

    rechazarSolicitud(solicitud) {

        if (solicitud == null) {
            return false;
        }

        return solicitud.rechazar();
    }

    cancelarSolicitud(solicitud) {

        if (solicitud == null) {
            return false;
        }

        return solicitud.cancelar();
    }

    // ======================================
    // GESTION DE HORARIOS
    // ======================================

    habilitarHorario(horario) {

        if (horario == null) {
            return false;
        }

        return horario.liberar();
    }

    bloquearHorario(horario) {

        if (horario == null) {
            return false;
        }

        return horario.reservar();
    }

    // ======================================
    // GESTION DE VISITAS
    // ======================================

    crearVisita(idVisita, solicitud) {

        if (solicitud == null) {
            return null;
        }

        if (!solicitud.estaAprobada()) {
            return null;
        }

        return new Visita(
            idVisita,
            solicitud
        );
    }

    // ======================================
    // TO STRING
    // ======================================

    toString() {

        return `Encargado SEEA:
ID: ${this.id}
Nombre: ${this.nombre}
Correo: ${this.correo}
Rol: ${this.rol}
Puesto: ${this.puesto}`;
    }
}

// ==========================================
// EXPORTAR CLASE
// ==========================================

module.exports = EncargadoSEEA;
