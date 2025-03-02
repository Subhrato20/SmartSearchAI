import React from 'react';
import './Card.css';

const Card = ({ sources }) => {
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
    </div>
  );
};

export default Card;