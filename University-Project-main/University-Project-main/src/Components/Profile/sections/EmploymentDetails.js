import React, { useState } from 'react';
import { FaBriefcase, FaPlus, FaTrash } from 'react-icons/fa';
import './EmploymentDetails.css';

const EmploymentDetails = ({ onNext, onBack, formData, setFormData }) => {
  const [employmentList, setEmploymentList] = useState(formData.employment || []);
  const [infoMessage, setInfoMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addEmployment = () => {
    const newEmployment = {
      id: Date.now(),
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      responsibilities: '',
      saved: false,
      errors: {}
    };
    setEmploymentList([...employmentList, newEmployment]);
    
  };

  const removeEmployment = (id) => {
    setEmploymentList(employmentList.filter(emp => emp.id !== id));
  };

  const updateEmployment = (id, field, value) => {
    setEmploymentList(employmentList.map(emp => 
      emp.id === id ? { ...emp, [field]: value } : emp
    ));
  };

  const handleSave = () => {
    const updatedFormData = { ...formData, employment: employmentList };
    setFormData(updatedFormData);
    console.log('Employment details saved:', updatedFormData);
    setInfoMessage('Employment details saved');
    setTimeout(() => setInfoMessage(''), 1500);
    setInfoMessage('New employment details added');
    setTimeout(() => setInfoMessage(''), 2000);
  };

  const validateEmployment = (emp) => {
    const errors = {};
    if (!emp.jobTitle) errors.jobTitle = true;
    if (!emp.company) errors.company = true;
    if (!emp.startDate) errors.startDate = true;
    return errors;
  };

  const handleNext = () => {
    handleSave();
    onNext();
  };

  return (
    <div className="employment-details-section">
      <h2 className="section-title">Employment History</h2>
      {infoMessage && <div className="inline-info">{infoMessage}</div>}
      
      <div className="employment-list">
        {employmentList.map((employment, index) => (
          <div key={employment.id} className="employment-item">
            <div className="employment-header">
              <h3>Employment #{index + 1}</h3>
            </div>

            {employment.saved ? (
              <div className="summary-row">
                <div className="summary-content">
                  <span className="summary-title">{employment.jobTitle || 'Job Title'}</span>
                  <span className="summary-meta">{employment.company}</span>
                  <span className="summary-meta">{employment.startDate}{employment.endDate ? ` - ${employment.endDate}` : ''}</span>
                </div>
                <div className="summary-actions">
                  <button className="btn btn-warning btn-sm" onClick={() => updateEmployment(employment.id, 'saved', false)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeEmployment(employment.id)}>Delete</button>
                </div>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Title *</label>
                    <input
                      type="text"
                      value={employment.jobTitle}
                      onChange={(e) => updateEmployment(employment.id, 'jobTitle', e.target.value)}
                      placeholder="Enter job title"
                      className={`${employment.errors?.jobTitle ? 'input-error' : ''}`}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Company/Organization *</label>
                    <input
                      type="text"
                      value={employment.company}
                      onChange={(e) => updateEmployment(employment.id, 'company', e.target.value)}
                      placeholder="Enter company name"
                      className={`${employment.errors?.company ? 'input-error' : ''}`}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={employment.location}
                      onChange={(e) => updateEmployment(employment.id, 'location', e.target.value)}
                      placeholder="Enter job location"
                    />
                  </div>
                  <div className="form-group">
                    <label>Employment Type</label>
                    <select
                      value={employment.employmentType}
                      onChange={(e) => updateEmployment(employment.id, 'employmentType', e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select Type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Volunteer">Volunteer</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={employment.startDate}
                      onChange={(e) => updateEmployment(employment.id, 'startDate', e.target.value)}
                      className={`${employment.errors?.startDate ? 'input-error' : ''}`}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={employment.endDate}
                      onChange={(e) => updateEmployment(employment.id, 'endDate', e.target.value)}
                      disabled={employment.current}
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={employment.current}
                        onChange={(e) => updateEmployment(employment.id, 'current', e.target.checked)}
                      />
                      Currently working here
                    </label>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Job Description</label>
                    <textarea
                      value={employment.description}
                      onChange={(e) => updateEmployment(employment.id, 'description', e.target.value)}
                      placeholder="Brief description of your role and responsibilities"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Key Responsibilities & Achievements</label>
                    <textarea
                      value={employment.responsibilities}
                      onChange={(e) => updateEmployment(employment.id, 'responsibilities', e.target.value)}
                      placeholder="List your key responsibilities, achievements, and contributions"
                      rows="4"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Salary Range</label>
                    <input
                      type="text"
                      value={employment.salary}
                      onChange={(e) => updateEmployment(employment.id, 'salary', e.target.value)}
                      placeholder="e.g., $50,000 - $70,000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Reason for Leaving</label>
                    <input
                      type="text"
                      value={employment.reasonForLeaving}
                      onChange={(e) => updateEmployment(employment.id, 'reasonForLeaving', e.target.value)}
                      placeholder="Reason for leaving (if applicable)"
                    />
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => {
                      const errs = validateEmployment(employment);
                      if (Object.keys(errs).length) {
                        setEmploymentList(prev => prev.map(emp => emp.id === employment.id ? { ...emp, errors: errs } : emp));
                        setInfoMessage('Please fill all required fields');
                        setTimeout(() => setInfoMessage(''), 1500);
                        return;
                      }
                      const withSaved = employmentList.map(emp => emp.id === employment.id ? { ...emp, saved: true, errors: {} } : emp);
                      setEmploymentList(withSaved);
                      const updatedFormData = { ...formData, employment: withSaved };
                      setFormData(updatedFormData);
                      setInfoMessage(`Employment #${index + 1} saved`);
                      setTimeout(() => setInfoMessage(''), 1500);
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-danger btn-lg"
                    onClick={() => removeEmployment(employment.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        <div className="add-employment">
          <button className="btn btn-outline-primary" onClick={addEmployment}>
            <FaPlus /> Add Employment
          </button>
        </div>
      </div>

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

export default EmploymentDetails;
