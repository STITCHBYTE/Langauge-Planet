import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar.tsx';
import { LanguageIcon, BookOpenIcon, UsersIcon } from './DashboardIcons.tsx';
import { useNavigate } from 'react-router-dom';
import Server_url from "../config";
import { toast } from 'react-toastify';
import { useView } from '../Context/ViewContext.tsx'; 

const Header: React.FC = () => {
    const { currentUser } = useView(); // Import useView from your ViewContext
    
    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-8 justify-between">
            <div>
                <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-6">
                
                <div className="flex items-center space-x-3">
                    {currentUser?.avatar_url ? (
                        <img 
                            src={currentUser.avatar_url} 
                            alt={currentUser.first_name || 'User'} 
                            className="w-10 h-10 rounded-full border-2 border-blue-100 object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg border-2 border-blue-100">
                            {currentUser ? 
                                (currentUser.first_name?.[0] || currentUser.username?.[0] || 'U').toUpperCase()
                                : 'AD'
                            }
                        </div>
                    )}
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-gray-800">
                            {currentUser?.first_name && currentUser?.last_name 
                                ? `${currentUser.first_name} ${currentUser.last_name}`
                                : currentUser?.username || 'Admin Panel'
                            }
                        </p>
                        <p className="text-xs text-gray-500">
                            {currentUser?.is_superuser ? 'Super User' : 'Admin'}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
};
const BellIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const ChevronDownIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const ChevronRightIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  percentage: number;
}

interface BarChartProps {
    data: { day: string; lesson: number; class: number; quiz: number }[];
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false }) => (
  <a className={`flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors duration-200 ${active ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}>
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </a>
);

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, percentage }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
        {percentage && (
            <div className="flex items-center text-sm text-green-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                <span>{percentage.toFixed(1)}%</span>
            </div>
        )}
    </div>
);

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.flatMap(d => [d.lesson, d.class, d.quiz]));

    return (
        <div className="mt-4">
            <div className="flex justify-end items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>Lessons</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-blue-300 rounded-full mr-2"></span>Classes</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-sky-300 rounded-full mr-2"></span>Quizzes</div>
            </div>
            <div className="flex justify-between items-end h-48 px-2 border-b border-gray-200">
                {data.map(item => (
                    <div key={item.day} className="flex-1 flex flex-col items-center">
                        <div className="flex items-end h-full w-full justify-center gap-1">
                            <div className="w-1/4 bg-blue-500 rounded-t-md" style={{ height: `${(item.lesson / maxValue) * 100}%` }}></div>
                            <div className="w-1/4 bg-blue-300 rounded-t-md" style={{ height: `${(item.class / maxValue) * 100}%` }}></div>
                            <div className="w-1/4 bg-sky-300 rounded-t-md" style={{ height: `${(item.quiz / maxValue) * 100}%` }}></div>
                        </div>
                        <span className="mt-2 text-xs text-gray-500">{item.day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const navigate = useNavigate();
    const [totalStudents, setTotalStudents] = useState<number>(0);
    const [totalTeachers, setTotalTeachers] = useState<number>(0);
    const [totalLanguages, setTotalLanguages] = useState<number>(0);
    const [totalLessons, setTotalLessons] = useState<number>(0);
    const [popularLanguages, setPopularLanguages] = useState<any[]>([]);
    const [popularLessons, setPopularLessons] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [averageLearningTime, setAverageLearningTime] = useState<string>('0 hrs');
    const [weeklyGrowth, setWeeklyGrowth] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                toast.error('Authentication token not found');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Fetch Students with detailed info
                const studentsRes = await fetch(`${Server_url}/api/users/students/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                let allStudents = [];
                if (studentsRes.ok) {
                    const studentsData = await studentsRes.json();
                    allStudents = Array.isArray(studentsData.results) ? studentsData.results : studentsData;
                    setTotalStudents(allStudents.length || 0);
                }

                // Fetch Teachers
                const teachersRes = await fetch(`${Server_url}/api/users/teachers/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (teachersRes.ok) {
                    const teachersData = await teachersRes.json();
                    const teachers = Array.isArray(teachersData.results) ? teachersData.results : teachersData;
                    setTotalTeachers(teachers.length || 0);
                }

                // Fetch Languages
                const languagesRes = await fetch(`${Server_url}/api/languages/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (languagesRes.ok) {
                    const languagesData = await languagesRes.json();
                    let languages = [];
                    if (Array.isArray(languagesData)) {
                        languages = languagesData;
                    } else if (languagesData.results && Array.isArray(languagesData.results)) {
                        languages = languagesData.results;
                    }
                    setTotalLanguages(languages.length || 0);
                    
                    // Get real student count for each language
                    const languagesWithStats = await Promise.all(
                        languages.map(async (lang: any) => {
                            try {
                                // Fetch lessons for this language
                                const lessonsRes = await fetch(`${Server_url}/api/lessons/lesson/public/?language=${lang.id}`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                
                                let studentCount = 0;
                                if (lessonsRes.ok) {
                                    const lessonsData = await lessonsRes.json();
                                    const lessons = Array.isArray(lessonsData.results) ? lessonsData.results : lessonsData;
                                    
                                    // Count unique students across all lessons of this language
                                    const studentIds = new Set();
                                    for (const lesson of lessons) {
                                        if (lesson.enrolled_students) {
                                            lesson.enrolled_students.forEach((studentId: any) => studentIds.add(studentId));
                                        }
                                    }
                                    studentCount = studentIds.size;
                                }
                                
                                return {
                                    name: lang.name || lang.language_name || lang.title,
                                    studentCount
                                };
                            } catch (error) {
                                return {
                                    name: lang.name || lang.language_name || lang.title,
                                    studentCount: 0
                                };
                            }
                        })
                    );
                    
                    setPopularLanguages(languagesWithStats.sort((a, b) => b.studentCount - a.studentCount).slice(0, 5));
                }

                // Fetch Lessons with real student enrollment data
                const lessonsRes = await fetch(`${Server_url}/api/lessons/lesson/public/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (lessonsRes.ok) {
                    const lessonsData = await lessonsRes.json();
                    const lessons = Array.isArray(lessonsData.results) ? lessonsData.results : lessonsData;
                    setTotalLessons(lessons.length || 0);
                    
                    // Get real student count for lessons by checking classrooms
                    const lessonsWithStats = await Promise.all(
                        lessons.slice(0, 10).map(async (lesson: any) => {
                            try {
                                // Find classrooms that have this lesson
                                const classroomsRes = await fetch(`${Server_url}/api/classrooms/my-classrooms/`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                
                                let studentCount = 0;
                                if (classroomsRes.ok) {
                                    const classrooms = await classroomsRes.json();
                                    const studentIds = new Set();
                                    
                                    for (const classroom of classrooms) {
                                        if (classroom.lessons && classroom.lessons.includes(lesson.id)) {
                                            try {
                                                const studentsRes = await fetch(`${Server_url}/api/classrooms/classroom/${classroom.id}/enrolled-students/`, {
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                });
                                                if (studentsRes.ok) {
                                                    const studentsData = await studentsRes.json();
                                                    const students = Array.isArray(studentsData.results) ? studentsData.results : studentsData;
                                                    students.forEach((student: any) => studentIds.add(student.id));
                                                }
                                            } catch (error) {
                                                console.error(`Error fetching students for classroom ${classroom.id}:`, error);
                                            }
                                        }
                                    }
                                    studentCount = studentIds.size;
                                }
                                
                                return {
                                    id: lesson.id,
                                    title: lesson.title,
                                    description: lesson.description?.substring(0, 50) + '...' || 'No description available',
                                    studentCount
                                };
                            } catch (error) {
                                return {
                                    id: lesson.id,
                                    title: lesson.title,
                                    description: lesson.description?.substring(0, 50) + '...' || 'No description available',
                                    studentCount: 0
                                };
                            }
                        })
                    );
                    
                    setPopularLessons(lessonsWithStats.sort((a, b) => b.studentCount - a.studentCount).slice(0, 5));
                }

                // Fetch Weekly Learning Analytics
                await fetchWeeklyLearningData(allStudents, token);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');
                // Set fallback data
                setChartData(generateDefaultChartData());
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const fetchWeeklyLearningData = async (students: any[], token: string) => {
        try {
            if (!students || students.length === 0) {
                setChartData(generateDefaultChartData());
                return;
            }

            const currentWeekStart = new Date();
            currentWeekStart.setDate(currentWeekStart.getDate() - 6);
            const currentWeekEnd = new Date();
            const lastWeekStart = new Date(currentWeekStart);
            lastWeekStart.setDate(lastWeekStart.getDate() - 7);
            const lastWeekEnd = new Date(currentWeekStart);

            const formatDate = (date: Date) => date.toISOString().split('T')[0];

            let currentWeekTotal = 0;
            let lastWeekTotal = 0;
            const weeklyData: any[] = [];

            // Initialize week data
            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            for (let i = 0; i < 7; i++) {
                const date = new Date(currentWeekStart);
                date.setDate(date.getDate() + i);
                weeklyData.push({
                    day: dayNames[i],
                    lesson: 0,
                    class: 0,
                    quiz: 0,
                    date: formatDate(date)
                });
            }

            // Fetch activity data for all students
            const activityPromises = students.slice(0, 20).map(async (student: any) => {
                try {
                    // Current week data
                    const currentRes = await fetch(
                        `${Server_url}/api/users/activity-summary/?user_id=${student.id}&from_date=${formatDate(currentWeekStart)}&end_date=${formatDate(currentWeekEnd)}`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );

                    if (currentRes.ok) {
                        const currentData = await currentRes.json();
                        if (currentData.total_time_in_seconds) {
                            currentWeekTotal += currentData.total_time_in_seconds;
                        }

                        // Process daily data
                        Object.keys(currentData).forEach(dateStr => {
                            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                                const dayData = weeklyData.find(d => d.date === dateStr);
                                if (dayData && currentData[dateStr]) {
                                    const activities = currentData[dateStr];
                                    dayData.lesson += (activities.lessons_completed || 0) / 3600; // Convert to hours
                                    dayData.class += (activities.class || 0) / 3600;
                                    dayData.quiz += (activities.quizzes_completed || 0) / 3600;
                                }
                            }
                        });
                    }

                    // Last week data for comparison
                    const lastRes = await fetch(
                        `${Server_url}/api/users/activity-summary/?user_id=${student.id}&from_date=${formatDate(lastWeekStart)}&end_date=${formatDate(lastWeekEnd)}`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );

                    if (lastRes.ok) {
                        const lastData = await lastRes.json();
                        if (lastData.total_time_in_seconds) {
                            lastWeekTotal += lastData.total_time_in_seconds;
                        }
                    }

                } catch (error) {
                    console.error(`Error fetching activity for student ${student.id}:`, error);
                }
            });

            await Promise.all(activityPromises);

            // Calculate averages
            const avgCurrentWeek = currentWeekTotal / (students.length * 3600); // Convert to hours
            const avgLastWeek = lastWeekTotal / (students.length * 3600);
            const growth = avgLastWeek > 0 ? ((avgCurrentWeek - avgLastWeek) / avgLastWeek) * 100 : 0;

            setAverageLearningTime(`${avgCurrentWeek.toFixed(1)} hrs`);
            setWeeklyGrowth(growth);
            setChartData(weeklyData);

        } catch (error) {
            console.error('Error fetching weekly learning data:', error);
            setChartData(generateDefaultChartData());
        }
    };

    const generateDefaultChartData = () => [
        { day: 'Mon', lesson: 0, class: 0, quiz: 0 },
        { day: 'Tue', lesson: 0, class: 0, quiz: 0 },
        { day: 'Wed', lesson: 0, class: 0, quiz: 0 },
        { day: 'Thu', lesson: 0, class: 0, quiz: 0 },
        { day: 'Fri', lesson: 0, class: 0, quiz: 0 },
        { day: 'Sat', lesson: 0, class: 0, quiz: 0 },
        { day: 'Sun', lesson: 0, class: 0, quiz: 0 },
    ];

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500">Loading dashboard...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col">
               <Header/>
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-blue-500 transition-colors"
                                        onClick={() => navigate("/admin/languages")}
                                    >
                                        <span className="text-2xl mr-3">+</span> Add New Language
                                    </button>
                                    <button 
                                        className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-blue-500 transition-colors"
                                        onClick={() => navigate("/admin/lesson/add")}
                                    >
                                        <span className="text-2xl mr-3">+</span> Create New Lesson
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">Student's Average Learning Time</h2>
                                        <p className="text-sm text-gray-500">Weekly average: {averageLearningTime}</p>
                                        {weeklyGrowth !== 0 && (
                                            <p className={`text-sm font-medium ${weeklyGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {weeklyGrowth > 0 ? '+' : ''}{weeklyGrowth.toFixed(1)}% vs last week
                                            </p>
                                        )}
                                    </div>
                                    <button className="flex items-center text-sm text-blue-600 font-semibold">
                                        This Week <ChevronDownIcon className="ml-1" />
                                    </button>
                                </div>
                                <BarChart data={chartData} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Popular Languages */}
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Popular Languages</h2>
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="text-gray-500 border-b">
                                                <th className="pb-2 font-normal">Language</th>
                                                <th className="pb-2 font-normal text-right">Students</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {popularLanguages.length > 0 ? popularLanguages.map((lang, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="py-3">{lang.name}</td>
                                                    <td className="py-3 text-right">{lang.studentCount}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={2} className="py-3 text-center text-gray-500">No data available</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Popular Lessons */}
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Popular Lessons</h2>
                                    <div className="space-y-3">
                                        {popularLessons.length > 0 ? popularLessons.map((lesson) => (
                                            <div key={lesson.id} className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">{lesson.title}</p>
                                                    <p className="text-xs text-gray-500">{lesson.description}</p>
                                                </div>
                                                <p className="text-sm text-gray-600 mx-4">{lesson.studentCount} Students</p>
                                                <button 
                                                    className="text-gray-400 hover:text-gray-600"
                                                    onClick={() => navigate(`/admin/lesson/view/${lesson.id}`)}
                                                >
                                                    <ChevronRightIcon />
                                                </button>
                                            </div>
                                        )) : (
                                            <p className="text-center text-gray-500">No lessons available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Metrics Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Quick Metrics</h2>
                                </div>
                                <div className="space-y-4">
                                    <MetricCard 
                                        icon={<LanguageIcon className="w-6 h-6 text-blue-500"/>} 
                                        label="Total Languages" 
                                        value={totalLanguages.toString()} 
                                        percentage={null} 
                                    />
                                    <MetricCard 
                                        icon={<BookOpenIcon className="w-6 h-6 text-blue-500"/>} 
                                        label="Total Lessons" 
                                        value={totalLessons.toString()} 
                                        percentage={null} 
                                    />
                                    <MetricCard 
                                        icon={<UsersIcon className="w-6 h-6 text-blue-500"/>} 
                                        label="Total Students" 
                                        value={totalStudents.toLocaleString()} 
                                        percentage={null} 
                                    />
                                    <MetricCard 
                                        icon={<UsersIcon className="w-6 h-6 text-blue-500"/>} 
                                        label="Total Teachers" 
                                        value={totalTeachers.toLocaleString()} 
                                        percentage={null} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
