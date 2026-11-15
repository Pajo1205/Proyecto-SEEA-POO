export function crearModulo(S, contexto) {
  const { crearEncabezado, formatearHorario, obtenerActividades } = contexto;
  const recargar = (...args) => contexto.recargar(...args);


    async function mostrarSolicitudes(root) {

        const solicitudes = await S.api("/solicitudes");

        root.append(
            crearEncabezado(
                "Mis solicitudes",
                "Consultá el estado de tus solicitudes de visita."
            )
        );

        const card = S.tarjeta("Historial de solicitudes");

        const filas = solicitudes.map(solicitud => {

            const acciones = S.nodo("div", "actions");

            if (
                solicitud.estado === "PENDIENTE" ||
                solicitud.estado === "APROBADA"
            ) {

                // REAGENDAR

                acciones.append(
                    S.boton(
                        "Reagendar",
                        "secondary",
                        async () => {
                            await reagendarSolicitud(solicitud);
                        }
                    )
                );

                // CANCELAR

                acciones.append(
                    S.boton(
                        "Cancelar",
                        "danger",
                        async () => {
                            await cancelarSolicitud(solicitud);
                        }
                    )
                );
            }

            return [
                solicitud.horario.fecha,
                formatearHorario(solicitud.horario),
                solicitud.cantidadEstudiantes,
                obtenerActividades(solicitud),
                solicitud.estado,
                acciones
            ];
        });

        card.append(
            S.tabla(
                [
                    "Fecha",
                    "Horario",
                    "Estudiantes",
                    "Actividades",
                    "Estado",
                    "Acciones"
                ],
                filas
            )
        );

        root.append(card);
    }

    // ==========================================
    // REAGENDAR SOLICITUD
    // ==========================================

    async function reagendarSolicitud(solicitud) {

        try {

            const horarios = await S.api(
                "/horarios/disponibles"
            );

            if (horarios.length === 0) {

                S.aviso(
                    "No hay horarios disponibles para reagendar.",
                    true
                );

                return;
            }

            const opciones = horarios.map(horario => {

                return (
                    `${horario.id}: ${horario.fecha} ` +
                    `${formatearHorario(horario)}`
                );

            }).join("\n");

            const id = prompt(
                "Seleccioná el ID del nuevo horario:\n\n" +
                opciones
            );

            if (id === null) {
                return;
            }

            const idHorario = Number(id);

            if (
                !Number.isInteger(idHorario) ||
                !horarios.some(h => h.id === idHorario)
            ) {

                S.aviso(
                    "Seleccioná un horario válido.",
                    true
                );

                return;
            }

            await S.patch(
                `/solicitudes/${solicitud.id}/reagendar`,
                { idHorario }
            );

            await recargar();

            S.aviso("Horario actualizado correctamente.");

        } catch (error) {

            S.aviso(error.message, true);
        }
    }

    // ==========================================
    // CANCELAR SOLICITUD
    // ==========================================

    async function cancelarSolicitud(solicitud) {

        const confirmar = confirm(
            "¿Estás seguro de cancelar esta solicitud?"
        );

        if (!confirmar) {
            return;
        }

        try {

            await S.patch(
                `/solicitudes/${solicitud.id}/cancelar`
            );

            await recargar();

            S.aviso("Solicitud cancelada correctamente.");

        } catch (error) {

            S.aviso(error.message, true);
        }
    }

    // ==========================================
    // CREAR NUEVA SOLICITUD
    // ==========================================

return { mostrarSolicitudes };
}
