
const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");

// ==========================================
// IMPORTAR MODELO Y CONTROLADOR
// ==========================================

const datos = require("./datos");

const EncargadoSEEA = require("./Modelo/EncargadoSEEA");

const { router: api } = require("./controller/api");

// ==========================================
// CONFIGURACION DEL SERVIDOR
// ==========================================

const app = express();

const PORT = process.env.PORT || 3000;

const VIEW_PATH = path.join(__dirname, "view");

// ==========================================
// MIDDLEWARE GENERAL
// ==========================================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// ==========================================
// CONFIGURACION DE SESIONES
// ==========================================

const SESSION_SECRET = process.env.SEEA_SESSION_SECRET;

if (!SESSION_SECRET) {
    throw new Error(
        "Debes configurar SEEA_SESSION_SECRET"
    );
}

app.use(session({
    name: "seea.sid",

    secret: SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 2
    }
}));

// ==========================================
// CREAR PRIMER ENCARGADO SEEA
// ==========================================

async function inicializarAdministrador() {

    const correo = process.env.SEEA_ADMIN_EMAIL;
    const contrasena = process.env.SEEA_ADMIN_PASSWORD;

    if (!correo || !contrasena) {
        throw new Error(
            "Debes configurar SEEA_ADMIN_EMAIL y SEEA_ADMIN_PASSWORD"
        );
    }

    if (contrasena.length < 8) {
        throw new Error(
            "La contraseña del administrador debe tener al menos 8 caracteres"
        );
    }

    const existe = datos.usuarios.some(
        usuario =>
            usuario.correo.toLowerCase() ===
            correo.trim().toLowerCase()
    );

    if (existe) {
        return;
    }

    const hash = await bcrypt.hash(contrasena, 12);

    const administrador = new EncargadoSEEA(
        datos.generarId("usuario"),
        "Administrador SEEA",
        correo.trim().toLowerCase(),
        hash,
        "Administrador"
    );

    datos.usuarios.push(administrador);

    console.log("Administrador SEEA inicializado");
}

// ==========================================
// FUNCIONES DE AUTENTICACION
// ==========================================

function obtenerUsuario(req) {

    const id = req.session?.usuarioId;

    if (!id) {
        return null;
    }

    return datos.usuarios.find(
        usuario => usuario.id === id
    ) || null;
}

// ==========================================
// VERIFICAR SESION
// ==========================================

function requiereSesion(req, res, next) {

    const usuario = obtenerUsuario(req);

    if (!usuario) {
        return res.redirect("/");
    }

    req.usuario = usuario;

    next();
}

// ==========================================
// VERIFICAR ROL
// ==========================================

function requiereRol(rolPermitido) {

    return (req, res, next) => {

        const usuario = obtenerUsuario(req);

        if (!usuario) {
            return res.redirect("/");
        }

        if (usuario.rol !== rolPermitido) {
            return res.status(403).send(
                "No tienes permiso para acceder a esta pagina"
            );
        }

        req.usuario = usuario;

        next();
    };
}

// ==========================================
// ARCHIVOS PUBLICOS
// ==========================================

// Estilos generales
app.get("/style.css", (req, res) => {

    res.sendFile(
        path.join(VIEW_PATH, "style.css")
    );
});

// JavaScript del inicio de sesion
app.get("/login.js", (req, res) => {

    res.sendFile(
        path.join(VIEW_PATH, "login.js")
    );
});

// ==========================================
// PAGINA PRINCIPAL
// ==========================================

app.get("/", (req, res) => {

    const usuario = obtenerUsuario(req);

    if (!usuario) {
        return res.sendFile(
            path.join(VIEW_PATH, "login.html")
        );
    }

    const rutas = {
        SEEA: "/encargado",
        COLEGIO: "/colegio",
        VOLUNTARIO: "/voluntario"
    };

    return res.redirect(
        rutas[usuario.rol] || "/"
    );
});

// ==========================================
// RUTAS DE LA API
// ==========================================

app.use("/api", api);

// ==========================================
// JAVASCRIPT COMPARTIDO
// ==========================================

app.get(
    "/comun.js",
    requiereSesion,
    (req, res) => {

        res.sendFile(
            path.join(VIEW_PATH, "comun.js")
        );
    }
);

// ==========================================
// PORTAL ENCARGADO SEEA
// ==========================================

app.get(
    "/encargado",
    requiereRol("SEEA"),
    (req, res) => {

        res.sendFile(
            path.join(VIEW_PATH, "encargado.html")
        );
    }
);

app.get(
    "/encargado.js",
    requiereRol("SEEA"),
    (req, res) => {

        res.sendFile(
            path.join(VIEW_PATH, "encargado.js")
        );
    }
);

// ==========================================
// PORTAL COLEGIO
// ==========================================

app.get(
    "/colegio",
    requiereRol("COLEGIO"),
    (req, res) => {

        res.sendFile(
            path.join(VIEW_PATH, "colegio.html")
        );
    }
);

app.get(
    "/colegio.js",
    requiereRol("COLEGIO"),
    (req, res) => {

        res.sendFile(
            path.join(VIEW_PATH, "colegio.js")
        );
    }
);

// ==========================================
// PORTAL VOLUNTARIO
// ==========================================

app.get(
    "/voluntario",
    requiereRol("VOLUNTARIO"),
    (req, res) => {

        res.sendFile(
            path.join(VIEW_PATH, "voluntario.html")
        );
    }
);

app.get(
    "/voluntario.js",
    requiereRol("VOLUNTARIO"),
    (req, res) => {

        res.sendFile(
            path.join(VIEW_PATH, "voluntario.js")
        );
    }
);

// ==========================================
// RUTA NO ENCONTRADA
// ==========================================

app.use((req, res) => {

    res.status(404).json({
        mensaje: "La ruta solicitada no existe"
    });
});

// ==========================================
// MANEJO GENERAL DE ERRORES
// ==========================================

app.use((error, req, res, next) => {

    console.error(
        "Error en el servidor SEEA:",
        error
    );

    res.status(500).json({
        mensaje: "Error interno del servidor"
    });
});

// ==========================================
// INICIAR SISTEMA
// ==========================================

async function iniciarSistema() {

    try {

        // Crear administrador inicial
        await inicializarAdministrador();

        // Iniciar servidor Express
        app.listen(PORT, () => {

            console.log("================================");
            console.log("          SISTEMA SEEA");
            console.log("================================");

            console.log(
                `Servidor: http://localhost:${PORT}`
            );

            console.log("");
            console.log("Portales disponibles:");
            console.log("- Encargado: /encargado");
            console.log("- Colegio: /colegio");
            console.log("- Voluntario: /voluntario");

            console.log("");
            console.log("Esperando peticiones...");
        });

    } catch (error) {

        console.error(
            "No se pudo iniciar SEEA:",
            error.message
        );

        process.exitCode = 1;
    }
}

// ==========================================
// EJECUTAR
// ==========================================

iniciarSistema();
