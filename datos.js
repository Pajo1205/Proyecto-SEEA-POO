
const datos = {
    usuarios: [],
    colegios: [],
    horarios: [],
    solicitudes: [],
    visitas: [],
    actividades: [],
    asignaciones: []
};

// Contadores para generar IDs únicos
const contadores = {
    usuario: 0,
    colegio: 0,
    horario: 0,
    solicitud: 0,
    visita: 0,
    actividad: 0,
    disponibilidad: 0,
    asignacion: 0
};

// Función para generar IDs
function generarId(tipo) {

    if (!(tipo in contadores)) {
        throw new Error(
            `Tipo de ID no válido: ${tipo}`
        );
    }

    contadores[tipo]++;

    return contadores[tipo];
}

// Exportamos los arreglos y la función
module.exports = {
    ...datos,
    generarId
};
