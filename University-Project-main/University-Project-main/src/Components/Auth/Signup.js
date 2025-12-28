import React, { useState, useEffect } from 'react';
import './Signup.css';
import { Link, useNavigate } from 'react-router-dom';
import Login from './Login.js';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaIdCard, FaEye, FaEyeSlash } from 'react-icons/fa';

import logosvg from '../../Assets/svg.svg';
import { httpRequest } from '../../api/http.js';
import { getCities } from '../../constants/locations.js';
const Signup = ({ onSignup }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cnic: '',
    city: '',
    employeeId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    document.body.classList.add('signup-bg');
    return () => document.body.classList.remove('signup-bg');
  }, []);

  const pakistanCities = getCities('Pakistan');


  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
    }
    if (name === 'phone') {
      if (!/^03\d{9}$/.test(value)) error = 'Phone must be 11 digits, start with 03';
    }
    if (name === 'cnic') {
      if (!/^\d{5}-\d{7}-\d{1}$/.test(value)) error = 'CNIC must be XXXXX-XXXXXXX-X';
    }
    if (name === 'employeeId') {
      if (!/^AUTO-\d{4}$/.test(value)) error = 'Employee ID must be in format AUTO-0001';
    }
    if (name === 'password') {
      if (!/^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(value)) {
        error = 'Min 8 chars, include number and special character';
      }
    }
    return error;
  };

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    // Validate all fields
    const newFieldErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const err = validateField(key, value);
      if (err) newFieldErrors[key] = err;
    });
    setFieldErrors(newFieldErrors);
    
    if (Object.keys(newFieldErrors).length > 0) {
      setError('Please fix the errors above');
      setLoading(false);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (!formData.city) {
      setError('Please select a city');
      setLoading(false);
      return;
    }
    
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        employeeId: formData.employeeId,
        password: formData.password,
        phone: formData.phone,
        cnic: formData.cnic,
        city: formData.city
      };
      const res = await httpRequest('/auth/register', { method: 'POST', body: payload });
      setSuccess('Signup successful! Redirecting to login...');
      onSignup && onSignup({ message: 'User created' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      cnic: '',
      city: '',
      employeeId: ''
    });
    setError('');
    setSuccess('');
    setFieldErrors({});
    setTouched({});
  };

  return (
    <div className="signup-container">
      <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', margin: '10px 0px', width: '100%', maxWidth: '1200px' }}>
        <div className="card flex-row w-100 h-100 p-0" >
          {/* Form Section */}
          <div className="form-section d-flex flex-column justify-content-center p-5" style={{ flex: 1 }}>
            <form onSubmit={handleSubmit} className="w-100" autoComplete="off" aria-label="Signup form">
              <div className="mb-3">
                <label htmlFor="name" className="form-label" style={{ display: 'block', marginBottom: 4 }}><FaUser className="me-2" />Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${fieldErrors.name && touched.name ? 'is-invalid' : ''}`}
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChanges}
                    onBlur={handleBlur}
                    required
                    autoFocus
                    aria-required="true"
                    aria-invalid={!!fieldErrors.name}
                    style={{ width: '100%' }}
                  />
                </div>
                {fieldErrors.name && touched.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
              </div>
              <div className="mb-3 row">
                <div className="col-md-6">
                  <label htmlFor="employeeId" className="form-label"><FaIdCard className="me-2" />Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    className={`form-control ${fieldErrors.employeeId && touched.employeeId ? 'is-invalid' : ''}`}
                    id="employeeId"
                    placeholder="Enter Emp No. e.g. AUTO-0001"
                    value={formData.employeeId}
                    onChange={handleChanges}
                    onBlur={handleBlur}
                    required
                    aria-required="true"
                    aria-invalid={!!fieldErrors.employeeId}
                    style={{ width: '100%' }}
                  />
                  {fieldErrors.employeeId && touched.employeeId && <div className="invalid-feedback">{fieldErrors.employeeId}</div>}
                </div>
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label"><FaEnvelope className="me-2" />Email</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${fieldErrors.email && touched.email ? 'is-invalid' : ''}`}
                    id="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChanges}
                    onBlur={handleBlur}
                    required
                    aria-required="true"
                    aria-invalid={!!fieldErrors.email}
                    style={{ width: '100%' }}
                  />
                  {fieldErrors.email && touched.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
                </div>
              </div>
              <div className="mb-3 row">
                <div className="col-md-6 position-relative">
                  <label htmlFor="password" className="form-label"><FaLock className="me-2" />Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className={`form-control ${fieldErrors.password && touched.password ? 'is-invalid' : ''}`}
                      id="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChanges}
                      onBlur={handleBlur}
                      required
                      aria-required="true"
                      aria-invalid={!!fieldErrors.password}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <span
                      className="eye-icon-inside"
                      onClick={() => setShowPassword(v => !v)}
                      tabIndex={0}
                      role="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setShowPassword(v => !v)}
                      style={{ position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', cursor: 'pointer', color: '#000000', fontSize: '1.2rem' }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {fieldErrors.password && touched.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
                </div>
                <div className="col-md-6 position-relative">
                  <label htmlFor="confirmPassword" className="form-label conform-password"><FaLock className="me-2" />Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      className={`form-control ${fieldErrors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChanges}
                      onBlur={handleBlur}
                      required
                      aria-required="true"
                      aria-invalid={!!fieldErrors.confirmPassword}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <span
                      className="eye-icon-inside"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      tabIndex={0}
                      role="button"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setShowConfirmPassword(v => !v)}
                      style={{ position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', cursor: 'pointer', color: '#000000', fontSize: '1.2rem' }}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {fieldErrors.confirmPassword && touched.confirmPassword && <div className="invalid-feedback">{fieldErrors.confirmPassword}</div>}
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="city" className="form-label">City</label>
                <select
                    name="city"
                    className={`form-control ${fieldErrors.city && touched.city ? 'is-invalid' : ''}`}
                    id="city"
                    value={formData.city}
                    onChange={handleChanges}
                    onBlur={handleBlur}
                    required
                    aria-required="true"
                    aria-invalid={!!fieldErrors.city}
                    size={5}   // 👈 shows only 5 cities at a time
                  >
                    {pakistanCities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                {fieldErrors.city && touched.city && <div className="invalid-feedback">{fieldErrors.city}</div>}
              </div>
              <div className="mb-3 row">
                <div className="col-md-6">
                  <label htmlFor="phone" className="form-label"><FaPhone className="me-2" />Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className={`form-control ${fieldErrors.phone && touched.phone ? 'is-invalid' : ''}`}
                    id="phone"
                    placeholder="03XXXXXXXXX"
                    value={formData.phone}
                    onChange={handleChanges}
                    onBlur={handleBlur}
                    required
                    aria-required="true"
                    aria-invalid={!!fieldErrors.phone}
                  />
                  {fieldErrors.phone && touched.phone && <div className="invalid-feedback">{fieldErrors.phone}</div>}
                </div>
                <div className="col-md-6">
                  <label htmlFor="cnic" className="form-label"><FaIdCard className="me-2" />CNIC</label>
                  <input
                    type="text"
                    name="cnic"
                    className={`form-control ${fieldErrors.cnic && touched.cnic ? 'is-invalid' : ''}`}
                    id="cnic"
                    placeholder="XXXXX-XXXXXXX-X"
                    value={formData.cnic}
                    onChange={handleChanges}
                    onBlur={handleBlur}
                    required
                    aria-required="true"
                    aria-invalid={!!fieldErrors.cnic}
                  />
                  {fieldErrors.cnic && touched.cnic && <div className="invalid-feedback">{fieldErrors.cnic}</div>}
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading} aria-disabled={loading} style={{ fontWeight: 600, letterSpacing: 1, position: 'relative' }}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : null}
                Signup
              </button>
              <button type="button" className="btn btn-secondary w-100 mb-3" onClick={handleReset} disabled={loading} aria-disabled={loading}>Reset</button>
              {error && <div className="alert alert-danger text-center py-2" role="alert" aria-live="assertive">{error}</div>}
              {success && <div className="alert alert-success text-center py-2" role="alert" aria-live="polite">{success}</div>}
              <p className="text-center mt-3">
                Already have an account? <Link to="/login" className="text-primary" style={{ listStyleType: 'none', textDecoration: 'none', color: '#252129' }}>Login here</Link>
              </p>
            </form>
          </div>
          {/* Divider */}
          <div className="vertical-divider d-none d-md-block"></div>
          {/* Illustration Section */}
          <div className="illustration-section d-none d-md-flex align-items-center justify-content-center" style={{ flex: 1, background: 'transparent' }}>
            <img src={logosvg} alt="Illustration"  />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
