import React, { useState } from 'react';
import { FaCode, FaPlus, FaTrash } from 'react-icons/fa';
import './SkillsDetails.css';

const SkillsDetails = ({ onNext, onBack, formData, setFormData }) => {
  const [skillsList, setSkillsList] = useState(formData.skills || []);
  const [infoMessage, setInfoMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = () => {
    const newSkill = {
      id: Date.now(),
      name: '',
      category: '',
      proficiency: '',
      yearsOfExperience: '',
      description: '',
      saved: false,
      errors: {}
    };
    setSkillsList([...skillsList, newSkill]);
  };

  const removeSkill = (id) => {
    setSkillsList(skillsList.filter(skill => skill.id !== id));
  };

  const updateSkill = (id, field, value) => {
    setSkillsList(skillsList.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const handleSave = () => {
    const updatedFormData = { ...formData, skills: skillsList };
    setFormData(updatedFormData);
    console.log('Skills details saved:', updatedFormData);
  };

  const validateSkill = (skill) => {
    const errors = {};
    if (!skill.name) errors.name = true;
    if (!skill.proficiency) errors.proficiency = true;
    return errors;
  };

  const handleNext = () => {
    handleSave();
    onNext();
  };

  return (
    <div className="skills-details-section">
      <h2 className="section-title">Skills & Expertise</h2>
      
      <div className="skills-list">
        {skillsList.map((skill, index) => (
          <div key={skill.id} className="skill-item">
            <div className="skill-header">
              <h3>Skill #{index + 1}</h3>
            </div>

            {skill.saved ? (
              <div className="summary-row">
                <div className="summary-content">
                  <span className="summary-title">{skill.name || 'Skill'}</span>
                  <span className="summary-meta">{skill.proficiency}</span>
                  <span className="summary-meta">{skill.category}</span>
                </div>
                <div className="summary-actions">
                  <button className="btn btn-warning btn-sm" onClick={() => updateSkill(skill.id, 'saved', false)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeSkill(skill.id)}>Delete</button>
                </div>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Skill Name *</label>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                      placeholder="Enter skill name"
                      className={`${skill.errors?.name ? 'input-error' : ''}`}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={skill.category}
                      onChange={(e) => updateSkill(skill.id, 'category', e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select Category</option>
                      <option value="Programming Languages">Programming Languages</option>
                      <option value="Frameworks & Libraries">Frameworks & Libraries</option>
                      <option value="Databases">Databases</option>
                      <option value="Cloud Platforms">Cloud Platforms</option>
                      <option value="Tools & Software">Tools & Software</option>
                      <option value="Methodologies">Methodologies</option>
                      <option value="Soft Skills">Soft Skills</option>
                      <option value="Domain Knowledge">Domain Knowledge</option>
                      <option value="Languages">Languages</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Proficiency Level *</label>
                    <select
                      value={skill.proficiency}
                      onChange={(e) => updateSkill(skill.id, 'proficiency', e.target.value)}
                      className={`form-select ${skill.errors?.proficiency ? 'input-error' : ''}`}
                      required
                    >
                      <option value="">Select Proficiency</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                      <option value="Master">Master</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={skill.yearsOfExperience}
                      onChange={(e) => updateSkill(skill.id, 'yearsOfExperience', e.target.value)}
                      placeholder="Number of years"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={skill.description}
                      onChange={(e) => updateSkill(skill.id, 'description', e.target.value)}
                      placeholder="Describe your experience with this skill, projects used in, or specific expertise"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => {
                      const errs = validateSkill(skill);
                      if (Object.keys(errs).length) {
                        setSkillsList(prev => prev.map(s => s.id === skill.id ? { ...s, errors: errs } : s));
                        setInfoMessage('Please fill all required fields');
                        setTimeout(() => setInfoMessage(''), 1500);
                        return;
                      }
                      const withSaved = skillsList.map(s => s.id === skill.id ? { ...s, saved: true, errors: {} } : s);
                      setSkillsList(withSaved);
                      const updatedFormData = { ...formData, skills: withSaved };
                      setFormData(updatedFormData);
                      setInfoMessage(`Skill #${index + 1} saved`);
                      setTimeout(() => setInfoMessage(''), 1500);
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-danger btn-lg"
                    onClick={() => removeSkill(skill.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        <div className="add-skill">
          <button className="btn btn-outline-primary" onClick={addSkill}>
            <FaPlus /> Add Skill
          </button>
        </div>
      </div>

      {/* Quick Add Common Skills */}
      <div className="quick-add-skills">
        <h3>Quick Add Common Skills</h3>
        <div className="skill-tags">
          {[
            'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'SQL', 'MongoDB',
            'AWS', 'Docker', 'Git', 'Agile', 'Machine Learning', 'Data Analysis',
            'Project Management', 'Leadership', 'Communication', 'Problem Solving'
          ].map((skillName) => (
            <button
              key={skillName}
              className="skill-tag"
              onClick={() => {
                const newSkill = {
                  id: Date.now() + Math.random(),
                  name: skillName,
                  category: '',
                  proficiency: '',
                  yearsOfExperience: '',
                  description: ''
                };
                setSkillsList([...skillsList, newSkill]);
              }}
            >
              {skillName}
            </button>
          ))}
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

export default SkillsDetails;
