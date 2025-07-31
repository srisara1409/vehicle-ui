  import React, { useState } from 'react';
  import './contactPage.css';
  import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

  const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.name || !formData.email || !formData.message) {
        alert("Please fill in all fields.");
        return;
      }
      console.log("Form submitted:", formData);
      setFormSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    };

    return (
      <div className="contact-page">
        <h1>Contact Us</h1>
        <p className="subtitle">We’d love to hear from you. Reach out using the details or form below:</p>

        <div className="contact-grid">
          {/* Left: Contact Info + Form */}
          <div className="contact-left">
            <div className="contact-details">
              <p><FaEnvelope className="icon" /><strong>Email:</strong>&nbsp;support@zubercarleasing.com</p>
              <p><FaPhone className="icon" /><strong>Phone:</strong>&nbsp;+61 439 233 004</p>
              <p><FaMapMarkerAlt className="icon" /><strong>Address:</strong>&nbsp;247 Rawson St, Auburn, NSW, 2144</p>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} />
              <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} />
              <textarea name="message" placeholder="Your Message" value={formData.message} onChange={handleChange}></textarea>
              <button type="submit">Submit</button>
              {formSubmitted && <p className="success-message">Thank you! We’ll be in touch shortly.</p>}
            </form>
          </div>

          {/* Right: Google Map */}
          <div className="map-container">
            <iframe
              title="Zuber Car Rental Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3311.052928694087!2d151.0272908754749!3d-33.84657397320614!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12bb44a0b7fcd5%3A0x2b5c88dfbda292e!2s247%20Rawson%20St%2C%20Auburn%20NSW%202144%2C%20Australia!5e0!3m2!1sen!2sau!4v1720123123456!5m2!1sen!2sau"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    );
  };

  export default Contact;
