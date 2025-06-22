import React, { useState, useEffect, FC } from 'react';
import axios from 'axios';
import Sidebar from '../../Component/Home/Sidebar.tsx'; // Assuming these components exist
import Header from '../../Component/Home/Header.tsx';   // and can accept props
import Server_url from '../../config';
import { useNavigate } from 'react-router-dom'; // <-- Import useNavigate
import { FiUsers, FiBookOpen, FiClipboard, FiPlus, FiArrowRight, FiTrendingUp, FiMoreVertical } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useView } from '../../Context/ViewContext.tsx'; // For the Student/Teacher view toggle

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
interface PendingAssignment {
  id: string;
  title: string;
}
interface ChartData {
    name: string;
    Lessons: number;
    Classes: number;
    Quizzes: number;
}

// --- Reusable UI Components (with navigation) ---

const MetricCard: FC<{ title: string; value: number | string; icon: React.ReactNode; trend: string; onClick: () => void; }> = ({ title, value, icon, trend, onClick }) => (
  <div onClick={onClick} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">{icon}</div>
        <span className="font-semibold text-gray-600 text-sm">{title}</span>
      </div>
      <FiArrowRight className="text-gray-400" />
    </div>
    <div className="mt-4 flex items-baseline gap-2">
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <div className="flex items-center text-green-500 text-xs font-semibold">
        <FiTrendingUp size={12} className="mr-1" />
        {trend}
      </div>
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
    const navigate = useNavigate(); // <-- Initialize navigate hook
    const [metrics, setMetrics] = useState<Metric | null>(null);
    const [popularClasses, setPopularClasses] = useState<PopularItem[]>([]);
    const [popularLessons, setPopularLessons] = useState<PopularItem[]>([]);
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

                setPopularClasses(classesRes.data.map((c: any) => ({ ...c, students: Math.floor(Math.random() * 50) })));
                setPopularLessons(lessonsRes.data.map((l: any) => ({ ...l, students: Math.floor(Math.random() * 50) })));

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    
    // Mock Data for components without APIs
    const learningTimeData: ChartData[] = [
        { name: 'Mon', Lessons: 2, Classes: 3, Quizzes: 1 }, { name: 'Tue', Lessons: 4, Classes: 2.5, Quizzes: 1.5 },
        { name: 'Wed', Lessons: 2.5, Classes: 4, Quizzes: 2 }, { name: 'Thu', Lessons: 3, Classes: 2, Quizzes: 1 },
        { name: 'Fri', Lessons: 2, Classes: 3, Quizzes: 2.5 }, { name: 'Sat', Lessons: 1.5, Classes: 2, Quizzes: 1 },
        { name: 'Sun', Lessons: 3, Classes: 4, Quizzes: 2 },
    ];
    
    const pendingAssignments: PendingAssignment[] = [
        { id: '1', title: 'Culture in Spanish' }, { id: '2', title: 'Verb Conjugation Practice' },
        { id: '3', title: 'Food Vocabulary Quiz' }, { id: '4', title: 'Travel Phrases Assignment' },
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
                    {/* <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
                        <div className="hidden md:flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                            <button onClick={() => setStudentView(true)} className={`px-3 py-1 text-sm font-semibold rounded-md ${studentView ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Student View</button>
                            <button onClick={() => setStudentView(false)} className={`px-3 py-1 text-sm font-semibold rounded-md ${!studentView ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Teacher View</button>
                        </div>
                    </div> */}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800">Quick Metrics</h3>
                                    <button className="text-blue-600 font-semibold text-sm flex items-center gap-1">This Week <FiArrowRight size={14} /></button>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <MetricCard title="Total Students" value={metrics?.totalStudents ?? '...'} icon={<FiUsers />} trend="+56.80%" onClick={() => navigate('/students-page')} />
                                    <MetricCard title="Total Classes" value={metrics?.totalClasses ?? '...'} icon={<FiBookOpen />} trend="+56.80%" onClick={() => navigate('/teacher-classes')} />
                                    <MetricCard title="Total Lessons" value={metrics?.totalLessons ?? '...'} icon={<FiClipboard />} trend="+56.80%" onClick={() => navigate('/lessons')} />
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-800">Student's Average Learning Time</h3>
                                        <p className="text-xs text-green-500 font-semibold">+2 hrs more than last week</p>
                                    </div>
                                    <button className="text-blue-600 font-semibold text-sm flex items-center gap-1">This Week <FiArrowRight size={14} /></button>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer>
                                        <BarChart data={learningTimeData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b7280' }}/>
                                            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value} hrs`} tick={{ fontSize: 12, fill: '#6b7280' }}/>
                                            <Tooltip cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} contentStyle={{background: 'white', border: '1px solid #ddd', borderRadius: '8px'}}/>
                                            <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px", paddingTop: '20px'}}/>
                                            <Bar dataKey="Lessons" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Classes" fill="#818cf8" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Quizzes" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
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
                                <h3 className="font-bold text-gray-800 mb-4">Pending Assignments</h3>
                                <ul className="space-y-3">
                                    {pendingAssignments.map(item => (
                                        <li key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                            <span className="font-medium text-gray-700 text-sm">{item.title}</span>
                                            <button className="text-gray-400 hover:text-gray-700"><FiMoreVertical /></button>
                                        </li>
                                    ))}
                                </ul>
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