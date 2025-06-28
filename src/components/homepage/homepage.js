import { React, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./homepage.css";
import "./approvePage.css"
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

export default function Homepage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [formInputs, setFormInputs] = useState({
    bondAmount: '',
    bondWeeks: '',
    bondStartDate: null,
    bondEndDate: null,
    make: '',
    model: '',
    registrationNumber: '',
    year: '',
    fuelType: '',
    note: ''
  });
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/vehicle/getUser')
      .then((res) => res.json())
      .then((data) => setVehicles(data))
      .catch((err) => console.error('Error fetching data:', err));
  }, []);

  const handleApprove = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  //console.log("===================>",selectedVehicle.id);

  const handleModalSubmit = async () => {
    const { bondAmount, bondWeeks, make, year, model, registrationNumber, fuelType, note } = formInputs;

    const bondStartDate = formInputs.bondStartDate
      ? format(formInputs.bondStartDate, 'dd-MM-yyyy')
      : '';
    const bondEndDate = formInputs.bondEndDate
      ? format(formInputs.bondEndDate, 'dd-MM-yyyy')
      : '';

    await fetch(`http://localhost:8080/vehicle/approve/${selectedVehicle.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bondAmount, bondWeeks, bondStartDate, bondEndDate, make, year, model, registrationNumber, fuelType, note }),
    });

    alert("Approved and PDF sent to user.");
    setShowModal(false);
    setFormInputs({ bondAmount: '', bondWeeks: '', bondStartDate: '', bondEndDate: '', make: '', year: '', model: '', registrationNumber: '', fuelType: '', note: '' });
    refreshList();
  };

  const handleUpdate = (vehicle) => {
    // window.open(`/update/${vehicle.id}`, '/updatePage');
    navigate(`/update/${vehicle.id}`, { state: vehicle });
  };

  const handleTransfer = () => {
    window.open('https://account.service.nsw.gov.au/', '_blank');
  };

  const refreshList = () => {
    fetch('http://localhost:8080/vehicle/getUser')
      .then((res) => res.json())
      .then((data) => setVehicles(data));
  };

  // 🔍 Filter logic: includes first name, last name, or license number
  const filteredVehicles = vehicles.filter(v => {
    const term = searchText.toLowerCase();
    return (
      v.firstName.toLowerCase().includes(term) ||
      v.lastName.toLowerCase().includes(term) ||
      v.licenseNumber.toLowerCase().includes(term) ||
      v.email.toLowerCase().includes(term)
    );
  });

  // Group by status
  const grouped = {
    Pending: filteredVehicles.filter(v => v.status === 'PENDING'),
    Approved: filteredVehicles.filter(v => v.status === 'APPROVED'),
    Closed: filteredVehicles.filter(v => v.status === 'CLOSED'),
  };

  return (
    <div className="homepage-body">
      <div className="page-wrapper">
        <h1>User Vehicle Requests</h1>

        {/* Search & Filter Row */}
        <div className="search-filter-row">
          <input
            type="text"
            placeholder="Search by"
            className="search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button className="filter-btn" onClick={() => setSearchText('')}>Clear</button>
        </div>

        {['Pending', 'Approved', 'Closed'].map((status) => (
          <section key={status} style={{ marginTop: '30px' }}>
            <h2 >{status} Requests</h2>
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
                      <th>License No</th>
                      <th>Email</th>
                      <th>License Copy</th>
                      <th>Passport</th>
                      <th>Bank Statement</th>
                      <th>Signature</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[status].map((v) => (
                      <tr key={v.id} >
                        <td>{v.id}</td>
                        <td>{v.firstName}</td>
                        <td>{v.lastName}</td>
                        <td>{v.dateOfBirth}</td>
                        <td>{v.mobileNumber}</td>
                        <td>{v.licenseNumber}</td>
                        <td>{v.email}</td>
                        <td><a href={`http://localhost:8080/register/file/${v.id}/license`} target="_blank" rel="noopener noreferrer" title="View uploaded license" >
                          License
                        </a></td>
                        <td>
                          <a href={`http://localhost:8080/register/file/${v.id}/passport`} target="_blank" rel="noopener noreferrer" title="View uploaded passport">
                            Passport
                          </a></td>
                        <td>
                          <a href={`http://localhost:8080/register/file/${v.id}/bankpdf`} target="_blank" rel="noopener noreferrer" title="View uploaded bank details">
                            Bank Statement
                          </a>
                        </td>
                        <td>
                          <img
                            src={`http://localhost:8080/register/file/${v.id}/signature`}
                            alt="Signature"
                            style={{ width: '100px', height: 'auto' }}
                          />
                        </td>
                        <td>
                          {v.status === 'PENDING' && (
                            <button className="action-btn btn-approve" onClick={() => handleApprove(v)}>Approve</button>
                          )}
                          {v.status === 'APPROVED' && (() => {
                            if (!v.bondEndDate) return (
                              <>
                                <button className="action-btn btn-update" onClick={() => handleUpdate(v)}>Update</button>
                                <button className="action-btn btn-transfer" onClick={(handleTransfer)}>Transfer</button>
                              </>
                            );
                      
                          })()}

                          {(v.status === 'CLOSED') && <span>Closed</span>}

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
            onSubmit={handleModalSubmit}
            onCancel={() => {
              setShowModal(false);
              setFormInputs({
                bondAmount: '',
                bondWeeks: '',
                bondStartDate: '',
                bondEndDate: '',
                registrationNumber: '',
                rentDuration: '',
                make: '',
                model: '',
                year: '',
                fuelType: '',
                note: ''
              });
            }}
          />
        )}
      </div>
    </div>

  );
}

function ApproveModal({ formInputs, setFormInputs, onSubmit, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="modal-title">Approve Request</h3>
        <div className="close-button" onClick={onCancel}>×</div> {/* Add this */}
        <div className="row" >
          <div className="input-group">
            <label>Bond Amount</label>
            <input type="text" value={formInputs.bondAmount} onChange={e => setFormInputs({ ...formInputs, bondAmount: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Rent per Week</label>
            <input type="text" value={formInputs.bondWeeks} onChange={e => setFormInputs({ ...formInputs, bondWeeks: e.target.value })} />
          </div>
        </div>

        <div className="row">
          <div className="input-group">
            <label>Start Date</label>
            <DatePicker
              selected={formInputs.bondStartDate}
              onChange={(date) => setFormInputs({ ...formInputs, bondStartDate: date })}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select start date"
              className="datepicker-input"
            />
          </div>
          <div className="input-group">
            <label>End Date</label>
            <DatePicker
              selected={formInputs.bondEndDate}
              onChange={(date) => setFormInputs({ ...formInputs, bondEndDate: date })}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select end date"
              className="datepicker-input"
            />
          </div>
        </div>

        <div className="row">
          <div className="input-group">
            <label>Registration Number</label>
            <input type="text" value={formInputs.registrationNumber || ''} onChange={e => setFormInputs({ ...formInputs, registrationNumber: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Rent Duration</label>
            <input type="text" value={formInputs.rentDuration || ''} onChange={e => setFormInputs({ ...formInputs, rentDuration: e.target.value })} />
          </div>
        </div>

        <div className="row">
          <div className="input-group">
            <label>Make</label>
            <input type="text" value={formInputs.make} onChange={e => setFormInputs({ ...formInputs, make: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Model</label>
            <input type="text" value={formInputs.model} onChange={e => setFormInputs({ ...formInputs, model: e.target.value })} />
          </div>
        </div>

        <div className="row">
          <div className="input-group">
            <label>Year</label>
            <input type="text" value={formInputs.year} onChange={e => setFormInputs({ ...formInputs, year: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Fuel Type</label>
            <input type="text" value={formInputs.fuelType} onChange={e => setFormInputs({ ...formInputs, fuelType: e.target.value })} />
          </div>
        </div>

        <div className="row">
          <div className="input-group full-width">
            <label>Comments</label>
            <textarea rows="3" value={formInputs.note} onChange={e => setFormInputs({ ...formInputs, note: e.target.value })}></textarea>
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


/* const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '10px',
}; */

const thStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  backgroundColor: '#f2f2f2',
  textAlign: 'left',
};
