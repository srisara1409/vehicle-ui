import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './login.css';
import config from '../../config';

const Login = () => {
  const [formData, setFormData] = useState({ userName: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${config.BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const message = await response.text();

      if (response.ok && message === "LOGIN_SUCCESS") {
       // localStorage.setItem("isAuthenticated", "true");
         sessionStorage.setItem("isAuthenticated", "true");
      //  sessionStorage.setItem("userName", formData.userName); // Optional: store username

        navigate('/homepage');
      } else if (message === "NOT_ADMIN") {
        alert("You are not authorized to access this page.");
      } else if (message === "INVALID_PASSWORD") {
        alert("Incorrect password.");
      } else if (message === "USER_NOT_FOUND") {
        alert("User does not exist.");
      } else {
        alert("Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error. Please try again.");
    }

    setFormData({ userName: '', password: '' });
  };


  return (
    <div className="login-body">
      <div className="login-container">
        <h2>LOGIN</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="userName">EMAIL/USER NAME</label>
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
          <button type="submit" className="btn-signin" onClick={handleSubmit}>SIGN IN</button>
        </div>
      </div>
    </div>
  );
};

export default Login;