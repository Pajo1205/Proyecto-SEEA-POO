
const formulario = document.getElementById("registro-form");
const aviso = document.getElementById("aviso");

const selectorColegio = document.getElementById("idColegio");
const selectorCarrera = document.getElementById("carrera");

const camposOtroColegio = document.getElementById(
    "campos-otro-colegio"
);

let colegios = [];

// ==========================================
// MENSAJES
// ==========================================

function mensaje(texto, fallo = false) {
    aviso.textContent = texto;
    aviso.className = texto
        ? "notice" + (fallo ? " error" : "")
        : "";
}

// ==========================================
// CONSULTAR API
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
// MOSTRAR OTRO COLEGIO
// ==========================================

function actualizarOtroColegio() {
    const otro = selectorColegio.value === "OTRO";

    camposOtroColegio.hidden = !otro;

    formulario.elements.nombreColegio.required = otro;
    formulario.elements.direccionColegio.required = otro;

    if (!otro) {
        formulario.elements.nombreColegio.value = "";
        formulario.elements.direccionColegio.value = "";
    }
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

    const esColegio = tipo === "COLEGIO";

    document.getElementById(
        "campos-colegio"
    ).hidden = !esColegio;

    document.getElementById(
        "campos-voluntario"
    ).hidden = esColegio;

    document.getElementById(
        "campo-otra-carrera"
    ).hidden = true;

    camposOtroColegio.hidden = true;

    formulario.elements.telefono.required = esColegio;
    selectorColegio.required = esColegio;

    formulario.elements.carnet.required = !esColegio;
    selectorCarrera.required = !esColegio;

    formulario.elements.nombreColegio.required = false;
    formulario.elements.direccionColegio.required = false;
    formulario.elements.otraCarrera.required = false;

    document.getElementById(
        "titulo-registro"
    ).textContent = esColegio
        ? "Registro de usuario de colegio"
        : "Registro de voluntario UVG";

    const correo = document.getElementById(
        "correo-registro"
    );

    correo.placeholder = esColegio
        ? "correo@colegio.edu.gt"
        : "nombre@uvg.edu.gt";

    correo.pattern = esColegio
        ? "[^@\\s]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        : "[^@\\s]+@uvg\\.edu\\.gt";

    try {
        if (esColegio) {
            colegios = await obtener(
                "/api/registro/colegios"
            );

            selectorColegio.replaceChildren(
                new Option("Seleccionar colegio", "")
            );

            colegios.forEach(colegio => {
                selectorColegio.add(
                    new Option(
                        colegio.nombre,
                        String(colegio.id)
                    )
                );
            });

            selectorColegio.add(
                new Option(
                    "Otro colegio (no aparece en la lista)",
                    "OTRO"
                )
            );

        } else {
            const carreras = await obtener(
                "/api/registro/carreras"
            );

            selectorCarrera.replaceChildren(
                new Option("Seleccionar carrera", "")
            );

            carreras.forEach(carrera => {
                selectorCarrera.add(
                    new Option(carrera, carrera)
                );
            });
        }
    } catch (error) {
        mensaje(error.message, true);
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
// SELECCION DE COLEGIO
// ==========================================

selectorColegio.addEventListener("change", () => {
    actualizarOtroColegio();

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
// OTRA CARRERA
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
// ENVIAR REGISTRO
// ==========================================

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    mensaje("");

    const f = formulario.elements;

    if (f.contrasena.value !== f.confirmarContrasena.value) {
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

        if (selectorColegio.value === "OTRO") {
            body.idColegio = "OTRO";
            body.nombreColegio =
                f.nombreColegio.value.trim();
            body.direccionColegio =
                f.direccionColegio.value.trim();
        } else {
            body.idColegio = selectorColegio.value;
        }
    }

    if (tipo === "VOLUNTARIO") {
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

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                "No se pudo registrar la cuenta"
            );
        }

        mensaje(
            "Cuenta creada correctamente. Ya podés iniciar sesión."
        );

        formulario.reset();

        setTimeout(() => {
            location.assign("/");
        }, 1200);

    } catch (error) {
        mensaje(error.message, true);

    } finally {
        boton.disabled = false;
    }
});
