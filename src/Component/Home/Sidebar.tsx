import React from 'react';
import SidebarMenuItem from './SidebarMenuItem.tsx';
import UserProfile from './UserProfile.tsx';
import './Style.css';

const menuItems = [
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/d5af5c0e9aa7f43fc35ae5080ac91115d1a8bc9d?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b", label: "Dashboard" },
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/b065c80f31f032c1aace0ca4d7fdcf6d011f90c8?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b", label: "Lessons" },
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/ce252dd9a96ea8f88224bb455e7245216dec14bb?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b", label: "Classes" },
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/bff12902a5e5a70b79dcf423a31808be5e9542f8?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b", label: "Games" },
];

const Sidebar = () => {
  return (
    <div className="sidebar-container">
      <div>
        <div className="sidebar-logo">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/7d0ef5d1ebd1c8a7d379bdbf15b664f6acfd4a39?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b"
            alt="Logo"
            className="sidebar-logo-img"
          />
          <div className="sidebar-logo-text">
            <p className="sidebar-brand">Language Planet</p>
            {/* <p className="sidebar-subbrand"></p> */}
          </div>
        </div>

        <div className="sidebar-menu">
          {menuItems.map((item, index) => (
            <SidebarMenuItem
              // key={index}
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
