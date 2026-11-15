export function crearModulo(S, contexto) {
  const { crearBotones, confirmar, ejecutarAccion, crearEncabezado, formatearHorario, formatearActividades, camposColegio } = contexto;
  const recargar = (...args) => contexto.recargar(...args);


async function colegios(root) {

    root.append(
        crearEncabezado(
            "Gestion de colegios",
            "Registro y administracion de colegios aliados y no aliados."
        )
    );

    // ======================================
    // REGISTRAR COLEGIO ALIADO
    // ======================================

    const registro = S.tarjeta(
        "Registrar colegio aliado"
    );

    registro.append(
        S.formulario(
            camposColegio,

            async formulario => {

                await S.post("/colegios", {

                    nombre: S.val(
                        formulario,
                        "nombre"
                    ),

                    direccion: S.val(
                        formulario,
                        "direccion"
                    ),

                    telefono: S.val(
                        formulario,
                        "telefono"
                    ),

                    correo: S.val(
                        formulario,
                        "correo"
                    )
                });

                await recargar();

                S.aviso(
                    "Colegio aliado registrado correctamente"
                );
            },

            "Registrar colegio aliado"
        )
    );

    root.append(registro);

    // ======================================
    // CONSULTAR COLEGIOS
    // ======================================

    const colegiosRegistrados =
        await S.api("/colegios");

    const listado = S.tarjeta(
        "Colegios registrados"
    );

    const filas = colegiosRegistrados.map(colegio => {

        // ==================================
        // BOTONES DE ACCION
        // ==================================

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

        // ==================================
        // DATOS DE LA TABLA
        // ==================================

        return [
            colegio.nombre,

            `${colegio.correo || "-"} · ${colegio.telefono || "-"}`,

            colegio.aliado
                ? "Aliado"
                : "No aliado",

            acciones
        ];
    });

    // ======================================
    // MOSTRAR TABLA
    // ======================================

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

    // ======================================
    // ACTUALIZAR NOMBRE
    // ======================================

    await ejecutarAccion(
        () => S.patch(
            `/colegios/${colegio.id}`,
            {
                nombre: nombre.trim()
            }
        ),

        "Colegio actualizado correctamente"
    );
}


    // ==========================================
    // GESTION DE HORARIOS
    // ==========================================

return { colegios };
}
