import React, { useEffect, useState, useRef } from 'react';
import {
  FiUsers,
  FiBook,
  FiMessageSquare,
  FiClipboard,
  FiPlus,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
} from 'react-icons/fi';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Header from '../../Component/Home/Header.tsx';
import { useParams, useNavigate } from 'react-router-dom';
import Server_url from '../../config.js';
import { toast } from "react-toastify";
import { Dialog } from '@headlessui/react'; // If you use headlessui for modal, otherwise use your own modal

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
          <FiEdit className="h-4 w-4" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
        >
          <FiTrash2 className="h-4 w-4" />
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
  const navigate = useNavigate(); // Add navigate hook

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

  const handleNavigateToForum = (e) => {
    // Stop propagation if the click is on the dropdown button
    if (dropdownButtonRef.current && dropdownButtonRef.current.contains(e.target)) {
      return;
    }
    navigate(`/discussion-forum/${discussion.id}`);
  };

  return (
    <li 
      onClick={handleNavigateToForum}
      className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer relative"
    >
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
              <FiEdit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <FiTrash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

const LessonMenuItem = ({ lesson, navigate }) => {
  const [showLessonMenu, setShowLessonMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowLessonMenu(false);
      }
    };
    if (showLessonMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLessonMenu]);

  return (
    <div className="flex justify-between items-center bg-gray-50 p-2 md:p-3 rounded-lg relative">
      <span className="font-medium text-gray-700 text-xs md:text-sm">{lesson.title}</span>
      <button
        className="text-gray-500 hover:text-gray-800"
        onClick={() => setShowLessonMenu((prev) => !prev)}
      >
        <FiMoreVertical />
      </button>
      {showLessonMenu && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
        >
          <button
            className="w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-blue-50"
            onClick={() => {
              setShowLessonMenu(false);
              navigate(`/lesson-view/${lesson.id}`);
            }}
          >
            Go to Lesson
          </button>
        </div>
      )}
    </div>
  );
};

const ClassPage = () => {
  const { id: classId } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignedLessons, setAssignedLessons] = useState([]); // <-- NEW
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // Modal state
  const [showAssignLessonModal, setShowAssignLessonModal] = useState(false);
  const [teacherLessons, setTeacherLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

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

        // Fetch assigned lessons using lesson IDs from class data
        if (Array.isArray(data.lessons) && data.lessons.length > 0) {
          const lessonPromises = data.lessons.map(async (lessonId) => {
            const lessonRes = await fetch(`${Server_url}/api/lessons/lesson/${lessonId}/`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (lessonRes.ok) {
              return await lessonRes.json();
            }
            return null;
          });
          const lessons = (await Promise.all(lessonPromises)).filter(Boolean);
          setAssignedLessons(lessons);
        } else {
          setAssignedLessons([]);
        }
      } catch (error) {
        setClassData(null);
        setAssignedLessons([]);
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

  // Fetch teacher's lessons for modal
  const openAssignLessonModal = async () => {
    setShowAssignLessonModal(true);
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${Server_url}/api/lessons/lesson/my/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTeacherLessons(data.results || data);
      }
    } catch (err) {
      setTeacherLessons([]);
    }
  };

  // Assign lesson to class
  const handleAssignLesson = async () => {
    if (!selectedLessonId) return;
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${Server_url}/api/classrooms/classroom/${classId}/assign-lesson/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lesson_id: selectedLessonId })
      });
      if (res.ok) {
        // Refresh assigned lessons
        const updated = await res.json();
        setAssignedLessons(updated.results || updated);
        setShowAssignLessonModal(false);
        setSelectedLessonId(null);
        toast.success('Lesson assigned successfully!');
      } else {
        toast.error('Failed to assign lesson.');
      }
    } catch (err) {
      toast.error('Error assigning lesson.');
    }
  };

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
      
      const response = await fetch(`${Server_url}/api/classrooms/classroom/${classId}/delete/`, {
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

  // Publish class handler
  const handlePublishClass = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(
        `${Server_url}/api/classrooms/classroom/${classId}/toggle-published/`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        toast.success("Class published status updated!");
        // Optionally, refresh class data
        const updated = await res.json();
        setClassData((prev) => ({ ...prev, ...updated }));
      } else {
        toast.error("Failed to update publish status.");
      }
    } catch (err) {
      toast.error("Error updating publish status.");
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
    <div className="bg-gray-100 min-h-screen lg:ml-[17%]">
    <Header />
    <div className="flex">
      {/* Sidebar */}
      <Sidebar className="hidden lg:block fixed left-0 top-0 h-full w-[17%] z-10" />

      {/* Main Content - Single scroll container */}
      <div className="flex-1 bg-gray-50/50 p-3 sm:p-4 md:p-6 lg:p-8 text-gray-800 ml-0 min-h-screen">

        {/* Top buttons */}
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex flex-row gap-2 w-full sm:w-auto">
            <button 
              onClick={() => navigate(`/class/${classId}/enrolled-students`)}
              className="flex-1 min-w-[140px] bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg font-semibold text-sm hover:bg-slate-50 transition"
            >
              View Students
            </button>
            <button
              className="flex-1 min-w-[220px] bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg font-semibold text-sm hover:bg-slate-50 transition"
              onClick={() => navigate(`/reports/${classId}`)}
            >
              View Assignment Report
            </button>
          </div>
          <div className="flex flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <button 
              onClick={handleDeleteClass}
              className="flex-1 min-w-[160px] bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm hover:bg-red-600 transition"
            >
              Delete Class
            </button>
            <button className="flex-1 min-w-[160px] bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition"
              onClick={handlePublishClass}
            >
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
                className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 bg-white border border-slate-300 text-slate-600 px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold text-xs md:text-sm hover:bg-slate-50 transition"
              >
                <FiEdit className="h-4 w-4" />
                <span>Edit Details</span>
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
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base md:text-lg font-bold text-gray-900">Lesson Assigned</h2>
                <button
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs md:text-sm hover:bg-blue-700 transition"
                  onClick={openAssignLessonModal}
                >
                  Assign Lesson
                </button>
              </div>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                All lessons assigned to this class will be displayed here
              </p>
              <div className="mt-4 space-y-2 md:space-y-3">
                {Array.isArray(assignedLessons) && assignedLessons.length === 0 ? (
                  <div className="text-gray-500 text-sm">No lessons assigned yet.</div>
                ) : (
                  Array.isArray(assignedLessons) && assignedLessons.map((lesson, idx) => (
                    <LessonMenuItem key={lesson.id || idx} lesson={lesson} navigate={navigate} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Assign Lesson Modal */}
        {showAssignLessonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Assign a Lesson</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Lesson</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={selectedLessonId || ''}
                  onChange={e => setSelectedLessonId(e.target.value)}
                >
                  <option value="">-- Select a lesson --</option>
                  {teacherLessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
                  onClick={() => setShowAssignLessonModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
                  onClick={handleAssignLesson}
                  disabled={!selectedLessonId}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
};

export default ClassPage;
