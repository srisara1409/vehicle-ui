import { React } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbarPage.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isAuthenticated") === "true";

  // ✅ Add this function inside the component
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate('/login');
  };

  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        <div className="nav-logo">Car Leasing</div>

        <div className="nav-menu">
          {isLoggedIn && <Link to="/homepage">Home</Link>}
          <Link to="/register">Sign Up / Register</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        {!isLoggedIn ? (
          <button className="login-button">
            <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
              Sign In / Login
            </Link>
          </button>
        ) : (
          <button className="login-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
