import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiSearch, FiFilter, FiCopy, FiMoreVertical } from "react-icons/fi";
import Header from "../../Component/Home/Header.tsx";
import Sidebar from "../../Component/Home/Sidebar.tsx";

const PAGINATION = [1, 2, 3, 4, 5, 6];

const ViewStudent: React.FC = () => {
  const { lesson_id } = useParams();
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch students for the class this lesson is assigned to
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        // 1. Get lesson details to find the class it is assigned to
        const lessonRes = await fetch(`/api/lessons/${lesson_id}/`);
        const lessonData = await lessonRes.json();
        const classroomId = lessonData.classroom || lessonData.classroom_id;

        // 2. Get students for that class
        const studentsRes = await fetch(
          `/api/classrooms/classroom/${classroomId}/enrolled-students/`
        );
        const studentsData = await studentsRes.json();

        // 3. Optionally, get lesson progress for each student
        // This assumes you have an endpoint like /api/lessons/{lesson_id}/progress/?student={student_id}
        // For demo, we'll just show the student info
        setStudents(studentsData.results || studentsData);
      } catch (err) {
        setStudents([]);
      }
      setLoading(false);
    };
    fetchStudents();
  }, [lesson_id]);

  // Filter students by search
  const filteredStudents = students.filter(
    (student) =>
      student.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      student.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
        <div>
            <Sidebar/>
        </div>
        <div className="ml-[17%]">
      <Header />

      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        {/* <div className="flex items-center justify-between px-8 py-4 border-b bg-white">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <a href="#" className="hover:underline">
              &lt; Go Back
            </a>
            <span className="mx-2">Lessons / ... /</span>
            <span className="font-semibold text-blue-600">View Students</span>
          </div> */}
          {/* <div className="flex items-center gap-6">
            <span className="text-gray-500 text-sm">Student View</span>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold text-sm">
                Teacher View
              </span>
              <span className="inline-block w-4 h-4 bg-green-200 rounded-full"></span>
            </div>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/f5fc99522c49d496f47526ab4ed29b9f4fee5422"
              alt="bell"
              className="w-7 h-7 rounded-full"
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/e9566c3c1deed7e865e669aef469b59439b094e0"
              alt="flag"
              className="w-7 h-7 rounded-full"
            />
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="profile"
              className="w-9 h-9 rounded-full"
            />
          </div>
        </div> */}
        {/* Filter/Search Bar */}
        <div className="bg-white px-8 py-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative w-full max-w-xs">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search here..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 w-full bg-[#f8fafc] text-sm focus:outline-none"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-50 transition">
                <FiFilter />
                Filter By
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold text-sm border border-blue-100 hover:bg-blue-100 transition">
              <FiCopy />
              Copy Lesson Invite Link
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="flex-1 overflow-x-auto bg-white px-8">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Loading students...
            </div>
          ) : (
            <table className="min-w-full mt-6">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="py-3 px-4 text-left font-semibold">Name</th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Date Joined
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">Username</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => (
                  <tr
                    key={student.id || idx}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg uppercase">
                        {student.first_name?.[0] || "?"}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          @{student.username}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {student.date_joined
                        ? new Date(student.date_joined).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-3 px-4">{student.username}</td>
                    <td className="py-3 px-4">
                      <button className="text-gray-500 hover:text-blue-600">
                        <FiMoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-gray-400"
                    >
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default ViewStudent;