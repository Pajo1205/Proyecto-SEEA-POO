const readline = require("readline");
const Colegio = require("../Modelo/Colegio");
const Horario = require("../Modelo/Horario");
const Solicitud = require("../Modelo/Solicitud");
const datos = require("../datos");

class TerminalView {

    iniciar() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.menu();
    }

    menu() {
        console.log("");
        console.log("=== SEEA ===");
        console.log("1) crear colegio");
        console.log("2) crear horario");
        console.log("3) crear solicitud");
        console.log("4) ver datos");
        console.log("0) salir");

        this.rl.question("opcion: ", opcion => {
            if (opcion === "0") {
                this.rl.close();
            }else if (opcion === "1") {
                this.crearColegio();
            } else if (opcion === "2") {
                this.crearHorario();
            } else if (opcion === "3") {
                this.crearSolicitud();
            } else if (opcion === "4") {
                this.verDatos();
            } else {
                console.log("no existe esa opcion");
                this.menu();
            }
        });
    }

    crearColegio() {
        this.rl.question("nombre: ", nombre => {
            this.rl.question("direccion: ", direccion => {
                this.rl.question("telefono: ", telefono => {
                    this.rl.question("correo: ", correo => {
                        this.rl.question("aliado? (y/n): ", resp => {
                            const id = datos.colegios.length + 1;
                            const aliado = resp === "y";

                            const colegio = new Colegio(
                                id, nombre, direccion, telefono, correo, aliado
                            );

                            datos.colegios.push(colegio);
                            console.log("colegio guardado, id " + id);
                            this.menu();
                        });
                    });
                });
            });
        });
    }

    crearHorario() {
        this.rl.question("fecha (YYYY-MM-DD): ", fecha => {
            this.rl.question("hora inicio (HH:MM): ", inicio => {
                this.rl.question("hora fin (HH:MM): ", fin => {
                    try {
                        const id = datos.horarios.length + 1;
                        const horario = new Horario(id, fecha, inicio, fin);
                        datos.horarios.push(horario);
                        console.log("horario guardado, id " + id);
                    } catch (error) {
                        console.log("error: " + error.message);
                    }
                    this.menu();
                });
            });
        });
    }

    crearSolicitud() {
        if (datos.colegios.length === 0 || datos.horarios.length === 0) {
            console.log("primero necesitas colegios y horarios");
            return this.menu();
        }

        this.imprimirColegios();
        this.rl.question("id colegio: ", idColegio => {
            const colegio = datos.colegios.find(
                c => c.getId() === Number(idColegio)
            );
            if (!colegio) {
                console.log("no existe ese colegio");
                return this.menu();
            }

            this.imprimirHorarios();
            this.rl.question("id horario: ", idHorario => {
                const horario = datos.horarios.find(
                    h => h.getId() === Number(idHorario)
                );
                if (!horario) {
                    console.log("no existe ese horario");
                    return this.menu();
                }

                this.rl.question("cantidad estudiantes: ", estudiantes => {
                    this.rl.question("cantidad profesores: ", profesores => {
                        this.rl.question("grado: ", grado => {
                            this.rl.question("transporte: ", transporte => {
                                this.rl.question("tour? (y/n): ", tour => {
                                    this.rl.question("charla? (y/n): ", charla => {
                                        this.rl.question("taller? (y/n): ", taller => {
                                            try {
                                                const id = datos.solicitudes.length + 1;
                                                const solicitud = new Solicitud(
                                                    id,
                                                    colegio,
                                                    horario,
                                                    Number(estudiantes),
                                                    Number(profesores),
                                                    grado,
                                                    transporte,
                                                    tour === "y",
                                                    charla === "y",
                                                    taller === "y"
                                                );
                                                datos.solicitudes.push(solicitud);
                                                console.log("solicitud guardada, id " + id);
                                            } catch (error) {
                                                console.log("error: " + error.message);
                                            }
                                            this.menu();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    verDatos() {
        console.log("--- colegios ---");
        this.imprimirColegios();

        console.log("--- horarios ---");
        this.imprimirHorarios();

        console.log("--- solicitudes ---");
        datos.solicitudes.forEach(s => console.log(s.toString()));

        this.menu();
    }

    imprimirColegios() {
        datos.colegios.forEach(c =>
            console.log(c.getId() + ") " + c.toString())
        );
    }

    imprimirHorarios() {
        datos.horarios.forEach(h =>
            console.log(
                h.getId() + ") " + h.getFecha() + " " +
                h.getHoraInicio() + "-" + h.getHoraFin() +
                (h.estaDisponible() ? "" : " (ocupado)")
            )
        );
    }
}

module.exports = TerminalView;
