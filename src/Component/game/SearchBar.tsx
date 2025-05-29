"use client";

import * as React from "react";
import "./GameCard.css";

const SearchBar = () => {
  return (
    <div className="search-bar">
      <div className="search-bar__container">
        <div className="search-bar__input-wrapper">
          <div className="search-bar__input-box">
            <div className="search-bar__icon-input">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/1a42bfb69986530107aa15849b75d69ea8f6a41f?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
                alt="Search icon"
                className="search-bar__icon"
              />
              <input
                type="text"
                placeholder="Search for your friends by name or username"
                className="search-bar__input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SearchBar;