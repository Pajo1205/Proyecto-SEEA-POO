export function crearModulo(S, contexto) {
  const { crearBotones, confirmar, ejecutarAccion, crearEncabezado, formatearHorario, formatearActividades, camposColegio } = contexto;
  const recargar = (...args) => contexto.recargar(...args);


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

                        if (!confirmar("Â¿Eliminar horario?")) {
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

return { horarios };
}
