"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Star, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../Component/Home/Sidebar.tsx';
import Header from '../Component/Home/Header.tsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SERVER_URL from '../config.js';

const StudentTableRow = ({ student }) => {
    const statusClasses = {
        Active: 'bg-green-100 text-green-700',
        Invited: 'bg-gray-200 text-gray-600',
        Inactive: 'bg-red-100 text-red-600'
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-4 border-b border-gray-200 hover:bg-gray-50 text-sm text-gray-700">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${student.initial === 'E' ? 'bg-blue-100' : 'bg-indigo-100'} flex items-center justify-center font-semibold text-blue-600`}>
                    {student.initial}
                </div>
                <div>
                    <div className="font-semibold text-gray-800">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.username}</div>
                </div>
            </div>
            <div className="hidden md:block">{student.lastLogin}</div>
            <div className="hidden md:flex items-center gap-1">
                <Star size={16} className="text-yellow-500" fill="currentColor" />
                <span className="font-semibold">{student.learningPoints}</span>
            </div>
            <div className="hidden md:block">{student.lessonsCompleted} Lessons</div>
            <div className="hidden md:block">{student.avgLearningTime}</div>
            <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[student.status] || 'bg-gray-100 text-gray-500'}`}>
                    {student.status}
                </span>
                <button className="p-1 text-gray-500 hover:text-gray-800">
                    <MoreVertical size={20} />
                </button>
            </div>
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex items-center justify-between p-4 text-sm">
        <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
        >
            <ChevronLeft size={16} /> Previous
        </button>
        <div className="flex items-center gap-2">
            {[...Array(totalPages).keys()].map(num => (
                <button
                    key={num + 1}
                    onClick={() => onPageChange(num + 1)}
                    className={`w-8 h-8 rounded-md ${currentPage === num + 1 ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
                >
                    {num + 1}
                </button>
            ))}
        </div>
        <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
        >
            Next <ChevronRight size={16} />
        </button>
    </div>
);

const StudentsPage = () => {
    const [allStudents, setAllStudents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [studentsPerPage] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await axios.get(`${SERVER_URL}/api/users/my-students/`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = res.data.students || res.data;
                console.log("Fetched students:", data);
                const mapped = data.map((item, index) => {
      const s = item.student;
      return {
        id: s.id || index,
        name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Unknown',
        username: s.username || '@unknown',
        initial: s.username?.[1]?.toUpperCase() || 'U',
        lastLogin: s.last_login || 'N/A',
        learningPoints: s.learning_points ?? 0,
        lessonsCompleted: s.lessons_completed ?? 0,
        avgLearningTime: s.avg_learning_time || '0 Mins',
        status: s.status || 'Invited'
      };
    });

                setAllStudents(mapped);
            } catch (err) {
                console.error("Error fetching students:", err);
            }
        };

        fetchStudents();
    }, []);

    const totalPages = Math.ceil(allStudents.length / studentsPerPage);
    const currentStudents = allStudents.slice(
        (currentPage - 1) * studentsPerPage,
        currentPage * studentsPerPage
    );

    return (
        <div>
            <Sidebar />
            <div className="ml-[17%] p-[1%]">
                <Header />
                <div className="p-4 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Students</h1>
                        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                            <div className="relative flex-grow">
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search here..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
                                <Filter size={16} />
                                <span>Filter By</span>
                            </button>
                            <button
                                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                onClick={() => navigate('/add-students')}
                            >
                                <Plus size={20} />
                                <span className="hidden md:inline">Add New Student</span>
                                <span className="md:hidden">Add</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="hidden md:grid grid-cols-6 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                            <div>Name</div>
                            <div>Last Login</div>
                            <div>Learning Points</div>
                            <div>No. of Lessons Completed</div>
                            <div>Average Learning Time</div>
                            <div>Status</div>
                        </div>
                        <div>
                            {currentStudents.map(student => (
                                <StudentTableRow key={student.id} student={student} />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentsPage;
