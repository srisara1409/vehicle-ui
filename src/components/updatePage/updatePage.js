import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './updatePage.css';

export default function UpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formInputs, setFormInputs] = useState({
    firstName: '', lastName: '', dateOfBirth: '', email: '', mobileNumber: '',
    emergencyName: '', emergencyNumber: '',
    addressLine: '', addressLine2: '', city: '', state: '', postalCode: '', country: '',
    make: '', model: '', year: '', registrationNumber: '', fuelType: '',
    bondAmount: '', bondWeeks: '', bondStartDate: '', bondEndDate: '',
    note: ''
  });

  useEffect(() => {
    fetch(`http://localhost:8080/vehicle/getUser/${id}`)
      .then(res => res.json())
      .then(data => setFormInputs(prev => ({ ...prev, ...data })));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    await fetch(`http://localhost:8080/vehicle/update/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formInputs)
    });
    alert('Vehicle updated successfully');
    navigate('/homepage');
  };

  const renderInput = (name, placeholder) => (
    <div className="input-group">
      <label htmlFor={name}>{placeholder}</label>
      <input
        type="text"
        id={name}
        name={name}
        value={formInputs[name] || ''}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="update-container">
      <h2 className="form-title">Update Vehicle</h2>

      <fieldset className="section-box">
        <legend>User Info</legend>
        <div className="row">
          {renderInput('firstName', 'First Name')}
          {renderInput('lastName', 'Last Name')}
        </div>
        <div className="row">
          {renderInput('dateOfBirth', 'Date of Birth')}
          {renderInput('email', 'Email')}
          {renderInput('mobileNumber', 'Mobile Number')}
        </div>
        <div className="row">
          {renderInput('emergencyName', 'Emergency Name')}
          {renderInput('emergencyNumber', 'Emergency Contact')}
        </div>
      </fieldset>

      <fieldset className="section-box">
        <legend>Address</legend>
        <div className="row">
          {renderInput('addressLine', 'Address Line 1')}
          {renderInput('addressLine2', 'Address Line 2')}
          {renderInput('city', 'City')}
        </div>
        <div className="row">
          {renderInput('state', 'State')}
          {renderInput('postalCode', 'Post Code')}
          {renderInput('country', 'Country')}
        </div>
      </fieldset>

      <fieldset className="section-box">
        <legend>Vehicle & Bond Info</legend>
        <div className="row">
          {renderInput('make', 'Make')}
          {renderInput('model', 'Model')}
          {renderInput('year', 'Year')}
        </div>
        <div className="row">
          {renderInput('registrationNumber', 'Registration Number')}
          {renderInput('fuelType', 'Fuel Type')}
        </div>
        <div className="row">
          {renderInput('bondAmount', 'Bond Amount')}
          {renderInput('bondWeeks', 'Bond Weeks')}
        </div>
        <div className="row">
          {renderInput('bondStartDate', 'Start Date')}
          {renderInput('bondEndDate', 'End Date')}
        </div>
      </fieldset>

      <fieldset className="section-box">
        <legend>Notes</legend>
        <textarea
          name="note"
          rows="4"
          className="full-width"
          value={formInputs.note}
          onChange={handleChange}
          placeholder="Enter notes here"
        />
      </fieldset>

      <div className="submit-section">
        <button className="submit-button" onClick={handleSubmit}>Submit Update</button>
      </div>
    </div>
  );
}
