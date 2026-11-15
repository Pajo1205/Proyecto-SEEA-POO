export function crearModulo(S, contexto) {
  const { crearBotones, confirmar, ejecutarAccion, crearEncabezado, formatearHorario, formatearActividades, camposColegio } = contexto;
  const recargar = (...args) => contexto.recargar(...args);


    async function inicio(root) {

        const [colegios, solicitudes, visitas] =
            await Promise.all([
                S.api("/colegios"),
                S.api("/solicitudes"),
                S.api("/visitas")
            ]);

        root.append(
            crearEncabezado(
                "Panel administrativo SEEA",
                "Coordinacion de visitas educativas y colegios."
            )
        );

        // ESTADISTICAS

        const estadisticas = S.nodo("div", "stats");

        const datosEstadisticas = [
            [
                "Colegios registrados",
                colegios.length
            ],
            [
                "Solicitudes pendientes",
                solicitudes.filter(
                    s => s.estado === "PENDIENTE"
                ).length
            ],
            [
                "Visitas programadas",
                visitas.filter(
                    v => v.estado === "PROGRAMADA"
                ).length
            ]
        ];

        datosEstadisticas.forEach(([nombre, cantidad]) => {

            const tarjeta = S.nodo("div", "stat");

            tarjeta.append(
                S.crear("strong", cantidad),
                S.crear("span", nombre)
            );

            estadisticas.append(tarjeta);
        });

        root.append(estadisticas);

        // SOLICITUDES PENDIENTES

        const pendientes = solicitudes.filter(
            s => s.estado === "PENDIENTE"
        );

        const tarjeta = S.tarjeta(
            "Solicitudes pendientes de revision"
        );

        const filas = pendientes.map(solicitud => {

            const acciones = crearBotones(
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

            return [
                solicitud.colegio.nombre,
                solicitud.horario.fecha,
                solicitud.cantidadEstudiantes,
                acciones
            ];
        });

        tarjeta.append(
            S.tabla(
                [
                    "Colegio",
                    "Fecha",
                    "Estudiantes",
                    "Acciones"
                ],
                filas
            )
        );

        root.append(tarjeta);
    }

    
// ==========================================
// GESTION DE COLEGIOS
// ==========================================

return { inicio };
}
