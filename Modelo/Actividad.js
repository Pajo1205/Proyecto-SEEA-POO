
class Actividad {

    constructor(
        id,
        nombre,
        tipo,
        descripcion,
        duracionMinutos,
        capacidadMaxima
    ) {
        this.id = id;
        this.nombre = nombre;
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.duracionMinutos = duracionMinutos;
        this.capacidadMaxima = capacidadMaxima;
    }

    // GETTERS

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

    // SETTERS

    setNombre(nombre) {
        this.nombre = nombre;
    }

    setTipo(tipo) {
        if (!["TOUR", "CHARLA", "TALLER"].includes(tipo)) {
            return false;
        }

        this.tipo = tipo;
        return true;
    }

    setDescripcion(descripcion) {
        this.descripcion = descripcion;
    }

    setDuracionMinutos(duracionMinutos) {
        if (duracionMinutos <= 0) {
            return false;
        }

        this.duracionMinutos = duracionMinutos;
        return true;
    }

    setCapacidadMaxima(capacidadMaxima) {
        if (capacidadMaxima <= 0) {
            return false;
        }

        this.capacidadMaxima = capacidadMaxima;
        return true;
    }

    // VALIDACIONES

    esTour() {
        return this.tipo === "TOUR";
    }

    esCharla() {
        return this.tipo === "CHARLA";
    }

    esTaller() {
        return this.tipo === "TALLER";
    }

    tieneCapacidad(cantidadEstudiantes) {
        return cantidadEstudiantes > 0 &&
               cantidadEstudiantes <= this.capacidadMaxima;
    }

    // TO STRING

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

module.exports = Actividad;
