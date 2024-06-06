import React from 'react';
import { Link } from 'react-router-dom';
import './header.css'; // Asegúrate de que la ruta es correcta

const Header = () => {
    return (
        <header className="custom-header">
            <nav className="nav-links">
                <Link to="/" className="nav-link">Inicio</Link>
                <Link to="/gestion_empleados" className="nav-link">Gestión de empleados</Link>
                <Link to="/procesamiento_nomina" className="nav-link">Procesamiento de Nóminas</Link>
                <Link to="/administracion" className="nav-link">Administración</Link>
                <Link to="/AcercaDe" className="nav-link">Acerca de</Link>
            </nav>
            <div className="right-section">
                <img src="logo.png" alt="Logo UMG" className="logo" />
                <button className="logout-btn">Cerrar sesión</button>
            </div>
        </header>
    );
};

export default Header;
