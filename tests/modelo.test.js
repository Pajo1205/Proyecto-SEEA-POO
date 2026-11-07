
const test = require("node:test");
const assert = require("node:assert/strict");

// ==========================================
// IMPORTAR CLASES DEL MODELO
// ==========================================

const Colegio = require("../Modelo/Colegio");
const Horario = require("../Modelo/Horario");
const Solicitud = require("../Modelo/Solicitud");
const Visita = require("../Modelo/Visita");
const Voluntario = require("../Modelo/Voluntario");

const DisponibilidadVoluntario =
    require("../Modelo/DisponibilidadVoluntario");

const AsignacionVoluntario =
    require("../Modelo/AsignacionVoluntario");

// ==========================================
// DATOS DE PRUEBA
// ==========================================

function crearDatosPrueba() {

    const colegio = new Colegio(
        1,
        "Colegio ABC",
        "Guatemala",
        "",
        "",
        true
    );

    const horario = new Horario(
        1,
        "2026-11-20",
        "09:00",
        "11:00"
    );

    const solicitud = new Solicitud(
        1,
        colegio,
        horario,
        50,
        3,
        "Quinto Bachillerato",
        "Bus",
        true,
        true,
        false,
        ""
    );

    return {
        colegio,
        horario,
        solicitud
    };
}

// ==========================================
// PRUEBA 1: RESERVAR Y LIBERAR HORARIOS
// ==========================================

test("Reservar y liberar un horario", () => {

    const { horario, solicitud } = crearDatosPrueba();

    // Aprobar solicitud
    const aprobada = solicitud.aprobar([]);

    assert.equal(aprobada, true);

    // Verificar que el horario este ocupado
    assert.equal(horario.estaDisponible(), false);

    // No permitir aprobar dos veces
    const segundaAprobacion = solicitud.aprobar([]);

    assert.equal(segundaAprobacion, false);

    // Cancelar solicitud
    const cancelada = solicitud.cancelar();

    assert.equal(cancelada, true);

    // Verificar que el horario quede disponible
    assert.equal(horario.estaDisponible(), true);
});

// ==========================================
// PRUEBA 2: CONFLICTOS ENTRE HORARIOS
// ==========================================

test("Detectar horarios traslapados", () => {

    const { horario } = crearDatosPrueba();

    const horarioSinConflicto = new Horario(
        2,
        "2026-11-20",
        "11:00",
        "13:00"
    );

    const horarioConConflicto = new Horario(
        3,
        "2026-11-20",
        "10:00",
        "12:00"
    );

    // Horarios consecutivos no se traslapan
    assert.equal(
        horario.seTraslapaCon(horarioSinConflicto),
        false
    );

    // Horarios que comparten tiempo se traslapan
    assert.equal(
        horario.seTraslapaCon(horarioConConflicto),
        true
    );
});

// ==========================================
// PRUEBA 3: REAGENDAR UNA SOLICITUD
// ==========================================

test("Reagendar una solicitud aprobada", () => {

    const { horario, solicitud } = crearDatosPrueba();

    const nuevoHorario = new Horario(
        2,
        "2026-11-20",
        "11:00",
        "13:00"
    );

    // Aprobar solicitud original
    assert.equal(
        solicitud.aprobar([]),
        true
    );

    // Cambiar al nuevo horario
    assert.equal(
        solicitud.cambiarHorario(nuevoHorario, []),
        true
    );

    // El horario anterior debe quedar libre
    assert.equal(
        horario.estaDisponible(),
        true
    );

    // El nuevo horario debe quedar reservado
    assert.equal(
        nuevoHorario.estaDisponible(),
        false
    );

    // La solicitud debe apuntar al nuevo horario
    assert.equal(
        solicitud.getHorario(),
        nuevoHorario
    );
});

// ==========================================
// PRUEBA 4: CREAR UNA VISITA
// ==========================================

test("Crear visita con solicitud aprobada", () => {

    const { solicitud } = crearDatosPrueba();

    // Aprobar la solicitud
    assert.equal(
        solicitud.aprobar([]),
        true
    );

    // Crear visita
    const visita = new Visita(
        1,
        solicitud
    );

    assert.equal(
        visita.getEstado(),
        "PROGRAMADA"
    );

    assert.equal(
        visita.getSolicitud(),
        solicitud
    );
});

// ==========================================
// PRUEBA 5: DISPONIBILIDAD DEL VOLUNTARIO
// ==========================================

test("Verificar disponibilidad de voluntario", () => {

    const { solicitud } = crearDatosPrueba();

    solicitud.aprobar([]);

    const visita = new Visita(
        1,
        solicitud
    );

    const voluntario = new Voluntario(
        1,
        "Ana",
        "ana@uvg.edu.gt",
        "hash",
        "12345",
        "Ingenieria en Sistemas"
    );

    const disponibilidad = new DisponibilidadVoluntario(
        1,
        "2026-11-20",
        "08:00",
        "12:00"
    );

    // Registrar disponibilidad
    assert.equal(
        voluntario.agregarDisponibilidad(disponibilidad),
        true
    );

    // Comprobar que puede participar
    assert.equal(
        voluntario.puedeInscribirse(visita),
        true
    );
});

// ==========================================
// PRUEBA 6: ASIGNACION DE VOLUNTARIOS
// ==========================================

test("Asignar y cancelar voluntario de una visita", () => {

    const { solicitud } = crearDatosPrueba();

    solicitud.aprobar([]);

    const visita = new Visita(
        1,
        solicitud
    );

    const voluntario = new Voluntario(
        1,
        "Ana",
        "ana@uvg.edu.gt",
        "hash",
        "12345",
        "Ingenieria en Sistemas"
    );

    const disponibilidad = new DisponibilidadVoluntario(
        1,
        "2026-11-20",
        "08:00",
        "12:00"
    );

    voluntario.agregarDisponibilidad(disponibilidad);

    // Crear asignacion
    const asignacion = new AsignacionVoluntario(
        1,
        voluntario,
        visita,
        new Date().toISOString()
    );

    // Agregar voluntario a la visita
    assert.equal(
        visita.agregarAsignacion(asignacion),
        true
    );

    // No permitir una segunda inscripcion activa
    assert.equal(
        voluntario.puedeInscribirse(visita),
        false
    );

    // Verificar cantidad de voluntarios confirmados
    assert.equal(
        visita.contarVoluntariosConfirmados(),
        1
    );

    // Cancelar asignacion
    assert.equal(
        asignacion.cancelar(),
        true
    );

    // Ya no debe contar como confirmado
    assert.equal(
        visita.contarVoluntariosConfirmados(),
        0
    );
});

// ==========================================
// PRUEBA 7: RESTRICCION DE TALLERES
// ==========================================

test("Colegio no aliado no puede solicitar taller", () => {

    const colegio = new Colegio(
        2,
        "Colegio No Aliado",
        "Guatemala",
        "",
        "",
        false
    );

    const horario = new Horario(
        2,
        "2026-11-21",
        "09:00",
        "11:00"
    );

    // Debe generar error al solicitar taller
    assert.throws(
        () => new Solicitud(
            1,
            colegio,
            horario,
            20,
            1,
            "Quinto Bachillerato",
            "Bus",
            true,
            false,
            true,
            ""
        ),
        /taller/i
    );
});
