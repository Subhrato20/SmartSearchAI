import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Card.css';

const Card = ({ sources }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('Fetching details...'); // Default text while loading
  const [loading, setLoading] = useState(false);

  const fetchAdditionalData = async (url) => {
    setPopupContent("Fetching details..."); // Show initial loading text
    setShowPopup(true); // Open popup immediately
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:5000/get_alternatives', { query: url });
      setPopupContent(response.data.content || "No additional data available.");
    } catch (error) {
      console.error("Error fetching additional data:", error);
      setPopupContent("Failed to load data.");
    } finally {
      setLoading(false);
    }
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
                {source.brief && <p className="source-brief">{source.brief}</p>}
              </div>
              <div className="source-footer">
                <div className="source-info">
                  <div className="source-logo">
                    <img src={source.logo} alt={source.domain} />
                  </div>
                  <span className="source-domain">{source.domain}</span>
                </div>
                <button 
                  className="source-button research-button" 
                  onClick={() => fetchAdditionalData(source.url)}
                >
                  Research & Compare Alternatives
                </button>
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

      {/* Popup for Research Details */}
      {showPopup && (
        <div className="research-popup-overlay">
          <div className="research-popup">
            <div className="research-popup-header">
              <h3>Research Insights</h3>
              <button className="close-button" onClick={() => setShowPopup(false)}>✖</button>
            </div>
            <div className="research-popup-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => <p style={{ margin: '4px 0' }} {...props} />,
                  li: ({ node, ...props }) => <li style={{ marginBottom: '2px' }} {...props} />,
                  pre: ({ node, ...props }) => <pre style={{ margin: '6px 0', padding: '6px' }} {...props} />,
                }}
              >
                {popupContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
