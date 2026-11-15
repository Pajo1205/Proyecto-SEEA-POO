export function crearModulo(S, contexto) {
  const { crearEncabezado, formatearHorario, obtenerActividades } = contexto;
  const recargar = (...args) => contexto.recargar(...args);


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

return { misVisitas };
}
