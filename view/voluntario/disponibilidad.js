export function crearModulo(S, contexto) {
  const { crearEncabezado, formatearHorario, formatearActividades } = contexto;
  const recargar = (...args) => contexto.recargar(...args);


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

return { disponibilidades };
}
