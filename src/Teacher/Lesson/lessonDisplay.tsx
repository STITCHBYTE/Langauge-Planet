import React from 'react';
import {useNavigate} from 'react-router-dom';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Header from '../../Component/Home/Header.tsx';
// 1. TYPE DEFINITION (types.ts)
// Defines the shape of the data for each lesson, providing type safety.
interface Lesson {
  id: number;
  icon: string;
  title: string;
  description: string;
  type: 'Public Lesson' | 'Private Lesson';
  level: 'Beginner' | 'Intermediate' | 'Advance';
  students: string;
}

// 2. SIMULATED BACKEND DATA
// An array of lesson objects, typed with the 'Lesson' interface.
// In a real app, this would come from an API call (e.g., fetch('/api/lessons')).
const lessonsData: Lesson[] = [
    { id: 1, icon: '📚', title: 'Basic Spanish', description: 'Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque...', type: 'Public Lesson', level: 'Intermediate', students: '20 Students' },
    { id: 2, icon: '🍲', title: 'Food', description: 'Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque...', type: 'Private Lesson', level: 'Beginner', students: '5 Students' },
    { id: 3, icon: '🍓', title: 'Fruits', description: 'Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque...', type: 'Private Lesson', level: 'Advance', students: '20 Students' },
    { id: 4, icon: '✏️', title: 'Color', description: 'Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque...', type: 'Private Lesson', level: 'Beginner', students: '5 Students' },
    { id: 5, icon: '📖', title: 'Verb', description: 'Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque...', type: 'Private Lesson', level: 'Beginner', students: '5 Students' },
    { id: 6, icon: '📕', title: 'Adjective', description: 'Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque...', type: 'Private Lesson', level: 'Beginner', students: '5 Students' },
    { id: 7, icon: '🐘', title: 'Animas', description: 'Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque...', type: 'Public Lesson', level: 'Intermediate', students: '20 Students' },
    { id: 8, icon: '🛒', title: 'Shopping', description: 'Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque...', type: 'Public Lesson', level: 'Intermediate', students: '20 Students' },
    { id: 9, icon: '👨‍👩‍👧‍👦', title: 'Family', description: 'Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque...', type: 'Public Lesson', level: 'Intermediate', students: '20 Students' },
];


// 3. REUSABLE CARD COMPONENT (components/LessonCard.tsx)
// This component is responsible for rendering a single lesson card.
// It receives a 'lesson' object as a prop.
const LessonCard: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
    // Determine tag colors based on the lesson type
    const typeTagClass = lesson.type === 'Public Lesson' 
        ? 'bg-green-100 text-green-700' 
        : 'bg-orange-100 text-orange-700';

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-sm">
            <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{lesson.icon}</span>
                <button className="text-slate-400">⋮</button>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{lesson.title}</h3>
            
            <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-4">
                {lesson.description}
            </p>
            
            <div className="flex items-center flex-wrap gap-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${typeTagClass}`}>
                    {lesson.type}
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                    {lesson.level}
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                    {lesson.students}
                </span>
            </div>
        </div>
    );
};


// 4. MAIN COMPONENT (pages/Lessons.tsx)
// This is the main component that orchestrates the layout and renders the list of cards.
const LessonsComponent: React.FC = () => {
    const Navigate = useNavigate();
    return (
          <div >
            <Sidebar />

            <div className='ml-[17%] p-[1%]'>
                <Header/>

        <main className="bg-slate-50 p-6 w-full">
            {/* Header Section */}
            <header className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                <nav className="flex items-center">
                    <a href="#" className="text-slate-600 font-medium px-4 py-2 text-sm">
                        My Lessons
                    </a>
                    <a href="#" className="text-blue-600 font-semibold border-b-2 border-blue-600 px-4 py-2 text-sm">
                        Language Planet Lessons
                    </a>
                </nav>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg px-4 py-2.5" onClick={() => Navigate('/add-lesson')}>
                    + Create New Lesson
                </button>
            </header>

            {/* Grid for Lesson Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessonsData.map(lesson => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                ))}
            </div>
        </main>
        </div>
        </div>
    );
};

export default LessonsComponent;