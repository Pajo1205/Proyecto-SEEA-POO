export function crearModulo(S, contexto) {
  const { crearBotones, confirmar, ejecutarAccion, crearEncabezado, formatearHorario, formatearActividades, camposColegio } = contexto;
  const recargar = (...args) => contexto.recargar(...args);


    async function voluntarios(root) {

        root.append(
            crearEncabezado(
                "Gestion de voluntarios",
                "Consulta de voluntarios y asignaciones."
            )
        );

        const [
            voluntariosRegistrados,
            asignacionesRegistradas
        ] = await Promise.all([
            S.api("/voluntarios"),
            S.api("/asignaciones")
        ]);

        // VOLUNTARIOS

        const listado = S.tarjeta(
            "Voluntarios registrados"
        );

        const filasVoluntarios =
            voluntariosRegistrados.map(voluntario => {

                const activas =
                    asignacionesRegistradas.filter(
                        a =>
                            a.idVoluntario === voluntario.id &&
                            a.estado === "CONFIRMADA"
                    ).length;

                return [
                    voluntario.nombre,
                    voluntario.carnet,
                    voluntario.carrera,
                    activas
                ];
            });

        listado.append(
            S.tabla(
                [
                    "Nombre",
                    "Carnet",
                    "Carrera",
                    "Asignaciones activas"
                ],
                filasVoluntarios
            )
        );

        root.append(listado);

        // ASIGNACIONES

        const asignaciones = S.tarjeta(
            "Asignaciones registradas"
        );

        const filasAsignaciones =
            asignacionesRegistradas.map(asignacion => {

                const acciones =
                    asignacion.estado === "CONFIRMADA"
                        ? crearBotones(
                            [
                                "Cancelar",
                                "danger",
                                () => ejecutarAccion(
                                    () => S.patch(
                                        `/asignaciones/${asignacion.id}/cancelar`
                                    ),
                                    "Asignacion cancelada"
                                )
                            ]
                        )
                        : "-";

                return [
                    asignacion.nombreVoluntario,
                    `#${asignacion.idVisita}`,
                    asignacion.estado,
                    acciones
                ];
            });

        asignaciones.append(
            S.tabla(
                [
                    "Voluntario",
                    "Visita",
                    "Estado",
                    "Accion"
                ],
                filasAsignaciones
            )
        );

        root.append(asignaciones);
    }

    // ==========================================
    // GESTION DE USUARIOS
    // ==========================================

return { voluntarios };
}
