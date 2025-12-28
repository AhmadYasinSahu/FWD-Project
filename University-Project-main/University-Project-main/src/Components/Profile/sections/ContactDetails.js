import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';
import './ContactDetails.css';

const ContactDetails = ({ onNext, onBack, formData, setFormData }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Contact details saved:', formData);
  };

  const handleNext = () => {
    handleSave();
    onNext();
  };

  return (
    <div className="contact-details-section">
      <h2 className="section-title">Contact Information</h2>
      
      <form className="profile-form">
        <div className="form-row">
          <div className="form-group">
            <label><FaEnvelope /> Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
            />
          </div>
          <div className="form-group">
            <label><FaPhone /> Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><FaPhone /> Alternative Phone</label>
            <input
              type="tel"
              name="alternativePhone"
              value={formData.alternativePhone}
              onChange={handleInputChange}
              placeholder="Enter alternative phone number"
            />
          </div>
          <div className="form-group">
            <label><FaGlobe /> Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="Enter website URL"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label><FaMapMarkerAlt /> Current Address *</label>
            <textarea
              name="currentAddress"
              value={formData.currentAddress}
              onChange={handleInputChange}
              placeholder="Enter your current address"
              rows="3"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter city"
              required
            />
          </div>
          <div className="form-group">
            <label>State/Province *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="Enter state/province"
              required
            />
          </div>
          <div className="form-group">
            <label>Postal Code *</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="Enter postal code"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Country *</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select Country</option>
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="India">India</option>
              <option value="China">China</option>
              <option value="Japan">Japan</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Emergency Contact Name</label>
            <input
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleInputChange}
              placeholder="Enter emergency contact name"
            />
          </div>
          <div className="form-group">
            <label>Emergency Contact Phone</label>
            <input
              type="tel"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleInputChange}
              placeholder="Enter emergency contact phone"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Relationship to Emergency Contact</label>
            <select
              name="emergencyContactRelationship"
              value={formData.emergencyContactRelationship}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select Relationship</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="colleague">Colleague</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </form>

      <div className="navigation-buttons">
        <div className="left-buttons">
          <button className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
        </div>
        <div className="right-buttons">
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn-success" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
