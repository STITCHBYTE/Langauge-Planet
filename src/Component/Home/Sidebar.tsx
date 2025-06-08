import React, { useEffect, useState } from 'react';
import SidebarMenuItem from './SidebarMenuItem.tsx';
import UserProfile from './UserProfile.tsx';
import './Style.css';
import StudentIcon from './Assets/reading.png';
import Server_url from '../../config';
const Sidebar = () => {
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${Server_url}/api/users/current`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        const data = await res.json();
        setIsTeacher(data.is_teacher);
      } catch (err) {
        console.error('Failed to fetch user role', err);
      }
    };

    fetchUser();
  }, []);

  if (isTeacher === null) return null; // or loading skeleton

  const teacherMenu = [
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/d5af5c0e9aa7f43fc35ae5080ac91115d1a8bc9d?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b", label: "Dashboard" },
    { icon:  StudentIcon, label: "Student" },
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/ce252dd9a96ea8f88224bb455e7245216dec14bb?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b", label: "Classes" },
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/b065c80f31f032c1aace0ca4d7fdcf6d011f90c8?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b", label: "Lessons" },
  ];

  const studentMenu = [
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/d5af5c0e9aa7f43fc35ae5080ac91115d1a8bc9d?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b", label: "Dashboard" },
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/b065c80f31f032c1aace0ca4d7fdcf6d011f90c8?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b", label: "Lessons" },
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/ce252dd9a96ea8f88224bb455e7245216dec14bb?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b", label: "Classes" },
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/bff12902a5e5a70b79dcf423a31808be5e9542f8?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b", label: "Games" },
  ];

  const menuItems = isTeacher ? teacherMenu : studentMenu;

  return (
    <div className="sidebar-container">
      <div>
        <div className="sidebar-logo">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/7d0ef5d1ebd1c8a7d379bdbf15b664f6acfd4a39"
            alt="Logo"
            className="sidebar-logo-img"
          />
          <div className="sidebar-logo-text">
            <p className="sidebar-brand">Language Planet</p>
          </div>
        </div>

        <div className="sidebar-menu">
          {menuItems.map((item, index) => (
            <SidebarMenuItem
              key={index}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </div>
      </div>

      <UserProfile />
    </div>
  );
};

export default Sidebar;
