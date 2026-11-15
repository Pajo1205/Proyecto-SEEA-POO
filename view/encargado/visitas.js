export function crearModulo(S, contexto) {
  const { crearBotones, confirmar, ejecutarAccion, crearEncabezado, formatearHorario, formatearActividades, camposColegio } = contexto;
  const recargar = (...args) => contexto.recargar(...args);


    async function visitas(root) {

        root.append(
            crearEncabezado(
                "Gestion de visitas",
                "Programacion de actividades y asignacion de voluntarios."
            )
        );

        const [
            solicitudesRegistradas,
            visitasRegistradas,
            actividadesRegistradas,
            voluntariosRegistrados
        ] = await Promise.all([
            S.api("/solicitudes"),
            S.api("/visitas"),
            S.api("/actividades"),
            S.api("/voluntarios")
        ]);

        // CREAR VISITA

        const solicitudesDisponibles =
            solicitudesRegistradas.filter(
                solicitud =>
                    solicitud.estado === "APROBADA" &&
                    !visitasRegistradas.some(
                        visita =>
                            visita.idSolicitud === solicitud.id
                    )
            );

        const programar = S.tarjeta(
            "Programar visita aprobada"
        );

        programar.append(
            S.formulario(
                [
                    {
                        nombre: "idSolicitud",
                        etiqueta: "Solicitud aprobada",
                        tipo: "select",
                        required: true,

                        opciones: [
                            {
                                valor: "",
                                texto: "Seleccionar solicitud"
                            },

                            ...solicitudesDisponibles.map(
                                solicitud => ({
                                    valor: solicitud.id,

                                    texto:
                                        `#${solicitud.id} - ` +
                                        `${solicitud.colegio.nombre} - ` +
                                        `${solicitud.horario.fecha}`
                                })
                            )
                        ]
                    }
                ],

                async formulario => {

                    await S.post("/visitas", {
                        idSolicitud: S.num(
                            formulario,
                            "idSolicitud"
                        )
                    });

                    await recargar();

                    S.aviso("Visita programada");
                },

                "Crear visita"
            )
        );

        root.append(programar);

        // CREAR ACTIVIDAD

        const actividad = S.tarjeta(
            "Registrar actividad"
        );

        actividad.append(
            S.formulario(
                [
                    {
                        nombre: "nombre",
                        etiqueta: "Nombre",
                        required: true
                    },
                    {
                        nombre: "tipo",
                        etiqueta: "Tipo",
                        tipo: "select",

                        opciones: [
                            { valor: "TOUR", texto: "Tour" },
                            { valor: "CHARLA", texto: "Charla" },
                            { valor: "TALLER", texto: "Taller" }
                        ]
                    },
                    {
                        nombre: "descripcion",
                        etiqueta: "Descripcion"
                    },
                    {
                        nombre: "duracionMinutos",
                        etiqueta: "Duracion (minutos)",
                        tipo: "number",
                        min: 1,
                        required: true
                    },
                    {
                        nombre: "capacidadMaxima",
                        etiqueta: "Capacidad maxima",
                        tipo: "number",
                        min: 1,
                        required: true
                    }
                ],

                async formulario => {

                    await S.post("/actividades", {

                        nombre: S.val(formulario, "nombre"),

                        tipo: S.val(formulario, "tipo"),

                        descripcion: S.val(
                            formulario,
                            "descripcion"
                        ),

                        duracionMinutos: S.num(
                            formulario,
                            "duracionMinutos"
                        ),

                        capacidadMaxima: S.num(
                            formulario,
                            "capacidadMaxima"
                        )
                    });

                    await recargar();

                    S.aviso("Actividad registrada");
                },

                "Guardar actividad"
            )
        );

        root.append(actividad);

        // LISTADO DE VISITAS

        const listado = S.tarjeta(
            "Visitas programadas"
        );

        const filas = visitasRegistradas.map(visita => {

            const acciones = [];

            if (visita.estado === "PROGRAMADA") {

                acciones.push(
                    [
                        "Agregar actividad",
                        "secondary",
                        () => agregarActividad(
                            visita,
                            actividadesRegistradas
                        )
                    ],
                    [
                        "Asignar voluntario",
                        "secondary",
                        () => asignarVoluntario(
                            visita,
                            voluntariosRegistrados
                        )
                    ],
                    [
                        "Iniciar",
                        "primary",
                        () => ejecutarAccion(
                            () => S.patch(
                                `/visitas/${visita.id}/iniciar`
                            ),
                            "Visita iniciada"
                        )
                    ]
                );
            }

            if (visita.estado === "EN_CURSO") {

                acciones.push(
                    [
                        "Finalizar",
                        "primary",
                        () => ejecutarAccion(
                            () => S.patch(
                                `/visitas/${visita.id}/finalizar`
                            ),
                            "Visita finalizada"
                        )
                    ]
                );
            }

            const actividades = visita.actividades
                .map(a => a.nombre)
                .join(", ") || "Sin actividades";

            return [
                visita.colegio,
                formatearHorario(visita.horario),
                actividades,

                `${visita.voluntariosConfirmados}/` +
                `${visita.voluntariosNecesarios}`,

                visita.estado,
                crearBotones(...acciones)
            ];
        });

        listado.append(
            S.tabla(
                [
                    "Colegio",
                    "Horario",
                    "Actividades",
                    "Voluntarios",
                    "Estado",
                    "Acciones"
                ],
                filas
            )
        );

        root.append(listado);
    }

    // ==========================================
    // ASIGNAR VOLUNTARIO A VISITA
    // ==========================================

    async function asignarVoluntario(
        visita,
        voluntarios
    ) {

        if (voluntarios.length === 0) {

            S.aviso(
                "Primero debes registrar voluntarios",
                true
            );

            return;
        }

        const opciones = voluntarios.map(
            voluntario =>
                `${voluntario.id}: ${voluntario.nombre}`
        ).join("\n");

        const id = prompt(
            `ID del voluntario para visita #${visita.id}:\n` +
            opciones
        );

        if (id === null) {
            return;
        }

        const idVoluntario = Number(id);

        if (!voluntarios.some(v => v.id === idVoluntario)) {
            S.aviso("Voluntario invalido", true);
            return;
        }

        await ejecutarAccion(
            () => S.post("/asignaciones", {
                idVisita: visita.id,
                idVoluntario
            }),
            "Voluntario asignado"
        );
    }

    // ==========================================
    // AGREGAR ACTIVIDAD A VISITA
    // ==========================================

    async function agregarActividad(
        visita,
        actividades
    ) {

        if (actividades.length === 0) {

            S.aviso(
                "Primero debes registrar actividades",
                true
            );

            return;
        }

        const opciones = actividades.map(
            actividad =>
                `${actividad.id}: ${actividad.nombre} (${actividad.tipo})`
        ).join("\n");

        const id = prompt(
            `ID de actividad para visita #${visita.id}:\n` +
            opciones
        );

        if (id === null) {
            return;
        }

        const idActividad = Number(id);

        if (!actividades.some(a => a.id === idActividad)) {
            S.aviso("Actividad invalida", true);
            return;
        }

        await ejecutarAccion(
            () => S.post(
                `/visitas/${visita.id}/actividades`,
                { idActividad }
            ),
            "Actividad asignada"
        );
    }

    // ==========================================
    // GESTION DE VOLUNTARIOS
    // ==========================================

return { visitas };
}
