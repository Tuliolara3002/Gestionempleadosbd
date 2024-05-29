const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config(); // Cargar variables de entorno

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Cambia esto por tu contraseña de MySQL
    database: 'gestionempleados'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Ruta para la página de inicio
app.get('/', (req, res) => {
    res.send('/login');
});

// Ruta de login
app.post('/login', (req, res) => {
    const { nombre_usuario, contraseña } = req.body;
    if (!nombre_usuario || !contraseña) {
        return res.status(400).send('Faltan datos.');
    }

    const query = 'SELECT * FROM usuarios WHERE nombre_usuario = ?';
    db.query(query, [nombre_usuario], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Error en la base de datos.');
        }

        if (results.length === 0) {
            return res.status(401).send('Usuario no encontrado.');
        }

        const user = results[0];
        bcrypt.compare(contraseña, user.hash_contraseña, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).send('Error en la comparación de contraseñas.');
            }

            if (!isMatch) {
                return res.status(401).send('Contraseña incorrecta.');
            }

            // Generar token de acceso
            const accessToken = jwt.sign({ username: user.nombre_usuario }, process.env.ACCESS_TOKEN_SECRET);
            res.cookie('token', accessToken, { httpOnly: true });
            res.status(200).send('Login exitoso');
        });
    });
});

// Ruta para obtener los datos de los empleados
app.get('/api/empleados', (req, res) => {
    const query = 'SELECT * FROM empleados';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results);
    });
});

// Ruta para insertar un nuevo empleado
app.post('/api/empleados', (req, res) => {
    const nuevoEmpleado = req.body;
    const query = 'INSERT INTO empleados SET ?';
    db.query(query, nuevoEmpleado, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }
        res.status(201).send('Empleado creado exitosamente');
    });
});


// Ruta para actualizar un empleado
app.put('/api/empleados/:id', (req, res) => {
    const { id } = req.params;
    const updatedEmpleado = req.body;
    const query = 'UPDATE empleados SET ? WHERE id = ?';
    db.query(query, [updatedEmpleado, id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }
        res.status(200).send('Empleado actualizado exitosamente');
    });
});

// Ruta para buscar empleados por nombre
app.get('/api/empleados/buscar', (req, res) => {
    const { nombre } = req.query;
    if (!nombre) {
        return res.status(400).send('El nombre es requerido para la búsqueda.');
    }

    const query = 'SELECT * FROM empleados WHERE nombres LIKE ?';
    db.query(query, [`${nombre}%`], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results);
    });
});


app.get('/api/usuarios', (req, res) => {
    const query = 'SELECT * FROM usuarios';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
