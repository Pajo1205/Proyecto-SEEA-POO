
const Usuario = require("./Usuario");
const Solicitud = require("./Solicitud");

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
        colegio
    ) {

        // Atributos heredados de Usuario
        super(id, nombre, correo, contrasena);

        // Identificar el tipo de usuario
        this.rol = "COLEGIO";

        // Atributos propios
        this.telefono = telefono;
        this.colegio = colegio;
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

    getColegio() {
        return this.colegio;
    }

    // ======================================
    // SETTERS
    // ======================================

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
Colegio: ${nombreColegio}`;
    }
}

// ==========================================
// EXPORTAR CLASE
// ==========================================

module.exports = UsuarioColegio;
