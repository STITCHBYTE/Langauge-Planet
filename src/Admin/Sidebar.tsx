import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, LanguageIcon, BookOpenIcon, UsersIcon } from './DashboardIcons.tsx';
import { useView } from '../Context/ViewContext.tsx';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useView();

    // Helper to check if route is active
    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <aside className="w-64 bg-white flex flex-col border-r">
            <div className="h-20 flex items-center px-6 border-b">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/7d0ef5d1ebd1c8a7d379bdbf15b664f6acfd4a39"
            alt="Logo"
            className="sidebar-logo-img"
          />
                </div>
                <span className="ml-3 text-lg font-bold text-gray-800">Language Planet</span>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <a
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 cursor-pointer relative ${
                        isActive('/admin/dashboard') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => navigate('/admin/dashboard')}
                >
                    {isActive('/admin/dashboard') && (
                        <span className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r"></span>
                    )}
                    <HomeIcon className="w-5 h-5" />
                    <span className="ml-4 font-medium">Dashboard</span>
                </a>
                <a
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 cursor-pointer relative ${
                        isActive('/admin/languages') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => navigate('/admin/languages')}
                >
                    {isActive('/admin/languages') && (
                        <span className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r"></span>
                    )}
                    <LanguageIcon className="w-5 h-5" />
                    <span className="ml-4 font-medium">Languages</span>
                </a>
                <a
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 cursor-pointer relative ${
                        isActive('/admin/coupons') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => navigate('/admin/coupons')}
                >
                    {isActive('/admin/coupons') && (
                        <span className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r"></span>
                    )}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6M9 11h6M5 7h.01M5 11h.01M17 7h.01M17 11h.01M3 17a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10z" />
                    </svg>
                    <span className="ml-4 font-medium">Coupon Codes</span>
                </a>
                <a
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 cursor-pointer relative ${
                        isActive('/admin/lessons') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => navigate('/admin/lessons')}
                >
                    {isActive('/admin/lessons') && (
                        <span className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r"></span>
                    )}
                    <BookOpenIcon className="w-5 h-5" />
                    <span className="ml-4 font-medium">Lessons</span>
                </a>
                <a
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 cursor-pointer relative ${
                        isActive('/admin/students') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => navigate('/admin/students')}
                >
                    {isActive('/admin/students') && (
                        <span className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r"></span>
                    )}
                    <UsersIcon className="w-5 h-5" />
                    <span className="ml-4 font-medium">Students</span>
                </a>
                <a
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 cursor-pointer relative ${
                        isActive('/admin/teachers') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => navigate('/admin/teachers')}
                >
                    {isActive('/admin/teachers') && (
                        <span className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r"></span>
                    )}
                    <UsersIcon className="w-5 h-5" />
                    <span className="ml-4 font-medium">Teachers</span>
                </a>
            </nav>
            <div className="p-4 border-t">
                <div className="flex items-center">
                    {/* Show avatar if available, otherwise show initials */}
                    {currentUser.avatar_url ? (
                        <img src={currentUser.avatar_url} alt={currentUser.name || currentUser.first_name || 'User'} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg">
                            {(currentUser.name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'U')
                                .split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                        </div>
                    )}
                    <div className="ml-3">
                        {/* Show user name, email, initials, and avatar if available */}
                        {(() => {
                            const name = currentUser.name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'User';
                            const email = currentUser.email || '';
                            return (
                                <>
                                    <p className="font-semibold text-sm text-gray-800">{name}</p>
                                    <p className="text-xs text-gray-500">{email}</p>
                                </>
                            );
                        })()}
                    </div>
                    <button className="ml-auto text-gray-500 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
