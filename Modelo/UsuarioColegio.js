
const Usuario = require("./Usuario");
const Solicitud = require("./Solicitud");
const RolesColegio = require("./RolesColegio");

// ==========================================
// CLASE USUARIO COLEGIO
// ==========================================

class UsuarioColegio extends Usuario {

    // ======================================
    // CONSTRUCTOR
    // ======================================

    constructor(
        id,
        nombre,
        correo,
        contrasena,
        telefono,
        colegio,
        rolColegio = RolesColegio.OTRO,
        otroRolColegio = "No especificado"
    ) {

        // Atributos heredados de Usuario
        super(id, nombre, correo, contrasena);

        // Identificar el tipo de usuario
        this.rol = "COLEGIO";

        // Atributos propios
        this.telefono = telefono;
        this.colegio = colegio;
        this.setRolColegio(rolColegio, otroRolColegio);
    }

    // ======================================
    // GETTERS
    // ======================================

    getRol() {
        return this.rol;
    }

    getTelefono() {
        return this.telefono;
    }

    getRolColegio() {
        return this.rolColegio;
    }

    getOtroRolColegio() {
        return this.otroRolColegio;
    }

    getRolColegioDescripcion() {
        return this.rolColegio === RolesColegio.OTRO
            ? this.otroRolColegio
            : this.rolColegio;
    }

    getColegio() {
        return this.colegio;
    }

    // ======================================
    // SETTERS
    // ======================================

    setRolColegio(rol, otro = "") {
        if (!Object.values(RolesColegio).includes(rol)) {
            throw new Error("Rol de colegio no válido");
        }
        if (rol === RolesColegio.OTRO &&
            (typeof otro !== "string" || !otro.trim() || otro.trim().length > 100)) {
            throw new Error("Debes especificar el rol del colegio");
        }
        this.rolColegio = rol;
        this.otroRolColegio = rol === RolesColegio.OTRO ? otro.trim() : "";
        return true;
    }

    setTelefono(telefono) {

        if (typeof telefono !== "string") {
            return false;
        }

        this.telefono = telefono;

        return true;
    }

    setColegio(colegio) {

        if (colegio == null) {
            return false;
        }

        this.colegio = colegio;

        return true;
    }

    // ======================================
    // CREAR SOLICITUD
    // ======================================

    crearSolicitud(
        id,
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

        // Verificar que tenga colegio
        if (this.colegio == null) {
            return null;
        }

        // Verificar que exista horario
        if (horario == null) {
            return null;
        }

        // Crear solicitud asociada al colegio
        const solicitud = new Solicitud(
            id,
            this.colegio,
            horario,
            cantidadEstudiantes,
            cantidadProfesores,
            grado,
            transporte,
            solicitaTour,
            solicitaCharla,
            solicitaTaller,
            observaciones
        );

        return solicitud;
    }

    // ======================================
    // TO STRING
    // ======================================

    toString() {

        const nombreColegio = this.colegio
            ? this.colegio.getNombre()
            : "Sin colegio asignado";

        return `Usuario Colegio:
ID: ${this.id}
Nombre: ${this.nombre}
Correo: ${this.correo}
Rol: ${this.rol}
Teléfono: ${this.telefono}
Colegio: ${nombreColegio}
Cargo en colegio: ${this.getRolColegioDescripcion()}`;
    }
}

// ==========================================
// EXPORTAR CLASE
// ==========================================

module.exports = UsuarioColegio;
