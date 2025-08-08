import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { parse, format, isValid } from 'date-fns';
import axios from 'axios';
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
  const [currentPageMap, setCurrentPageMap] = useState({
    Pending: 1,
    Approved: 1,
    Closed: 1,
  });
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const safeFormat = (value) => {
    try {
      if (!value) return "N/A";

      let date;

      if (value instanceof Date) {
        date = value;
      } else if (typeof value === 'string') {
        date = parse(value, "dd-MM-yyyy hh:mm aa", new Date());
      } else {
        return "N/A";
      }

      if (!isValid(date)) throw new Error("Invalid date");

      return format(date, "dd-MM-yyyy hh:mm aa");
    } catch (err) {
      console.error("Failed to format:", value);
      return "N/A";
    }
  };

  const [formInputs, setFormInputs] = useState({
    bondAmount: "",
    bondWeeks: "",
    bondStartDate: null,
    bondEndDate: null,
    vehicleMake: "",
    vehicleModel: "",
    registrationNumber: "",
    vehicleYear: "",
    fuelType: "",
    note: "",
    licenseFile: null,
    passportFile: null,
    photoIdFile: null,
    vehicleType: ""
  });

  useEffect(() => {
    fetch(`${config.BASE_URL}/userVehicle/getUser`)
      .then((res) => res.json())
      .then((data) => setVehicles(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

    // 🔹 Auto-adjust current page when search results change
    useEffect(() => {
      ["Pending", "Approved", "Closed"].forEach(status => {
        const total = grouped[status]?.length || 0;
        const maxPage = Math.ceil(total / itemsPerPage) || 1;
        if (currentPageMap[status] > maxPage) {
          setCurrentPageMap(prev => ({ ...prev, [status]: maxPage }));
        }
      });
    }, [searchText, vehicles]); // runs whenever search text or data changes

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const response = await fetch(`${config.BASE_URL}/register/delete/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert("Record deleted successfully.");
        // Refresh or filter the list
        setVehicles(prev => prev.filter(v => v.id !== id));
      } else {
        const error = await response.text();
        alert("Failed to delete: " + error);
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while deleting.");
    }
  };

  const handleApprove = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormInputs({
      ...formInputs,
      userId: vehicle.id,
      vehicleType: vehicle.vehicleType || "",
      registrationNumber: vehicle.registrationNumber || vehicle.vehicles?.[0]?.registrationNumber || "",
      vehicleMake: vehicle.vehicleMake || "",
      vehicleModel: vehicle.vehicleModel || "",
      vehicleYear: vehicle.vehicleYear || "",
      fuelType: vehicle.fuelType || "",
      note: vehicle.note || ""
    });
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    const {
      bondAmount,
      bondWeeks,
      vehicleMake,
      vehicleYear,
      vehicleModel,
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

    const normalizedType = formInputs.vehicleType?.toLowerCase().replace(/[-\s]/g, "");
    if (normalizedType !== "ebike" && !registrationNumber?.trim()) {
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

      await fetch(`${config.BASE_URL}/userVehicle/approve/${selectedVehicle.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bondAmount,
          bondWeeks,
          bondStartDate: formattedStart,
          bondEndDate: formattedEnd,
          vehicleMake,
          vehicleYear,
          vehicleModel,
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
        vehicleMake: "",
        vehicleModel: "",
        registrationNumber: "",
        vehicleYear: "",
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
    fetch(`${config.BASE_URL}/userVehicle/getUser`)
      .then((res) => res.json())
      .then((data) => setVehicles(data));
  };

  // 🔹 Search is applied to ALL records before pagination
  const filteredVehicles = vehicles.filter((v) => {
    const term = searchText.toLowerCase();
    const regNo = v.registrationNumber || v.vehicles?.[0]?.registrationNumber || "";
    return (
      (v.firstName || "").toLowerCase().includes(term) ||
      (v.lastName || "").toLowerCase().includes(term) ||
      (v.licenseNumber || "").toLowerCase().includes(term) ||
      (v.email || "").toLowerCase().includes(term) ||
      (v.mobileNumber || "").toLowerCase().includes(term) ||
      regNo.toLowerCase().includes(term)
    );
  });

  const grouped = {
    Pending: filteredVehicles.filter((v) => v.status === "PENDING"),
    Approved: filteredVehicles.filter((v) => v.status === "APPROVED"),
    Closed: filteredVehicles.filter((v) => v.status === "CLOSED")
  };

  // 🔹 Paginate AFTER filtering
  const paginate = (status) => {
    const page = currentPageMap[status];
    const startIndex = (page - 1) * itemsPerPage;
    return grouped[status].slice(startIndex, startIndex + itemsPerPage);
  };
//test1
  const changePage = (status, direction) => {
    setCurrentPageMap((prev) => {
      const total = grouped[status].length;
      const maxPage = Math.ceil(total / itemsPerPage);
      const newPage = Math.max(1, Math.min(maxPage, prev[status] + direction));
      return { ...prev, [status]: newPage };
    });
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
            // onChange={(e) => setSearchText(e.target.value)}
            onChange={(e) => {
              setSearchText(e.target.value);
              // Optional: reset to first page for all statuses
              setCurrentPageMap({
                Pending: 1,
                Approved: 1,
                Closed: 1
              });
            }}
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
              <>
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
                        <th>Vehicle Type</th>
                        {status !== "Pending" && <th>Registration No</th>}
                        <th>License No</th>
                        {status !== "Pending" && <th>Start Date</th>}
                        {status === "Approved" && <th>End Date</th>}
                        {status === "Closed" && <th>End Date</th>}
                        {status === "Pending" && (
                          <>
                            <th colSpan="2">ID Documents</th>
                            <th>Bank Statement</th>
                          </>
                        )}

                        {/* <th>Signature</th> */}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginate(status).map((v) => (
                        <tr key={v.id}>
                          <td>{v.id}</td>
                          <td>{v.firstName}</td>
                          <td>{v.lastName}</td>
                          <td>{v.dateOfBirth}</td>
                          <td>{v.mobileNumber}</td>
                          <td>{v.email}</td>
                          <td>{v.vehicleType}</td>
                          {status !== "Pending" && (
                            <td>
                              {v.vehicles?.[0]?.registrationNumber || "N/A"}
                            </td>
                          )}
                          <td>{v.licenseNumber}</td>
                          {status !== "Pending" && (
                            <td>
                              {v.vehicles?.[0]?.bondStartDate
                                ? safeFormat(v.vehicles[0].bondStartDate)
                                : "N/A"}
                            </td>
                          )}

                          {status === "Approved" && (
                            <td>
                              {v.vehicles?.[0]?.bondEndDate
                                ? safeFormat(v.vehicles[0].bondEndDate)
                                : "Current User"}
                            </td>
                          )}

                          {status === "Closed" && (
                            <td>
                              {v.vehicles?.[0]?.bondEndDate
                                ? safeFormat(v.vehicles[0].bondEndDate)
                                : "N/A"}
                            </td>
                          )}

                          {status === "Pending" && (
                            <>
                              {["car", "motorbike"].includes(v.vehicleType?.toLowerCase()) ? (
                                <>
                                  <td>
                                    <a href={`${config.BASE_URL}/register/file/${v.id}/license`} target="_blank" rel="noopener noreferrer">License</a>
                                  </td>
                                  <td>
                                    <a href={`${config.BASE_URL}/register/file/${v.id}/passport`} target="_blank" rel="noopener noreferrer">Passport</a>
                                  </td>
                                </>
                              ) : (
                                <td colSpan="2">
                                  <a href={`${config.BASE_URL}/register/file/${v.id}/photoid`} target="_blank" rel="noopener noreferrer">Photo ID</a>
                                </td>
                              )}

                              <td>
                                <a href={`${config.BASE_URL}/register/file/${v.id}/bankpdf`} target="_blank" rel="noopener noreferrer">Bank Statement</a>
                              </td>
                            </>
                          )}

                          {/* <td>
                          <img
                            src={`${config.BASE_URL}/register/file/${v.id}/signature`}
                            alt="Signature"
                            style={{ width: "100px", height: "auto" }}
                          />
                        </td> */}
                          <td>
                            {v.status === "PENDING" && (
                              <><button className="action-btn btn-approve" onClick={() => handleApprove(v)}>Approve</button>
                                <button className="action-btn btn-delete" onClick={() => handleDelete(v.id)}>Delete</button></>
                            )}
                            {v.status === "APPROVED" && !v.bondEndDate && (
                              <>
                                <button
                                  className="action-btn-group action-btn btn-user"
                                  onClick={() => navigate(`/updateUserInfo/${v.id}`)}
                                >
                                  User Info
                                </button>

                                <button
                                  className="action-btn-group action-btn btn-vehicle"
                                  onClick={() => navigate(`/updatevehicleInfo/${v.id}`)}
                                >
                                  Vehicle Info
                                </button>
                                <button className="action-btn-group action-btn btn-transfer" onClick={handleTransfer}>Transfer</button>
                              </>
                            )}
                            {v.status === "CLOSED" && <span>Closed</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination controls */}
                <div className="pagination-table-footer">
                  <div className="pagination-controls-right">
                    <button
                      className="pagination-btn"
                      onClick={() => changePage(status, -1)}
                      disabled={currentPageMap[status] === 1}
                    >
                      ← Prev
                    </button>

                    <span className="page-number">
                      Page {currentPageMap[status]} of {Math.ceil(grouped[status].length / itemsPerPage)}
                    </span>

                    <button
                      className="pagination-btn"
                      onClick={() => changePage(status, 1)}
                      disabled={currentPageMap[status] >= Math.ceil(grouped[status].length / itemsPerPage)}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </>
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
                vehicleMake: "",
                vehicleModel: "",
                vehicleYear: "",
                fuelType: "",
                note: "",
                vehicleType: ""
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
  const [suggestions, setSuggestions] = useState([]);

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

          <div className="input-group" style={{ position: 'relative' }}>
            <label>
              Registration Number{" "}
              {formInputs.vehicleType?.toLowerCase().replace(/[-\s]/g, "") !== "ebike" ? (
                <span style={{ color: "red" }}>*</span>
              ) : (
                <span style={{ fontSize: "0.8rem", color: "#777", marginLeft: "6px" }}>
                  (Optional for e-bikes)
                </span>
              )}
            </label>
            <input
              type="text"
              value={formInputs.registrationNumber || ""}
              onChange={async (e) => {
                const value = e.target.value;
                setFormInputs({ ...formInputs, registrationNumber: value });
                if (setErrors) setErrors((prev) => ({ ...prev, registrationNumber: "" }));

                if (value.length === 3) {
                  try {
                    const response = await axios.get(`${config.BASE_URL}/adminVehicle/search?regNumber=${value}`);
                    setSuggestions(response.data);
                  } catch (err) {
                    console.error("Vehicle search error", err);
                  }
                } else {
                  setSuggestions([]);
                }
              }}
            />
            {suggestions.length > 0 && (
              <ul className="suggestion-list" >
                {suggestions.map((vehicle, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setFormInputs({
                        ...formInputs,
                        registrationNumber: vehicle.registrationNumber,
                        vehicleMake: vehicle.vehicleMake,
                        vehicleModel: vehicle.vehicleModel,
                        vehicleYear: vehicle.vehicleYear,
                        fuelType: vehicle.fuelType
                      });
                      setSuggestions([]);
                    }}
                  >
                    {vehicle.registrationNumber} - {vehicle.vehicleMake} {vehicle.vehicleModel} ({vehicle.vehicleYear})
                  </li>
                ))}
              </ul>
            )}
            {formInputs.vehicleType?.toLowerCase().replace(/[-\s]/g, "") !== "ebike" && errors?.registrationNumber && (
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
            <input type="text" value={formInputs.vehicleMake} onChange={(e) => setFormInputs({ ...formInputs, vehicleMake: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Model</label>
            <input type="text" value={formInputs.vehicleModel} onChange={(e) => setFormInputs({ ...formInputs, vehicleModel: e.target.value })} />
          </div>
        </div>

        <div className="row">
          <div className="input-group">
            <label>Year</label>
            <input type="text" value={formInputs.vehicleYear} onChange={(e) => setFormInputs({ ...formInputs, vehicleYear: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Fuel Type</label>
            <input type="text" value={formInputs.fuelType} onChange={(e) => setFormInputs({ ...formInputs, fuelType: e.target.value })} />
          </div>
        </div>

        {["car", "motorbike"].includes(formInputs.vehicleType?.toLowerCase()) ? (
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
