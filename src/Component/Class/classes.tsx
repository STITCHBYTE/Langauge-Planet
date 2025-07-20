import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Home/Sidebar.tsx';
import Header from '../Home/Header.tsx';
import Server_url from '../../config.js';
import { useView } from '../../Context/ViewContext.tsx';
import { FiArrowLeft, FiUsers, FiMessageSquare, FiLock, FiArrowRight } from 'react-icons/fi';

interface ClassData {
  id: string;
  title: string;
  description: string;
  image?: string;
  image_url?: string;
  teacher?: string;
  teacher_name?: string;
  student_count?: number;
  students_count?: number;
  is_private?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Discussion {
  id: string;
  title: string;
  description?: string;
  is_locked?: boolean;
  order?: number;
}

interface Assignment {
  id: string;
  title: string;
  due_date: string;
  discussion?: string;
  points?: number;
}

const ClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useView();
  
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submittedAssignments, setSubmittedAssignments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) return;
    
    const fetchClassData = async () => {
      const token = localStorage.getItem('authToken');
      
      try {
        setLoading(true);
        
        // 1. Fetch class details
        const classResponse = await fetch(`${Server_url}/api/classrooms/classroom/${classId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!classResponse.ok) throw new Error('Failed to fetch class data');
        const classData = await classResponse.json();
        console.log("All class data fields:", Object.keys(classData)); // See available fields
        console.log("Fetched class data:", classData);
        setClassData(classData);

        // 2. Fetch discussions  
        const discussionsResponse = await fetch(`${Server_url}/api/classrooms/classroom/${classId}/discussions/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (discussionsResponse.ok) {
          const discussionsData = await discussionsResponse.json();
          console.log("Fetched discussions data:", discussionsData); // Debug log
          // Handle both array and paginated response
          const discussionsList = Array.isArray(discussionsData) ? discussionsData : discussionsData.results || [];
          setDiscussions(discussionsList);
        }

        // 3. Fetch assignments
        const assignmentsResponse = await fetch(`${Server_url}/api/classrooms/classroom/${classId}/assignments/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          console.log("Fetched assignments data:", assignmentsData); // Debug log
          // Handle both array and paginated response
          const assignmentsList = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.results || [];
          setAssignments(assignmentsList);
        }

        // 4. Fetch submissions
        const submissionsResponse = await fetch(`${Server_url}/api/classrooms/classroom/${classId}/my-assignment-submissions/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          
        });
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();// Debug log
          // submissionsData should be an array of submissions with assignment IDs
          const submittedIds = submissionsData.map((sub: any) => sub.assignment);
          setSubmittedAssignments(submittedIds);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching class data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [classId]);

  const handleGoBack = () => {
    navigate('/classroom');
  };

  const handleGoToDiscussion = (discussionId: string) => {
    navigate(`/discussion/${discussionId}`);
  };

  const handleGoToAssignment = (assignmentId: string) => {
    navigate(`/assignment/${assignmentId}`);
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
          <Sidebar />
        <div className="flex flex-1">
        <Header />
          <div className="flex-1 flex items-center justify-center ml-64">
            <div className="text-gray-500">Loading class details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center ml-64">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div >
      <Header />
      <div >
        <div className="w-64 bg-white shadow-md fixed left-0 top-0 h-full">
          <Sidebar />
        </div>
        <div className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg p-6 mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <img 
                          src={classData?.image_url || classData?.image || 'https://via.placeholder.com/96x80/4ade80/ffffff?text=📚'} 
                          alt={`${classData?.title} class image`}
                          className="relative w-16 h-16 object-cover rounded-md z-10"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/96x80/4ade80/ffffff?text=📚';
                          }}
                        />
                      </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {classData?.title || 'Culture in Spanish'}
                      </h1>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {classData?.description || 'Lorem ipsum dolor sit amet consectetur. Tincidunt faucibus ut tincidunt malesuada sed quam ac rhoncus. Nisl diam nibh lobortis scelerisque. Nunc sed porta arcu malesuada felis ut aliquam diam.'}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">
                              {classData?.teacher_name ? classData.teacher_name.substring(0, 2).toUpperCase() : 'CJ'}
                            </span>
                          </div>
                          <span>{classData?.teacher_name || classData?.teacher || 'Carlos Juan'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiUsers className="w-4 h-4" />
                          <span>{classData?.student_count || classData?.students_count || 20} Students</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiMessageSquare className="w-4 h-4" />
                          <span>{discussions.length} Discussions {discussions.length > 0 ? 'available' : 'completed'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">DISCUSSIONS</h2>
                  
                  <div className="space-y-4 mt-6">
                    {discussions.length > 0 ? (
                      discussions.map((discussion, index) => {
                        const relatedAssignment = assignments.find(a => a.discussion === discussion.id);
                        let isLocked = false;
                        if (index === 0) {
                          isLocked = false;
                        } else {
                          const prevDiscussion = discussions[index - 1];
                          const prevAssignment = assignments.find(a => a.discussion === prevDiscussion.id);
                          if (prevAssignment) {
                            isLocked = !submittedAssignments.includes(prevAssignment.id);
                          } else {
                            isLocked = false;
                          }
                        }

                        // Check if the student has submitted the related assignment
                        const isSubmitted = relatedAssignment && submittedAssignments.includes(relatedAssignment.id);

                        return (
                          <div key={discussion.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                Discussion {index + 1}: {discussion.title}
                              </h3>
                              {discussion.description && (
                                <p className="text-sm text-gray-500 mt-1">{discussion.description}</p>
                              )}
                            </div>
                            <div className="flex items-center">
                              {isLocked ? (
                                <div className="flex items-center text-gray-400">
                                  <span className="text-sm mr-2">Locked</span>
                                  <FiLock className="w-4 h-4" />
                                </div>
                              ) : isSubmitted ? (
                                <span className="text-green-600 font-semibold text-sm">Submitted</span>
                              ) : (
                                <button 
                                  onClick={() => handleGoToDiscussion(discussion.id)}
                                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  Go To Discussion
                                  <FiArrowRight className="w-4 h-4 ml-2" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FiMessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No discussions available yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Assignments */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Your Assignments</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Complete assignments before their due dates to accumulate points allocated to them.
                  </p>
                  
                  <div className="space-y-4">
                    {assignments.length > 0 ? (
                      assignments.map((assignment, index) => (
                        <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Assignment: {assignment.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-3">
                            Due By: {assignment.due_date ? formatDueDate(assignment.due_date) : 'No due date'}
                          </p>
                          {assignment.points && (
                            <p className="text-sm text-blue-600 mb-2">Points: {assignment.points}</p>
                          )}
                          {/* Go To Assignment button removed */}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-8 h-8 mx-auto mb-2 opacity-50">📝</div>

                        <p>No assignments available yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailPage;