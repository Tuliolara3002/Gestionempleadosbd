import React, { useEffect, useState } from 'react';
import './GestionEmpleados.css';

const GestionEmpleados = ({ userRole }) => {
    const [empleados, setEmpleados] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [roles, setRoles] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
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
        nombre_departamento: '',
        nombre_cargo: '',
        nombre_rol: '',
        salario_base: '',
        activo: true
    });

    useEffect(() => {
        const controller = new AbortController();
        fetchEmpleados(controller);
        fetchDepartamentos(controller);
        fetchCargos(controller);
        fetchRoles(controller);
        return () => {
            controller.abort();
        };
    }, []);

    const fetchEmpleados = async (controller) => {
        try {
            const response = await fetch('http://localhost:3001/api/empleados', {
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setEmpleados(data);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching empleados:', error);
            }
        }
    };

    const fetchDepartamentos = async (controller) => {
        try {
            const response = await fetch('http://localhost:3001/api/departamentos', {
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setDepartamentos(data);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching departamentos:', error);
            }
        }
    };

    const fetchCargos = async (controller) => {
        try {
            const response = await fetch('http://localhost:3001/api/cargos', {
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCargos(data);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching cargos:', error);
            }
        }
    };

    const fetchRoles = async (controller) => {
        try {
            const response = await fetch('http://localhost:3001/api/roles', {
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setRoles(data);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching roles:', error);
            }
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEmpleado)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setShowForm(false);
            setIsEditing(false);
            setIsViewing(false);
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
                nombre_departamento: '',
                nombre_cargo: '',
                nombre_rol: '',
                salario_base: '',
                activo: true
            });
            fetchEmpleados(new AbortController()); // Llama a fetchEmpleados directamente
        } catch (error) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} empleado:`, error);
        }
    };

    const handleEditClick = (empleado) => {
        if (empleado) {
            setNewEmpleado(empleado);
            setIsEditing(true);
            setIsViewing(false);
            setShowForm(true);
        }
    };

   const handleViewClick = (empleado) => {
    setNewEmpleado({
        ...empleado,
        fecha_nacimiento: formatDateForView(empleado.fecha_nacimiento), // Formatear fecha de nacimiento
        fecha_ingreso: formatDate(empleado.fecha_ingreso)
    });
    setIsViewing(true);
    setIsEditing(false);
    setShowForm(true);
};

const formatDateForView = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (!isNaN(date)) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    return dateString;
};



    
    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query) {
            try {
                const response = await fetch(`http://localhost:3001/api/empleados/buscar?nombre=${query}`, {
                    headers: { 'Content-Type': 'application/json' }
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

    const handleSearchClick = () => {
        setEmpleados(searchResults);
    };

    const handleBackClick = () => {
        fetchEmpleados(new AbortController());
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    const handleCheckboxChange = async (empleado) => {
        try {
            const updatedEmpleado = { ...empleado, activo: !empleado.activo };
            const response = await fetch(`http://localhost:3001/api/empleados/${empleado.id}/activo`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activo: updatedEmpleado.activo })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            await fetchEmpleados(new AbortController());  // Refetch empleados after updating
        } catch (error) {
            console.error('Error updating empleado:', error);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const empleadosPerPage = 5;
    const totalPages = Math.ceil(empleados.length / empleadosPerPage);
    const currentEmpleados = empleados.slice((currentPage - 1) * empleadosPerPage, currentPage * empleadosPerPage);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (!isNaN(date)) {
            return date.toISOString().split('T')[0]; // Formatear como yyyy-mm-dd para la entrada
        }
        return dateString;
    };


    const parseDate = (dateString) => {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    };

    const canCreateEdit = userRole === 'Operador de RH' || userRole === 'Admin';
    const canActivateDeactivate = userRole === 'Admin' || userRole === 'Operador de RH';

    return (
        <div className="content">
            <h1>Proyecto - Análisis de Sistemas I</h1>
            <h2>Empleados</h2>
            <a className="back-button" href="#">&larr;</a>
            <div className="search-container">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Buscar empleados por nombre"
                />
                <button onClick={handleSearchClick}>Buscar</button>
                <button onClick={handleBackClick}>Volver</button>
                {canCreateEdit && (
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
                            nombre_departamento: '',
                            nombre_cargo: '',
                            nombre_rol: '',
                            salario_base: '',
                            activo: true
                        });
                        setIsEditing(false);
                        setIsViewing(false);
                        setShowForm(true);
                    }}>Crear</button>
                )}
            </div>
            {showSearchResults && (
                <div className="search-results">
                    {searchResults.map((empleado, index) => (
                        <div
                            key={index}
                            className="search-result-item"
                            onClick={() => handleViewClick(empleado)}
                        >
                            {empleado.nombres} {empleado.apellidos}
                        </div>
                    ))}
                </div>
            )}
            <div className="table-scroll-container">
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombres</th>
                                <th>Apellidos</th>
                                <th>Fecha de Ingreso</th>
                                <th>Dirección</th>
                                <th>DPI</th>
                                <th>Teléfono</th>
                                <th>Correo Electrónico</th>
                                <th>Nombre del Departamento</th>
                                <th>Nombre del Cargo</th>
                                <th>Nombre del Rol</th>
                                <th>Salario Base</th>
                                {canActivateDeactivate && <th>Activo</th>}
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentEmpleados.map((empleado, index) => (
                                <tr key={index}>
                                    <td>{empleado.nombres}</td>
                                    <td>{empleado.apellidos}</td>
                                    <td>{formatDate(empleado.fecha_ingreso)}</td>
                                    <td>{empleado.direccion}</td>
                                    <td>{empleado.dpi}</td>
                                    <td>{empleado.telefono}</td>
                                    <td>{empleado.correo_electronico}</td>
                                    <td>{empleado.nombre_departamento}</td>
                                    <td>{empleado.nombre_cargo}</td>
                                    <td>{empleado.nombre_rol}</td>
                                    <td>{empleado.salario_base}</td>
                                    {canActivateDeactivate && (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={empleado.activo}
                                                onChange={() => handleCheckboxChange(empleado)}
                                            />
                                        </td>
                                    )}
                                    <td>
                                        {canCreateEdit && (
                                            <button className="edit-btn" onClick={() => handleEditClick(empleado)}>&#9998;</button>
                                        )}
                                        <button className="view-btn" onClick={() => handleViewClick(empleado)}>&#128065;</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        disabled={currentPage === index + 1}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
            {showForm && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{isViewing ? 'Ver Empleado' : isEditing ? 'Editar Empleado' : 'Crear Nuevo Empleado'}</h2>
                        <form onSubmit={handleSubmit} className="form-grid">
                            {['nombres', 'apellidos', 'fecha_nacimiento', 'fecha_ingreso', 'direccion', 'genero', 'dpi', 'telefono', 'correo_electronico', 'salario_base'].map((field, index) => (
                                <div key={index} className="form-group">
                                    <label htmlFor={field}>{field.replace('_', ' ').toUpperCase()}</label>
                                    <input
                                        type={field.includes('fecha') ? 'date' : field.includes('correo') ? 'email' : 'text'}
                                        name={field}
                                        id={field}
                                        placeholder={field.replace('_', ' ').toUpperCase()}
                                        value={
                                            isViewing && field.includes('fecha')
                                                ? formatDate(newEmpleado[field])
                                                : newEmpleado[field]
                                        }
                                        onChange={handleInputChange}
                                        disabled={isViewing}
                                    />
                                </div>
                            ))}
                            <div className="form-group">
                                <label htmlFor="nombre_departamento">NOMBRE DEL DEPARTAMENTO</label>
                                <select
                                    name="nombre_departamento"
                                    id="nombre_departamento"
                                    value={newEmpleado.nombre_departamento}
                                    onChange={handleInputChange}
                                    disabled={isViewing}
                                >
                                    <option value="">Seleccionar</option>
                                    {departamentos.map((dept, index) => (
                                        <option key={index} value={dept.nombre_departamento}>{dept.nombre_departamento}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="nombre_cargo">NOMBRE DEL CARGO</label>
                                <select
                                    name="nombre_cargo"
                                    id="nombre_cargo"
                                    value={newEmpleado.nombre_cargo}
                                    onChange={handleInputChange}
                                    disabled={isViewing}
                                >
                                    <option value="">Seleccionar</option>
                                    {cargos.map((cargo, index) => (
                                        <option key={index} value={cargo.nombre_cargo}>{cargo.nombre_cargo}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="nombre_rol">NOMBRE DEL ROL</label>
                                <select
                                    name="nombre_rol"
                                    id="nombre_rol"
                                    value={newEmpleado.nombre_rol}
                                    onChange={handleInputChange}
                                    disabled={isViewing}
                                >
                                    <option value="">Seleccionar</option>
                                    {roles.map((rol, index) => (
                                        <option key={index} value={rol.nombre_rol}>{rol.nombre_rol}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-actions">
                                {!isViewing && <button type="submit">{isEditing ? 'Actualizar' : 'Guardar'}</button>}
                                <button type="button" onClick={() => setShowForm(false)}>Cerrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionEmpleados;
