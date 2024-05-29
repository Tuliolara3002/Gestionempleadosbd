import React, { useState } from 'react';
import axios from 'axios';
import './login.css'; // Importa el archivo CSS

const Login = ({ onLoginSuccess }) => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [error, setError] = useState('');
  

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/login', {
                nombre_usuario: nombreUsuario,
                contraseña
            });
            if (response.status === 200) {
                onLoginSuccess();
            }
        } catch (err) {
            setError('Usuario o contraseña incorrectos');
        }
    };

  

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Nombre de Usuario:</label>
                        <input
                            type="text"
                            value={nombreUsuario}
                            onChange={(e) => setNombreUsuario(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
                        />
                    </div>
                    <button type="submit">Login</button>
                    {error && <p>{error}</p>}
                </form>
              
               
                
            </div>
        </div>
    );
};

export default Login;
