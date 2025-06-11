import React, { useEffect, useState } from 'react';
import './Style.css';
import { NavLink, useNavigate } from 'react-router-dom';
import Server_url from '../../config';
interface SidebarMenuItemProps {
  icon: string;
  label: string;
  onNavigate?: () => void;
}

const studentRoutes: { [key: string]: string } = {
  Dashboard: '/Dashboard',
  Lessons: '/learning',
  Classes: '/classroom',
  Games: '/game',
};

const teacherRoutes: { [key: string]: string } = {
  Dashboard: '/Dashboard',
  Student: '/students-page',
  Classes: '/teacher-classes',
  Lessons: '/teacher-lesson-view',
};

const SidebarMenuItem = ({ icon, label, onNavigate }: SidebarMenuItemProps) => {
  const navigate = useNavigate();
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await fetch(`${Server_url}/api/users/current`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        const data = await res.json();
        setIsTeacher(data.is_teacher);
      } catch (error) {
        console.error('Error fetching user role:', error);
        setIsTeacher(false); // Default to student if error
      }
    };

    fetchUserRole();
  }, []);

  // Wait for user role to be fetched
  if (isTeacher === null) return null;

  const routes = isTeacher ? teacherRoutes : studentRoutes;
  const destinationPath = routes[label];

  const handleClick = () => {
    if (destinationPath) {
      navigate(destinationPath);
      if (onNavigate) onNavigate();
    } else {
      console.warn(`No route defined for label: "${label}"`);
    }
  };

  if (destinationPath) {
    return (
      <NavLink
        to={destinationPath}
        className={({ isActive }) => 
          `sidebar-menu-item ${isActive ? 'active' : ''}`
        }
        onClick={onNavigate}
      >
        <img src={icon} alt={`${label} icon`} className="sidebar-menu-icon" />
        <span className="sidebar-menu-label">{label}</span>
      </NavLink>
    );
  }

  return (
    <button className="sidebar-menu-item" onClick={handleClick}>
      <img src={icon} alt={`${label} icon`} className="sidebar-menu-icon" />
      <span className="sidebar-menu-label">{label}</span>
    </button>
  );
};

export default SidebarMenuItem;
