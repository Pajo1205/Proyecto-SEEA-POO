
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

// Después de cargar datos desde SQL, los contadores deben
// continuar desde el ID más alto para no repetir claves.
function sincronizarContadores() {

    const disponibilidades = [];

    for (const usuario of datos.usuarios) {

        if (Array.isArray(usuario.disponibilidades)) {

            for (const disponibilidad of usuario.disponibilidades) {
                disponibilidades.push(disponibilidad);
            }
        }
    }

    const listas = [
        ["usuario", datos.usuarios],
        ["colegio", datos.colegios],
        ["horario", datos.horarios],
        ["solicitud", datos.solicitudes],
        ["visita", datos.visitas],
        ["actividad", datos.actividades],
        ["disponibilidad", disponibilidades],
        ["asignacion", datos.asignaciones]
    ];

    for (const [tipo, lista] of listas) {

        let maximo = 0;

        for (const elemento of lista) {

            const id = Number(elemento.id) || 0;

            if (id > maximo) {
                maximo = id;
            }
        }

        contadores[tipo] = maximo;
    }
}

// Exportamos los arreglos y las funciones
module.exports = {
    ...datos,
    generarId,
    sincronizarContadores
};
