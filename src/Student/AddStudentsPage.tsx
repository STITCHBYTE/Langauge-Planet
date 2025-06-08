"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowLeft, ChevronRight, Star, BookOpen, Clock, AlertCircle } from 'lucide-react';
import Server_url from '../config.js'; // Assuming your server URL config is here
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Component/Home/Sidebar.tsx';
import Header from '../Component/Home/Header.tsx';

// --- Sub-Components ---
const goBack = () => {
    window.history.back();
}

// 1. Breadcrumb Navigation
const Breadcrumb = () => (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <a onClick={goBack} className="flex items-center gap-1 hover:text-gray-700 cursor-pointer">
            <ArrowLeft size={16} />
            Go Back
        </a>
        <ChevronRight size={16} />
        <a href="/students" className="hover:text-gray-700">Students</a>
        <ChevronRight size={16} />
        <span className="font-semibold text-gray-800">Add New Students</span>
    </nav>
);

// 2. Student Card
const StudentCard = ({ student, onAddStudent, isInvited }) => {
    const initial = (student.username || 'U')[0].toUpperCase();
    return (
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3 transition-transform transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg">
                    {initial}
                </div>
                {isInvited ? (
                    <button
                        className="bg-gray-300 text-gray-600 font-semibold px-4 py-1.5 rounded-lg text-sm cursor-default"
                        disabled
                    >
                        Invited
                    </button>
                ) : (
                    <button
                        onClick={() => onAddStudent(student.id)}
                        className="bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                        Add Student
                    </button>
                )}
            </div>

            <div>
                <h3 className="font-bold text-gray-800 text-base">{student.first_name} {student.last_name}</h3>
                <p className="text-gray-500 text-sm">@{student.username}</p>
            </div>

            <div className="flex justify-between text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500" />
                    <span>{student.points || 0} pts</span>
                </div>
                <div className="flex items-center gap-1">
                    <BookOpen size={14} className="text-blue-500" />
                    <span>{student.lessons || 0} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock size={14} className="text-green-500" />
                    <span>{student.avgTime || 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

// 3. Skeleton Card for Loading State
const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col items-center animate-pulse">
        <div className="w-20 h-20 rounded-full bg-gray-200 mb-3"></div>
        <div className="h-6 w-3/4 bg-gray-200 rounded-md mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded-md mb-4"></div>
        <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
        <div className="w-full border-t border-gray-200 mt-4 pt-4 flex justify-around">
            <div className="h-4 w-1/4 bg-gray-200 rounded-md"></div>
            <div className="h-4 w-1/4 bg-gray-200 rounded-md"></div>
            <div className="h-4 w-1/4 bg-gray-200 rounded-md"></div>
        </div>
    </div>
);

// --- Main Page Component ---
const AddStudentsPage = () => {
    const [potentialStudents, setPotentialStudents] = useState([]);
    const [addedStudents, setAddedStudents] = useState([]); // Students already added / invited
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError("Authentication token not found. Please log in.");
                    setLoading(false);
                    return;
                }

                // Fetch all potential students
                const responsePotential = await fetch(`${Server_url}/api/users/students/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!responsePotential.ok) throw new Error('Failed to fetch students list');
                const potentialData = await responsePotential.json();

                // Fetch already added students
                const responseAdded = await fetch(`${Server_url}/api/users/my-students/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!responseAdded.ok) throw new Error('Failed to fetch added students');
                const addedData = await responseAdded.json();

                // Extract student objects from addedData, which may be nested
                const addedStudentsList = addedData.map(item => item.student);

                setPotentialStudents(potentialData);
                setAddedStudents(addedStudentsList);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const filteredStudents = useMemo(() =>
        potentialStudents.filter(student =>
            (student.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (student.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (student.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        ), [searchTerm, potentialStudents]
    );

    const handleAddStudent = async (studentId: string) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Authentication token not found.');
                return;
            }

            const response = await fetch(`${Server_url}/api/users/add-student/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ student_id: studentId })
            });

            if (!response.ok) {
                if (response.status === 409) {
                    alert('Student already added.');
                } else {
                    throw new Error('Failed to add student');
                }
                return;
            }

            const result = await response.json();
            alert('Student added successfully!');

            // Update the addedStudents state so the UI updates immediately
            const newlyAddedStudent = potentialStudents.find(s => s.id === studentId);
            if (newlyAddedStudent) {
                setAddedStudents(prev => [...prev, newlyAddedStudent]);
            }
        } catch (err) {
            console.error(err);
            alert('Error adding student');
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-10 text-red-500 bg-red-50 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12" />
                    <h3 className="mt-2 text-lg font-medium">Failed to load students</h3>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            onAddStudent={handleAddStudent}
                            isInvited={addedStudents.some(s => s.id === student.id)}
                        />
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500 py-10">No students found.</p>
                )}
            </div>
        );
    };

    return (
        <div>
            <Sidebar />
            <div className="ml-[17%] p-[1%]">
                <Header />
                <div className="p-4 md:p-8">
                    <Breadcrumb />
                    <div className="relative mb-6">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search student by name or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AddStudentsPage;
