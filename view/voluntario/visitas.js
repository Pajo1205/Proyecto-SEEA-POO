export function crearModulo(S, contexto) {
  const { crearEncabezado, formatearHorario, formatearActividades } = contexto;
  const recargar = (...args) => contexto.recargar(...args);


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

return { visitas };
}
