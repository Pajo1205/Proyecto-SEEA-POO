const test = require('node:test');
const assert = require('node:assert/strict');
const Colegio = require('../Modelo/Colegio');
const UsuarioColegio = require('../Modelo/UsuarioColegio');
const RolesColegio = require('../Modelo/RolesColegio');
const { usuarioPublico } = require('../controller/serializers/dto');

function colegio() { return new Colegio(1, 'Colegio Ejemplo', 'Guatemala', '', '', true); }

test('roles de colegio están disponibles y exportados', () => {
    assert.equal(RolesColegio.DOCENTE, 'DOCENTE');
    assert.equal(RolesColegio.PSICOLOGO, 'PSICOLOGO');
    assert.equal(RolesColegio.OTRO, 'OTRO');
});

test('el usuario de colegio conserva su cargo', () => {
    const u = new UsuarioColegio(1, 'Ana', 'ana@example.com', 'hash', '123', colegio(), RolesColegio.DOCENTE);
    assert.equal(u.getRol(), 'COLEGIO');
    assert.equal(u.getRolColegio(), 'DOCENTE');
    assert.equal(usuarioPublico(u).cargoColegio, 'DOCENTE');
});

test('OTRO exige especificar el cargo', () => {
    assert.throws(() => new UsuarioColegio(2, 'Ana', 'ana@example.com', 'hash', '123', colegio(), RolesColegio.OTRO, ''), /especificar/);
    const u = new UsuarioColegio(3, 'Ana', 'ana@example.com', 'hash', '123', colegio(), RolesColegio.OTRO, 'Secretaría');
    assert.equal(usuarioPublico(u).cargoColegio, 'Secretaría');
});

test('no permite cargos fuera del catálogo', () => {
    assert.throws(() => new UsuarioColegio(4, 'Ana', 'ana@example.com', 'hash', '123', colegio(), 'SEEA'), /válido/);
});
