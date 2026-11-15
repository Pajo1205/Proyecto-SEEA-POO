import { crearAyudas } from "./voluntario/ayudas.js";
import { crearModulo as modulo0 } from "./voluntario/visitas.js";
import { crearModulo as modulo1 } from "./voluntario/disponibilidad.js";
import { crearModulo as modulo2 } from "./voluntario/asignaciones.js";

(async () => {
    const S = globalThis.SEEA;
    const usuario = await S.iniciar("VOLUNTARIO");
    const contexto = { S, usuario };
    Object.assign(contexto, crearAyudas(S, contexto));
    Object.assign(contexto, modulo0(S, contexto));
    Object.assign(contexto, modulo1(S, contexto));
    Object.assign(contexto, modulo2(S, contexto));
    const { visitas, disponibilidades, asignaciones } = contexto;

    const opciones = [
        {
            nombre: "Visitas disponibles",
            mostrar: visitas
        },
        {
            nombre: "Mi disponibilidad",
            mostrar: disponibilidades
        },
        {
            nombre: "Mis asignaciones",
            mostrar: asignaciones
        }
    ];

    // ==========================================
    // RECARGAR SECCION ACTUAL
    // ==========================================

    async function recargar() {

        const nombre = document.querySelector(
            "#nav button.active"
        )?.textContent?.trim() || "Visitas disponibles";

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
