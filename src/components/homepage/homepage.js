import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

import "react-datepicker/dist/react-datepicker.css";
import "./homepage.css";
import "./approvePage.css";
import config from '../../config';

export default function Homepage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const [formInputs, setFormInputs] = useState({
    bondAmount: "",
    bondWeeks: "",
    bondStartDate: null,
    bondEndDate: null,
    make: "",
    model: "",
    registrationNumber: "",
    year: "",
    fuelType: "",
    note: "",
    licenseFile: null,
    passportFile: null,
    photoIdFile: null,
  });

  useEffect(() => {
    fetch(`${config.BASE_URL}/vehicle/getUser`)
      .then((res) => res.json())
      .then((data) => setVehicles(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  // 🔄 Auto-fill vehicle details by registration number (status = 'not sold')
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (formInputs.registrationNumber.trim().length >= 3) {
        try {
          const res = await fetch(`${config.BASE_URL}/vehicle/search?regNumber=${formInputs.registrationNumber.trim()}`);
          if (res.ok) {
            const data = await res.json();
            setFormInputs((prev) => ({
              ...prev,
              make: data.make,
              model: data.model,
              year: data.year,
              vehicleType: data.vehicleType
            }));
          } else {
            console.log("No matching vehicle found or vehicle is sold.");
          }
        } catch (error) {
          console.error("Error fetching vehicle by registration number:", error);
        }
      }
    };

    fetchVehicleDetails();
  }, [formInputs.registrationNumber]);


  const handleApprove = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormInputs({
      ...formInputs,
      userId: vehicle.id,
      vehicleType: vehicle.vehicleType || "",
      registrationNumber: vehicle.registrationNumber || vehicle.vehicles?.[0]?.registrationNumber || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
      fuelType: vehicle.fuelType || "",
      note: vehicle.note || ""
    });
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    const {
      bondAmount,
      bondWeeks,
      make,
      year,
      model,
      registrationNumber,
      fuelType,
      note,
      bondStartDate,
      bondEndDate,
      licenseFile,
      passportFile,
      photoIdFile,
      bankFile
    } = formInputs;

    const newErrors = {};

    if (!registrationNumber?.trim()) {
      newErrors.registrationNumber = "Registration Number is required.";
    }

    // const start = bondStartDate ? new Date(bondStartDate) : null;
    // const end = bondEndDate ? new Date(bondEndDate) : null;

    if (!bondStartDate) {
      alert("Bond start date is required.");
      return;
    }

    if (bondEndDate && bondEndDate <= bondStartDate) {
      alert("End date must be after start date.");
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {

      const formattedStart = format(bondStartDate, "dd-MM-yyyy hh:mm aa");
      const formattedEnd = bondEndDate ? format(bondEndDate, "dd-MM-yyyy hh:mm aa") : null;

      await fetch(`${config.BASE_URL}/vehicle/approve/${selectedVehicle.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bondAmount,
          bondWeeks,
          bondStartDate: formattedStart,
          bondEndDate: formattedEnd,
          make,
          year,
          model,
          registrationNumber,
          fuelType,
          note
        })
      });

      const fileForm = new FormData();
      fileForm.append("userId", selectedVehicle.id);

      if (licenseFile) fileForm.append("licenseFile", licenseFile);
      if (passportFile) fileForm.append("passportFile", passportFile);
      if (photoIdFile) fileForm.append("photoIdFile", photoIdFile);
      if (bankFile) fileForm.append("bankFile", bankFile);

      if (licenseFile || passportFile || bankFile) {
        await fetch(`${config.BASE_URL}/register/updateFiles`, {
          method: "POST",
          body: fileForm
        });
      }

      alert("User registration has been successfully approved.");
      setShowModal(false);
      setFormInputs({
        bondAmount: "",
        bondWeeks: "",
        bondStartDate: "",
        bondEndDate: "",
        make: "",
        model: "",
        registrationNumber: "",
        year: "",
        fuelType: "",
        note: "",
        licenseFile: null,
        passportFile: null,
        bankFile: null
      });
      refreshList();
    }
    catch (error) {
      console.error("Error approving or uploading files:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleUpdate = (vehicle) => {
    navigate(`/update/${vehicle.id}`, { state: vehicle });
  };

  const handleTransfer = () => {
    window.open("https://www.apps09.revenue.nsw.gov.au/customer_service/finesonline/login", "_blank");
  };

  const refreshList = () => {
    fetch(`${config.BASE_URL}/vehicle/getUser`)
      .then((res) => res.json())
      .then((data) => setVehicles(data));
  };

  const filteredVehicles = vehicles.filter((v) => {
    const term = searchText.toLowerCase();
    return (
      v.firstName.toLowerCase().includes(term) ||
      v.lastName.toLowerCase().includes(term) ||
      v.licenseNumber.toLowerCase().includes(term) ||
      v.email.toLowerCase().includes(term) ||
      v.mobileNumber.toLowerCase().includes(term) ||
      v.registrationNumber.toLowerCase().includes(term)
    );
  });

  const grouped = {
    Pending: filteredVehicles.filter((v) => v.status === "PENDING"),
    Approved: filteredVehicles.filter((v) => v.status === "APPROVED"),
    Closed: filteredVehicles.filter((v) => v.status === "CLOSED")
  };

  return (
    <div className="homepage-body">
      <div className="page-wrapper">
        <h1>User Vehicle Requests</h1>

        <div className="search-filter-row">
          <input
            type="text"
            placeholder="Search by"
            className="search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button className="filter-btn" onClick={() => setSearchText("")}>
            Clear
          </button>
        </div>

        {["Pending", "Approved", "Closed"].map((status) => (
          <section key={status} style={{ marginTop: "30px" }}>
            <h2>{status} Requests</h2>
            {grouped[status].length === 0 ? (
              <p>No {status.toLowerCase()} requests.</p>
            ) : (
              <div className="table-wrapper">
                <table className="vehicle-table">
                  <thead style={thStyle}>
                    <tr>
                      <th>ID</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>DOB</th>
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>Vehicle Reg No</th>
                      <th>License No</th>
                      <th colSpan="2">ID Documents</th>
                      <th>Bank Statement</th>
                      {/* <th>Signature</th> */}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[status].map((v) => (
                      <tr key={v.id}>
                        <td>{v.id}</td>
                        <td>{v.firstName}</td>
                        <td>{v.lastName}</td>
                        <td>{v.dateOfBirth}</td>
                        <td>{v.mobileNumber}</td>
                        <td>{v.email}</td>
                        <td>{v.registrationNumber || (v.vehicles?.[0]?.registrationNumber || "N/A")}</td>
                        <td>{v.licenseNumber}</td>
                        {["car", "motor-bike"].includes(v.vehicleType?.toLowerCase()) ? (
                          <>
                            <td>
                              <a href={`${config.BASE_URL}/register/file/${v.id}/license`} target="_blank" rel="noopener noreferrer">License</a>
                            </td>
                            <td>
                              <a href={`${config.BASE_URL}/register/file/${v.id}/passport`} target="_blank" rel="noopener noreferrer">Passport</a>
                            </td>
                          </>
                        ) : (
                          <>
                            <td colSpan="2">
                              <a href={`${config.BASE_URL}/register/file/${v.id}/photoid`} target="_blank" rel="noopener noreferrer">Photo ID</a>
                            </td>
                          </>
                        )}


                        <td>
                          <a href={`${config.BASE_URL}/register/file/${v.id}/bankpdf`} target="_blank" rel="noopener noreferrer">Bank Statement</a>
                        </td>
                        {/* <td>
                          <img
                            src={`${config.BASE_URL}/register/file/${v.id}/signature`}
                            alt="Signature"
                            style={{ width: "100px", height: "auto" }}
                          />
                        </td> */}
                        <td>
                          {v.status === "PENDING" && (
                            <button className="action-btn btn-approve" onClick={() => handleApprove(v)}>Approve</button>
                          )}
                          {v.status === "APPROVED" && !v.bondEndDate && (
                            <>
                              <button className="action-btn btn-update" onClick={() => handleUpdate(v)}>Update</button>
                              <button className="action-btn btn-transfer" onClick={handleTransfer}>Transfer</button>
                            </>
                          )}
                          {v.status === "CLOSED" && <span>Closed</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}

        {showModal && (
          <ApproveModal
            formInputs={formInputs}
            setFormInputs={setFormInputs}
            errors={errors}
            setErrors={setErrors}
            onSubmit={handleModalSubmit}
            onCancel={() => {
              setShowModal(false);
              setFormInputs({
                bondAmount: "",
                bondWeeks: "",
                bondStartDate: "",
                bondEndDate: "",
                registrationNumber: "",
                rentDuration: "",
                make: "",
                model: "",
                year: "",
                fuelType: "",
                note: ""
              });
            }}
          />
        )}
      </div>
    </div>
  );
}

function ApproveModal({ formInputs, setFormInputs, errors, setErrors, onSubmit, onCancel }) {
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    if (startDate && startTime) {
      const combined = new Date(startDate);
      combined.setHours(startTime.getHours());
      combined.setMinutes(startTime.getMinutes());
      setFormInputs((prev) => ({ ...prev, bondStartDate: combined }));
    }
  }, [startDate, startTime, setFormInputs]);

  useEffect(() => {
    if (endDate && endTime) {
      const combined = new Date(endDate);
      combined.setHours(endTime.getHours());
      combined.setMinutes(endTime.getMinutes());
      setFormInputs((prev) => ({ ...prev, bondEndDate: combined }));
    }
  }, [endDate, endTime, setFormInputs]);

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="modal-title">Approve Request</h3>
        <div className="close-button" onClick={onCancel}>×</div>

        <div className="row">
          <div className="input-group">
            <label>Bond Amount</label>
            <input type="text" value={formInputs.bondAmount} onChange={(e) => setFormInputs({ ...formInputs, bondAmount: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Rent per Week</label>
            <input type="text" value={formInputs.bondWeeks} onChange={(e) => setFormInputs({ ...formInputs, bondWeeks: e.target.value })} />
          </div>
        </div>

        <div className="row">
          <div className="input-group">
            <label>Start Date <span style={{ color: 'red' }}>*</span></label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              dateFormat="dd-MM-yyyy"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              placeholderText="Select date"
              className="datepicker-input"
            />
          </div>
          <div className="input-group">
            <label>Start Time <span style={{ color: 'red' }}>*</span></label>
            <DatePicker
              selected={startTime}
              onChange={setStartTime}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={5}
              timeCaption="Time"
              dateFormat="h:mm aa"
              placeholderText="Select time"
              className="datepicker-input"
            />
          </div>
          <div className="input-group">
            <label>End Date</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              dateFormat="dd-MM-yyyy"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              minDate={formInputs.bondStartDate}
              placeholderText="Select date"
              className="datepicker-input"
            />
          </div>
          <div className="input-group">
            <label>End Time</label>
            <DatePicker
              selected={endTime}
              onChange={setEndTime}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={5}
              timeCaption="Time"
              dateFormat="h:mm aa"
              placeholderText="Select time"
              className="datepicker-input"
            />
          </div>
        </div>

        <div className="row">
          <div className="input-group">
            <label> Registration Number <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              value={formInputs.registrationNumber || ""}
              onChange={(e) => {
                setFormInputs({ ...formInputs, registrationNumber: e.target.value });
                if (setErrors) {
                  setErrors((prev) => ({ ...prev, registrationNumber: "" }));
                }
              }}
            />
            {errors?.registrationNumber && (
              <span style={{ color: "red", fontSize: "0.8rem" }}>{errors.registrationNumber}</span>
            )}
          </div>
          <div className="input-group">
            <label>Rent Duration</label>
            <input type="text" value={formInputs.rentDuration || ""} onChange={(e) => setFormInputs({ ...formInputs, rentDuration: e.target.value })} />
          </div>
        </div>

        <div className="row">
          <div className="input-group">
            <label>Make</label>
            <input type="text" value={formInputs.make} onChange={(e) => setFormInputs({ ...formInputs, make: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Model</label>
            <input type="text" value={formInputs.model} onChange={(e) => setFormInputs({ ...formInputs, model: e.target.value })} />
          </div>
        </div>

        <div className="row">
          <div className="input-group">
            <label>Year</label>
            <input type="text" value={formInputs.year} onChange={(e) => setFormInputs({ ...formInputs, year: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Fuel Type</label>
            <input type="text" value={formInputs.fuelType} onChange={(e) => setFormInputs({ ...formInputs, fuelType: e.target.value })} />
          </div>
        </div>

        {["car", "motor-bike"].includes(formInputs.vehicleType?.toLowerCase()) ? (
          <div className="row">
            <div className="input-group">
              <label>License Copy</label>
              <a
                href={`${config.BASE_URL}/register/file/${formInputs.userId}/license`}
                target="_blank"
                rel="noopener noreferrer"
                className="file-link-box"
              >
                View License
              </a>
              <input
                type="file"
                name="licenseFile"
                accept="application/pdf,image/*"
                onChange={(e) => setFormInputs({ ...formInputs, licenseFile: e.target.files[0] })}
                style={{ marginTop: "8px" }}
              />
            </div>

            <div className="input-group">
              <label>Passport</label>
              <a
                href={`${config.BASE_URL}/register/file/${formInputs.userId}/passport`}
                target="_blank"
                rel="noopener noreferrer"
                className="file-link-box"
              >
                View Passport
              </a>
              <input
                type="file"
                name="passportFile"
                accept="application/pdf,image/*"
                onChange={(e) => setFormInputs({ ...formInputs, passportFile: e.target.files[0] })}
                style={{ marginTop: "8px" }}
              />
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="input-group">
              <label>Government Photo ID</label>
              <a
                href={`${config.BASE_URL}/register/file/${formInputs.userId}/photoid`}
                target="_blank"
                rel="noopener noreferrer"
                className="file-link-box"
              >
                View Photo ID
              </a>
              <input
                type="file"
                name="photoIdFile"
                accept="application/pdf,image/*"
                onChange={(e) => setFormInputs({ ...formInputs, photoIdFile: e.target.files[0] })}
                style={{ marginTop: "8px" }}
              />
            </div>
          </div>
        )}
        <div className="row">
          <div className="input-group">
            <label>Bank Statement</label>
            <a
              href={`${config.BASE_URL}/register/file/${formInputs.userId}/bankpdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="file-link-box"
            >
              View Bank Statement
            </a>
            <input
              type="file"
              name="bankFile"
              accept="application/pdf,image/*"
              onChange={(e) => setFormInputs({ ...formInputs, bankFile: e.target.files[0] })}
              style={{ marginTop: "8px" }}
            />
          </div>
          <div className="input-group">
            <label>Signature</label>
            <img
              src={`${config.BASE_URL}/register/file/${formInputs.userId}/signature`}
              alt="Signature"
              style={{ width: "120px", height: "auto", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
        </div>


        <div className="row">
          <div className="input-group full-width">
            <label>Comments</label>
            <textarea rows="3" value={formInputs.note} onChange={(e) => setFormInputs({ ...formInputs, note: e.target.value })}></textarea>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btnn confirm-btn" onClick={onSubmit}>Confirm</button>
          <button className="btnn cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  backgroundColor: "#f2f2f2",
  textAlign: "left"
};
