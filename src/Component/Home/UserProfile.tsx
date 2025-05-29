import React from 'react';
import './Style.css';

const UserProfile = () => {
  return (
    <div className="user-profile-container">
      <div className="user-profile-info">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/09cf9542d7c6280d0e3eb6a99e5af1c4b935c84d?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b"
          alt="User avatar"
          className="user-profile-avatar"
        />
        <div className="user-profile-text">
          <p className="user-profile-name">Victoria Akudo</p>
          <p className="user-profile-email">Victoria@example.com</p>
        </div>
      </div>
      <button className="user-profile-settings-btn">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/dae9e0e899f5b89254b5478a5e90b416bc945bde?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b"
          alt="Settings"
          className="user-profile-settings-icon"
        />
      </button>
    </div>
  );
};

export default UserProfile;
