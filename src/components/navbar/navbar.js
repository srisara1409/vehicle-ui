import { React } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbarPage.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem("isAuthenticated") === "true";

  // ✅ Add this function inside the component
  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    navigate('/login');
  };

  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        <div className="nav-logo">ZUBER CAR RENTAL PTY LTD</div>

        <div className="nav-menu">
          {isLoggedIn && <Link to="/homepage">Home</Link>}
          <Link to="/about">About</Link>
          <Link to="/contact">Contact us</Link>
		  <Link to="/register">Sign up / Register</Link>
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
