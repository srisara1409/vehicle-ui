import { React, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link, useNavigate } from 'react-router-dom';
import './registerPage.css';
import countryList from 'react-select-country-list';
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
    licenseCountry: '',
    licensePhoto: null,
    passportCopy: null,
    photoIdCopy: null,
    signature: null,
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    checkBox: false,
    financialInstName: '',
    accountName: '',
    bsbNumber: '',
    accountNumber: '',
    emergencyContactName: '',
    emergencyContactNumber: ''
  };
  const sigCanvas = useRef(null);
  const [group, setGroup] = useState(initialFormState);
  const [option, setOption] = useState("");
  const [errors, setErrors] = useState({});
  const [signatureError, setSignatureError] = useState('');
  const countries = countryList().getData(); // Returns array of { label, value }

  const navigate = useNavigate();
  const australianStates = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT"];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "licenseState") {
      if (australianStates.includes(value)) {
        setGroup((prev) => ({
          ...prev,
          licenseState: value,
          licenseCountry: "Australia"
        }));
      } else if (value === "Overseas") {
        setGroup((prev) => ({
          ...prev,
          licenseState: value,
          licenseCountry: ""
        }));
      } else {
        setGroup((prev) => ({ ...prev, licenseState: value }));
      }
    }

    if (name === "licenseCountry") {
      setGroup((prev) => ({ ...prev, licenseCountry: value }));
    }


    if (type === "checkbox") {
      setGroup({ ...group, [name]: checked });
    } else if (type === "file") {
      const file = files[0];
      if (file && file.size > 100 * 1024 * 1024) {
        alert("File size should not exceed 100MB.");
        return;
      }
      setGroup({ ...group, [name]: file });
    } else {
      // Numeric-only fields
      if ((name === "postalCode" || name === "bsbNumber" || name === "accountNumber") && !/^\d*$/.test(value)) {
        return; // Skip update if input is not all digits
      }
      // Alphabet-only field
      if ((name === "licenseState" || name === "city" || name === "state" || name === "country" || name === "financialInstName" || name === "accountName") && !/^[a-zA-Z\s]*$/.test(value)) {
        return;
      }
      setGroup({ ...group, [name]: value });
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobilePattern = /^((\+61\d{9})|(\+64\d{8,9})|(04\d{8}))$/;
    const bsbPattern = /^\d{6}$/;
    const accountPattern = /^\d{6,10}$/;

    if (!group.firstName) newErrors.firstName = 'First name is required';
    if (!group.lastName) newErrors.lastName = 'Last name is required';
    if (!group.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
    if (!mobilePattern.test(group.mobileNumber)) { newErrors.mobileNumber = 'Enter a valid AU/NZ mobile number'; }
    if (!emailPattern.test(group.email)) newErrors.email = 'Enter a valid email ID';
    if (!option) newErrors.option = 'Please select a vehicle type';
    if (option === 'car' || option === 'motorbike') {
      if (!group.licenseNumber) newErrors.licenseNumber = 'Enter valid License Number';
      if (!group.licenseState) newErrors.licenseState = 'Enter License Obtained State';
      if (!group.licenseCountry) newErrors.licenseCountry = 'Enter License Obtained Country';
      if (!group.licensePhoto) newErrors.licensePhoto = 'Enter License Photo';
      if (!group.passportCopy) newErrors.passportCopy = 'Enter valid Passport Copy';
    }
    if (option === 'ebike' && !group.photoIdCopy) newErrors.photoIdCopy = 'Enter valid PhotoID Copy';
    if (!group.addressLine1) newErrors.addressLine1 = 'Enter Address Line1';
    if (!group.city) newErrors.city = 'Enter valid City';
    if (!group.postalCode) newErrors.postalCode = 'Enter valid Postal Code';
    if (!group.state) newErrors.state = 'Enter valid State';
    if (!group.country) newErrors.country = 'Enter valid Country';
    if (!group.financialInstName) newErrors.financialInstName = 'Enter valid Bank Name';
    if (!group.accountName) newErrors.accountName = 'Enter valid Account Name';
    if (!bsbPattern.test(group.bsbNumber)) newErrors.bsbNumber = 'BSB must be 6 digits';
    if (!accountPattern.test(group.accountNumber)) newErrors.accountNumber = '6–10 digit account number';
    if (!group.emergencyContactName) newErrors.emergencyContactName = 'Enter Emergency Contact Name';
    if (!group.emergencyContactNumber) newErrors.emergencyContactNumber = 'Enter Emergency Contact Number';
    if (!group.checkBox) newErrors.checkBox = 'You must agree to Terms';

    const isSignatureEmpty = sigCanvas.current.isEmpty();
    setSignatureError(isSignatureEmpty ? 'Signature is required' : '');

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

        <FormGroup className="form-row">
          <label className="form__label" for="firstName">First Name<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.firstName ? 'input-error' : ''}`} type="text" name="firstName" id="firstName" value={group.firstName} onChange={handleChange} placeholder="Enter your first name" />
            {errors.firstName && <div className="tooltip-message">{errors.firstName}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" for="lastName">Last Name<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.lastName ? 'input-error' : ''}`} type="text" name="lastName" id="lastName" value={group.lastName} onChange={handleChange} placeholder="Enter your last name" />
            {errors.lastName && <div className="tooltip-message">{errors.lastName}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" for="dateOfBirth">Date of Birth<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <DatePicker
              className={`form__input ${errors.dateOfBirth ? 'input-error' : ''}`}
              selected={
                group.dateOfBirth
                  ? (() => {
                    const [yyyy, mm, dd] = group.dateOfBirth.split("-");
                    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), 12); // Set to noon local time
                  })()
                  : null
              }

              onChange={(date) => {
                if (!date) return handleChange({ target: { name: 'dateOfBirth', value: '' } });

                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const formattedDate = `${yyyy}-${mm}-${dd}`; // Local-safe format

                handleChange({
                  target: {
                    name: 'dateOfBirth',
                    value: formattedDate
                  }
                });
              }}

              onChangeRaw={(e) => {
                const input = e.target.value;
                const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
                if (regex.test(input)) {
                  const [, dd, mm, yyyy] = input.match(regex);
                  const formatted = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
                  formatted.setHours(12, 0, 0, 0);

                  if (!isNaN(formatted)) {
                    const localDate = formatted.toISOString().split('T')[0];
                    handleChange({
                      target: {
                        name: 'dateOfBirth',
                        value: localDate
                      }
                    });
                  }
                }
              }}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select or type your date of birth (dd-MM-yyyy)"
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              id="dateOfBirth"
            />
            {errors.dateOfBirth && <div className="tooltip-message">{errors.dateOfBirth}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" for="mobileNumber">Mobile Number<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.mobileNumber ? 'input-error' : ''}`} type="text" name="mobileNumber" id="mobileNumber" value={group.mobileNumber} maxLength="12" onChange={handleChange} placeholder="Enter your mobile number" />
            {errors.mobileNumber && <div className="tooltip-message">{errors.mobileNumber}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" for="email">Email ID<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.email ? 'input-error' : ''}`} type="text" name="email" id="email" value={group.email} onChange={handleChange} placeholder="xyz@company.com" />
            {errors.email && <div className="tooltip-message">{errors.email}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label">Vehicle Type<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <select
              value={option}
              onChange={(e) => setOption(e.target.value)}
              className={`form__input ${errors.option ? 'input-error' : ''}`}>
              <option value="">-- Choose --</option>
              <option value="car">Car</option>
              <option value="motorbike">Motor-Bike</option>
              <option value="ebike">E-Bike</option>
            </select>
            {errors.option && <div className="tooltip-message">{errors.option}</div>}
          </div>
        </FormGroup>

        {(option === "car" || option === "motorbike") && (
          <div className="mt-4">
            <FormGroup className="form-row">
              <label className="form__label" for="licenseNumber">License Number<span style={{ color: 'red' }}>*</span></label>
              <div className="tooltip-container" style={{ flex: 1 }}>
                <input
                  type="text"
                  className={`form__input ${errors.licenseNumber ? 'input-error' : ''}`}
                  name="licenseNumber"
                  id="licenseNumber"
                  maxLength="10"
                  value={group.licenseNumber || ''}
                  onChange={handleChange}
                  placeholder="Enter your license number"
                />
                {errors.licenseNumber && <div className="tooltip-message">{errors.licenseNumber}</div>}
              </div>
            </FormGroup>

            <FormGroup className="form-row">
              <label className="form__label" for="licenseState">License State<span style={{ color: 'red' }}>*</span></label>
              <div className="tooltip-container" style={{ flex: 1 }}>
                <select
                  className={`form__input ${errors.licenseState ? 'input-error' : ''}`}
                  name="licenseState"
                  id="licenseState"
                  value={group.licenseState || ''}
                  onChange={handleChange}
                >
                  <option value="">-- Select State --</option>
                  <option value="NSW">New South Wales (NSW)</option>
                  <option value="VIC">Victoria (VIC)</option>
                  <option value="QLD">Queensland (QLD)</option>
                  <option value="WA">Western Australia (WA)</option>
                  <option value="SA">South Australia (SA)</option>
                  <option value="TAS">Tasmania (TAS)</option>
                  <option value="ACT">Australian Capital Territory (ACT)</option>
                  <option value="Overseas">Overseas</option>
                </select>
                {errors.licenseState && <div className="tooltip-message">{errors.licenseState}</div>}
              </div>
            </FormGroup>

            <FormGroup className="form-row">
              <label className="form__label" htmlFor="licenseCountry">License Country<span style={{ color: 'red' }}>*</span></label>
              <div className="tooltip-container" style={{ flex: 1 }}>
                <select
                  className={`form__input fixed-width-dropdown ${errors.licenseCountry ? 'input-error' : ''}`}
                  name="licenseCountry"
                  id="licenseCountry"
                  value={group.licenseCountry}
                  onChange={handleChange}
                >
                  <option value="">-- Select Country --</option>

                  {group.licenseState === "Overseas"
                    ? countries
                      .filter((country) => country.label !== "Australia")
                      .map((country) => (
                        <option key={country.value} value={country.label}>
                          {country.label}
                        </option>
                      ))
                    : <option value="Australia">Australia</option>
                  }
                </select>


                {errors.licenseCountry && <div className="tooltip-message">{errors.licenseCountry}</div>}
              </div>
            </FormGroup>

            <FormGroup className="form-row">
              <label className="form__label" for="licensePhoto">Upload License<span style={{ color: 'red' }}>*</span></label>
              <div className="tooltip-container" style={{ flex: 1 }}>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    className={`form__input file-upload ${errors.licensePhoto ? 'input-error' : ''}`}
                    name="licensePhoto"
                    id="licensePhoto"
                    onChange={handleChange}
                    accept="image/*,application/pdf"
                  />
                </div>
                {errors.licensePhoto && <div className="tooltip-message">{errors.licensePhoto}</div>}
              </div>
            </FormGroup>

            <FormGroup className="form-row">
              <label className="form__label" for="passportCopy">Upload Passport<span style={{ color: 'red' }}>*</span></label>
              <div className="tooltip-container" style={{ flex: 1 }}>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    className={`form__input file-upload ${errors.passportCopy ? 'input-error' : ''}`}
                    name="passportCopy"
                    id="passportCopy"
                    onChange={handleChange}
                    accept="image/*,application/pdf"
                  />
                </div>
                {errors.passportCopy && <div className="tooltip-message">{errors.passportCopy}</div>}
              </div>
            </FormGroup>
          </div>
        )}

        {option === "ebike" && (
          <div className="mt-4">

            <FormGroup className="form-row">
              <label className="form__label" for="photoIdCopy">Upload Any Government Issued Photo ID<span style={{ color: 'red' }}>*</span></label>
              <div className="tooltip-container" style={{ flex: 1 }}>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    className={`form__input file-upload ${errors.photoIdCopy ? 'input-error' : ''}`}
                    name="photoIdCopy"
                    id="photoIdCopy"
                    onChange={handleChange}
                    accept="image/*,application/pdf"
                  />
                </div>
                {errors.photoIdCopy && <div className="tooltip-message">{errors.photoIdCopy}</div>}
              </div>
            </FormGroup>
          </div>
        )}

        <FormGroup className="form-row">
          <label className="form__label" for="addressLine1">Address Line 1<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.addressLine1 ? 'input-error' : ''}`} type="text" name="addressLine1" id="addressLine1" value={group.addressLine1} onChange={handleChange} placeholder="Enter your street address 1" />
            {errors.addressLine1 && <div className="tooltip-message">{errors.addressLine1}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="addressLine2">Address Line 2</label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className="form__input" type="text" name="addressLine2" id="addressLine2"
              value={group.addressLine2 || ''} onChange={handleChange} placeholder="Enter your street address 2"
            />
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" for="city">City<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.city ? 'input-error' : ''}`} type="text" name="city" id="city" value={group.city} onChange={handleChange} placeholder="Enter city" />
            {errors.city && <div className="tooltip-message">{errors.city}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" for="state">State<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.state ? 'input-error' : ''}`} type="text" name="state" id="state" value={group.state} onChange={handleChange} placeholder="Enter state" />
            {errors.state && <div className="tooltip-message">{errors.state}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" for="postalCode">Postal Code<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.postalCode ? 'input-error' : ''}`} type="text" name="postalCode" id="postalCode" value={group.postalCode} maxLength="4" onChange={handleChange} placeholder="Enter postal code" />
            {errors.postalCode && <div className="tooltip-message">{errors.postalCode}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" for="country">Country<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.country ? 'input-error' : ''}`} type="text" name="country" id="country" value={group.country || ''} onChange={handleChange} placeholder="Enter your country" />
            {errors.country && <div className="tooltip-message">{errors.country}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" for="financialInstName">Financial Institution Name<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.financialInstName ? 'input-error' : ''}`} type="text" name="financialInstName" id="financialInstName" value={group.financialInstName || ''} onChange={handleChange} placeholder="Enter financial institution name" />
            {errors.financialInstName && <div className="tooltip-message">{errors.financialInstName}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" for="accountName">Name as per Bank<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.accountName ? 'input-error' : ''}`} type="text" name="accountName" id="accountName" value={group.accountName || ''} onChange={handleChange} placeholder="Enter account holder name" />
            {errors.accountName && <div className="tooltip-message">{errors.accountName}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" for="bsbNumber">BSB No.<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.bsbNumber ? 'input-error' : ''}`} type="text" name="bsbNumber" id="bsbNumber" value={group.bsbNumber || ''} maxLength="6" onChange={handleChange} placeholder="Enter 6-digit BSB" />
            {errors.bsbNumber && <div className="tooltip-message">{errors.bsbNumber}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" for="accountNumber">Account Number<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.accountNumber ? 'input-error' : ''}`} type="text" name="accountNumber" id="accountNumber" value={group.accountNumber || ''} maxLength="10" onChange={handleChange} placeholder="Enter 6–10 digit account number" />
            {errors.accountNumber && <div className="tooltip-message">{errors.accountNumber}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" for="emergencyContactName">Emergency Contact Name<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.emergencyContactName ? 'input-error' : ''}`} type="text" name="emergencyContactName" id="emergencyContactName" value={group.emergencyContactName || ''} onChange={handleChange} placeholder="Enter emergency contact name" />
            {errors.emergencyContactName && <div className="tooltip-message">{errors.emergencyContactName}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" for="emergencyContactNumber">Emergency Contact No.<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${errors.emergencyContactNumber ? 'input-error' : ''}`} type="text" name="emergencyContactNumber" id="emergencyContactNumber" value={group.emergencyContactNumber || ''} maxLength="12" onChange={handleChange} placeholder="Enter emergency contact number" />
            {errors.emergencyContactNumber && <div className="tooltip-message">{errors.emergencyContactNumber}</div>}
          </div>
        </FormGroup>

        <FormGroup>
          <label className="form__label">Signature<span style={{ color: 'red' }}>*</span></label>
          <div className="signature-container">
            <SignatureCanvas
              ref={sigCanvas}
              backgroundColor="#fff"
              penColor="black"
              canvasProps={{ width: 400, height: 100, className: "sigCanvas" }}
            />
            <div className="clear-btn-wrapper">
              <button type="button" className="clear-btn-styled" onClick={() => sigCanvas.current.clear()}>
                Clear
              </button>
              {signatureError && <div className="tooltip-message" style={{ display: 'block', marginTop: '5px' }}>{signatureError}</div>}
            </div>
          </div>
        </FormGroup>

        <FormGroup check>
          <div className="tooltip-container">
            <input className="terms-checkbox" type="checkbox" id="test1" name="checkBox" onChange={handleChange} checked={group.checkBox} />
            <label for="test1">
              I agree to these <a href="https://www.naukri.com/termsconditions#g1" target="_blank" rel="noreferrer">Terms and Conditions</a>
            </label>
            {errors.checkBox && <div className="tooltip-message">{errors.checkBox}</div>}
          </div>
        </FormGroup>

        <FormGroup>
          <center>
            <Button className="register-btn" type="submit">Register</Button>{' '}
            <Button className="cancel-btn" tag={Link} to="/homepage">Cancel</Button>
          </center>
        </FormGroup>

      </Form>
    </div >
  );

};
export default Register;