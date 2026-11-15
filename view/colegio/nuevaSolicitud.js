export function crearModulo(S, contexto) {
  const { crearEncabezado, formatearHorario, obtenerActividades } = contexto;
  const recargar = (...args) => contexto.recargar(...args);


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

return { crearSolicitud };
}
