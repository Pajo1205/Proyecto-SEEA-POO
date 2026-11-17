"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

// ==========================================
// CONEXION A SQLITE
// ==========================================

const RUTA_ESQUEMA = path.join(__dirname, "esquema.sql");

const RUTA_DB = process.env.SEEA_DB_PATH
    ? path.resolve(process.env.SEEA_DB_PATH)
    : path.join(__dirname, "seea.db");

let conexion = null;

function obtenerDb() {

    if (conexion) {
        return conexion;
    }

    fs.mkdirSync(path.dirname(RUTA_DB), {
        recursive: true
    });

    conexion = new DatabaseSync(RUTA_DB);

    conexion.exec("PRAGMA journal_mode = WAL;");
    conexion.exec("PRAGMA foreign_keys = ON;");
    conexion.exec(
        fs.readFileSync(RUTA_ESQUEMA, "utf8")
    );

    return conexion;
}

// Ejecuta varias operaciones como una sola transaccion.
function transaccion(fn) {

    const db = obtenerDb();

    db.exec("BEGIN");

    try {

        const resultado = fn();

        db.exec("COMMIT");

        return resultado;

    } catch (error) {

        db.exec("ROLLBACK");

        throw error;
    }
}

function cerrarDb() {

    if (conexion) {
        conexion.close();
        conexion = null;
    }
}

module.exports = {
    obtenerDb,
    transaccion,
    cerrarDb,
    RUTA_DB
};
