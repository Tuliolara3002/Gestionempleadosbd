import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Administracion.css'; // Asegúrate de que la ruta es correcta

const Administracion = () => {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/usuarios');
                setUsuarios(response.data);
            } catch (error) {
                console.error('Error fetching usuarios:', error);
            }
        };

        fetchUsuarios();
    }, []);

    return (
        <div className="container">
            <header>
             
               
            </header>
            <main>
                <h1>Usuarios</h1>
                <div className="search-bar">
                    <button className="back-btn">&larr;</button>
                    <input type="text" placeholder="Buscar" />
                    <button>Buscar</button>
                    <button>Cancelar</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre de usuario</th>
                            <th>Rol</th>
                            <th>Opciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(usuario => (
                            <tr key={usuario.id}>
                                <td>{usuario.id}</td>
                                <td>{usuario.nombre_usuario}</td>
                                <td>{usuario.rol}</td>
                                <td>
                                    <input type="checkbox" checked />
                                    <button className="edit-btn">&#9998;</button>
                                    <button className="view-btn">&#128065;</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="pagination">
                    <button>&lt;&lt;</button>
                    <button>1</button>
                    <button>2</button>
                    <button>3</button>
                    <button>4</button>
                    <button>5</button>
                    <button>6</button>
                    <button>7</button>
                    <button>8</button>
                    <button>9</button>
                    <button>10</button>
                    <button>&gt;&gt;</button>
                </div>
                <button className="create-btn">Crear</button>
            </main>
        </div>
    );
};

export default Administracion;
