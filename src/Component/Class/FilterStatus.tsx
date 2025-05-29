import React from 'react';
import './class.css';

const FilterStatus = () => {
  return (
    <div className="filter-status-container">
      <span className="filter-label">Sort</span>
      <div className="filter-box">
        <div className="filter-text-badge">
          <span className="filter-text">All Classes</span>
          <span className="filter-badge">9</span>
        </div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/3c848c9a6a4b2fcecbf1ace6e5d1b0cec56202d3?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
          alt="Filter icon"
          className="filter-icon"
        />
      </div>
    </div>
  );
};
export default FilterStatus;