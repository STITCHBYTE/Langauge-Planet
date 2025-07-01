import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useView } from '../../Context/ViewContext.tsx';
import './Style.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    studentView,
    setStudentView,
    currentUser,
    isLoadingUser,
    isTeacher,
    isMobileView,
    isMobileMenuOpen,
    toggleMobileMenu,
  } = useView();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileModal(false);
      }
    }
    if (showProfileModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileModal]);

  const username = currentUser?.first_name || 'User';
  const initials = username.slice(0, 2).toUpperCase();
  const greeting = `Hello ${username} 👋🏼`;

  const handleViewToggle = () => {
    const newView = !studentView;
    setStudentView(newView);
    if (isTeacher) {
      navigate('/Dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="w-full bg-white shadow-sm px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 sticky top-0 z-30 ml-0 transition-all">
      {/* Left: Greeting & Hamburger */}
      <div className="flex items-center w-full sm:w-auto justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">{greeting}</h1>
        </div>
        {/* Hamburger button - shown only on mobile and when menu is closed */}
        {isMobileView && !isMobileMenuOpen && (
          <button className="ml-2 sm:hidden" onClick={toggleMobileMenu}>
            <svg viewBox="0 0 100 80" width="25" height="25" fill="#333">
              <rect width="100" height="15" rx="8"></rect>
              <rect y="30" width="100" height="15" rx="8"></rect>
              <rect y="60" width="100" height="15" rx="8"></rect>
            </svg>
          </button>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto mt-2 sm:mt-0">
        {isTeacher ? (
          <div className="flex items-center gap-2">
            <span className={`text-xs sm:text-sm ${!studentView ? 'font-bold text-blue-600' : 'text-gray-500'}`}>Student View</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={studentView}
                onChange={handleViewToggle}
              />
              <span className="slider round"></span>
            </label>
            <span className={`text-xs sm:text-sm ${studentView ? 'font-bold text-blue-600' : 'text-gray-500'}`}>Teacher View</span>
          </div>
        ) : (
          <>
            <button className="icon-button student-header-icon hidden xs:inline-flex">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/bf3a6ccf-3c17-49c4-9d2d-fd955f10fb3c"
                alt="Notification"
                className="icon-image medium-icon"
              />
            </button>
            <button className="icon-button student-header-icon hidden xs:inline-flex">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/18fbc950-2776-483c-9ef4-b7160be90135"
                alt="Search"
                className="icon-image medium-icon"
              />
            </button>
          </>
        )}
        <div className="flex items-center gap-1">
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
        {/* Profile Avatar with Modal */}
        <div
          className="flex items-center gap-1 relative"
          ref={profileRef}
        >
          <div
            className="avatar-circle cursor-pointer"
            onClick={() => setShowProfileModal((prev) => !prev)}
            tabIndex={0}
            
            aria-haspopup="true"
            aria-expanded={showProfileModal}
          >
            <span className="avatar-text">{initials}</span>
          </div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f5fc99522c49d496f47526ab4ed29b9f4fee5422"
            alt="Dropdown"
            className="icon-image small-icon"
            onClick={() => setShowProfileModal((prev) => !prev)}
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={showProfileModal}
          />
          {/* Profile Modal */}
          {showProfileModal && (
            <div className="absolute right-0 top-12 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="font-semibold text-gray-800">{currentUser?.first_name} {currentUser?.last_name}</div>
                <div className="text-xs text-gray-500">{currentUser?.email}</div>
              </div>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                onClick={() => {
                  setShowProfileModal(false);
                  navigate('/profile');
                }}
              >
                Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
