import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Sidebar from "../Component/Home/Sidebar.tsx"
import Header from "../Component/Home/Header.tsx"
import Server_url from "../config.js"
import { toast } from 'react-toastify';

interface Assignment {
  id: string
  title: string
  description: string
  status: "Pending" | "Submitted" | "Graded"
  points: number | null
  className: string
  dueDate: string
}

interface ClassItem {
  id: string
  title: string
  description: string
  dateJoined: string
  studentStatus: string
}

interface Lesson {
  id: string
  title: string
  status: "In Progress" | "Completed" | "Not Started"
  className: string
}

interface StudentInfo {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  status: "Active" | "Inactive" | "Invited";
  lastLogin: string;
  learningPoints: number;
  lessonsCompleted: number;
  averageLearningTime: string;
}

export default function StudentProfile() {
  const [assignmentSearch, setAssignmentSearch] = useState("")
  const [classSearch, setClassSearch] = useState("")
  const [lessonSearch, setLessonSearch] = useState("")
  const navigate = useNavigate();
  const [studentInfoData, setStudentInfoData] = useState<StudentInfo | null>(null);
  const [assignmentsData, setAssignmentsData] = useState<Assignment[]>([]);
  const [classesData, setClassesData] = useState<ClassItem[]>([]);
  const [lessonsData, setLessonsData] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { studentId } = useParams<{ studentId: string }>();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Submitted":
        return "bg-blue-100 text-blue-800"
      case "Graded":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Active":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!studentId) {
          toast.error('No student ID provided');
          setLoading(false);
          return;
        }
        let studentInfo: StudentInfo | null = null;
        try {
          const studentResponse = await fetch(`${Server_url}/api/users/${studentId}/`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            studentInfo = {
              id: studentData.id || studentId,
              name: `${studentData.first_name || ''} ${studentData.last_name || ''}`.trim() || 
                    studentData.name || 
                    studentData.username || 
                    'Unknown Student',
              username: studentData.username || studentData.email?.split('@')[0] || '@unknown',
              avatarUrl: studentData.profile_picture || studentData.avatar,
              lastLogin: studentData.last_login
                ? new Date(studentData.last_login).toLocaleDateString()
                : 'N/A',
              learningPoints: studentData.learning_points ?? studentData.points ?? 0,
              lessonsCompleted: studentData.lessons_completed ?? studentData.completed_lessons ?? 0,
              averageLearningTime: studentData.avg_learning_time || studentData.average_time || '0 Mins',
              status: 'Active',
            };
            setStudentInfoData(studentInfo);
          } else {
            studentInfo = {
              id: studentId,
              name: 'Loading...',
              username: '@loading',
              status: 'Active',
              lastLogin: 'N/A',
              learningPoints: 0,
              lessonsCompleted: 0,
              averageLearningTime: '0 Mins'
            };
            setStudentInfoData(studentInfo);
          }
        } catch (error) {
          studentInfo = {
            id: studentId,
            name: 'Student',
            username: '@student',
            status: 'Active',
            lastLogin: 'N/A',
            learningPoints: 0,
            lessonsCompleted: 0,
            averageLearningTime: '0 Mins'
          };
          setStudentInfoData(studentInfo);
        }
        try {
          const submissionsResponse = await fetch(`${Server_url}/api/classrooms/assignment-submissions/?student=${studentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (submissionsResponse.ok) {
            const submissions = await submissionsResponse.json();
            const totalPoints = submissions.reduce((acc, sub) => acc + (sub.score || 0), 0);
            setStudentInfoData(prevInfo => prevInfo ? { ...prevInfo, learningPoints: totalPoints } : null);
            if (studentInfo) {
              studentInfo.learningPoints = totalPoints;
            }
          }
        } catch (error) {
        }
        const classesResponse = await fetch(`${Server_url}/api/classrooms/my-classrooms/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!classesResponse.ok) throw new Error('Failed to fetch classes');
        const teacherClasses = await classesResponse.json();
        const studentClasses: ClassItem[] = [];
        const studentAssignments: Assignment[] = [];
        const studentLessons: Lesson[] = [];

        for (const classItem of teacherClasses) {
          try {
            const studentsResponse = await fetch(
              `${Server_url}/api/classrooms/classroom/${classItem.id}/enrolled-students/`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (studentsResponse.ok) {
              const studentsData = await studentsResponse.json();
              const students = studentsData.results || studentsData;
              const foundStudent = students.find((student: any) => {
                
                return String(student.id) === String(studentId) || 
                       student.email === studentId || 
                       student.username === studentId;
              });

              if (foundStudent) {
                if (foundStudent.first_name || foundStudent.last_name) {
                  const updatedStudentInfo: StudentInfo = {
                    ...studentInfo!,
                    name: `${foundStudent.first_name || ''} ${foundStudent.last_name || ''}`.trim() || 
                          foundStudent.name || 
                          foundStudent.username || 
                          studentInfo!.name,
                    username: foundStudent.username || foundStudent.email?.split('@')[0] || studentInfo!.username,
                  };
                  setStudentInfoData(updatedStudentInfo);
                  studentInfo = updatedStudentInfo;
                }
                studentClasses.push({
                  id: classItem.id,
                  title: classItem.title,
                  description: classItem.description || 'No description',
                  dateJoined: foundStudent.date_joined || foundStudent.created_at
                    ? new Date(foundStudent.date_joined || foundStudent.created_at).toLocaleDateString()
                    : 'Unknown',
                  studentStatus: 'ENROLLED'
                });
              } else {
              }
            } else {
            }
          } catch (error) {
          }
          try {
            const membershipsResponse = await fetch(
              `${Server_url}/api/classrooms/classroom/${classItem.id}/memberships/`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (membershipsResponse.ok) {
              const memberships = await membershipsResponse.json();
              
              const foundMembership = memberships.find((membership: any) => {
                const memberUserId = membership.student?.id || membership.user?.id || membership.student_id || membership.user_id;
                const memberEmail = membership.student?.email || membership.user?.email || membership.email;
                const memberUsername = membership.student?.username || membership.user?.username || membership.username;
                
                return String(memberUserId) === String(studentId) || 
                       memberEmail === studentId || 
                       memberUsername === studentId ||
                       String(membership.id) === String(studentId);
              });

              if (foundMembership && studentClasses.length === 0) {
                const memberData = foundMembership.student || foundMembership.user || foundMembership;
                
                studentClasses.push({
                  id: classItem.id,
                  title: classItem.title,
                  description: classItem.description || 'No description',
                  dateJoined: foundMembership.created_at
                    ? new Date(foundMembership.created_at).toLocaleDateString()
                    : 'Unknown',
                  studentStatus: foundMembership.status || 'ENROLLED'
                });
              } else if (!foundMembership) {
              }
            } else {
            }
          } catch (error) {
          }
          const isStudentInClass = studentClasses.some(sc => sc.id === classItem.id);
          
          if (isStudentInClass) {
            try {
              const assignmentsResponse = await fetch(
                `${Server_url}/api/classrooms/classroom/${classItem.id}/assignments/`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (assignmentsResponse.ok) {
                const assignments = await assignmentsResponse.json();
                const submissionsResponse = await fetch(
                  `${Server_url}/api/classrooms/classroom/${classItem.id}/assignment-submissions/`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                let submissions = [];
                if (submissionsResponse.ok) {
                  submissions = await submissionsResponse.json();
                }
                for (const assignment of assignments) {
                  const submission = submissions.find((sub: any) => {
                    const subStudentId = sub.student?.id || sub.student_id || sub.student;
                    return sub.assignment === assignment.id && String(subStudentId) === String(studentId);
                  });

                  studentAssignments.push({
                    id: assignment.id,
                    title: assignment.title,
                    description: assignment.description || 'No description',
                    status: submission 
                      ? (submission.graded ? 'Graded' : 'Submitted')
                      : 'Pending',
                    points: submission?.points || submission?.score || null,
                    className: classItem.title,
                    dueDate: assignment.due_date 
                      ? new Date(assignment.due_date).toLocaleDateString()
                      : 'No due date'
                  });
                }
              }
            } catch (error) {
            }
            if (classItem.lessons && classItem.lessons.length > 0) {
              
              for (const lessonId of classItem.lessons) {
                try {
                  const lessonResponse = await fetch(
                    `${Server_url}/api/lessons/lesson/${lessonId}/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );

                  if (lessonResponse.ok) {
                    const lesson = await lessonResponse.json();
                    
                    studentLessons.push({
                      id: lesson.id,
                      title: lesson.title,
                      status: 'Not Started',
                      className: classItem.title
                    });
                  }
                } catch (error) {
                }
              }
            }
          }
        }
        setClassesData(studentClasses);
        setAssignmentsData(studentAssignments);
        setLessonsData(studentLessons);
        if (studentClasses.length === 0) {
          toast.error('Student not found in any of your classes. Please check the student ID.');
        }
      } catch (err: any) {
        toast.error(`Error fetching student data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentData();
    } else {
      setLoading(false);
      toast.error('No student ID provided in URL');
    }
  }, [studentId]);
  const filteredAssignments = assignmentsData.filter(assignment =>
    assignment.title.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
    assignment.className.toLowerCase().includes(assignmentSearch.toLowerCase())
  );

  const filteredClasses = classesData.filter(classItem =>
    classItem.title.toLowerCase().includes(classSearch.toLowerCase())
  );

  const filteredLessons = lessonsData.filter(lesson =>
    lesson.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
    lesson.className.toLowerCase().includes(lessonSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <div>
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  {studentInfoData && (
                    <div key={studentInfoData.id} className="mb-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Student Info</h2>
                        <span className={`inline-flex px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${getStatusColor(studentInfoData.status)}`}>
                          {studentInfoData.status}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                          <span className="text-white font-semibold text-xl">{studentInfoData.name[0]}</span>
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Name</p>
                            <p className="font-medium text-gray-900">{studentInfoData.name}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Username</p>
                            <p className="font-medium text-gray-900">{studentInfoData.username}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Last Login</p>
                            <p className="font-medium text-gray-900">{studentInfoData.lastLogin}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Learning Points</p>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-900">{studentInfoData.learningPoints}</span>
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">No. of Lessons</p>
                            <p className="font-medium text-gray-900">{studentInfoData.lessonsCompleted}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Average Learning Time</p>
                            <p className="font-medium text-gray-900">{studentInfoData.averageLearningTime}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Assignments</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Student's assignment submissions ({assignmentsData.length} total)</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="relative">
                      <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search assignments..."
                        value={assignmentSearch}
                        onChange={(e) => setAssignmentSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredAssignments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No assignments found for this student</p>
                      </div>
                    ) : (
                      filteredAssignments.map((assignment) => (
                        <div key={assignment.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">{assignment.title}</h4>
                              <p className="text-xs text-gray-500">{assignment.description}</p>
                              <p className="text-xs text-blue-600 mt-1">Class: {assignment.className}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                              {assignment.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Due: {assignment.dueDate}</span>
                            {assignment.points && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-900">{assignment.points}</span>
                                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Classes</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Classes where student is enrolled ({classesData.length} total)</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="relative">
                      <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search classes..."
                        value={classSearch}
                        onChange={(e) => setClassSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredClasses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No classes found for this student</p>
                      </div>
                    ) : (
                      filteredClasses.map((classItem) => (
                        <div key={classItem.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">{classItem.title}</h4>
                              <p className="text-xs text-gray-500 mt-1">{classItem.description}</p>
                              <p className="text-xs text-gray-500 mt-2">Joined: {classItem.dateJoined}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(classItem.studentStatus)}`}>
                              {classItem.studentStatus}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Lessons</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Assigned lessons from classes ({lessonsData.length} total)</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="relative">
                      <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search lessons..."
                        value={lessonSearch}
                        onChange={(e) => setLessonSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredLessons.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No lessons found for this student</p>
                      </div>
                    ) : (
                      filteredLessons.map((lesson) => (
                        <div key={lesson.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">{lesson.title}</h4>
                              <p className="text-xs text-blue-600 mt-1">From: {lesson.className}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lesson.status)}`}>
                              {lesson.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

