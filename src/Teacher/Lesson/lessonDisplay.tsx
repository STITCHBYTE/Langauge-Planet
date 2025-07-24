import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Header from '../../Component/Home/Header.tsx';
import Server_url from '../../config.js';

interface Lesson {
    id: string;
    title: string;
    description: string;
    image?: string;
    is_private: boolean;
    lesson_level: string;
    created_at?: string;
    updated_at?: string;
}

const DropdownMenu: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onEdit: () => void; 
    onDelete: () => void;
    buttonRef: React.RefObject<HTMLButtonElement>;
}> = ({ isOpen, onClose, onEdit, onDelete, buttonRef }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, buttonRef]);

    if (!isOpen) return null;

    return (
        <div 
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50"
        >
            <div className="py-1">
                <button
                    onClick={onEdit}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Lesson
                </button>
                <button
                    onClick={onDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Lesson
                </button>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const LessonCard: React.FC<{ 
    lesson: Lesson; 
    onView: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ lesson, onView, onEdit, onDelete }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownButtonRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;

    const typeTagClass = !lesson.is_private 
        ? 'bg-green-100 text-green-700' 
        : 'bg-orange-100 text-orange-700';

    const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
        if (!imagePath) return undefined;
        
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        } else if (imagePath.startsWith('/media/') || imagePath.startsWith('media/')) {
            return `${Server_url}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
        } else if (imagePath.startsWith('/')) {
            return `${Server_url}${imagePath}`;
        } else {
            return `${Server_url}/${imagePath}`;
        }
    };

    const handleDropdownToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleEdit = () => {
        setIsDropdownOpen(false);
        onEdit(lesson.id);
    };

    const handleDelete = () => {
        setIsDropdownOpen(false);
        onDelete(lesson.id);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                    {lesson.image ? (
                        <img 
                            src={getImageUrl(lesson.image)} 
                            alt={lesson.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                            }}
                        />
                    ) : null}
                    <span 
                        className="text-2xl flex items-center justify-center w-full h-full" 
                        style={{ display: lesson.image ? 'none' : 'flex' }}
                    >
                        📚
                    </span>
                </div>
                <div className="relative">
                    <button 
                        ref={dropdownButtonRef}
                        onClick={handleDropdownToggle}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                        </svg>
                    </button>
                    
                    <DropdownMenu
                        isOpen={isDropdownOpen}
                        onClose={() => setIsDropdownOpen(false)}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        buttonRef={dropdownButtonRef}
                    />
                </div>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{lesson.title}</h3>
            
            <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-4">
                {lesson.description || 'No description available.'}
            </p>
            
            <div className="flex items-center flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${typeTagClass}`}>
                    {lesson.is_private ? 'Private Lesson' : 'Public Lesson'}
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                    {lesson.lesson_level}
                </span>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => onView(lesson.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    View Lesson
                </button>
            </div>
        </div>
    );
};
const LoadingCard: React.FC = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
        <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
            <div className="w-6 h-6 bg-slate-200 rounded"></div>
        </div>
        <div className="h-5 bg-slate-200 rounded mb-2"></div>
        <div className="h-4 bg-slate-200 rounded mb-4"></div>
        <div className="flex gap-2">
            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
            <div className="h-6 bg-slate-200 rounded-full w-16"></div>
        </div>
    </div>
);
const ErrorMessage: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="col-span-full bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 mb-4">{message}</p>
        <button 
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
        >
            Try Again
        </button>
    </div>
);
const LessonsComponent: React.FC = () => {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
    const fetchLessons = async () => {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            setError('Authentication token not found. Please login again.');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            
            const endpoint = activeTab === 'my' 
                ? `${Server_url}/api/lessons/lesson/my/` 
                : `${Server_url}/api/lessons/lesson/public/`;

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please login again.');
                } else if (response.status === 403) {
                    throw new Error('You do not have permission to view lessons.');
                } else {
                    throw new Error(`Failed to fetch lessons: ${response.status}`);
                }
            }

            const data = await response.json();
            
            const lessonsArray = data.results || data.lessons || data || [];
            setLessons(lessonsArray);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch lessons');
        } finally {
            setIsLoading(false);
        }
    };
    const handleViewLesson = (lessonId: string) => {
        navigate(`/lesson-view/${lessonId}`);
    };
    const handleEditLesson = (lessonId: string) => {
        navigate(`/edit-lesson/${lessonId}`);
    };
    const handleDeleteLesson = (lessonId: string) => {
        const lesson = lessons.find(l => l.id === lessonId);
        if (lesson) {
            setLessonToDelete(lesson);
            setShowDeleteModal(true);
        }
    };
    const confirmDeleteLesson = async () => {
        if (!lessonToDelete) return;

        const token = localStorage.getItem('authToken');
        
        if (!token) {
            toast.error('Authentication token not found. Please login again.');
            return;
        }

        try {
            
            const response = await fetch(`${Server_url}/api/lessons/lesson/${lessonToDelete.id}/delete/`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setLessons(prev => prev.filter(lesson => lesson.id !== lessonToDelete.id));
                setShowDeleteModal(false);
                setLessonToDelete(null);
                toast.success(`Lesson "${lessonToDelete.title}" has been deleted successfully.`);
                
            } else {
                const errorData = await response.text();
                
                if (response.status === 404) {
                    toast.error('Lesson not found. It may have already been deleted.');
                } else if (response.status === 403) {
                    toast.error('You do not have permission to delete this lesson.');
                } else if (response.status === 401) {
                    toast.error('Authentication failed. Please login again.');
                } else {
                    toast.error(`Failed to delete lesson. Server responded with status: ${response.status}`);
                }
            }
        } catch (error) {
            toast.error('Network error occurred while deleting the lesson. Please check your connection and try again.');
        }
    };
    const handleRetry = () => {
        fetchLessons();
    };
    const handleTabChange = (tab: 'my' | 'public') => {
        setActiveTab(tab);
    };
    useEffect(() => {
        fetchLessons();
    }, [activeTab]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <div className="flex flex-1">
                <div className="hidden lg:block w-64 bg-white border-r border-slate-200">
                    <Sidebar />
                </div>
                <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
                    <main className="w-full max-w-7xl mx-auto">
                        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-3 mb-6 gap-4">
                            <nav className="flex items-center">
                                <button 
                                    onClick={() => handleTabChange('my')}
                                    className={`font-medium px-4 py-2 text-sm ${
                                        activeTab === 'my' 
                                            ? 'text-blue-600 border-b-2 border-blue-600' 
                                            : 'text-slate-600 hover:text-slate-800'
                                    }`}
                                >
                                    My Lessons
                                </button>
                                <button 
                                    onClick={() => handleTabChange('public')}
                                    className={`font-medium px-4 py-2 text-sm ${
                                        activeTab === 'public' 
                                            ? 'text-blue-600 border-b-2 border-blue-600' 
                                            : 'text-slate-600 hover:text-slate-800'
                                    }`}
                                >
                                    Public Lessons
                                </button>
                            </nav>
                            <button 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg px-4 py-2.5 w-full sm:w-auto"
                                onClick={() => navigate('/add-lesson')}
                            >
                                + Create New Lesson
                            </button>
                        </header>
                        {error ? (
                            <ErrorMessage message={error} onRetry={handleRetry} />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {isLoading ? (
                                    Array.from({ length: 6 }).map((_, index) => (
                                        <LoadingCard key={index} />
                                    ))
                                ) : lessons.length > 0 ? (
                                    lessons.map(lesson => (
                                        <LessonCard 
                                            key={lesson.id} 
                                            lesson={lesson} 
                                            onView={handleViewLesson}
                                            onEdit={handleEditLesson}
                                            onDelete={handleDeleteLesson}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center">
                                        <div className="text-6xl mb-4">📚</div>
                                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                            {activeTab === 'my' ? 'No lessons created yet' : 'No public lessons available'}
                                        </h3>
                                        <p className="text-slate-500 mb-6">
                                            {activeTab === 'my' 
                                                ? 'Create your first lesson to get started!' 
                                                : 'Check back later for public lessons.'}
                                        </p>
                                        {activeTab === 'my' && (
                                            <button 
                                                onClick={() => navigate('/add-lesson')}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
                                            >
                                                Create Your First Lesson
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setLessonToDelete(null);
                }}
                onConfirm={confirmDeleteLesson}
                title="Delete Lesson"
                message={`Are you sure you want to delete "${lessonToDelete?.title}"? This action cannot be undone and will remove all associated content including quizzes and stages.`}
                confirmText="Delete Lesson"
            />
        </div>
    );
};

export default LessonsComponent;