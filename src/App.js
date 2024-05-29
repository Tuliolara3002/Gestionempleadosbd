import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GestionEmpleados from './components/GestionEmpleados';
import Footer from './components/Footer';
import Administracion from './components/Administracion'; // Ajusta la ruta según la ubicación real del archivo Administracion.js

import './App.css';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    return (
        <Router>
            <div className="App">
                {isAuthenticated && (
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
                )}
                <Routes>
                    <Route path="/" element={isAuthenticated ? <Dashboard /> : <Login onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/gestion_empleados" element={isAuthenticated ? <GestionEmpleados /> : <Login onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/administracion" element={isAuthenticated ? <Administracion /> : <Login onLoginSuccess={handleLoginSuccess} />} /> 
                    {/* Agrega más rutas según sea necesario */}
                </Routes>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
