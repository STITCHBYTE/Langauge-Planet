import React, { useEffect, useState, useRef } from 'react';
import {
  FiUsers,
  FiBook,
  FiMessageSquare,
  FiClipboard,
  FiPlus,
  FiMoreVertical,
} from 'react-icons/fi';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Header from '../../Component/Home/Header.tsx';
import { useParams, useNavigate } from 'react-router-dom';
import Server_url from '../../config.js';

// Dropdown Menu Component
const DropdownMenu = ({ 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete,
  buttonRef 
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50"
    >
      <div className="py-1">
        <button
          onClick={onEdit}
          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button
          onClick={onDelete}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Discussion Item Component
const DiscussionItem = ({ discussion, onEdit, onDelete }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownButtonRef = useRef(null);

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleEdit = () => {
    setIsDropdownOpen(false);
    onEdit(discussion.id);
  };

  const handleDelete = () => {
    setIsDropdownOpen(false);
    onDelete(discussion);
  };

  return (
    <li className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer relative">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{discussion.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Created on {new Date(discussion.created_at).toLocaleString()}
          </p>
        </div>
        <div className="relative">
          <button
            ref={dropdownButtonRef}
            onClick={handleDropdownToggle}
            className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200"
          >
            <FiMoreVertical />
          </button>
          
          <DropdownMenu
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            buttonRef={dropdownButtonRef}
          />
        </div>
      </div>
    </li>
  );
};

// Assignment Item Component
const AssignmentItem = ({ assignment, onEdit, onDelete }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownButtonRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleEdit = () => {
    setIsDropdownOpen(false);
    onEdit(assignment.id);
  };

  const handleDelete = () => {
    setIsDropdownOpen(false);
    onDelete(assignment);
  };

  // Add click outside functionality
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg relative">
      <div>
        <h4 className="text-sm font-medium text-gray-800">{assignment.title}</h4>
        <p className="text-xs text-gray-500">
          Due: {new Date(assignment.due_date).toLocaleDateString()}
        </p>
      </div>
      <div className="relative">
        <button
          ref={dropdownButtonRef}
          onClick={handleDropdownToggle}
          className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200"
        >
          <FiMoreVertical />
        </button>
        
        {/* Updated dropdown with ref and click outside handling */}
        <div 
          ref={dropdownRef}
          className={`absolute right-0 bottom-full mb-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 ${isDropdownOpen ? 'block' : 'hidden'}`}
        >
          <div className="py-1">
            <button
              onClick={handleEdit}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

const ClassPage = () => {
  const { id: classId } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  
  // State for delete modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteDiscussionModal, setShowDeleteDiscussionModal] = useState(false);
  const [showDeleteAssignmentModal, setShowDeleteAssignmentModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    const fetchClassData = async () => {
      try {
        const response = await fetch(
          `${Server_url}/api/classrooms/classroom/${classId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch class data');
        const data = await response.json();
        setClassData(data);
      } catch (error) {
        console.error('Error fetching class data:', error);
      }
    };

    const fetchDiscussions = async () => {
      try {
        const response = await fetch(
          `${Server_url}/api/classrooms/classroom/${classId}/discussions/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch discussions');
        const data = await response.json();
        setDiscussions(data);
      } catch (error) {
        console.error('Error fetching discussions:', error);
      } finally {
        setLoadingDiscussions(false);
      }
    };

    const fetchAssignments = async () => {
      try {
        const response = await fetch(
          `${Server_url}/api/classrooms/classroom/${classId}/assignments/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch assignments');
        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoadingAssignments(false);
      }
    };

    if (classId) {
      fetchClassData();
      fetchDiscussions();
      fetchAssignments();
    }
  }, [classId]);

  // Handle edit class
  const handleEditClass = () => {
    console.log(`🔧 Navigating to edit class: ${classId}`);
    navigate(`/edit-class/${classId}`);
  };

  // Handle delete class
  const handleDeleteClass = () => {
    setShowDeleteModal(true);
  };

  // Handle edit discussion
  const handleEditDiscussion = (discussionId) => {
    console.log(`🔧 Editing discussion: ${discussionId}`);
    navigate(`/edit-discussion/${discussionId}`);
  };

  // Handle delete discussion
  const handleDeleteDiscussion = (discussion) => {
    setItemToDelete(discussion);
    setShowDeleteDiscussionModal(true);
  };

  // Handle edit assignment
  const handleEditAssignment = (assignmentId) => {
    console.log(`🔧 Editing assignment: ${assignmentId}`);
    navigate(`/edit-assignment/${assignmentId}`);
  };

  // Handle delete assignment
  const handleDeleteAssignment = (assignment) => {
    setItemToDelete(assignment);
    setShowDeleteAssignmentModal(true);
  };

  // Confirm delete class
  const confirmDeleteClass = async () => {
    if (!classData) return;

    setIsDeleting(true);
    const token = localStorage.getItem('authToken');
    
    try {
      console.log(`🗑️ Attempting to delete class: ${classId}`);
      
      const response = await fetch(`${Server_url}/api/classrooms/${classId}/delete/`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`Delete response status: ${response.status}`);

      if (response.ok || response.status === 204) {
        setShowDeleteModal(false);
        alert(`Class "${classData.title}" has been deleted successfully!`);
        navigate('/teacher-classes');
      } else {
        const errorData = await response.text();
        console.error('Delete failed:', errorData);
        throw new Error(`Failed to delete class: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert(`An error occurred while deleting the class: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirm delete discussion
  const confirmDeleteDiscussion = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    const token = localStorage.getItem('authToken');
    
    try {
      console.log(`🗑️ Attempting to delete discussion: ${itemToDelete.id}`);
      
      const response = await fetch(`${Server_url}/api/classrooms/discussions/${itemToDelete.id}/delete/`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok || response.status === 204) {
        setDiscussions(prev => prev.filter(d => d.id !== itemToDelete.id));
        setShowDeleteDiscussionModal(false);
        setItemToDelete(null);
        alert(`Discussion "${itemToDelete.title}" has been deleted successfully!`);
      } else {
        throw new Error(`Failed to delete discussion: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting discussion:', error);
      alert(`An error occurred while deleting the discussion: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirm delete assignment
  const confirmDeleteAssignment = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    const token = localStorage.getItem('authToken');
    
    try {
      console.log(`🗑️ Attempting to delete assignment: ${itemToDelete.id}`);
      
      const response = await fetch(`${Server_url}/api/classrooms/assignments/${itemToDelete.id}/delete/`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok || response.status === 204) {
        setAssignments(prev => prev.filter(a => a.id !== itemToDelete.id));
        setShowDeleteAssignmentModal(false);
        setItemToDelete(null);
        alert(`Assignment "${itemToDelete.title}" has been deleted successfully!`);
      } else {
        throw new Error(`Failed to delete assignment: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert(`An error occurred while deleting the assignment: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!classData) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center ml-[17%]">
          <p className="text-gray-500">Loading class details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar className="hidden lg:block fixed left-0 top-0 h-full w-[17%] z-20" />
      {/* Main Content */}
      <div className="flex-1 bg-gray-50/50 p-3 sm:p-4 md:p-6 lg:p-8 text-gray-800 ml-0 lg:ml-[17%] overflow-y-auto min-h-screen">
        <Header />

        {/* Top buttons */}
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex flex-row gap-2 w-full sm:w-auto">
            <button className="flex-1 min-w-0 bg-white border border-blue-600 text-blue-600 px-2 py-1 rounded-lg font-semibold text-xs sm:text-sm hover:bg-blue-50 transition">
              View Students
            </button>
            <button className="flex-1 min-w-0 bg-white border border-blue-600 text-blue-600 px-2 py-1 rounded-lg font-semibold text-xs sm:text-sm hover:bg-blue-50 transition">
              View Assignment Report
            </button>
          </div>
          <div className="flex flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <button 
              onClick={handleDeleteClass}
              className="flex-1 min-w-0 bg-red-500 text-white px-2 py-1 rounded-lg font-semibold text-xs sm:text-sm hover:bg-red-600 transition"
            >
              Delete Class
            </button>
            <button className="flex-1 min-w-0 bg-white border border-blue-600 text-blue-600 px-2 py-1 rounded-lg font-semibold text-xs sm:text-sm hover:bg-blue-50 transition">
              Student View
            </button>
            <button className="flex-1 min-w-0 bg-blue-600 text-white px-2 py-1 rounded-lg font-semibold text-xs sm:text-sm hover:bg-blue-700 transition">
              Publish Class
            </button>
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className="md:col-span-2 flex flex-col gap-4 md:gap-6 lg:gap-8">
            {/* Class Details */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm relative">
              <button 
                onClick={handleEditClass}
                className="absolute top-4 right-4 md:top-6 md:right-6 bg-white border border-blue-600 text-blue-600 px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold text-xs md:text-sm hover:bg-blue-50 transition"
              >
                📝 Edit Basic Details
              </button>
              {classData.image && (
                <img
                  src={classData.image}
                  alt="Class"
                  className="w-[40%] sm:w-[25%] md:w-[20%] h-40 md:h-[10rem] object-cover rounded-lg mb-4 md:mb-6"
                />
              )}
              <div className="flex flex-col md:flex-row items-start gap-2 md:gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">{classData.title}</h1>
                  <p className="mt-2 text-gray-600 max-w-md">{classData.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
                    <span className={`px-3 py-1 rounded-full font-medium ${classData.is_private ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {classData.is_private ? 'Private Class' : 'Public Class'}
                    </span>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiUsers />
                      <span>{classData.student_count || 0} Students</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Discussions Section */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-base md:text-lg font-bold text-gray-900">Class Discussions</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Discussions will appear to your students in the same order they appear here.
              </p>
              {loadingDiscussions ? (
                <p className="text-gray-500 py-6">Loading discussions...</p>
              ) : discussions.length === 0 ? (
                <div className="text-center py-8 md:py-10 my-4 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="mx-auto bg-gray-100 rounded-full h-12 w-12 md:h-16 md:w-16 flex items-center justify-center">
                    <FiMessageSquare className="text-gray-400 h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <p className="mt-4 font-semibold text-gray-700">No Discussions Added</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Click "Add Discussion" to create one.
                  </p>
                </div>
              ) : (
                <ul className="mt-4 space-y-3 md:space-y-4">
                  {discussions.map((discussion) => (
                    <DiscussionItem
                      key={discussion.id}
                      discussion={discussion}
                      onEdit={handleEditDiscussion}
                      onDelete={handleDeleteDiscussion}
                    />
                  ))}
                </ul>
              )}
              <button
                className="mt-6 w-full bg-blue-600 text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={() => navigate(`/add-discussion/${classId}`)}
              >
                <FiPlus />
                Add Discussion
              </button>
            </div>
          </div>

          {/* Right Panel: Assignments & Lessons */}
          <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
            {/* Assignments */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-visible">
              <h2 className="text-base md:text-lg font-bold text-gray-900">Class Assignments</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Assignments will be visible when the paired discussions are unlocked.
              </p>
              {loadingAssignments ? (
                <p className="text-gray-500 py-6">Loading assignments...</p>
              ) : assignments.length === 0 ? (
                <div className="text-center py-6 md:py-8 my-4 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="mx-auto bg-gray-100 rounded-full h-12 w-12 md:h-16 md:w-16 flex items-center justify-center">
                    <FiClipboard className="text-gray-400 h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <p className="mt-4 font-semibold text-gray-700">No Assignment Added</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1 px-2">
                    Click "Add Assignment" to create one.
                  </p>
                </div>
              ) : (
                <ul
                  className="mt-4 space-y-2 md:space-y-3 max-h-72 pr-2"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {assignments.map((assignment) => (
                    <AssignmentItem
                      key={assignment.id}
                      assignment={assignment}
                      onEdit={handleEditAssignment}
                      onDelete={handleDeleteAssignment}
                    />
                  ))}
                </ul>
              )}
              <button 
                className="mt-6 w-full bg-blue-600 text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition" 
                onClick={() => navigate(`/add-assignment/${classId}`)}
              >
                <FiPlus />
                Add Assignment
              </button>
            </div>

            {/* Lessons */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-base md:text-lg font-bold text-gray-900">Lesson Assigned</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                All lesson assigned to this class will be displayed here
              </p>
              <div className="mt-4 space-y-2 md:space-y-3">
                {["Basic Spanish Culture", "Lorem ipsum dolor sit amet consectetur", "Lorem ipsum dolor sit amet"].map((lesson, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 md:p-3 rounded-lg">
                    <span className="font-medium text-gray-700 text-xs md:text-sm">{lesson}</span>
                    <button className="text-gray-500 hover:text-gray-800">
                      <FiMoreVertical />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modals (unchanged) */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteClass}
          title="Delete Class"
          message={`Are you sure you want to delete "${classData?.title}"? This action cannot be undone and will remove all associated discussions, assignments, and student data.`}
          confirmText={isDeleting ? "Deleting..." : "Delete Class"}
        />
        <ConfirmationModal
          isOpen={showDeleteDiscussionModal}
          onClose={() => {
            setShowDeleteDiscussionModal(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDeleteDiscussion}
          title="Delete Discussion"
          message={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
          confirmText={isDeleting ? "Deleting..." : "Delete Discussion"}
        />
        <ConfirmationModal
          isOpen={showDeleteAssignmentModal}
          onClose={() => {
            setShowDeleteAssignmentModal(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDeleteAssignment}
          title="Delete Assignment"
          message={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
          confirmText={isDeleting ? "Deleting..." : "Delete Assignment"}
        />
      </div>
    </div>
  );
};

export default ClassPage;
