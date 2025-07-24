import React, { useEffect } from 'react';
import { useView } from '../../Context/ViewContext.tsx';
import UserProfile from './UserProfile.tsx';
import './Style.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiBookOpen, 
  FiClipboard, 
  FiPlayCircle 
} from 'react-icons/fi';
interface SidebarMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onNavigate?: () => void;
  isTeacher: boolean;
  studentView: boolean;
}

const teacherRoutes: { [key: string]: string } = {
  Dashboard: '/teacher-dashboard', 
  Student: '/students-page',
  Classes: '/teacher-classes',
  Lessons: '/lessons',
};

const studentRoutes: { [key:string]: string } = {
  Dashboard: '/Dashboard',
  Lessons: '/learning',
  Classes: '/classroom',
  Games: '/game',
};

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ 
  icon, 
  label, 
  onNavigate, 
  isTeacher,
  studentView
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getRoute = () => {
    if (isTeacher && studentView) {
      return teacherRoutes[label] || '/teacher-dashboard';
    }
    return studentRoutes[label] || '/Dashboard';
  };

  const route = getRoute();
  const isActive = location.pathname === route;

  const handleClick = () => {
    navigate(route);
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div 
      className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      <span className="sidebar-menu-icon">{icon}</span>
      <span className="sidebar-menu-label">{label}</span>
    </div>
  );
};
const Sidebar: React.FC = () => {
  const { 
    studentView, 
    isTeacher, 
    isLoadingUser,
    isMobileView,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu
  } = useView();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    
    if (currentPath === '/Dashboard' || currentPath === '/teacher-dashboard') {
      if (isTeacher && studentView) {
        if(currentPath !== '/teacher-dashboard') navigate('/teacher-dashboard', { replace: true });
      } else {
        if(currentPath !== '/Dashboard') navigate('/Dashboard', { replace: true });
      }
    }
  }, [isTeacher, studentView, location.pathname, navigate]);


  if (isLoadingUser && !isMobileMenuOpen) {
    return <div className="sidebar-container">Loading...</div>;
  }
  const teacherMenu = [
    { icon: <FiHome />, label: "Dashboard" },
    { icon: <FiUsers />, label: "Student" },
    { icon: <FiBookOpen />, label: "Classes" },
    { icon: <FiClipboard />, label: "Lessons" },
  ];
  const studentMenu = [
    { icon: <FiHome />, label: "Dashboard" },
    { icon: <FiClipboard />, label: "Lessons" },
    { icon: <FiBookOpen />, label: "Classes" },
    { icon: <FiPlayCircle />, label: "Games" },
  ];

  let menuItems;
  if (isTeacher) {
    menuItems = studentView ? teacherMenu : studentMenu;
  } else {
    menuItems = studentMenu;
  }

  return (
    <div className={`sidebar-container ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <div className="sidebar-main-content">
        {isMobileView && isMobileMenuOpen && (
          <button className="mobile-menu-close-button" onClick={toggleMobileMenu}>
            &times;
          </button>
        )}
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
        <nav className="sidebar-menu">
          {menuItems.map((item, index) => (
            <SidebarMenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              isTeacher={isTeacher}
              studentView={studentView}
              onNavigate={isMobileView ? closeMobileMenu : undefined}
            />
          ))}
        </nav>
      </div>
      
      <div className="sidebar-footer">
        <UserProfile />
      </div>
    </div>
  );
};

export default Sidebar;