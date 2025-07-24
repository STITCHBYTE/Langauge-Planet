import React from 'react';
import './Style.css';
import { useNavigate } from 'react-router-dom';
import { useView } from '../../Context/ViewContext.tsx';

const UserProfile = () => {
  const navigate = useNavigate();
  const { currentUser, isLoadingUser } = useView();
  const initials = currentUser?.username?.slice(0, 2).toUpperCase() || '..';
  const displayName = currentUser?.username || 'Loading...';
  const displayEmail = currentUser?.email || '...';

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  if (isLoadingUser && !currentUser) {
    return (
      <div className="user-profile-container">
        <div className="user-profile-info">
          <span className="avatar-text">..</span>
          <div className="user-profile-text">
            <p className="user-profile-name">Loading...</p>
            <p className="user-profile-email">...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-info">
        {currentUser?.avatar_url ? (
          <img
            src={currentUser.avatar_url}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <span className="avatar-text">{initials}</span>
        )}
        <div className="user-profile-text">
          <p className="user-profile-name">{displayName}</p>
          <p className="user-profile-email">{displayEmail}</p>
        </div>
      </div>

      <div className="user-profile-actions">
        <button className="user-profile-settings-btn" onClick={handleLogout}>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/dae9e0e899f5b89254b5478a5e90b416bc945bde?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b"
            alt="Logout"
            className="user-profile-settings-icon"
          />
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
