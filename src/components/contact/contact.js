import React from 'react';
import './contact.css';

const Contact = () => {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>We would love to hear from you! Reach out to us through the form or contact details below:</p>

      <div className="contact-details">
        <p><strong>Email:</strong> support@zubercarleasing.com</p>
        <p><strong>Phone:</strong> +61 413 376 559 / +61 469 048 855</p>
        <p><strong>Address:</strong> 247 Rawson St, Auburn, NSW, 2144</p>
      </div>
    </div>
  );
};

export default Contact;
