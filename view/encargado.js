import { crearAyudas } from "./encargado/ayudas.js";
import { crearModulo as modulo0 } from "./encargado/inicio.js";
import { crearModulo as modulo1 } from "./encargado/colegios.js";
import { crearModulo as modulo2 } from "./encargado/horarios.js";
import { crearModulo as modulo3 } from "./encargado/solicitudes.js";
import { crearModulo as modulo4 } from "./encargado/visitas.js";
import { crearModulo as modulo5 } from "./encargado/voluntarios.js";
import { crearModulo as modulo6 } from "./encargado/usuarios.js";

(async () => {
    const S = globalThis.SEEA;
    const usuario = await S.iniciar("SEEA");
    const contexto = { S, usuario };
    Object.assign(contexto, crearAyudas(S, contexto));
    Object.assign(contexto, modulo0(S, contexto));
    Object.assign(contexto, modulo1(S, contexto));
    Object.assign(contexto, modulo2(S, contexto));
    Object.assign(contexto, modulo3(S, contexto));
    Object.assign(contexto, modulo4(S, contexto));
    Object.assign(contexto, modulo5(S, contexto));
    Object.assign(contexto, modulo6(S, contexto));
    const { inicio, colegios, horarios, solicitudes, visitas, voluntarios, usuarios } = contexto;

    const opciones = [
        {
            nombre: "Inicio",
            mostrar: inicio
        },
        {
            nombre: "Colegios",
            mostrar: colegios
        },
        {
            nombre: "Horarios",
            mostrar: horarios
        },
        {
            nombre: "Solicitudes",
            mostrar: solicitudes
        },
        {
            nombre: "Visitas",
            mostrar: visitas
        },
        {
            nombre: "Voluntarios",
            mostrar: voluntarios
        },
        {
            nombre: "Usuarios",
            mostrar: usuarios
        }
    ];

    // ==========================================
    // RECARGAR SECCION ACTUAL
    // ==========================================

    async function recargar() {

        const nombre = document.querySelector(
            "#nav button.active"
        )?.textContent?.trim() || "Inicio";

        const opcion = opciones.find(
            item => item.nombre === nombre
        ) || opciones[0];

        const root = document.getElementById(
            "contenido"
        );

        root.replaceChildren();

        await opcion.mostrar(root);
    }

    // ==========================================
    // INICIAR NAVEGACION
    // ==========================================

    contexto.recargar = recargar;
    S.navegar(opciones);


})().catch(error => {
    SEEA.aviso(error.message, true);
});
