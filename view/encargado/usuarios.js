export function crearModulo(S, contexto) {
  const { crearBotones, confirmar, ejecutarAccion, crearEncabezado, formatearHorario, formatearActividades, camposColegio } = contexto;
  const recargar = (...args) => contexto.recargar(...args);


    async function usuarios(root) {
        root.append(crearEncabezado(
            "Gestión de usuarios",
            "Crear encargados SEEA, consultar y eliminar cuentas."
        ));

        const usuariosRegistrados = await S.api("/usuarios");
        const registro = S.tarjeta("Crear encargado SEEA");
        registro.append(S.formulario([
            { nombre: "nombre", etiqueta: "Nombre completo", required: true },
            { nombre: "correo", etiqueta: "Correo electrónico", tipo: "email", required: true },
            { nombre: "contrasena", etiqueta: "Contraseña (mínimo 8 caracteres)", tipo: "password", required: true },
            { nombre: "puesto", etiqueta: "Puesto en SEEA", required: true }
        ], async formulario => {
            const contrasena = S.val(formulario, "contrasena");
            if (contrasena.length < 8) throw new Error("La contraseÃ±a debe tener al menos 8 caracteres");
            await S.post("/usuarios", {
                tipo: "SEEA",
                nombre: S.val(formulario, "nombre"),
                correo: S.val(formulario, "correo"),
                contrasena,
                puesto: S.val(formulario, "puesto")
            });
            await recargar();
            S.aviso("Encargado SEEA creado correctamente");
        }, "Crear encargado"));
        root.append(registro);

        const listado = S.tarjeta("Usuarios registrados");
        listado.append(S.tabla(
            ["Nombre", "Correo", "Rol", "Información", "Acciones"],
            usuariosRegistrados.map(usuario => {
                const acciones = S.nodo("div", "actions");
                if (usuario.id !== S.yo.id) {
                    acciones.append(S.boton("Eliminar", "danger", async () => {
                        if (!confirmar(`¿Eliminar la cuenta de ${usuario.nombre}?`)) return;
                        await ejecutarAccion(
                            () => S.del(`/usuarios/${usuario.id}`),
                            "Usuario eliminado correctamente"
                        );
                    }));
                } else {
                    acciones.append(S.crear("span", "Tu cuenta", "hint"));
                }
                const detalle = usuario.rol === "VOLUNTARIO"
                    ? `${usuario.carnet || ""} · ${usuario.carrera || ""}`
                    : usuario.rol === "COLEGIO"
                        ? `Colegio #${usuario.idColegio || "-"} · ${usuario.cargoColegio || usuario.rolColegio || "Sin cargo"}`
                        : (usuario.puesto || "Encargado");
                return [usuario.nombre, usuario.correo, usuario.rol, detalle, acciones];
            })
        ));
        root.append(listado);
    }

    // ==========================================
    // NAVEGACION DEL PANEL
    // ==========================================

return { usuarios };
}
