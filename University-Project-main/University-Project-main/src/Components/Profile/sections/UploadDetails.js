import React, { useState } from 'react';
import { FaUpload, FaFile, FaTrash } from 'react-icons/fa';
import './UploadDetails.css';

const UploadDetails = ({ onNext, onBack, formData, setFormData }) => {
  const [uploadedFiles, setUploadedFiles] = useState(formData.uploadedFiles || {});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (fileType, files) => {
    const fileList = Array.from(files);
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: fileList
    }));
  };

  const removeFile = (fileType, index) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: prev[fileType].filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const updatedFormData = { ...formData, uploadedFiles };
    setFormData(updatedFormData);
    console.log('Upload details saved:', updatedFormData);
  };

  const handleNext = () => {
    handleSave();
    onNext();
  };

  const renderFileList = (fileType, files) => {
    if (!files || files.length === 0) return null;

    return (
      <div className="file-list">
        {files.map((file, index) => (
          <div key={index} className="file-item">
            <FaFile className="file-icon" />
            <span className="file-name">{file.name}</span>
            <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => removeFile(fileType, index)}
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="upload-details-section">
      <h2 className="section-title">Upload Documents</h2>
      
      <div className="upload-notes">
        <h3>Important Notes:</h3>
        <ul>
          <li>Maximum file size: 10MB per file (20MB for portfolio files)</li>
          <li>Accepted formats: PDF, DOC, DOCX, JPG, PNG, ZIP, RAR</li>
          <li>Ensure all documents are clear and legible</li>
          <li>Keep file names descriptive and professional</li>
          <li>You can upload multiple files for each category</li>
        </ul>
      </div>
      
      <div className="upload-container">
        <div className="upload-section">
          <h3>Resume/CV</h3>
          <div className="upload-area">
            <input
              type="file"
              id="resume"
              accept=".pdf,.doc,.docx"
              multiple
              onChange={(e) => handleFileUpload('resume', e.target.files)}
              className="file-input"
            />
            <label htmlFor="resume" className="upload-label">
              <FaUpload className="upload-icon" />
              <span>Click to upload Resume/CV</span>
              <small>Accepted formats: PDF, DOC, DOCX (Max 10MB each)</small>
            </label>
          </div>
          {renderFileList('resume', uploadedFiles.resume)}
        </div>

        <div className="upload-section">
          <h3>Academic Transcripts</h3>
          <div className="upload-area">
            <input
              type="file"
              id="transcripts"
              accept=".pdf,.doc,.docx"
              multiple
              onChange={(e) => handleFileUpload('transcripts', e.target.files)}
              className="file-input"
            />
            <label htmlFor="transcripts" className="upload-label">
              <FaUpload className="upload-icon" />
              <span>Click to upload Academic Transcripts</span>
              <small>Accepted formats: PDF, DOC, DOCX (Max 10MB each)</small>
            </label>
          </div>
          {renderFileList('transcripts', uploadedFiles.transcripts)}
        </div>

        <div className="upload-section">
          <h3>Publications & Research Papers</h3>
          <div className="upload-area">
            <input
              type="file"
              id="publications"
              accept=".pdf,.doc,.docx"
              multiple
              onChange={(e) => handleFileUpload('publications', e.target.files)}
              className="file-input"
            />
            <label htmlFor="publications" className="upload-label">
              <FaUpload className="upload-icon" />
              <span>Click to upload Publications & Research Papers</span>
              <small>Accepted formats: PDF, DOC, DOCX (Max 10MB each)</small>
            </label>
          </div>
          {renderFileList('publications', uploadedFiles.publications)}
        </div>

        <div className="upload-section">
          <h3>Portfolio/Work Samples</h3>
          <div className="upload-area">
            <input
              type="file"
              id="portfolio"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar"
              multiple
              onChange={(e) => handleFileUpload('portfolio', e.target.files)}
              className="file-input"
            />
            <label htmlFor="portfolio" className="upload-label">
              <FaUpload className="upload-icon" />
              <span>Click to upload Portfolio/Work Samples</span>
              <small>Accepted formats: PDF, DOC, DOCX, JPG, PNG, ZIP, RAR (Max 20MB each)</small>
            </label>
          </div>
          {renderFileList('portfolio', uploadedFiles.portfolio)}
        </div>

        <div className="upload-section">
          <h3>Other Documents</h3>
          <div className="upload-area">
            <input
              type="file"
              id="other"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => handleFileUpload('other', e.target.files)}
              className="file-input"
            />
            <label htmlFor="other" className="upload-label">
              <FaUpload className="upload-icon" />
              <span>Click to upload Other Documents</span>
              <small>Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)</small>
            </label>
          </div>
          {renderFileList('other', uploadedFiles.other)}
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

export default UploadDetails;
