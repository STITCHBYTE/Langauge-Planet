import React from 'react';
import './Style.css';
import { useNavigate } from 'react-router-dom';

interface SidebarMenuItemProps {
  icon: string;
  label: string;
}


const SidebarMenuItem = ({ icon, label }: SidebarMenuItemProps) => {
  const navigate = useNavigate();
   const handleClick = () => {
    if (label === 'Dashboard') {
      navigate('/');
    }
    else if (label === 'Lessons') {
      navigate('/learning');
    }
    else if (label === 'Classes') {
      navigate('/classroom');
    }
    else if (label === 'Games') {
      navigate('/game');
    }
    // Add more routes based on label if needed
  };
  return (
    <button className="sidebar-menu-item" onClick={handleClick}>
      <img
        src={icon}
        alt={`${label} icon`}
        className="sidebar-menu-icon"
      />
      <span className="sidebar-menu-label">{label}</span>
    </button>
  );
};

export default SidebarMenuItem;
