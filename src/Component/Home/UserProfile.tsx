import React, { useEffect, useState } from 'react';
import './Style.css';
import { useNavigate } from 'react-router-dom';
import Server_url from '../../config';
const UserProfile = () => {
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
const initials = user?.username.slice(0, 2).toUpperCase();
const navigate = useNavigate(); 
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${Server_url}/api/users/current`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        const data = await res.json();
        setUser({ username: data.username, email: data.email });
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    navigate('/')// or use navigation to login page
  };

  return (
    <div className="user-profile-container">
        <div className="user-profile-info">
            <span className="avatar-text">{initials}</span>
        <div className="user-profile-text">
          <p className="user-profile-name">{user?.username || 'Loading...'}</p>
          <p className="user-profile-email">{user?.email || '...'}</p>
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
