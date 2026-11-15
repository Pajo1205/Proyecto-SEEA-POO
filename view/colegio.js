import { crearAyudas } from "./colegio/ayudas.js";
import { crearModulo as modulo0 } from "./colegio/solicitudes.js";
import { crearModulo as modulo1 } from "./colegio/nuevaSolicitud.js";
import { crearModulo as modulo2 } from "./colegio/visitas.js";

(async () => {
    const S = globalThis.SEEA;
    const usuario = await S.iniciar("COLEGIO");
    const contexto = { S, usuario };
    Object.assign(contexto, crearAyudas(S, contexto));
    Object.assign(contexto, modulo0(S, contexto));
    Object.assign(contexto, modulo1(S, contexto));
    Object.assign(contexto, modulo2(S, contexto));
    const { mostrarSolicitudes, crearSolicitud, misVisitas } = contexto;

    const opciones = [
        {
            nombre: "Nueva solicitud",
            mostrar: crearSolicitud
        },
        {
            nombre: "Mis solicitudes",
            mostrar: mostrarSolicitudes
        },
        {
            nombre: "Mis visitas",
            mostrar: misVisitas
        }
    ];

    // ==========================================
    // RECARGAR VISTA
    // ==========================================

    async function recargar() {

        const nombre = document.querySelector(
            "#nav button.active"
        )?.textContent?.trim() || "Nueva solicitud";

        const opcion = opciones.find(
            item => item.nombre === nombre
        ) || opciones[0];

        const root = document.getElementById("contenido");

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
