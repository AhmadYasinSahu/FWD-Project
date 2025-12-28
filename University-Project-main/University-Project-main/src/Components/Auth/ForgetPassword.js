import React, { useState } from 'react';
import './ForgetPassword.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaIdCard, FaPhone } from 'react-icons/fa';
import airlogo from '../../Assets/airlogo.png';
import logosvg from '../../Assets/svg.svg';
import { httpRequest } from '../../api/http.js';
function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    // Validate fields (email is required for backend)
    if (!email) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    try {
      const resp = await httpRequest('/auth/forgot-password', { method: 'POST', body: { email } });
      const msg = resp?.message || 'Password reset link sent to your email!';
      // In development, backend may return debugResetUrl for quick testing
      if (resp?.debugResetUrl) {
        setSuccess(`${msg} Debug link: ${resp.debugResetUrl}`);
      } else {
        setSuccess(msg);
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="forget-password-container">
      <div className="forget-password-card">
        {/* Form Section */}
        <div className="forget-password-form-section">
          <div className="forget-password-header">
            <img src={airlogo} alt="Air University Logo" className="logo" />
            <h2 className="forget-password-title">Forgot Password</h2>
            <p className="forget-password-subtitle">
              Enter your details to receive a password reset link
            </p>
          </div>
          
          <form className='forget-password-form' onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <FaEnvelope className="label-icon" />
                Email Address
              </label>
              <input 
                className='form-input' 
                type="email" 
                name="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <FaIdCard className="label-icon" />
                CNIC
              </label>
              <input 
                className='form-input' 
                type="text" 
                name="cnic" 
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="XXXXX-XXXXXXX-X"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <FaPhone className="label-icon" />
                Contact Number
              </label>
              <input  
                className='form-input' 
                type="tel" 
                name="contact" 
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="03XXXXXXXXX"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <button 
              type="submit" 
              className='submit-button'
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
          
          <div className="forget-password-footer">
            <p>
              Remembered your password? <Link to="/login" className="login-link">Login here</Link>
            </p>
          </div>
        </div>
        
        {/* Vertical Divider */}
        <div className="forget-password-divider"></div>
        
        {/* Illustration Section */}
        <div className="forget-password-illustration">
          <img src={logosvg} alt="Air University Logo" className="illustration-logo" />
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;