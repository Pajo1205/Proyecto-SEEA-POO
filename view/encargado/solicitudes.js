export function crearModulo(S, contexto) {
  const { crearBotones, confirmar, ejecutarAccion, crearEncabezado, formatearHorario, formatearActividades, camposColegio } = contexto;
  const recargar = (...args) => contexto.recargar(...args);


    async function solicitudes(root) {

        root.append(
            crearEncabezado(
                "Gestion de solicitudes",
                "Revision y aprobacion de solicitudes de colegios."
            )
        );

        const solicitudesRegistradas =
            await S.api("/solicitudes");

        const listado = S.tarjeta(
            "Solicitudes recibidas"
        );

        const filas = solicitudesRegistradas.map(solicitud => {

            const acciones = [];

            // APROBAR O RECHAZAR

            if (solicitud.estado === "PENDIENTE") {

                acciones.push(
                    [
                        "Aprobar",
                        "secondary",
                        () => ejecutarAccion(
                            () => S.patch(
                                `/solicitudes/${solicitud.id}/aprobar`
                            ),
                            "Solicitud aprobada"
                        )
                    ],
                    [
                        "Rechazar",
                        "danger",
                        () => {

                            if (!confirmar("Â¿Rechazar solicitud?")) {
                                return;
                            }

                            ejecutarAccion(
                                () => S.patch(
                                    `/solicitudes/${solicitud.id}/rechazar`
                                ),
                                "Solicitud rechazada"
                            );
                        }
                    ]
                );
            }

            // CANCELAR

            if (
                solicitud.estado === "PENDIENTE" ||
                solicitud.estado === "APROBADA"
            ) {

                acciones.push(
                    [
                        "Cancelar",
                        "danger",
                        () => {

                            if (!confirmar(
                                "Â¿Cancelar esta solicitud?"
                            )) {
                                return;
                            }

                            ejecutarAccion(
                                () => S.patch(
                                    `/solicitudes/${solicitud.id}/cancelar`
                                ),
                                "Solicitud cancelada"
                            );
                        }
                    ]
                );
            }

            // ELIMINAR

            if (solicitud.estado !== "APROBADA") {

                acciones.push(
                    [
                        "Eliminar",
                        "danger",
                        () => {

                            if (!confirmar(
                                "Â¿Eliminar definitivamente?"
                            )) {
                                return;
                            }

                            ejecutarAccion(
                                () => S.del(
                                    `/solicitudes/${solicitud.id}`
                                ),
                                "Solicitud eliminada"
                            );
                        }
                    ]
                );
            }

            return [
                solicitud.colegio.nombre,
                formatearHorario(solicitud.horario),
                solicitud.cantidadEstudiantes,
                formatearActividades(solicitud),
                solicitud.estado,
                crearBotones(...acciones)
            ];
        });

        listado.append(
            S.tabla(
                [
                    "Colegio",
                    "Horario",
                    "Estudiantes",
                    "Actividades",
                    "Estado",
                    "Acciones"
                ],
                filas
            )
        );

        root.append(listado);
    }

    // ==========================================
    // GESTION DE VISITAS
    // ==========================================

return { solicitudes };
}
