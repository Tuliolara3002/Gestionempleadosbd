const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

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

app.get('/', (req, res) => {
    res.send('/login');
});

app.post('/login', async (req, res) => {
    const { nombre_usuario, contraseña } = req.body;
    if (!nombre_usuario || !contraseña) {
        return res.status(400).send('Faltan datos.');
    }

    try {
        const query = 'SELECT usuarios.*, roles.nombre_rol FROM usuarios JOIN roles ON usuarios.rol_id = roles.id WHERE nombre_usuario = ?';
        db.query(query, [nombre_usuario], async (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).send('Error en la base de datos.');
            }

            if (results.length === 0) {
                console.log('Usuario no encontrado.');
                return res.status(401).send('Usuario no encontrado.');
            }

            const user = results[0];
            console.log('Usuario encontrado:', user);

            const isMatch = await bcrypt.compare(contraseña, user.hash_contraseña);
            if (!isMatch) {
                console.log('Contraseña incorrecta.');
                return res.status(401).send('Contraseña incorrecta.');
            }

            const accessToken = jwt.sign({ username: user.nombre_usuario, role: user.nombre_rol }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.cookie('token', accessToken, { httpOnly: true, sameSite: 'Strict' });
            res.status(200).send({ message: 'Login exitoso', role: user.nombre_rol });
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Error en el servidor.');
    }
});


app.get('/api/empleados', async (req, res) => {
    try {
        const query = `
            SELECT empleados.id, empleados.nombres, empleados.apellidos, empleados.fecha_ingreso, empleados.direccion, empleados.dpi, empleados.telefono, empleados.correo_electronico, empleados.activo, cargos.nombre_cargo, departamentos.nombre_departamento, roles.nombre_rol, salarios.salario_base
            FROM empleados
            JOIN cargos ON empleados.id_cargo = cargos.id
            JOIN departamentos ON empleados.id_departamento = departamentos.id
            JOIN roles ON empleados.id_rol = roles.id
            JOIN salarios ON empleados.id = salarios.id_empleado
        `;
        db.query(query, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error fetching empleados:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/api/empleados/buscar', async (req, res) => {
    const { nombre } = req.query;
    if (!nombre) {
        return res.status(400).send('El nombre es requerido para la búsqueda.');
    }

    try {
        console.log(`Searching for empleados with name: ${nombre}`);
        const query = `
            SELECT empleados.id, empleados.nombres, empleados.apellidos, empleados.fecha_ingreso, empleados.direccion, empleados.dpi, empleados.telefono, empleados.correo_electronico, empleados.activo, cargos.nombre_cargo, departamentos.nombre_departamento, roles.nombre_rol, salarios.salario_base
            FROM empleados
            JOIN cargos ON empleados.id_cargo = cargos.id
            JOIN departamentos ON empleados.id_departamento = departamentos.id
            JOIN roles ON empleados.id_rol = roles.id
            JOIN salarios ON empleados.id = salarios.id_empleado
            WHERE empleados.nombres LIKE ?
        `;
        db.query(query, [`${nombre}%`], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }
            console.log(`Found ${results.length} empleados`);
            res.json(results);
        });
    } catch (error) {
        console.error('Error searching empleados:', error);
        res.status(500).send('Internal server error');
    }
});

// Ruta para crear un empleado
app.post('/api/empleados', async (req, res) => {
    const { nombres, apellidos, fecha_ingreso, direccion, dpi, telefono, correo_electronico, activo, nombre_departamento, nombre_cargo, nombre_rol, salario_base } = req.body;
    try {
        const query = `
            INSERT INTO empleados (nombres, apellidos, fecha_ingreso, direccion, dpi, telefono, correo_electronico, id_departamento, id_cargo, id_rol, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, (SELECT id FROM departamentos WHERE nombre_departamento = ?), (SELECT id FROM cargos WHERE nombre_cargo = ?), (SELECT id FROM roles WHERE nombre_rol = ?), ?)
        `;
        db.query(query, [nombres, apellidos, fecha_ingreso, direccion, dpi, telefono, correo_electronico, nombre_departamento, nombre_cargo, nombre_rol, activo], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }
            const empleadoId = result.insertId;
            const salarioQuery = 'INSERT INTO salarios (id_empleado, salario_base) VALUES (?, ?)';
            db.query(salarioQuery, [empleadoId, salario_base], (salarioErr, salarioResult) => {
                if (salarioErr) {
                    console.error('Database error:', salarioErr);
                    return res.status(500).send('Internal server error');
                }
                res.status(201).send('Empleado creado exitosamente');
            });
        });
    } catch (error) {
        console.error('Error creating empleado:', error);
        res.status(500).send('Internal server error');
    }
});

// Ruta para actualizar un empleado
app.put('/api/empleados/:id', async (req, res) => {
    const { id } = req.params;
    const { nombres, apellidos, fecha_ingreso, direccion, dpi, telefono, correo_electronico, activo, nombre_departamento, nombre_cargo, nombre_rol, salario_base } = req.body;
    try {
        const query = `
            UPDATE empleados SET nombres = ?, apellidos = ?, fecha_ingreso = ?, direccion = ?, dpi = ?, telefono = ?, correo_electronico = ?, id_departamento = (SELECT id FROM departamentos WHERE nombre_departamento = ?), id_cargo = (SELECT id FROM cargos WHERE nombre_cargo = ?), id_rol = (SELECT id FROM roles WHERE nombre_rol = ?), activo = ? 
            WHERE id = ?
        `;
        db.query(query, [nombres, apellidos, fecha_ingreso, direccion, dpi, telefono, correo_electronico, nombre_departamento, nombre_cargo, nombre_rol, activo, id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }
            const salarioQuery = 'UPDATE salarios SET salario_base = ? WHERE id_empleado = ?';
            db.query(salarioQuery, [salario_base, id], (salarioErr, salarioResult) => {
                if (salarioErr) {
                    console.error('Database error:', salarioErr);
                    return res.status(500).send('Internal server error');
                }
                res.status(200).send('Empleado actualizado exitosamente');
            });
        });
    } catch (error) {
        console.error('Error updating empleado:', error);
        res.status(500).send('Internal server error');
    }
});

app.patch('/api/empleados/:id/activo', async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;

    try {
        const query = 'UPDATE empleados SET activo = ? WHERE id = ?';
        db.query(query, [activo, id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }
            res.status(200).send('Empleado actualizado exitosamente');
        });
    } catch (error) {
        console.error('Error updating empleado activo:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/api/usuarios', async (req, res) => {
    try {
        const sql = `
            SELECT u.id, u.nombre_usuario, u.activo, u.id_empleado, r.nombre_rol
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
        `;
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching usuarios:', err);
                res.status(500).send('Error fetching usuarios');
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        console.error('Error fetching usuarios:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/api/usuarios/buscar', async (req, res) => {
    const { nombre } = req.query;
    if (!nombre) {
        return res.status(400).send('El nombre es requerido para la búsqueda.');
    }

    try {
        const sql = `
            SELECT u.id, u.nombre_usuario, u.activo, u.id_empleado, r.nombre_rol
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            WHERE u.nombre_usuario LIKE ?
        `;
        db.query(sql, [`${nombre}%`], (err, results) => {
            if (err) {
                console.error('Error searching usuarios:', err);
                res.status(500).send('Error searching usuarios');
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        console.error('Error searching usuarios:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/api/usuarios', async (req, res) => {
    const { nombre_usuario, rol_id, id_empleado, activo, contraseña } = req.body;
    if (!contraseña) {
        return res.status(400).send('La contraseña es requerida.');
    }
    try {
        const hash_contraseña = await bcrypt.hash(contraseña, 10);
        const sql = 'INSERT INTO usuarios (nombre_usuario, rol_id, id_empleado, activo, hash_contraseña) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [nombre_usuario, rol_id, id_empleado, activo, hash_contraseña], (err, result) => {
            if (err) {
                console.error('Error creating usuario:', err);
                res.status(500).send('Error creating usuario');
            } else {
                res.status(201).json({ id: result.insertId, nombre_usuario, rol_id, id_empleado, activo });
            }
        });
    } catch (error) {
        console.error('Error creating usuario:', error);
        res.status(500).send('Internal server error');
    }
});

app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre_usuario, rol_id, id_empleado, activo, contraseña } = req.body;
    let sql, params;

    try {
        if (contraseña) {
            const hash_contraseña = await bcrypt.hash(contraseña, 10);
            sql = 'UPDATE usuarios SET nombre_usuario = ?, rol_id = ?, id_empleado = ?, activo = ?, hash_contraseña = ? WHERE id = ?';
            params = [nombre_usuario, rol_id, id_empleado, activo, hash_contraseña, id];
        } else {
            sql = 'UPDATE usuarios SET nombre_usuario = ?, rol_id = ?, id_empleado = ?, activo = ? WHERE id = ?';
            params = [nombre_usuario, rol_id, id_empleado, activo, id];
        }

        db.query(sql, params, (err, result) => {
            if (err) {
                console.error('Error updating usuario:', err);
                res.status(500).send('Error updating usuario');
            } else {
                res.json({ id, nombre_usuario, rol_id, id_empleado, activo });
            }
        });
    } catch (error) {
        console.error('Error updating usuario:', error);
        res.status(500).send('Internal server error');
    }
});

app.patch('/api/usuarios/:id/activo', async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;
    try {
        const sql = 'UPDATE usuarios SET activo = ? WHERE id = ?';
        db.query(sql, [activo, id], (err, result) => {
            if (err) {
                console.error('Error updating usuario status:', err);
                res.status(500).send('Error updating usuario status');
            } else {
                res.json({ id, activo });
            }
        });
    } catch (error) {
        console.error('Error updating usuario status:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/api/roles', async (req, res) => {
    try {
        const query = 'SELECT * FROM roles';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/api/departamentos', async (req, res) => {
    try {
        const query = 'SELECT * FROM departamentos';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error fetching departamentos:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/api/salarios', async (req, res) => {
    const { id_empleado, salario_base } = req.body;
    try {
        const query = 'INSERT INTO salarios (id_empleado, salario_base) VALUES (?, ?)';
        db.query(query, [id_empleado, salario_base], (err, result) => {
            if (err) {
                console.error('Error creating salario:', err);
                return res.status(500).send('Error creating salario');
            }
            res.status(201).send('Salario creado exitosamente');
        });
    } catch (error) {
        console.error('Error creating salario:', error);
        res.status(500).send('Internal server error');
    }
});

app.put('/api/salarios/:id', async (req, res) => {
    const { id } = req.params;
    const { salario_base } = req.body;
    try {
        const query = 'UPDATE salarios SET salario_base = ? WHERE id = ?';
        db.query(query, [salario_base, id], (err, result) => {
            if (err) {
                console.error('Error updating salario:', err);
                return res.status(500).send('Error updating salario');
            }
            res.status(200).send('Salario actualizado exitosamente');
        });
    } catch (error) {
        console.error('Error updating salario:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/api/cargos', async (req, res) => {
    try {
        const query = 'SELECT * FROM cargos';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error fetching cargos:', error);
        res.status(500).send('Internal server error');
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
