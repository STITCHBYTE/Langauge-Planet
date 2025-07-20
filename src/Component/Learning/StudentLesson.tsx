import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Home/Sidebar.tsx';
import Header from '../Home/Header.tsx';
import Server_url from '../../config.js';
import { FiClock, FiLock, FiUnlock } from 'react-icons/fi';

// --- TYPE DEFINITIONS ---
type Stage = {
  id: string;
  title: string;
};

type Lesson = {
  id: string;
  title: string;
  description: string;
  image?: string;
  duration?: string;
  stages?: Stage[];
};

// --- COMPONENT ---
const StudentLesson: React.FC = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  // --- EFFECT 1: FETCH USER ID ---
  useEffect(() => {
    const getUserId = () => {
      // Attempt to get user ID from localStorage, assuming it's stored after login
      const storedUserId = localStorage.getItem('user_id');
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        console.error("User ID not found in localStorage.");
        // You might want to fetch it from an API endpoint like /api/users/me/ as a fallback
      }
    };
    getUserId();
  }, []);

  // --- EFFECT 2: FETCH THE MAIN LESSON DATA ---
  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${Server_url}/api/lessons/lesson/${lessonId}/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch lesson. Server responded with status: ${res.status}`);
        }

        const data = await res.json();
        setLesson(data);
      } catch (err) {
        console.error("Error fetching lesson:", err);
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  // --- EFFECT 3: FETCH SUBMISSIONS TO DETERMINE COMPLETED STAGES ---
  useEffect(() => {
    const fetchStageCompletions = async () => {
      if (!lesson || !lesson.stages || !lesson.stages.length || !userId) {
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const completed = new Set<string>();
        // Fetch submissions for all stages in parallel
        const submissionPromises = lesson.stages.map(stage =>
          fetch(`${Server_url}/api/lessons/stage/${stage.id}/submissions/`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => res.ok ? res.json() : [])
        );
        
        const submissionsByStage = await Promise.all(submissionPromises);
        
        // Process all submissions to find the ones by the current user
        submissionsByStage.flat().forEach(submission => {
          // Check if the submission belongs to the current user and is marked as passed/completed
          if (String(submission.student) === String(userId) && submission.passed) {
            completed.add(submission.stage);
          }
        });
        
        setCompletedStages(completed);
        console.log("Completed Stages:", completed);

      } catch (err) {
        console.error("An error occurred while fetching stage completions:", err);
      }
    };

    fetchStageCompletions();
  }, [lesson, userId]);

  // --- RENDER LOGIC ---

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading lesson...</div>;
  }

  if (!lesson) {
    return <div className="text-center py-8 text-red-500">Lesson not found.</div>;
  }

  const handleStartLesson = () => {
    if (lesson.stages && lesson.stages.length > 0) {
      navigate(`/stage/${lesson.stages[0].id}`);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 px-10 py-8">
          <div className="flex items-center gap-2 text-gray-400 mb-6 text-base">
            <button
              className="text-blue-600 font-medium hover:underline"
              onClick={() => navigate(-1)}
            >
              &larr; Go Back
            </button>
            <span>/</span>
            <span>Lessons</span>
            <span>/</span>
            <span className="text-blue-600 font-semibold">{lesson.title}</span>
          </div>
          <section className="bg-white rounded-xl shadow p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">{lesson.title}</h1>
                <p className="text-gray-500 mb-6 max-w-2xl">
                  {lesson.description}
                </p>
                <div className="border rounded-lg px-4 py-2 flex items-center gap-2 text-gray-500 mb-6 w-fit bg-white">
                  <FiClock />
                  <span>{lesson.duration || "1 hour to complete"}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4 min-w-[160px]">
                {lesson.image && (
                  <img
                    src={`${Server_url}${lesson.image}`}
                    alt={lesson.title}
                    className="w-32 h-32 object-contain rounded-lg bg-gray-100 mb-4"
                  />
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={handleStartLesson}
                    className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Start Lesson
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-gray-500 font-semibold uppercase tracking-wide mb-4 text-sm">Lesson Stages</h2>
              <ul>
                {lesson.stages && lesson.stages.length > 0 ? (
                  lesson.stages.map((stage, idx) => {
                    const isCompleted = completedStages.has(stage.id);
                    // The first stage is never locked. Subsequent stages are locked if the previous one isn't completed.
                    const isLocked = idx > 0 && !completedStages.has(lesson.stages![idx - 1].id);

                    return (
                      <li
                        key={stage.id}
                        className={`flex items-center justify-between rounded-lg px-6 py-4 mb-2 transition ${
                          isLocked 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-green-50 text-gray-700 cursor-pointer hover:bg-blue-50'
                        } ${isCompleted ? 'border-l-4 border-green-500' : ''}`}
                        onClick={() => !isLocked && navigate(`/stage/${stage.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          {isLocked ? <FiLock /> : isCompleted ? <FiUnlock className="text-green-500" /> : <FiUnlock />}
                          <span>{`Stage ${idx + 1}: ${stage.title}`}</span>
                        </div>
                        {isCompleted && <span className="text-xs font-bold text-green-600 bg-green-200 px-2 py-1 rounded-full">COMPLETED</span>}
                      </li>
                    );
                  })
                ) : (
                  <li className="text-gray-500 px-6 py-4">No stages found for this lesson.</li>
                )}
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StudentLesson;