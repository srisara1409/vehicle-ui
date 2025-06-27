import {React} from 'react';
import { Link } from 'react-router-dom';
import './navbarPage.css';

const Navbar = () => {
	return (
	
				<div className="navbar-wrapper">
					<nav className="navbar">
						<div className="nav-logo">Car Leasing</div>
						<div className="nav-menu">
							<Link to="/homepage">Home</Link>
							<Link to="/register">Sign Up / Register</Link>
							<Link to="/about">About</Link>
							<Link to="/contact">Contact Us</Link>
						</div>
						<button className="login-button">
							<Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
								Sign In / Login
							</Link>
						</button>
					</nav>
				</div>
			
	);
};

export default Navbar;
