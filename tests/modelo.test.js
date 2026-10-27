const test = require('node:test');
const assert = require('node:assert/strict');
const Colegio = require('../Modelo/Colegio');
const Horario = require('../Modelo/Horario');
const Solicitud = require('../Modelo/Solicitud');
const Visita = require('../Modelo/Visita');
const Voluntario = require('../Modelo/Voluntario');
const Disponibilidad = require('../Modelo/DisponibilidadVoluntario');
const Asignacion = require('../Modelo/AsignacionVoluntario');
function setup() {
 const c=new Colegio(1,'Colegio','Guatemala','','',true);
 const h=new Horario(1,'2026-11-20','09:00','11:00');
 const s=new Solicitud(1,c,h,50,3,'Quinto','Bus',true,true,false,'');
 return {c,h,s};
}
test('reserva y liberacion',()=>{
 const {h,s}=setup(); assert.equal(s.aprobar([]),true); assert.equal(h.disponible,false);
 assert.equal(s.aprobar([]),false); assert.equal(s.cancelar(),true); assert.equal(h.disponible,true);
});
test('conflicto y reagendamiento',()=>{
 const {s,h}=setup(); const h2=new Horario(2,'2026-11-20','11:00','13:00');
 const conflict=new Horario(3,'2026-11-20','10:00','12:00');
 assert.equal(h.seTraslapaCon(h2),false); assert.equal(h.seTraslapaCon(conflict),true);
 assert.equal(s.aprobar([]),true); assert.equal(s.cambiarHorario(h2,[]),true);
 assert.equal(h.disponible,true); assert.equal(h2.disponible,false);
});
test('visita, disponibilidad y asignacion',()=>{
 const {s}=setup();s.aprobar([]);const v=new Visita(1,s);
 const u=new Voluntario(1,'Ana','a@uvg.edu.gt','hash','123','Sistemas');
 u.agregarDisponibilidad(new Disponibilidad(1,'2026-11-20','08:00','12:00'));
 assert.equal(u.puedeInscribirse(v),true);
 const a=new Asignacion(1,u,v,new Date().toISOString());
 assert.equal(v.agregarAsignacion(a),true);assert.equal(u.puedeInscribirse(v),false);
 assert.equal(v.contarVoluntariosConfirmados(),1);a.cancelar();assert.equal(v.contarVoluntariosConfirmados(),0);
});
test('no aliado no solicita taller',()=>{
 const c=new Colegio(2,'Otro','','','',false);const h=new Horario(2,'2026-11-21','09:00','11:00');
 assert.throws(()=>new Solicitud(1,c,h,20,1,'Grado','Bus',true,false,true,''),/Taller/);
});