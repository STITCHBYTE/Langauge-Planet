import React, { useEffect, useState } from 'react';
import {
  FiUsers,
  FiBook,
  FiMessageSquare,
  FiClipboard,
  FiPlus,
  FiMoreVertical,
} from 'react-icons/fi';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Header from '../../Component/Home/Header.tsx';
import { useParams, useNavigate } from 'react-router-dom';
import Server_url from '../../config.js';
const ClassPage = () => {
  const { id: classId } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    const fetchClassData = async () => {
      try {
        const response = await fetch(
          `${Server_url}/api/classrooms/classroom/${classId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch class data');
        const data = await response.json();
        setClassData(data);
      } catch (error) {
        console.error('Error fetching class data:', error);
      }
    };

    const fetchDiscussions = async () => {
      try {
        const response = await fetch(
          `${Server_url}/api/classrooms/classroom/${classId}/discussions/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch discussions');
        const data = await response.json();
        setDiscussions(data);
      } catch (error) {
        console.error('Error fetching discussions:', error);
      } finally {
        setLoadingDiscussions(false);
      }
    };

    const fetchAssignments = async () => {
      try {
        const response = await fetch(
          `${Server_url}/api/classrooms/classroom/${classId}/assignments/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch assignments');
        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoadingAssignments(false);
      }
    };

    if (classId) {
      fetchClassData();
      fetchDiscussions();
      fetchAssignments();
    }
  }, [classId]);

  if (!classData) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center ml-[17%]">
          <p className="text-gray-500">Loading class details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="bg-gray-50/50 flex-1 p-8 text-gray-800 ml-[17%] overflow-y-auto">
        <Header />

        {/* Top buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <button className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50">
              View Students
            </button>
            <button className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50">
              View Assignment Report
            </button>
          </div>
          <div className="flex gap-3">
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-red-600">
              Delete Class
            </button>
            <button className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50">
              Student View
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700">
              Publish Class
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Class Details */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
              <button className="absolute top-6 right-6 bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50">
                📝 Edit Basic Details
              </button>

              {classData.image && (
                <img
                  src={classData.image}
                  alt="Class"
                  className="w-[15%] h-[6rem] object-cover rounded-lg mb-6"
                />
              )}

              <div className="flex items-start gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{classData.title}</h1>
                  <p className="mt-2 text-gray-600 max-w-md">{classData.description}</p>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className={`px-3 py-1 rounded-full font-medium ${classData.is_private ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {classData.is_private ? 'Private Class' : 'Public Class'}
                    </span>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiUsers />
                      <span>{classData.student_count || 0} Students</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Discussions Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Class Discussions</h2>
              <p className="text-sm text-gray-500 mt-1">
                Discussions will appear to your students in the same order they appear here.
              </p>

              {loadingDiscussions ? (
                <p className="text-gray-500 py-6">Loading discussions...</p>
              ) : discussions.length === 0 ? (
                <div className="text-center py-10 my-4 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="mx-auto bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center">
                    <FiMessageSquare className="text-gray-400 h-8 w-8" />
                  </div>
                  <p className="mt-4 font-semibold text-gray-700">No Discussions Added</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Click "Add Discussion" to create one.
                  </p>
                </div>
              ) : (
                <ul className="mt-4 space-y-4">
                  {discussions.map((d) => (
                    <li
                      key={d.id}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <h3 className="font-semibold text-gray-800">{d.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Created on {new Date(d.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <button
                className="mt-6 w-full bg-blue-600 text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700"
                onClick={() => navigate(`/add-discussion/${classId}`)}
              >
                <FiPlus />
                Add Discussion
              </button>
            </div>
          </div>

          {/* Right Panel: Assignments & Lessons */}
          <div className="flex flex-col gap-8">
            {/* Assignments */}
           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
  <h2 className="text-lg font-bold text-gray-900">Class Assignments</h2>
  <p className="text-sm text-gray-500 mt-1">
    Assignments will be visible when the paired discussions are unlocked.
  </p>

  {loadingAssignments ? (
    <p className="text-gray-500 py-6">Loading assignments...</p>
  ) : assignments.length === 0 ? (
    <div className="text-center py-8 my-4 border-2 border-dashed border-gray-200 rounded-lg">
      <div className="mx-auto bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center">
        <FiClipboard className="text-gray-400 h-8 w-8" />
      </div>
      <p className="mt-4 font-semibold text-gray-700">No Assignment Added</p>
      <p className="text-sm text-gray-500 mt-1 px-2">
        Click "Add Assignment" to create one.
      </p>
    </div>
  ) : (
    <ul
      className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-2"
      style={{ scrollbarWidth: 'thin' }}
    >
      {assignments.map((a) => (
        <li
          key={a.id}
          className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
        >
          <div>
            <h4 className="text-sm font-medium text-gray-800">{a.title}</h4>
            <p className="text-xs text-gray-500">
              Due: {new Date(a.due_date).toLocaleDateString()}
            </p>
          </div>
          <button className="text-gray-500 hover:text-gray-800">
            <FiMoreVertical />
          </button>
        </li>
      ))}
    </ul>
  )}

  <button className="mt-6 w-full bg-blue-600 text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700" onClick={() => navigate(`/add-assignment/${classId}`)}>
    <FiPlus />
    Add Assignment
  </button>
</div>
            {/* Lessons */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Lesson Assigned</h2>
              <p className="text-sm text-gray-500 mt-1">
                All lesson assigned to this class will be displayed here
              </p>
              <div className="mt-4 space-y-3">
                {["Basic Spanish Culture", "Lorem ipsum dolor sit amet consectetur", "Lorem ipsum dolor sit amet"].map((lesson, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700 text-sm">{lesson}</span>
                    <button className="text-gray-500 hover:text-gray-800">
                      <FiMoreVertical />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassPage;
