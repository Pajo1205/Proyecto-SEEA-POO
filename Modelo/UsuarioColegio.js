const Usuario = require("./Modelo/Usuario");

class UsuarioColegio extends Usuario {

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

        // Atributos propios
        this.telefono = telefono;
        this.colegio = colegio;
    }


    // =========================
    // GETTERS
    // =========================

    getTelefono() {
        return this.telefono;
    }

    getColegio() {
        return this.colegio;
    }


    // =========================
    // SETTERS
    // =========================

    setTelefono(telefono) {
        this.telefono = telefono;
    }

    setColegio(colegio) {
        this.colegio = colegio;
    }


    // =========================
    // SOLICITUDES
    // =========================

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

        if (this.colegio == null) {
            return null;
        }

        const Solicitud = require("./Modelo/Solicitud");

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


    // =========================
    // TO STRING
    // =========================

    toString() {

        return `Usuario Colegio:
ID: ${this.id}
Nombre: ${this.nombre}
Correo: ${this.correo}
Teléfono: ${this.telefono}
Colegio: ${this.colegio}`;
    }
}

module.exports = UsuarioColegio;