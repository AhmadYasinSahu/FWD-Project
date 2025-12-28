import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaExclamationCircle, FaCheck, FaPlus, FaChevronDown, FaChevronUp, FaGraduationCap } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './EmploymentInformation.css';
import airlogo from '../../Assets/airlogo.png';
import ProgressTracker from './shared/ProgressTracker.jsx';
import { countryList, getCities } from '../../constants/locations.js';
import { httpRequest } from '../../api/http.js';

const EmploymentInformation = () => {
  const navigate = useNavigate();
  const [isPageLoading, setIsPageLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsPageLoading(false), 900);
    return () => clearTimeout(t);
  }, []);
  // Ensure view starts at top when this page loads
  useEffect(() => {
    try {
      const scrollContainer = document.querySelector('.main-content');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'auto' });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch {}
  }, []);

  // Empty-state vs wizard visibility
  const [showEmploymentWizard, setShowEmploymentWizard] = useState(false);

  // Wizard section control (-1 closed, otherwise 0..2)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});

  const [savedEmployments, setSavedEmployments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  // Aggregate employment form data
  const [employmentData, setEmploymentData] = useState({
    // Section 1 - Employment Details
    organizationType: 'ACADEMIC',
    country: '',
    sector: '',
    category: '',
    employerName: '',
    centers: '',
    employmentType: '', // kept for future use
    department: '', // kept for future use
    // Section 2 - Organization Details
    organizationName: '',
    organizationCountry: '',
    organizationCity: '',
    // Section 2 - Employment Address Details
    addressCountry: '',
    addressCity: '',
    addressLine: '',
    contactCountryCode: '+92',
    contactNumber: '',
    officeEmail: '',
    website: '',
    // Section 3 - Duration
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    // Section 3 - Job Details
    jobType: '',
    jobTitle: '',
    fieldOfWork: '',
    careerLevel: '',
    jobDescription: ''
  });

  const formatDate = (d) => {
    if (!d) return '';
    try {
      return String(d).substring(0, 10);
    } catch {
      return '';
    }
  };

  // Validation functions
  const validateField = (name, value) => {
    const errors = {};
    
    if (name === 'country' && !value) {
      errors.country = 'Country is required';
    }
    if (name === 'sector' && !value) {
      errors.sector = 'Sector is required';
    }
    if (name === 'category' && !value) {
      errors.category = 'Category is required';
    }
    if (name === 'employerName' && !value) {
      errors.employerName = 'Employer Name is required';
    }
    if (name === 'addressCountry' && !value) {
      errors.addressCountry = 'Address Country is required';
    }
    if (name === 'addressCity' && !value) {
      errors.addressCity = 'Address City is required';
    }
    if (name === 'jobType' && !value) {
      errors.jobType = 'Job Type is required';
    }
    if (name === 'jobTitle' && !value) {
      errors.jobTitle = 'Job Title is required';
    }
    if (name === 'fieldOfWork' && !value) {
      errors.fieldOfWork = 'Field of Work is required';
    }
    if (name === 'careerLevel' && !value) {
      errors.careerLevel = 'Career Level is required';
    }
    if (name === 'startDate' && !value) {
      errors.startDate = 'Start Date is required';
    }
    if (name === 'endDate' && !value && !employmentData.currentlyWorking) {
      errors.endDate = 'End Date is required unless currently working';
    }
    
    return errors;
  };

  const isSectionComplete = (sectionIndex) => {
    switch (sectionIndex) {
      case 0: // Employment Details
        return employmentData.country && employmentData.sector && employmentData.category && employmentData.employerName;
      case 1: // Employment Address Details
        return employmentData.addressCountry && employmentData.addressCity;
      case 2: // Job Details
        return employmentData.jobType && employmentData.jobTitle && employmentData.fieldOfWork && 
               employmentData.careerLevel && employmentData.startDate && 
               (employmentData.currentlyWorking || employmentData.endDate);
      default:
        return false;
    }
  };

  // Load existing employments on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await httpRequest('/research/employment');
        const list = Array.isArray(res?.data) ? res.data : [];
        setSavedEmployments(list);
      } catch (e) {
        if (e?.status === 401) {
          navigate('/login');
          return;
        }
        setApiError(e?.message || 'Unable to load saved employment');
      }
    })();
  }, [navigate]);

  const validateForSubmit = () => {
    const required = [
      'country',
      'sector',
      'category',
      'employerName',
      'jobType',
      'jobTitle',
      'fieldOfWork',
      'careerLevel',
      'startDate',
    ];
    if (!employmentData.currentlyWorking) required.push('endDate');

    let nextErrors = {};
    for (const field of required) {
      const value = employmentData[field];
      nextErrors = { ...nextErrors, ...validateField(field, value) };
    }
    setValidationErrors(nextErrors);

    // Jump to first incomplete section if needed
    if (Object.keys(nextErrors).length > 0) {
      const firstIncomplete = [0, 1, 2].find((idx) => !isSectionComplete(idx));
      if (typeof firstIncomplete === 'number') setActiveSectionIndex(firstIncomplete);
      return false;
    }
    return true;
  };

  const saveEmploymentToBackend = async () => {
    setApiError('');
    setApiSuccess('');
    if (!validateForSubmit()) {
      setApiError('Please fill all required employment fields.');
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        ...employmentData,
        endDate: employmentData.currentlyWorking ? null : employmentData.endDate,
      };
      const res = await httpRequest('/research/employment', { method: 'POST', body: payload });
      setApiSuccess(res?.message || 'Employment information saved');
      if (res?.data) setSavedEmployments((prev) => [res.data, ...prev]);
      setShowEmploymentWizard(false);

      // Reset wizard data for next add
      setEmploymentData({
        organizationType: 'ACADEMIC',
        country: '',
        sector: '',
        category: '',
        employerName: '',
        centers: '',
        employmentType: '',
        department: '',
        organizationName: '',
        organizationCountry: '',
        organizationCity: '',
        addressCountry: '',
        addressCity: '',
        addressLine: '',
        contactCountryCode: '+92',
        contactNumber: '',
        officeEmail: '',
        website: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        jobType: '',
        jobTitle: '',
        fieldOfWork: '',
        careerLevel: '',
        jobDescription: ''
      });
      setActiveSectionIndex(0);
      return true;
    } catch (err) {
      setApiError(err.message || 'Failed to save employment');
      return false;
    } finally {
      setSaving(false);
    }
  };





  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    
    // Update the data
    setEmploymentData((prev) => {
      const nextState = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      if (name === 'organizationType' && value === 'PROFESSIONAL') {
        nextState.centers = '';
      }
      return nextState;
    });
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Validate the field
    const fieldErrors = validateField(name, type === 'checkbox' ? checked : value);
    if (Object.keys(fieldErrors).length > 0) {
      setValidationErrors(prev => ({ ...prev, ...fieldErrors }));
    }
  };

  const gotoNextSection = () => setActiveSectionIndex((prev) => (prev < 0 ? 0 : Math.min(prev + 1, 2)));
  const gotoPrevSection = () => setActiveSectionIndex((prev) => Math.max(prev - 1, 0));

  const toggleSection = (index) => {
    setActiveSectionIndex((prev) => (prev === index ? -1 : index));
    // After state updates, ensure the header of the opened section scrolls into view from the top
    requestAnimationFrame(() => {
      try {
        const headers = document.querySelectorAll('.accordion-section .accordion-header');
        const targetHeader = headers[index];
        if (targetHeader && typeof targetHeader.scrollIntoView === 'function') {
          targetHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch {}
    });
  };

  // Keep a simple safety: if active section changes programmatically, scroll to its header
  useEffect(() => {
    if (activeSectionIndex >= 0) {
      const id = requestAnimationFrame(() => {
        try {
          const headers = document.querySelectorAll('.accordion-section .accordion-header');
          const targetHeader = headers[activeSectionIndex];
          if (targetHeader && typeof targetHeader.scrollIntoView === 'function') {
            targetHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } catch {}
      });
      return () => cancelAnimationFrame(id);
    }
  }, [activeSectionIndex]);

  // When wizard first shows, ensure we start at the first section's top
  useEffect(() => {
    if (showEmploymentWizard) {
      try {
        const firstHeader = document.querySelector('.accordion-section .accordion-header');
        if (firstHeader && typeof firstHeader.scrollIntoView === 'function') {
          firstHeader.scrollIntoView({ behavior: 'auto', block: 'start' });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
      } catch {}
    }
  }, [showEmploymentWizard]);

  const handleSaveAndClose = () => {
    saveEmploymentToBackend().then((ok) => {
      if (ok) navigate('/dashboard');
    });
  };

  const handleFinalNext = () => {
    saveEmploymentToBackend().then((ok) => {
      if (ok) navigate('/research-grant-application');
    });
  };

  const handleStepClick = (stepId) => {
    if (stepId === 1) {
      navigate('/research-grants');
    } else if (stepId === 2) {
      navigate('/personal-information');
    } else if (stepId === 3) {
      navigate('/educational-information');
    }
  };

  const steps = [
    { id: 1, title: 'Research Grant', completed: true, path: '/research-grants' },
    { id: 2, title: 'Personal Information', completed: true, path: '/personal-information' },
    { id: 3, title: 'Educational Information', completed: true, path: '/educational-information' },
    { id: 4, title: 'Employment Information', completed: false, active: true, path: '/employment-information' },
    { id: 5, title: 'Research Grant Application Form', completed: false, path: '/research-grant-application' }
  ];

  return (
    <div className="application-form-container">
      {isPageLoading && (
        <div className="full-screen-loader" role="status" aria-live="polite">
          <div className="loader-side left"><span></span><span></span><span></span></div>
          <img src={airlogo} alt="Air University" className="loader-logo" />
          <div className="loader-side right"><span></span><span></span><span></span></div>
        </div>
      )}
      {/* Header */}
      <div className="application-header">
        <h1 className="application-title">Application Form</h1>
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          <FaArrowLeft className="back-icon" />
          Back to Dashboard
        </button>
      </div>

      {/* Progress Tracker */}
      <div className="progress-tracker-card">
        <ProgressTracker steps={steps} onStepClick={handleStepClick} />
      </div>

      {/* Content */}
      <div className="form-content">
        <div className="step-content">
          <h2>Employment Details</h2>
          {apiError && <div className="alert alert-danger" role="alert">{apiError}</div>}
          {apiSuccess && <div className="alert alert-success" role="alert">{apiSuccess}</div>}

          {/* Empty state */}
          {!showEmploymentWizard && (
            <div className="employment-empty-state">
              <div className="empty-illustration" aria-hidden="true">
                <FaGraduationCap />
              </div>
              <div className="empty-copy">
                {savedEmployments.length === 0 ? (
                  <>
                    <h3 className="empty-title">No Employment Yet</h3>
                    <p className="empty-subtitle">
                      Currently you don’t have any employment in system, please add at least one to continue
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="empty-title">Employment Saved</h3>
                    <p className="empty-subtitle">{savedEmployments.length} employment record(s) saved.</p>
                  </>
                )}
                <button
                  type="button"
                  className="nav-button add-employment-btn"
                  onClick={() => setShowEmploymentWizard(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <FaPlus /> Add Employment
                </button>

                {savedEmployments.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px' }}>Your saved employment</div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {savedEmployments.slice(0, 5).map((em) => (
                        <div key={em?._id || `${em.employerName}-${em.startDate}`} className="employment-card" style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 700 }}>{em.jobTitle || 'Employment'}</div>
                            <div style={{ color: '#6b7280' }}>
                              {formatDate(em.startDate)}{em.currentlyWorking ? ' → Present' : (em.endDate ? ` → ${formatDate(em.endDate)}` : '')}
                            </div>
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            {(em.employerName || '').toString()}{em.country ? `, ${em.country}` : ''}
                          </div>
                          <div style={{ marginTop: '4px', color: '#6b7280' }}>
                            {(em.organizationType || '').toString()} · {(em.sector || '').toString()} · {(em.category || '').toString()}
                          </div>
                        </div>
                      ))}
                      {savedEmployments.length > 5 && (
                        <div style={{ color: '#6b7280' }}>Showing 5 of {savedEmployments.length} records</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wizard with three dropdown (accordion) sections */}
          {showEmploymentWizard && (
            <div className="accordion" style={{ marginTop: '8px' }}>
              {/* Section 1 */}
              <div className="accordion-section">
                <div className="accordion-header" onClick={() => toggleSection(0)} style={{ cursor: 'pointer' }}>
                  <span>1. Employment Details</span>
                  <span className="accordion-arrow">{activeSectionIndex === 0 ? <FaChevronDown /> : <FaChevronUp />}</span>
                </div>
                <div className={`accordion-panel ${activeSectionIndex === 0 ? 'open' : ''}`}>
                  <div className="accordion-content" aria-hidden={activeSectionIndex !== 0}>
                    <div className="form-row" style={{ alignItems: 'center' }}>
                      <div className="form-group" style={{ flexDirection: 'row', gap: '24px' , justifyContent: 'space-between'}}>
                        <label style={{ fontWeight: 700, color: '#111', marginRight: '8px' }}>Organization Type</label>
                        <div style={{ display: 'flex', gap: '24px' }}>
                        <label className="checkbox-label" style={{ gap: '6px' }}>
                          <input type="radio" name="organizationType" value="ACADEMIC" checked={employmentData.organizationType === 'ACADEMIC'} onChange={handleChange} />
                          ACADEMIC
                        </label>
                        <label className="checkbox-label" style={{ gap: '6px' }}>
                          <input type="radio" name="organizationType" value="PROFESSIONAL" checked={employmentData.organizationType === 'PROFESSIONAL'} onChange={handleChange} />
                          PROFESSIONAL
                        </label>
                        </div>
                      </div>
                    </div>
            <div className="form-row">
              <div className="form-group">
                        <label>Country <span className="required">*</span></label>
                        <select 
                          name="country" 
                          value={employmentData.country} 
                          onChange={handleChange}
                          className={validationErrors.country ? 'error' : ''}
                        >
                          <option value="">Select Country</option>
                          {countryList.map(c => (<option key={c} value={c}>{c}</option>))}
                        </select>
                        {validationErrors.country && <span className="error-message">{validationErrors.country}</span>}
              </div>
              <div className="form-group">
                        <label>Sector <span className="required">*</span></label>
                        <select 
                          name="sector" 
                          value={employmentData.sector} 
                          onChange={handleChange}
                          className={validationErrors.sector ? 'error' : ''}
                        >
                          <option value="">Select Sector</option>
                          <option value="Public">Public</option>
                          <option value="Private">Private</option>
                          <option value="Government">Government</option>
                        </select>
                        {validationErrors.sector && <span className="error-message">{validationErrors.sector}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                        <label>Category <span className="required">*</span></label>
                        <select 
                          name="category" 
                          value={employmentData.category} 
                          onChange={handleChange}
                          className={validationErrors.category ? 'error' : ''}
                        >
                          <option value="">Select Category</option>
                          <option value="University">University</option>
                          <option value="Institute">Institute</option>
                          <option value="Company">Company</option>
                        </select>
                        {validationErrors.category && <span className="error-message">{validationErrors.category}</span>}
                      </div>
                      <div className="form-group">
                        <label>Employer Name <span className="required">*</span></label>
                        <select 
                          name="employerName" 
                          value={employmentData.employerName} 
                          onChange={handleChange}
                          className={validationErrors.employerName ? 'error' : ''}
                        >
                          <option value="">Select Employer</option>
                          <option value="Example Employer 1">Example Employer 1</option>
                          <option value="Example Employer 2">Example Employer 2</option>
                        </select>
                        {validationErrors.employerName && <span className="error-message">{validationErrors.employerName}</span>}
                      </div>
                    </div>
                    {employmentData.organizationType === 'ACADEMIC' && (
                      <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                          <label>Select Centers</label>
                          <select 
                            name="centers" 
                            value={employmentData.centers} 
                            onChange={handleChange}
                            disabled={!isSectionComplete(0)}
                          >
                            <option value="">Select Centers</option>
                            <option value="Center A">Center A</option>
                            <option value="Center B">Center B</option>
                          </select>

                        </div>
                      </div>
                    )}

                    {/* Section 1 controls */}
                    <div className="form-navigation nav-bottom" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
                      <button type="button" className="nav-button prev-button" onClick={() => setShowEmploymentWizard(false)}>
                        Back
                      </button>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          type="button" 
                          className="nav-button next-button" 
                          onClick={gotoNextSection}
                          disabled={!isSectionComplete(0)}
                          style={{ 
                            opacity: isSectionComplete(0) ? 1 : 0.6,
                            cursor: isSectionComplete(0) ? 'pointer' : 'not-allowed'
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="accordion-section">
                <div className="accordion-header" onClick={() => toggleSection(1)} style={{ cursor: 'pointer' }}>
                  <span>2. Employment Address Details</span>
                  <span className="accordion-arrow">{activeSectionIndex === 1 ? <FaChevronDown /> : <FaChevronUp />}</span>
                </div>
                <div className={`accordion-panel ${activeSectionIndex === 1 ? 'open' : ''}`}>
                  <div className="accordion-content" aria-hidden={activeSectionIndex !== 1}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Country <span className="required">*</span></label>
                        <select 
                          name="addressCountry" 
                          value={employmentData.addressCountry} 
                          onChange={handleChange}
                          disabled={!isSectionComplete(0)}
                          className={validationErrors.addressCountry ? 'error' : ''}
                        >
                          <option value="">Select Country</option>
                          {countryList.map(c => (<option key={c} value={c}>{c}</option>))}
                        </select>
                        {validationErrors.addressCountry && <span className="error-message">{validationErrors.addressCountry}</span>}
                      </div>
                      <div className="form-group">
                        <label>City <span className="required">*</span></label>
                        <select 
                          name="addressCity" 
                          value={employmentData.addressCity} 
                          onChange={handleChange}
                          disabled={!isSectionComplete(0)}
                          className={validationErrors.addressCity ? 'error' : ''}
                        >
                          <option value="">Select City</option>
                          {getCities(employmentData.addressCountry).map(c => (<option key={c} value={c}>{c}</option>))}
                        </select>
                        {validationErrors.addressCity && <span className="error-message">{validationErrors.addressCity}</span>}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group" style={{ flex: 2 }}>
                        <label>Address</label>
                        <input 
                          name="addressLine" 
                          type="text" 
                          value={employmentData.addressLine} 
                          onChange={handleChange} 
                          placeholder="Street, Area, Building"
                          disabled={!isSectionComplete(0)}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 2 }}>
                        <label>Contact Number</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <select 
                            name="contactCountryCode" 
                            value={employmentData.contactCountryCode} 
                            onChange={handleChange} 
                            style={{ maxWidth: '100px' }}
                            disabled={!isSectionComplete(0)}
                          >
                            <option value="+92">+92</option>
                            <option value="+1">+1</option>
                            <option value="+44">+44</option>
                          </select>
                          <input 
                            name="contactNumber" 
                            type="tel" 
                            value={employmentData.contactNumber} 
                            onChange={handleChange} 
                            placeholder="21 23456789"
                            disabled={!isSectionComplete(0)}
                          />
                        </div>
                        <small style={{ color: '#6b7280' }}>Please Enter Cell No. in correct format e.g.: +92 3472748202</small>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group" style={{ flex: 2 }}>
                        <label>Office Email</label>
                        <input 
                          name="officeEmail" 
                          type="email" 
                          value={employmentData.officeEmail} 
                          onChange={handleChange} 
                          placeholder="name@company.com"
                          disabled={!isSectionComplete(0)}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 0 }}>
                        <label>Website</label>
                        <input 
                          name="website" 
                          type="url" 
                          value={employmentData.website} 
                          onChange={handleChange} 
                          placeholder="https://example.com"
                          disabled={!isSectionComplete(0)}
                        />
                      </div>
                    </div>

                    {/* Section 2 controls */}
                    <div className="form-navigation nav-bottom" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
                      <button type="button" className="nav-button prev-button" onClick={gotoPrevSection}>
                        Back
                      </button>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          type="button" 
                          className="nav-button next-button" 
                          onClick={gotoNextSection}
                          disabled={!isSectionComplete(1)}
                          style={{ 
                            opacity: isSectionComplete(1) ? 1 : 0.6,
                            cursor: isSectionComplete(1) ? 'pointer' : 'not-allowed'
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="accordion-section">
                <div className="accordion-header" onClick={() => toggleSection(2)} style={{ cursor: 'pointer'}}>
                  <span>3. Job Details</span>
                  <span className="accordion-arrow">{activeSectionIndex === 2 ? <FaChevronDown /> : <FaChevronUp />}</span>
                </div>
                <div className={`accordion-panel ${activeSectionIndex === 2 ? 'open' : ''}`}>
                  <div className="accordion-content" aria-hidden={activeSectionIndex !== 2}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Job Type <span className="required">*</span></label>
                        <select 
                          name="jobType" 
                          value={employmentData.jobType} 
                          onChange={handleChange}
                          disabled={!isSectionComplete(1)}
                          className={validationErrors.jobType ? 'error' : ''}
                        >
                          <option value="">Select</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                        </select>
                        {validationErrors.jobType && <span className="error-message">{validationErrors.jobType}</span>}
                      </div>
                      <div className="form-group">
                        <label>Job Title/Designation <span className="required">*</span></label>
                        <input 
                          name="jobTitle" 
                          type="text" 
                          value={employmentData.jobTitle} 
                          onChange={handleChange} 
                          placeholder="e.g., Assistant Professor"
                          disabled={!isSectionComplete(1)}
                          className={validationErrors.jobTitle ? 'error' : ''}
                        />
                        {validationErrors.jobTitle && <span className="error-message">{validationErrors.jobTitle}</span>}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Field Of Work <span className="required">*</span></label>
                        <select 
                          name="fieldOfWork" 
                          value={employmentData.fieldOfWork} 
                          onChange={handleChange}
                          disabled={!isSectionComplete(1)}
                          className={validationErrors.fieldOfWork ? 'error' : ''}
                        >
                          <option value="">Select</option>
                          <option value="Research">Research</option>
                          <option value="Teaching">Teaching</option>
                          <option value="Administration">Administration</option>
                          <option value="Engineering">Engineering</option>
                        </select>
                        {validationErrors.fieldOfWork && <span className="error-message">{validationErrors.fieldOfWork}</span>}
                      </div>
                      <div className="form-group">
                        <label>Career Level <span className="required">*</span></label>
                        <select 
                          name="careerLevel" 
                          value={employmentData.careerLevel} 
                          onChange={handleChange}
                          disabled={!isSectionComplete(1)}
                          className={validationErrors.careerLevel ? 'error' : ''}
                        >
                          <option value="">Select</option>
                          <option value="Entry">Entry</option>
                          <option value="Mid">Mid</option>
                          <option value="Senior">Senior</option>
                          <option value="Lead">Lead</option>
                        </select>
                        {validationErrors.careerLevel && <span className="error-message">{validationErrors.careerLevel}</span>}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Start Date <span className="required">*</span></label>
                        <input 
                          name="startDate" 
                          type="date" 
                          value={employmentData.startDate} 
                          onChange={handleChange}
                          disabled={!isSectionComplete(1)}
                          className={validationErrors.startDate ? 'error' : ''}
                        />
                        {validationErrors.startDate && <span className="error-message">{validationErrors.startDate}</span>}
              </div>
              <div className="form-group">
                        <label>End Date <span className="required">*</span></label>
                        <input 
                          name="endDate" 
                          type="date" 
                          value={employmentData.endDate} 
                          onChange={handleChange} 
                          disabled={employmentData.currentlyWorking || !isSectionComplete(1)}
                          className={validationErrors.endDate ? 'error' : ''}
                        />
                        {validationErrors.endDate && <span className="error-message">{validationErrors.endDate}</span>}
                      </div>
                    </div>
                    <div className="form-row">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          name="currentlyWorking" 
                          checked={employmentData.currentlyWorking} 
                          onChange={handleChange}
                          disabled={!isSectionComplete(1)}
                        />
                        Currently Working here?
                      </label>

                    </div>
                    <div className="form-row">
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Job Description</label>
                        <textarea 
                          name="jobDescription" 
                          value={employmentData.jobDescription} 
                          onChange={handleChange} 
                          rows={4} 
                          placeholder="Describe your responsibilities"
                          disabled={!isSectionComplete(1)}
                        />
                      </div>
                    </div>

                    {/* Section 3 controls */}
                    <div className="form-navigation nav-bottom" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
                      <button type="button" className="nav-button prev-button" onClick={gotoPrevSection}>
                        Back
                      </button>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          type="button" 
                          className="nav-button save-button" 
                          onClick={handleFinalNext}
                          disabled={!isSectionComplete(2)}
                          style={{ 
                            opacity: isSectionComplete(2) ? 1 : 0.6,
                            cursor: isSectionComplete(2) ? 'pointer' : 'not-allowed'
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Global bottom navigation (kept at the end like other files) */}
            <div className="form-navigation nav-bottom">
              <button type="button" className="nav-button prev-button" onClick={() => navigate('/educational-information')}>
                GO BACK
              </button>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="nav-button save-button" onClick={handleSaveAndClose} disabled={saving}>
                  SAVE & CLOSE
                </button>
                <button type="button" className="nav-button next-button" onClick={handleFinalNext} disabled={saving}>
                  NEXT STEP
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EmploymentInformation;
