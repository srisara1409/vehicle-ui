import React from "react";
import './footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-top">
      <p>©2025 Zuber Car Rental Pty Ltd. ABN xx xxx xxx xxx. All rights reserved.</p>
      <div className="footer-links">
        {/* <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        <span>|</span> */}
        {/* <a href="/terms-of-use" target="_blank" rel="noopener noreferrer">Terms of Use</a> */}
        {/* <span>|</span> */}
        {/* <a href="/contact" target="_blank" rel="noopener noreferrer">Contact</a> */}
      </div>
    </div>

    <div className="footer-bottom">
      <p>Developed & maintained by RGTech Solutions</p>
      <div className="social-icons">
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <i className="fab fa-facebook-f"></i>
        </a>
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <i className="fab fa-instagram"></i>
        </a>
        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <i className="fab fa-linkedin-in"></i>
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
