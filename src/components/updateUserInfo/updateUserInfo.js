import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './updateUserInfo.css';
import config from '../../config';

export default function UpdateUserInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    id: '', // include this for file URLs
    firstName: '', lastName: '', dateOfBirth: '', email: '', mobileNumber: '',
    emergencyContactName: '', emergencyContactNumber: '',
    addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '', bankName: '',
    accountName: '', bsbNumber: '', accountNumber: '', vehicleType: '', licenseNumber: '', licenseState: '', licenseCountry: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${config.BASE_URL}/userVehicle/getUser/${id}`);
        const data = await res.json();
        if (data) setUserInfo(prev => ({ ...prev, ...data, id }));
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [id]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = async () => {
    try {
      const res = await fetch(`${config.BASE_URL}/register/update/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInfo)
    });
      if (res.ok) {
    alert("User details updated successfully.");
        navigate('/homepage'); // Uncomment to auto-redirect
      } else {
        alert("Failed to update. Please try again.");
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const renderInput = (name, placeholder, value, disabled = false) => (
    <div className="input-field">
      <label htmlFor={name}>{placeholder}</label>
      <input
        type="text"
        id={name}
        name={name}
        value={value || ''}
        onChange={handleUserChange}
        placeholder={placeholder}
        disabled={disabled}
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
          {renderInput('addressLine1', 'Address Line 1', userInfo.addressLine1)}
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
          {renderInput('bankName', 'Bank Name', userInfo.bankName, true)}
          {renderInput('accountName', 'Name as per Bank', userInfo.accountName, true)}
        </div>
        <div className="form-row">
          {renderInput('bsbNumber', 'BSB No', userInfo.bsbNumber, true)}
          {renderInput('accountNumber', 'Account Number', userInfo.accountNumber, true)}
        </div>

        <h2>License Info</h2>
        <div className="form-row">
          {renderInput('vehicleType', 'Vehicle Type', userInfo.vehicleType)}
          {renderInput('licenseNumber', 'License Number', userInfo.licenseNumber)}
        </div>

        <div className="form-row">
          {renderInput('licenseState', 'License State', userInfo.licenseState)}
          {renderInput('licenseCountry', 'License Country', userInfo.licenseCountry)}
        </div>

        <div className="form-row file-links">
          {['car', 'motorbike'].includes(userInfo.vehicleType?.toLowerCase()) && (
            <>
              <div>
                <label>Uploaded License</label><br />
                {userInfo.id && (
                  <a href={`${config.BASE_URL}/register/file/${userInfo.id}/license`} target="_blank" rel="noopener noreferrer">
                    View License
                  </a>
                )}
              </div>
              <div>
                <label>Uploaded Passport</label><br />
                {userInfo.id && (
                  <a href={`${config.BASE_URL}/register/file/${userInfo.id}/passport`} target="_blank" rel="noopener noreferrer">
                    View Passport
                  </a>
                )}
              </div>
            </>
          )}

          {userInfo.vehicleType?.toLowerCase() === 'ebike' && (
            <div>
              <label>Government Photo ID</label><br />
              {userInfo.id && (
                <a href={`${config.BASE_URL}/register/file/${userInfo.id}/photoid`} target="_blank" rel="noopener noreferrer">
                  View Government ID
                </a>
              )}
            </div>
          )}

          {/* Common for all vehicle types */}
          <div>
            <label>Bank File</label><br />
            {userInfo.id && (
              <a href={`${config.BASE_URL}/register/file/${userInfo.id}/bankpdf`} target="_blank" rel="noopener noreferrer">
                View Bank Statement
              </a>
            )}
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
