import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Style.css';
import Server_url from '../../config'
interface UserData {
  username: string;
  email?: string;
  first_name?: string;
  is_teacher?: boolean;
  [key: string]: any;
}

const Header = () => {
  const location = useLocation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [teacherView, setTeacherView] = useState(true); // toggle view for teachers

  useEffect(() => {
    const access = localStorage.getItem('authToken');
    if (!access) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${Server_url}/api/users/current/`, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        console.log('User Data:', data);
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const username = userData?.first_name || 'User';
  const initials = username.slice(0, 2).toUpperCase();
  const greeting = `Hello ${username} 👋🏼`;

  const handleToggle = () => {
    setTeacherView(!teacherView);
    // Optional: persist this state to localStorage or app context
  };

  return (
    <div className="header-container">
      <div className="header-greeting">
        <h1 className="header-title">{greeting}</h1>
      </div>

      <div className="header-actions">
        {userData?.is_teacher ? (
  <div className="view-toggle-wrapper">
    <span className={!teacherView ? 'label active' : 'label'}>Student View</span>
    <label className="switch">
      <input
        type="checkbox"
        checked={teacherView}
        onChange={() => setTeacherView(!teacherView)}
      />
      <span className="slider round"></span>
    </label>
    <span className={teacherView ? 'label active' : 'label'}>Teacher View</span>
  </div>
) : (
  <>
    {/* Stats for non-teacher */}
    <button className="icon-button">
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/bf3a6ccf-3c17-49c4-9d2d-fd955f10fb3c"
        alt="Notification"
        className="icon-image medium-icon"
      />
    </button>

    <button className="icon-button">
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/18fbc950-2776-483c-9ef4-b7160be90135"
        alt="Search"
        className="icon-image medium-icon"
      />
    </button>

    
  </>
)}
<div className="icon-group">
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/e9566c3c1deed7e865e669aef469b59439b094e0"
        alt="Language"
        className="icon-image medium-icon"
      />
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/f5fc99522c49d496f47526ab4ed29b9f4fee5422"
        alt="Dropdown"
        className="icon-image small-icon"
      />
    </div>
        <div className="icon-group">
          <div className="avatar-circle">
            <span className="avatar-text">{initials}</span>
          </div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f5fc99522c49d496f47526ab4ed29b9f4fee5422"
            alt="Dropdown"
            className="icon-image small-icon"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
