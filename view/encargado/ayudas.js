export function crearAyudas(S, contexto) {
  const recargar = (...args) => contexto.recargar(...args);
// ==========================================
    // INICIALIZACION DEL PORTAL SEEA
    // ==========================================

    // ==========================================
    // FUNCIONES AUXILIARES
    // ==========================================

    function crearBotones(...acciones) {

        const contenedor = S.nodo("div", "actions");

        acciones.forEach(([texto, clase, funcion]) => {

            contenedor.append(
                S.boton(texto, clase, funcion)
            );
        });

        return contenedor;
    }

    function confirmar(mensaje) {
        return window.confirm(mensaje);
    }

    async function ejecutarAccion(operacion, mensajeExito) {

        try {

            await operacion();

            await recargar();

            S.aviso(mensajeExito || "Operacion completada");

        } catch (error) {

            S.aviso(error.message, true);
        }
    }

    function crearEncabezado(titulo, descripcion) {

        const encabezado = S.nodo("div", "hero");

        encabezado.append(
            S.crear("h1", titulo),
            S.crear("p", descripcion)
        );

        return encabezado;
    }

    function formatearHorario(horario) {

        return (
            `${horario.fecha} ` +
            `${horario.horaInicio} - ${horario.horaFin}`
        );
    }

    function formatearActividades(solicitud) {

        const actividades = [];

        if (solicitud.solicitaTour) {
            actividades.push("Tour");
        }

        if (solicitud.solicitaCharla) {
            actividades.push("Charla");
        }

        if (solicitud.solicitaTaller) {
            actividades.push("Taller");
        }

        return actividades.join(", ") || "Ninguna";
    }


// ==========================================
// CAMPOS DEL FORMULARIO DE COLEGIOS
// ==========================================

const camposColegio = [
    {
        nombre: "nombre",
        etiqueta: "Nombre del colegio",
        required: true
    },
    {
        nombre: "direccion",
        etiqueta: "Direccion",
        required: true
    },
    {
        nombre: "telefono",
        etiqueta: "Telefono"
    },
    {
        nombre: "correo",
        etiqueta: "Correo",
        tipo: "email"
    }
];

    // ==========================================
    // INICIO - PANEL ADMINISTRATIVO
    // ==========================================

return { crearBotones, confirmar, ejecutarAccion, crearEncabezado, formatearHorario, formatearActividades, camposColegio };
}
