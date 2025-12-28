

import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaExclamationCircle, FaCheck, FaPlus, FaGraduationCap } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "./EducationalInformation.css";
import airlogo from '../../Assets/airlogo.png';
import ProgressTracker from './shared/ProgressTracker.jsx';
import { httpRequest } from '../../api/http.js';

const initialQualification = {
  qualificationLevel: "",
  incomplete: false,
  enrolled: false,
  startDate: "",
  endDate: "",
};

const initialDegree = {
  country: "",
  city: "",
  institute: "",
  programTitle: "",
  discipline: "",
  campus: "",
  department: "",
  degreeType: "",
  sessionType: "",
  major: "",
  researchArea: "",
};

function EducationalInformation({ onSubmit }) {
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
  const [step, setStep] = useState(1);
  const [qualification, setQualification] = useState(initialQualification);
  const [degree, setDegree] = useState(initialDegree);
  const [showEducationForm, setShowEducationForm] = useState(false);

  const [savedEducation, setSavedEducation] = useState([]);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const formatDate = (d) => {
    if (!d) return '';
    try {
      return String(d).substring(0, 10);
    } catch {
      return '';
    }
  };

  // Load existing education on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await httpRequest('/research/educational');
        const list = Array.isArray(res?.data) ? res.data : [];
        setSavedEducation(list);
      } catch (e) {
        if (e?.status === 401) {
          navigate('/login');
          return;
        }
        setApiError(e?.message || 'Unable to load saved education');
      }
    })();
  }, [navigate]);

  // Helpers to control accordion navigation like Employment
  const goToStep2 = () => {
    if (validateStep1()) {
      setStep(2);
      setShowQualification(false);
      setShowDegree(true);
    }
  };

  const backToStep1 = () => {
    setStep(1);
    setShowDegree(false);
    setShowQualification(true);
  };

  // Accordion state
  const [showQualification, setShowQualification] = useState(true);
  const [showDegree, setShowDegree] = useState(false);

  // Handle input changes for both steps
  const handleChange = (e, section) => {
    const { name, value, type, checked } = e.target;
    if (section === "qualification") {
      setQualification((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    } else {
      setDegree((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Validation for required fields
  const validateStep1 = () =>
    qualification.qualificationLevel && qualification.startDate;
  const validateStep2 = () =>
    degree.country &&
    degree.city &&
    degree.institute &&
    degree.discipline &&
    degree.campus &&
    degree.department &&
    degree.degreeType &&
    degree.sessionType &&
    degree.major;

  // Handle navigation
  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };
  const handlePrev = () => setStep(step - 1);

  // Handle submit
  const handleAddEducation = async () => {
    setApiError('');
    setApiSuccess('');
    if (!validateStep1()) {
      setApiError('Please complete Qualification Details first.');
      return false;
    }
    if (!validateStep2()) {
      setApiError('Please complete Degree/Certificate Details.');
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        ...qualification,
        ...degree,
        // Backend accepts ISO8601; keep empty endDate as null
        endDate: qualification.endDate ? qualification.endDate : null,
      };
      const res = await httpRequest('/research/educational', { method: 'POST', body: payload });
      if (onSubmit) onSubmit(payload);

      setApiSuccess(res?.message || 'Educational information saved');
      setSavedEducation((prev) => [res?.data, ...prev].filter(Boolean));

      setQualification(initialQualification);
      setDegree(initialDegree);
      setStep(1);
      setShowQualification(true);
      setShowDegree(false);
      setShowEducationForm(false);
      return true;
    } catch (err) {
      setApiError(err.message || 'Failed to save education');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndClose = async () => {
    setApiError('');
    setApiSuccess('');

    // If user is currently filling the form, attempt to save it.
    if (showEducationForm) {
      if (step !== 2) {
        setApiError('Please complete the form before saving.');
        return;
      }
      const ok = await handleAddEducation();
      if (ok) navigate('/dashboard');
      return;
    }

    // If no form open, require at least one saved record.
    if (savedEducation.length === 0) {
      setApiError('Please add at least one education record to continue.');
      return;
    }
    navigate('/dashboard');
  };

  const handleNextStep = async () => {
    setApiError('');
    setApiSuccess('');

    if (showEducationForm) {
      if (step !== 2) {
        setApiError('Please complete the form before continuing.');
        return;
      }
      const ok = await handleAddEducation();
      if (ok) navigate('/employment-information');
      return;
    }

    if (savedEducation.length === 0) {
      setApiError('Please add at least one education record to continue.');
      return;
    }
    navigate('/employment-information');
  };

  // Accordion toggles
  const toggleQualification = () => setShowQualification((v) => !v);
  const toggleDegree = () => setShowDegree((v) => !v);

  // Progress tracker logic
  const handleStepClick = (stepId) => {
    if (stepId === 1) navigate('/research-grants');
    else if (stepId === 2) navigate('/personal-information');
  };

  const steps = [
    { id: 1, title: 'Research Grant', completed: true, path: '/research-grants' },
    { id: 2, title: 'Personal Information', completed: true, path: '/personal-information' },
    { id: 3, title: 'Educational Information', completed: false, active: true, path: '/educational-information' },
    { id: 4, title: 'Employment Information', completed: false, path: '/employment-information' },
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

      {/* Progress Tracker Card */}
      <div className="progress-tracker-card">
        <ProgressTracker steps={steps} onStepClick={handleStepClick} />
      </div>

      {/* Form Content */}
      <div className="form-content">
        <div className="step-content">
          <h2>Education Details</h2>
          {apiError && <div className="alert alert-danger" role="alert">{apiError}</div>}
          {apiSuccess && <div className="alert alert-success" role="alert">{apiSuccess}</div>}
          {/* Empty state first */}
          {!showEducationForm && (
            <div className="employment-empty-state" style={{marginBottom:'8px'}}>
              <div className="empty-illustration" aria-hidden="true">
                <FaGraduationCap />
              </div>
              <div className="empty-copy">
                {savedEducation.length === 0 ? (
                  <>
                    <h3 className="empty-title">No Education Added</h3>
                    <p className="empty-subtitle">Please add your education details to continue.</p>
                  </>
                ) : (
                  <>
                    <h3 className="empty-title">Education Saved</h3>
                    <p className="empty-subtitle">{savedEducation.length} education record(s) saved.</p>
                  </>
                )}
                <button
                  type="button"
                  className="nav-button add-employment-btn"
                  onClick={() => setShowEducationForm(true)}
                  style={{display:'inline-flex',alignItems:'center',gap:'8px'}}
                >
                  <FaPlus /> Add Education
                </button>

                {savedEducation.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px' }}>Your saved education</div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {savedEducation.slice(0, 5).map((ed) => (
                        <div key={ed?._id || `${ed.institute}-${ed.startDate}`} className="employment-card" style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 700 }}>{ed.qualificationLevel || 'Education'}</div>
                            <div style={{ color: '#6b7280' }}>
                              {formatDate(ed.startDate)}{ed.endDate ? ` → ${formatDate(ed.endDate)}` : ''}
                            </div>
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            {(ed.institute || '').toString()}{ed.city ? `, ${ed.city}` : ''}{ed.country ? `, ${ed.country}` : ''}
                          </div>
                          <div style={{ marginTop: '4px', color: '#6b7280' }}>
                            {(ed.degreeType || '').toString()} {(ed.major || '').toString()}
                          </div>
                        </div>
                      ))}
                      {savedEducation.length > 5 && (
                        <div style={{ color: '#6b7280' }}>Showing 5 of {savedEducation.length} records</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {showEducationForm && (
          <form
            className="education-form"
            onSubmit={(e) => {
              e.preventDefault();
              step === 1 ? handleNext() : handleAddEducation();
            }}
          >
            {/* Qualification Details Accordion */}
            <div className="accordion-section">
              <div className="accordion-header" onClick={toggleQualification}>
                <b>Qualification Details</b>
                <span className="section-desc">
                  Enter your Qualification details in the below fields
                </span>
                <span className="accordion-arrow">
                  {showQualification ? "▼" : "►"}
                </span>
              </div>
              {showQualification && (
                <div className="accordion-content">
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>
                        Qualification Level <span className="required">*</span>
                      </label>
                      <select
                        name="qualificationLevel"
                        value={qualification.qualificationLevel}
                        onChange={(e) => handleChange(e, "qualification")}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Doctorate">Doctorate</option>
                        <option value="Masters">Masters</option>
                        <option value="Bachelors">Bachelors</option>
                        <option value="Intermediate">Intermediate</option>
                      </select>
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          name="incomplete"
                          checked={qualification.incomplete}
                          onChange={(e) => handleChange(e, "qualification")}
                        />
                        Incomplete Education
                      </label>
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          name="enrolled"
                          checked={qualification.enrolled}
                          onChange={(e) => handleChange(e, "qualification")}
                        />
                        Currently Enrolled
                      </label>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>
                        Start Date <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={qualification.startDate}
                        onChange={(e) => handleChange(e, "qualification")}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={qualification.endDate}
                        onChange={(e) => handleChange(e, "qualification")}
                        disabled={qualification.incomplete || qualification.enrolled}
                      />
                    </div>
                  </div>
                  {/* Section 1 controls */}
                  <div className="form-navigation nav-bottom">
                    <button type="button" className="nav-button prev-button" onClick={() => setShowEducationForm(false)}>
                      Back
                    </button>
                    <div style={{display:'flex',gap:'10px'}}>
                      <button type="button" className="nav-button next-button" onClick={goToStep2}>
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Degree Details Accordion */}
            <div className="accordion-section">
              <div className="accordion-header" onClick={toggleDegree}>
                <b>Degree / Certificate Awarding Institute Details</b>
                <span className="section-desc">
                  Type your degree and certification details
                </span>
                <span className="accordion-arrow">
                  {showDegree ? "▼" : "►"}
                </span>
              </div>
              {showDegree && (
                <div className="accordion-content">
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Country <span className="required">*</span>
                      </label>
                      <select
                        name="country"
                        value={degree.country}
                        onChange={(e) => handleChange(e, "degree")}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Pakistan">Pakistan</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>
                        City <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={degree.city}
                        onChange={(e) => handleChange(e, "degree")}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        Degree Awarding Institute <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="institute"
                        value={degree.institute}
                        onChange={(e) => handleChange(e, "degree")}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Program Title</label>
                      <input
                        type="text"
                        name="programTitle"
                        value={degree.programTitle}
                        onChange={(e) => handleChange(e, "degree")}
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        Discipline <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="discipline"
                        value={degree.discipline}
                        onChange={(e) => handleChange(e, "degree")}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        Campus <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="campus"
                        value={degree.campus}
                        onChange={(e) => handleChange(e, "degree")}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Department <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={degree.department}
                        onChange={(e) => handleChange(e, "degree")}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        Degree Type <span className="required">*</span>
                      </label>
                      <select
                        name="degreeType"
                        value={degree.degreeType}
                        onChange={(e) => handleChange(e, "degree")}
                        required
                      >
                        <option value="">Select</option>
                        <option value="PhD">PhD</option>
                        <option value="MS">MS</option>
                        <option value="BS">BS</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>
                        Session Type <span className="required">*</span>
                      </label>
                      <select
                        name="sessionType"
                        value={degree.sessionType}
                        onChange={(e) => handleChange(e, "degree")}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Major <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="major"
                        value={degree.major}
                        onChange={(e) => handleChange(e, "degree")}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Area of Research</label>
                      <input
                        type="text"
                        name="researchArea"
                        value={degree.researchArea}
                        onChange={(e) => handleChange(e, "degree")}
                      />
                    </div>
                  </div>
                  {/* Section 2 controls */}
                  <div className="form-navigation nav-bottom">
                    <button type="button" className="nav-button prev-button" onClick={backToStep1}>
                      Back
                    </button>
                    <div style={{display:'flex',gap:'10px'}}>
                      <button type="button" className="nav-button save-button" onClick={handleAddEducation}>
                        {saving ? 'Saving…' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
           
          </form>
          )}
        </div>
      </div>
      {/* Bottom Navigation - Always visible */}
      <div className="form-navigation nav-bottom">
        <button type="button" className="nav-button prev-button" onClick={() => navigate('/personal-information')}>
          GO BACK
        </button>
        <div style={{display: 'flex', gap: '10px'}}>
          <button type="button" className="nav-button save-button" onClick={handleSaveAndClose} disabled={saving}>
            SAVE & CLOSE
          </button>
          <button type="button" className="nav-button next-button" onClick={handleNextStep} disabled={saving}>
            NEXT STEP
          </button>
        </div>
      </div>
    </div>
  );
}

export default EducationalInformation;
