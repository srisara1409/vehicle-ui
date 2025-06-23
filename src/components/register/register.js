import { React, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Link, useNavigate } from 'react-router-dom';
import './registerPage.css';
import { Button, FormGroup, Form } from "reactstrap";

const Register = () => {
  const initialFormState = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    mobileNumber: '',
    email: '',
    licenseNumber: '',
    licenseState: '',
    licensePhoto: null,
    passportCopy: null,
    photoIdCopy: null,
    signature: null,
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    checkBox: false,
    financialInstName: '',
    accountName: '',
    bsbNumber: '',
    accountNumber: '',
    emergencyName: '',
    emergencyNumber: ''
  };
  const sigCanvas = useRef(null);
  const [group, setGroup] = useState(initialFormState);
  const [option, setOption] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") setGroup({ ...group, [name]: checked });
    else if (type === "file") setGroup({ ...group, [name]: files[0] });
    else setGroup({ ...group, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobilePattern = /^(\+61|\+64)\d{9,10}$/;
    const bsbPattern = /^\d{6}$/;
    const accountPattern = /^\d{6,10}$/;

    if (!group.firstName) newErrors.firstName = 'First name is required';
    if (!group.lastName) newErrors.lastName = 'Last name is required';
    if (!group.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
    if (!group.mobileNumber.match(mobilePattern)) newErrors.mobileNumber = 'Enter valid AU/NZ number';
    if (!emailPattern.test(group.email)) newErrors.email = 'Enter a valid email';
    if (!option) newErrors.option = 'Please select a vehicle type';
    if (option === 'car' || option === 'motorbike') {
      if (!group.licenseNumber) newErrors.licenseNumber = 'Required';
      if (!group.licenseState) newErrors.licenseState = 'Required';
      if (!group.licensePhoto) newErrors.licensePhoto = 'Required';
      if (!group.passportCopy) newErrors.passportCopy = 'Required';
    }
    if (option === 'ebike' && !group.photoIdCopy) newErrors.photoIdCopy = 'Required';
    if (!group.addressLine) newErrors.addressLine = 'Required';
    if (!group.city) newErrors.city = 'Required';
    if (!group.postalCode) newErrors.postalCode = 'Required';
    if (!group.state) newErrors.state = 'Required';
    if (!group.country) newErrors.country = 'Required';
    if (!group.accountName) newErrors.accountName = 'Required';
    if (!bsbPattern.test(group.bsbNumber)) newErrors.bsbNumber = 'BSB must be 6 digits';
    if (!accountPattern.test(group.accountNumber)) newErrors.accountNumber = '6–10 digit account number';
    if (!group.emergencyName) newErrors.emergencyName = 'Required';
    if (!group.emergencyNumber) newErrors.emergencyNumber = 'Required';
    if (!group.checkBox) newErrors.checkBox = 'You must agree to Terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  //  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  //const signature = sigCanvas.current.tr getTrimmedCanvas().toDataURL('image/png');
  //  const signature = sigCanvas.current
  //       ?.getTrimmedCanvas()
  //       ?.toDataURL('image/png');
  //const fullData = { ...group, signature };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {

       const signature = sigCanvas.current 
       ?.getCanvas()
      ?.toDataURL('image/png');
   
      

    
      const fullData = { ...group, vehicleType: option, signature };
        const formData = new FormData();
      formData.append('formData', new Blob([JSON.stringify(fullData)], { type: "application/json" }));

     

    // formData.append(
    //   'formData',
    //   new Blob([JSON.stringify(fullData)], { type: "application/json" })
    // );

      if (group.licensePhoto) formData.append('licensePhoto', group.licensePhoto);
      if (group.passportCopy) formData.append('passportCopy', group.passportCopy);
      if (group.photoIdCopy) formData.append('photoIdCopy', group.photoIdCopy);

      await axios.post('http://localhost:8080/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Vehicle registered. Awaiting admin approval.');
      setGroup(initialFormState);
      setOption("");
      sigCanvas.current.clear(); 
      navigate('/homepage');
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  //const clear = () => sigCanvas.current.clear();

  return (
    <div>
      <Form className="form" onSubmit={handleSubmit}>
        <center><p>Register your Details</p></center>

        <FormGroup>
          <label className="form__label" for="firstName">First Name</label>
          <input className="form__input" type="text" name="firstName" id="firstName" value={group.firstName || ''} onChange={handleChange} placeholder="first name" />
          {errors.firstName && <p className="text-danger">{errors.firstName}</p>}
        </FormGroup>

        <FormGroup>
          <label className="form__label" for="lastName">Last Name</label>
          <input className="form__input" type="text" name="lastName" id="lastName" value={group.lastName || ''} onChange={handleChange} placeholder="last name" />
          {errors.lastName && <p className="text-danger">{errors.lastName}</p>}
        </FormGroup>

        <FormGroup>
          <label className="form__label" for="dateOfBirth">Date of Birth</label>
          <DatePicker
            className="form__input"
            selected={group.dateOfBirth ? new Date(group.dateOfBirth) : null}
            onChange={(date) =>
              handleChange({
                target: {
                  name: 'dateOfBirth',
                  value: date.toISOString().split('T')[0],
                },
              })
            }
            dateFormat="yyyy-MM-dd"
            maxDate={new Date()}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            placeholderText="Select your date of birth"
            id="dateOfBirth"
          />
        </FormGroup>

        <FormGroup>
          <label className="form__label" for="mobileNumber">Mobile Number </label>
          <input className="form__input" type="text" name="mobileNumber" id="mobileNumber" value={group.mobileNumber || ''} onChange={handleChange} placeholder="" />
          {errors.mobileNumber && (<div style={{ color: 'rgb(220 53 69)', fontSize: '0.9rem' }}>{errors.mobileNumber}</div>)}
        </FormGroup>

        <FormGroup>
          <label className="form__label" for="email">EmailID</label>
          <input className="form__input" type="text" name="email" id="email" value={group.email || ''} onChange={handleChange} placeholder="xyz@company.com" />
          {errors.email && <p className="text-danger">{errors.email}</p>}
        </FormGroup>

        <FormGroup>
          {/* <div className="form__label"> */}
          <label className="form__label">Vehicle Type</label>
          <select
            value={option}
            onChange={(e) => setOption(e.target.value)}
            className="form__input">
            <option value="">-- Choose --</option>
            <option value="car">Car</option>
            <option value="motorbike">Motor-Bike</option>
            <option value="ebike">E-Bike</option>
          </select>

          {(option === "car" || option === "motorbike") && (
            <div className="mt-4">
              <FormGroup>
                <label className="form__label">License Number *</label>
                <input type="text" className="form__input" name="licenseNumber" id="licenseNumber" value={group.licenseNumber || ''} onChange={handleChange} placeholder="Enter your license number" />
              </FormGroup>

              <FormGroup>
                <label className="form__label">License Country/State *</label>
                <input type="text" className="form__input" name="licenseState" id="licenseState" value={group.licenseState || ''} onChange={handleChange} placeholder="e.g., NSW, VIC, WA..." />
              </FormGroup>

              <FormGroup>
                <label className="form__label">Upload License PhotoCopy *</label>
                <input type="file" className="form__input" name="licensePhoto" id="licensePhoto" onChange={handleChange} accept="image/*,application/pdf" />
              </FormGroup>

              <FormGroup>
                <label className="form__label">Upload Passport *</label>
                <input type="file" className="form__input" name="passportCopy" id="passportCopy" onChange={handleChange} accept="image/*,application/pdf" />
              </FormGroup>
            </div>
          )}

          {option === "ebike" && (
            <div className="mt-4">
              <FormGroup>
                <label className="form__label" for="photoIdCopy">Upload Any Government Issued Photo ID *</label>
                <input type="file" className="form__input" name="photoIdCopy" id="photoIdCopy" onChange={handleChange} accept="image/*,application/pdf" placeholder="Attach your ID" />
              </FormGroup>
            </div>
          )}
          {/* </div> */}
        </FormGroup>

        <FormGroup>
          <label className="form__label" for="addressLine">Address Line 1</label>
          <input className="form__input" type="text" name="addressLine" id="addressLine" value={group.addressLine || ''} onChange={handleChange} placeholder="" />
        </FormGroup>

        <FormGroup>
          <label className="form__label" for="addressLine">Address Line 2</label>
          <input className="form__input" type="text" name="addressLine" id="addressLine" value={group.addressLine || ''} onChange={handleChange} placeholder="" />
        </FormGroup>

        <FormGroup>
          <label className="form__label" for="city">City</label>
          <input className="form__input" type="text" name="city" id="city" value={group.city || ''} onChange={handleChange} placeholder="" />
        </FormGroup>

        <FormGroup>
          <label className="form__label" for="postalCode">Postal Code</label>
          <input className="form__input" type="text" name="postalCode" id="postalCode" value={group.postalCode || ''} onChange={handleChange} placeholder="" />
        </FormGroup>

        <FormGroup>
          <label className="form__label" for="state">State</label>
          <input className="form__input" type="text" name="state" id="state" value={group.state || ''} onChange={handleChange} placeholder="" />
        </FormGroup>

        <FormGroup>
          <label className="form__label" for="country">Country</label>
          <input className="form__input" name="country" type="text" id="country" value={group.country || ''} onChange={handleChange} placeholder="" />
        </FormGroup>
        <FormGroup>
          <label className="form__label" for="financialInstName">Financial Institution Name</label>
          <input className="form__input" name="financialInstName" type="text" id="financialInstName" value={group.financialInstName || ''} onChange={handleChange} placeholder="" />
        </FormGroup>
        <FormGroup>
          <label className="form__label" for="accountName">Name as per Bank</label>
          <input className="form__input" name="accountName" type="text" id="accountName" value={group.accountName || ''} onChange={handleChange} placeholder="" />
        </FormGroup>

        <FormGroup>
          <label className="form__label" for="bsbNumber">BSB No.</label>
          <input className="form__input" name="bsbNumber" type="text" id="bsbNumber" value={group.bsbNumber || ''} onChange={handleChange} placeholder="" />
          {errors.bsbNumber && <div className="text-danger">{errors.bsbNumber}</div>}
        </FormGroup>

        <FormGroup>
          <label className="form__label" for="accountNumber">Account Number</label>
          <input className="form__input" name="accountNumber" type="text" id="accountNumber" value={group.accountNumber || ''} onChange={handleChange} placeholder="" />
          {errors.accountNumber && <div className="text-danger">{errors.accountNumber}</div>}
        </FormGroup>

        <FormGroup>
          <label className="form__label" for="emergencyName">Emergency Contact Name *</label>
          <input className="form__input" name="emergencyName" type="text" id="emergencyName" value={group.emergencyName || ''} onChange={handleChange} placeholder="" />
          {errors.emergencyName && <p className="text-danger">{errors.emergencyName}</p>}
        </FormGroup>

        <FormGroup>
          <label className="form__label" for="emergencyNumber">Emergency Contact No. *</label>
          <input className="form__input" name="emergencyNumber" type="text" id="emergencyNumber" value={group.emergencyNumber || ''} onChange={handleChange} placeholder="" />
          {errors.emergencyNumber && <p className="text-danger">{errors.emergencyNumber}</p>}
        </FormGroup>

        <FormGroup>
  <label className="form__label">Signature</label>
  <div
    style={{
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "5px",
      background: "#f9f9f9",
      width: "100%",
      maxWidth: "400px",
    }}
  >
    <SignatureCanvas
      ref={sigCanvas}
      backgroundColor="#fff"
      penColor="black"
      canvasProps={{ width: 400, height: 100, className: "sigCanvas" }}
    />
    <div style={{ marginTop: "5px", textAlign: "right" }}>
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={() => sigCanvas.current.clear()}
      >
        Clear
      </button>
    </div>
  </div>
</FormGroup>

        <FormGroup check>
          <input type="checkbox" id="test1" name="checkBox" onChange={handleChange} checked={group.checkBox} />
          <label htmlFor="test1"> I agree to these <a href="https://www.naukri.com/termsconditions#g1" target="_blank" rel="noreferrer">Terms and Conditions</a></label>
        </FormGroup>

        <FormGroup>
          <center>
            <Button className="btn" type="submit">Register</Button>{' '}
            <Button className="btn" tag={Link} to="/homepage">Cancel</Button>
          </center>
        </FormGroup>

      </Form>
    </div>
  );

};
export default Register;