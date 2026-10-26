const sonidoNext = new Audio("/assets/page_next.wav");
const sonidoBack = new Audio("/assets/page_back.wav");

function reproducirSonido(esVolver) {
    const sonido = esVolver ? sonidoBack : sonidoNext;
    sonido.currentTime = 0;
    sonido.play().catch(() => {});
}

document.addEventListener("click", evento => {
    const boton = evento.target.closest("button");
    if (!boton) return;

    const esVolver = [
        "volver-principal",
        "volver-colegios",
        "volver-horarios",
        "volver-solicitudes"
    ].some(clase => boton.classList.contains(clase));

    reproducirSonido(esVolver);
});

// MOSTRAR SECCIONES

function mostrar(id) {
    document.querySelectorAll(".seccion").forEach(seccion => {
        seccion.hidden = seccion.id !== id;
    });
}

// MENSAJES

let temporizadorMensaje = null;

function mensaje(texto) {
    const elemento = document.getElementById("mensaje");

    elemento.textContent = texto;
    clearTimeout(temporizadorMensaje);

    if (texto) {
        temporizadorMensaje = setTimeout(() => {
            elemento.textContent = "";
        }, 4000);
    }
}

// PETICIONES HTTP

async function peticion(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            resultado.mensaje || "Error en la operacion"
        );
    }

    return resultado;
}

async function enviar(url, datos) {
    try {
        const resultado = await peticion(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        mensaje(resultado.mensaje || "Guardado correctamente");
        await cargarDatos();
        return true;

    } catch (error) {
        mensaje(error.message);
        return false;
    }
}

// CARGAR DATOS

async function cargarDatos() {
    try {
        const [colegios, horarios, solicitudes] =
            await Promise.all([
                peticion("/colegios"),
                peticion("/horarios"),
                peticion("/solicitudes")
            ]);

        dibujarColegios(colegios);
        dibujarHorarios(horarios);
        dibujarSolicitudes(solicitudes);

        cargarSelectores(colegios, horarios);

    } catch (error) {
        mensaje("Error cargando datos: " + error.message);
    }
}

// CREAR ELEMENTOS DE LISTA

function crearItem(texto, extra = null) {
    const item = document.createElement("li");

    item.className =
        "list-group-item d-flex justify-content-between " +
        "align-items-center gap-2 flex-wrap";

    const span = document.createElement("span");
    span.textContent = texto;
    item.appendChild(span);

    if (extra) item.appendChild(extra);

    return item;
}

function listaVacia(id, texto) {
    const lista = document.getElementById(id);
    lista.innerHTML = "";

    const item = document.createElement("li");
    item.className = "list-group-item";
    item.textContent = texto;

    lista.appendChild(item);
}

// MOSTRAR COLEGIOS

function dibujarColegios(colegios) {
    const lista = document.getElementById("datos-colegios");
    lista.innerHTML = "";

    if (colegios.length === 0) {
        listaVacia("datos-colegios", "No hay colegios");
        return;
    }

    colegios.forEach(colegio => {
        const texto =
            `#${colegio.id} - ${colegio.nombre} - ` +
            `${colegio.direccion || "Sin direccion"} - ` +
            `${colegio.telefono || "Sin telefono"}`;

        const badge = document.createElement("span");

        badge.className = "badge " +
            (colegio.aliado
                ? "text-bg-primary"
                : "text-bg-secondary");

        badge.textContent =
            colegio.aliado ? "Aliado" : "No aliado";

        lista.appendChild(crearItem(texto, badge));
    });
}

// MOSTRAR HORARIOS

function dibujarHorarios(horarios) {
    const lista = document.getElementById("datos-horarios");
    lista.innerHTML = "";

    if (horarios.length === 0) {
        listaVacia("datos-horarios", "No hay horarios");
        return;
    }

    horarios.forEach(horario => {
        const texto =
            `#${horario.id} - ${horario.fecha} - ` +
            `${horario.horaInicio} a ${horario.horaFin}`;

        const badge = document.createElement("span");

        badge.className = "badge " +
            (horario.disponible
                ? "text-bg-success"
                : "text-bg-danger");

        badge.textContent =
            horario.disponible ? "Disponible" : "Ocupado";

        lista.appendChild(crearItem(texto, badge));
    });
}

// MOSTRAR SOLICITUDES

function dibujarSolicitudes(solicitudes) {
    const lista = document.getElementById("datos-solicitudes");
    lista.innerHTML = "";

    if (solicitudes.length === 0) {
        listaVacia("datos-solicitudes", "No hay solicitudes");
        return;
    }

    solicitudes.forEach(solicitud => {
        const actividades = [
            solicitud.solicitaTour ? "Tour" : null,
            solicitud.solicitaCharla ? "Charla" : null,
            solicitud.solicitaTaller ? "Taller" : null
        ].filter(Boolean).join(", ");

        const texto =
            `#${solicitud.id} - ${solicitud.colegio.nombre} - ` +
            `${solicitud.horario.fecha} - ` +
            `${actividades} - ${solicitud.estado}`;

        const acciones = document.createElement("span");
        acciones.className = "d-flex gap-2";

        if (solicitud.estado === "PENDIENTE") {
            acciones.appendChild(
                botonAccion(solicitud.id, "aprobar")
            );

            acciones.appendChild(
                botonAccion(solicitud.id, "rechazar")
            );
        }

        if (
            solicitud.estado !== "CANCELADA" &&
            solicitud.estado !== "RECHAZADA" &&
            solicitud.estado !== "FINALIZADA"
        ) {
            acciones.appendChild(
                botonAccion(solicitud.id, "cancelar")
            );
        }

        lista.appendChild(crearItem(texto, acciones));
    });
}

// SELECTORES DEL FORMULARIO

function cargarSelectores(colegios, horarios) {
    const selectColegio =
        document.getElementById("solicitud-colegio");

    const selectHorario =
        document.getElementById("solicitud-horario");

    const colegioSeleccionado = selectColegio.value;
    const horarioSeleccionado = selectHorario.value;

    selectColegio.innerHTML =
        '<option value="">Seleccione un colegio</option>';

    selectHorario.innerHTML =
        '<option value="">Seleccione un horario</option>';

    colegios.forEach(colegio => {
        const opcion = document.createElement("option");

        opcion.value = colegio.id;
        opcion.textContent = colegio.nombre;

        selectColegio.appendChild(opcion);
    });

    horarios
        .filter(h => h.disponible)
        .forEach(horario => {
            const opcion = document.createElement("option");

            opcion.value = horario.id;
            opcion.textContent =
                `${horario.fecha} - ` +
                `${horario.horaInicio} a ${horario.horaFin}`;

            selectHorario.appendChild(opcion);
        });

    selectColegio.value = colegioSeleccionado;
    selectHorario.value = horarioSeleccionado;

    if (selectColegio.selectedIndex === -1) {
        selectColegio.value = "";
    }

    if (selectHorario.selectedIndex === -1) {
        selectHorario.value = "";
    }
}

// BOTONES DE ACCIONES

function botonAccion(id, accion) {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.textContent = accion;

    const estilos = {
        aprobar: "btn btn-success btn-sm",
        rechazar: "btn btn-danger btn-sm",
        cancelar: "btn btn-warning btn-sm"
    };

    boton.className = estilos[accion];

    boton.addEventListener("click", () => {
        ejecutarAccion(id, accion);
    });

    return boton;
}

async function ejecutarAccion(id, accion) {
    try {
        const resultado = await peticion(
            `/solicitudes/${id}/${accion}`,
            { method: "PATCH" }
        );

        mensaje(resultado.mensaje);
        await cargarDatos();

    } catch (error) {
        mensaje(error.message);
    }
}

// BOTONES DE ELIMINACION

function botonEliminar(recurso, id) {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.className = "btn btn-danger btn-sm";
    boton.textContent = "Eliminar";

    boton.addEventListener("click", () => {
        eliminar(recurso, id);
    });

    return boton;
}

async function eliminar(recurso, id) {
    if (!confirm(`Eliminar ${recurso} #${id}?`)) {
        return;
    }

    try {
        const resultado = await peticion(
            `/${recurso}/${id}`,
            { method: "DELETE" }
        );

        mensaje(resultado.mensaje);
        await cargarDatos();
        await refrescarEliminar(recurso);

    } catch (error) {
        mensaje(error.message);
    }
}

// LISTAS DE ELIMINACION

function dibujarEliminarColegios(colegios) {
    const lista =
        document.getElementById("lista-eliminar-colegios");

    lista.innerHTML = "";

    if (colegios.length === 0) {
        listaVacia("lista-eliminar-colegios", "No hay colegios");
        return;
    }

    colegios.forEach(colegio => {
        lista.appendChild(
            crearItem(
                `#${colegio.id} - ${colegio.nombre}`,
                botonEliminar("colegios", colegio.id)
            )
        );
    });
}

function dibujarEliminarHorarios(horarios) {
    const lista =
        document.getElementById("lista-eliminar-horarios");

    lista.innerHTML = "";

    if (horarios.length === 0) {
        listaVacia("lista-eliminar-horarios", "No hay horarios");
        return;
    }

    horarios.forEach(horario => {
        lista.appendChild(
            crearItem(
                `#${horario.id} - ${horario.fecha} - ` +
                `${horario.horaInicio} a ${horario.horaFin}`,
                botonEliminar("horarios", horario.id)
            )
        );
    });
}

function dibujarEliminarSolicitudes(solicitudes) {
    const lista =
        document.getElementById("lista-eliminar-solicitudes");

    lista.innerHTML = "";

    if (solicitudes.length === 0) {
        listaVacia(
            "lista-eliminar-solicitudes",
            "No hay solicitudes"
        );
        return;
    }

    solicitudes.forEach(solicitud => {
        lista.appendChild(
            crearItem(
                `#${solicitud.id} - ` +
                `${solicitud.colegio.nombre} - ` +
                `${solicitud.estado}`,
                botonEliminar("solicitudes", solicitud.id)
            )
        );
    });
}

async function refrescarEliminar(recurso) {
    try {
        const datos = await peticion(`/${recurso}`);

        if (recurso === "colegios") {
            dibujarEliminarColegios(datos);
        } else if (recurso === "horarios") {
            dibujarEliminarHorarios(datos);
        } else {
            dibujarEliminarSolicitudes(datos);
        }

    } catch (error) {
        mensaje(error.message);
    }
}

// NAVEGACION

function conectarBoton(id, seccion, cargar = false) {
    document.getElementById(id).addEventListener(
        "click",
        async () => {
            if (cargar) await cargarDatos();
            mostrar(seccion);
        }
    );
}

conectarBoton("ir-colegios", "menu-colegios");
conectarBoton("ir-horarios", "menu-horarios");
conectarBoton("ir-solicitudes", "menu-solicitudes");

conectarBoton("ir-crear-colegio", "crear-colegio");
conectarBoton("ir-ver-colegios", "ver-colegios", true);

conectarBoton("ir-crear-horario", "crear-horario");
conectarBoton("ir-ver-horarios", "ver-horarios", true);

conectarBoton("ir-crear-solicitud", "crear-solicitud", true);
conectarBoton(
    "ir-gestionar-solicitudes",
    "gestionar-solicitudes",
    true
);

conectarBoton(
    "ir-eliminar-colegios",
    "eliminar-colegios"
);

conectarBoton(
    "ir-eliminar-horarios",
    "eliminar-horarios"
);

conectarBoton(
    "ir-eliminar-solicitudes",
    "eliminar-solicitudes"
);

document.querySelectorAll(".volver-principal").forEach(
    boton => boton.addEventListener(
        "click", () => mostrar("menu-principal")
    )
);

document.querySelectorAll(".volver-colegios").forEach(
    boton => boton.addEventListener(
        "click", () => mostrar("menu-colegios")
    )
);

document.querySelectorAll(".volver-horarios").forEach(
    boton => boton.addEventListener(
        "click", () => mostrar("menu-horarios")
    )
);

document.querySelectorAll(".volver-solicitudes").forEach(
    boton => boton.addEventListener(
        "click", () => mostrar("menu-solicitudes")
    )
);

// FORMULARIO COLEGIO

document.getElementById("form-colegio")
    .addEventListener("submit", async evento => {
        evento.preventDefault();

        const correcto = await enviar("/colegios", {
            nombre: document.getElementById("colegio-nombre").value,
            direccion: document.getElementById("colegio-direccion").value,
            telefono: document.getElementById("colegio-telefono").value,
            correo: document.getElementById("colegio-correo").value,
            aliado: document.getElementById("colegio-aliado").checked
        });

        if (correcto) {
            evento.target.reset();
        }
    });

// FORMULARIO HORARIO

document.getElementById("form-horario")
    .addEventListener("submit", async evento => {
        evento.preventDefault();

        const correcto = await enviar("/horarios", {
            fecha: document.getElementById("horario-fecha").value,
            horaInicio: document.getElementById("horario-inicio").value,
            horaFin: document.getElementById("horario-fin").value
        });

        if (correcto) {
            evento.target.reset();
        }
    });

// FORMULARIO SOLICITUD

document.getElementById("form-solicitud")
    .addEventListener("submit", async evento => {
        evento.preventDefault();

        const correcto = await enviar("/solicitudes", {
            idColegio: Number(
                document.getElementById("solicitud-colegio").value
            ),
            idHorario: Number(
                document.getElementById("solicitud-horario").value
            ),
            cantidadEstudiantes: Number(
                document.getElementById("solicitud-estudiantes").value
            ),
            cantidadProfesores: Number(
                document.getElementById("solicitud-profesores").value
            ),
            grado: document.getElementById("solicitud-grado").value,
            transporte: document.getElementById("solicitud-transporte").value,
            solicitaTour: document.getElementById("solicitud-tour").checked,
            solicitaCharla: document.getElementById("solicitud-charla").checked,
            solicitaTaller: document.getElementById("solicitud-taller").checked,
            observaciones:
                document.getElementById("solicitud-observaciones").value
        });

        if (correcto) {
            evento.target.reset();
        }
    });

// INICIO

mostrar("menu-principal");

cargarDatos();
refrescarEliminar("colegios");
refrescarEliminar("horarios");
refrescarEliminar("solicitudes");