import React, { useEffect, useState } from 'react';
import './GestionEmpleados.css';

const GestionEmpleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [newEmpleado, setNewEmpleado] = useState({
        id: '',
        nombres: '',
        apellidos: '',
        fecha_nacimiento: '',
        fecha_ingreso: '',
        direccion: '',
        genero: '',
        dpi: '',
        telefono: '',
        correo_electronico: '',
        id_departamento: '',
        id_cargo: '',
        id_rol: ''
    });

    useEffect(() => {
        fetchEmpleados();
    }, []);

    const fetchEmpleados = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/empleados', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setEmpleados(data);
        } catch (error) {
            console.error('Error fetching empleados:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmpleado({ ...newEmpleado, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing
                ? `http://localhost:3001/api/empleados/${newEmpleado.id}`
                : 'http://localhost:3001/api/empleados';
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newEmpleado)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setShowForm(false);
            fetchEmpleados();
        } catch (error) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} empleado:`, error);
        }
    };

    const handleEditClick = (empleado) => {
        setNewEmpleado(empleado);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query) {
            try {
                const response = await fetch(`http://localhost:3001/api/empleados/buscar?nombre=${query}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSearchResults(data);
                setShowSearchResults(true);
            } catch (error) {
                console.error('Error searching empleados:', error);
            }
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    const handleSearchClick = (empleado) => {
        setSearchQuery('');
        setSearchResults([]);
        setEmpleados([empleado]);
        setShowSearchResults(false);
    };

    const handleBackClick = () => {
        fetchEmpleados();
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    return (
        <div className="content">
            <h1>Proyecto - Análisis de Sistemas I</h1>
            <h2>Empleados</h2>
            <a className="back-button" href="#">&larr;</a>
            <div className="search-container">
                <input 
                    type="text" 
                    placeholder="Buscar" 
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                <button>Buscar</button>
                <button>Cancelar</button>
                <button onClick={() => {
                    setNewEmpleado({
                        id: '',
                        nombres: '',
                        apellidos: '',
                        fecha_nacimiento: '',
                        fecha_ingreso: '',
                        direccion: '',
                        genero: '',
                        dpi: '',
                        telefono: '',
                        correo_electronico: '',
                        id_departamento: '',
                        id_cargo: '',
                        id_rol: ''
                    });
                    setIsEditing(false);
                    setShowForm(true);
                }}>Crear</button>
            </div>
            {showSearchResults && (
                <div className="search-results">
                    {searchResults.map((empleado, index) => (
                        <div 
                            key={index} 
                            className="search-result-item"
                            onClick={() => handleSearchClick(empleado)}
                        >
                            {empleado.nombres} {empleado.apellidos}
                        </div>
                    ))}
                </div>
            )}
            <div className="table-container">
                {empleados.length === 1 && <button onClick={handleBackClick}>Regresar</button>}
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombres</th>
                            <th>Apellidos</th>
                            <th>Fecha de Nacimiento</th>
                            <th>Fecha de Ingreso</th>
                            <th>Dirección</th>
                            <th>Género</th>
                            <th>DPI</th>
                            <th>Teléfono</th>
                            <th>Correo Electrónico</th>
                            <th>ID Departamento</th>
                            <th>ID Cargo</th>
                            <th>ID Rol</th>
                            <th>Opciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {empleados.map((empleado, index) => (
                            <tr key={index}>
                                <td>{empleado.id}</td>
                                <td>{empleado.nombres}</td>
                                <td>{empleado.apellidos}</td>
                                <td>{empleado.fecha_nacimiento}</td>
                                <td>{empleado.fecha_ingreso}</td>
                                <td>{empleado.direccion}</td>
                                <td>{empleado.genero}</td>
                                <td>{empleado.dpi}</td>
                                <td>{empleado.telefono}</td>
                                <td>{empleado.correo_electronico}</td>
                                <td>{empleado.id_departamento}</td>
                                <td>{empleado.id_cargo}</td>
                                <td>{empleado.id_rol}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleEditClick(empleado)}>&#9998;</button>
                                    <button className="view-btn">&#128065;</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showForm && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{isEditing ? 'Editar Empleado' : 'Crear Nuevo Empleado'}</h2>
                        <form onSubmit={handleSubmit} className="form-grid">
                            {['nombres', 'apellidos', 'fecha_nacimiento', 'fecha_ingreso', 'direccion', 'genero', 'dpi', 'telefono', 'correo_electronico', 'id_departamento', 'id_cargo', 'id_rol'].map((field, index) => (
                                <div key={index} className="form-group">
                                    <label htmlFor={field}>{field.replace('_', ' ').toUpperCase()}</label>
                                    <input
                                        type={field.includes('fecha') ? 'date' : field.includes('correo') ? 'email' : 'text'}
                                        name={field}
                                        id={field}
                                        placeholder={field.replace('_', ' ').toUpperCase()}
                                        value={newEmpleado[field]}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            ))}
                            <div className="form-actions">
                                <button type="submit">{isEditing ? 'Actualizar' : 'Guardar'}</button>
                                <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionEmpleados;
