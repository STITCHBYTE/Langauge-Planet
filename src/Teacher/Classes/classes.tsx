import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import axios from 'axios';
import Header from '../../Component/Home/Header.tsx';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import { useNavigate } from 'react-router-dom';
import Server_url from '../../config';
import { toast } from 'react-toastify';
import { FiEye, FiEdit, FiTrash2, FiMoreVertical, FiUsers, FiSearch, FiPlus, FiFilter, FiChevronDown } from 'react-icons/fi';

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
          <FiEye className="h-4 w-4" />
          View Class
        </button>
        <button onClick={onEdit} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
          <FiEdit className="h-4 w-4" />
          Edit Class
        </button>
        <button onClick={onDelete} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
          <FiTrash2 className="h-4 w-4" />
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
    <div 
      className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col relative p-4 cursor-pointer"
      onClick={() => onView(classItem.id)}
    >
      <div className="absolute top-3 right-3 z-10">
        <div ref={dropdownButtonRef} onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }} className="cursor-pointer text-slate-500 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100">
          <FiMoreVertical className="h-4 w-4" />
        </div>
        <DropdownMenu isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} onView={() => onView(classItem.id)} onEdit={() => onEdit(classItem.id)} onDelete={() => onDelete(classItem.id)} buttonRef={dropdownButtonRef} />
      </div>
      
      <div className="flex-grow">
        <img src={`${classItem.image}`} alt={classItem.title} className="w-16 h-16 object-cover rounded-lg mb-3" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/100'; }} />
        <h3 className="text-base font-semibold text-slate-800 mb-1 truncate">{classItem.title}</h3>
        <p className="text-xs text-slate-500 line-clamp-2">{classItem.description}</p>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${classItem.is_private ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{classItem.is_private ? 'Private Class' : 'Public Class'}</span>
        <div className="flex items-center text-slate-500 text-xs font-medium">
          <FiUsers className="h-3.5 w-3.5 mr-1.5" />
          {classItem.students || 0} Students
        </div>
      </div>
    </div>
  );
};

const ClassDashboard: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node) &&
        filterButtonRef.current && !filterButtonRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

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
      await axios.delete(`${Server_url}/api/classrooms/classroom/${classToDelete.id}/delete/`, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
      setClasses(prev => prev.filter(classItem => classItem.id !== classToDelete.id));
      toast.success('Class deleted successfully.');
    } catch (error) {
      toast.error('Error deleting class');
    } finally {
        setShowDeleteModal(false);
        setClassToDelete(null);
    }
  };

  const filteredClasses = classes
    .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(c => filterValue === '' || (filterValue === 'public' && !c.is_private) || (filterValue === 'private' && c.is_private));

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans">
      <div className="flex">
        <Sidebar isMobileMenuOpen={isSidebarOpen} toggleMobileMenu={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 flex flex-col lg:ml-64">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <main className="flex-grow p-6 lg:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex flex-col sm:flex-row items-center w-full md:w-auto gap-3">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search here..."
                    className="w-full sm:w-56 pl-10 pr-4 py-2 bg-white border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <div className="relative w-full sm:w-auto">
                  <button
                    ref={filterButtonRef}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-300/70 rounded-lg text-sm font-medium text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50"
                  >
                    <FiFilter className="h-4 w-4 text-slate-500" />
                    <span>{filterValue ? `Status: ${filterValue.charAt(0).toUpperCase() + filterValue.slice(1)}` : 'Filter By'}</span>
                    <FiChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isFilterOpen && (
                    <div ref={filterDropdownRef} className="absolute top-full mt-2 w-full sm:w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                      <div className="py-1">
                        <button onClick={() => { setFilterValue(''); setIsFilterOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">All</button>
                        <button onClick={() => { setFilterValue('public'); setIsFilterOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Public</button>
                        <button onClick={() => { setFilterValue('private'); setIsFilterOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Private</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition whitespace-nowrap flex items-center justify-center gap-2"
                onClick={() => navigate('/create-class')}
              >
                <FiPlus className="h-4 w-4" />
                Create New Class
              </button>
            </div>
            {loading ? <div className="text-center text-lg text-slate-600 pt-10">Loading classes...</div> :
             error ? <div className="text-center text-red-600 text-lg pt-10">Error: {error}</div> :
             filteredClasses.length === 0 ? <div className="text-center text-slate-600 text-lg pt-10">No classes found.</div> :
             (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
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