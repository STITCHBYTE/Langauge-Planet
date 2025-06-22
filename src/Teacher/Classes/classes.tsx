import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import axios from 'axios';
import Header from '../../Component/Home/Header.tsx'; // Assuming Header can accept an onMenuClick prop
import Sidebar from '../../Component/Home/Sidebar.tsx'; // Assuming Sidebar can be controlled
import { useNavigate } from 'react-router-dom';
import Server_url from '../../config';

// --- Reusable Components (included for completeness) ---

// Interface representing each class
interface Class {
  id: string;
  title: string;
  description: string;
  is_private: boolean;
  image: string;
  students?: number;
}

// Dropdown Menu Component
const DropdownMenu: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onView: () => void;
  onEdit: () => void; 
  onDelete: () => void;
  buttonRef: React.RefObject<HTMLDivElement | null>;
}> = ({ isOpen, onClose, onView, onEdit, onDelete, buttonRef }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
      <div className="py-1">
        <button onClick={onView} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
          {/* View Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          View Class
        </button>
        <button onClick={onEdit} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
          {/* Edit Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Edit Class
        </button>
        <button onClick={onDelete} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
          {/* Delete Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Delete Class
        </button>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal: React.FC<{
  isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmText: string;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

// Class Card Component
const ClassCard: React.FC<{
  classItem: Class; onView: (id: string) => void; onEdit: (id: string) => void; onDelete: (id: string) => void;
}> = ({ classItem, onView, onEdit, onDelete }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownButtonRef = useRef<HTMLDivElement>(null);
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col overflow-hidden relative">
      <div className="absolute top-4 right-4 z-10">
        <div ref={dropdownButtonRef} onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }} className="cursor-pointer text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
        </div>
        <DropdownMenu isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} onView={() => onView(classItem.id)} onEdit={() => onEdit(classItem.id)} onDelete={() => onDelete(classItem.id)} buttonRef={dropdownButtonRef} />
      </div>
      <div className="p-4">
        <img src={`${classItem.image}`} alt={classItem.title} className="w-24 h-24 object-cover rounded-md mb-4" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/100'; }} />
      </div>
      <div className="p-4 pt-0 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{classItem.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{classItem.description}</p>
        <hr className="my-3 border-gray-200" />
        <div className="flex items-center justify-between mt-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${classItem.is_private ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{classItem.is_private ? 'Private' : 'Public'}</span>
          <div className="flex items-center text-gray-600 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 015.356-1.857M17 20v-2c0-.653-.133-1.272-.375-1.84M2 12A8 8 0 0110 4h.01M17 12a8 8 0 01-16 0" /></svg>
            {classItem.students || 0} Students
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Responsive Dashboard Component ---
const ClassDashboard: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar
  const navigate = useNavigate();

  const API_URL = `${Server_url}/api/classrooms/my-classrooms/`;
  const TOKEN = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Class[]>(API_URL, { headers: { Authorization: `Bearer ${TOKEN}` } });
        setClasses(response.data);
      } catch (err) {
        setError('Failed to fetch classes.');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleViewClass = (classId: string) => navigate(`/Class_info_Page/${classId}`);
  const handleEditClass = (classId: string) => navigate(`/edit-class/${classId}`);
  const handleDeleteClass = (classId: string) => {
    const classItem = classes.find(c => c.id === classId);
    if (classItem) {
      setClassToDelete(classItem);
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteClass = async () => {
    if (!classToDelete) return;
    try {
      await axios.delete(`${Server_url}/api/classrooms/${classToDelete.id}/delete/`, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
      setClasses(prev => prev.filter(classItem => classItem.id !== classToDelete.id));
    } catch (error) {
      alert('Error deleting class');
    } finally {
        setShowDeleteModal(false);
        setClassToDelete(null);
    }
  };

  const filteredClasses = classes
    .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(c => filterValue === '' || (filterValue === 'public' && !c.is_private) || (filterValue === 'private' && c.is_private));

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="flex">
        {/* Pass sidebar open state to the Sidebar component if it supports it */}
        <Sidebar isMobileMenuOpen={isSidebarOpen} toggleMobileMenu={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col lg:ml-64">
          {/* Pass a function to the header to toggle the sidebar */}
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <main className="flex-grow p-4 sm:p-6 lg:p-8">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex flex-col sm:flex-row items-center w-full md:w-auto gap-3">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search classes..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <select
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <button
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition whitespace-nowrap"
                onClick={() => navigate('/create-class')}
              >
                + Create New Class
              </button>
            </div>

            {/* Content Area */}
            {loading ? <div className="text-center text-lg text-gray-600">Loading classes...</div> :
             error ? <div className="text-center text-red-600 text-lg">Error: {error}</div> :
             filteredClasses.length === 0 ? <div className="text-center text-gray-600 text-lg">No classes found.</div> :
             (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredClasses.map((classItem) => (
                  <ClassCard key={classItem.id} classItem={classItem} onView={handleViewClass} onEdit={handleEditClass} onDelete={handleDeleteClass} />
                ))}
              </div>
             )
            }
          </main>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setClassToDelete(null); }}
        onConfirm={confirmDeleteClass}
        title="Delete Class"
        message={`Are you sure you want to delete "${classToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Class"
      />
    </div>
  );
};

export default ClassDashboard;