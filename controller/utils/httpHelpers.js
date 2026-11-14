"use strict";

function error(res, codigo, mensaje) {
    return res.status(codigo).json({ mensaje });
}

function buscarPorId(lista, id) {
    return lista.find(
        elemento => elemento.getId() === Number(id)
    );
}

function textoValido(valor) {
    return typeof valor === "string" &&
           valor.trim().length > 0;
}

function correoValido(correo) {
    return typeof correo === "string" &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}


module.exports = { error, buscarPorId, textoValido, correoValido };
