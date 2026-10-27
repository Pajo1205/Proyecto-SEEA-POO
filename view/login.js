
// ==========================================
// ELEMENTOS DEL FORMULARIO
// ==========================================

const formulario = document.getElementById("login-form");

const aviso = document.getElementById("aviso");

const botonIngresar = formulario.querySelector(
    'button[type="submit"]'
);

// ==========================================
// RUTAS SEGUN TIPO DE USUARIO
// ==========================================

const rutas = {
    SEEA: "/encargado",
    COLEGIO: "/colegio",
    VOLUNTARIO: "/voluntario"
};

// ==========================================
// MOSTRAR MENSAJES
// ==========================================

function mostrarMensaje(mensaje, esError = false) {

    aviso.textContent = mensaje;

    aviso.className = mensaje
        ? "notice" + (esError ? " error" : "")
        : "";
}

// ==========================================
// INICIAR SESION
// ==========================================

formulario.addEventListener("submit", async evento => {

    // Evitar que la pagina se recargue
    evento.preventDefault();

    // Deshabilitar boton durante la peticion
    botonIngresar.disabled = true;

    mostrarMensaje("");

    try {

        // ==================================
        // OBTENER DATOS DEL FORMULARIO
        // ==================================

        const correo = formulario.elements.correo.value.trim();

        const contrasena = formulario.elements.contrasena.value;

        // ==================================
        // VALIDAR CAMPOS
        // ==================================

        if (!correo || !contrasena) {

            mostrarMensaje(
                "Debes ingresar tu correo y contraseña",
                true
            );

            return;
        }

        // ==================================
        // ENVIAR CREDENCIALES AL BACKEND
        // ==================================

        const respuesta = await fetch("/api/login", {

            method: "POST",

            credentials: "same-origin",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                correo,
                contrasena
            })
        });

        // ==================================
        // PROCESAR RESPUESTA
        // ==================================

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje || "Error al iniciar sesión"
            );
        }

        // ==================================
        // IDENTIFICAR ROL DEL USUARIO
        // ==================================

        const usuario = datos.usuario;

        if (!usuario || !usuario.rol) {

            throw new Error(
                "El servidor no devolvió un rol válido"
            );
        }

        // ==================================
        // REDIRIGIR AL PORTAL CORRESPONDIENTE
        // ==================================

        const ruta = rutas[usuario.rol];

        if (!ruta) {

            throw new Error(
                "Tipo de usuario no reconocido"
            );
        }

        mostrarMensaje("Inicio de sesión correcto");

        window.location.assign(ruta);

    } catch (error) {

        mostrarMensaje(
            error.message,
            true
        );

    } finally {

        // Habilitar nuevamente el boton
        botonIngresar.disabled = false;
    }
});
