import React from 'react';
import { useLocation } from 'react-router-dom';
import './Style.css';

const Header = () => {
  const location = useLocation();

  // Mapping routes to greetings
  const routeGreetings: Record<string, string> = {
    '/': 'Hello Victoria 👋🏼',
    '/learning': 'Lessons',
    '/classroom': 'Classes',
    '/game': 'Games',
  };

  const greeting = routeGreetings[location.pathname] || 'Hello Victoria 👋🏼';

  return (
    <div className="header-container">
      <div className="header-greeting">
        <h1 className="header-title">{greeting}</h1>
      </div>

      <div className="header-actions">
        <button className="icon-button">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/bf3a6ccf-3c17-49c4-9d2d-fd955f10fb3c?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b"
            alt="Notification"
            className="icon-image medium-icon"
          />
        </button>

        <button className="icon-button">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/18fbc950-2776-483c-9ef4-b7160be90135?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b"
            alt="Search"
            className="icon-image medium-icon"
          />
        </button>

        <div className="icon-group">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/e9566c3c1deed7e865e669aef469b59439b094e0?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b"
            alt="Language"
            className="icon-image medium-icon"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f5fc99522c49d496f47526ab4ed29b9f4fee5422?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b"
            alt="Dropdown"
            className="icon-image small-icon"
          />
        </div>

        <div className="icon-group">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/82f6c675966f346a3f43cf18f68f834decf1767d?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b"
            alt="Profile"
            className="icon-image medium-icon"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f5fc99522c49d496f47526ab4ed29b9f4fee5422?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b"
            alt="Dropdown"
            className="icon-image small-icon"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;