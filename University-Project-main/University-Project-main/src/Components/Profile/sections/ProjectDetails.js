import React, { useState } from 'react';
import { FaProjectDiagram, FaPlus, FaTrash } from 'react-icons/fa';
import './ProjectDetails.css';

const ProjectDetails = ({ onNext, onBack, formData, setFormData }) => {
  const [projectList, setProjectList] = useState(formData.projects || []);
  const [infoMessage, setInfoMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addProject = () => {
    const newProject = {
      id: Date.now(),
      title: '',
      role: '',
      organization: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      technologies: '',
      budget: '',
      teamSize: ''
    };
    setProjectList([...projectList, newProject]);
    
  };

  const removeProject = (id) => {
    setProjectList(projectList.filter(proj => proj.id !== id));
  };

  const updateProject = (id, field, value) => {
    setProjectList(projectList.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    ));
  };

  const handleSave = () => {
    const updatedFormData = { ...formData, projects: projectList };
    setFormData(updatedFormData);
    console.log('Project details saved:', updatedFormData);
    setInfoMessage('Project details saved');
    setTimeout(() => setInfoMessage(''), 1500);
    setInfoMessage('New project added');
    setTimeout(() => setInfoMessage(''), 2000);
  };

  const handleNext = () => {
    handleSave();
    onNext();
  };

  return (
    <div className="project-details-section">
      <h2 className="section-title">Projects & Research Work</h2>
      {infoMessage && <div className="inline-info">{infoMessage}</div>}
      
      <div className="project-list">
        {projectList.map((project, index) => (
          <div key={project.id} className="project-item">
            <div className="project-header">
              <h3>Project #{index + 1}</h3>
              {projectList.length > 1 && (
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => removeProject(project.id)}
                >
                  <FaTrash /> Remove
                </button>
              )}
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Project Title *</label>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                  placeholder="Enter project title"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Your Role *</label>
                <input
                  type="text"
                  value={project.role}
                  onChange={(e) => updateProject(project.id, 'role', e.target.value)}
                  placeholder="e.g., Principal Investigator, Co-PI, Researcher"
                  required
                />
              </div>
              <div className="form-group">
                <label>Organization/Institution</label>
                <input
                  type="text"
                  value={project.organization}
                  onChange={(e) => updateProject(project.id, 'organization', e.target.value)}
                  placeholder="Enter organization name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Project Type</label>
                <select
                  value={project.type}
                  onChange={(e) => updateProject(project.id, 'type', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Type</option>
                  <option value="Research Project">Research Project</option>
                  <option value="Development Project">Development Project</option>
                  <option value="Consulting Project">Consulting Project</option>
                  <option value="Academic Project">Academic Project</option>
                  <option value="Industry Project">Industry Project</option>
                  <option value="Government Project">Government Project</option>
                  <option value="Non-profit Project">Non-profit Project</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Funding Source</label>
                <input
                  type="text"
                  value={project.fundingSource}
                  onChange={(e) => updateProject(project.id, 'fundingSource', e.target.value)}
                  placeholder="e.g., NSF, NIH, Private Foundation"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={project.startDate}
                  onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={project.endDate}
                  onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                  disabled={project.current}
                />
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={project.current}
                    onChange={(e) => updateProject(project.id, 'current', e.target.checked)}
                  />
                  Currently working on this project
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Budget (USD)</label>
                <input
                  type="number"
                  min="0"
                  value={project.budget}
                  onChange={(e) => updateProject(project.id, 'budget', e.target.value)}
                  placeholder="Enter project budget"
                />
              </div>
              <div className="form-group">
                <label>Team Size</label>
                <input
                  type="number"
                  min="1"
                  value={project.teamSize}
                  onChange={(e) => updateProject(project.id, 'teamSize', e.target.value)}
                  placeholder="Number of team members"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Technologies/Tools Used</label>
                <input
                  type="text"
                  value={project.technologies}
                  onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                  placeholder="e.g., Python, React, AWS, MATLAB"
                />
              </div>
              <div className="form-group">
                <label>Project Status</label>
                <select
                  value={project.status}
                  onChange={(e) => updateProject(project.id, 'status', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Status</option>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Project Description *</label>
                <textarea
                  value={project.description}
                  onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                  placeholder="Describe the project objectives, methodology, and outcomes"
                  rows="4"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Key Achievements & Outcomes</label>
                <textarea
                  value={project.outcomes}
                  onChange={(e) => updateProject(project.id, 'outcomes', e.target.value)}
                  placeholder="Describe key achievements, deliverables, publications, or impacts"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Project URL</label>
                <input
                  type="url"
                  value={project.url}
                  onChange={(e) => updateProject(project.id, 'url', e.target.value)}
                  placeholder="Enter project website or repository URL"
                />
              </div>
              <div className="form-group">
                <label>Publications from Project</label>
                <input
                  type="text"
                  value={project.publications}
                  onChange={(e) => updateProject(project.id, 'publications', e.target.value)}
                  placeholder="List publications resulting from this project"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="add-project">
          <button className="btn btn-outline-primary" onClick={addProject}>
            <FaPlus /> Add Project
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

export default ProjectDetails;
