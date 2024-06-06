import React from 'react';
import { jsPDF } from "jspdf";


const Nomina = React.forwardRef(({ empleado }, ref) => {
    if (!empleado) {
        return null; // Si empleado es null o undefined, no renderizar nada
    }

    // Verificar y asignar valores con manejo seguro
    const id = empleado.id ?? '';
    const nombres = empleado.nombres ?? '';
    const apellidos = empleado.apellidos ?? '';
    const cargo = empleado.cargo ?? '';
    const division = empleado.division ?? '';
    const fechaContratacion = empleado.fecha_contratacion ? new Date(empleado.fecha_contratacion).toLocaleDateString() : '';
    const observaciones = empleado.observaciones ?? '';
    const bonificaciones = empleado.bonificaciones ?? 0;
    const salarioBase = empleado.salario_base ?? 0;

    // Calcular valores numéricos asegurando que no sean undefined
    const igss = salarioBase ? (salarioBase * 0.0483).toFixed(2) : '0.00';
    const isr = salarioBase ? (salarioBase * 0.05).toFixed(2) : '0.00';
    const totalIngresos = salarioBase + bonificaciones;
    const totalDescuentos = parseFloat(igss) + parseFloat(isr);
    const salarioNeto = totalIngresos - totalDescuentos;

    return (
        <div ref={ref} className="nomina-container">
            <h2>Nómina - Abril 2024</h2>
            <p>Fecha: 27/04/2024</p>
            <div className="nomina-header">
                <p><strong>Código:</strong> {id}</p>
                <p><strong>Nombre:</strong> {nombres} {apellidos}</p>
                <p><strong>Cargo:</strong> {cargo}</p>
                <p><strong>División:</strong> {division}</p>
                <p><strong>Fecha contratación:</strong> {fechaContratacion}</p>
                <p><strong>Observaciones:</strong> {observaciones}</p>
            </div>
            <table className="nomina-table">
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th>Monto</th>
                        <th>Descripción</th>
                        <th>Monto</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>BONIFICACIÓN DE LEY</td>
                        <td>Q{bonificaciones.toFixed(2)}</td>
                        <td>IGSS</td>
                        <td>Q{igss}</td>
                    </tr>
                    <tr>
                        <td>SALARIO ORDINARIO</td>
                        <td>Q{salarioBase.toFixed(2)}</td>
                        <td>RETENCIÓN ISR</td>
                        <td>Q{isr}</td>
                    </tr>
                </tbody>
            </table>
            <div className="nomina-totals">
                <p><strong>Total de ingresos:</strong> Q{totalIngresos.toFixed(2)}</p>
                <p><strong>Total de descuentos:</strong> Q{totalDescuentos.toFixed(2)}</p>
                <p><strong>LÍQUIDO A RECIBIR:</strong> Q{salarioNeto.toFixed(2)}</p>
            </div>
            <div className="nomina-footer">
                <p><strong>RECIBÍ CONFORME (F):</strong> {nombres} {apellidos}</p>
            </div>
        </div>
    );
});

export default Nomina;
