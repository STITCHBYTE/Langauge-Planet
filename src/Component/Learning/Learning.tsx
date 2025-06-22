import React, { useState } from 'react';
import './Learning.css'; // Shared CSS file
import Header from '../Home/Header.tsx';     // Header component
import Sidebar from '../Home/Sidebar.tsx';   // Sidebar component
import LessonCard from './lesson.tsx'; // LessonCard component

// --- Child Components defined within the main page ---

// LessonTabs Component
const LessonTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const levels: string[] = ["Beginner Level", "Intermediate Level", "Advance Level", "Professional Level"];
    return (
        <div className="lesson-tabs">
            {levels.map((level, index) => (
                <button
                    key={level}
                    className={`tab-btn ${activeTab === index ? 'active' : ''}`}
                    onClick={() => setActiveTab(index)}
                >
                    {level}
                </button>
            ))}
        </div>
    );
};

// StatusFilter Component
const StatusFilter: React.FC = () => (
    <div className="status-filter">
        <label>Status</label>
        <button className="filter-dropdown">
            <span>All Lessons</span>
            <span className="lesson-count">15</span>
            <span className="dropdown-arrow">▼</span>
        </button>
    </div>
);

// Define a type for a single lesson's data
type Lesson = {
  title: string;
  description: string;
  icon: string;
  progress?: number;
  timeLeft?: string;
  isCompleted?: boolean;
};

// Define the props for LessonCard
export interface LessonCardProps {
    title: string;
    description: string;
    icon: string;
    progress?: number;
    timeLeft?: string;
    isCompleted?: boolean;
}

// LessonGrid Component
const LessonGrid: React.FC = () => {
    const lessons: Lesson[] = [
        { title: "Basic Spanish", description: "Lorem ipsum dolor sit amet consectetur...", progress: 75, timeLeft: "7 minutes left", icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/c151759922cef12966614a9426cb1233984f82db" },
        { title: "Food", description: "Lorem ipsum dolor sit amet consectetur...", progress: 50, timeLeft: "15 minutes left", icon: "https://static.vecteezy.com/system/resources/previews/010/851/540/original/3d-fast-food-icon-for-ui-ux-design-free-png.png" },
        { title: "Fruits", description: "Lorem ipsum dolor sit amet consectetur...", progress: 25, timeLeft: "20 minutes left", icon: "https://static.vecteezy.com/system/resources/previews/019/634/115/original/3d-rendering-of-a-fruit-icon-png.png" },
        { title: "Colors", description: "Learn the basic colors.", timeLeft: "30 Minutes", icon: "https://static.vecteezy.com/system/resources/previews/019/874/228/original/3d-art-palette-icon-png.png"},
        { title: "Verb", description: "Understand verb conjugations.", timeLeft: "45 Minutes", icon: "https://cdn3d.iconscout.com/3d/premium/thumb/book-and-pencil-8326799-6635952.png"},
        { title: "Adjective", description: "Describe nouns effectively.", timeLeft: "30 Minutes", icon: "https://cdn3d.iconscout.com/3d/premium/thumb/book-9749457-7933934.png"},
    ];
    return (
        <div className="lesson-grid">
            {lessons.map((lesson, index) => (
                <LessonCard
                    key={index}
                    title={lesson.title}
                    description={lesson.description}
                    icon={lesson.icon}
                    progress={lesson.progress}
                    timeLeft={lesson.timeLeft}
                    isCompleted={lesson.isCompleted}
                />
            ))}
        </div>
    );
};


// --- Main LearningPage Component ---
const LearningPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  return (
    <div className={`learning-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar />
      <div className="main-wrapper">
        {/* Pass the event handler to the Header component */}
        <Header/>
        <main className="content-area">
          <div className="top-bar">
            <LessonTabs />
            <StatusFilter />
          </div>
          <LessonGrid />
        </main>
      </div>
    </div>
  );
};

export default LearningPage;