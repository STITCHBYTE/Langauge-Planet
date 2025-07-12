import React from 'react';
import { useNavigate } from 'react-router-dom';

// --- SVG Icon Components ---

const HomeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const LanguageIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m4 13l4-4M19 9l-4 4M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const BookOpenIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const UsersIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a4 4 0 110-5.292" />
  </svg>
);

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

// --- Component Props Interfaces ---

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


// --- Reusable Components ---

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


// --- Main Page Component ---

const App: React.FC = () => {
    const navigate = useNavigate();
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
            {/* Sidebar */}
            <aside className="w-64 bg-white flex flex-col border-r">
                <div className="h-20 flex items-center px-6 border-b">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">L</div>
                    <span className="ml-3 text-lg font-bold text-gray-800">Language Planet</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem icon={<HomeIcon className="w-5 h-5" />} label="Dashboard" active />
                    <NavItem
                        icon={<LanguageIcon className="w-5 h-5" />}
                        label="Languages"
                        active={false}
                        onClick={() => navigate('/admin/languages')}
                    />
                    <NavItem icon={<BookOpenIcon className="w-5 h-5" />} label="Lessons" onClick={() => navigate('/admin/lessons')} />
                    <NavItem icon={<UsersIcon className="w-5 h-5" />} label="Students" onClick={() => navigate('/admin/students')} />
                    <NavItem icon={<UsersIcon className="w-5 h-5" />} label="Teachers" onClick={() => navigate('/admin/teachers')} />
                </nav>
                <div className="p-4 border-t">
                    <div className="flex items-center">
                        <img src="https://placehold.co/40x40/E0E7FF/4F46E5?text=VA" alt="Victoria Akudo" className="w-10 h-10 rounded-full" />
                        <div className="ml-3">
                            <p className="font-semibold text-sm text-gray-800">Victoria Akudo</p>
                            <p className="text-xs text-gray-500">victoria@example.com</p>
                        </div>
                        <button className="ml-auto text-gray-500 hover:text-gray-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
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

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left and Center Column */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Quick Actions */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-blue-500 transition-colors">
                                        <span className="text-2xl mr-3">+</span> Add New Language
                                    </button>
                                    <button className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-blue-500 transition-colors">
                                        <span className="text-2xl mr-3">+</span> Create New Lesson
                                    </button>
                                </div>
                            </div>

                            {/* Student's Average Learning Time */}
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
                                {/* Your Popular Language */}
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
                                
                                {/* Your Popular Lessons */}
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

                        {/* Right Column */}
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
                                    <MetricCard icon={<UsersIcon className="w-6 h-6 text-blue-500"/>} label="Total Students" value="3,123" percentage={56.80} />
                                    <MetricCard icon={<UsersIcon className="w-6 h-6 text-blue-500"/>} label="Total Teachers" value="27" percentage={56.80} />
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
