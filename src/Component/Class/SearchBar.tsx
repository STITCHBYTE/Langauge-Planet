import React from 'react';
import './class.css';

const SearchBar = () => {
  return (
    <div className="search-container">
      <div className="search-wrapper">
        <div className="search-box">
          <div className="search-icon-text">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/1a42bfb69986530107aa15849b75d69ea8f6a41f?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
              className="search-icon"
              alt="Search icon"
            />
            <span className="search-placeholder">Search here...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SearchBar;