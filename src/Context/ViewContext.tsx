import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import Server_url from '../config';

interface CurrentUser {
  id: string;
  first_name?: string;
  last_name?: string;
  is_teacher?: boolean;
  username?: string;
  email?: string;
  avatar_url?: string;
}

interface ViewContextType {
  studentView: boolean;
  setStudentView: (view: boolean) => void;
  isTeacher: boolean | null;
  currentUser: CurrentUser | null;
  isLoadingUser: boolean;
  isMobileView: boolean;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentView, setStudentViewState] = useState(Cookies.get('is_student_view') === 'true');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  const setStudentView = (view: boolean) => {
    setStudentViewState(view);
    Cookies.set('is_student_view', view ? 'true' : 'false');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUser(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setCurrentUser(null);
        setIsLoadingUser(false);
        return;
      }

      try {
        const res = await fetch(`${Server_url}/api/users/current`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data: CurrentUser = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error('Failed to fetch user data in ViewProvider:', err);
        setCurrentUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobileView(mobile);
      if (!mobile && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);


  return (
    <ViewContext.Provider value={{
      studentView,
      setStudentView,
      isTeacher: currentUser?.is_teacher ?? null,
      currentUser,
      isLoadingUser,
      isMobileView,
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu
    }}>
      {children}
    </ViewContext.Provider>
  );
};

export const useView = () => {
  const context = useContext(ViewContext);
  if (!context) throw new Error('useView must be used within a ViewProvider');
  return context;
};