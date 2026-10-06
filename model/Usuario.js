class Usuario {

    constructor(id, nombre, correo, contrasena) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.contrasena = contrasena;
    }

    // Getters
    getId() {
        return this.id;
    }

    getNombre() {
        return this.nombre;
    }

    getCorreo() {
        return this.correo;
    }

    getContrasena() {
        return this.contrasena;
    }

    // Setters
    setNombre(nombre) {
        this.nombre = nombre;
    }

    setCorreo(correo) {
        this.correo = correo;
    }

    setContrasena(contrasena) {
        this.contrasena = contrasena;
    }

    // Métodos
    iniciarSesion(correo, contrasena) {
        return this.correo === correo &&
               this.contrasena === contrasena;
    }

    actualizarDatos(nombre, correo) {
        this.nombre = nombre;
        this.correo = correo;
    }

    toString() {
        return `Usuario: ${this.nombre} - ${this.correo}`;
    }
}

module.exports = Usuario;