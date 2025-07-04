import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import './updatePage.css';
import config from '../../config';

export default function UpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    firstName: '', lastName: '', dateOfBirth: '', email: '', mobileNumber: '',
    emergencyContactName: '', emergencyContactNumber: '',
    addressLine: '', addressLine2: '', city: '', state: '', postalCode: '', country: '', bankName: '',
    accountName: '', bsbNumber: '', accountNumber: '', vehicleType: '', licenseNumber: '', licenseState: '', licenseCountry: ''
  });

  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetch(`${config.BASE_URL}/vehicle/getUser/${id}`)
      .then(res => res.json())
      .then(data => {
        setUserInfo(data);
        setVehicles(data.vehicles || []);
      });
  }, [id]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = async () => {
    await fetch(`${config.BASE_URL}/register/update/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInfo)
    });
    alert("User details updated successfully.");
  };


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
    <div className="input-group">
      <label htmlFor={name}>{placeholder}</label>
      <input
        type="text"
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="update-container">
      <div className="close-button" onClick={() => navigate('/homepage')}>×</div>
      <h2 className="form-title">Update Vehicle</h2>

      {/* User Info Section */}
      <fieldset className="section-box">
        <legend>User Info</legend>
        <div className="row">
          {renderInput('firstName', 'First Name', userInfo.firstName, handleUserChange)}
          {renderInput('lastName', 'Last Name', userInfo.lastName, handleUserChange)}
          {renderInput('dateOfBirth', 'Date of Birth', userInfo.dateOfBirth, handleUserChange)}
        </div>
        <div className="row">
          {renderInput('email', 'Email', userInfo.email, handleUserChange)}
          {renderInput('mobileNumber', 'Mobile Number', userInfo.mobileNumber, handleUserChange)}
        </div>
        <div className="row">
          {renderInput('emergencyContactName', 'Emergency Name', userInfo.emergencyContactName, handleUserChange)}
          {renderInput('emergencyContactNumber', 'Emergency Contact', userInfo.emergencyContactNumber, handleUserChange)}
        </div>
        {/* Address Section */}
        <legend>Address</legend>
        <div className="row">
          {renderInput('addressLine', 'Address Line 1', userInfo.addressLine, handleUserChange)}
          {renderInput('addressLine2', 'Address Line 2', userInfo.addressLine2, handleUserChange)}
          {renderInput('city', 'City', userInfo.city, handleUserChange)}
        </div>
        <div className="row">
          {renderInput('state', 'State', userInfo.state, handleUserChange)}
          {renderInput('postalCode', 'Post Code', userInfo.postalCode, handleUserChange)}
          {renderInput('country', 'Country', userInfo.country, handleUserChange)}
        </div>

        {/* Financial Section */}
        <legend>Bank Details</legend>
        <div className="row">
          {renderInput('bankName', 'Bank Name', userInfo.bankName, handleUserChange)}
          {renderInput('accountName', 'Name as per Bank', userInfo.accountName, handleUserChange)}
        </div>
        <div className="row">
          {renderInput('bsbNumber', 'BSB No', userInfo.bsbNumber, handleUserChange)}
          {renderInput('accountNumber', 'Account Number', userInfo.accountNumber, handleUserChange)}
        </div>
        {/* License Section */}
        <legend>License Info</legend>
        <div className="row">
          {renderInput('vehicleType', 'Vehicle Type', userInfo.vehicleType, handleUserChange)}
          {renderInput('licenseNumber', 'License Number', userInfo.licenseNumber, handleUserChange)}
          {renderInput('licenseState', 'License State', userInfo.licenseState, handleUserChange)}
          {renderInput('licenseCountry', 'License Country', userInfo.licenseCountry, handleUserChange)}
        </div>

        <div className="row">
          <div className="input-group file-preview">
            <label>Uploaded License</label>
            {userInfo.id && (
              <a
                href={`${config.BASE_URL}/register/file/${userInfo.id}/license`}
                target="_blank"
                rel="noopener noreferrer"
                className="file-link-box"
              >
                View License
              </a>
            )}
          </div>

          <div className="input-group file-preview">
            <label>Uploaded Passport</label>
            {userInfo.id && (
              <a
                href={`${config.BASE_URL}/register/file/${userInfo.id}/passport`}
                target="_blank"
                rel="noopener noreferrer"
                className="file-link-box"
              >
                View Passport
              </a>
            )}
          </div>
        </div>


        <div className="section-actions">
          <button className="submit-button" onClick={handleUserSubmit}>Update User Details</button>
        </div>
      </fieldset>

      {/* Vehicles Section */}
      <fieldset className="section-box">
        <legend>Vehicle & Bond Info</legend>
        {vehicles.map((vehicle, index) => (
          <div key={vehicle.id} className="vehicle-form">
            <div className="row">
              {renderInput(`make-${index}`, 'Make', vehicle.make, e => handleVehicleChange(index, { ...e, target: { ...e.target, name: 'make' } }))}
              {renderInput(`model-${index}`, 'Model', vehicle.model, e => handleVehicleChange(index, { ...e, target: { ...e.target, name: 'model' } }))}
              {renderInput(`year-${index}`, 'Year', vehicle.year, e => handleVehicleChange(index, { ...e, target: { ...e.target, name: 'year' } }))}
            </div>
            <div className="row">
              {renderInput(`registrationNumber-${index}`, 'Registration Number', vehicle.registrationNumber, e => handleVehicleChange(index, { ...e, target: { ...e.target, name: 'registrationNumber' } }))}
              {renderInput(`fuelType-${index}`, 'Fuel Type', vehicle.fuelType, e => handleVehicleChange(index, { ...e, target: { ...e.target, name: 'fuelType' } }))}
            </div>
            <div className="row">
              {renderInput(`bondAmount-${index}`, 'Bond Amount', vehicle.bondAmount, e => handleVehicleChange(index, { ...e, target: { ...e.target, name: 'bondAmount' } }))}
              {renderInput(`bondWeeks-${index}`, 'Bond Weeks', vehicle.bondWeeks, e => handleVehicleChange(index, { ...e, target: { ...e.target, name: 'bondWeeks' } }))}
            </div>
            <div className="row">
              {renderInput(`bondStartDate-${index}`, 'Start Date', vehicle.bondStartDate, e => handleVehicleChange(index, { ...e, target: { ...e.target, name: 'bondStartDate' } }))}
              {renderInput(`bondEndDate-${index}`, 'End Date', vehicle.bondEndDate, e => handleVehicleChange(index, { ...e, target: { ...e.target, name: 'bondEndDate' } }))}
            </div>
            <div className="row">
              <label>Note</label>
              <textarea
                value={vehicle.note || ''}
                name="note"
                onChange={e => handleVehicleChange(index, e)}
                placeholder="Note"
              />
            </div>
            <button
              className="submit-button"
              onClick={() => handleVehicleSubmit(vehicle.id, vehicle)}
            >
              Update Vehicle #{index + 1}
            </button>
            <hr />
          </div>
        ))}
      </fieldset>

      <div className="submit-section">
        <button className="submit-button" onClick={() => navigate('/homepage')}>Back to Home</button>
      </div>
    </div>
  );
}
