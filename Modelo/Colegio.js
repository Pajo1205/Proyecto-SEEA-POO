
class Colegio {

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    constructor(
        id,
        nombre,
        direccion,
        telefono,
        correo,
        aliado
    ) {

        // Validar nombre
        if (
            typeof nombre !== "string" ||
            nombre.trim() === ""
        ) {
            throw new Error(
                "El nombre del colegio es obligatorio."
            );
        }

        // Validar correo si fue proporcionado
        if (
            correo &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
        ) {
            throw new Error(
                "El correo del colegio no es valido."
            );
        }

        // Validar tipo de aliado
        if (typeof aliado !== "boolean") {
            throw new Error(
                "El atributo aliado debe ser true o false."
            );
        }

        // Atributos
        this.id = id;
        this.nombre = nombre.trim();
        this.direccion = direccion || "";
        this.telefono = telefono || "";
        this.correo = correo || "";
        this.aliado = aliado;
    }

    // ==========================================
    // GETTERS
    // ==========================================

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

    // ==========================================
    // SETTERS
    // ==========================================

    setNombre(nombre) {

        if (
            typeof nombre !== "string" ||
            nombre.trim() === ""
        ) {
            return false;
        }

        this.nombre = nombre.trim();

        return true;
    }

    setDireccion(direccion) {

        if (typeof direccion !== "string") {
            return false;
        }

        this.direccion = direccion;

        return true;
    }

    setTelefono(telefono) {

        if (typeof telefono !== "string") {
            return false;
        }

        this.telefono = telefono;

        return true;
    }

    setCorreo(correo) {

        if (
            typeof correo !== "string" ||
            (
                correo !== "" &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
            )
        ) {
            return false;
        }

        this.correo = correo;

        return true;
    }

    setAliado(aliado) {

        if (typeof aliado !== "boolean") {
            return false;
        }

        this.aliado = aliado;

        return true;
    }

    // ==========================================
    // VALIDACIONES
    // ==========================================

    esAliado() {
        return this.aliado;
    }

    puedeSolicitarTaller() {
        return this.aliado === true;
    }

    // ==========================================
    // TO STRING
    // ==========================================

    toString() {

        return `${this.nombre} ${
            this.aliado
                ? "(Aliado)"
                : "(No aliado)"
        }`;
    }
}

// ==========================================
// EXPORTAR CLASE
// ==========================================

module.exports = Colegio;
