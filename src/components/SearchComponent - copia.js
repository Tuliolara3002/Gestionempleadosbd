import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './GestionEmpleados.css';
import Nomina from './Nomina';
import NominaGeneral from './NominaGeneral';

const GestionEmpleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [originalEmpleados, setOriginalEmpleados] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const nominaRef = useRef(null);

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
            const activeEmployees = data.filter(empleado => empleado.activo); // Filtra empleados activos
            setEmpleados(activeEmployees);
            setOriginalEmpleados(activeEmployees);
        } catch (error) {
            console.error('Error fetching empleados:', error);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        filterEmpleados(query, selectedDepartment);
    };

    const handleDepartmentChange = (e) => {
        const department = e.target.value;
        setSelectedDepartment(department);
        filterEmpleados(searchQuery, department);
    };

    const filterEmpleados = (query, department) => {
        let filteredEmpleados = originalEmpleados;

        if (department) {
            switch (department) {
                case 'desarrollo':
                    filteredEmpleados = filteredEmpleados.filter(empleado => empleado.nombre_departamento === 'Desarrollo');
                    break;
                case 'recursos_humanos':
                    filteredEmpleados = filteredEmpleados.filter(empleado => empleado.nombre_departamento === 'Recursos Humanos');
                    break;
                case 'ventas':
                    filteredEmpleados = filteredEmpleados.filter(empleado => empleado.nombre_departamento === 'Ventas');
                    break;
                default:
                    break;
            }
        }

        if (query) {
            filteredEmpleados = filteredEmpleados.filter(empleado =>
                empleado.nombres.toLowerCase().includes(query.toLowerCase()) ||
                empleado.apellidos.toLowerCase().includes(query.toLowerCase())
            );
        }

        setEmpleados(filteredEmpleados);
    };

    const handleBackClick = () => {
        setGeneratingPDF(false);
        setSelectedEmpleado(null);
    };

    const generatePDF = (empleado = null) => {
        setGeneratingPDF(true);
        if (empleado) {
            setSelectedEmpleado(empleado);
        } else {
            setSelectedEmpleado(null);
        }
    };

    useEffect(() => {
        const createPDF = async () => {
            if (generatingPDF) {
                const input = nominaRef.current;
                if (input) {
                    const pdf = new jsPDF('p', 'pt', 'a4');
                    const canvas = await html2canvas(input);
                    const imgData = canvas.toDataURL('image/png');
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save("nomina.pdf");
                }
                setSelectedEmpleado(null);
                setGeneratingPDF(false);
            }
        };

        if (generatingPDF) {
            setTimeout(createPDF, 0);
        }
    }, [generatingPDF]);

    return (
        <div className="content">
            <div className="header">
                <h1>Procesamiento de Nóminas</h1>
                <button onClick={() => generatePDF()} className="link-button">
                    Generar Nómina General
                </button>
            </div>
            <h2>Empleados</h2>
            <div className="search-container">
                <input 
                    type="text" 
                    placeholder="Buscar" 
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>
            <div className="department-filter">
                <label htmlFor="department-select">Filtrar por departamento:</label>
                <select id="department-select" value={selectedDepartment} onChange={handleDepartmentChange}>
                    <option value="">Todos</option>
                    <option value="desarrollo">Desarrollo</option>
                    <option value="recursos_humanos">Recursos Humanos</option>
                    <option value="ventas">Ventas</option>
                </select>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombres</th>
                            <th>Apellidos</th>
                            <th>Género</th>
                            <th>Departamento</th>
                            <th>Cargo</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {empleados.map((empleado, index) => (
                            <tr key={index}>
                                <td>{empleado.id}</td>
                                <td>{empleado.nombres}</td>
                                <td>{empleado.apellidos}</td>
                                <td>{empleado.genero}</td>
                                <td>{empleado.nombre_departamento}</td>
                                <td>{empleado.cargo}</td>
                                <td>{empleado.rol}</td>
                                <td>
                                    <button onClick={() => generatePDF(empleado)} className="link-button">
                                        Generar Nómina
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {empleados.length === 1 && <button onClick={handleBackClick}>Regresar</button>}
            </div>
            {selectedEmpleado && (
                <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
                    <Nomina ref={nominaRef} empleado={selectedEmpleado} />
                </div>
            )}
            {generatingPDF && !selectedEmpleado && (
                <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
                    <NominaGeneral ref={nominaRef} empleados={empleados} />
                </div>
            )}
        </div>
    );
};

export default GestionEmpleados;
