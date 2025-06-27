import React from 'react';
import './contact.css';

const Contact = () => {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>We would love to hear from you! Reach out to us through the form or contact details below:</p>

      <div className="contact-details">
        <p><strong>Email:</strong> support@carleasing.com</p>
        <p><strong>Phone:</strong> +61 123 456 789</p>
        <p><strong>Address:</strong> 123 King Street, Sydney, NSW 2000</p>
      </div>
    </div>
  );
};

export default Contact;
