export function crearAyudas(S, contexto) {
  const recargar = (...args) => contexto.recargar(...args);
// ==========================================
    // INICIALIZACION DEL PORTAL
    // ==========================================

    // ==========================================
    // FUNCIONES AUXILIARES
    // ==========================================

    function crearEncabezado(titulo, descripcion) {

        const hero = S.nodo("div", "hero");

        hero.append(
            S.crear("h1", titulo),
            S.crear("p", descripcion)
        );

        return hero;
    }

    function formatearHorario(horario) {

        return (
            `${horario.horaInicio} - ${horario.horaFin}`
        );
    }

    function obtenerActividades(solicitud) {

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

        return actividades.join(", ") || "Sin actividades";
    }

    // ==========================================
    // MOSTRAR SOLICITUDES DEL COLEGIO
    // ==========================================

return { crearEncabezado, formatearHorario, obtenerActividades };
}
