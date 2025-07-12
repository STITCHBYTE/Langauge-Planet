import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUsers, FiArrowLeft, FiFilter, FiCopy, FiPlus, FiMoreHorizontal, FiChevronLeft, FiChevronRight, FiX, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Header from '../../Component/Home/Header.tsx';
import Server_url from '../../config.js';

const StudentsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [requestedStudents, setRequestedStudents] = useState([]); // State for pending requests
  const [allTeacherStudents, setAllTeacherStudents] = useState([]);
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  
  // Modal states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [addingStudents, setAddingStudents] = useState(false);
  const [showRequestedModal, setShowRequestedModal] = useState(false); // State for new modal

  useEffect(() => {
    if (classId) {
      fetchClassData();
      fetchEnrolledStudents();
      fetchAllTeacherStudents();
    }
  }, [classId]);

  const fetchClassData = async () => {
    const token = localStorage.getItem('authToken');
    
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
      setClassData({ title: 'Culture in Spanish' }); // Fallback
    }
  };

  const fetchEnrolledStudents = async () => {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await fetch(
        `${Server_url}/api/classrooms/classroom/${classId}/memberships/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch enrolled students');
      
      const data = await response.json();
      console.log('Enrolled students data:', data);

      // Filter out rejected students first
      const validMemberships = data.filter(item => item.status !== 'REJECTED');

      const transformedStudents = validMemberships.map((item) => {
        const studentDetails = allTeacherStudents.find(s => s.email === item.student);

        // Determine student's status from the new API field
        let status;
        if (item.status === 'ENROLLED') {
          status = 'Active';
        } else if (item.status === 'INVITED') {
          status = 'Invited';
        } else if (item.status === 'REQUESTED') {
          status = 'Requested';
        }

        const studentName = studentDetails ? studentDetails.name : item.student.split('@')[0];
        const studentUsername = studentDetails ? studentDetails.username : `@${item.student.split('@')[0]}`;
        const studentInitial = studentDetails ? studentDetails.initial : item.student[0].toUpperCase();
        const studentId = studentDetails ? studentDetails.id : item.student; // Use email as fallback ID

        return {
          id: studentId,
          enrollmentId: item.id,
          name: studentName,
          username: studentUsername,
          initial: studentInitial,
          dateJoined: new Date(item.created_at).toLocaleDateString(),
          // Use mock/default data for fields not present in the new API response
          learningPoints: 150,
          assignmentsCompleted: Math.floor(Math.random() * 10) + 1,
          avgTimeInClass: `${Math.floor(Math.random() * 60) + 20} Mins`,
          status: status
        };
      });

      // Students for the main table (Active and Invited)
      const enrolled = transformedStudents.filter(
        s => s.status === 'Active' || s.status === 'Invited'
      );
      const requested = transformedStudents.filter(s => s.status === 'Requested');
      setEnrolledStudents(enrolled);
      setRequestedStudents(requested);

    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      const mockData = [
        { id: 1, enrollmentId: 101, name: 'Emery Torff', username: '@emery', initial: 'E', dateJoined: '16/03/2024', learningPoints: 150, assignmentsCompleted: 8, avgTimeInClass: '2 Hrs', status: 'Active' },
        { id: 2, enrollmentId: 102, name: 'Maren Dokidis', username: '@maren', initial: 'M', dateJoined: '16/03/2024', learningPoints: 150, assignmentsCompleted: 10, avgTimeInClass: '53 Mins', status: 'Requested' },
        { id: 3, enrollmentId: 103, name: 'Cooper Siphron', username: '@cooper', initial: 'C', dateJoined: '16/03/2024', learningPoints: 150, assignmentsCompleted: 4, avgTimeInClass: '40 Mins', status: 'Active' },
        { id: 6, enrollmentId: 104, name: 'Giana Carder', username: '@giana', initial: 'G', dateJoined: '16/03/2024', learningPoints: 150, assignmentsCompleted: 7, avgTimeInClass: '1.5 Hrs', status: 'Invited' },
      ];
      setEnrolledStudents(mockData.filter(s => s.status === 'Active' || s.status === 'Invited'));
      setRequestedStudents(mockData.filter(s => s.status === 'Requested'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTeacherStudents = async () => {
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await fetch(
        `${Server_url}/api/users/my-students/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch teacher students');
      
      const data = await response.json();
      console.log('All teacher students data:', data);
      
      // Handle nested structure from API
      const students = data.students || data;
      const transformedStudents = students.map((item, index) => {
        const student = item.student || item;
        
        return {
          id: student.id,
          name: student.first_name && student.last_name 
            ? `${student.first_name} ${student.last_name}`
            : student.username || `Student ${index + 1}`,
          username: student.username || `@student${index + 1}`,
          initial: (student.first_name?.[0] || student.username?.[0] || 'S').toUpperCase(),
          lastLogin: student.last_login || '16/03/2024 • 15:54',
          learningPoints: student.learning_points || 150,
          avgLearningTime: student.avg_learning_time || `${Math.floor(Math.random() * 120) + 20} Mins`,
          email: student.email || '',
          first_name: student.first_name || '',
          last_name: student.last_name || ''
        };
      });
      
      setAllTeacherStudents(transformedStudents);
    } catch (error) {
      console.error('Error fetching all teacher students:', error);
      // Mock data for modal
      setAllTeacherStudents([
        {
          id: 1,
          name: 'Emery Torff',
          username: '@emery',
          initial: 'E',
          lastLogin: '16/03/2024 • 15:54',
          learningPoints: 150,
          avgLearningTime: '2 Hrs'
        },
        {
          id: 2,
          name: 'Maren Dokidis',
          username: '@maren',
          initial: 'M',
          lastLogin: '16/03/2024 • 15:54',
          learningPoints: 150,
          avgLearningTime: '53 Mins'
        },
        // Add more mock students as needed
      ]);
    }
  };

  const handleAddSelectedStudents = async () => {
    if (selectedStudents.length === 0) return;
    
    setAddingStudents(true);
    const token = localStorage.getItem('authToken');
    const google_token = localStorage.getItem('google_access_token'); // Assuming you store Google token in localStorage
    
    try {
      // Add each selected student to the class
      const promises = selectedStudents.map(studentId =>
        fetch(`${Server_url}/api/classrooms/classroom/invite/`, {
          method: 'POST',
          headers:
           {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            classroom: classId,
            student: studentId,
          }),
        })
      );

      const responses = await Promise.all(promises);
      const failedRequests = responses.filter(response => !response.ok);
      
      if (failedRequests.length > 0) {
        throw new Error(`Failed to add ${failedRequests.length} student(s)`);
      }

      // Google Classroom Invite Integration
      console.log('Class Data for Google Classroom check:', classData); // Log classData here
      
      let googleClassroomId = classData.google_classroom_id;

      // If we don't have a Google Classroom ID, try to find it by matching the class title.
      if (!googleClassroomId) {
        console.log("google_classroom_id not found in classData. Attempting to find it by matching title...");
        const google_token = localStorage.getItem('google_access_token');
        if (google_token) {
          try {
            const coursesResponse = await fetch('https://classroom.googleapis.com/v1/courses', {
              headers: {
                'Authorization': `Bearer ${google_token}`,
              },
            });

            if (coursesResponse.ok) {
              const coursesData = await coursesResponse.json();
                console.log('Fetched Google Classroom courses:', coursesData);
              const matchingCourse = coursesData.courses?.find(course => course.section === classData.id || course.section === classData._id);
              
              if (matchingCourse) {
                console.log(`Found matching Google Classroom course: ${matchingCourse.name} (ID: ${matchingCourse.id})`);
                googleClassroomId = matchingCourse.id;
                // TODO: You should consider saving this matched ID to your backend
                // to avoid looking it up every time.
              } else {
                console.warn(`No Google Classroom course found with the title: "${classData.title}"`);
              }
            }
          } catch (error) {
            console.error("Error fetching or matching Google Classroom courses:", error);
          }
        }
      }

      if (googleClassroomId) {
        for (const studentId of selectedStudents) {
          const student = allTeacherStudents.find(s => s.id === studentId);
          if (student && student.email) {
            try {
              // Get fresh access token
              const token = localStorage.getItem('google_access_token');
              
              if (!token) {
                console.warn('No Google access token found. Skipping Google Classroom invite.');
                toast.warn('No Google access token found. Skipping Google Classroom invite.');
                continue; // Skip to the next student
              }

              const response = await fetch('https://classroom.googleapis.com/v1/invitations', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  courseId: googleClassroomId, // Use the found or existing ID
                  role: 'STUDENT',
                  userId: student.email
                })
              });

              if (!response.ok) {
                const error = await response.json();
                // Log the detailed error from Google for better debugging
                console.error('Google Classroom API error response:', error);
                toast.error(error.error.message || 'Failed to send Google Classroom invite');
                throw new Error(error.error.message || 'Failed to send Google Classroom invite');
              }

              const data = await response.json();
              console.log('Google Classroom invite sent:', data);

            } catch (error) {
              console.error(`Google Classroom invite error for ${student.email}:`, error);
              toast.error(`Google Classroom invite error for ${student.email}: ${error.message}`);
              // Continue with other students even if one fails
            }
          }
        }
      } else {
        toast.info('Student(s) added to Language Planet, but this class is not linked to Google Classroom. No invites were sent.');
      }
      // End Google Classroom Invite Integration

      // Show success message only for the platform invite if Google Classroom part is skipped.
      if (!googleClassroomId) {
        toast.success(`${selectedStudents.length} student(s) added successfully to the platform!`);
      } else {
        toast.success(`${selectedStudents.length} student(s) added and invited successfully!`);
      }
      
      // Reset modal state
      setSelectedStudents([]);
      setShowAddStudentModal(false);
      setModalSearchQuery('');
      
      // Refresh enrolled students
      fetchEnrolledStudents();
      
    } catch (error) {
      console.error('Error adding students:', error);
      toast.error(`Failed to add students: ${error.message}`);
    } finally {
      setAddingStudents(false);
    }
  };

  const handleRequestAction = async (enrollmentId, action) => {
  const token = localStorage.getItem('authToken');
  let url = '';
  let method = '';
  let body = null;

  try {
    switch (action) {
      case 'accept':
        url = `${Server_url}/api/classrooms/classroom/membership/${enrollmentId}/respond/`;
        method = 'PUT';
        body = { action: 'accept' };
        break;
      case 'reject':
        url = `${Server_url}/api/classrooms/classroom/membership/${enrollmentId}/respond/`;
        method = 'PUT';
        body = { action: 'reject' };
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      toast.error(`Failed to ${action} request`);
      throw new Error(`Failed to ${action} request`);
    }

    toast.success(`Student request ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
    fetchEnrolledStudents(); // Refresh the lists
    
    // Close modal if no more requests
    if (requestedStudents.length === 1) {
      setShowRequestedModal(false);
    }
  } catch (error) {
    console.error(`Error handling request:`, error);
    toast.error(`Failed to ${action} student request.`);
  }
};
  // Get IDs of all students already associated with the class (enrolled, requested, invited)
  const allAssociatedStudentIds = new Set([
    ...enrolledStudents.map(s => s.id),
    ...requestedStudents.map(s => s.id)
  ]);

  // Get available students (all teacher's students who are not already associated with this class)
  const availableStudents = allTeacherStudents.filter(
    student => !allAssociatedStudentIds.has(student.email)
);

  // Filter students for modal based on search
  const filteredModalStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
    student.username.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  // Filter students based on search query
  const filteredStudents = enrolledStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Active</span>;
      case 'Requested':
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">Requested</span>;
      case 'Invited':
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">Invited</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">{status}</span>;
    }
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (loading || !classData) {
    return (
      <div className="bg-gray-100 min-h-screen lg:ml-[17%]">
        <Header />
        <div className="flex">
          <Sidebar className="hidden lg:block fixed left-0 top-0 h-full w-[17%] z-20" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen lg:ml-[17%]">
      <Header />
      <div className="flex">
        <Sidebar className="hidden lg:block fixed left-0 top-0 h-full w-[17%] z-20" />
        
        <div className={`flex-1 p-6 ${showAddStudentModal || showRequestedModal ? 'filter blur-sm' : ''}`}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <button 
              onClick={() => navigate('/classes')}
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <FiArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <span>/</span>
            <span>Classes</span>
            <span>/</span>
            <span>{classData.title}</span>
            <span>/</span>
            <span className="text-blue-600 font-medium">Students in Class</span>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search here..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-2.5">
                  <FiSearch className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <FiFilter className="w-4 h-4" />
                Filter By
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                <FiCopy className="w-4 h-4" />
                Copy Class Invite Link
              </button>
              <button 
                onClick={() => setShowRequestedModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 relative"
              >
                Requested
                {requestedStudents.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                    {requestedStudents.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setShowAddStudentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FiPlus className="w-4 h-4" />
                Add New Student
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learning Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignments Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Time in Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-sm">{student.initial}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.dateJoined}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">{student.learningPoints}</span>
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-xs">⭐</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.assignmentsCompleted} Assignments
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.avgTimeInClass}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-600">
                        <FiMoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Add Student Modal */}
        {showAddStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowAddStudentModal(false)}
            ></div>
            
            {/* Modal */}
            <div className="relative bg-white h-full w-full max-w-2xl shadow-xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Add New Student</h2>
                  <p className="text-sm text-gray-600 mt-1">Select students you'd like to add to this class</p>
                </div>
                <button
                  onClick={() => setShowAddStudentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Column Headers */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-6 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span className="col-span-3">Name</span>
                  <span>Last Login</span>
                  <span>Points</span>
                  <span>Avg. Learning Time</span>
                </div>
              </div>

              {/* Student List */}
              <div className="flex-1 overflow-y-auto">
                {filteredModalStudents.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    {availableStudents.length === 0 
                      ? "All your students are already in this class"
                      : "No students found"
                    }
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredModalStudents.map((student) => (
                      <div 
                        key={student.id} 
                        className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleStudentSelection(student.id)}
                      >
                        <div className="grid grid-cols-6 gap-4 items-center">
                          <div className="flex items-center gap-3 col-span-3">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleStudentSelection(student.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-xs">{student.initial}</span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{student.name}</div>
                              <div className="text-xs text-gray-500 truncate">{student.username}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600">{student.lastLogin}</div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-900">{student.learningPoints}</span>
                            <div className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-xs">⭐</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600">{student.avgLearningTime}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={handleAddSelectedStudents}
                  disabled={selectedStudents.length === 0 || addingStudents}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {addingStudents 
                    ? 'Adding Students...' 
                    : `Add Selected Students${selectedStudents.length > 0 ? ` (${selectedStudents.length})` : ''}`
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Requested Students Modal */}
        {showRequestedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowRequestedModal(false)}
            ></div>
            
            {/* Modal */}
            <div className="relative bg-white h-full w-full max-w-md shadow-xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Student Requests</h2>
                  <p className="text-sm text-gray-600 mt-1">Accept or reject requests to join this class</p>
                </div>
                <button
                  onClick={() => setShowRequestedModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Student List */}
              <div className="flex-1 overflow-y-auto">
                {requestedStudents.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No pending requests.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {requestedStudents.map((student) => (
                      <div 
                        key={student.enrollmentId} 
                        className="px-6 py-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">{student.initial}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{student.name}</div>
                            <div className="text-xs text-gray-500 truncate">{student.username}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={() => handleRequestAction(student.enrollmentId, 'accept')}
                                className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleRequestAction(student.enrollmentId, 'reject')}
                                className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600"
                            >
                                Reject
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
