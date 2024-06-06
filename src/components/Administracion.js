import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Administracion.css';

const Administracion = ({ userRole }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [newUsuario, setNewUsuario] = useState({
        id: '',
        nombre_usuario: '',
        rol_id: '',
        nombre_rol: '',
        id_empleado: '',
        activo: true,
        contraseña: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            await fetchRoles();
            await fetchUsuarios();
        };
        fetchData();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/usuarios');
            const usuariosData = response.data.map(usuario => ({
                ...usuario,
            }));
            setUsuarios(usuariosData);
        } catch (error) {
            console.error('Error fetching usuarios:', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewUsuario(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing
                ? `http://localhost:3001/api/usuarios/${newUsuario.id}`
                : 'http://localhost:3001/api/usuarios';
            await axios({
                method: method,
                url: url,
                data: newUsuario
            });
            setShowForm(false);
            fetchUsuarios();
        } catch (error) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} usuario:`, error);
        }
    };

    const handleEditClick = (usuario) => {
        setNewUsuario(usuario);
        setIsEditing(true);
        setIsViewing(false);
        setShowForm(true);
    };

    const handleViewClick = (usuario) => {
        setNewUsuario(usuario);
        setIsViewing(true);
        setIsEditing(false);
        setShowForm(true);
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
    };

    const handleSearchClick = () => {
        const filteredResults = usuarios.filter(u => u.nombre_usuario.toLowerCase().includes(searchQuery.toLowerCase()));
        setSearchResults(filteredResults);
    };

    const handleCheckboxChange = async (usuario) => {
        const updatedUsuario = { ...usuario, activo: !usuario.activo };
        await axios.patch(`http://localhost:3001/api/usuarios/${usuario.id}/activo`, { activo: updatedUsuario.activo });
        fetchUsuarios();
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleBackClick = () => {
        setSearchQuery('');
        setSearchResults([]);
        fetchUsuarios();
    };

    const usuariosPerPage = 5;
    const totalPages = Math.ceil(usuarios.length / usuariosPerPage);
    const currentUsuarios = usuarios.slice((currentPage - 1) * usuariosPerPage, currentPage * usuariosPerPage);

    const canEdit = userRole === 'Admin';
    const canActivateDeactivate = userRole === 'Admin';

    return (
        <div className="container">
            <main>
                <h1>Usuarios</h1>
                <div className="search-bar">
                    <input 
                        type="text" 
                        placeholder="Buscar usuario" 
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <button onClick={handleSearchClick}>Buscar</button>
                    <button onClick={handleBackClick}>Cancelar</button>
                    {canEdit && (
                        <button onClick={() => {
                            setNewUsuario({
                                id: '',
                                nombre_usuario: '',
                                rol_id: '',
                                id_empleado: '',
                                activo: true,
                                contraseña: ''
                            });
                            setIsEditing(false);
                            setIsViewing(false);
                            setShowForm(true);
                        }}>Crear</button>
                    )}
                </div>
                {searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((usuario, index) => (
                            <div 
                                key={index} 
                                className="search-result-item"
                                onClick={() => handleViewClick(usuario)}
                            >
                                {usuario.nombre_usuario}
                            </div>
                        ))}
                    </div>
                )}
                <div className="table-scroll-container">
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre de usuario</th>
                                    <th>Rol</th>
                                    {canActivateDeactivate && <th>Activo</th>}
                                    <th>Opciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsuarios.map((usuario, index) => (
                                    <tr key={index}>
                                        <td>{usuario.nombre_usuario}</td>
                                        <td>{usuario.nombre_rol}</td> {/* Mostrar nombre_rol directamente */}
                                        {canActivateDeactivate && (
                                            <td>
                                                <input 
                                                    type="checkbox" 
                                                    checked={usuario.activo} 
                                                    onChange={() => handleCheckboxChange(usuario)} 
                                                />
                                            </td>
                                        )}
                                        <td>
                                            {canEdit && (
                                                <button className="edit-btn" onClick={() => handleEditClick(usuario)}>&#9998;</button>
                                            )}
                                            <button className="view-btn" onClick={() => handleViewClick(usuario)}>&#128065;</button>
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
                            <h2>{isViewing ? 'Ver Usuario' : isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
                            <form onSubmit={handleSubmit}>
                                <label htmlFor="nombre_usuario">Nombre de Usuario</label>
                                <input
                                    type="text"
                                    name="nombre_usuario"
                                    id="nombre_usuario"
                                    placeholder="Nombre de Usuario"
                                    value={newUsuario.nombre_usuario}
                                    onChange={handleInputChange}
                                    disabled={isViewing}
                                />
                                <label htmlFor="rol_id">Rol</label>
                                <select
                                    name="rol_id"
                                    id="rol_id"
                                    value={newUsuario.rol_id}
                                    onChange={handleInputChange}
                                    disabled={isViewing}
                                >
                                    <option value="">Seleccionar</option>
                                    {roles.map((rol) => (
                                        <option key={rol.id} value={rol.id}>{rol.nombre_rol}</option>
                                    ))}
                                </select>
                                <label htmlFor="id_empleado">ID Empleado</label>
                                <input
                                    type="text"
                                    name="id_empleado"
                                    id="id_empleado"
                                    placeholder="ID Empleado"
                                    value={newUsuario.id_empleado}
                                    onChange={handleInputChange}
                                    disabled={isViewing}
                                />
                                {canActivateDeactivate && (
                                    <>
                                        <label htmlFor="activo">Activo</label>
                                        <input
                                            type="checkbox"
                                            name="activo"
                                            id="activo"
                                            checked={newUsuario.activo}
                                            onChange={handleInputChange}
                                            disabled={isViewing}
                                        />
                                    </>
                                )}
                                <label htmlFor="contraseña">Contraseña</label>
                                <input
                                    type="password"
                                    name="contraseña"
                                    id="contraseña"
                                    placeholder="Contraseña"
                                    value={newUsuario.contraseña}
                                    onChange={handleInputChange}
                                    disabled={isViewing}
                                />
                                {!isViewing && <button type="submit">{isEditing ? 'Actualizar' : 'Guardar'}</button>}
                                <button type="button" onClick={() => setShowForm(false)}>Cerrar</button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Administracion;
