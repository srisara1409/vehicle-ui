import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DatePicker from "react-datepicker";
import { parse, isValid, format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import './updateVehicleInfo.css';
import config from '../../config';

export default function UpdateVehicleInfo() {
  const { id } = useParams(); // userId
  const navigate = useNavigate();
  const location = useLocation();
  const readOnly = new URLSearchParams(location.search).get('mode') === 'view';

  const [vehicles, setVehicles] = useState([]);
  const [inactiveVehicles, setInactiveVehicles] = useState([]);

  useEffect(() => {
    fetchVehicles();
    fetchInactiveVehicles();
  }, [id]);

  const fetchVehicles = () => {
    fetch(`${config.BASE_URL}/userVehicle/getUser/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Accept both shapes: Array or { vehicles: [...] }
        const rawVehicles = Array.isArray(data) ? data : (data?.vehicles ?? []);

        const vehiclesWithParsedDates = rawVehicles.map(v => {
          const { date: startDate, time: startTime } = parseDateTime(v.bondStartDate);

          // bondEndDate can be null
          const endParsed = v.bondEndDate
            ? parseDateTime(v.bondEndDate)
            : { date: null, time: null };

          return {
            ...v,
            bondStartDateObj: startDate,
            bondStartTimeObj: startTime,
            bondEndDateObj: endParsed.date,
            bondEndTimeObj: endParsed.time,
          };
        });

        setVehicles(vehiclesWithParsedDates);
      })
      .catch(err => {
        console.error("Failed to fetch vehicles:", err);
        setVehicles([]);
      });
  };

  const fetchInactiveVehicles = () => {
    fetch(`${config.BASE_URL}/userVehicle/inactiveVehicles/${id}`)
      .then(res => res.json())
      .then(data => {
        setInactiveVehicles(Array.isArray(data) ? data : []);
      })
      .catch(() => setInactiveVehicles([]));
  };

  // Safe parsing helper for "dd-MM-yyyy hh:mm a" strings
  const parseDateTime = (dateTimeStr) => {
    if (!dateTimeStr || typeof dateTimeStr !== "string") {
      return { date: null, time: null };
    }
    const parsed = parse(dateTimeStr, "dd-MM-yyyy hh:mm a", new Date());
    if (!isValid(parsed)) {
      return { date: null, time: null };
    }
    return { date: parsed, time: parsed };
  };

  // Normalize an inactive DTO to the same shape as active card expects
  const normalizeInactiveToCard = (v) => {
    const { date: sDate, time: sTime } = parseDateTime(v.bondStartDate);
    const { date: eDate, time: eTime } = v.bondEndDate ? parseDateTime(v.bondEndDate) : { date: null, time: null };
    return {
      ...v,
      bondStartDateObj: sDate,
      bondStartTimeObj: sTime,
      bondEndDateObj: eDate,
      bondEndTimeObj: eTime,
      // optional fields may be missing from projection; default them
      // bondAmount: v.bondAmount ?? "",
      // bondWeeks: v.bondWeeks ?? "",
      // note: v.note ?? "",
    };
  };

  // In read-only mode, render ALL vehicles (active + inactive) as cards
  const vehiclesToRender = readOnly
    ? [
        ...vehicles,
        ...inactiveVehicles.map(normalizeInactiveToCard)
      ]
    : vehicles;

  const handleVehicleChange = (index, event) => {
    const { name, value } = event.target;
    setVehicles(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };

  const handleVehicleDateChange = (index, field, value) => {
    setVehicles(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleVehicleSubmit = async (userId, updatedVehicle) => {
    const payload = {
      ...updatedVehicle,
      bondStartDate: isValid(updatedVehicle.bondStartDateObj) && isValid(updatedVehicle.bondStartTimeObj)
        ? `${format(updatedVehicle.bondStartDateObj, "dd-MM-yyyy")} ${format(updatedVehicle.bondStartTimeObj, "hh:mm a")}`
        : "",
      bondEndDate: isValid(updatedVehicle.bondEndDateObj) && isValid(updatedVehicle.bondEndTimeObj)
        ? `${format(updatedVehicle.bondEndDateObj, "dd-MM-yyyy")} ${format(updatedVehicle.bondEndTimeObj, "hh:mm a")}`
        : ""
    };

    try {
      const res = await fetch(`${config.BASE_URL}/userVehicle/updateVehicleInfoToUser/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      if (res.ok) {
        alert(`Vehicle updated successfully`);
        fetchInactiveVehicles();
        fetchVehicles();
      } else if (res.status === 409) {
        alert(`Warning ! ${text}`);
        fetchInactiveVehicles();
        fetchVehicles();
      } else {
        alert(`Error: ${text}`);
      }
    } catch (err) {
      alert(`Something went wrong: ${err.message}`);
    }
  };

  const handleStatusUpdate = async (userVehicleId, newStatus) => {
    try {
      const res = await fetch(`${config.BASE_URL}/userVehicle/updateUserVehicleStatus/${userVehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleStatus: newStatus })
      });

      const text = await res.text();
      if (res.ok) {
        alert(`Vehicle ${userVehicleId} status updated successfully`);
        fetchInactiveVehicles();
        fetchVehicles();
      } else {
        alert(`Error: ${text}`);
      }
    } catch (err) {
      alert(`Failed: ${err.message}`);
    }
  };

  const renderInput = (name, placeholder, value, onChange) => (
    <div className="input-block">
      <label>{placeholder}</label>
      <input
        type="text"
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={readOnly}
        readOnly={readOnly}
      />
    </div>
  );

  return (
    <div className="vehicle-update-container" autoComplete="off">
      <div className="close-button" onClick={() => navigate('/homepage')}>×</div>
      <h1 className="page-header">{readOnly ? "Vehicle Details" : "Update Vehicle Details"}</h1>

      {vehiclesToRender.map((vehicle, index) => (
        <div key={vehicle.userVehicleId || index} className="vehicle-card" autoComplete="off">
          <div className="vehicle-row">
            {renderInput('vehicleMake', 'Make', vehicle.vehicleMake, e => handleVehicleChange(index, e))}
            {renderInput('vehicleModel', 'Model', vehicle.vehicleModel, e => handleVehicleChange(index, e))}
            {renderInput('vehicleYear', 'Year', vehicle.vehicleYear, e => handleVehicleChange(index, e))}
          </div>
          <div className="vehicle-row">
            {renderInput('registrationNumber', 'Registration Number', vehicle.registrationNumber, e => handleVehicleChange(index, e))}
            {renderInput('fuelType', 'Fuel Type', vehicle.fuelType, e => handleVehicleChange(index, e))}
          </div>
          <div className="vehicle-row">
            {renderInput('bondAmount', 'Bond Amount', vehicle.bondAmount, e => handleVehicleChange(index, e))}
            {renderInput('bondWeeks', 'Rent per Week', vehicle.bondWeeks, e => handleVehicleChange(index, e))}
          </div>

          {/* Bond Start Date & Time */}
          <div className="vehicle-row">
            <div className="input-group">
              <label>Start Date <span style={{ color: 'red' }}>*</span></label>
              <DatePicker
                selected={isValid(vehicle.bondStartDateObj) ? vehicle.bondStartDateObj : null}
                onChange={(date) => handleVehicleDateChange(index, "bondStartDateObj", date)}
                dateFormat="dd-MM-yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="Select date"
                className="datepicker-input"
                disabled={readOnly}
              />
            </div>
            <div className="input-group">
              <label>Start Time <span style={{ color: 'red' }}>*</span></label>
              <DatePicker
                selected={isValid(vehicle.bondStartTimeObj) ? vehicle.bondStartTimeObj : null}
                onChange={(time) => handleVehicleDateChange(index, "bondStartTimeObj", time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={5}
                timeCaption="Time"
                dateFormat="hh:mm a"
                placeholderText="Select time"
                className="datepicker-input"
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Bond End Date & Time */}
          <div className="vehicle-row">
            <div className="input-group">
              <label>End Date</label>
              <DatePicker
                selected={isValid(vehicle.bondEndDateObj) ? vehicle.bondEndDateObj : null}
                onChange={(date) => handleVehicleDateChange(index, "bondEndDateObj", date)}
                dateFormat="dd-MM-yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                minDate={vehicle.bondStartDateObj}
                placeholderText="Select date"
                className="datepicker-input"
                disabled={readOnly}
              />
            </div>
            <div className="input-group">
              <label>End Time</label>
              <DatePicker
                selected={isValid(vehicle.bondEndTimeObj) ? vehicle.bondEndTimeObj : null}
                onChange={(time) => handleVehicleDateChange(index, "bondEndTimeObj", time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={5}
                timeCaption="Time"
                dateFormat="hh:mm a"
                placeholderText="Select time"
                className="datepicker-input"
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Status Toggle */}
          <div className="vehicle-row">
            <div className="input-block">
              <label>Status</label>
              <div className="toggle-switch">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={vehicle.vehicleStatus === 'Active'}
                    onChange={e =>
                      handleVehicleChange(index, {
                        target: {
                          name: 'vehicleStatus',
                          value: e.target.checked ? 'Active' : 'InActive'
                        }
                      })
                    }
                    disabled={readOnly}
                  />
                  <span className="slider"></span>
                </label>
                <span className="status-label">{vehicle.vehicleStatus}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="vehicle-row full-width">
            <label>Note</label>
            <textarea
              name="note"
              value={vehicle.note || ''}
              onChange={e => handleVehicleChange(index, e)}
              placeholder="Note"
              disabled={readOnly}
              readOnly={readOnly}
            />
          </div>

          {!readOnly && (
            <div className="vehicle-actions">
              <button onClick={() => handleVehicleSubmit(id, vehicle)}>Update Vehicle #{index + 1}</button>
            </div>
          )}
        </div>
      ))}

      {/* In read-only mode, cards above already show inactive vehicles; hide the old table */}
      {!readOnly && (
        <>
          <h2 style={{ marginTop: '40px' }}>Inactive Vehicles</h2>
          <table className="inactive-vehicle-table" autoComplete="off">
            <thead>
              <tr>
                <th>REGISTRATION NO</th>
                <th>MODEL</th>
                <th>MAKE</th>
                <th>YEAR</th>
                <th>FUEL TYPE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(inactiveVehicles) && inactiveVehicles.length > 0 ? (
                inactiveVehicles.map(v => (
                  <tr key={v.userVehicleId}>
                    <td>{v.registrationNumber}</td>
                    <td>{v.vehicleModel}</td>
                    <td>{v.vehicleMake}</td>
                    <td>{v.vehicleYear}</td>
                    <td>{v.fuelType}</td>
                    <td>
                      <select
                        value={v.vehicleStatus}
                        onChange={(e) => handleStatusUpdate(v.userVehicleId, e.target.value)}
                      >
                        <option value="InActive">InActive</option>
                        <option value="Active">Active</option>
                      </select>
                      <button
                        onClick={() => handleStatusUpdate(v.userVehicleId, v.vehicleStatus)}
                        style={{ marginLeft: '8px' }}
                      >
                        ✅
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6">No inactive vehicles found.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}

      <div className="back-buttonv">
        <button onClick={() => navigate('/homepage')}>Back to Home</button>
      </div>
    </div>
  );
}
