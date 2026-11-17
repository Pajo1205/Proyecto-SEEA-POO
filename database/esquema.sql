-- ==========================================
-- ESQUEMA DE LA BASE DE DATOS SEEA (SQLite)
-- ==========================================

CREATE TABLE IF NOT EXISTS colegios (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL COLLATE NOCASE UNIQUE,
    direccion TEXT NOT NULL DEFAULT '',
    telefono TEXT NOT NULL DEFAULT '',
    correo TEXT NOT NULL DEFAULT '',
    aliado INTEGER NOT NULL DEFAULT 0 CHECK (aliado IN (0, 1)),
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL COLLATE NOCASE UNIQUE,
    contrasena TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('SEEA', 'COLEGIO', 'VOLUNTARIO')),

    -- Datos exclusivos del encargado SEEA
    puesto TEXT,

    -- Datos exclusivos del usuario de colegio
    telefono TEXT,
    colegio_id INTEGER,
    rol_colegio TEXT,
    otro_rol_colegio TEXT,

    -- Datos exclusivos del voluntario
    carnet TEXT UNIQUE,
    carrera TEXT,

    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (colegio_id)
        REFERENCES colegios(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS horarios (
    id INTEGER PRIMARY KEY,
    fecha TEXT NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,
    disponible INTEGER NOT NULL DEFAULT 1
        CHECK (disponible IN (0, 1))
);

CREATE TABLE IF NOT EXISTS solicitudes (
    id INTEGER PRIMARY KEY,
    colegio_id INTEGER NOT NULL,
    horario_id INTEGER NOT NULL,
    cantidad_estudiantes INTEGER NOT NULL
        CHECK (cantidad_estudiantes > 0),
    cantidad_profesores INTEGER NOT NULL
        CHECK (cantidad_profesores >= 0),
    grado TEXT NOT NULL DEFAULT '',
    transporte TEXT NOT NULL DEFAULT '',
    solicita_tour INTEGER NOT NULL DEFAULT 0
        CHECK (solicita_tour IN (0, 1)),
    solicita_charla INTEGER NOT NULL DEFAULT 0
        CHECK (solicita_charla IN (0, 1)),
    solicita_taller INTEGER NOT NULL DEFAULT 0
        CHECK (solicita_taller IN (0, 1)),
    observaciones TEXT NOT NULL DEFAULT '',
    estado TEXT NOT NULL DEFAULT 'PENDIENTE'
        CHECK (estado IN (
            'PENDIENTE',
            'APROBADA',
            'RECHAZADA',
            'CANCELADA',
            'FINALIZADA'
        )),
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (colegio_id)
        REFERENCES colegios(id)
        ON DELETE RESTRICT,

    FOREIGN KEY (horario_id)
        REFERENCES horarios(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS visitas (
    id INTEGER PRIMARY KEY,
    solicitud_id INTEGER NOT NULL UNIQUE,
    estado TEXT NOT NULL DEFAULT 'PROGRAMADA'
        CHECK (estado IN (
            'PROGRAMADA',
            'EN_CURSO',
            'FINALIZADA',
            'CANCELADA'
        )),
    observaciones TEXT NOT NULL DEFAULT '',
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (solicitud_id)
        REFERENCES solicitudes(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL
        CHECK (tipo IN ('TOUR', 'CHARLA', 'TALLER')),
    descripcion TEXT NOT NULL DEFAULT '',
    duracion_minutos INTEGER NOT NULL
        CHECK (duracion_minutos > 0),
    capacidad_maxima INTEGER NOT NULL
        CHECK (capacidad_maxima > 0)
);

CREATE TABLE IF NOT EXISTS visita_actividades (
    visita_id INTEGER NOT NULL,
    actividad_id INTEGER NOT NULL,
    PRIMARY KEY (visita_id, actividad_id),

    FOREIGN KEY (visita_id)
        REFERENCES visitas(id)
        ON DELETE CASCADE,

    FOREIGN KEY (actividad_id)
        REFERENCES actividades(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS disponibilidades (
    id INTEGER PRIMARY KEY,
    voluntario_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,

    UNIQUE (voluntario_id, fecha, hora_inicio, hora_fin),

    FOREIGN KEY (voluntario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS asignaciones (
    id INTEGER PRIMARY KEY,
    voluntario_id INTEGER NOT NULL,
    visita_id INTEGER NOT NULL,
    fecha_asignacion TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'CONFIRMADA'
        CHECK (estado IN (
            'CONFIRMADA',
            'CANCELADA',
            'ASISTIO',
            'NO_ASISTIO'
        )),

    FOREIGN KEY (voluntario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    FOREIGN KEY (visita_id)
        REFERENCES visitas(id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol
    ON usuarios(rol);

CREATE INDEX IF NOT EXISTS idx_solicitudes_colegio
    ON solicitudes(colegio_id);

CREATE INDEX IF NOT EXISTS idx_solicitudes_horario
    ON solicitudes(horario_id);

CREATE INDEX IF NOT EXISTS idx_disponibilidades_voluntario
    ON disponibilidades(voluntario_id);

CREATE INDEX IF NOT EXISTS idx_asignaciones_voluntario
    ON asignaciones(voluntario_id);

CREATE INDEX IF NOT EXISTS idx_asignaciones_visita
    ON asignaciones(visita_id);

-- c2kgdGUgZGV0aWVuZXMgYSBsZWVyLCBwZXJkw7NuLCB0dXZlIHF1ZSBoYWNlcmxvIHBvcnF1ZSBlbCBwcm95ZWN0byB5YSBlc3TDoSBhc8OtLCBtZSBkdWVsZSBtdWNow61zaW1v
