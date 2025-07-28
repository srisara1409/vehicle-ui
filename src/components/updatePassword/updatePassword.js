import React, { useState } from 'react';
import axios from 'axios';
import './updatePassword.css'; // Optional: style file
import config from '../../config';

export default function UpdatePassword() {
  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await axios.post(`${config.BASE_URL}/admin/verifyEmail`, { email }); // adjust your backend URL
      if (res.data === 'VALID') {
        setEmailVerified(true);
      } else {
        setError('Email not found.');
      }
    } catch (err) {
      setError('Server error. Try again later.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.post(`${config.BASE_URL}/admin/resetPassword`, {
        email,
        password,
      });

      if (res.status === 200) {
        setMessage('Password updated successfully.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setEmailVerified(false);
      } else {
        setError('Failed to update password.');
      }
    } catch (err) {
      setError('Server error. Try again.');
    }
  };

  return (
    <div className="update-password-container">
      <h2>Reset Password</h2>

      {!emailVerified ? (
        <form onSubmit={handleEmailSubmit}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Verify Email</button>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit}>
          <label>New Password:</label>
          <input
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
      )}

      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

