import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaTrash, FaFile } from 'react-icons/fa';
import './EducationDetails.css';
import { httpRequest } from '../../../api/http.js';

const EducationDetails = ({ onNext, onBack, formData, setFormData }) => {
  const [educationList, setEducationList] = useState(formData.education || []);
  const [infoMessage, setInfoMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const isEducationEmpty = (edu) => {
    if (!edu) return true;
    const fields = [
      edu.degree,
      edu.institution,
      edu.fieldOfStudy,
      edu.startDate,
      edu.endDate,
      edu.gpa,
      edu.country,
      edu.description,
    ];
    const hasText = fields.some((v) => String(v || '').trim().length > 0);
    const hasFiles = Array.isArray(edu.files) && edu.files.length > 0;
    return !hasText && !hasFiles;
  };

  const hasAnythingToSave = useMemo(() => {
    return (educationList || []).some((e) => !isEducationEmpty(e));
  }, [educationList]);

  const normalizeEducationForApi = (list) => {
    return (list || []).map((e) => ({
      clientId: e.clientId || e.id || Date.now(),
      degree: e.degree || '',
      institution: e.institution || '',
      fieldOfStudy: e.fieldOfStudy || '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      gpa: e.gpa != null ? String(e.gpa) : '',
      country: (e.country && String(e.country).trim()) ? String(e.country).trim() : 'Pakistan',
      description: e.description || '',
      // Store file metadata only (not File objects)
      files: Array.isArray(e.files)
        ? e.files.map((f) => ({
            name: f?.name || '',
            size: f?.size || 0,
            type: f?.type || '',
          }))
        : [],
    }));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await httpRequest('/users/education');
        if (cancelled) return;

        const list = Array.isArray(res?.data) ? res.data : [];
        const hydrated = list.map((e) => ({
          id: e.clientId || Date.now(),
          clientId: e.clientId || Date.now(),
          degree: e.degree || '',
          institution: e.institution || '',
          fieldOfStudy: e.fieldOfStudy || '',
          startDate: e.startDate || '',
          endDate: e.endDate || '',
          gpa: e.gpa || '',
          country: e.country || 'Pakistan',
          description: e.description || '',
          files: Array.isArray(e.files) ? e.files : [],
          saved: true,
        }));

        setEducationList(hydrated);
        setFormData((prev) => ({ ...prev, education: hydrated }));
      } catch (err) {
        // If unauthorized, just show message; login flow handled elsewhere.
        console.error('Load education failed:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      clientId: Date.now(),
      degree: '',
      institution: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      gpa: '',
      country: 'Pakistan',
      description: '',
      files: [],
      saved: false
    };
    setEducationList([...educationList, newEducation]);

  };

  const removeEducation = (id) => {
    setEducationList(educationList.filter(edu => edu.id !== id));
  };

  const updateEducation = (id, field, value) => {
    setEducationList(educationList.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const addEducationFiles = (id, files) => {
    const fileList = Array.from(files);
    setEducationList(prev => prev.map(edu => (
      edu.id === id ? { ...edu, files: [ ...(edu.files || []), ...fileList ] } : edu
    )));
  };

  const removeEducationFile = (id, index) => {
    setEducationList(prev => prev.map(edu => (
      edu.id === id ? { ...edu, files: (edu.files || []).filter((_, i) => i !== index) } : edu
    )));
  };

  const handleSave = async () => {
    if (!hasAnythingToSave) return;

    const normalized = normalizeEducationForApi(educationList);
    const updatedFormData = { ...formData, education: educationList };
    setFormData(updatedFormData);

    setSaving(true);
    try {
      const res = await httpRequest('/users/education', {
        method: 'PUT',
        body: { education: normalized },
      });

      const savedList = Array.isArray(res?.data) ? res.data : [];
      const hydrated = savedList.map((e) => ({
        id: e.clientId || Date.now(),
        clientId: e.clientId || Date.now(),
        degree: e.degree || '',
        institution: e.institution || '',
        fieldOfStudy: e.fieldOfStudy || '',
        startDate: e.startDate || '',
        endDate: e.endDate || '',
        gpa: e.gpa || '',
        country: e.country || 'Pakistan',
        description: e.description || '',
        files: Array.isArray(e.files) ? e.files : [],
        saved: true,
        errors: {},
      }));

      setEducationList(hydrated);
      setFormData((prev) => ({ ...prev, education: hydrated }));
      setInfoMessage('Education details saved');
      setTimeout(() => setInfoMessage(''), 1500);
    } catch (err) {
      console.error('Save education failed:', err);
      setInfoMessage(err?.message || 'Failed to save education');
      setTimeout(() => setInfoMessage(''), 2000);
    } finally {
      setSaving(false);
    }
  };

  const validateEducation = (edu) => {
    const errors = {};
    if (!edu.degree) errors.degree = true;
    if (!edu.institution) errors.institution = true;
    if (!edu.fieldOfStudy) errors.fieldOfStudy = true;
    if (!edu.startDate) errors.startDate = true;
    return errors;
  };

  const handleNext = () => {
    handleSave();
    onNext();
  };

  return (
    <div className="education-details-section">
      <div className="section-header-row">
        <h2 className="section-title">Educational Background</h2>
      </div>
      {infoMessage && <div className="inline-info">{infoMessage}</div>}
      
      <div className="education-list">
        {educationList.map((education, index) => (
          <div key={education.id} className="education-item">
            <div className="education-header">
              <h3>Education #{index + 1}</h3>
            </div>

            {education.saved ? (
              <div className="summary-row">
                <div className="summary-content">
                  <span className="summary-title">{education.degree || 'Degree'}</span>
                  <span className="summary-meta">{education.institution}</span>
                  <span className="summary-meta">{education.startDate} {education.endDate ? `- ${education.endDate}` : ''}</span>
                </div>
                <div className="summary-actions">
                  <button className="btn btn-warning btn-sm" onClick={() => updateEducation(education.id, 'saved', false)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeEducation(education.id)}>Delete</button>
                </div>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Degree/Certificate *</label>
                    <select
                      value={education.degree}
                      onChange={(e) => updateEducation(education.id, 'degree', e.target.value)}
                      className={`form-select ${education.errors?.degree ? 'input-error' : ''}`}
                      required
                    >
                      <option value="">Select Degree</option>
                      <option value="High School">High School</option>
                      <option value="Associate's">Associate's Degree</option>
                      <option value="Bachelor's">Bachelor's Degree</option>
                      <option value="Master's">Master's Degree</option>
                      <option value="PhD">PhD</option>
                      <option value="Postdoc">Postdoc</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Institution/University *</label>
                    <input
                      type="text"
                      value={education.institution}
                      onChange={(e) => updateEducation(education.id, 'institution', e.target.value)}
                      placeholder="Enter institution name"
                      className={`${education.errors?.institution ? 'input-error' : ''}`}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Field of Study *</label>
                    <input
                      type="text"
                      value={education.fieldOfStudy}
                      onChange={(e) => updateEducation(education.id, 'fieldOfStudy', e.target.value)}
                      placeholder="Enter field of study"
                      className={`${education.errors?.fieldOfStudy ? 'input-error' : ''}`}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      value={education.country}
                      onChange={(e) => updateEducation(education.id, 'country', e.target.value)}
                      placeholder="Enter country"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={education.startDate}
                      onChange={(e) => updateEducation(education.id, 'startDate', e.target.value)}
                      className={`${education.errors?.startDate ? 'input-error' : ''}`}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={education.endDate}
                      onChange={(e) => updateEducation(education.id, 'endDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={education.gpa}
                      onChange={(e) => updateEducation(education.id, 'gpa', e.target.value)}
                      placeholder="Enter GPA (0-4)"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Description/Achievements</label>
                    <textarea
                      value={education.description}
                      onChange={(e) => updateEducation(education.id, 'description', e.target.value)}
                      placeholder="Describe your achievements, honors, or relevant coursework"
                      rows="3"
                    />
                  </div>
                </div>

                {/* Upload supporting documents per education */}
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Upload Documents (Degree, Transcript, etc.)</label>
                    <div className="edu-upload-area">
                      <input
                        type="file"
                        id={`edu-files-${education.id}`}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        multiple
                        onChange={(e) => addEducationFiles(education.id, e.target.files)}
                        className="edu-file-input"
                      />
                      <label htmlFor={`edu-files-${education.id}`} className="edu-upload-label">
                        <span>Click to upload documents (PDF, DOC, JPG, PNG)</span>
                      </label>
                    </div>
                    {education.files && education.files.length > 0 && (
                      <div className="edu-file-list">
                        {education.files.map((file, idx) => (
                          <div key={idx} className="edu-file-item">
                            <FaFile />
                            <span className="name">{file.name}</span>
                            <span className="size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button className="btn btn-danger btn-sm" onClick={() => removeEducationFile(education.id, idx)}>
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  {!isEducationEmpty(education) && (
                    <button
                      className="btn btn-success btn-lg"
                      disabled={saving}
                      onClick={async () => {
                      const errs = validateEducation(education);
                      if (Object.keys(errs).length) {
                        setEducationList(prev => prev.map(edu => edu.id === education.id ? { ...edu, errors: errs } : edu));
                        setInfoMessage('Please fill all required fields');
                        setTimeout(() => setInfoMessage(''), 1500);
                        return;
                      }
                      const withSaved = educationList.map(edu => edu.id === education.id ? { ...edu, saved: true, errors: {} } : edu);
                      setEducationList(withSaved);
                      const updatedFormData = { ...formData, education: withSaved };
                      setFormData(updatedFormData);
                      await handleSave();
                      setInfoMessage(`Education #${index + 1} saved`);
                      setTimeout(() => setInfoMessage(''), 1500);
                    }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  )}
                  <button
                    className="btn btn-danger btn-lg"
                    onClick={() => removeEducation(education.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        <div className="add-education">
          <button className="btn btn-outline-primary" onClick={addEducation}>
            <FaPlus /> Add Education
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
          {hasAnythingToSave && (
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
          <button className="btn btn-success" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default EducationDetails;
