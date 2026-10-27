
(async () => {

    // ==========================================
    // INICIALIZACION DEL PORTAL
    // ==========================================

    const S = SEEA;

    await S.iniciar("VOLUNTARIO");

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

    async function visitas(root) {

        const [
            visitasRegistradas,
            asignacionesRegistradas
        ] = await Promise.all([
            S.api("/visitas"),
            S.api("/asignaciones")
        ]);

        root.append(
            crearEncabezado(
                "Visitas disponibles",
                "Consultá las fechas y registrá tu participación según tu disponibilidad."
            )
        );

        const tarjeta = S.tarjeta(
            "Próximas visitas"
        );

        const visitasDisponibles = visitasRegistradas.filter(
            visita => visita.estado === "PROGRAMADA"
        );

        const filas = visitasDisponibles.map(visita => {

            // VERIFICAR SI YA ESTA INSCRITO

            const inscrito = asignacionesRegistradas.some(
                asignacion =>
                    asignacion.idVisita === visita.id &&
                    asignacion.estado === "CONFIRMADA"
            );

            // BOTON DE INSCRIPCION

            let accion;

            if (inscrito) {

                accion = S.crear(
                    "span",
                    "Ya estás inscrito",
                    "tag"
                );

            } else {

                accion = S.boton(
                    "Inscribirme",
                    "primary",
                    async () => {

                        await inscribirseVisita(visita);
                    }
                );
            }

            return [
                visita.colegio,
                visita.horario.fecha,
                formatearHorario(visita.horario),
                formatearActividades(visita.actividades),

                `${visita.voluntariosConfirmados}/` +
                `${visita.voluntariosNecesarios}`,

                accion
            ];
        });

        tarjeta.append(
            S.tabla(
                [
                    "Colegio",
                    "Fecha",
                    "Horario",
                    "Actividades",
                    "Voluntarios",
                    "Accion"
                ],
                filas
            )
        );

        root.append(tarjeta);
    }

    // ==========================================
    // INSCRIBIRSE EN UNA VISITA
    // ==========================================

    async function inscribirseVisita(visita) {

        const confirmar = window.confirm(
            `¿Deseas inscribirte en la visita del ` +
            `${visita.horario.fecha}?`
        );

        if (!confirmar) {
            return;
        }

        try {

            await S.post("/asignaciones", {
                idVisita: visita.id
            });

            await recargar();

            S.aviso(
                "Inscripción confirmada correctamente"
            );

        } catch (error) {

            S.aviso(error.message, true);
        }
    }

    // ==========================================
    // REGISTRAR DISPONIBILIDAD
    // ==========================================

    async function disponibilidades(root) {

        root.append(
            crearEncabezado(
                "Mi disponibilidad",
                "Registrá los días y horarios en los que podés participar."
            )
        );

        // FORMULARIO

        const registro = S.tarjeta(
            "Registrar disponibilidad"
        );

        registro.append(
            S.formulario(
                [
                    {
                        nombre: "fecha",
                        etiqueta: "Fecha",
                        tipo: "date",
                        required: true
                    },
                    {
                        nombre: "horaInicio",
                        etiqueta: "Hora de inicio",
                        tipo: "time",
                        required: true
                    },
                    {
                        nombre: "horaFin",
                        etiqueta: "Hora de finalización",
                        tipo: "time",
                        required: true
                    }
                ],

                async formulario => {

                    const fecha = S.val(
                        formulario,
                        "fecha"
                    );

                    const horaInicio = S.val(
                        formulario,
                        "horaInicio"
                    );

                    const horaFin = S.val(
                        formulario,
                        "horaFin"
                    );

                    // VALIDAR HORARIO

                    if (horaInicio >= horaFin) {

                        S.aviso(
                            "La hora de inicio debe ser menor que la hora final",
                            true
                        );

                        return false;
                    }

                    await S.post("/disponibilidades", {
                        fecha,
                        horaInicio,
                        horaFin
                    });

                    await recargar();

                    S.aviso(
                        "Disponibilidad registrada correctamente"
                    );
                },

                "Guardar disponibilidad"
            )
        );

        root.append(registro);

        // CONSULTAR DISPONIBILIDADES

        const disponibilidadesRegistradas =
            await S.api("/disponibilidades");

        const listado = S.tarjeta(
            "Mis horarios disponibles"
        );

        const filas = disponibilidadesRegistradas.map(
            disponibilidad => [
                disponibilidad.fecha,
                disponibilidad.horaInicio,
                disponibilidad.horaFin
            ]
        );

        listado.append(
            S.tabla(
                [
                    "Fecha",
                    "Hora de inicio",
                    "Hora de finalización"
                ],
                filas
            )
        );

        root.append(listado);
    }

    // ==========================================
    // MIS ASIGNACIONES
    // ==========================================

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

    const opciones = [
        {
            nombre: "Visitas disponibles",
            mostrar: visitas
        },
        {
            nombre: "Mi disponibilidad",
            mostrar: disponibilidades
        },
        {
            nombre: "Mis asignaciones",
            mostrar: asignaciones
        }
    ];

    // ==========================================
    // RECARGAR SECCION ACTUAL
    // ==========================================

    async function recargar() {

        const nombre = document.querySelector(
            "#nav button.active"
        )?.textContent?.trim() || "Visitas disponibles";

        const opcion = opciones.find(
            item => item.nombre === nombre
        ) || opciones[0];

        const root = document.getElementById(
            "contenido"
        );

        root.replaceChildren();

        await opcion.mostrar(root);
    }

    // ==========================================
    // INICIAR NAVEGACION
    // ==========================================

    S.navegar(opciones);

})().catch(error => {

    SEEA.aviso(error.message, true);

});
