
class Actividad {

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    constructor(
        id,
        nombre,
        tipo,
        descripcion,
        duracionMinutos,
        capacidadMaxima
    ) {

        // Validar nombre
        if (
            typeof nombre !== "string" ||
            nombre.trim() === ""
        ) {
            throw new Error(
                "El nombre de la actividad es obligatorio."
            );
        }

        // Validar tipo de actividad
        if (
            !["TOUR", "CHARLA", "TALLER"].includes(tipo)
        ) {
            throw new Error(
                "El tipo de actividad debe ser TOUR, CHARLA o TALLER."
            );
        }

        // Validar descripcion
        if (typeof descripcion !== "string") {
            throw new Error(
                "La descripcion debe ser texto."
            );
        }

        // Validar duracion
        if (
            !Number.isInteger(duracionMinutos) ||
            duracionMinutos <= 0
        ) {
            throw new Error(
                "La duracion debe ser un numero entero positivo."
            );
        }

        // Validar capacidad
        if (
            !Number.isInteger(capacidadMaxima) ||
            capacidadMaxima <= 0
        ) {
            throw new Error(
                "La capacidad maxima debe ser un numero entero positivo."
            );
        }

        // Atributos
        this.id = id;
        this.nombre = nombre.trim();
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.duracionMinutos = duracionMinutos;
        this.capacidadMaxima = capacidadMaxima;
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

    getTipo() {
        return this.tipo;
    }

    getDescripcion() {
        return this.descripcion;
    }

    getDuracionMinutos() {
        return this.duracionMinutos;
    }

    getCapacidadMaxima() {
        return this.capacidadMaxima;
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

    setTipo(tipo) {

        if (
            !["TOUR", "CHARLA", "TALLER"].includes(tipo)
        ) {
            return false;
        }

        this.tipo = tipo;

        return true;
    }

    setDescripcion(descripcion) {

        if (typeof descripcion !== "string") {
            return false;
        }

        this.descripcion = descripcion;

        return true;
    }

    setDuracionMinutos(duracionMinutos) {

        if (
            !Number.isInteger(duracionMinutos) ||
            duracionMinutos <= 0
        ) {
            return false;
        }

        this.duracionMinutos = duracionMinutos;

        return true;
    }

    setCapacidadMaxima(capacidadMaxima) {

        if (
            !Number.isInteger(capacidadMaxima) ||
            capacidadMaxima <= 0
        ) {
            return false;
        }

        this.capacidadMaxima = capacidadMaxima;

        return true;
    }

    // ==========================================
    // VALIDACIONES DE TIPO
    // ==========================================

    esTour() {
        return this.tipo === "TOUR";
    }

    esCharla() {
        return this.tipo === "CHARLA";
    }

    esTaller() {
        return this.tipo === "TALLER";
    }

    // ==========================================
    // VALIDAR CAPACIDAD
    // ==========================================

    tieneCapacidad(cantidadEstudiantes) {

        return (
            Number.isInteger(cantidadEstudiantes) &&
            cantidadEstudiantes > 0 &&
            cantidadEstudiantes <= this.capacidadMaxima
        );
    }

    // ==========================================
    // TO STRING
    // ==========================================

    toString() {

        return `Actividad:
ID: ${this.id}
Nombre: ${this.nombre}
Tipo: ${this.tipo}
Descripcion: ${this.descripcion}
Duracion: ${this.duracionMinutos} minutos
Capacidad maxima: ${this.capacidadMaxima}`;
    }
}

// ==========================================
// EXPORTAR CLASE
// ==========================================

module.exports = Actividad;
