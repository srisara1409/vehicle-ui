import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './updateVehicleInfo.css';
import config from '../../config';

export default function UpdateVehicleInfo() {
  const { id } = useParams(); // this is userId
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetch(`${config.BASE_URL}/userVehicle/getUser/${id}`)
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

  const countActiveVehicles = () => {
    return vehicles.filter(v => v.vehicleStatus === 'Active').length;
  };

  const handleVehicleSubmit = async (userId, updatedVehicle) => {
    // Limit max 2 active vehicles
    const activeCount = countActiveVehicles();
    if (updatedVehicle.vehicleStatus === 'Active' && activeCount > 2) {
      alert('Only 2 vehicles can be Active at a time. Please mark one existing vehicle as Inactive before adding a new Active vehicle.');
      return;
    }

    try {
      const res = await fetch(`${config.BASE_URL}/userVehicle/updateVehicleInfoToUser/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedVehicle)
    });

      const text = await res.text();
      if (res.ok) {
    alert(`Vehicle ID updated successfully`);
      } else {
        alert(`Error: ${text}`);
      }
    } catch (err) {
      alert(`Something went wrong: ${err.message}`);
    }
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
        <div key={vehicle.vehicleId} className="vehicle-card">
          <div className="vehicle-row">
            {renderInput('vehicleMake', 'Make', vehicle.vehicleMake, e => handleVehicleChange(index, e))}
            {renderInput('vehicleModel', 'Model', vehicle.vehicleModel, e => handleVehicleChange(index, e))}
            {renderInput('vehicleYear', 'Year', vehicle.vehicleYear, e => handleVehicleChange(index, e))}
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

          <div className="vehicle-row">
            <div className="input-block">
              <label>Status</label>
              <div className="status-toggle">
                <input
                  type="checkbox"
                  checked={vehicle.vehicleStatus === 'Active'}
                  onChange={e =>
                    handleVehicleChange(index, {
                      target: {
                        name: 'vehicleStatus',
                        value: e.target.checked ? 'Active' : 'InActive'
                      }
                    })
                  }
                />
                <span>{vehicle.vehicleStatus === 'Active' ? 'Active' : 'InActive'}</span>
              </div>
            </div>
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
            <button onClick={() => handleVehicleSubmit(id, vehicle)}>Update Vehicle #{index + 1}</button>
          </div>
        </div>
      ))}

      <div className="back-buttonv">
        <button onClick={() => navigate('/homepage')}>Back to Home</button>
      </div>
    </div>
  );
}
