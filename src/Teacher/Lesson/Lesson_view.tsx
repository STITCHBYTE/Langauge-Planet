import React, { useState, useEffect } from 'react';
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
    // Add any other fields your API returns
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


// --- Main Component ---
const LessonDetailsPage: React.FC = () => {
    const { lesson_id } = useParams<{ lesson_id: string }>();
    const navigate = useNavigate();

    // State for lesson data, loading, and errors
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                const response = await fetch(`${Server_url}/api/lessons/lesson/${lesson_id}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch lesson details.');
                }

                const data: Lesson = await response.json();
                setLesson(data);
            } catch (err) {
                setError(err.message);
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLessonDetails();
    }, [lesson_id]); // Re-run effect if lesson_id changes

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
        <div>
            <Sidebar />
            <div className='ml-[17%] p-[1%]'>
                <Header />
                <main className="flex-1 bg-gray-50 p-6">
                    {/* Top Navigation / Breadcrumbs */}
                    <div className="flex items-center text-sm mb-6">
                        <button onClick={() => navigate('/lessons')} className="flex items-center text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Go Back
                        </button>
                        <span className="mx-2 text-gray-400">/</span>
                        <span className="text-gray-500">Lessons</span>
                        <span className="mx-2 text-gray-400">/</span>
                        <span className="text-gray-800 font-medium">{lesson.title}</span>
                    </div>

                    {/* Action Button Bar */}
                    <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-3">
                            <ActionButton>View Students</ActionButton>
                            <ActionButton>View Quiz Report</ActionButton>
                        </div>
                        <div className="flex items-center gap-3">
                            <ActionButton destructive>Delete Lesson</ActionButton>
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
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-5">
                                        <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center overflow-hidden">
                                            {lesson.image ? <img src={lesson.image} alt={lesson.title} className="w-full h-full object-cover"/> : <span className="text-4xl">📚</span>}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800">{lesson.title}</h2>
                                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{lesson.description}</p>
                                        </div>
                                    </div>
                                    <button className="text-sm font-semibold text-blue-600 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 whitespace-nowrap">
                                        Edit Basic Details
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100">
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
                                <h3 className="text-lg font-semibold text-slate-800">Lesson Stages</h3>
                                <p className="text-sm text-slate-500 mt-1">Stages will appear to your students in the same order it appears here. Feel free to drag and move around the order as you please.</p>
                                <EmptyStateCard 
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                                    title="No Stage Added"
                                    subtitle="Click “Add Stage” button to create a stage for this lesson"
                                    buttonText="+ Add Stage"
                                    onButtonClick={() => navigate(`/add-stage/${lesson.id}`)}
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-1">
                             <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-semibold text-slate-800">Quiz</h3>
                                <p className="text-sm text-slate-500 mt-1">Quizzes are locked to student until they complete all the stages in the lesson.</p>
                                 <EmptyStateCard 
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                                    title="No Quiz Added"
                                    subtitle="Click “Add Quiz” button to create a quiz for this lesson"
                                    buttonText="+ Add Quiz"
                                    onButtonClick={() => navigate(`/add-quiz/${lesson.id}`)}
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LessonDetailsPage;