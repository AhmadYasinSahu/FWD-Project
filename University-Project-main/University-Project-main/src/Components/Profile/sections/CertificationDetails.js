import React, { useState } from 'react';
import { FaCertificate, FaPlus, FaTrash, FaFile } from 'react-icons/fa';
import './CertificationDetails.css';

const CertificationDetails = ({ onNext, onBack, formData, setFormData }) => {
  const [certificationList, setCertificationList] = useState(formData.certifications || []);
  const [infoMessage, setInfoMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addCertification = () => {
    const newCertification = {
      id: Date.now(),
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      description: '',
      files: [],
      saved: false
    };
    setCertificationList([...certificationList, newCertification]);
    
  };

  const removeCertification = (id) => {
    setCertificationList(certificationList.filter(cert => cert.id !== id));
  };

  const updateCertification = (id, field, value) => {
    setCertificationList(certificationList.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  const addCertificationFiles = (id, files) => {
    const fileList = Array.from(files);
    setCertificationList(prev => prev.map(cert => (
      cert.id === id ? { ...cert, files: [ ...(cert.files || []), ...fileList ] } : cert
    )));
  };

  const removeCertificationFile = (id, index) => {
    setCertificationList(prev => prev.map(cert => (
      cert.id === id ? { ...cert, files: (cert.files || []).filter((_, i) => i !== index) } : cert
    )));
  };

  const handleSave = () => {
    const updatedFormData = { ...formData, certifications: certificationList };
    setFormData(updatedFormData);
    console.log('Certification details saved:', updatedFormData);
    setInfoMessage('Certification details saved');
    setTimeout(() => setInfoMessage(''), 1500);
    setInfoMessage('New certification added');
    setTimeout(() => setInfoMessage(''), 2000);
  };

  const validateCertification = (cert) => {
    const errors = {};
    if (!cert.name) errors.name = true;
    if (!cert.issuingOrganization) errors.issuingOrganization = true;
    if (!cert.issueDate) errors.issueDate = true;
    return errors;
  };

  const handleNext = () => {
    handleSave();
    onNext();
  };

  return (
    <div className="certification-details-section">
      <div className="section-header-row">
        <h2 className="section-title">Certifications & Licenses</h2>
      </div>
      {infoMessage && <div className="inline-info">{infoMessage}</div>}
      
      <div className="certification-list">
        {certificationList.map((certification, index) => (
          <div key={certification.id} className="certification-item">
            <div className="certification-header">
              <h3>Certification #{index + 1}</h3>
            </div>

            {certification.saved ? (
              <div className="summary-row">
                <div className="summary-content">
                  <span className="summary-title">{certification.name || 'Certification'}</span>
                  <span className="summary-meta">{certification.issuingOrganization}</span>
                  <span className="summary-meta">{certification.issueDate}{certification.expiryDate ? ` - ${certification.expiryDate}` : ''}</span>
                </div>
                <div className="summary-actions">
                  <button className="btn btn-warning btn-sm" onClick={() => updateCertification(certification.id, 'saved', false)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeCertification(certification.id)}>Delete</button>
                </div>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Certification Name *</label>
                    <input
                      type="text"
                      value={certification.name}
                      onChange={(e) => updateCertification(certification.id, 'name', e.target.value)}
                      placeholder="Enter certification name"
                      className={`${certification.errors?.name ? 'input-error' : ''}`}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Issuing Organization *</label>
                    <input
                      type="text"
                      value={certification.issuingOrganization}
                      onChange={(e) => updateCertification(certification.id, 'issuingOrganization', e.target.value)}
                      placeholder="Enter issuing organization"
                      className={`${certification.errors?.issuingOrganization ? 'input-error' : ''}`}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Certification Type</label>
                    <select
                      value={certification.type}
                      onChange={(e) => updateCertification(certification.id, 'type', e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select Type</option>
                      <option value="Professional Certification">Professional Certification</option>
                      <option value="Technical Certification">Technical Certification</option>
                      <option value="Academic Certification">Academic Certification</option>
                      <option value="License">License</option>
                      <option value="Training Certificate">Training Certificate</option>
                      <option value="Industry Certification">Industry Certification</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Issue Date *</label>
                    <input
                      type="date"
                      value={certification.issueDate}
                      onChange={(e) => updateCertification(certification.id, 'issueDate', e.target.value)}
                      className={`${certification.errors?.issueDate ? 'input-error' : ''}`}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      value={certification.expiryDate}
                      onChange={(e) => updateCertification(certification.id, 'expiryDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={certification.noExpiry}
                        onChange={(e) => updateCertification(certification.id, 'noExpiry', e.target.checked)}
                      />
                      No expiry date
                    </label>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Credential ID</label>
                    <input
                      type="text"
                      value={certification.credentialId}
                      onChange={(e) => updateCertification(certification.id, 'credentialId', e.target.value)}
                      placeholder="Enter credential ID or license number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Credential URL</label>
                    <input
                      type="url"
                      value={certification.credentialUrl}
                      onChange={(e) => updateCertification(certification.id, 'credentialUrl', e.target.value)}
                      placeholder="Enter verification URL"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Score/Grade</label>
                    <input
                      type="text"
                      value={certification.score}
                      onChange={(e) => updateCertification(certification.id, 'score', e.target.value)}
                      placeholder="e.g., 95%, A+, 850/1000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Validity Period</label>
                    <input
                      type="text"
                      value={certification.validityPeriod}
                      onChange={(e) => updateCertification(certification.id, 'validityPeriod', e.target.value)}
                      placeholder="e.g., 2 years, Lifetime"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={certification.description}
                      onChange={(e) => updateCertification(certification.id, 'description', e.target.value)}
                      placeholder="Describe the certification, skills covered, or relevance to your field"
                      rows="3"
                    />
                  </div>
                </div>

                {/* Upload certificate files per certification */}
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Upload Certificate Files</label>
                    <div className="cert-upload-area">
                      <input
                        type="file"
                        id={`cert-files-${certification.id}`}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        multiple
                        onChange={(e) => addCertificationFiles(certification.id, e.target.files)}
                        className="cert-file-input"
                      />
                      <label htmlFor={`cert-files-${certification.id}`} className="cert-upload-label">
                        <span>Click to upload certificates (PDF, DOC, JPG, PNG)</span>
                      </label>
                    </div>
                    {certification.files && certification.files.length > 0 && (
                      <div className="cert-file-list">
                        {certification.files.map((file, idx) => (
                          <div key={idx} className="cert-file-item">
                            <FaFile />
                            <span className="name">{file.name}</span>
                            <span className="size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button className="btn btn-danger btn-sm" onClick={() => removeCertificationFile(certification.id, idx)}>
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => {
                      const errs = validateCertification(certification);
                      if (Object.keys(errs).length) {
                        setCertificationList(prev => prev.map(cert => cert.id === certification.id ? { ...cert, errors: errs } : cert));
                        setInfoMessage('Please fill all required fields');
                        setTimeout(() => setInfoMessage(''), 1500);
                        return;
                      }
                      const withSaved = certificationList.map(cert => cert.id === certification.id ? { ...cert, saved: true, errors: {} } : cert);
                      setCertificationList(withSaved);
                      const updatedFormData = { ...formData, certifications: withSaved };
                      setFormData(updatedFormData);
                      setInfoMessage(`Certification #${index + 1} saved`);
                      setTimeout(() => setInfoMessage(''), 1500);
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-danger btn-lg"
                    onClick={() => removeCertification(certification.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        <div className="add-certification">
          <button className="btn btn-outline-primary" onClick={addCertification}>
            <FaPlus /> Add Certification
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

export default CertificationDetails;
