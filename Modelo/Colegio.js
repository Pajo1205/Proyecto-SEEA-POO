class Colegio {

    constructor(
        id,
        nombre,
        direccion,
        telefono,
        correo,
        aliado
    ) {

        this.id = id;
        this.nombre = nombre;
        this.direccion = direccion;
        this.telefono = telefono;
        this.correo = correo;

        // true = colegio aliado
        // false = colegio no aliado
        this.aliado = aliado;
    }


    // =========================
    // GETTERS
    // =========================

    getId() {
        return this.id;
    }

    getNombre() {
        return this.nombre;
    }

    getDireccion() {
        return this.direccion;
    }

    getTelefono() {
        return this.telefono;
    }

    getCorreo() {
        return this.correo;
    }

    getAliado() {
        return this.aliado;
    }


    // =========================
    // SETTERS
    // =========================

    setNombre(nombre) {
        this.nombre = nombre;
    }

    setDireccion(direccion) {
        this.direccion = direccion;
    }

    setTelefono(telefono) {
        this.telefono = telefono;
    }

    setCorreo(correo) {
        this.correo = correo;
    }

    setAliado(aliado) {
        this.aliado = aliado;
    }


    // =========================
    // VALIDACIONES
    // =========================

    esAliado() {
        return this.aliado;
    }


    puedeSolicitarTaller() {
        return this.aliado;
    }


    // =========================
    // TO STRING
    // =========================

    toString() {

        return `${this.nombre} ${
            this.aliado ? "(Aliado)" : "(No aliado)"
        }`;
    }
}

module.exports = Colegio;