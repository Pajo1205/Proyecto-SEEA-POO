export function crearAyudas(S, contexto) {
  const recargar = (...args) => contexto.recargar(...args);
// ==========================================
    // INICIALIZACION DEL PORTAL
    // ==========================================

    // ==========================================
    // FUNCIONES AUXILIARES
    // ==========================================

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
            `${horario.horaInicio} - ${horario.horaFin}`
        );
    }

    function formatearActividades(actividades) {

        if (!actividades || actividades.length === 0) {
            return "Por definir";
        }

        return actividades
            .map(actividad => actividad.nombre)
            .join(", ");
    }

    // ==========================================
    // VISITAS DISPONIBLES
    // ==========================================

return { crearEncabezado, formatearHorario, formatearActividades };
}
