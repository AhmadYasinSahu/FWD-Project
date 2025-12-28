import React, { useState } from 'react';
import { FaBook, FaPlus, FaTrash } from 'react-icons/fa';
import './PublicationDetails.css';

const PublicationDetails = ({ onNext, onBack, formData, setFormData }) => {
  const [publicationList, setPublicationList] = useState(formData.publications || []);
  const [infoMessage, setInfoMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addPublication = () => {
    const newPublication = {
      id: Date.now(),
      title: '',
      authors: '',
      journal: '',
      year: '',
      doi: '',
      url: '',
      type: '',
      description: '',
      saved: false
    };
    setPublicationList([...publicationList, newPublication]);
    
  };

  const removePublication = (id) => {
    setPublicationList(publicationList.filter(pub => pub.id !== id));
  };

  const updatePublication = (id, field, value) => {
    setPublicationList(publicationList.map(pub => 
      pub.id === id ? { ...pub, [field]: value } : pub
    ));
  };

  const handleSave = () => {
    const updatedFormData = { ...formData, publications: publicationList };
    setFormData(updatedFormData);
    console.log('Publication details saved:', updatedFormData);
    setInfoMessage('Publication details saved');
    setTimeout(() => setInfoMessage(''), 1500);
    setInfoMessage('New publication added');
    setTimeout(() => setInfoMessage(''), 2000);
  };

  const validatePublication = (pub) => {
    const errors = {};
    if (!pub.title) errors.title = true;
    if (!pub.authors) errors.authors = true;
    if (!pub.year) errors.year = true;
    return errors;
  };

  const handleNext = () => {
    handleSave();
    onNext();
  };

  return (
    <div className="publication-details-section">
      <div className="section-header-row">
        <h2 className="section-title">Publications & Research</h2>
      </div>
      {infoMessage && <div className="inline-info">{infoMessage}</div>}
      
      <div className="publication-list">
        {publicationList.map((publication, index) => (
          <div key={publication.id} className="publication-item">
            <div className="publication-header">
              <h3>Publication #{index + 1}</h3>
            </div>

            {publication.saved ? (
              <div className="summary-row">
                <div className="summary-content">
                  <span className="summary-title">{publication.title || 'Publication'}</span>
                  <span className="summary-meta">{publication.authors}</span>
                  <span className="summary-meta">{publication.year}</span>
                </div>
                <div className="summary-actions">
                  <button className="btn btn-warning btn-sm" onClick={() => updatePublication(publication.id, 'saved', false)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => removePublication(publication.id)}>Delete</button>
                </div>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Publication Title *</label>
                    <input
                      type="text"
                      value={publication.title}
                      onChange={(e) => updatePublication(publication.id, 'title', e.target.value)}
                      placeholder="Enter publication title"
                      className={`${publication.errors?.title ? 'input-error' : ''}`}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Authors *</label>
                    <input
                      type="text"
                      value={publication.authors}
                      onChange={(e) => updatePublication(publication.id, 'authors', e.target.value)}
                      placeholder="Enter authors (comma separated)"
                      className={`${publication.errors?.authors ? 'input-error' : ''}`}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Publication Type</label>
                    <select
                      value={publication.type}
                      onChange={(e) => updatePublication(publication.id, 'type', e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select Type</option>
                      <option value="Journal Article">Journal Article</option>
                      <option value="Conference Paper">Conference Paper</option>
                      <option value="Book Chapter">Book Chapter</option>
                      <option value="Book">Book</option>
                      <option value="Technical Report">Technical Report</option>
                      <option value="Thesis">Thesis</option>
                      <option value="Patent">Patent</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Journal/Conference/Publisher</label>
                    <input
                      type="text"
                      value={publication.journal}
                      onChange={(e) => updatePublication(publication.id, 'journal', e.target.value)}
                      placeholder="Enter journal, conference, or publisher name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Publication Year *</label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={publication.year}
                      onChange={(e) => updatePublication(publication.id, 'year', e.target.value)}
                      placeholder="YYYY"
                      className={`${publication.errors?.year ? 'input-error' : ''}`}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Volume/Issue</label>
                    <input
                      type="text"
                      value={publication.volume}
                      onChange={(e) => updatePublication(publication.id, 'volume', e.target.value)}
                      placeholder="e.g., Vol. 15, Issue 3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pages</label>
                    <input
                      type="text"
                      value={publication.pages}
                      onChange={(e) => updatePublication(publication.id, 'pages', e.target.value)}
                      placeholder="e.g., 123-145"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>DOI</label>
                    <input
                      type="text"
                      value={publication.doi}
                      onChange={(e) => updatePublication(publication.id, 'doi', e.target.value)}
                      placeholder="Enter DOI"
                    />
                  </div>
                  <div className="form-group">
                    <label>URL/Link</label>
                    <input
                      type="url"
                      value={publication.url}
                      onChange={(e) => updatePublication(publication.id, 'url', e.target.value)}
                      placeholder="Enter publication URL"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Impact Factor</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={publication.impactFactor}
                      onChange={(e) => updatePublication(publication.id, 'impactFactor', e.target.value)}
                      placeholder="Enter impact factor"
                    />
                  </div>
                  <div className="form-group">
                    <label>Citations</label>
                    <input
                      type="number"
                      min="0"
                      value={publication.citations}
                      onChange={(e) => updatePublication(publication.id, 'citations', e.target.value)}
                      placeholder="Number of citations"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={publication.peerReviewed}
                        onChange={(e) => updatePublication(publication.id, 'peerReviewed', e.target.checked)}
                      />
                      Peer-reviewed publication
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={publication.openAccess}
                        onChange={(e) => updatePublication(publication.id, 'openAccess', e.target.checked)}
                      />
                      Open access
                    </label>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Abstract/Description</label>
                    <textarea
                      value={publication.description}
                      onChange={(e) => updatePublication(publication.id, 'description', e.target.value)}
                      placeholder="Brief description or abstract of the publication"
                      rows="4"
                    />
                  </div>
                </div>

                

                <div className="card-actions">
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => {
                      const errs = validatePublication(publication);
                      if (Object.keys(errs).length) {
                        setPublicationList(prev => prev.map(pub => pub.id === publication.id ? { ...pub, errors: errs } : pub));
                        setInfoMessage('Please fill all required fields');
                        setTimeout(() => setInfoMessage(''), 1500);
                        return;
                      }
                      const withSaved = publicationList.map(pub => pub.id === publication.id ? { ...pub, saved: true, errors: {} } : pub);
                      setPublicationList(withSaved);
                      const updatedFormData = { ...formData, publications: withSaved };
                      setFormData(updatedFormData);
                      setInfoMessage(`Publication #${index + 1} saved`);
                      setTimeout(() => setInfoMessage(''), 1500);
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-danger btn-lg"
                    onClick={() => removePublication(publication.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        <div className="add-publication">
          <button className="btn btn-outline-primary" onClick={addPublication}>
            <FaPlus /> Add Publication
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

export default PublicationDetails;
