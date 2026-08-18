import React from 'react';
import './TrustBadges.css';

function TrustBadges() {
  return (
    <div className="trust-badges-container">
      <div className="trust-badge">
        <span className="badge-icon">🚚</span>
        <div className="badge-text">Fast Bilty Transport</div>
      </div>
      <div className="trust-badge">
        <span className="badge-icon">💰</span>
        <div className="badge-text">Wholesale Net Rates</div>
      </div>
      <div className="trust-badge">
        <span className="badge-icon">✅</span>
        <div className="badge-text">100% Original Brands</div>
      </div>
    </div>
  );
}

export default TrustBadges;
