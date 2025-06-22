import React ,{ useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Sidebar from "../Component/Home/Sidebar.tsx"
import Header from "../Component/Home/Header.tsx"
import SERVER_URL from "../config.js"
import { ConstantColorFactor } from "three"
import Server_url from "../config.js"

interface Assignment {
  id: string
  title: string
  description: string
  status: "Pending" | "Submitted" | "Graded"
  points: number | null
}

interface ClassItem {
  id: string
  title: string
  description: string
  dateJoined: string
}

interface Lesson {
  id: string
  title: string
  status: "In Progress" | "Completed" | "Not Started"
}

const assignmentsData: Assignment[] = [
  {
    id: "1",
    title: "Culture in Spanish",
    description: "Lorem ipsum dolor sit amet...",
    status: "Pending",
    points: null,
  },
  {
    id: "2",
    title: "Basic Spanish Mannerism",
    description: "Lorem ipsum dolor sit amet...",
    status: "Pending",
    points: null,
  },
  {
    id: "3",
    title: "Basic Spanish Mannerism",
    description: "Lorem ipsum dolor sit amet...",
    status: "Submitted",
    points: null,
  },
  {
    id: "4",
    title: "Basic Spanish Mannerism",
    description: "Lorem ipsum dolor sit amet...",
    status: "Graded",
    points: 15,
  },
  {
    id: "5",
    title: "Basic Spanish Mannerism",
    description: "Lorem ipsum dolor sit amet...",
    status: "Graded",
    points: 10,
  },
]
interface StudentInfo {
  id: string;
  name: string;
  username: string; // usually email or handle like @emery
  avatarUrl?: string; // optional in case avatar is not available
  status: "Active" | "Inactive" | "Invited"; // extendable
  lastLogin: string; // example: "16/03/2024 • 15:54"
  learningPoints: number;
  lessonsCompleted: number;
  averageLearningTime: string; // example: "2 Hrs"
}

const classesData: ClassItem[] = [
  {
    id: "1",
    title: "Culture in Spanish",
    description: "Lorem ipsum dolor sit amet mbue...",
    dateJoined: "16/03/2024",
  },
  {
    id: "2",
    title: "Basic Spanish Mannerism",
    description: "Lorem ipsum dolor sit amet mbue...",
    dateJoined: "16/03/2024",
  },
  {
    id: "3",
    title: "Basic Spanish Mannerism",
    description: "Lorem ipsum dolor sit amet mbue...",
    dateJoined: "16/03/2024",
  },
  {
    id: "4",
    title: "Basic Spanish Mannerism",
    description: "Lorem ipsum dolor sit amet mbue...",
    dateJoined: "16/03/2024",
  },
  {
    id: "5",
    title: "Basic Spanish Mannerism",
    description: "Lorem ipsum dolor sit amet mbue...",
    dateJoined: "16/03/2024",
  },
]

const lessonsData: Lesson[] = [
  {
    id: "1",
    title: "Culture in Spanish",
    status: "In Progress",
  },
]

export default function StudentProfile() {
  const [isTeacherView, setIsTeacherView] = useState(true)
  const [assignmentSearch, setAssignmentSearch] = useState("")
  const [classSearch, setClassSearch] = useState("")
  const [lessonSearch, setLessonSearch] = useState("")
  const navigate = useNavigate();
  const [studentInfoData, setStudentInfoData] = useState<StudentInfo | null>(null);
  const { classId } = useParams<{ classId: string }>(); // Assuming the student ID is passed as a URL parameter
  console.log("Student ID from params:", classId);
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
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${Server_url}/api/users/my-students/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) throw new Error('Failed to fetch students');
  
        const resData = await response.json();
        const data = resData.students || resData;
  
        const studentEntry = data.find((item: any) => item.student.id === classId);
        if (!studentEntry) return;
  
        const s = studentEntry.student;
        const student: StudentInfo = {
          id: s.id,
          name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Unknown',
          username: s.username || '@unknown',
          avatarUrl: s.profile_picture || undefined,
          lastLogin: s.last_login
            ? new Date(s.last_login).toLocaleDateString()
            : 'N/A',
          learningPoints: s.learning_points ?? 0,
          lessonsCompleted: s.lessons_completed ?? 0,
          averageLearningTime: s.avg_learning_time || '0 Mins',
          status: s.status || 'Invited',
        };

        console.log("Fetched student data:", student);
        setStudentInfoData(student);
      } catch (err: any) {
        console.error("Error fetching student:", err.message);
      }
    };
  
    fetchStudent();
  }, [classId]);

console.log("Student Info Data:", studentInfoData);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div >
          <Sidebar />
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Student Info + Assignments */}
              <div className="space-y-6">
                {/* Student Info Section */}
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
                                <path d="..." />
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
                {/* Assignments Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Assignments</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Lists of assignments taken</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-xs sm:text-sm w-full sm:w-auto mt-2 sm:mt-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Assign Assignment
                    </button>
                  </div>
                  <div className="mb-4">
                    <div className="relative">
                      <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="..." />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search here..."
                        value={assignmentSearch}
                        onChange={(e) => setAssignmentSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  {/* Responsive Table/Card */}
                  <div className="hidden sm:block space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-200">
                      <span>Assignment Title</span>
                      <span>Status</span>
                      <span>Points</span>
                    </div>
                    {assignmentsData.map((assignment) => (
                      <div key={assignment.id} className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{assignment.title}</p>
                          <p className="text-xs text-gray-500">{assignment.description}</p>
                        </div>
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          {assignment.points ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium">{assignment.points}</span>
                              <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="..." />
                              </svg>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="..." />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Mobile Card List */}
                  <div className="sm:hidden space-y-3">
                    {assignmentsData.map((assignment) => (
                      <div key={assignment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{assignment.title}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{assignment.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Points:</span>
                          {assignment.points ? (
                            <span className="font-semibold text-gray-800">{assignment.points}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                          <button className="text-gray-400 hover:text-gray-600 ml-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="..." />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Right Column: Classes + Lessons */}
              <div className="space-y-6">
                {/* Classes Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Classes</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Lists of your classes joined</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border rounded-lg hover:bg-blue-50 text-xs sm:text-sm w-full sm:w-auto mt-2 sm:mt-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Assign Class
                    </button>
                  </div>
                  <div className="mb-4">
                    <div className="relative">
                      <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="..." />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search here..."
                        value={classSearch}
                        onChange={(e) => setClassSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  {/* Responsive Table/Card */}
                  <div className="hidden sm:block space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-200">
                      <span>Class Title</span>
                      <span>Date Joined</span>
                    </div>
                    {classesData.map((classItem) => (
                      <div key={classItem.id} className="grid grid-cols-2 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{classItem.title}</p>
                          <p className="text-xs text-gray-500">{classItem.description}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{classItem.dateJoined}</span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="..." />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Mobile Card List */}
                  <div className="sm:hidden space-y-3">
                    {classesData.map((classItem) => (
                      <div key={classItem.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{classItem.title}</span>
                          <span className="text-xs text-gray-600">{classItem.dateJoined}</span>
                        </div>
                        <p className="text-xs text-gray-500">{classItem.description}</p>
                        <button className="text-gray-400 hover:text-gray-600 self-end">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="..." />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Lessons Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Lessons</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Lists of lessons taken</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border rounded-lg hover:bg-blue-50 text-xs sm:text-sm w-full sm:w-auto mt-2 sm:mt-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Assign Lesson
                    </button>
                  </div>
                  <div className="mb-4">
                    <div className="relative">
                      <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="..." />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search here..."
                        value={lessonSearch}
                        onChange={(e) => setLessonSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  {/* Responsive Table/Card */}
                  <div className="hidden sm:block space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-200">
                      <span>Lesson Title</span>
                      <span>Status</span>
                    </div>
                    {lessonsData.map((lesson) => (
                      <div key={lesson.id} className="grid grid-cols-2 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{lesson.title}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lesson.status)}`}>
                            {lesson.status}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="..." />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Mobile Card List */}
                  <div className="sm:hidden space-y-3">
                    {lessonsData.map((lesson) => (
                      <div key={lesson.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{lesson.title}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lesson.status)}`}>
                            {lesson.status}
                          </span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 self-end">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="..." />
                          </svg>
                        </button>
                      </div>
                    ))}
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

