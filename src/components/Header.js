import React from 'react';
import { Link } from 'react-router-dom';
import './header.css'; // Asegúrate de que la ruta es correcta

const Header = () => {
    return (
        <header>
            <nav>
                <Link to="/">Inicio</Link>
                <Link to="/gestion_empleados">Gestión de empleados</Link>
                <Link to="/procesamiento_nomina">Procesamiento de Nóminas</Link>
                <Link to="/administracion">Administración</Link>
                <Link to="/acercaDe">Acerca de</Link>
            </nav>
            <div className="right-section">
                <img src="logo.png" alt="Logo UMG" />
                <button>Cerrar sesión</button>
            </div>
        </header>
    );
};

export default Header;
