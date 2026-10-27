
(async () => {

    // ==========================================
    // INICIALIZACION DEL PORTAL
    // ==========================================

    const S = SEEA;

    const usuario = await S.iniciar("COLEGIO");

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

    async function crearSolicitud(root) {

        const horarios = await S.api(
            "/horarios/disponibles"
        );

        root.append(
            crearEncabezado(
                "Solicitá tu visita a UVG",
                "Elegí un horario y completá los datos del grupo."
            )
        );

        const card = S.tarjeta("Nueva solicitud");

        card.append(
            S.crear(
                "p",
                "El colegio se identifica automáticamente con tu cuenta.",
                "hint"
            )
        );

        // OPCIONES DE HORARIOS

        const opcionesHorarios = [
            {
                valor: "",
                texto: "Seleccionar horario"
            },

            ...horarios.map(horario => ({
                valor: horario.id,
                texto:
                    `${horario.fecha} - ` +
                    formatearHorario(horario)
            }))
        ];

        // FORMULARIO

        const formulario = S.formulario(
            [
                {
                    nombre: "idHorario",
                    etiqueta: "Fecha y horario disponible",
                    tipo: "select",
                    required: true,
                    opciones: opcionesHorarios
                },
                {
                    nombre: "cantidadEstudiantes",
                    etiqueta: "Cantidad de estudiantes",
                    tipo: "number",
                    min: 1,
                    required: true
                },
                {
                    nombre: "cantidadProfesores",
                    etiqueta: "Cantidad de profesores",
                    tipo: "number",
                    min: 0,
                    required: true
                },
                {
                    nombre: "grado",
                    etiqueta: "Grado o nivel",
                    required: true
                },
                {
                    nombre: "transporte",
                    etiqueta: "Medio de transporte",
                    required: true
                },
                {
                    nombre: "solicitaTour",
                    etiqueta: "Tour por UVG",
                    tipo: "checkbox",
                    checked: true
                },
                {
                    nombre: "solicitaCharla",
                    etiqueta: "Charla informativa",
                    tipo: "checkbox"
                },
                {
                    nombre: "solicitaTaller",
                    etiqueta: "Taller educativo (colegios aliados)",
                    tipo: "checkbox"
                },
                {
                    nombre: "observaciones",
                    etiqueta: "Observaciones adicionales",
                    tipo: "textarea"
                }
            ],

            // ENVIAR FORMULARIO

            async formularioHTML => {

                try {

                    const datosSolicitud = {

                        idHorario: S.num(
                            formularioHTML,
                            "idHorario"
                        ),

                        cantidadEstudiantes: S.num(
                            formularioHTML,
                            "cantidadEstudiantes"
                        ),

                        cantidadProfesores: S.num(
                            formularioHTML,
                            "cantidadProfesores"
                        ),

                        grado: S.val(
                            formularioHTML,
                            "grado"
                        ),

                        transporte: S.val(
                            formularioHTML,
                            "transporte"
                        ),

                        solicitaTour: S.bool(
                            formularioHTML,
                            "solicitaTour"
                        ),

                        solicitaCharla: S.bool(
                            formularioHTML,
                            "solicitaCharla"
                        ),

                        solicitaTaller: S.bool(
                            formularioHTML,
                            "solicitaTaller"
                        ),

                        observaciones: S.val(
                            formularioHTML,
                            "observaciones"
                        )
                    };

                    // VALIDAR ACTIVIDADES

                    if (
                        !datosSolicitud.solicitaTour &&
                        !datosSolicitud.solicitaCharla &&
                        !datosSolicitud.solicitaTaller
                    ) {

                        S.aviso(
                            "Seleccioná al menos una actividad.",
                            true
                        );

                        return;
                    }

                    // ENVIAR AL BACKEND

                    await S.post(
                        "/solicitudes",
                        datosSolicitud
                    );

                    await recargar();

                    S.aviso(
                        "Solicitud enviada. SEEA revisará tu solicitud."
                    );

                } catch (error) {

                    S.aviso(error.message, true);
                }
            },

            "Enviar solicitud"
        );

        card.append(formulario);

        root.append(card);
    }

    // ==========================================
    // MOSTRAR VISITAS DEL COLEGIO
    // ==========================================

    async function misVisitas(root) {

        const visitas = await S.api("/visitas");

        root.append(
            crearEncabezado(
                "Mis visitas",
                "Consultá las visitas programadas de tu institución."
            )
        );

        const card = S.tarjeta("Visitas de mi colegio");

        const filas = visitas.map(visita => {

            const actividades = visita.actividades
                .map(actividad => actividad.nombre)
                .join(", ") || "Por coordinar";

            return [
                visita.horario.fecha,
                formatearHorario(visita.horario),
                actividades,
                visita.estado
            ];
        });

        card.append(
            S.tabla(
                [
                    "Fecha",
                    "Horario",
                    "Actividades",
                    "Estado"
                ],
                filas
            )
        );

        root.append(card);
    }

    // ==========================================
    // OPCIONES DE NAVEGACION
    // ==========================================

    const opciones = [
        {
            nombre: "Nueva solicitud",
            mostrar: crearSolicitud
        },
        {
            nombre: "Mis solicitudes",
            mostrar: mostrarSolicitudes
        },
        {
            nombre: "Mis visitas",
            mostrar: misVisitas
        }
    ];

    // ==========================================
    // RECARGAR VISTA
    // ==========================================

    async function recargar() {

        const nombre = document.querySelector(
            "#nav button.active"
        )?.textContent?.trim() || "Nueva solicitud";

        const opcion = opciones.find(
            item => item.nombre === nombre
        ) || opciones[0];

        const root = document.getElementById("contenido");

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
