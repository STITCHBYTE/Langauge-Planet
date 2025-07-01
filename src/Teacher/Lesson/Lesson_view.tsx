import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Header from '../../Component/Home/Header.tsx';
import Server_url from '../../config'; // Your server URL import

// --- 1. TYPE DEFINITION for the fetched lesson data ---
interface Lesson {
    id: number;
    title: string;
    description: string;
    image: string; // URL for the image
    is_private: boolean;
    lesson_level: string;
    quizzes?: Quiz[]; // Add this line
    // Add any other fields your API returns
}

// Add Quiz interface to your existing interfaces
interface Quiz {
    id: number;
    title: string;
    exercise_type: string;
    created_at: string;
    // Add other quiz fields as needed
}

// Add Stage interface
interface Stage {
    id: number;
    title: string;
    description?: string;
    order?: number;
    // Add other fields as needed
}

// --- Reusable Sub-Components (No changes needed) ---

const ActionButton = ({ children, primary = false, destructive = false, onClick = () => {} }) => {
    const baseClasses = "px-4 py-2 text-sm font-semibold rounded-lg flex items-center";
    const primaryClasses = "bg-blue-600 text-white hover:bg-blue-700";
    const destructiveClasses = "bg-white text-red-500 border border-red-300 hover:bg-red-50";
    const secondaryClasses = "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50";
    const classes = primary ? primaryClasses : (destructive ? destructiveClasses : secondaryClasses);
    return (<button onClick={onClick} className={`${baseClasses} ${classes}`}>{children}</button>);
};

const EmptyStateCard = ({ icon, title, subtitle, buttonText, onButtonClick }) => (
    <div className="text-center bg-slate-50 p-8 rounded-lg mt-6">
        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto flex items-center justify-center">{icon}</div>
        <h4 className="font-semibold text-slate-800 mt-4">{title}</h4>
        <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">{subtitle}</p>
        <button onClick={onButtonClick} className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">{buttonText}</button>
    </div>
);

// Add Quiz Card Component
const QuizCard = ({ quiz, onEdit, onDelete }) => (
    <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <h4 className="font-medium text-slate-800">{quiz.title}</h4>
                <p className="text-sm text-slate-500 mt-1 capitalize">
                  {quiz.exercise_type
                    ? quiz.exercise_type.replace('-', ' ')
                    : <span className="italic text-slate-400">No type</span>
                  }
                </p>
                <p className="text-xs text-slate-400 mt-2">
                    Created: {new Date(quiz.created_at).toLocaleDateString()}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onEdit(quiz.id)}
                    className="p-1 text-slate-400 hover:text-blue-600"
                    title="Edit Quiz"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button 
                    onClick={() => onDelete(quiz.id)}
                    className="p-1 text-slate-400 hover:text-red-600"
                    title="Delete Quiz"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
);


// Add Dropdown Menu Component
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

// Add Confirmation Modal Component
const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    confirmButtonClass?: string;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmButtonClass = "bg-red-600 hover:bg-red-700" }) => {
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
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${confirmButtonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const LessonDetailsPage: React.FC = () => {
    const { lesson_id } = useParams<{ lesson_id: string }>();
    const navigate = useNavigate();

    // Ref for the dropdown button
    const dropdownButtonRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;

    // State for lesson data, loading, and errors
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [stages, setStages] = useState<Stage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [stageDeleteId, setStageDeleteId] = useState<number | null>(null);
    
    // Add new state for lesson dropdown and delete modal
    const [isLessonDropdownOpen, setIsLessonDropdownOpen] = useState(false);
    const [showDeleteLessonModal, setShowDeleteLessonModal] = useState(false);

    // Fetch lesson data when the component mounts
    useEffect(() => {
        const fetchLessonDetails = async () => {
            if (!lesson_id) {
                setError("No lesson ID provided.");
                setIsLoading(false);
                return;
            }
            const token = localStorage.getItem('authToken');
            setIsLoading(true);
            try {
                // Fetch lesson details
                const lessonResponse = await fetch(`${Server_url}/api/lessons/lesson/${lesson_id}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!lessonResponse.ok) {
                    throw new Error('Failed to fetch lesson details.');
                }
                const lessonData: Lesson = await lessonResponse.json();
                setLesson(lessonData);
                // Fetch quizzes for this lesson
                const quizResponse = await fetch(`${Server_url}/api/lessons/lesson/${lesson_id}/quizzes/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (quizResponse.ok) {
                    const quizData = await quizResponse.json();
                    setQuizzes(quizData.results || quizData || []);
                }
                // Fetch stages for this lesson
                const stageResponse = await fetch(`${Server_url}/api/lessons/lesson/${lesson_id}/stages/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (stageResponse.ok) {
                    const stageData = await stageResponse.json();
                    console.log('Stages API response:', stageData); // Log the full API response
                    const stagesArr = stageData.results || stageData || [];
                    // console.log('Stages array:', stagesArr); // Log the array that will be set
                    setStages(stagesArr);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLessonDetails();
    }, [lesson_id]);

    // Add handlers for quiz actions
    const handleEditQuiz = (quizId: number) => {
        navigate(`/edit-quiz/${lesson_id}/${quizId}`);
    };

    const handleDeleteQuiz = async (quizId: number) => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${Server_url}/api/lessons/quiz/${quizId}/delete/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
                setDeleteConfirmId(null);
            } else {
                alert('Failed to delete quiz');
            }
        } catch (error) {
            console.error('Error deleting quiz:', error);
            alert('Error deleting quiz');
        }
    };

    // Enhanced function to get full image URL with debugging
    const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
        // console.log('Raw image path from backend:', imagePath); // Debug log
        
        if (!imagePath) {
            console.log('No image path provided');
            return undefined;
        }
        
        // Handle different image path formats
        let fullUrl: string;
        
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            // Already a full URL
            fullUrl = imagePath;
        } else if (imagePath.startsWith('/media/') || imagePath.startsWith('media/')) {
            // Backend media path
            fullUrl = `${Server_url}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
        } else if (imagePath.startsWith('/')) {
            // Absolute path
            fullUrl = `${Server_url}${imagePath}`;
        } else {
            // Relative path
            fullUrl = `${Server_url}/${imagePath}`;
        }
        
        console.log('Constructed image URL:', fullUrl); // Debug log
        return fullUrl;
    };

    // Add image error handler
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        console.error('Image failed to load:', e.currentTarget.src);
        e.currentTarget.style.display = 'none';
        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
        if (fallback) {
            fallback.style.display = 'flex';
        }
    };

    // Add image load handler for debugging
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        console.log('Image loaded successfully:', e.currentTarget.src);
    };

    // Handle lesson dropdown toggle
    const handleLessonDropdownToggle = () => {
        setIsLessonDropdownOpen(!isLessonDropdownOpen);
    };

    // Handle edit lesson
    const handleEditLesson = () => {
        setIsLessonDropdownOpen(false);
        navigate(`/edit-lesson/${lesson_id}`);
    };

    // Handle delete lesson
    const handleDeleteLesson = () => {
        setIsLessonDropdownOpen(false);
        setShowDeleteLessonModal(true);
    };

    // Confirm delete lesson
    const confirmDeleteLesson = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${Server_url}/api/lessons/lesson/${lesson_id}/delete/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setShowDeleteLessonModal(false);
                alert('Lesson deleted successfully!');
                navigate('/lessons'); // Redirect to lessons list
            } else {
                const errorData = await response.text();
                console.error('Delete failed:', errorData);
                alert('Failed to delete lesson');
            }
        } catch (error) {
            console.error('Error deleting lesson:', error);
            alert('Error deleting lesson');
        }
    };

    // Handler for editing a stage
    const handleEditStage = (stageId: number) => {
        navigate(`/edit-stage/${lesson?.id}/${stageId}`);
    };

    // Handler for deleting a stage
    const handleDeleteStage = (stageId: number) => {
        setStageDeleteId(stageId);
    };

    // Confirm delete stage
    const confirmDeleteStage = async () => {
        if (!stageDeleteId) return;
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${Server_url}/api/lessons/stage/${stageDeleteId}/delete/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setStages(prev => prev.filter(stage => stage.id !== stageDeleteId));
                setStageDeleteId(null);
            } else {
                alert('Failed to delete stage');
            }
        } catch (error) {
            alert('Error deleting stage');
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
    }

    if (!lesson) {
        return <div className="flex justify-center items-center h-screen">Lesson not found.</div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <div className="flex flex-1">
              {/* Sidebar */}
              <div className="hidden lg:block w-64 bg-white border-r border-gray-200">
                <Sidebar />
              </div>
              {/* Main Content */}
              <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
                <main className="max-w-7xl mx-auto">
                  {/* Breadcrumbs */}
                  <div className="flex items-center text-sm mb-6 flex-wrap">
                    <button onClick={() => navigate('/teacher-lesson-view')} className="flex items-center text-gray-500 hover:text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      Go Back
                    </button>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-500">Lessons</span>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-800 font-medium">{lesson.title}</span>
                  </div>

                  {/* Action Button Bar */}
                  <div className="flex flex-row flex-wrap items-center justify-between gap-2 mb-6">
                    <div className="flex flex-row flex-wrap gap-2">
                      <ActionButton onClick={() => navigate(`/lesson/${lesson.id}/students`)}>View Students</ActionButton>
                      <ActionButton>View Quiz Report</ActionButton>
                      <ActionButton destructive onClick={handleDeleteLesson}>Delete Lesson</ActionButton>
                      <ActionButton>Student View</ActionButton>
                      <ActionButton primary>Publish Lesson</ActionButton>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                      {/* Lesson Details Card */}
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex items-start gap-5">
                            {/* Image */}
                            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                              {lesson.image && getImageUrl(lesson.image) ? (
                                <>
                                  <img 
                                    src={getImageUrl(lesson.image)} 
                                    alt={lesson.title} 
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                    onLoad={handleImageLoad}
                                    style={{ display: 'block' }}
                                  />
                                  <span className="text-4xl flex items-center justify-center w-full h-full absolute inset-0" style={{ display: 'none' }}>📚</span>
                                </>
                              ) : (
                                <span className="text-4xl flex items-center justify-center w-full h-full">📚</span>
                              )}
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-slate-800">{lesson.title}</h2>
                              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{lesson.description}</p>
                            </div>
                          </div>
                          {/* Edit Dropdown */}
                          <div className="relative mt-4 sm:mt-0">
                            <button 
                              ref={dropdownButtonRef}
                              onClick={handleLessonDropdownToggle}
                              className="text-sm font-semibold text-blue-600 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 whitespace-nowrap flex items-center gap-2"
                            >
                              Edit Basic Details
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <DropdownMenu
                              isOpen={isLessonDropdownOpen}
                              onClose={() => setIsLessonDropdownOpen(false)}
                              onEdit={handleEditLesson}
                              onDelete={handleDeleteLesson}
                              buttonRef={dropdownButtonRef}
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-100">
                          {lesson.is_private && <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">Private Class</span>}
                          {!lesson.is_private && <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Public Class</span>}
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 capitalize">{lesson.lesson_level.toLowerCase()}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-400 text-sm flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            --
                          </span>
                        </div>
                      </div>

                      {/* Lesson Stages Card */}
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-slate-800">Lesson Stages</h3>
                          <button
                            onClick={() => navigate(`/add-stage/${lesson.id}`)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-2 border border-blue-100 rounded-lg bg-blue-50"
                          >
                            + Add Stage
                          </button>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Stages will appear to your students in the same order it appears here. Feel free to drag and move around the order as you please.</p>
                        {stages.length > 0 ? (
                            <div className="mt-4 space-y-3">
                                {stages.map(stage => (
                                    <div key={stage.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-slate-800">{stage.title}</h4>
                                                {stage.description && <p className="text-sm text-slate-500 mt-1">{stage.description}</p>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => handleEditStage(stage.id)}
                                                className="p-1 text-slate-400 hover:text-blue-600"
                                                title="Edit Stage"
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                              </button>
                                              <button
                                                onClick={() => handleDeleteStage(stage.id)}
                                                className="p-1 text-slate-400 hover:text-red-600"
                                                title="Delete Stage"
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                              </button>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400">{stage.order !== undefined ? `Order: ${stage.order}` : ''}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyStateCard
                              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                              title="No Stage Added"
                              subtitle='Click "Add Stage" button to create a stage for this lesson'
                              buttonText="+ Add Stage"
                              onButtonClick={() => navigate(`/add-stage/${lesson.id}`)}
                            />
                        )}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1">
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-slate-800">Quiz</h3>
                          <button 
                            onClick={() => navigate(`/add-quiz/${lesson.id}`)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            + Add Quiz
                          </button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                          Quizzes are locked to student until they complete all the stages in the lesson.
                        </p>
                        {/* Display Quizzes or Empty State */}
                        {quizzes.length > 0 ? (
                          <div className="space-y-3">
                            {quizzes.map(quiz => (
                              <QuizCard 
                                key={quiz.id}
                                quiz={quiz}
                                onEdit={handleEditQuiz}
                                onDelete={handleDeleteQuiz}
                              />
                            ))}
                          </div>
                        ) : (
                          <EmptyStateCard 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            title="No Quiz Added"
                            subtitle='Click "Add Quiz" button to create a quiz for this lesson'
                            buttonText="+ Add Quiz"
                            onButtonClick={() => navigate(`/add-quiz/${lesson.id}`)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
            {/* Delete Confirmation Modal */}
            <ConfirmationModal
              isOpen={showDeleteLessonModal}
              onClose={() => setShowDeleteLessonModal(false)}
              onConfirm={confirmDeleteLesson}
              title="Delete Lesson"
              message={`Are you sure you want to delete "${lesson?.title}"? This action cannot be undone and will also delete all associated quizzes and stages.`}
              confirmText="Delete Lesson"
              confirmButtonClass="bg-red-600 hover:bg-red-700"
            />
            {/* Stage Delete Confirmation Modal */}
            <ConfirmationModal
              isOpen={stageDeleteId !== null}
              onClose={() => setStageDeleteId(null)}
              onConfirm={confirmDeleteStage}
              title="Delete Stage"
              message="Are you sure you want to delete this stage? This action cannot be undone."
              confirmText="Delete Stage"
              confirmButtonClass="bg-red-600 hover:bg-red-700"
            />
          </div>
    );
};

export default LessonDetailsPage;