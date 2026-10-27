
const SEEA = (() => {

    // ==========================================
    // ESTADO DEL USUARIO
    // ==========================================

    let usuarioActual = null;

    // ==========================================
    // FUNCIONES AUXILIARES DEL DOM
    // ==========================================

    function elemento(id) {
        return document.getElementById(id);
    }

    function crear(tag, texto = "", clase = "") {

        const elementoHTML = document.createElement(tag);

        elementoHTML.textContent = String(texto ?? "");

        if (clase) {
            elementoHTML.className = clase;
        }

        return elementoHTML;
    }

    function nodo(tag, clase = "") {

        const elementoHTML = document.createElement(tag);

        if (clase) {
            elementoHTML.className = clase;
        }

        return elementoHTML;
    }

    // ==========================================
    // MENSAJES Y NOTIFICACIONES
    // ==========================================

    function aviso(texto, esError = false) {

        const contenedor = elemento("aviso");

        if (!contenedor) {
            console.warn(texto);
            return;
        }

        contenedor.textContent = texto || "";

        contenedor.className = texto
            ? "notice" + (esError ? " error" : "")
            : "";
    }

    // ==========================================
    // PETICIONES A LA API
    // ==========================================

    async function api(ruta, opciones = {}) {

        const configuracion = {
            credentials: "same-origin",
            ...opciones,

            headers: {
                ...(opciones.body
                    ? { "Content-Type": "application/json" }
                    : {}),

                ...(opciones.headers || {})
            }
        };

        let respuesta;

        try {
            respuesta = await fetch(
                "/api" + ruta,
                configuracion
            );

        } catch (error) {
            throw new Error(
                "No se pudo conectar con el servidor SEEA"
            );
        }

        let datos;

        try {
            datos = await respuesta.json();

        } catch {
            datos = {
                mensaje: "Respuesta no válida del servidor"
            };
        }

        // Sesion expirada o usuario no autenticado
        if (respuesta.status === 401) {

            window.location.assign("/");

            throw new Error(
                "Debes iniciar sesión"
            );
        }

        if (!respuesta.ok) {
            throw new Error(
                datos.mensaje ||
                `Error HTTP ${respuesta.status}`
            );
        }

        return datos;
    }

    // ==========================================
    // METODOS HTTP
    // ==========================================

    function post(ruta, datos = {}) {

        return api(ruta, {
            method: "POST",
            body: JSON.stringify(datos)
        });
    }

    function patch(ruta, datos = {}) {

        return api(ruta, {
            method: "PATCH",
            body: JSON.stringify(datos)
        });
    }

    function del(ruta) {

        return api(ruta, {
            method: "DELETE"
        });
    }

    // ==========================================
    // OBTENER DATOS DE FORMULARIOS
    // ==========================================

    function campo(formulario, nombre) {

        return formulario.elements.namedItem(nombre);
    }

    function val(formulario, nombre) {

        return campo(formulario, nombre)?.value?.trim() || "";
    }

    function bool(formulario, nombre) {

        return Boolean(
            campo(formulario, nombre)?.checked
        );
    }

    function num(formulario, nombre) {

        const valor = val(formulario, nombre);

        if (valor === "") {
            return NaN;
        }

        return Number(valor);
    }

    // ==========================================
    // CREAR BOTONES
    // ==========================================

    function boton(texto, clase, accion) {

        const nuevoBoton = crear(
            "button",
            texto,
            clase
        );

        nuevoBoton.type = "button";

        nuevoBoton.addEventListener(
            "click",
            accion
        );

        return nuevoBoton;
    }

    // ==========================================
    // CREAR TABLAS
    // ==========================================

    function tabla(encabezados, filas) {

        const contenedor = nodo(
            "div",
            "table-wrap"
        );

        if (!filas.length) {

            contenedor.append(
                crear(
                    "p",
                    "No hay registros para mostrar.",
                    "empty"
                )
            );

            return contenedor;
        }

        const tablaHTML = nodo("table");

        const encabezado = nodo("thead");

        const filaEncabezado = nodo("tr");

        encabezados.forEach(titulo => {

            const th = crear(
                "th",
                titulo
            );

            filaEncabezado.append(th);
        });

        encabezado.append(filaEncabezado);

        tablaHTML.append(encabezado);

        // CUERPO DE LA TABLA

        const cuerpo = nodo("tbody");

        filas.forEach(celdas => {

            const fila = nodo("tr");

            celdas.forEach(contenido => {

                const td = nodo("td");

                if (contenido instanceof Node) {

                    td.append(contenido);

                } else {

                    td.append(
                        document.createTextNode(
                            String(contenido ?? "")
                        )
                    );
                }

                fila.append(td);
            });

            cuerpo.append(fila);
        });

        tablaHTML.append(cuerpo);

        contenedor.append(tablaHTML);

        return contenedor;
    }

    // ==========================================
    // CREAR TARJETAS
    // ==========================================

    function tarjeta(titulo) {

        const contenedor = nodo(
            "section",
            "card"
        );

        contenedor.append(
            crear("h2", titulo)
        );

        return contenedor;
    }

    // ==========================================
    // CREAR FORMULARIOS DINAMICOS
    // ==========================================

    function formulario(
        campos,
        onSubmit,
        textoBoton = "Guardar"
    ) {

        const formularioHTML = nodo("form");

        const cuadricula = nodo(
            "div",
            "grid"
        );

        campos.forEach(configuracion => {

            const label = crear(
                "label",
                configuracion.etiqueta
            );

            let input;

            // SELECT

            if (configuracion.tipo === "select") {

                input = nodo("select");

                const opciones =
                    configuracion.opciones || [];

                opciones.forEach(opcion => {

                    const elementoOpcion = crear(
                        "option",
                        opcion.texto
                    );

                    elementoOpcion.value = opcion.valor;

                    input.append(elementoOpcion);
                });

            // TEXTAREA

            } else if (
                configuracion.tipo === "textarea"
            ) {

                input = nodo("textarea");

                input.rows = 3;

            // INPUT

            } else {

                input = nodo("input");

                input.type =
                    configuracion.tipo || "text";

                if (
                    configuracion.min !== undefined
                ) {
                    input.min = configuracion.min;
                }

                if (
                    configuracion.max !== undefined
                ) {
                    input.max = configuracion.max;
                }
            }

            // CONFIGURACION GENERAL

            input.name = configuracion.nombre;

            if (configuracion.required) {
                input.required = true;
            }

            // CHECKBOX

            if (
                configuracion.tipo === "checkbox"
            ) {

                input.checked =
                    Boolean(configuracion.checked);

                label.prepend(input);

            } else {

                if (
                    configuracion.valor !== undefined
                ) {
                    input.value = configuracion.valor;
                }

                label.append(input);
            }

            cuadricula.append(label);
        });

        formularioHTML.append(cuadricula);

        // BOTON GUARDAR

        const acciones = nodo(
            "div",
            "form-actions"
        );

        const guardar = crear(
            "button",
            textoBoton,
            "primary"
        );

        guardar.type = "submit";

        acciones.append(guardar);

        formularioHTML.append(acciones);

        // EVENTO SUBMIT

        formularioHTML.addEventListener(
            "submit",
            async evento => {

                evento.preventDefault();

                guardar.disabled = true;

                try {

                    const resultado = await onSubmit(
                        formularioHTML
                    );

                    // Solo limpiar si la operacion
                    // fue exitosa
                    if (resultado !== false) {
                        formularioHTML.reset();
                    }

                } catch (error) {

                    aviso(error.message, true);

                } finally {

                    guardar.disabled = false;
                }
            }
        );

        return formularioHTML;
    }

    // ==========================================
    // NAVEGACION ENTRE SECCIONES
    // ==========================================

    function navegar(opciones) {

        const navegacion = elemento("nav");

        const contenido = elemento("contenido");

        const tituloPagina = elemento(
            "titulo-pagina"
        );

        if (!navegacion || !contenido) {
            throw new Error(
                "Faltan elementos de navegacion en el HTML"
            );
        }

        async function abrir(opcion, botonActivo) {

            navegacion
                .querySelectorAll("button")
                .forEach(botonNav => {

                    botonNav.classList.toggle(
                        "active",
                        botonNav === botonActivo
                    );
                });

            if (tituloPagina) {
                tituloPagina.textContent =
                    opcion.nombre;
            }

            contenido.replaceChildren();

            aviso("");

            try {

                await opcion.mostrar(contenido);

            } catch (error) {

                aviso(error.message, true);
            }

            const sidebar = document.querySelector(
                ".sidebar"
            );

            sidebar?.classList.remove("open");
        }

        opciones.forEach(opcion => {

            const botonNav = boton(
                opcion.nombre,
                "",
                () => abrir(opcion, botonNav)
            );

            navegacion.append(botonNav);
        });

        const primerBoton =
            navegacion.querySelector("button");

        if (opciones.length > 0) {
            abrir(opciones[0], primerBoton);
        }
    }

    // ==========================================
    // INICIAR PORTAL SEGUN ROL
    // ==========================================

    async function iniciar(rolEsperado) {

        usuarioActual = await api("/me");

        if (usuarioActual.rol !== rolEsperado) {

            const rutas = {
                SEEA: "/encargado",
                COLEGIO: "/colegio",
                VOLUNTARIO: "/voluntario"
            };

            window.location.assign(
                rutas[usuarioActual.rol] || "/"
            );

            throw new Error(
                "No tienes permisos para este portal"
            );
        }

        // MOSTRAR USUARIO

        const identidad = elemento("identidad");

        if (identidad) {
            identidad.textContent =
                `${usuarioActual.nombre} · ${usuarioActual.rol}`;
        }

        // CERRAR SESION

        const salir = elemento("salir");

        if (salir) {

            salir.addEventListener(
                "click",
                async () => {

                    try {

                        await post("/logout", {});

                        window.location.assign("/");

                    } catch (error) {

                        aviso(error.message, true);
                    }
                }
            );
        }

        // MENU MOVIL

        const menuMovil = elemento("menu-movil");

        if (menuMovil) {

            menuMovil.addEventListener(
                "click",
                () => {

                    document.querySelector(
                        ".sidebar"
                    )?.classList.toggle("open");
                }
            );
        }

        return usuarioActual;
    }

    // ==========================================
    // EXPORTAR FUNCIONES
    // ==========================================

    return {
        iniciar,
        api,
        post,
        patch,
        del,
        aviso,
        crear,
        nodo,
        boton,
        tabla,
        tarjeta,
        formulario,
        val,
        num,
        bool,
        navegar,

        get yo() {
            return usuarioActual;
        }
    };

})();
