// File: UpdateUserInfo.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './updateUserInfo.css';
import config from '../../config';

export default function UpdateUserInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    firstName: '', lastName: '', dateOfBirth: '', email: '', mobileNumber: '',
    emergencyContactName: '', emergencyContactNumber: '',
    addressLine: '', addressLine2: '', city: '', state: '', postalCode: '', country: '', bankName: '',
    accountName: '', bsbNumber: '', accountNumber: '', vehicleType: '', licenseNumber: '', licenseState: '', licenseCountry: ''
  });

  useEffect(() => {
    fetch(`${config.BASE_URL}/vehicle/getUser/${id}`)
      .then(res => res.json())
      .then(data => setUserInfo(data));
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

  const renderInput = (name, placeholder, value) => (
    <div className="input-field">
      <label htmlFor={name}>{placeholder}</label>
      <input
        type="text"
        id={name}
        name={name}
        value={value || ''}
        onChange={handleUserChange}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="user-update-wrapper">
      <div className="close-button" onClick={() => navigate('/homepage')}>×</div>
      <h1 className="page-title">Edit User Information</h1>

      <section className="form-section">
        <h2>User Info</h2>
        <div className="form-row">
          {renderInput('firstName', 'First Name', userInfo.firstName)}
          {renderInput('lastName', 'Last Name', userInfo.lastName)}
          {renderInput('dateOfBirth', 'Date of Birth', userInfo.dateOfBirth)}
        </div>
        <div className="form-row">
          {renderInput('email', 'Email', userInfo.email)}
          {renderInput('mobileNumber', 'Mobile Number', userInfo.mobileNumber)}
        </div>
        <div className="form-row">
          {renderInput('emergencyContactName', 'Emergency Name', userInfo.emergencyContactName)}
          {renderInput('emergencyContactNumber', 'Emergency Contact', userInfo.emergencyContactNumber)}
        </div>

        <h2>Address</h2>
        <div className="form-row">
          {renderInput('addressLine', 'Address Line 1', userInfo.addressLine)}
          {renderInput('addressLine2', 'Address Line 2', userInfo.addressLine2)}
          {renderInput('city', 'City', userInfo.city)}
        </div>
        <div className="form-row">
          {renderInput('state', 'State', userInfo.state)}
          {renderInput('postalCode', 'Post Code', userInfo.postalCode)}
          {renderInput('country', 'Country', userInfo.country)}
        </div>

        <h2>Bank Details</h2>
        <div className="form-row">
          {renderInput('bankName', 'Bank Name', userInfo.bankName)}
          {renderInput('accountName', 'Name as per Bank', userInfo.accountName)}
        </div>
        <div className="form-row">
          {renderInput('bsbNumber', 'BSB No', userInfo.bsbNumber)}
          {renderInput('accountNumber', 'Account Number', userInfo.accountNumber)}
        </div>

        <h2>License Info</h2>
        <div className="form-row">
          {renderInput('vehicleType', 'Vehicle Type', userInfo.vehicleType)}
          {renderInput('licenseNumber', 'License Number', userInfo.licenseNumber)}
          {renderInput('licenseState', 'License State', userInfo.licenseState)}
          {renderInput('licenseCountry', 'License Country', userInfo.licenseCountry)}
        </div>

        <div className="form-row file-links">
          <div>
            <label>Uploaded License</label><br />
            {userInfo.id && <a href={`${config.BASE_URL}/register/file/${userInfo.id}/license`} target="_blank" rel="noopener noreferrer">View License</a>}
          </div>
          <div>
            <label>Uploaded Passport</label><br />
            {userInfo.id && <a href={`${config.BASE_URL}/register/file/${userInfo.id}/passport`} target="_blank" rel="noopener noreferrer">View Passport</a>}
          </div>
        </div>

        <div className="button-row">
          <button onClick={handleUserSubmit}>Update User</button>
        </div>
      </section>

      <div className="back-button">
        <button onClick={() => navigate('/homepage')}>Back</button>
      </div>
    </div>
  );
}
