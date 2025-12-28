import React, { useState } from 'react';
import './Profile.css';

// Import section components
import PersonalDetails from './sections/PersonalDetails.js';
import ContactDetails from './sections/ContactDetails.js';
import EducationDetails from './sections/EducationDetails.js';
import EmploymentDetails from './sections/EmploymentDetails.js';
import PublicationDetails from './sections/PublicationDetails.js';
import ProjectDetails from './sections/ProjectDetails.js';
import CertificationDetails from './sections/CertificationDetails.js';
import SkillsDetails from './sections/SkillsDetails.js';
import UploadDetails from './sections/UploadDetails.js';

const Profile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    // Personal Details
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    maritalStatus: 'married',
    
    // Contact Details
    email: '',
    phone: '',
    alternativePhone: '',
    website: '',
    currentAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    
    // Education, Employment, Publications, Projects, Certifications, Skills, Uploads
    education: [],
    employment: [],
    publications: [],
    projects: [],
    certifications: [],
    skills: [],
    uploadedFiles: {}
  });

  const tabs = [
    { id: 'personal', label: 'Personal Details' },
    { id: 'contact', label: 'Contact' },
    { id: 'education', label: 'Education' },
    { id: 'employment', label: 'Employment' },
    { id: 'publication', label: 'Publication' },
    { id: 'project', label: 'Project' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'skills', label: 'Skills' },
    { id: 'upload', label: 'Upload' }
  ];

  const handleNext = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const renderActiveSection = () => {
    const props = {
      formData,
      setFormData,
      onNext: handleNext,
      onBack: handleBack
    };

    switch (activeTab) {
      case 'personal':
        return <PersonalDetails {...props} />;
      case 'contact':
        return <ContactDetails {...props} />;
      case 'education':
        return <EducationDetails {...props} />;
      case 'employment':
        return <EmploymentDetails {...props} />;
      case 'publication':
        return <PublicationDetails {...props} />;
      case 'project':
        return <ProjectDetails {...props} />;
      case 'certifications':
        return <CertificationDetails {...props} />;
      case 'skills':
        return <SkillsDetails {...props} />;
      case 'upload':
        return <UploadDetails {...props} />;
      default:
        return <PersonalDetails {...props} />;
    }
  };

  return (
    <div className="profile-page">
      {/* Page Title with Breadcrumb */}
      <div className="page-title">
        <h1>My Profile</h1>
        <span className="breadcrumb">Dashboard / My Profile</span>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default Profile; 