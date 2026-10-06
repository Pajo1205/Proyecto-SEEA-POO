class UsuarioController {

    constructor() {
        this.usuarios = [];
    }


    // =========================
    // REGISTRO
    // =========================

    registrarUsuario(usuario) {

        if (usuario == null) {
            return false;
        }

        if (this.buscarPorCorreo(usuario.getCorreo()) != null) {
            return false;
        }

        this.usuarios.push(usuario);

        return true;
    }


    // =========================
    // BÚSQUEDAS
    // =========================

    buscarPorId(id) {

        return this.usuarios.find(
            usuario => usuario.getId() === id
        ) || null;
    }

    buscarPorCorreo(correo) {

        return this.usuarios.find(
            usuario => usuario.getCorreo() === correo
        ) || null;
    }

    listarUsuarios() {
        return this.usuarios;
    }


    // =========================
    // SESIÓN
    // =========================

    iniciarSesion(correo, contrasena) {

        const usuario = this.buscarPorCorreo(correo);

        if (usuario == null) {
            return false;
        }

        return usuario.iniciarSesion(correo, contrasena);
    }
}

module.exports = UsuarioController;
