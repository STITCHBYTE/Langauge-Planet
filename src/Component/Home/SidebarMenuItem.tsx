import React from 'react';
import './Style.css';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarMenuItemProps {
  icon: string;
  label: string;
  onNavigate?: () => void; // Prop to call after navigation
  isTeacher?: boolean;
  studentView?: boolean;
}

// Define route mappings for both views
const teacherRoutes: { [key: string]: string } = {
  Dashboard: '/teacher-dashboard',
  Student: '/students-page',
  Classes: '/teacher-classes',
  Lessons: '/lessons',
};

const studentRoutes: { [key: string]: string } = {
  Dashboard: '/Dashboard',
  Lessons: '/learning',
  Classes: '/classroom',
  Games: '/game',
};


const SidebarMenuItem = ({ 
  icon, 
  label, 
  onNavigate, 
  isTeacher = false,
  studentView = false
}: SidebarMenuItemProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getRoute = () => {
    if (!isTeacher) {
      return studentRoutes[label] || "/students-page";
    } else {
      if (studentView) {
        return teacherRoutes[label] 
      } else {
        return studentRoutes[label] 
      }
    }
  };

  const route = getRoute();
  const isActive = location.pathname === route;

  const handleClick = () => {
    navigate(route);
    if (onNavigate) {
      onNavigate(); // Call the callback if provided
    }
  };

  return (
    <div 
      className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      <img src={icon} alt={label} className="sidebar-menu-icon" />
      <span className="sidebar-menu-label">{label}</span>
    </div>
  );
};

export default SidebarMenuItem;
