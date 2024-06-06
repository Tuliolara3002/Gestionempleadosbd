import React from 'react';
import { format } from 'date-fns';
import './NominaGeneral.css';


const NominaGeneral = React.forwardRef(({ empleados }, ref) => {
    const formatFechaContratacion = (fecha) => {
        const date = new Date(fecha);
        return isNaN(date) ? 'Fecha no válida' : format(date, 'dd/MM/yyyy');
    };

    return (
        <div ref={ref} className="nomina-container">
            <h2>Nómina General - Abril 2024</h2>
            <p>Fecha: 27/04/2024</p>
            <table className="nomina-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Cargo</th>
                        <th>División</th>
                        <th>Fecha contratación</th>
                        <th>Bonificación de Ley</th>
                        <th>Salario Ordinario</th>
                        <th>IGSS</th>
                        <th>Retención ISR</th>
                        <th>Total Ingresos</th>
                        <th>Total Descuentos</th>
                        <th>Líquido a Recibir</th>
                        <th>Observaciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map((empleado, index) => (
                        <tr key={index}>
                            <td>{empleado.id}</td>
                            <td>{empleado.nombres} {empleado.apellidos}</td>
                            <td>{empleado.cargo}</td>
                            <td>{empleado.division}</td>
                            <td>{formatFechaContratacion(empleado.fecha_ingreso)}</td>
                            <td>Q500.00</td>
                            <td>Q5100.00</td>
                            <td>Q300.00</td>
                            <td>Q88.20</td>
                            <td>Q5600.00</td>
                            <td>Q388.20</td>
                            <td>Q5300.00</td>
                            <td>{empleado.observaciones}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default NominaGeneral;
