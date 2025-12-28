import React, { useRef, useState, useEffect } from 'react';
import Select from 'react-select';
import { FaArrowLeft, FaEdit, FaMale, FaFemale, FaTransgender, FaUser, FaUserFriends, FaHeartBroken, FaCalendarAlt, FaCheck, FaPencilAlt, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './PersonalInformation.css';
import defaultAvatar from '../../Assets/profilepic.png';
import airlogo from '../../Assets/airlogo.png';
import { countryList, getCities, isCityValid } from '../../constants/locations.js';
import { httpRequest, API_ORIGIN } from '../../api/http.js';

const maritalOptions = [
  { value: 'single', label: 'Single', icon: <FaUser /> },
  { value: 'married', label: 'Married', icon: <FaUserFriends /> },
  { value: 'divorced', label: 'Divorced', icon: <FaHeartBroken /> },
];
const genderOptions = [
  { value: 'male', label: 'Male', icon: <FaMale /> },
  { value: 'female', label: 'Female', icon: <FaFemale /> },
  { value: 'other', label: 'Other', icon: <FaTransgender /> },
];

const titleOptions = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Dr', label: 'Dr' },
  { value: 'Engr', label: 'Engr' },
  { value: 'Prof', label: 'Prof' },
  { value: 'PhD', label: 'PhD' },
  { value: 'Engr. Dr', label: 'Engr. Dr' },
  { value: 'Prof. Dr', label: 'Prof. Dr' },
];

const requiredFields = [
  'title', 'firstName', 'lastName', 'dob', 'fatherName',
  'permanentAddress', 'permanentCountry', 'permanentCity',
  'mailingAddress', 'mailingCountry', 'mailingCity'
];

const PersonalInformation = () => {
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
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const titleValidityRef = useRef(null);
  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    middleName: '',
    lastName: '',
    fatherName: '',
    dob: '',
    maritalStatus: '',
    gender: '',
    permanentAddress: '',
    permanentCountry: '',
    permanentCity: '',
    mailingAddress: '',
    mailingCountry: '',
    mailingCity: '',
    sameAsPermanent: false,
    cnic: '',
    nationality: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'sameAsPermanent' && checked
        ? {
            mailingAddress: prev.permanentAddress,
            mailingCountry: prev.permanentCountry,
            mailingCity: prev.permanentCity,
          }
        : {}),
      ...(name === 'permanentCountry'
        ? { permanentCity: isCityValid(prev.permanentCity, value) ? prev.permanentCity : '' }
        : {}),
      ...(name === 'mailingCountry'
        ? { mailingCity: isCityValid(prev.mailingCity, value) ? prev.mailingCity : '' }
        : {}),
      ...(prev.sameAsPermanent && (name === 'permanentAddress' || name === 'permanentCountry' || name === 'permanentCity')
        ? {
            mailingAddress: name === 'permanentAddress' ? value : (name === 'permanentCountry' ? prev.mailingAddress : prev.mailingAddress),
            mailingCountry: name === 'permanentCountry' ? value : prev.mailingCountry,
            mailingCity: name === 'permanentCity' ? value : prev.mailingCity,
          }
        : {}),
    }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // Clear error on change
  };

  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicFile(file);
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleMaritalStatus = (value) => setFormData((prev) => ({ ...prev, maritalStatus: value }));
  const handleGender = (value) => setFormData((prev) => ({ ...prev, gender: value }));

  const validate = () => {
    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });
    return newErrors;
  };

  // Load existing personal info on mount
  React.useEffect(() => {
    (async () => {
      try {
        const res = await httpRequest('/research/personal');
        if (res?.data) {
          const data = res.data;
          setFormData((prev) => ({
            ...prev,
            title: data.title || '',
            firstName: data.firstName || '',
            middleName: data.middleName || '',
            lastName: data.lastName || '',
            fatherName: data.fatherName || '',
            dob: data.dob ? String(data.dob).substring(0, 10) : '',
            maritalStatus: data.maritalStatus || '',
            gender: data.gender || '',
            permanentAddress: data.permanentAddress || '',
            permanentCountry: data.permanentCountry || '',
            permanentCity: data.permanentCity || '',
            mailingAddress: data.mailingAddress || '',
            mailingCountry: data.mailingCountry || '',
            mailingCity: data.mailingCity || '',
          }));

          if (data.profilePicture) {
            setProfilePic(`${API_ORIGIN}${data.profilePicture}`);
          }
          return; // already loaded from saved personal info
        }
      } catch (err) {
        // Ignore and try to prefill from user profile
      }
      try {
        const prof = await httpRequest('/users/profile');
        const user = prof?.data?.user;
        if (user) {
          const parts = String(user.name || '').trim().split(/\s+/);
          const [firstName, ...rest] = parts;
          const lastName = rest.join(' ');
          const defaultCountry = 'Pakistan';
          const cityCandidate = user.city && isCityValid(user.city, defaultCountry) ? user.city : '';
          setFormData((prev) => ({
            ...prev,
            firstName: prev.firstName || firstName || '',
            lastName: prev.lastName || lastName || '',
            permanentCountry: prev.permanentCountry || (cityCandidate ? defaultCountry : prev.permanentCountry),
            mailingCountry: prev.mailingCountry || (cityCandidate ? defaultCountry : prev.mailingCountry),
            permanentCity: prev.permanentCity || cityCandidate,
            mailingCity: prev.mailingCity || cityCandidate,
            cnic: user.cnic || prev.cnic,
            nationality: prev.nationality || 'Pakistan',
          }));
        }
      } catch (e) {
        // no-op if profile not available
      }
    })();
  }, []);

  const savePersonalInfo = async () => {
    setApiError('');
    setApiSuccess('');
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        firstName: formData.firstName,
        middleName: formData.middleName || '',
        lastName: formData.lastName,
        fatherName: formData.fatherName,
        dob: formData.dob,
        maritalStatus: formData.maritalStatus,
        gender: formData.gender,
        permanentAddress: formData.permanentAddress,
        permanentCountry: formData.permanentCountry,
        permanentCity: formData.permanentCity,
        mailingAddress: formData.mailingAddress,
        mailingCountry: formData.mailingCountry,
        mailingCity: formData.mailingCity,
        sameAsPermanent: !!formData.sameAsPermanent,
        cnic: formData.cnic,
        nationality: formData.nationality || 'Pakistan',
      };
      const res = await httpRequest('/research/personal', { method: 'POST', body: payload });

      // Upload profile picture (if user selected one)
      if (profilePicFile) {
        const fd = new FormData();
        fd.append('profilePicture', profilePicFile);
        const uploadRes = await httpRequest('/research/personal/profile-picture', {
          method: 'POST',
          body: fd,
        });
        const uploadedPath = uploadRes?.data?.profilePicture;
        if (uploadedPath) {
          setProfilePic(`${API_ORIGIN}${uploadedPath}`);
          setProfilePicFile(null);
        }
      }

      setApiSuccess(res?.message || 'Saved');
      return true;
    } catch (err) {
      setApiError(err.message || 'Failed to save');
      if (err.status === 401) {
        navigate('/login');
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      navigate('/educational-information');
    } else {
      if (newErrors.title && titleValidityRef.current) {
        try {
          titleValidityRef.current.setCustomValidity('Please fill in this field.');
          titleValidityRef.current.reportValidity();
        } catch {}
      }
    }
  };

  const handleSaveAndClose = () => {
    savePersonalInfo().then((ok) => {
      if (ok) navigate('/dashboard');
    });
  };


  const steps = [
    { id: 1, title: 'Research Grant', completed: true, path: '/research-grants' },
    { id: 2, title: 'Personal Information', completed: false, active: true, path: '/personal-information' },
    { id: 3, title: 'Educational Information', completed: false, path: '/educational-information' },
    { id: 4, title: 'Employment Information', completed: false, path: '/employment-information' },
    { id: 5, title: 'Research Grant Application Form', completed: false, path: '/research-grant-application' },
  ];

  return (
    <form className="personal-info-form" onSubmit={handleSubmit}>
      {/* Header to match Application Form */}
      <div className="application-header">
        <div className="header-content">
          <h1 className="application-title">Application Form</h1>
          
        </div>
        <button type="button" className="back-button" onClick={() => navigate('/dashboard')}>
          <FaArrowLeft className="back-icon" />
          Back to Dashboard
        </button>
      </div>
      {isPageLoading && (
        <div className="full-screen-loader" role="status" aria-live="polite">
          <div className="loader-side left"><span></span><span></span><span></span></div>
          <img src={airlogo} alt="Air University" className="loader-logo" />
          <div className="loader-side right"><span></span><span></span><span></span></div>
        </div>
      )}
      {/* Progress Tracker Card */}
      <div className="progress-tracker-card">
        <div className="modern-progress-tracker">
          {steps.map((step, index) => (
            <div key={step.id} className="modern-step-container">
              <div
                className={`step-circle ${step.completed ? 'completed' : step.active ? 'active' : 'inactive'}`}
              >
                {step.completed ? <FaCheck /> : step.id}
              </div>
              <span className={`step-label ${step.active ? 'active' : step.completed ? 'completed' : ''}`}>{step.title}</span>
              {index < steps.length - 1 && <div className="modern-step-connector" />}
            </div>
          ))}
        </div>
      </div>
      {apiError && <div className="alert alert-danger" role="alert">{apiError}</div>}
      {apiSuccess && <div className="alert alert-success" role="alert">{apiSuccess}</div>}
      {/* Personal Info Section */}
      <section className="section personal-section">
        <h2 className="section-title">Personal Info</h2>
        <hr className="section-divider" />
        {/* Profile Picture Centered with Header */}
        <div className="profile-pic-top">
          <div className="profile-pic-card">
            <div className="profile-pic-header">
              <span>Edit Picture</span>
              <FaPencilAlt className="profile-pic-pencil" />
              <input type="file" accept="image/*" style={{ display: 'none' }} id="profilePicInput" onChange={handleProfilePicChange} />
            </div>
            <label htmlFor="profilePicInput" className="profile-pic-label">
              <img
                src={profilePic || defaultAvatar}
                alt="Profile"
                className="profile-pic profile-pic-square"
              />
            </label>
          </div>
        </div>
        {/* Form Fields Layout */}
        <div className="personal-fields">
          <div className="row-3">
            <div className="form-group floating-label-group">
              <Select
                classNamePrefix="react-select"
                options={titleOptions}
                value={titleOptions.find(opt => opt.value === formData.title) || null}
                onChange={option => {
                  handleInputChange({ target: { name: 'title', value: option ? option.value : '' } });
                  if (titleValidityRef.current) {
                    try { titleValidityRef.current.setCustomValidity(''); } catch {}
                  }
                }}
                placeholder=" "
                isSearchable
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: errors.title && submitted ? '#e53935' : state.isFocused ? '#00b068' : '#2a2c30',
                    boxShadow: state.isFocused ? '0 0 0 3px rgba(0,176,104,0.08)' : base.boxShadow,
                    minHeight: '48px',
                    fontSize: '16px',
                  }),
                  placeholder: base => ({ ...base, color: '#888', fontSize: '15px' }),
                }}
                isClearable
              />
              {/* Hidden input to trigger native required tooltip for title */}
              <input
                ref={titleValidityRef}
                value={formData.title}
                onChange={() => {}}
                required
                style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
              />
              <label className={formData.title ? 'float' : ''}></label>
              {errors.title && submitted && <span className="error-message">{errors.title}</span>}
            </div>
            <div className="form-group floating-label-group">
              <input name="firstName" value={formData.firstName} placeholder='First Name' onChange={handleInputChange} required className={formData.firstName ? 'has-value' : ''} />
              <label className={formData.firstName ? 'float' : ''}></label>
              {errors.firstName && submitted && <span className="error-message">{errors.firstName}</span>}
            </div>
            <div className="form-group floating-label-group">
              <input name="middleName" value={formData.middleName} placeholder='Middle Name' onChange={handleInputChange} className={formData.middleName ? 'has-value' : ''} />
              <label className={formData.middleName ? 'float' : ''}></label>
            </div>
          </div>
          <div className="row-3">
            <div className="form-group">
              <input name="lastName" value={formData.lastName} placeholder='Last Name' onChange={handleInputChange} required style={{marginTop: '35px'}} />
              {errors.lastName && submitted && <span className="error-message">{errors.lastName}</span>}
            </div>
            <div className="form-group">
              <label className="small-label">Marital Status</label>
              <div className="icon-group">
                {maritalOptions.map(opt => (
                  <button
                    type="button"
                    key={opt.value}
                    className={`icon-btn${formData.maritalStatus === opt.value ? ' selected' : ''}`}
                    onClick={() => handleMaritalStatus(opt.value)}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="small-label">Gender</label>
              <div className="icon-group">
                {genderOptions.map(opt => (
                  <button
                    type="button"
                    key={opt.value}
                    className={`icon-btn${formData.gender === opt.value ? ' selected' : ''}`}
                    onClick={() => handleGender(opt.value)}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="row-2">
            <div className="form-group floating-label-group">
              <input type="date" name="dob" value={formData.dob} placeholder='Date of Birth' onChange={handleInputChange} required className={formData.dob ? 'has-value' : ''} />
              <label className={formData.dob ? 'float' : ''}></label>
              {errors.dob && submitted && <span className="error-message">{errors.dob}</span>}
            </div>
            <div className="form-group floating-label-group">
              <input name="fatherName" value={formData.fatherName} placeholder='Father Name' onChange={handleInputChange} required className={formData.fatherName ? 'has-value' : ''} />
              <label className={formData.fatherName ? 'float' : ''}></label>
              {errors.fatherName && submitted && <span className="error-message">{errors.fatherName}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="section contact-section">
        <h2 className="section-title">Contact Info</h2>
        <div className="address-block">
          <h3>Permanent Address</h3>
          <div className="row-1">
            <div className="form-group full-width floating-label-group">
              <input name="permanentAddress" placeholder='Address' value={formData.permanentAddress} onChange={handleInputChange} required className={formData.permanentAddress ? 'has-value' : ''} />
              <label className={formData.permanentAddress ? 'float' : ''}></label>
              {errors.permanentAddress && submitted && <span className="error-message">{errors.permanentAddress}</span>}
            </div>
          </div>
          <div className="row-2">
            <div className="form-group floating-label-group">
              <select name="permanentCountry" value={formData.permanentCountry} onChange={handleInputChange} required className={formData.permanentCountry ? 'has-value' : ''}>
                <option value="">Country</option>
                {countryList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className={formData.permanentCountry ? 'float' : ''}></label>
              {errors.permanentCountry && submitted && <span className="error-message">{errors.permanentCountry}</span>}
            </div>
            <div className="form-group floating-label-group">
              <select name="permanentCity" value={formData.permanentCity} onChange={handleInputChange} required className={formData.permanentCity ? 'has-value' : ''}>
                <option value="">City</option>
                {getCities(formData.permanentCountry).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className={formData.permanentCity ? 'float' : ''}></label>
              {errors.permanentCity && submitted && <span className="error-message">{errors.permanentCity}</span>}
            </div>
          </div>
        </div>
        <div className="address-block">
          <h3>Mailing Address</h3>
          <div className="row-1">
            <label className="checkbox-label">
              <input type="checkbox" name="sameAsPermanent" checked={formData.sameAsPermanent} onChange={handleInputChange} />
              Same as Permanent Address
            </label>
          </div>
          <div className="row-1">
            <div className="form-group full-width floating-label-group">
              <input name="mailingAddress" placeholder='Address' value={formData.mailingAddress} onChange={handleInputChange} required className={formData.mailingAddress ? 'has-value' : ''} />
              <label className={formData.mailingAddress ? 'float' : ''}></label>
              {errors.mailingAddress && submitted && <span className="error-message">{errors.mailingAddress}</span>}
            </div>
          </div>
          <div className="row-2">
            <div className="form-group floating-label-group">
              <select name="mailingCountry" value={formData.mailingCountry} onChange={handleInputChange} required className={formData.mailingCountry ? 'has-value' : ''}>
                <option value="">Country</option>
                {countryList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className={formData.mailingCountry ? 'float' : ''}></label>
              {errors.mailingCountry && submitted && <span className="error-message">{errors.mailingCountry}</span>}
            </div>
            <div className="form-group floating-label-group">
              <select name="mailingCity" value={formData.mailingCity} onChange={handleInputChange} required className={formData.mailingCity ? 'has-value' : ''}>
                <option value="">City</option>
                {getCities(formData.mailingCountry).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className={formData.mailingCity ? 'float' : ''}></label>
              {errors.mailingCity && submitted && <span className="error-message">{errors.mailingCity}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Nationality Info Section */}
      <section className="section nationality-section">
        <h2 className="section-title">Nationality Info</h2>
        <table className="nationality-table">
          <thead>
            <tr>
              <th>IDENTIFICATION</th>
              <th>TYPE</th>
              <th>COUNTRY</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{formData.cnic}</td>
              <td>CNIC</td>
              <td>{formData.nationality}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Navigation Buttons */}
      <div className="form-navigation nav-bottom">
        <button type="button" className="nav-button prev-button" onClick={() => navigate('/research-grants')}>
          GO BACK
        </button>
       <div style={{display: 'flex', gap: '10px'}}>
        <button type="button" className="nav-button save-button" disabled={saving} onClick={handleSaveAndClose}>
          SAVE & CLOSE
        </button>
        <button type="submit" className="nav-button next-button" disabled={saving}>
          NEXT STEP
        </button>
       </div>
      </div>
    </form>
  );
};

export default PersonalInformation;

