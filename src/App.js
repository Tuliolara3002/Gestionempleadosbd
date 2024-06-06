import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GestionEmpleados from './components/GestionEmpleados';
import Administracion from './components/Administracion';
import Footer from './components/Footer';
import SearchComponent from './components/SearchComponent - copia';
import Header from './components/Header';
import acercaDe  from './components/AcercaDe';



import './App.css';



const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('');

    const handleLoginSuccess = (role) => {
        setIsAuthenticated(true);
        setUserRole(role);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserRole('');
    };

    const renderLinks = () => {
        switch(userRole) {
            case 'Empleado':
                return (<><Link to="/">Inicio</Link><Link to="/gestion_empleados">Gestión de empleados</Link><Link to="/acercaDe">Acerca de</Link></>);
            case 'Gerente':
                return (<><Link to="/">Inicio</Link><Link to="/gestion_empleados">Gestión de empleados</Link><Link to="/administracion">Administración</Link><Link to="/acercaDe">Acerca de</Link></>);
            case 'Operador de Nominas':
                return (<><Link to="/">Inicio</Link><Link to="/gestion_empleados">Gestión de empleados</Link><Link to="/acercaDe">Acerca de</Link><Link to="/procesamiento_nomina">Procesamiento de Nóminas</Link></>);    
            case 'Operador de RH':
                return (<><Link to="/">Inicio</Link><Link to="/gestion_empleados">Gestión de empleados</Link><Link to="/acercaDe">Acerca de</Link></>);
            case 'Admin':
                return (<><Link to="/">Inicio</Link><Link to="/gestion_empleados">Gestión de empleados</Link><Link to="/procesamiento_nomina">Procesamiento de Nóminas</Link><Link to="/administracion">Administración</Link><Link to="/acercaDe">Acerca de</Link></>);
            default:
                return null;
        }
    };

    return (
        <Router>
            <div className="App">
                {isAuthenticated && (
                    <header>
                        <nav>   
                            {renderLinks()}
                        </nav>
                        <div className="right-section">
                            <img src="logo.png" alt="Logo UMG" />
                            <button onClick={handleLogout}>Cerrar sesión</button>
                        </div>
                    </header>
                )}
                <Routes>
                    <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
                    <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/gestion_empleados" element={isAuthenticated ? <GestionEmpleados userRole={userRole} /> : <Navigate to="/login" />} />
                    <Route path="/administracion" element={isAuthenticated ? <Administracion userRole={userRole} /> : <Navigate to="/login" />} />
                    <Route path="/procesamiento_nomina" element={isAuthenticated ? <SearchComponent /> : <Navigate to="/login" />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
