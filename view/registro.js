
const formulario = document.getElementById("registro-form");

const aviso = document.getElementById("aviso");

const selectorColegio = document.getElementById("idColegio");

const selectorCarrera = document.getElementById("carrera");

let colegios = [];

// ==========================================
// MOSTRAR MENSAJES
// ==========================================

function mensaje(texto, fallo = false) {

    aviso.textContent = texto;

    aviso.className = texto
        ? "notice" + (fallo ? " error" : "")
        : "";
}

// ==========================================
// CONSULTAR DATOS
// ==========================================

async function obtener(ruta) {

    const respuesta = await fetch(ruta, {
        credentials: "same-origin"
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            datos.mensaje || "Error al consultar datos"
        );
    }

    return datos;
}

// ==========================================
// ELEGIR TIPO DE USUARIO
// ==========================================

async function elegirTipo(tipo) {

    formulario.reset();

    mensaje("");

    formulario.elements.tipo.value = tipo;

    document.getElementById(
        "seleccion-tipo"
    ).hidden = true;

    document.getElementById(
        "seccion-formulario"
    ).hidden = false;

    const colegio = tipo === "COLEGIO";

    document.getElementById(
        "campos-colegio"
    ).hidden = !colegio;

    document.getElementById(
        "campos-voluntario"
    ).hidden = colegio;

    document.getElementById(
        "campo-otra-carrera"
    ).hidden = true;

    formulario.elements.telefono.required = colegio;
    selectorColegio.required = colegio;

    formulario.elements.carnet.required = !colegio;
    selectorCarrera.required = !colegio;

    formulario.elements.otraCarrera.required = false;

    document.getElementById(
        "titulo-registro"
    ).textContent = colegio
        ? "Usuario de colegio"
        : "Voluntario UVG";

    const correo = document.getElementById(
        "correo-registro"
    );

    correo.placeholder = colegio
        ? "correo@colegio.edu.gt"
        : "nombre@uvg.edu.gt";

    correo.pattern = colegio
        ? ""
        : "[^@\\s]+@uvg\\.edu\\.gt";

    try {

        if (colegio) {

            colegios = await obtener(
                "/api/registro/colegios"
            );

            selectorColegio.replaceChildren(
                new Option("Seleccionar colegio", "")
            );

            colegios.forEach(c => {

                selectorColegio.add(
                    new Option(c.nombre, c.id)
                );
            });

            if (!colegios.length) {
                mensaje(
                    "SEEA todavía no ha registrado colegios.",
                    true
                );
            }

        } else {

            const carreras = await obtener(
                "/api/registro/carreras"
            );

            selectorCarrera.replaceChildren(
                new Option("Seleccionar carrera", "")
            );

            carreras.forEach(c => {

                selectorCarrera.add(
                    new Option(c, c)
                );
            });
        }

    } catch (err) {

        mensaje(err.message, true);
    }
}

// ==========================================
// BOTONES DE SELECCION
// ==========================================

document.querySelectorAll("[data-tipo]").forEach(
    boton => {

        boton.addEventListener("click", () => {

            elegirTipo(boton.dataset.tipo);
        });
    }
);

// ==========================================
// VOLVER A SELECCION
// ==========================================

document.getElementById(
    "volver-tipo"
).addEventListener("click", () => {

    document.getElementById(
        "seccion-formulario"
    ).hidden = true;

    document.getElementById(
        "seleccion-tipo"
    ).hidden = false;

    mensaje("");
});

// ==========================================
// MOSTRAR DIRECCION DEL COLEGIO
// ==========================================

selectorColegio.addEventListener("change", () => {

    const colegio = colegios.find(
        c => c.id === Number(selectorColegio.value)
    );

    document.getElementById(
        "direccion-colegio"
    ).textContent = colegio
        ? `Dirección: ${colegio.direccion}`
        : "";
});

// ==========================================
// OPCION OTRA CARRERA
// ==========================================

selectorCarrera.addEventListener("change", () => {

    const otra = selectorCarrera.value === "Otro";

    document.getElementById(
        "campo-otra-carrera"
    ).hidden = !otra;

    formulario.elements.otraCarrera.required = otra;

    if (!otra) {
        formulario.elements.otraCarrera.value = "";
    }
});

// ==========================================
// REGISTRAR USUARIO
// ==========================================

formulario.addEventListener("submit", async evento => {

    evento.preventDefault();

    const f = formulario.elements;

    if (
        f.contrasena.value !==
        f.confirmarContrasena.value
    ) {
        return mensaje(
            "Las contraseñas no coinciden",
            true
        );
    }

    const tipo = f.tipo.value;

    const body = {
        tipo,
        nombre: f.nombre.value.trim(),
        correo: f.correo.value.trim().toLowerCase(),
        contrasena: f.contrasena.value,
        confirmarContrasena: f.confirmarContrasena.value
    };

    if (tipo === "COLEGIO") {

        body.telefono = f.telefono.value.trim();

        body.idColegio = Number(
            f.idColegio.value
        );

    } else {

        body.carnet = f.carnet.value.trim();

        body.carrera = f.carrera.value;

        body.otraCarrera = f.otraCarrera.value.trim();
    }

    const boton = formulario.querySelector(
        'button[type="submit"]'
    );

    boton.disabled = true;

    try {

        const respuesta = await fetch(
            "/api/registro",
            {
                method: "POST",

                credentials: "same-origin",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(body)
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                datos.mensaje || "No se pudo registrar"
            );
        }

        mensaje(
            "Cuenta creada. Ya podés iniciar sesión."
        );

        formulario.reset();

        setTimeout(() => {
            location.assign("/");
        }, 1200);

    } catch (err) {

        mensaje(err.message, true);

    } finally {

        boton.disabled = false;
    }
});
