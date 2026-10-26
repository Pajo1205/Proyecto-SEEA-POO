const sonidoNext = new Audio("/assets/page_next.wav");
const sonidoBack = new Audio("/assets/page_back.wav");

function reproducirSonido(esVolver) {
    const sonido = esVolver ? sonidoBack : sonidoNext;
    sonido.currentTime = 0;
    sonido.play().catch(() => {});
}

document.addEventListener("click", evento => {
    const boton = evento.target.closest("button");

    if (!boton) {
        return;
    }

    const esVolver =
        boton.classList.contains("volver-principal") ||
        boton.classList.contains("volver-colegios") ||
        boton.classList.contains("volver-horarios") ||
        boton.classList.contains("volver-solicitudes");

    reproducirSonido(esVolver);
});

function mostrar(id) {
    document.querySelectorAll(".seccion").forEach(seccion => {
        seccion.hidden = seccion.id !== id;
    });
}

let temporizadorMensaje = null;

function mensaje(texto) {
    const elemento = document.getElementById("mensaje");
    elemento.textContent = texto;

    clearTimeout(temporizadorMensaje);

    if (texto) {
        temporizadorMensaje = setTimeout(() => {
            elemento.textContent = "";
        }, 3000);
    }
}

async function enviar(url, datos) {
    const respuesta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();
    mensaje(resultado.mensaje || "listo");

    await cargarDatos();
}

async function cargarDatos() {
    const colegios = await fetch("/colegios").then(r => r.json());
    const horarios = await fetch("/horarios").then(r => r.json());
    const solicitudes = await fetch("/solicitudes").then(r => r.json());

    dibujarColegios(colegios);
    dibujarHorarios(horarios);
    dibujarSolicitudes(solicitudes);
}

function crearItem(texto, extra) {
    const item = document.createElement("li");
    item.className =
        "list-group-item d-flex justify-content-between align-items-center gap-2 flex-wrap";

    const span = document.createElement("span");
    span.textContent = texto;
    item.appendChild(span);

    if (extra) {
        item.appendChild(extra);
    }

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

function dibujarColegios(colegios) {
    const lista = document.getElementById("datos-colegios");
    lista.innerHTML = "";

    if (colegios.length === 0) {
        return listaVacia("datos-colegios", "no hay colegios");
    }

    colegios.forEach(colegio => {
        const texto =
            `#${colegio.id} · ${colegio.nombre}` +
            ` · ${colegio.direccion || "sin direccion"}` +
            ` · ${colegio.telefono || "sin telefono"}` +
            ` · ${colegio.correo || "sin correo"}`;

        const badge = document.createElement("span");
        badge.className = "badge " +
            (colegio.aliado ? "text-bg-primary" : "text-bg-secondary");
        badge.textContent = colegio.aliado ? "Aliado" : "No aliado";

        lista.appendChild(crearItem(texto, badge));
    });
}

function dibujarHorarios(horarios) {
    const lista = document.getElementById("datos-horarios");
    lista.innerHTML = "";

    if (horarios.length === 0) {
        return listaVacia("datos-horarios", "no hay horarios");
    }

    horarios.forEach(horario => {
        const texto =
            `#${horario.id} · ${horario.fecha}` +
            ` · ${horario.horaInicio} - ${horario.horaFin}`;

        const badge = document.createElement("span");
        badge.className = "badge " +
            (horario.disponible ? "text-bg-success" : "text-bg-danger");
        badge.textContent = horario.disponible ? "Disponible" : "Ocupado";

        lista.appendChild(crearItem(texto, badge));
    });
}

function dibujarSolicitudes(solicitudes) {
    const lista = document.getElementById("datos-solicitudes");
    lista.innerHTML = "";

    if (solicitudes.length === 0) {
        return listaVacia("datos-solicitudes", "no hay solicitudes");
    }

    solicitudes.forEach(solicitud => {
        const actividades = [
            solicitud.solicitaTour ? "tour" : null,
            solicitud.solicitaCharla ? "charla" : null,
            solicitud.solicitaTaller ? "taller" : null
        ].filter(Boolean).join(", ") || "sin actividades";

        const texto =
            `#${solicitud.id} · ${solicitud.colegio.nombre}` +
            ` · ${solicitud.horario.fecha} ` +
            `${solicitud.horario.horaInicio}-${solicitud.horario.horaFin}` +
            ` · ${actividades} · ${solicitud.estado}`;

        const acciones = document.createElement("span");
        acciones.className = "d-flex gap-2";

        if (solicitud.estado === "PENDIENTE") {
            acciones.appendChild(botonAccion(solicitud.id, "aprobar"));
            acciones.appendChild(botonAccion(solicitud.id, "rechazar"));
        }

        if (solicitud.estado !== "CANCELADA" &&
            solicitud.estado !== "RECHAZADA" &&
            solicitud.estado !== "FINALIZADA") {
            acciones.appendChild(botonAccion(solicitud.id, "cancelar"));
        }

        lista.appendChild(crearItem(texto, acciones));
    });
}

function dibujarEliminarColegios(colegios) {
    const lista = document.getElementById("lista-eliminar-colegios");
    lista.innerHTML = "";

    if (colegios.length === 0) {
        return listaVacia("lista-eliminar-colegios", "no hay colegios");
    }

    colegios.forEach(colegio => {
        const texto = `#${colegio.id} · ${colegio.nombre}`;
        lista.appendChild(
            crearItem(texto, botonEliminar("colegios", colegio.id))
        );
    });
}

function dibujarEliminarHorarios(horarios) {
    const lista = document.getElementById("lista-eliminar-horarios");
    lista.innerHTML = "";

    if (horarios.length === 0) {
        return listaVacia("lista-eliminar-horarios", "no hay horarios");
    }

    horarios.forEach(horario => {
        const texto =
            `#${horario.id} · ${horario.fecha}` +
            ` · ${horario.horaInicio} - ${horario.horaFin}`;
        lista.appendChild(
            crearItem(texto, botonEliminar("horarios", horario.id))
        );
    });
}

function dibujarEliminarSolicitudes(solicitudes) {
    const lista = document.getElementById("lista-eliminar-solicitudes");
    lista.innerHTML = "";

    if (solicitudes.length === 0) {
        return listaVacia("lista-eliminar-solicitudes", "no hay solicitudes");
    }

    solicitudes.forEach(solicitud => {
        const texto =
            `#${solicitud.id} · ${solicitud.colegio.nombre}` +
            ` · ${solicitud.horario.fecha}` +
            ` · ${solicitud.estado}`;
        lista.appendChild(
            crearItem(texto, botonEliminar("solicitudes", solicitud.id))
        );
    });
}

function botonEliminar(recurso, id) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn btn-danger btn-sm";
    boton.textContent = "Eliminar";
    boton.addEventListener("click", () => eliminar(recurso, id));
    return boton;
}

async function eliminar(recurso, id) {
    const nombres = {
        colegios: "colegio",
        horarios: "horario",
        solicitudes: "solicitud"
    };

    if (!confirm(`¿Eliminar ${nombres[recurso]} #${id}?`)) {
        return;
    }

    const respuesta = await fetch(`/${recurso}/${id}`, {
        method: "DELETE"
    });

    const resultado = await respuesta.json();
    mensaje(resultado.mensaje || "listo");

    await cargarDatos();
    await refrescarEliminar(recurso);
}

async function refrescarEliminar(recurso) {
    if (recurso === "colegios") {
        const colegios = await fetch("/colegios").then(r => r.json());
        dibujarEliminarColegios(colegios);
    } else if (recurso === "horarios") {
        const horarios = await fetch("/horarios").then(r => r.json());
        dibujarEliminarHorarios(horarios);
    } else {
        const solicitudes = await fetch("/solicitudes").then(r => r.json());
        dibujarEliminarSolicitudes(solicitudes);
    }
}

function botonAccion(id, accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = accion;

    const estilos = {
        aprobar: "btn btn-success btn-sm",
        rechazar: "btn btn-danger btn-sm",
        cancelar: "btn btn-warning btn-sm"
    };

    boton.className = estilos[accion] || "btn btn-secondary btn-sm";
    boton.addEventListener("click", () => ejecutarAccion(id, accion));
    return boton;
}

async function ejecutarAccion(id, accion) {
    const respuesta = await fetch(
        `/solicitudes/${id}/${accion}`,
        { method: "PATCH" }
    );

    const resultado = await respuesta.json();
    mensaje(resultado.mensaje || "listo");

    await cargarDatos();
}

document.getElementById("ir-colegios")
    .addEventListener("click", () => mostrar("menu-colegios"));

document.getElementById("ir-horarios")
    .addEventListener("click", () => mostrar("menu-horarios"));

document.getElementById("ir-solicitudes")
    .addEventListener("click", () => mostrar("menu-solicitudes"));

document.getElementById("ir-crear-colegio")
    .addEventListener("click", () => mostrar("crear-colegio"));

document.getElementById("ir-ver-colegios")
    .addEventListener("click", async () => {
        await cargarDatos();
        mostrar("ver-colegios");
    });

document.getElementById("ir-crear-horario")
    .addEventListener("click", () => mostrar("crear-horario"));

document.getElementById("ir-ver-horarios")
    .addEventListener("click", async () => {
        await cargarDatos();
        mostrar("ver-horarios");
    });

document.getElementById("ir-crear-solicitud")
    .addEventListener("click", () => mostrar("crear-solicitud"));

document.getElementById("ir-gestionar-solicitudes")
    .addEventListener("click", async () => {
        await cargarDatos();
        mostrar("gestionar-solicitudes");
    });

document.getElementById("ir-eliminar-colegios")
    .addEventListener("click", async () => {
        const colegios = await fetch("/colegios").then(r => r.json());
        dibujarEliminarColegios(colegios);
        mostrar("eliminar-colegios");
    });

document.getElementById("ir-eliminar-horarios")
    .addEventListener("click", async () => {
        const horarios = await fetch("/horarios").then(r => r.json());
        dibujarEliminarHorarios(horarios);
        mostrar("eliminar-horarios");
    });

document.getElementById("ir-eliminar-solicitudes")
    .addEventListener("click", async () => {
        const solicitudes = await fetch("/solicitudes").then(r => r.json());
        dibujarEliminarSolicitudes(solicitudes);
        mostrar("eliminar-solicitudes");
    });

document.querySelectorAll(".volver-principal").forEach(boton =>
    boton.addEventListener("click", () => mostrar("menu-principal"))
);

document.querySelectorAll(".volver-colegios").forEach(boton =>
    boton.addEventListener("click", () => mostrar("menu-colegios"))
);

document.querySelectorAll(".volver-horarios").forEach(boton =>
    boton.addEventListener("click", () => mostrar("menu-horarios"))
);

document.querySelectorAll(".volver-solicitudes").forEach(boton =>
    boton.addEventListener("click", () => mostrar("menu-solicitudes"))
);

document.getElementById("form-colegio")
    .addEventListener("submit", async evento => {
        evento.preventDefault();
        await enviar("/colegios", {
            nombre: document.getElementById("colegio-nombre").value,
            direccion: document.getElementById("colegio-direccion").value,
            telefono: document.getElementById("colegio-telefono").value,
            correo: document.getElementById("colegio-correo").value,
            aliado: document.getElementById("colegio-aliado").checked
        });
    });

document.getElementById("form-horario")
    .addEventListener("submit", async evento => {
        evento.preventDefault();
        await enviar("/horarios", {
            fecha: document.getElementById("horario-fecha").value,
            horaInicio: document.getElementById("horario-inicio").value,
            horaFin: document.getElementById("horario-fin").value
        });
    });

document.getElementById("form-solicitud")
    .addEventListener("submit", async evento => {
        evento.preventDefault();
        await enviar("/solicitudes", {
            idColegio: Number(document.getElementById("solicitud-colegio").value),
            idHorario: Number(document.getElementById("solicitud-horario").value),
            cantidadEstudiantes: Number(document.getElementById("solicitud-estudiantes").value),
            cantidadProfesores: Number(document.getElementById("solicitud-profesores").value),
            grado: document.getElementById("solicitud-grado").value,
            transporte: document.getElementById("solicitud-transporte").value,
            solicitaTour: document.getElementById("solicitud-tour").checked,
            solicitaCharla: document.getElementById("solicitud-charla").checked,
            solicitaTaller: document.getElementById("solicitud-taller").checked,
            observaciones: document.getElementById("solicitud-observaciones").value
        });
    });

mostrar("menu-principal");
cargarDatos();
