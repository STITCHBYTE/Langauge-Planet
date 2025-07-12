import React, { useState, useEffect } from 'react';

// --- Server URL Configuration ---
// In a real application, this would likely be in a .env file
const Server_url = 'https://api.example.com'; // Replace with your actual server URL

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

const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);

const ChevronDownIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

// --- Component Props & Type Interfaces ---

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

// NOTE: This is an assumed structure based on the new screenshot.
// You may need to adjust field names to match your actual API response.
interface Teacher {
    id: string;
    name: string;
    email: string;
    last_login: string;
    lessons_count: number;
    classes_count: number;
    languages_count: number;
    students_count: number;
}

// --- Reusable Components ---

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false }) => (
  <a href="#" className={`flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors duration-200 ${active ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}>
    {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`})}
    <span className={`ml-4 font-medium ${active ? 'text-blue-600' : 'text-gray-800'}`}>{label}</span>
  </a>
);

const TeacherTableRow: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
    const initial = teacher.name ? teacher.name.charAt(0).toUpperCase() : '?';
    // Simple logic to cycle through a few colors for variety
    const colors = ['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-yellow-100 text-yellow-600'];
    const avatarColor = colors[teacher.id.charCodeAt(0) % colors.length];

    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-6 text-left whitespace-nowrap">
                <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm mr-3 ${avatarColor}`}>
                        {initial}
                    </div>
                    <div>
                        <div className="font-medium text-gray-800">{teacher.name}</div>
                        <div className="text-sm text-gray-500">@{teacher.email.split('@')[0]}</div>
                    </div>
                </div>
            </td>
            <td className="py-3 px-6 text-left text-gray-600">{teacher.last_login}</td>
            <td className="py-3 px-6 text-left text-gray-600">{teacher.lessons_count} Lessons</td>
            <td className="py-3 px-6 text-left text-gray-600">{teacher.classes_count} Classes</td>
            <td className="py-3 px-6 text-left text-gray-600">{teacher.languages_count} Languages</td>
            <td className="py-3 px-6 text-left text-gray-600">{teacher.students_count} Students</td>
        </tr>
    );
};

const Pagination: React.FC = () => (
    <div className="flex justify-center items-center mt-6 text-sm py-4">
        <button className="px-3 py-1 rounded-md hover:bg-gray-200 text-gray-500">&lt;</button>
        <button className="px-3 py-1 rounded-md hover:bg-gray-200 text-gray-700">1</button>
        <button className="px-3 py-1 rounded-md hover:bg-gray-200 text-gray-700">2</button>
        <button className="px-3 py-1 rounded-md bg-blue-100 text-blue-600 font-semibold">3</button>
        <button className="px-3 py-1 rounded-md hover:bg-gray-200 text-gray-700">4</button>
        <button className="px-3 py-1 rounded-md hover:bg-gray-200 text-gray-700">5</button>
        <button className="px-3 py-1 rounded-md hover:bg-gray-200 text-gray-700">6</button>
        <button className="px-3 py-1 rounded-md hover:bg-gray-200 text-gray-500">&gt;</button>
    </div>
);


// --- Main Page Component ---

const App: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeachers = async () => {
            setLoading(true);
            setError(null);
            try {
                const mockData: Teacher[] = [
                    { id: '1', name: 'Emery Torff', email: 'emery@example.com', last_login: '16/03/2024 • 15:54', lessons_count: 8, classes_count: 8, languages_count: 2, students_count: 150 },
                    { id: '2', name: 'Maren Dokidis', email: 'maren@example.com', last_login: '16/03/2024 • 15:54', lessons_count: 10, classes_count: 8, languages_count: 2, students_count: 150 },
                    { id: '3', name: 'Cooper Siphron', email: 'cooper@example.com', last_login: '16/03/2024 • 15:54', lessons_count: 4, classes_count: 8, languages_count: 2, students_count: 150 },
                    { id: '4', name: 'Marcus Dias', email: 'marcus@example.com', last_login: '16/03/2024 • 15:54', lessons_count: 2, classes_count: 8, languages_count: 4, students_count: 150 },
                    { id: '5', name: 'Ahmad Stanton', email: 'ahmad@example.com', last_login: '16/03/2024 • 15:54', lessons_count: 4, classes_count: 8, languages_count: 4, students_count: 150 },
                    { id: '6', name: 'Giana Carder', email: 'giana@example.com', last_login: '16/03/2024 • 15:54', lessons_count: 7, classes_count: 8, languages_count: 4, students_count: 150 },
                    { id: '7', name: 'Tiana Curtis', email: 'tiana@example.com', last_login: '16/03/2024 • 15:54', lessons_count: 1, classes_count: 8, languages_count: 4, students_count: 150 },
                    { id: '8', name: 'Omar Siphron', email: 'omar@example.com', last_login: '16/03/2024 • 15:54', lessons_count: 4, classes_count: 8, languages_count: 4, students_count: 150 },
                    { id: '9', name: 'Angel Rhiel Madsen', email: 'angel@example.com', last_login: '16/03/2024 • 15:54', lessons_count: 3, classes_count: 8, languages_count: 4, students_count: 150 },
                ];
                setTeachers(mockData);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white flex flex-col border-r">
                <div className="h-20 flex items-center px-6 border-b">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">L</div>
                    <span className="ml-3 text-lg font-bold text-gray-800">Language Planet</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem icon={<HomeIcon />} label="Dashboard" />
                    <NavItem icon={<LanguageIcon />} label="Languages" />
                    <NavItem icon={<BookOpenIcon />} label="Lessons" />
                    <NavItem icon={<UsersIcon />} label="Students" />
                    <NavItem icon={<UsersIcon />} label="Teachers" active />
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
                        <h1 className="text-xl font-bold text-gray-800">Teachers</h1>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button className="text-gray-500 hover:text-gray-700 relative">
                            <BellIcon className="w-6 h-6" />
                        </button>
                        <img src="https://placehold.co/40x40/E0E7FF/4F46E5?text=VA" alt="User Avatar" className="w-10 h-10 rounded-full" />
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative w-full max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="text-gray-400" />
                            </div>
                            <input type="text" placeholder="Search here..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <button className="flex items-center justify-center px-4 py-2 border border-gray-300 bg-white text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                            Filter By <ChevronDownIcon className="ml-2" />
                        </button>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        <th className="py-3 px-6">Name</th>
                                        <th className="py-3 px-6">Last Login</th>
                                        <th className="py-3 px-6">No. of Lessons</th>
                                        <th className="py-3 px-6">No. of Classes</th>
                                        <th className="py-3 px-6">No. of Languages</th>
                                        <th className="py-3 px-6">No. of Students</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {loading ? (
                                        <tr><td colSpan={6} className="text-center py-10 text-gray-500">Loading teachers...</td></tr>
                                    ) : error ? (
                                        <tr><td colSpan={6} className="text-center py-10 text-red-500">Error: {error}</td></tr>
                                    ) : (
                                        teachers.map(teacher => <TeacherTableRow key={teacher.id} teacher={teacher} />)
                                    )}
                                </tbody>
                            </table>
                        </div>
                         { !loading && !error && teachers.length > 0 && <Pagination /> }
                         { !loading && !error && teachers.length === 0 && <div className="text-center py-10 text-gray-500">No teachers found.</div>}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;