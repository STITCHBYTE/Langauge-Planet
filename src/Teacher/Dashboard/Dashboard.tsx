import React, { useState, useEffect, FC } from 'react';
import axios from 'axios';
import Sidebar from '../../Component/Home/Sidebar.tsx'; // Assuming these components exist
import Header from '../../Component/Home/Header.tsx';   // and can accept props
import Server_url from '../../config';
import { useNavigate } from 'react-router-dom'; // <-- Import useNavigate
import { FiUsers, FiBookOpen, FiClipboard, FiPlus, FiArrowRight, FiTrendingUp, FiMoreVertical } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useView } from '../../Context/ViewContext.tsx'; // For the Student/Teacher view toggle
import { toast } from 'react-toastify';

// --- Type Definitions ---
interface Metric {
  totalStudents: number;
  totalClasses: number;
  totalLessons: number;
}
interface PopularItem {
  id: string;
  title:string;
  description: string;
  students: number;
}
interface Assignment {
  id: string;
  title: string;
  classroom: string;
  classroom_title?: string;
  due_date?: string;
  total_students?: number;
  submitted_count?: number;
}
interface PendingAssignment {
  id: string;
  title: string;
  classroom_title: string;
  pending_count: number;
  total_students: number;
  completion_percentage: number;
}
interface ChartData {
    name: string;
    Lessons: number;
    Classes: number;
    Quizzes: number;
}

// --- Reusable UI Components (with navigation) ---

const MetricCard: FC<{ title: string; value: number | string; icon: React.ReactNode; onClick: () => void; }> = ({ title, value, icon, onClick }) => (
  <div onClick={onClick} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">{icon}</div>
        <span className="font-semibold text-gray-600 text-sm">{title}</span>
      </div>
      <FiArrowRight className="text-gray-400" />
    </div>
    <div className="mt-4">
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const ActionButton: FC<{ text: string; onClick: () => void; }> = ({ text, onClick }) => (
  <button onClick={onClick} className="w-full text-left bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><FiPlus /></div>
        <span className="font-semibold text-gray-700 text-sm">{text}</span>
      </div>
      <FiArrowRight className="text-gray-400" />
    </div>
  </button>
);

const PopularList: FC<{ title: string; items: PopularItem[]; onItemClick: (id: string) => void; }> = ({ title, items, onItemClick }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
        <h3 className="font-bold text-gray-800 mb-4">{title}</h3>
        <div className="text-xs text-gray-400 font-semibold grid grid-cols-5 gap-4 px-4 pb-2 border-b">
            <span className="col-span-3">Title</span>
            <span className="col-span-2">No. of Students</span>
        </div>
        <ul className="space-y-2 mt-2">
            {items.slice(0, 5).map(item => (
                <li key={item.id} onClick={() => onItemClick(item.id)} className="grid grid-cols-5 gap-4 items-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="col-span-3">
                        <p className="font-semibold text-sm text-gray-800 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                    </div>
                    <div className="col-span-1 font-semibold text-sm">{item.students}</div>
                    <div className="col-span-1 flex justify-end">
                        <FiArrowRight className="text-gray-400"/>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);


// --- Main Dashboard Component ---
const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState<Metric | null>(null);
    const [popularClasses, setPopularClasses] = useState<PopularItem[]>([]);
    const [popularLessons, setPopularLessons] = useState<PopularItem[]>([]);
    const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);
    const [learningTimeData, setLearningTimeData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const { studentView, setStudentView } = useView();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const headers = { Authorization: `Bearer ${token}` };

            try {
                const [studentsRes, classesRes, lessonsRes] = await Promise.all([
                    axios.get(`${Server_url}/api/users/my-students/`, { headers }),
                    axios.get(`${Server_url}/api/classrooms/my-classrooms/`, { headers }),
                    axios.get(`${Server_url}/api/lessons/lesson/my/`, { headers }),
                ]);

                setMetrics({
                    totalStudents: studentsRes.data.length,
                    totalClasses: classesRes.data.length,
                    totalLessons: lessonsRes.data.length,
                });

                // Fetch student counts and activity data
                const classesWithStudentCount = await fetchClassesWithStudents(classesRes.data, headers);
                const lessonsWithStudentCount = await fetchLessonsWithStudents(lessonsRes.data, classesRes.data, headers);

                setPopularClasses(classesWithStudentCount);
                setPopularLessons(lessonsWithStudentCount);

                // Fetch pending assignments
                await fetchPendingAssignments(token, classesRes.data);

                // Fetch activity summary for learning time chart
                await fetchLearningTimeData(studentsRes.data, headers);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                toast.error('Failed to fetch dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchLearningTimeData = async (allStudents: any[], headers: any) => {
        try {
            // Initialize data structure for each day
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const chartData: ChartData[] = [];
            
            for (let i = 0; i < 7; i++) {
                const currentDate = new Date();
                currentDate.setDate(currentDate.getDate() - (6 - i)); // Last 7 days
                chartData.push({
                    name: dayNames[currentDate.getDay()],
                    Lessons: 0,
                    Classes: 0,
                    Quizzes: 0
                });
            }

            // If no students, return empty data
            if (!allStudents || allStudents.length === 0) {
                setLearningTimeData(chartData);
                return;
            }

            // Collect all student IDs from nested structure
            const studentIds = allStudents.map(item => {
                const student = item.student || item;
                return student.id;
            }).filter(id => id);

            if (studentIds.length === 0) {
                setLearningTimeData(chartData);
                return;
            }

            // Fetch activity data for each student using the original endpoint format
            const activityPromises = studentIds.map(async (studentId) => {
                try {
                    const response = await axios.get(
                        `${Server_url}/api/users/activity-summary/`,
                        { 
                            headers,
                            params: {
                                user_id: studentId
                            }
                        }
                    );
                    return response.data;
                    console.log(`Fetched activity for student ${studentId}:`, response.data);
                } catch (error) {
                    console.error(`Failed to fetch activity for student ${studentId}:`, error);
                    return {};
                }
            });

            const allActivityData = await Promise.all(activityPromises);

            // Process and aggregate activity data
            const dateActivityMap = new Map();
            
            allActivityData.forEach(studentActivity => {
                Object.entries(studentActivity).forEach(([date, activities]: [string, any]) => {
                    if (!dateActivityMap.has(date)) {
                        dateActivityMap.set(date, { lesson: [], class: [], quiz: [] });
                    }
                    
                    const dateData = dateActivityMap.get(date);
                    if (activities.lesson) dateData.lesson.push(activities.lesson / 3600); // Convert seconds to hours
                    if (activities.class) dateData.class.push(activities.class / 3600);
                    if (activities.quiz) dateData.quiz.push(activities.quiz / 3600);
                });
            });

            // Calculate averages and update chart data
            chartData.forEach((dayData, index) => {
                const currentDate = new Date();
                currentDate.setDate(currentDate.getDate() - (6 - index));
                const dateString = currentDate.toISOString().split('T')[0];
                
                const dayActivities = dateActivityMap.get(dateString);
                if (dayActivities) {
                    // Calculate average time for each activity type
                    dayData.Lessons = dayActivities.lesson.length > 0 
                        ? Number((dayActivities.lesson.reduce((sum, time) => sum + time, 0) / dayActivities.lesson.length).toFixed(1))
                        : 0;
                    
                    dayData.Classes = dayActivities.class.length > 0 
                        ? Number((dayActivities.class.reduce((sum, time) => sum + time, 0) / dayActivities.class.length).toFixed(1))
                        : 0;
                    
                    dayData.Quizzes = dayActivities.quiz.length > 0 
                        ? Number((dayActivities.quiz.reduce((sum, time) => sum + time, 0) / dayActivities.quiz.length).toFixed(1))
                        : 0;
                }
            });

            setLearningTimeData(chartData);

        } catch (error) {
            console.error('Error fetching learning time data:', error);
            // Set default empty data if API fails
            const defaultData: ChartData[] = [
                { name: 'Mon', Lessons: 0, Classes: 0, Quizzes: 0 },
                { name: 'Tue', Lessons: 0, Classes: 0, Quizzes: 0 },
                { name: 'Wed', Lessons: 0, Classes: 0, Quizzes: 0 },
                { name: 'Thu', Lessons: 0, Classes: 0, Quizzes: 0 },
                { name: 'Fri', Lessons: 0, Classes: 0, Quizzes: 0 },
                { name: 'Sat', Lessons: 0, Classes: 0, Quizzes: 0 },
                { name: 'Sun', Lessons: 0, Classes: 0, Quizzes: 0 },
            ];
            setLearningTimeData(defaultData);
        }
    };

    // Helper functions to break down the existing fetch logic
    const fetchClassesWithStudents = async (classes: any[], headers: any) => {
        return await Promise.all(
            classes.map(async (classItem: any) => {
                try {
                    const studentsRes = await axios.get(
                        `${Server_url}/api/classrooms/classroom/${classItem.id}/enrolled-students/`,
                        { headers }
                    );
                    const studentCount = (studentsRes.data.results || studentsRes.data).length;
                    return { ...classItem, students: studentCount };
                } catch (error) {
                    console.error(`Error fetching students for class ${classItem.id}:`, error);
                    return { ...classItem, students: 0 };
                }
            })
        );
    };

    const fetchLessonsWithStudents = async (lessons: any[], classes: any[], headers: any) => {
        return await Promise.all(
            lessons.map(async (lesson: any) => {
                try {
                    let totalStudents = 0;
                    
                    for (const classItem of classes) {
                        if (classItem.lessons && classItem.lessons.includes(lesson.id)) {
                            const studentsRes = await axios.get(
                                `${Server_url}/api/classrooms/classroom/${classItem.id}/enrolled-students/`,
                                { headers }
                            );
                            totalStudents += (studentsRes.data.results || studentsRes.data).length;
                        }
                    }
                    
                    return { ...lesson, students: totalStudents };
                } catch (error) {
                    console.error(`Error calculating students for lesson ${lesson.id}:`, error);
                    return { ...lesson, students: 0 };
                }
            })
        );
    };

    const fetchPendingAssignments = async (token: string, classes: any[]) => {
        try {
            const pendingList: PendingAssignment[] = [];

            // For each class, fetch assignments and their submissions
            for (const classItem of classes) {
                // Fetch assignments for this class
                const assignmentsRes = await axios.get(
                    `${Server_url}/api/classrooms/classroom/${classItem.id}/assignments/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Fetch enrolled students for this class
                const studentsRes = await axios.get(
                    `${Server_url}/api/classrooms/classroom/${classItem.id}/enrolled-students/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Fetch submissions for this class
                const submissionsRes = await axios.get(
                    `${Server_url}/api/classrooms/classroom/${classItem.id}/assignment-submissions/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const assignments = assignmentsRes.data;
                const students = studentsRes.data.results || studentsRes.data;
                const submissions = submissionsRes.data;
                const totalStudents = students.length;

                // Calculate pending assignments
                assignments.forEach((assignment: any) => {
                    const assignmentSubmissions = submissions.filter(
                        (sub: any) => sub.assignment === assignment.id
                    );
                    const submittedCount = assignmentSubmissions.length;
                    const pendingCount = totalStudents - submittedCount;
                    const completionPercentage = totalStudents > 0 
                        ? Math.round((submittedCount / totalStudents) * 100) 
                        : 0;

                    // Only add to pending list if there are pending submissions
                    if (pendingCount > 0) {
                        pendingList.push({
                            id: assignment.id,
                            title: assignment.title,
                            classroom_title: classItem.title,
                            pending_count: pendingCount,
                            total_students: totalStudents,
                            completion_percentage: completionPercentage
                        });
                    }
                });
            }

            // Sort by completion percentage (lowest first) and limit to 10
            const sortedPending = pendingList
                .sort((a, b) => a.completion_percentage - b.completion_percentage)
                .slice(0, 10);

            setPendingAssignments(sortedPending);

        } catch (error) {
            console.error('Error fetching pending assignments:', error);
            setPendingAssignments([]);
        }
    };

    // Mock Data for components without APIs
    const defaultLearningTimeData: ChartData[] = [
        { name: 'Mon', Lessons: 0, Classes: 0, Quizzes: 0 },
        { name: 'Tue', Lessons: 0, Classes: 0, Quizzes: 0 },
        { name: 'Wed', Lessons: 0, Classes: 0, Quizzes: 0 },
        { name: 'Thu', Lessons: 0, Classes: 0, Quizzes: 0 },
        { name: 'Fri', Lessons: 0, Classes: 0, Quizzes: 0 },
        { name: 'Sat', Lessons: 0, Classes: 0, Quizzes: 0 },
        { name: 'Sun', Lessons: 0, Classes: 0, Quizzes: 0 },
    ];
    

    if (loading) {
        return <div className="flex h-screen bg-gray-100"><div className="m-auto">Loading Dashboard...</div></div>
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar isMobileMenuOpen={isSidebarOpen} toggleMobileMenu={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <div className="flex-1 flex flex-col lg:ml-64">
                <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

                <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800">Quick Metrics</h3>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <MetricCard title="Total Students" value={metrics?.totalStudents ?? '...'} icon={<FiUsers />} onClick={() => navigate('/students-page')} />
                                    <MetricCard title="Total Classes" value={metrics?.totalClasses ?? '...'} icon={<FiBookOpen />} onClick={() => navigate('/teacher-classes')} />
                                    <MetricCard title="Total Lessons" value={metrics?.totalLessons ?? '...'} icon={<FiClipboard />} onClick={() => navigate('/lessons')} />
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-800">Student's Average Learning Time</h3>
                                        <p className="text-xs text-gray-500">Average time spent per day (last 7 days)</p>
                                    </div>
                                    <button className="text-blue-600 font-semibold text-sm flex items-center gap-1">
                                        This Week <FiArrowRight size={14} />
                                    </button>
                                </div>
                                <div className="h-64 w-full">
                                    {learningTimeData.some(d => d.Lessons > 0 || d.Classes > 0 || d.Quizzes > 0) ? (
                                        <ResponsiveContainer>
                                            <BarChart data={learningTimeData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b7280' }}/>
                                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} tick={{ fontSize: 12, fill: '#6b7280' }}/>
                                                <Tooltip cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} contentStyle={{background: 'white', border: '1px solid #ddd', borderRadius: '8px'}}/>
                                                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px", paddingTop: '20px'}}/>
                                                <Bar dataKey="Lessons" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="Classes" fill="#818cf8" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="Quizzes" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            <div className="text-center">
                                                <FiClipboard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                                <p className="text-sm">No learning activity data available</p>
                                                <p className="text-xs text-gray-400">Students haven't started learning yet</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1 flex flex-col gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <ActionButton text="Add New Student" onClick={() => navigate('/add-students')} />
                                    <ActionButton text="Create New Class" onClick={() => navigate('/create-class')} />
                                    <ActionButton text="Create New Lesson" onClick={() => navigate('/add-lesson')} />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800">Pending Assignments</h3>
                                    <span className="text-sm text-gray-500">{pendingAssignments.length} pending</span>
                                </div>
                                {pendingAssignments.length > 0 ? (
                                    <ul className="space-y-3 max-h-72 overflow-y-auto">
                                        {pendingAssignments.map(item => (
                                            <li 
                                                key={item.id} 
                                                className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                                onClick={() => navigate(`/reports/${item.id.split('-')[0]}`)} // Navigate to reports page
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <span className="font-medium text-gray-900 text-sm block truncate">
                                                            {item.title}
                                                        </span>
                                                        <span className="text-xs text-gray-500 block truncate">
                                                            {item.classroom_title}
                                                        </span>
                                                    </div>
                                                    <button className="text-gray-400 hover:text-gray-700 flex-shrink-0 ml-2">
                                                        <FiMoreVertical />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-red-600 font-medium">
                                                        {item.pending_count} pending
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-blue-500 rounded-full transition-all"
                                                                style={{ width: `${item.completion_percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            {item.completion_percentage}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <FiClipboard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                        <p className="text-sm">All assignments completed!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <PopularList title="Your Popular Classes" items={popularClasses} onItemClick={(id) => navigate(`/Class_info_Page/${id}`)} />
                            <PopularList title="Your Popular Lessons" items={popularLessons} onItemClick={(id) => navigate(`/lesson-view/${id}`)} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;