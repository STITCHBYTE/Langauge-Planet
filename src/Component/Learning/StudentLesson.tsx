import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Home/Sidebar.tsx';
import Header from '../Home/Header.tsx';
import Server_url from '../../config.js';
import { FiClock, FiLock, FiUnlock } from 'react-icons/fi';
import { useView } from '../../Context/ViewContext.tsx';
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
  quizzes?: { id: string }[];
  lesson_level?: string;
};

const StudentLesson: React.FC = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useView();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const [quizzes, setQuizzes] = useState<{ id: string }[]>([]);

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
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  useEffect(() => {
    const fetchStageCompletions = async () => {
      const userId = currentUser?.id;
      if (!lesson || !lesson.stages || !lesson.stages.length || !userId) {
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const res = await fetch(`${Server_url}/api/lessons/lesson/${lesson.id}/stage-completions/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;

        const completions = await res.json();
        const completed = new Set<string>();
        completions.forEach((submission: any) => {
          if (String(submission.user_id) === String(userId)) {
            completed.add(submission.stage_id);
          }
        });
        setCompletedStages(completed);
      } catch (err) {
      }
    };

    if (currentUser) {
      fetchStageCompletions();
    }
  }, [lesson, currentUser]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!lessonId) return;
      const token = localStorage.getItem('authToken');
      try {
        const res = await fetch(`${Server_url}/api/lessons/lesson/${lessonId}/quizzes/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        setQuizzes(data);
      } catch (err) {
      }
    };
    fetchQuizzes();
  }, [lessonId]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading lesson...</div>;
  }

  if (!lesson) {
    return <div className="text-center py-8 text-red-500">Lesson not found.</div>;
  }

  const allStagesCompleted = lesson.stages && lesson.stages.length > 0 && completedStages.size === lesson.stages.length;
  const quizAvailable = lesson.quizzes && lesson.quizzes.length > 0;

  const handleStartLesson = () => {
    if (!lesson || !lesson.stages || lesson.stages.length === 0) return;

    const firstUncompletedStage = lesson.stages.find(stage => !completedStages.has(stage.id));
    
    if (firstUncompletedStage) {
      navigate(`/stage/${firstUncompletedStage.id}`);
    } else if (lesson.stages.length > 0) {
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                <p className="text-gray-600 mb-4">{lesson.description}</p>
                <span className="text-xs font-semibold uppercase text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{lesson.lesson_level}</span>
                <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
                  <FiClock />
                  <span>{lesson.duration || "1 hour to complete"}</span>
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end w-full md:w-auto">
                {lesson.image && (
                  <img
                    src={
                      lesson.image.startsWith('http')
                        ? lesson.image
                        : `${Server_url}${lesson.image}`
                    }
                    alt="Lesson"
                    className="w-32 h-32 object-contain mb-4"
                    style={{ background: "#f3f4f6", borderRadius: "1rem" }}
                  />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleStartLesson}
                    disabled={!lesson.stages || lesson.stages.length === 0}
                    className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Lesson
                  </button>
                  <button
                    onClick={() => {
                      if (quizzes.length > 0) {
                        navigate(`/quiz/${lessonId}/${quizzes[0].id}`);
                      }
                    }}
                    disabled={!allStagesCompleted || quizzes.length === 0}
                    className="bg-gray-100 text-gray-500 font-semibold px-6 py-3 rounded-lg border hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Take Quiz
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
                    const isLocked = idx > 0 && !completedStages.has(lesson.stages![idx - 1].id);

                    return (
                      <li
                        key={stage.id}
                        className={`flex items-center justify-between rounded-lg px-6 py-4 mb-2 bg-white border transition`}
                        style={{ opacity: isLocked ? 0.6 : 1 }}
                      >
                        <div className="flex items-center gap-4">
                          {isLocked ? <FiLock className="text-gray-400" /> : <FiUnlock className="text-green-500" />}
                          <span className="font-medium">{`Stage ${idx + 1}: ${stage.title}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${isCompleted ? "text-green-600" : "text-gray-400"}`}>
                            {isCompleted ? "Done" : "Undone"}
                          </span>
                          {isLocked ? <FiLock className="text-gray-400" /> : <FiUnlock className="text-green-500" />}
                        </div>
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