import React from 'react'; // Removed useEffect, useState
import './Style.css';
import { useNavigate } from 'react-router-dom';
// Server_url is no longer needed here
import { useView } from '../../Context/ViewContext.tsx'; // Import useView

const UserProfile = () => {
  // const [user, setUser] = useState<{ username: string; email: string } | null>(null); // Removed
  const navigate = useNavigate();
  const { currentUser, isLoadingUser } = useView(); // Get currentUser from context

  // useEffect for fetchUser is removed

  // Derive user details from currentUser obtained from context
  // Using username for initials as per original code. If first_name is preferred and available:
  // const initials = currentUser?.first_name ? currentUser.first_name.slice(0, 2).toUpperCase() : currentUser?.username?.slice(0, 2).toUpperCase() || '..';
  const initials = currentUser?.username?.slice(0, 2).toUpperCase() || '..';
  const displayName = currentUser?.username || 'Loading...';
  const displayEmail = currentUser?.email || '...';

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    // Optionally clear context state related to user if ViewProvider handles this on auth change
    navigate('/'); // or use navigation to login page
  };

  if (isLoadingUser && !currentUser) {
    // Optional: Render a loading skeleton for UserProfile
    return (
      <div className="user-profile-container">
        <div className="user-profile-info">
          <span className="avatar-text">..</span>
          <div className="user-profile-text">
            <p className="user-profile-name">Loading...</p>
            <p className="user-profile-email">...</p>
          </div>
        </div>
        {/* Logout button can be hidden or disabled during loading */}
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-info">
        <span className="avatar-text">{initials}</span>
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
