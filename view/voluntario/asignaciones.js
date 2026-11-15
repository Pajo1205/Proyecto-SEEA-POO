export function crearModulo(S, contexto) {
  const { crearEncabezado, formatearHorario, formatearActividades } = contexto;
  const recargar = (...args) => contexto.recargar(...args);


    async function asignaciones(root) {

        const [
            asignacionesRegistradas,
            visitasRegistradas
        ] = await Promise.all([
            S.api("/asignaciones"),
            S.api("/visitas")
        ]);

        root.append(
            crearEncabezado(
                "Mis asignaciones",
                "Consultá las visitas en las que estás participando."
            )
        );

        const tarjeta = S.tarjeta(
            "Visitas asignadas"
        );

        const filas = asignacionesRegistradas.map(
            asignacion => {

                const visita = visitasRegistradas.find(
                    v => v.id === asignacion.idVisita
                );

                // INFORMACION DE LA VISITA

                const nombreVisita = visita
                    ? `#${visita.id} - ${visita.colegio}`
                    : `#${asignacion.idVisita}`;

                const fecha = visita
                    ? visita.horario.fecha
                    : "-";

                const horario = visita
                    ? formatearHorario(visita.horario)
                    : "-";

                // BOTON CANCELAR

                let accion = "-";

                if (
                    asignacion.estado === "CONFIRMADA" &&
                    visita?.estado === "PROGRAMADA"
                ) {

                    accion = S.boton(
                        "Cancelar",
                        "danger",
                        async () => {

                            await cancelarAsignacion(
                                asignacion
                            );
                        }
                    );
                }

                return [
                    nombreVisita,
                    fecha,
                    horario,
                    asignacion.estado,
                    accion
                ];
            }
        );

        tarjeta.append(
            S.tabla(
                [
                    "Visita",
                    "Fecha",
                    "Horario",
                    "Estado",
                    "Accion"
                ],
                filas
            )
        );

        root.append(tarjeta);
    }

    // ==========================================
    // CANCELAR ASIGNACION
    // ==========================================

    async function cancelarAsignacion(asignacion) {

        const confirmar = window.confirm(
            "¿Estás seguro de cancelar tu participación?"
        );

        if (!confirmar) {
            return;
        }

        try {

            await S.patch(
                `/asignaciones/${asignacion.id}/cancelar`
            );

            await recargar();

            S.aviso(
                "Participación cancelada correctamente"
            );

        } catch (error) {

            S.aviso(error.message, true);
        }
    }

    // ==========================================
    // OPCIONES DEL MENU
    // ==========================================

return { asignaciones };
}
