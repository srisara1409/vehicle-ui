import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './vehiclePage.css'; // Optional for styling
import config from '../../config'; // Make sure you have BASE_URL defined here

export default function VehiclePage() {
  const [vehicleList, setVehicleList] = useState([]);
  const [vehicle, setVehicle] = useState({
    registrationNumber: '',
    vehicleModel: '',
    vehicleMake: '',
    vehicleYear: '',
    fuelType: '',
    vehicleType: ''
  });

  const [message, setMessage] = useState('');
  const [searchText, setSearchText] = useState('');


  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${config.BASE_URL}/adminVehicle/allVehicle`);
      setVehicleList(response.data);
    } catch (error) {
      console.error('Error fetching vehicles', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle({ ...vehicle, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${config.BASE_URL}/adminVehicle/addVehicle`, vehicle);
      setMessage(res.data);
      setVehicle({
        registrationNumber: '',
        vehicleModel: '',
        vehicleMake: '',
        vehicleYear: '',
        fuelType: '',
        vehicleType: ''
      });
      fetchVehicles(); // Refresh list
    } catch (error) {
      if (error.response?.data) {
        setMessage(error.response.data);
      } else {
        setMessage('Error adding vehicle');
      }
    }
  };

  const handleStatusChange = (index, newStatus) => {
    const updatedList = [...vehicleList];
    updatedList[index].vehicleStatus  = newStatus;
    setVehicleList(updatedList);
  };

  const updateStatus = async (registrationNumber, vehicleStatus ) => {
    try {
      await axios.put(`${config.BASE_URL}/adminVehicle/updateVehicleStatus/${registrationNumber}?status=${vehicleStatus }`);
      setMessage("Status updated successfully.");
    } catch (error) {
      console.error("Error updating vehicle status:", error);
      setMessage("Error updating status.");
    }
  };

  return (
    <div className="vehicle-container page-wrapper">
      <h2 style={{ fontSize: "28px", fontWeight: "600", color: "#111827", marginBottom: "30px" }}>Add New Vehicle</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="vehicle-form" autoComplete="off">
        <input type="text" name="registrationNumber" value={vehicle.registrationNumber} placeholder="Registration Number" onChange={handleChange} required />
        <input type="text" name="vehicleModel" value={vehicle.vehicleModel} placeholder="Model" onChange={handleChange} required />
        <input type="text" name="vehicleMake" value={vehicle.vehicleMake} placeholder="Make" onChange={handleChange} required />
        <input type="number" name="vehicleYear" value={vehicle.vehicleYear} placeholder="Year" onChange={handleChange} required />
        <input type="text" name="fuelType" value={vehicle.fuelType} placeholder="Fuel Type" onChange={handleChange} required />
        <input type="text" name="vehicleType" value={vehicle.vehicleType} placeholder="Vehicle Type" onChange={handleChange} required />
        <button type="submit" className="add-button">Add Vehicle</button>
      </form>

      {/* 🔍 Search Filter */}

      <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#111827", marginTop: "40px" }}>Vehicle List</h2>
      <div className="search-filter-row">
        <input
          type="text"
          placeholder="Search by Registration No"
          className="search-input"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button className="filter-btn"
          onClick={() => setSearchText('')}>
          Clear
        </button>
      </div>
      <div className="table-wrapper">
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>Registration No</th>
              <th>Model</th>
              <th>Make</th>
              <th>Year</th>
              <th>Fuel Type</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicleList
              .filter((v) =>
                !searchText || v.registrationNumber.toLowerCase().includes(searchText.toLowerCase())
              )
              .map((v, index) => (
                <tr key={v.adminVehicleId || index}>
                  <td>{v.registrationNumber}</td>
                  <td>{v.vehicleModel}</td>
                  <td>{v.vehicleMake}</td>
                  <td>{v.vehicleYear}</td>
                  <td>{v.fuelType}</td>
                  <td>{v.vehicleType}</td>
                  <td>
                    <select
                      value={v.vehicleStatus}
                      onChange={(e) => handleStatusChange(index, e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Sold">Sold</option>
                    </select>
                    <button onClick={() => updateStatus(v.registrationNumber, v.vehicleStatus)}>
                      ✅
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
