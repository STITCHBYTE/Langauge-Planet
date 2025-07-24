import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar.tsx';
import { LanguageIcon, BookOpenIcon, UsersIcon } from './DashboardIcons.tsx';
import { useNavigate } from 'react-router-dom';
import Server_url from "../config";

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
        <div className="flex items-center text-sm text-green-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" /></svg>
            <span>{percentage.toFixed(2)}%</span>
        </div>
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

    useEffect(() => {
        const fetchCounts = async () => {
            const token = localStorage.getItem('authToken');
            const studentsRes = await fetch(`${Server_url}/api/users/students/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (studentsRes.ok) {
                const studentsData = await studentsRes.json();
                setTotalStudents(Array.isArray(studentsData.results) ? studentsData.results.length : studentsData.length);
            }
            const teachersRes = await fetch(`${Server_url}/api/users/teachers/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (teachersRes.ok) {
                const teachersData = await teachersRes.json();
                setTotalTeachers(Array.isArray(teachersData.results) ? teachersData.results.length : teachersData.length);
            }
        };
        fetchCounts();
    }, []);

    const chartData = [
        { day: 'Mon', lesson: 2.5, class: 3.2, quiz: 1.8 },
        { day: 'Tue', lesson: 1.5, class: 2.1, quiz: 1.2 },
        { day: 'Wed', lesson: 3.1, class: 1.5, quiz: 2.5 },
        { day: 'Thu', lesson: 2.2, class: 1.8, quiz: 1.5 },
        { day: 'Fri', lesson: 2.8, class: 2.1, quiz: 1.9 },
        { day: 'Sat', lesson: 1.8, class: 1.2, quiz: 2.9 },
        { day: 'Sun', lesson: 2.5, class: 4.1, quiz: 2.0 },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col">
                <header className="h-20 bg-white border-b flex items-center px-8 justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button className="text-gray-500 hover:text-gray-700 relative">
                            <BellIcon className="w-6 h-6" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <img src="https://placehold.co/40x40/E0E7FF/4F46E5?text=VA" alt="User Avatar" className="w-10 h-10 rounded-full" />
                    </div>
                </header>
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
                                    <button className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-blue-500 transition-colors">
                                        <span className="text-2xl mr-3">+</span> Create New Lesson
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">Student's Average Learning Time</h2>
                                        <p className="text-sm text-green-500 font-medium">+2 hrs more than last week</p>
                                    </div>
                                    <button className="flex items-center text-sm text-blue-600 font-semibold">
                                        This Week <ChevronDownIcon className="ml-1" />
                                    </button>
                                </div>
                                <BarChart data={chartData} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Popular Language</h2>
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="text-gray-500 border-b">
                                                <th className="pb-2 font-normal">Language</th>
                                                <th className="pb-2 font-normal text-right">No. of Students</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="py-3">English</td>
                                                <td className="py-3 text-right">500 Students</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Popular Lessons</h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-800">Culture in Spanish</p>
                                                <p className="text-xs text-gray-500">Lorem ipsum dolor sit amet imbute...</p>
                                            </div>
                                            <p className="text-sm text-gray-600">8 Students</p>
                                            <button className="text-gray-400 hover:text-gray-600"><ChevronRightIcon /></button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-800">Culture in Spanish</p>
                                                <p className="text-xs text-gray-500">Lorem ipsum dolor sit amet imbute...</p>
                                            </div>
                                            <p className="text-sm text-gray-600">8 Students</p>
                                            <button className="text-gray-400 hover:text-gray-600"><ChevronRightIcon /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Quick Metrics</h2>
                                    <button className="flex items-center text-sm text-blue-600 font-semibold">
                                        This Week <ChevronDownIcon className="ml-1" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <MetricCard icon={<LanguageIcon className="w-6 h-6 text-blue-500"/>} label="Total Languages" value="10" percentage={56.80} />
                                    <MetricCard icon={<BookOpenIcon className="w-6 h-6 text-blue-500"/>} label="Total Lessons" value="100" percentage={56.80} />
                                    <MetricCard icon={<UsersIcon className="w-6 h-6 text-blue-500"/>} label="Total Students" value={totalStudents.toLocaleString()} percentage={56.80} />
                                    <MetricCard icon={<UsersIcon className="w-6 h-6 text-blue-500"/>} label="Total Teachers" value={totalTeachers.toLocaleString()} percentage={56.80} />
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
