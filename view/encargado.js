
(async () => {

    // ==========================================
    // INICIALIZACION DEL PORTAL SEEA
    // ==========================================

    const S = SEEA;

    await S.iniciar("SEEA");

    // ==========================================
    // FUNCIONES AUXILIARES
    // ==========================================

    function crearBotones(...acciones) {

        const contenedor = S.nodo("div", "actions");

        acciones.forEach(([texto, clase, funcion]) => {

            contenedor.append(
                S.boton(texto, clase, funcion)
            );
        });

        return contenedor;
    }

    function confirmar(mensaje) {
        return window.confirm(mensaje);
    }

    async function ejecutarAccion(operacion, mensajeExito) {

        try {

            await operacion();

            await recargar();

            S.aviso(mensajeExito || "Operacion completada");

        } catch (error) {

            S.aviso(error.message, true);
        }
    }

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
            `${horario.fecha} ` +
            `${horario.horaInicio} - ${horario.horaFin}`
        );
    }

    function formatearActividades(solicitud) {

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

        return actividades.join(", ") || "Ninguna";
    }

    // ==========================================
    // CAMPOS DEL FORMULARIO DE COLEGIOS
    // ==========================================

    const camposColegio = [
        {
            nombre: "nombre",
            etiqueta: "Nombre del colegio",
            required: true
        },
        {
            nombre: "direccion",
            etiqueta: "Direccion"
        },
        {
            nombre: "telefono",
            etiqueta: "Telefono"
        },
        {
            nombre: "correo",
            etiqueta: "Correo",
            tipo: "email"
        },
        {
            nombre: "aliado",
            etiqueta: "Colegio aliado",
            tipo: "checkbox"
        }
    ];

    // ==========================================
    // INICIO - PANEL ADMINISTRATIVO
    // ==========================================

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
                        if (!confirmar("¿Rechazar solicitud?")) {
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

    async function colegios(root) {

        root.append(
            crearEncabezado(
                "Gestion de colegios",
                "Registro y administracion de instituciones educativas."
            )
        );

        // REGISTRAR COLEGIO

        const registro = S.tarjeta("Registrar colegio");

        registro.append(
            S.formulario(
                camposColegio,

                async formulario => {

                    await S.post("/colegios", {

                        nombre: S.val(formulario, "nombre"),

                        direccion: S.val(formulario, "direccion"),

                        telefono: S.val(formulario, "telefono"),

                        correo: S.val(formulario, "correo"),

                        aliado: S.bool(formulario, "aliado")
                    });

                    await recargar();

                    S.aviso("Colegio registrado correctamente");
                },

                "Registrar colegio"
            )
        );

        root.append(registro);

        // CONSULTAR COLEGIOS

        const colegiosRegistrados =
            await S.api("/colegios");

        const listado = S.tarjeta(
            "Colegios registrados"
        );

        const filas = colegiosRegistrados.map(colegio => {

            const acciones = crearBotones(
                [
                    "Editar",
                    "secondary",
                    () => editarColegio(colegio)
                ],
                [
                    "Eliminar",
                    "danger",
                    () => {

                        if (!confirmar(
                            `¿Eliminar ${colegio.nombre}?`
                        )) {
                            return;
                        }

                        ejecutarAccion(
                            () => S.del(
                                `/colegios/${colegio.id}`
                            ),
                            "Colegio eliminado"
                        );
                    }
                ]
            );

            return [
                colegio.nombre,
                `${colegio.correo || "-"} · ${colegio.telefono || "-"}`,
                colegio.aliado ? "Aliado" : "No aliado",
                acciones
            ];
        });

        listado.append(
            S.tabla(
                [
                    "Colegio",
                    "Contacto",
                    "Tipo",
                    "Acciones"
                ],
                filas
            )
        );

        root.append(listado);
    }

    // ==========================================
    // EDITAR COLEGIO
    // ==========================================

    async function editarColegio(colegio) {

        const nombre = prompt(
            "Nombre del colegio:",
            colegio.nombre
        );

        if (nombre === null) {
            return;
        }

        if (!nombre.trim()) {
            S.aviso(
                "El nombre del colegio no puede estar vacio",
                true
            );

            return;
        }

        const aliado = confirmar(
            "¿Es colegio aliado?\nAceptar = Si / Cancelar = No"
        );

        await ejecutarAccion(
            () => S.patch(
                `/colegios/${colegio.id}`,
                {
                    nombre: nombre.trim(),
                    aliado
                }
            ),
            "Colegio actualizado"
        );
    }

    // ==========================================
    // GESTION DE HORARIOS
    // ==========================================

    async function horarios(root) {

        root.append(
            crearEncabezado(
                "Gestion de horarios",
                "Administracion de fechas disponibles para visitas."
            )
        );

        // CREAR HORARIO

        const registro = S.tarjeta(
            "Crear horario disponible"
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
                        etiqueta: "Hora de finalizacion",
                        tipo: "time",
                        required: true
                    }
                ],

                async formulario => {

                    await S.post("/horarios", {

                        fecha: S.val(formulario, "fecha"),

                        horaInicio: S.val(
                            formulario,
                            "horaInicio"
                        ),

                        horaFin: S.val(
                            formulario,
                            "horaFin"
                        )
                    });

                    await recargar();

                    S.aviso("Horario creado correctamente");
                },

                "Crear horario"
            )
        );

        root.append(registro);

        // LISTADO

        const horariosRegistrados =
            await S.api("/horarios");

        const listado = S.tarjeta(
            "Horarios registrados"
        );

        const filas = horariosRegistrados.map(horario => {

            const acciones = crearBotones(
                [
                    "Eliminar",
                    "danger",
                    () => {

                        if (!confirmar("¿Eliminar horario?")) {
                            return;
                        }

                        ejecutarAccion(
                            () => S.del(
                                `/horarios/${horario.id}`
                            ),
                            "Horario eliminado"
                        );
                    }
                ]
            );

            return [
                horario.fecha,
                formatearHorario(horario),
                horario.disponible
                    ? "Disponible"
                    : "Ocupado",
                acciones
            ];
        });

        listado.append(
            S.tabla(
                [
                    "Fecha",
                    "Horario",
                    "Estado",
                    "Acciones"
                ],
                filas
            )
        );

        root.append(listado);
    }

    // ==========================================
    // GESTION DE SOLICITUDES
    // ==========================================

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

                            if (!confirmar("¿Rechazar solicitud?")) {
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
                                "¿Cancelar esta solicitud?"
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
                                "¿Eliminar definitivamente?"
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

    async function usuarios(root) {

        root.append(
            crearEncabezado(
                "Gestion de usuarios",
                "Creacion de cuentas y asignacion de roles."
            )
        );

        const [
            usuariosRegistrados,
            colegiosRegistrados
        ] = await Promise.all([
            S.api("/usuarios"),
            S.api("/colegios")
        ]);

        // CREAR USUARIO

        const registro = S.tarjeta(
            "Crear cuenta de usuario"
        );

        registro.append(
            S.formulario(
                [
                    {
                        nombre: "nombre",
                        etiqueta: "Nombre",
                        required: true
                    },
                    {
                        nombre: "correo",
                        etiqueta: "Correo electronico",
                        tipo: "email",
                        required: true
                    },
                    {
                        nombre: "contrasena",
                        etiqueta: "Contrasena inicial (minimo 8 caracteres)",
                        tipo: "password",
                        required: true
                    },
                    {
                        nombre: "tipo",
                        etiqueta: "Rol",
                        tipo: "select",

                        opciones: [
                            {
                                valor: "COLEGIO",
                                texto: "Usuario Colegio"
                            },
                            {
                                valor: "VOLUNTARIO",
                                texto: "Voluntario"
                            },
                            {
                                valor: "SEEA",
                                texto: "Encargado SEEA"
                            }
                        ]
                    },
                    {
                        nombre: "idColegio",
                        etiqueta: "Colegio asociado",
                        tipo: "select",

                        opciones: [
                            {
                                valor: "",
                                texto: "Ninguno"
                            },

                            ...colegiosRegistrados.map(
                                colegio => ({
                                    valor: colegio.id,
                                    texto: colegio.nombre
                                })
                            )
                        ]
                    },
                    {
                        nombre: "telefono",
                        etiqueta: "Telefono"
                    },
                    {
                        nombre: "carnet",
                        etiqueta: "Carnet del voluntario"
                    },
                    {
                        nombre: "carrera",
                        etiqueta: "Carrera"
                    },
                    {
                        nombre: "puesto",
                        etiqueta: "Puesto en SEEA"
                    }
                ],

                async formulario => {

                    const contrasena =
                        S.val(formulario, "contrasena");

                    if (contrasena.length < 8) {
                        S.aviso(
                            "La contrasena debe tener minimo 8 caracteres",
                            true
                        );
                        return false;
                    }

                    await S.post("/usuarios", {

                        nombre: S.val(formulario, "nombre"),

                        correo: S.val(formulario, "correo"),

                        contrasena,

                        tipo: S.val(formulario, "tipo"),

                        idColegio: S.num(
                            formulario,
                            "idColegio"
                        ),

                        telefono: S.val(
                            formulario,
                            "telefono"
                        ),

                        carnet: S.val(
                            formulario,
                            "carnet"
                        ),

                        carrera: S.val(
                            formulario,
                            "carrera"
                        ),

                        puesto: S.val(
                            formulario,
                            "puesto"
                        )
                    });

                    await recargar();

                    S.aviso("Usuario creado correctamente");
                },

                "Crear usuario"
            )
        );

        root.append(registro);

        // LISTADO DE USUARIOS

        const listado = S.tarjeta(
            "Usuarios registrados"
        );

        const filas = usuariosRegistrados.map(usuario => [
            usuario.nombre,
            usuario.correo,
            usuario.rol
        ]);

        listado.append(
            S.tabla(
                [
                    "Nombre",
                    "Correo",
                    "Rol"
                ],
                filas
            )
        );

        root.append(listado);
    }

    // ==========================================
    // NAVEGACION DEL PANEL
    // ==========================================

    const opciones = [
        {
            nombre: "Inicio",
            mostrar: inicio
        },
        {
            nombre: "Colegios",
            mostrar: colegios
        },
        {
            nombre: "Horarios",
            mostrar: horarios
        },
        {
            nombre: "Solicitudes",
            mostrar: solicitudes
        },
        {
            nombre: "Visitas",
            mostrar: visitas
        },
        {
            nombre: "Voluntarios",
            mostrar: voluntarios
        },
        {
            nombre: "Usuarios",
            mostrar: usuarios
        }
    ];

    // ==========================================
    // RECARGAR SECCION ACTUAL
    // ==========================================

    async function recargar() {

        const nombre = document.querySelector(
            "#nav button.active"
        )?.textContent?.trim() || "Inicio";

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
