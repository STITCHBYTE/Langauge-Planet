import React, { useState, useEffect } from 'react';
import './Learning.css'; // Shared CSS file
import Header from '../Home/Header.tsx';     // Header component
import Sidebar from '../Home/Sidebar.tsx';   // Sidebar component
import LessonCard from './lesson.tsx'; // LessonCard component
import Server_url from '../../config.js'; // Make sure this is your API base URL

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

// Update Lesson type to match backend
type Lesson = {
  id: string;
  title: string;
  description: string;
  image?: string;
  is_private?: boolean;
  lesson_level?: string;
  created_at?: string;
  updated_at?: string;
  // Add any other fields your backend returns
};

// Update LessonCardProps if needed
export interface LessonCardProps {
  title: string;
  description: string;
  image?: string;
  lesson_level?: string;
  is_private?: boolean;
  // Add other props as needed
}

// LessonGrid Component
const LessonGrid: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${Server_url}/api/lessons/lesson/my/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch lessons");
        const data = await res.json();
        setLessons(data.results || data);
      } catch (err) {
        setLessons([]);
      }
      setLoading(false);
    };
    fetchLessons();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading lessons...</div>;
  }

  return (
    <div className="lesson-grid">
      {lessons.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No lessons found.</div>
      ) : (
        lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            title={lesson.title}
            description={lesson.description}
            image={lesson.image}
            lesson_level={lesson.lesson_level}
            is_private={lesson.is_private}
          />
        ))
      )}
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