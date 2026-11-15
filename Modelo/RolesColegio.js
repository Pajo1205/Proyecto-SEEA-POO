"use strict";
// Rol laboral del representante, distinto del rol de acceso "COLEGIO".
const RolesColegio = Object.freeze({
    ADMINISTRADOR: "ADMINISTRADOR",
    DOCENTE: "DOCENTE",
    ESTUDIANTE: "ESTUDIANTE",
    ORIENTADOR: "ORIENTADOR",
    PSICOLOGO: "PSICOLOGO",
    OTRO: "OTRO"
});
module.exports = RolesColegio;
