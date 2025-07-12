import React, { useState, useEffect } from 'react';
import Server_url from '../config.js';

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

interface Student {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    last_login: string;
    learning_points: number;
    lessons_completed: number;
    languages_count: number;
    avg_learning_time: string;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean }> = ({ icon, label, active = false }) => (
  <a href="#" className={`flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors duration-200 ${active ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}>
    {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`})}
    <span className={`ml-4 font-medium ${active ? 'text-blue-600' : 'text-gray-800'}`}>{label}</span>
  </a>
);

const StudentTableRow: React.FC<{ student: Student }> = ({ student }) => {
    const initial = student.first_name ? student.first_name.charAt(0).toUpperCase() : '?';
    const avatarColor = 'bg-blue-100 text-blue-600';

    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-6 text-left whitespace-nowrap">
                <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm mr-3 ${avatarColor}`}>
                        {initial}
                    </div>
                    <div>
                        <div className="font-medium text-gray-800">{student.first_name} {student.last_name}</div>
                        <div className="text-sm text-gray-500">@{student.email.split('@')[0]}</div>
                    </div>
                </div>
            </td>
            <td className="py-3 px-6 text-left text-gray-600">{student.last_login}</td>
            <td className="py-3 px-6 text-left text-gray-600">{student.learning_points}</td>
            <td className="py-3 px-6 text-left text-gray-600">{student.lessons_completed} Lessons</td>
            <td className="py-3 px-6 text-left text-gray-600">{student.languages_count} Languages</td>
            <td className="py-3 px-6 text-left text-gray-600">{student.avg_learning_time}</td>
        </tr>
    );
};

const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }
    return (
        <div className="flex justify-center items-center mt-6 text-sm">
            <button
                className="px-3 py-1 rounded-md hover:bg-gray-200 text-gray-500"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                &lt;
            </button>
            {pages.map(page => (
                <button
                    key={page}
                    className={`px-3 py-1 rounded-md ${page === currentPage ? 'bg-blue-100 text-blue-600 font-semibold' : 'hover:bg-gray-200 text-gray-700'}`}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}
            <button
                className="px-3 py-1 rounded-md hover:bg-gray-200 text-gray-500"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                &gt;
            </button>
        </div>
    );
};

const App: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${Server_url}/api/users/students/?page=${currentPage}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch students');
                }
                const data = await response.json();
                setStudents(data.results || data);
                setTotalPages(data.total_pages || data.totalPages || 1); // Adjust according to your API response
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [currentPage]);

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <aside className="w-64 bg-white flex flex-col border-r">
                <div className="h-20 flex items-center px-6 border-b">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">L</div>
                    <span className="ml-3 text-lg font-bold text-gray-800">Language Planet</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem icon={<HomeIcon />} label="Dashboard" />
                    <NavItem icon={<LanguageIcon />} label="Languages" />
                    <NavItem icon={<BookOpenIcon />} label="Lessons" />
                    <NavItem icon={<UsersIcon />} label="Students" active />
                    <NavItem icon={<UsersIcon />} label="Teachers" />
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
            <main className="flex-1 flex flex-col">
                <header className="h-20 bg-white border-b flex items-center px-8 justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Students</h1>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button className="text-gray-500 hover:text-gray-700 relative">
                            <BellIcon className="w-6 h-6" />
                        </button>
                        <img src="https://placehold.co/40x40/E0E7FF/4F46E5?text=VA" alt="User Avatar" className="w-10 h-10 rounded-full" />
                    </div>
                </header>
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
                                        <th className="py-3 px-6">Learning Points</th>
                                        <th className="py-3 px-6">No. of Lessons Completed</th>
                                        <th className="py-3 px-6">No. of Languages</th>
                                        <th className="py-3 px-6">Avg. Learning Time</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {loading ? (
                                        <tr><td colSpan={6} className="text-center py-10 text-gray-500">Loading students...</td></tr>
                                    ) : error ? (
                                        <tr><td colSpan={6} className="text-center py-10 text-red-500">Error: {error}</td></tr>
                                    ) : (
                                        students.map(student => <StudentTableRow key={student.id} student={student} />)
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {!loading && !error && totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                        {!loading && !error && students.length === 0 && <div className="text-center py-10 text-gray-500">No students found.</div>}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;