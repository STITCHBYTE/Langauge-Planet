import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Home/Sidebar.tsx';
import Header from '../Home/Header.tsx';
import Server_url from '../../config.js';
import { FiClock } from 'react-icons/fi';

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

const StudentLesson: React.FC = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${Server_url}/api/lessons/lesson/${lessonId}/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch lesson');
        const data = await res.json();
        setLesson(data);
      } catch (err) {
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading lesson...</div>;
  }

  if (!lesson) {
    return <div className="text-center py-8 text-red-500">Lesson not found.</div>;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 px-10 py-8">
          {/* Breadcrumb */}
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
          {/* Lesson Card */}
          <section className="bg-white rounded-xl shadow p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              {/* Left Side: Title, Description, Completion Time */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">{lesson.title}</h1>
                <p className="text-gray-500 mb-6 max-w-2xl underline">
                  {lesson.description}
                </p>
                <div className="border rounded-lg px-4 py-2 flex items-center gap-2 text-gray-500 mb-6 w-fit bg-white">
                  <FiClock />
                  <span>{lesson.duration || "1 hour to complete"}</span>
                </div>
              </div>
              {/* Right Side: Image and Actions */}
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
                    className="bg-gray-100 text-gray-400 font-semibold px-6 py-2 rounded-lg cursor-not-allowed"
                    disabled
                  >
                    Take Quiz
                  </button>
                  <button
                    className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Start Lesson
                  </button>
                </div>
              </div>
            </div>
            {/* Stages */}
            <div className="mt-8">
              <h2 className="text-gray-500 font-semibold uppercase tracking-wide mb-4 text-sm">Lesson Stages</h2>
              <ul>
                {lesson.stages && lesson.stages.length > 0 ? (
                  lesson.stages.map((stage, idx) => (
                    <li
                      key={stage.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-6 py-4 mb-2 text-gray-700 cursor-pointer hover:bg-blue-50 transition"
                      onClick={() => navigate(`/stage/${stage.id}`)}
                    >
                      <span>{`Stage ${idx + 1}: ${stage.title}`}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Undone</span>
                        <span title="Locked" className="text-gray-400 text-lg">&#128274;</span>
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="lesson-stage-item">No stages found.</li>
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