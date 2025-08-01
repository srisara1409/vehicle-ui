import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import SignatureCanvas from 'react-signature-canvas';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link, useNavigate } from 'react-router-dom';
import './registerPage.css';
import countryList from 'react-select-country-list';
import { Button, FormGroup, Form } from "reactstrap";
import config from '../../config';
import axios from 'axios';

// added by Ragu from here
// Helper: Compress image to JPEG under 10MB with adjusted dimensions
export const compressImage = (file, maxSizeMB = 5, maxWidth = 1024) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(file); // Skip compression for non-images
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let scale = Math.min(maxWidth / img.width, 1); // prevent upscale
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size / (1024 * 1024) <= maxSizeMB) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // fallback
            }
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = () => reject("Image loading failed");
      img.src = event.target.result;
    };
    reader.onerror = () => reject("File reading failed");
    reader.readAsDataURL(file);
  });
};
// added by Ragu till here

const Register = () => {
  const initialFormState = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    mobileNumber: '',
    email: '',
    vehicleType: '',
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
    teamsAndConditions: false,
    bankName: '',
    accountName: '',
    bsbNumber: '',
    accountNumber: '',
    emergencyContactName: '',
    emergencyContactNumber: ''
  };

  const sigCanvas = useRef(null);
  useEffect(() => {
    const canvasRef = sigCanvas.current;
    if (!canvasRef) return;

    const canvas = canvasRef.getCanvas();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
  }, []);

  const [group, setGroup] = useState(initialFormState);
  const [option, setOption] = useState("");
  const [errors, setErrors] = useState({});
  const [signatureError, setSignatureError] = useState('');
  const countries = countryList().getData();
  const navigate = useNavigate();
  const australianStates = ["ACT", "NSW", "QLD", "SA", "TAS", "VIC", "WA"];
  const [previews, setPreviews] = useState({ licensePhoto: null, passportCopy: null });
  const [submitted, setSubmitted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "licenseState") {
      if (australianStates.includes(value)) {
        setGroup((prev) => ({ ...prev, licenseState: value, licenseCountry: "Australia" }));
      } else if (value === "Overseas") {
        setGroup((prev) => ({ ...prev, licenseState: value, licenseCountry: "" }));
      } else {
        setGroup((prev) => ({ ...prev, licenseState: value }));
      }
      return;
    }

    if (name === "licenseCountry") {
      setGroup((prev) => ({ ...prev, licenseCountry: value }));
      return;
    }

    if (type === "checkbox") {
      setGroup((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // ✅ Corrected File Upload Logic
    if (type === "file") {
      const file = files[0];
      if (!file) return;

      const isPDF = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");
      const isAccepted = isPDF || isImage;

      if (!isAccepted) {
        alert("Only image files (JPEG, PNG) and PDFs are allowed.");
        return;
      }

      const handleCompressed = (processedFile) => {
        setGroup((prev) => ({ ...prev, [name]: processedFile }));
        setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(processedFile) }));
        if (submitted && errors[name]) {
          const newErrors = { ...errors };
          delete newErrors[name];
          setErrors(newErrors);
        }
      };

      if (file.size <= 5 * 1024 * 1024) {
        handleCompressed(file);
      } else if (isImage) {
        compressImage(file, 5, 1024).then((compressed) => {
          if (compressed.size <= 5 * 1024 * 1024) {
            handleCompressed(compressed);
          } else {
            alert("Compressed image is still too large. Please choose a smaller one.");
          }
        }).catch(() => {
          alert("Image compression failed. Please try a different image.");
        });
      } else {
        alert("PDF file is too large. Please upload a file smaller than 5MB.");
      }
      return;
    }

    // ✅ Text/numeric field validation
    if (
      (["postalCode", "bsbNumber", "accountNumber"].includes(name) && !/^\d*$/.test(value)) ||
      (["licenseState", "city", "state", "country", "bankName", "accountName"].includes(name) && !/^[a-zA-Z\s]*$/.test(value))
    ) {
      return;
    }

    // ✅ Default field update
    setGroup((prev) => {
      const updated = { ...prev, [name]: value };
      if (submitted && errors[name]) {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
      return updated;
    });
  };


  const handleBlur = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };
    switch (name) {
      case "firstName":
      case "lastName":
      case "addressLine1":
      case "city":
      case "state":
      case "country":
      case "bankName":
      case "accountName":
      case "emergencyContactName":
      case "emergencyContactNumber":
        if (!value.trim()) newErrors[name] = "This field is required";
        else delete newErrors[name];
        break;
      case "mobileNumber":
        if (!/^((\+61\d{9})|(\+64\d{8,9})|(04\d{8}))$/.test(value)) newErrors[name] = "Enter a valid AU/NZ mobile number";
        else delete newErrors[name];
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors[name] = "Enter a valid email ID";
        else delete newErrors[name];
        break;
      case "bsbNumber":
        if (!/^\d{6}$/.test(value)) newErrors[name] = "BSB must be 6 digits";
        else delete newErrors[name];
        break;
      case "accountNumber":
        if (!/^\d{6,12}$/.test(value)) newErrors[name] = "6–12 digit account number";
        else delete newErrors[name];
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobilePattern = /^((\+61\d{9})|(\+64\d{8,9})|(04\d{8}))$/;
    const bsbPattern = /^\d{6}$/;
    const accountPattern = /^\d{6,12}$/;

    if (!group.firstName) newErrors.firstName = 'First name is required';
    if (!group.lastName) newErrors.lastName = 'Last name is required';
    if (!group.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
    if (!mobilePattern.test(group.mobileNumber)) newErrors.mobileNumber = 'Enter a valid AU/NZ mobile number';
    if (!emailPattern.test(group.email)) newErrors.email = 'Enter a valid email ID';
    if (!option) newErrors.option = 'Please select a vehicle type';
    if (option === 'car' || option === 'motorbike') {
      if (!group.licenseNumber) newErrors.licenseNumber = 'Enter valid License Number';
      if (!group.licenseState) newErrors.licenseState = 'Enter License Obtained State';
      if (!group.licenseCountry) newErrors.licenseCountry = 'Enter License Obtained Country';
      if (!group.licensePhoto) newErrors.licensePhoto = 'Attach a file less than 5MB';
      if (!group.passportCopy) newErrors.passportCopy = 'Attach a file less than 5MB';
    }
    if (option === 'ebike' && !group.photoIdCopy) newErrors.photoIdCopy = 'Attach a file less than 5MB';
    if (!group.addressLine1) newErrors.addressLine1 = 'Enter Address Line1';
    if (!group.city) newErrors.city = 'Enter valid City';
    if (!group.postalCode) newErrors.postalCode = 'Enter valid Postal Code';
    if (!group.state) newErrors.state = 'Enter valid State';
    if (!group.country) newErrors.country = 'Enter valid Country';
    if (!group.bankName) newErrors.bankName = 'Enter valid Bank Name';
    if (!group.accountName) newErrors.accountName = 'Enter valid Account Name';
    if (!bsbPattern.test(group.bsbNumber)) newErrors.bsbNumber = 'BSB must be 6 digits';
    if (!accountPattern.test(group.accountNumber)) newErrors.accountNumber = '6–12 digit account number';
    if (!group.emergencyContactName) newErrors.emergencyContactName = 'Enter Emergency Contact Name';
    if (!group.emergencyContactNumber) newErrors.emergencyContactNumber = 'Enter Emergency Contact Number';
    if (!group.teamsAndConditions) newErrors.teamsAndConditions = 'You must agree to Terms';
    const isSignatureEmpty = sigCanvas.current.isEmpty();
    setSignatureError(isSignatureEmpty ? 'Signature is required' : '');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !isSignatureEmpty;
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    // prevent duplicate submits
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitted(true);

    if (!validate()) {
      const firstErrorField = document.querySelector('.input-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setIsSubmitting(false);    // ← reset if validation fails
      return;
    }

    if (sigCanvas.current.isEmpty()) {
      document.querySelector('.sigCanvas').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    try {

      const getSignatureBlob = (dataURL) => {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: mimeString });
      };

      const signatureCanvas = sigCanvas.current?.getCanvas()?.toDataURL('image/png');
      const signatureBlob = getSignatureBlob(signatureCanvas);
      const signatureFile = new File([signatureBlob], 'signature.png', { type: 'image/png' });
      console.log("Signature size (MB):", (signatureFile.size / 1024 / 1024).toFixed(2));

      // ✅ Get trimmed canvas and convert it to Blob
      // const blob = await new Promise((resolve) =>
      //   signatureCanvas.toBlob(resolve, 'image/png')
      // );

      // ✅ Create a File from the Blob
      // const signatureFile = new File([blob], "signature.png", {
      //   type: "image/png",
      //   lastModified: Date.now(),
      // });
      // Signature handling (same as before)
      // const canvas = sigCanvas.current?.getCanvas();
      // let signature = "";

      // if (canvas) {
      //   const blob = await new Promise((resolve) =>
      //     canvas.toBlob(resolve, "image/png", 0.8)
      //   );
      //   const file = new File([blob], "signature.png", {
      //     type: "image/png",
      //     lastModified: Date.now(),
      //   });

      //   if (file.size > 10 * 1024 * 1024) {
      //     alert("Signature image is too large. Please sign again with a smaller one.");
      //     return;
      //   }

      //   signature = await new Promise((resolve) => {
      //     const reader = new FileReader();
      //     reader.onloadend = () => resolve(reader.result);
      //     reader.readAsDataURL(file);
      //   });
      // }

      const fullData = { ...group, vehicleType: option };
      const formData = new FormData();
      //formData.append('formData', new Blob([JSON.stringify(fullData)], { type: "application/json" }));
      formData.append('formData', JSON.stringify(fullData));
      if (group.licensePhoto) formData.append('licensePhoto', group.licensePhoto);
      if (group.passportCopy) formData.append('passportCopy', group.passportCopy);
      if (group.photoIdCopy) formData.append('photoIdCopy', group.photoIdCopy);

      formData.append('signatureFile', signatureFile);

      // ✅ Calculate and log individual file sizes added by ragu 19th jun
      const fileSizes = {
        licensePhoto: group.licensePhoto ? group.licensePhoto.size : 0,
        passportCopy: group.passportCopy ? group.passportCopy.size : 0,
        photoIdCopy: group.photoIdCopy ? group.photoIdCopy.size : 0,
        signatureFile: signatureFile.size
      };

      const readableSizes = Object.fromEntries(
        Object.entries(fileSizes).map(([key, size]) => [
          key,
          `${(size / (1024 * 1024)).toFixed(2)} MB`
        ])
      );

      const totalSizeMB = (
        Object.values(fileSizes).reduce((a, b) => a + b, 0) / (1024 * 1024)
      ).toFixed(2);

      console.log("📎 Individual File Sizes:");
      console.table(readableSizes);
      console.log("📦 Total Upload Size:", `${totalSizeMB} MB`);
      // above code added by ragu 19th jun


      await axios.post(`${config.BASE_URL}/register`, formData);

      // await axios.post(`${config.BASE_URL}/register`, formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });

      alert('Vehicle registered successfully. Awaiting admin approval.');
      setGroup(initialFormState);
      setOption("");
      sigCanvas.current.clear();
      navigate('/about');

    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          alert("Registration failed: Missing or invalid fields. Please check your input.");
        } else if (status === 413) {
          alert("File size/Type mismatching(Accepted type PDF, JPEG, JPG). Please upload files smaller than 5MB.");
        } else if (status === 500) {
          alert("Server error. Please try again later.");
        } else {
          alert("Please check the file Size/Type, input fields, Signature. And try again");
        }

        console.error(`Axios Error ${status}:`, data);
      } else if (error.request) {
        // Request was made but no response (e.g., offline)
        alert("OverAll uploaded File size too large, Please compress your file and each file must not exceed 5MB");
        console.error("No response received:", error.request);
      } else {
        // Something else caused the error
        alert("Unexpected error. Please try again.");
        console.error("Error", error.message);
        console.error("Safari/iOS error details:", error);
      }
    } finally {
      setIsSubmitting(false);    // ← always re-enable when done
    }
  };


  return (
    <div>
      <Form className="form" onSubmit={handleSubmit} autoComplete="off" onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }}>
        <center><p>Register your Details</p></center>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="firstName">First Name<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.firstName ? 'input-error' : ''}`} type="text" name="firstName" id="firstName" value={group.firstName} onChange={handleChange} onBlur={handleBlur} placeholder="Enter your first name" />
            {submitted && errors.firstName && <div className="tooltip-message">{errors.firstName}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="lastName">Last Name<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.lastName ? 'input-error' : ''}`} type="text" name="lastName" id="lastName" value={group.lastName} onChange={handleChange} onBlur={handleBlur} placeholder="Enter your last name" />
            {submitted && errors.lastName && <div className="tooltip-message">{errors.lastName}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="dateOfBirth">Date of Birth<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <DatePicker
              className={`form__input ${submitted && errors.dateOfBirth ? 'input-error' : ''}`}
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
              onCalendarClose={() => handleBlur({ target: { name: 'dateOfBirth', value: group.dateOfBirth } })}

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
            {submitted && errors.dateOfBirth && <div className="tooltip-message">{errors.dateOfBirth}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="mobileNumber">Mobile Number<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.mobileNumber ? 'input-error' : ''}`} type="text" name="mobileNumber" id="mobileNumber" value={group.mobileNumber} maxLength="12" onChange={handleChange} onBlur={handleBlur} placeholder="Enter your mobile number" />
            {submitted && errors.mobileNumber && <div className="tooltip-message">{errors.mobileNumber}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="email">Email ID<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.email ? 'input-error' : ''}`} type="text" name="email" id="email" value={group.email} onChange={handleChange} onBlur={handleBlur} placeholder="xyz@company.com" />
            {submitted && errors.email && <div className="tooltip-message">{errors.email}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label">Vehicle Type<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <select
              value={option}
              onChange={(e) => {
                setOption(e.target.value);
                if (submitted && errors.option) {
                  const newErrors = { ...errors };
                  delete newErrors.option;
                  setErrors(newErrors);
                }
              }}
              className={`form__input ${submitted && errors.option ? 'input-error' : ''}`}>
              <option value="">-- Choose --</option>
              <option value="car">Car</option>
              <option value="motorbike">Motor-Bike</option>
              <option value="ebike">E-Bike</option>
            </select>
            {submitted && errors.option && <div className="tooltip-message">{errors.option}</div>}
          </div>
        </FormGroup>

        {(option === "car" || option === "motorbike") && (
          <div className="mt-4">
            <FormGroup className="form-row">
              <label className="form__label" htmlFor="licenseNumber">License Number<span style={{ color: 'red' }}>*</span></label>
              <div className="tooltip-container" style={{ flex: 1 }}>
                <input
                  type="text"
                  className={`form__input ${submitted && errors.licenseNumber ? 'input-error' : ''}`}
                  name="licenseNumber"
                  id="licenseNumber"
                  maxLength="20"
                  value={group.licenseNumber || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your license number"
                />
                {submitted && errors.licenseNumber && <div className="tooltip-message">{errors.licenseNumber}</div>}
              </div>
            </FormGroup>

            <FormGroup className="form-row">
              <label className="form__label" htmlFor="licenseState">License State<span style={{ color: 'red' }}>*</span></label>
              <div className="tooltip-container" style={{ flex: 1 }}>
                <select
                  className={`form__input ${submitted && errors.licenseState ? 'input-error' : ''}`}
                  name="licenseState"
                  id="licenseState"
                  value={group.licenseState || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">-- Select State --</option>
                  <option value="ACT">Australian Capital Territory (ACT)</option>
                  <option value="NSW">New South Wales (NSW)</option>
                  <option value="QLD">Queensland (QLD)</option>
                  <option value="SA">South Australia (SA)</option>
                  <option value="TAS">Tasmania (TAS)</option>
                  <option value="VIC">Victoria (VIC)</option>
                  <option value="WA">Western Australia (WA)</option>
                  <option value="Overseas">Overseas</option>
                </select>
                {submitted && errors.licenseState && <div className="tooltip-message">{errors.licenseState}</div>}
              </div>
            </FormGroup>

            <FormGroup className="form-row">
              <label className="form__label" htmlFor="licenseCountry">License Country<span style={{ color: 'red' }}>*</span></label>
              <div className="tooltip-container" style={{ flex: 1 }}>
                <select
                  className={`form__input fixed-width-dropdown ${submitted && errors.licenseCountry ? 'input-error' : ''}`}
                  name="licenseCountry"
                  id="licenseCountry"
                  value={group.licenseCountry}
                  onChange={handleChange}
                  onBlur={handleBlur}
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

                {submitted && errors.licenseCountry && <div className="tooltip-message">{errors.licenseCountry}</div>}
              </div>
            </FormGroup>

            <FormGroup className="form-row">
              <label className="form__label" htmlFor="licensePhoto">Upload License<span style={{ color: 'red' }}>*</span></label>
              <div className="tooltip-container" style={{ flex: 1 }}>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    className={`form__input file-upload ${submitted && errors.licensePhoto ? 'input-error' : ''}`}
                    name="licensePhoto"
                    id="licensePhoto"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    accept="image/*,application/pdf"
                  />
                  {/* Add max file size text */}
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '5px' }}>
                    Max file size: 5MB
                  </div>
                  {previews.licensePhoto && (
                    <div style={{ marginTop: '10px' }}>
                      <a
                        href={previews.licensePhoto}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.75rem', color: '#007bff' }}
                      >
                        {group.licensePhoto?.type === "application/pdf" ? "View PDF" : "View Image"}
                      </a>
                    </div>
                  )}

                </div>
                {submitted && errors.licensePhoto && <div className="tooltip-message">{errors.licensePhoto}</div>}
              </div>
            </FormGroup>

            <FormGroup className="form-row">
              <label className="form__label" htmlFor="passportCopy">Upload Passport<span style={{ color: 'red' }}>*</span></label>
              <div className="tooltip-container" style={{ flex: 1 }}>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    className={`form__input file-upload ${submitted && errors.passportCopy ? 'input-error' : ''}`}
                    name="passportCopy"
                    id="passportCopy"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    accept="image/*,application/pdf"
                  />
                  {/* Add max file size text */}
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '5px' }}>
                    Max file size: 5MB
                  </div>
                  {previews.passportCopy && (
                    <div style={{ marginTop: '10px' }}>
                      <a
                        href={previews.passportCopy}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.75rem', color: '#007bff' }}
                      >
                        {group.passportCopy?.type === "application/pdf" ? "View PDF" : "View Image"}
                      </a>
                    </div>
                  )}

                </div>
                {submitted && errors.passportCopy && <div className="tooltip-message">{errors.passportCopy}</div>}
              </div>
            </FormGroup>
          </div>
        )}

        {option === "ebike" && (
          <div className="mt-4">

            <FormGroup className="form-row">
              <label className="form__label" htmlFor="photoIdCopy">Upload Any Government Issued Photo ID<span style={{ color: 'red' }}>*</span></label>
              <div className="tooltip-container" style={{ flex: 1 }}>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    className={`form__input file-upload ${submitted && errors.photoIdCopy ? 'input-error' : ''}`}
                    name="photoIdCopy"
                    id="photoIdCopy"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    accept="image/*,application/pdf"
                  />
                  {/* Add max file size text */}
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '5px' }}>
                    Max file size: 5MB
                  </div>
                  {previews.photoIdCopy && (
                    <div style={{ marginTop: '10px' }}>
                      <a
                        href={previews.photoIdCopy}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.75rem', color: '#007bff' }}
                      >
                        {group.photoIdCopy?.type === "application/pdf" ? "View PDF" : "View Image"}
                      </a>
                    </div>
                  )}
                </div>
                {submitted && errors.photoIdCopy && <div className="tooltip-message">{errors.photoIdCopy}</div>}
              </div>
            </FormGroup>
          </div>
        )}

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="addressLine1">Address Line 1<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.addressLine1 ? 'input-error' : ''}`} type="text" name="addressLine1" id="addressLine1" value={group.addressLine1} onChange={handleChange} onBlur={handleBlur} placeholder="Enter your street address 1" />
            {submitted && errors.addressLine1 && <div className="tooltip-message">{errors.addressLine1}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="addressLine2">Address Line 2</label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className="form__input" type="text" name="addressLine2" id="addressLine2"
              value={group.addressLine2 || ''} onChange={handleChange} onBlur={handleBlur} placeholder="Enter your street address 2"
            />
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="city">City<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.city ? 'input-error' : ''}`} type="text" name="city" id="city" value={group.city} onChange={handleChange} onBlur={handleBlur} placeholder="Enter city" />
            {submitted && errors.city && <div className="tooltip-message">{errors.city}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="state">State<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.state ? 'input-error' : ''}`} type="text" name="state" id="state" value={group.state} onChange={handleChange} onBlur={handleBlur} placeholder="Enter state" />
            {submitted && errors.state && <div className="tooltip-message">{errors.state}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="postalCode">Postal Code<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.postalCode ? 'input-error' : ''}`} type="text" name="postalCode" id="postalCode" value={group.postalCode} maxLength="4" onChange={handleChange} onBlur={handleBlur} placeholder="Enter postal code" />
            {submitted && errors.postalCode && <div className="tooltip-message">{errors.postalCode}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="country">Country<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.country ? 'input-error' : ''}`} type="text" name="country" id="country" value={group.country || ''} onChange={handleChange} onBlur={handleBlur} placeholder="Enter your country" />
            {submitted && errors.country && <div className="tooltip-message">{errors.country}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="bankName">Bank Name<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.bankName ? 'input-error' : ''}`} type="text" name="bankName" id="bankName" value={group.bankName || ''} onChange={handleChange} onBlur={handleBlur} placeholder="Enter Bank name" />
            {submitted && errors.bankName && <div className="tooltip-message">{errors.bankName}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="accountName">Name as per Bank<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.accountName ? 'input-error' : ''}`} type="text" name="accountName" id="accountName" value={group.accountName || ''} onChange={handleChange} onBlur={handleBlur} placeholder="Enter account holder name" />
            {submitted && errors.accountName && <div className="tooltip-message">{errors.accountName}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="bsbNumber">BSB No.<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.bsbNumber ? 'input-error' : ''}`} type="text" name="bsbNumber" id="bsbNumber" value={group.bsbNumber || ''} maxLength="6" onChange={handleChange} onBlur={handleBlur} placeholder="Enter 6-digit BSB" />
            {submitted && errors.bsbNumber && <div className="tooltip-message">{errors.bsbNumber}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="accountNumber">Account Number<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.accountNumber ? 'input-error' : ''}`} type="text" name="accountNumber" id="accountNumber" value={group.accountNumber || ''} maxLength="12" onChange={handleChange} onBlur={handleBlur} placeholder="Enter 6–12 digit account number" />
            {submitted && errors.accountNumber && <div className="tooltip-message">{errors.accountNumber}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="emergencyContactName">Emergency Contact Name<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.emergencyContactName ? 'input-error' : ''}`} type="text" name="emergencyContactName" id="emergencyContactName" value={group.emergencyContactName || ''} onChange={handleChange} onBlur={handleBlur} placeholder="Enter emergency contact name" />
            {submitted && errors.emergencyContactName && <div className="tooltip-message">{errors.emergencyContactName}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label" htmlFor="emergencyContactNumber">Emergency Contact No.<span style={{ color: 'red' }}>*</span></label>
          <div className="tooltip-container" style={{ flex: 1 }}>
            <input className={`form__input ${submitted && errors.emergencyContactNumber ? 'input-error' : ''}`} type="text" name="emergencyContactNumber" id="emergencyContactNumber" value={group.emergencyContactNumber || ''} maxLength="12" onChange={handleChange} onBlur={handleBlur} placeholder="Enter emergency contact number" />
            {submitted && errors.emergencyContactNumber && <div className="tooltip-message">{errors.emergencyContactNumber}</div>}
          </div>
        </FormGroup>

        <FormGroup className="form-row">
          <label className="form__label">Signature<span style={{ color: 'red' }}>*</span></label>
          <div className="signature-container tooltip-container" style={{ flex: 1 }}>
            <SignatureCanvas
              ref={sigCanvas}
              backgroundColor="#fff"
              penColor="black"
              canvasProps={{ width: 400, height: 100, className: "sigCanvas" }}
              onEnd={() => {
                if (submitted && !sigCanvas.current.isEmpty()) {
                  setSignatureError(''); // clear signature error once user signs
                }
              }}
            />
            <div className="clear-btn-wrapper">
              <button type="button" className="clear-btn-styled" onClick={() => {
                sigCanvas.current.clear();
                setSignatureError('Signature is required'); // reset error on clear if submitted
              }}>
                Clear
              </button>
              {submitted && signatureError && <div className="tooltip-message" style={{ display: 'block', marginTop: '5px' }}>{signatureError}</div>}
            </div>
          </div>
        </FormGroup>

        <FormGroup check>
          <div className="terms-container">
            <input className="terms-checkbox" type="checkbox" id="test1" name="teamsAndConditions" onChange={handleChange} onBlur={handleBlur} checked={group.teamsAndConditions} />
            <label htmlFor="test1">
              I agree to these{' '}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                style={{ background: 'none', border: 'none', padding: 0, color: '#007bff', fontSize: '14px', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Terms and Conditions
              </button>
            </label>

            {submitted && errors.teamsAndConditions && <div className="tooltip-message">{errors.teamsAndConditions}</div>}
          </div>
        </FormGroup>

        <FormGroup>
          <center className="button-row">
            <Button
              className="register-btn"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering…' : 'Register'}
            </Button>

            <Button className="cancel-btn" tag={Link} to="/about">Cancel</Button>
          </center>
        </FormGroup>

        {showTermsModal && (
          <div className="terms-overlay">
            <div className="terms-content">
              <button className="terms-close" onClick={() => setShowTermsModal(false)}>×</button>
              <h4>ZUBER Terms and Conditions</h4>
              <div className="terms-body">
                <h5>1. Introduction</h5>
                <ul className="terms-body">
                  Welcome to ZUBER Car Rentals. By accessing or using our services—including vehicle rentals (cars, motorbikes, e-bikes),
                  repairs, purchases, or accident vehicle exchanges—you agree to be bound by the following Terms and Conditions.
                  These terms govern your rights and obligations and form a binding agreement between you and
                  <strong> ZUBER CAR RENTAL PTY LTD</strong> (“ZUBER”, “we”, “us”, or “our”).
                </ul>

                <h5>2. Rental Eligibility</h5>
                <ul>
                  Renters must be at least 21 years old and hold a valid driver’s license (international licenses must be in English or officially translated).Proof of identity, address, and a security deposit (bond) are required.E-bike rentals are permitted from 18 years with valid photo ID.
                </ul>

                <h5>3. Rental Terms</h5>
                <ul>
                  Rental periods start and end on the agreed date/time.
                  Vehicle must be returned in the same condition it was rented (excluding reasonable wear and tear).
                  Late returns incur hourly or daily charges as per our rate schedule.
                  Fuel must be refilled to the same level or refueling charges apply.
                  Mileage limits may apply; additional km charges may be added.
                </ul>

                <h5>4. Insurance and Liability</h5>
                <ul>
                  All rentals include compulsory third-party insurance. Additional coverage is available for purchase.
                  Renters are liable for damage due to misuse, negligence, or unauthorized use.
                  Accidents must be reported within 12 hours with a police report if applicable.
                  Insurance excess is payable unless waived with an excess reduction package.
                </ul>

                <h5>5. Prohibited Uses</h5>
                <ul>
                  Vehicles must not be used for commercial purposes unless pre-approved.
                  No involvement in unlawful activities or races.
                  Only licensed and authorized drivers may operate the vehicle.
                  Off-road use is prohibited unless specified.
                </ul>

                <h5>6. Breakdown and Repairs</h5>
                <ul>
                  Vehicles are regularly maintained. Contact 24/7 support in case of breakdown.
                  Unauthorized repairs or modifications are not allowed.
                  ZUBER is not liable for delays due to breakdowns unless caused by known issues.
                </ul>

                <h5>7. Buying and Selling Vehicles</h5>
                <ul>
                  We sell used vehicles. Test drives are available upon booking with valid ID.
                  All sales are final unless otherwise stated. Inspection reports are available.
                  Owners may list or exchange used or damaged vehicles with us.
                </ul>

                <h5>8. Accident-Damage Exchange</h5>
                <ul>
                  We accept accident-damaged vehicles for exchange towards another ZUBER vehicle.
                  Inspection and documentation are required.
                  Final valuation is based on damage, age, and model.
                </ul>

                <h5>9. Payment and Bond</h5>
                <ul>
                  Full payment is due before rental begins (via card or bank transfer).
                  A refundable bond is collected and released after inspection.
                  Admin fees may apply for bond processing or contract breach.
                </ul>

                <h5>10. Cancellation and Refunds</h5>
                <ul>
                  Full refund (excluding fees) if cancelled 24+ hours before rental.
                  Same-day cancellations may incur 50% charge.
                  No refunds for early returns unless approved.
                </ul>

                <h5>11. Privacy and Data</h5>
                <ul>
                  We collect personal data for rental, payment, and insurance purposes.
                  We do not share your data except as required by law or partners (e.g., insurers, regulators).
                </ul>

                <h5>12. Amendments</h5>
                <p>
                  ZUBER reserves the right to update these Terms and Conditions at any time.
                  Continued use of the platform constitutes acceptance of the updated terms.
                </p>
              </div>
            </div>
          </div>
        )}


      </Form>
    </div >
  );

};
export default Register;