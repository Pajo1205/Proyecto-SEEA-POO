"use strict";

// Rutas de usuarios. Reciben dependencias compartidas del router principal.
module.exports = function registrarUsuarios(ctx) {
    const { router, datos, bcrypt, Colegio, Horario, Solicitud, Visita, Actividad, UsuarioColegio, EncargadoSEEA, Voluntario, DisponibilidadVoluntario, AsignacionVoluntario, error, buscarPorId, textoValido, correoValido, usuarioPublico, colegioDTO, horarioDTO, solicitudDTO, actividadDTO, asignacionDTO, visitaDTO, requiereSesion, requiereRol } = ctx;

// ==========================================
// USUARIOS
// ==========================================

// Consultar usuarios
router.get(
    "/usuarios",
    requiereRol("SEEA"),
    (req, res) => {
        return res.json(
            datos.usuarios.map(usuarioPublico)
        );
    }
);

// Solo los encargados pueden crear otros encargados SEEA.
router.post("/usuarios", requiereRol("SEEA"), async (req, res, next) => {
    try {
        const { nombre, correo, contrasena, tipo, puesto } = req.body || {};
        if (tipo !== "SEEA")
            return error(res, 403, "Los colegios y voluntarios usan el registro publico");
        if (!textoValido(nombre) || !correoValido(correo) ||
            typeof contrasena !== "string" || contrasena.length < 8)
            return error(res, 400, "Nombre, correo o contrasena invalidos");
        const email = correo.trim().toLowerCase();
        if (datos.usuarios.some(u => u.correo.toLowerCase() === email))
            return error(res, 409, "Correo ya registrado");
        const hash = await bcrypt.hash(contrasena, 12);
        const usuario = new EncargadoSEEA(
            datos.generarId("usuario"), nombre.trim(), email, hash,
            textoValido(puesto) ? puesto.trim() : "Encargado"
        );
        datos.usuarios.push(usuario);
        return res.status(201).json({
            mensaje: "Encargado creado correctamente",
            usuario: usuarioPublico(usuario)
        });
    } catch (err) { next(err); }
});

// Eliminacion administrativa con preservacion de relaciones historicas.
router.delete("/usuarios/:id", requiereRol("SEEA"), (req, res) => {
    const usuario = buscarPorId(datos.usuarios, req.params.id);
    if (!usuario) return error(res, 404, "Usuario no encontrado");
    if (usuario.id === req.usuario.id)
        return error(res, 409, "No puedes eliminar tu propia cuenta");
    if (usuario.rol === "SEEA" &&
        datos.usuarios.filter(u => u.rol === "SEEA").length <= 1)
        return error(res, 409, "No puedes eliminar el ultimo encargado SEEA");

    // No destruir relaciones que otros objetos aun utilizan.
    if (usuario.rol === "COLEGIO" &&
        datos.solicitudes.some(s => s.getColegio() === usuario.getColegio())) {
        // Las solicitudes pertenecen al colegio, no a la cuenta; se conservan.
    }
    if (usuario.rol === "VOLUNTARIO") {
        const relacionadas = datos.asignaciones.filter(a =>
            a.getVoluntario().getId() === usuario.getId());
        if (relacionadas.length)
            return error(res, 409,
                "Este voluntario tiene asignaciones historicas; no puede eliminarse sin archivar sus relaciones");
    }
    datos.usuarios.splice(datos.usuarios.indexOf(usuario), 1);
    return res.json({ mensaje: "Usuario eliminado correctamente" });
});


};
