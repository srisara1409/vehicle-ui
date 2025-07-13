// File: UpdateVehicleInfo.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './updateVehicleInfo.css';
import config from '../../config';

export default function UpdateVehicleInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetch(`${config.BASE_URL}/vehicle/getUser/${id}`)
      .then(res => res.json())
      .then(data => setVehicles(data.vehicles || []));
  }, [id]);

  const handleVehicleChange = (index, event) => {
    const { name, value } = event.target;
    setVehicles(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };

  const handleVehicleSubmit = async (vehicleId, updatedVehicle) => {
    await fetch(`${config.BASE_URL}/vehicle/update/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedVehicle)
    });
    alert(`Vehicle ID ${vehicleId} updated successfully`);
  };

  const renderInput = (name, placeholder, value, onChange) => (
    <div className="input-block">
      <label>{placeholder}</label>
      <input
        type="text"
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="vehicle-update-container">
      <div className="close-button" onClick={() => navigate('/homepage')}>×</div>
      <h1 className="page-header">Update Vehicle Details</h1>

      {vehicles.map((vehicle, index) => (
        <div key={vehicle.id} className="vehicle-card">
          <div className="vehicle-row">
            {renderInput('make', 'Make', vehicle.make, e => handleVehicleChange(index, e))}
            {renderInput('model', 'Model', vehicle.model, e => handleVehicleChange(index, e))}
            {renderInput('year', 'Year', vehicle.year, e => handleVehicleChange(index, e))}
          </div>
          <div className="vehicle-row">
            {renderInput('registrationNumber', 'Registration Number', vehicle.registrationNumber, e => handleVehicleChange(index, e))}
            {renderInput('fuelType', 'Fuel Type', vehicle.fuelType, e => handleVehicleChange(index, e))}
          </div>
          <div className="vehicle-row">
            {renderInput('bondAmount', 'Bond Amount', vehicle.bondAmount, e => handleVehicleChange(index, e))}
            {renderInput('bondWeeks', 'Bond Weeks', vehicle.bondWeeks, e => handleVehicleChange(index, e))}
          </div>
          <div className="vehicle-row">
            {renderInput('bondStartDate', 'Start Date', vehicle.bondStartDate, e => handleVehicleChange(index, e))}
            {renderInput('bondEndDate', 'End Date', vehicle.bondEndDate, e => handleVehicleChange(index, e))}
          </div>
          <div className="vehicle-row full-width">
            <label>Note</label>
            <textarea
              name="note"
              value={vehicle.note || ''}
              onChange={e => handleVehicleChange(index, e)}
              placeholder="Note"
            />
          </div>

          <div className="vehicle-actions">
            <button onClick={() => handleVehicleSubmit(vehicle.id, vehicle)}>Update Vehicle #{index + 1}</button>
          </div>
        </div>
      ))}

      <div className="back-button">
        <button onClick={() => navigate('/homepage')}>Back to Home</button>
      </div>
    </div>
  );
}
