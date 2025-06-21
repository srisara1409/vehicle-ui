import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({ userName: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch('http://localhost:8082/todolist/api/v1/user/login', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    setFormData({ userName: '', password: '' });
    navigate('/homepage');
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <h2>LOGIN</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="userName">EMAIL</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">PASSWORD</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            minLength={8}
          />

          <div className="forgot-password">
            <Link to="/register">FORGOT YOUR PASSWORD ?</Link>
          </div>
        </form>

        <div className="login-actions">
          <button type="button" className="btn-register" onClick={() => navigate('/register')}>REGISTER</button>
          <button type="submit" className="btn-signin" onClick={handleSubmit}>SIGN IN</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
