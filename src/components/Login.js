import React, { useState } from 'react';
import axios from 'axios';
import './login.css'; // Asegúrate de que este archivo exista en la misma carpeta que este archivo JS

const Login = ({ onLoginSuccess }) => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://18.219.211.181:3001/login', {
                nombre_usuario: nombreUsuario,
                contraseña
            });
            if (response.status === 200) {
                onLoginSuccess(response.data.role);
            }
        } catch (err) {
            if (err.response) {
                // El servidor respondió con un estado diferente a 2xx
                setError(err.response.data);
            } else {
                // El servidor no respondió o hubo un error en la solicitud
                setError('Error en la solicitud de inicio de sesión');
            }
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre de Usuario:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={nombreUsuario}
                            onChange={(e) => setNombreUsuario(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            className="form-control"
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn">Login</button>
                    {error && <p className="error">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default Login;
