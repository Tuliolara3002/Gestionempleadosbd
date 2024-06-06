// Inicio.js

import React from 'react';
import './Inicio.css';
import './AcercaDe.css';

const Inicio = () => {
    return (
        <header>
            <nav>
                <div className="footer">
                    <p>Ingeniería en Sistemas de Información</p>
                    <p>Centro Universitario: Chiquimulilla, Santa Rosa.</p>
                    <p>Semestre 1 - 2024</p>
                </div>
            </nav>
            <div className="right-section">
                <img src="logo.png" alt="Logo UMG" className="logo" />
                <button>Cerrar sesión</button>
            </div>
        </header>
    );
}

export default Inicio;
