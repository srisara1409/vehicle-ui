import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './updateVehicleInfo.css';
import config from '../../config';

export default function UpdateVehicleInfo() {
  const { id } = useParams(); // this is userId
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [inactiveVehicles, setInactiveVehicles] = useState([]);

  useEffect(() => {
    fetchVehicles();
    fetchInactiveVehicles();
  }, [id]);

  const fetchVehicles = () => {
    fetch(`${config.BASE_URL}/userVehicle/getUser/${id}`)
      .then(res => res.json())
      .then(data => setVehicles(data.vehicles || []));
  };

  const fetchInactiveVehicles = () => {
    fetch(`${config.BASE_URL}/userVehicle/inactiveVehicles/${id}`)
      .then(res => res.json())
      .then(data => {
        setInactiveVehicles(Array.isArray(data) ? data : []);
      });
  };

  const handleVehicleChange = (index, event) => {
    const { name, value } = event.target;
    setVehicles(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };

  // const countActiveVehicles = () => {
  //   return vehicles.filter(v => v.vehicleStatus === 'Active').length;
  // };

  const handleVehicleSubmit = async (userId, updatedVehicle) => {
   // const activeCount = countActiveVehicles();
    // if (updatedVehicle.vehicleStatus === 'Active' && activeCount > 2) {
    //   alert('Only 2 vehicles can be Active at a time.');
    //   return;
    // }

//     const payload = {
//   ...updatedVehicle,
//   userVehicleId: updatedVehicle.userVehicleId,
//   vehicleType: updatedVehicle.vehicleType, // must be passed
// };

    try {
      const res = await fetch(`${config.BASE_URL}/userVehicle/updateVehicleInfoToUser/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVehicle)
      });

      const text = await res.text();
      if (res.ok) {
        alert(`Vehicle ID updated successfully`);
        fetchInactiveVehicles();
        fetchVehicles();
      } else if(res.status === 409) {
        alert(`Warning ! ${text}`);
        fetchInactiveVehicles();
        fetchVehicles();
      } else {
         alert(`Error: ${text}`);
      }
    } catch (err) {
      alert(`Something went wrong: ${err.message}`);
    }
  };

  const handleStatusUpdate = async (userVehicleId, newStatus) => {
    try {
      const res = await fetch(`${config.BASE_URL}/userVehicle/updateUserVehicleStatus/${userVehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleStatus: newStatus })
        
      });

      const text = await res.text();
      if (res.ok) {
        alert('Status updated successfully');
        fetchInactiveVehicles();
        fetchVehicles();
      } else {
        alert(`Error: ${text}`);
      }
    } catch (err) {
      alert(`Failed: ${err.message}`);
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
            {renderInput('bondWeeks', 'Rent per Week', vehicle.bondWeeks, e => handleVehicleChange(index, e))}
          </div>
          <div className="vehicle-row">
            {renderInput('bondStartDate', 'Start Date', vehicle.bondStartDate, e => handleVehicleChange(index, e))}
            {renderInput('bondEndDate', 'End Date', vehicle.bondEndDate, e => handleVehicleChange(index, e))}
          </div>
          <div className="vehicle-row">
            <div className="input-block">
              <label>Status</label>
              <div className="toggle-switch">
                <label className="switch">
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
                  <span className="slider"></span>
                </label>
                <span className="status-label">{vehicle.vehicleStatus}</span>
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

      <h2 style={{ marginTop: '40px' }}>Inactive Vehicles</h2>

      <table className="inactive-vehicle-table">
        <thead>
          <tr>
            <th>REGISTRATION NO</th>
            <th>MODEL</th>
            <th>MAKE</th>
            <th>YEAR</th>
            <th>FUEL TYPE</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(inactiveVehicles) && inactiveVehicles.length > 0 ? (
            inactiveVehicles.map(v => (
              <tr key={v.userVehicleId}>
                <td>{v.registrationNumber}</td>
                <td>{v.vehicleModel}</td>
                <td>{v.vehicleMake}</td>
                <td>{v.vehicleYear}</td>
                <td>{v.fuelType}</td>
                <td>
                  <select
                    value={v.vehicleStatus}
                    onChange={(e) => handleStatusUpdate(v.userVehicleId, e.target.value)}
                  >
                    <option value="InActive">InActive</option>
                    <option value="Active">Active</option>
                  </select>
                  <button
                    onClick={() => handleStatusUpdate(v.userVehicleId, v.vehicleStatus)}
                    style={{ marginLeft: '8px' }}
                  >
                    ✅
                  </button>
                </td>
              </tr>

            ))
          ) : (
            <tr><td colSpan="6">No inactive vehicles found.</td></tr>
          )}

        </tbody>
      </table>

      <div className="back-buttonv">
        <button onClick={() => navigate('/homepage')}>Back to Home</button>
      </div>
    </div>
  );
}
