import React, { useState, useEffect } from 'react';
import './Learning.css';
import Header from '../Home/Header.tsx';
import Sidebar from '../Home/Sidebar.tsx';
import LessonCard from './lesson.tsx';
import Server_url from '../../config.js';
import { useNavigate } from 'react-router-dom';

const levels = ["Beginner Level", "Intermediate Level", "Advance Level", "Professional Level"];
const backendLevelMap: Record<string, string> = {
  "Beginner Level": "BEGINNER",
  "Intermediate Level": "INTERMEDIATE",
  "Advance Level": "ADVANCE",
  "Professional Level": "PROFESSIONAL"
};
const statusOptions = ["All Lessons", "Completed", "In Progress", "Not Started"];

type Lesson = {
  id: string;
  title: string;
  description: string;
  image?: string;
  is_private?: boolean;
  lesson_level?: string;
  status?: string;
};

const LessonTabs: React.FC<{ activeTab: string; setActiveTab: (level: string) => void }> = ({ activeTab, setActiveTab }) => (
  <div className="lesson-tabs">
    {levels.map((level) => (
      <button
        key={level}
        className={`tab-btn ${activeTab === level ? 'active' : ''}`}
        onClick={() => setActiveTab(level)}
      >
        {level}
      </button>
    ))}
  </div>
);

const StatusFilter: React.FC<{ status: string; setStatus: (status: string) => void; lessonCount: number }> = ({ status, setStatus, lessonCount }) => (
  <div className="status-filter">
    <label>Status</label>
    <select
      className="filter-dropdown"
      value={status}
      onChange={e => setStatus(e.target.value)}
    >
      {statusOptions.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    <span className="lesson-count">{lessonCount}</span>
  </div>
);

const LessonGrid: React.FC<{ lessons: Lesson[] }> = ({ lessons }) => {
  const navigate = useNavigate();

  return (
    <div className="lesson-grid">
      {lessons.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No lessons found.</div>
      ) : (
        lessons.map((lesson) => (
          <div
            key={lesson.id}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/lesson/${lesson.id}`)}
          >
            <LessonCard
              title={lesson.title}
              description={lesson.description}
              image={lesson.image ? `${Server_url}${lesson.image}` : undefined}
              lesson_level={lesson.lesson_level}
              is_private={lesson.is_private}
            />
          </div>
        ))
      )}
    </div>
  );
};

const LearningPage: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<string>(levels[0]);
  const [status, setStatus] = useState<string>(statusOptions[0]);

  useEffect(() => {
    const fetchClassesAndLessons = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Authentication token not found.');

        const classesRes = await fetch(`${Server_url}/api/classrooms/classroom/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!classesRes.ok) {
          const errorData = await classesRes.json();
          throw new Error('Failed to fetch classrooms.');
        }

        const classesData = await classesRes.json();

        const enrolledClasses = classesData.results || classesData;

        if (enrolledClasses.length === 0) {
          setLessons([]);
          setLoading(false);
          return;
        }

        const lessonPromises = enrolledClasses.map(async (cls: { id: string, lessons: string[] }) => {
          if (!cls.lessons || cls.lessons.length === 0) return [];
          const lessonDetailPromises = cls.lessons.map(lessonId => {
            return fetch(`${Server_url}/api/lessons/lesson/${lessonId}/`, {
              headers: { 'Authorization': `Bearer ${token}` },
            }).then(res => {
              return res.ok ? res.json() : null;
            });
          });
          return Promise.all(lessonDetailPromises);
        });

        const lessonsByClass = await Promise.all(lessonPromises);

        const allLessons = lessonsByClass.flat().filter(lesson => lesson !== null);

        setLessons(allLessons);
      } catch (err) {
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClassesAndLessons();
  }, []);

  const filteredLessons = lessons.filter(lesson => {
    const backendLevel = backendLevelMap[activeLevel];
    const levelMatch = lesson.lesson_level === backendLevel;
    const statusMatch = status === "All Lessons" || lesson.status === status;
    const result = levelMatch && statusMatch;
    return result;
  });

  return (
    <div className="learning-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <main className="content-area">
          <div className="top-bar">
            <LessonTabs activeTab={activeLevel} setActiveTab={setActiveLevel} />
            <StatusFilter status={status} setStatus={setStatus} lessonCount={filteredLessons.length} />
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading lessons...</div>
          ) : (
            <LessonGrid lessons={filteredLessons} />
          )}
        </main>
      </div>
    </div>
  );
};

export default LearningPage;