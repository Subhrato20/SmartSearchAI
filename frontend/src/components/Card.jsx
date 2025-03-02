import React, { useState } from 'react';
import './Card.css';

// This component will be used to display a popup with research data
const ResearchPopup = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;
  
  return (
    <div className="research-popup-overlay">
      <div className="research-popup">
        <div className="research-popup-header">
          <h3>Research Details</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="research-popup-content">
          {/* API data will be displayed here */}
          <p>{data || "Loading research data..."}</p>
        </div>
      </div>
    </div>
  );
};

const Card = ({ sources }) => {
  // State for managing the research popup
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeSourceId, setActiveSourceId] = useState(null);
  
  // This function would be called when research button is clicked
  const handleResearchClick = (sourceId) => {
    setActiveSourceId(sourceId);
    setPopupOpen(true);
    
    // Here you would make the API call to get the research data based on sourceId
    // Example:
    // fetchResearchData(sourceId).then(data => setResearchData(data));
  };
  
  // Function to handle redirect to search
  const handleRedirectClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="card-container">
      <div className="sources-section">
        <div className="sources-grid">
          {sources.map(source => (
            <div key={source.id} className="source-card">
              <div className="source-header">
                <h3 className="source-title">
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.title}
                  </a>
                </h3>
              </div>
              <div className="source-content">
                {/* If there's any brief content to show */}
                {source.brief && <p className="source-brief">{source.brief}</p>}
              </div>
              <div className="source-footer">
                <div className="source-info">
                  <div className="source-logo">
                    <img src={source.logo} alt={source.domain} />
                  </div>
                  <span className="source-domain">{source.domain}</span>
                </div>
                <div className="source-buttons">
                  <button 
                    className="source-button redirect-button" 
                    onClick={() => handleRedirectClick(source.url)}
                  >
                    Search
                  </button>
                  <button 
                    className="source-button research-button"
                    onClick={() => handleResearchClick(source.id)}
                  >
                    Research
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {sources.additionalSources > 0 && (
            <div className="more-sources">
              <span>+{sources.additionalSources} sources</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Research popup */}
      <ResearchPopup 
        isOpen={popupOpen} 
        onClose={() => setPopupOpen(false)} 
        data={`Research data for source ${activeSourceId}`} 
      />
    </div>
  );
};

export default Card;