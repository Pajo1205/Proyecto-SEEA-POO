const express = require("express");

const app = express();

app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("Bienvenido al sistema SEEA");
});

// Ruta para consultar visitas
app.get("/visitas", (req, res) => {
    res.json({
        mensaje: "Listado de visitas"
    });
});

app.listen(3000, () => 
    console.log("Servidor funcionando en puerto 3000");
});

app.post("/solicitudes", (req, res) => {
    const datos = req.body;

    res.status(201).json({
        mensaje: "Datos de solicitud recibidos",
        datos: datos
    });
});