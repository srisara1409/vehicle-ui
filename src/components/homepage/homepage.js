import { React, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./homepage.css";

export default function Homepage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const navigate = useNavigate();
  const [formInputs, setFormInputs] = useState({
    bondAmount: '',
    bondWeeks: '',
    bondStartDate: '',
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
    const { bondAmount, bondWeeks, bondStartDate, make, year, model, registrationNumber, fuelType, note } = formInputs;

    await fetch(`http://localhost:8080/vehicle/approve/${selectedVehicle.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bondAmount, bondWeeks, bondStartDate, make, year, model, registrationNumber, fuelType, note }),
    });

    alert("Approved and PDF sent to user.");
    setShowModal(false);
    setFormInputs({ bondAmount: '', bondWeeks: '', bondStartDate: '', make: '', year: '', model: '', registrationNumber: '', fuelType: '', note: '' });
    refreshList();
  };

  const handleUpdate = (vehicle) => {
    // window.open(`/update/${vehicle.id}`, '/updatePage');
    navigate(`/update/${vehicle.id}`, { state: vehicle });
  };

  const handleTransfer = (vehicle) => {
    alert(`Transfer clicked for ${vehicle.name} (ID: ${vehicle.id})`);
    // Add logic to transfer ownership or assign user
  };

  const refreshList = () => {
    fetch('http://localhost:8080/vehicle/getUser')
      .then((res) => res.json())
      .then((data) => setVehicles(data));
  };

  // Group by status
  const grouped = {
    Pending: vehicles.filter(v => v.status === 'PENDING'),
    Approved: vehicles.filter(v => v.status === 'APPROVED'),
    Closed: vehicles.filter(v => v.status === 'CLOSED'),
  };

  return (
    <div className="homepage-body">
      <div className="page-wrapper">
        <h1>User Vehicle Requests</h1>

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
                      <th>License #</th>
                      <th>Email</th>
                      <th>License Copy</th>
                      <th>Passport</th>
                      <th>Bank Statement</th>
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
                          {v.status === 'PENDING' && (
                            <button className="action-btn btn-approve" onClick={() => handleApprove(v)}>Approve</button>
                          )}
                          {v.status === 'APPROVED' && (
                            <>
                              <button className="action-btn btn-update" onClick={() => handleUpdate(v)}>Update</button>
                              <button className="action-btn btn-transfer" onClick={() => handleTransfer(v)}>Transfer</button>
                            </>
                          )}
                          {v.status === 'CLOSED' && <span>Closed</span>}
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

        <div className="row">
          <div className="input-group">
            <label>Rental Bond Amount</label>
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
            <input type="text" value={formInputs.bondStartDate} onChange={e => setFormInputs({ ...formInputs, bondStartDate: e.target.value })} />
          </div>
          <div className="input-group">
            <label>End Date</label>
            <input type="text" value={formInputs.bondEndDate || ''} onChange={e => setFormInputs({ ...formInputs, bondEndDate: e.target.value })} />
          </div>
        </div>

        <div className="row">
          <div className="input-group">
            <label>Registration Number</label>
            <input type="text" value={formInputs.registrationNumber} onChange={e => setFormInputs({ ...formInputs, registrationNumber: e.target.value })} />
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
          <button className="btn confirm-btn" onClick={onSubmit}>Confirm</button>
          <button className="btn cancel-btn" onClick={onCancel}>Cancel</button>
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

const tdStyle = {
  border: '1px solid #ddd',
  padding: '8px',
};
