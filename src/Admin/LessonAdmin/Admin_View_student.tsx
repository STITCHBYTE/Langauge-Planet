import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiSearch, FiFilter, FiCopy, FiMoreVertical, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";
import Header from "../../Component/Home/Header.tsx";
import Sidebar from "../../Component/Home/Sidebar.tsx";
import Server_url from "../../config.js";

const ViewStudent: React.FC = () => {
  const { lesson_id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [lessonTitle, setLessonTitle] = useState('');
  // Add state for filter
  const [filterLetter, setFilterLetter] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    const fetchStudentsForLesson = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error("Authentication required.");
        setLoading(false);
        return;
      }
      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        console.log("Fetching students for lesson_id:", lesson_id);
        // 1. Fetch lesson details to get its title
        const lessonRes = await fetch(`${Server_url}/api/lessons/lesson/${lesson_id}/`, { headers });
        if (lessonRes.ok) {
            const lessonData = await lessonRes.json();
            setLessonTitle(lessonData.title);
            console.log("Lesson data:", lessonData);
        }

        // 2. Fetch all of the teacher's classes
        const classesRes = await fetch(`${Server_url}/api/classrooms/my-classrooms/`, { headers });
        if (!classesRes.ok) throw new Error("Failed to fetch classes.");
        const teacherClasses = await classesRes.json();
        console.log("Fetched teacher classes:", teacherClasses);

        // 3. Find all classes that contain this lesson
        const lessonIdStr = String(lesson_id);
        const classesWithLesson = teacherClasses.filter((cls: any) => {
          if (Array.isArray(cls.lessons)) {
            // If lessons is array of strings
            if (typeof cls.lessons[0] === "string") {
              return cls.lessons.includes(lessonIdStr);
            }
            // If lessons is array of numbers
            if (typeof cls.lessons[0] === "number") {
              return cls.lessons.includes(parseInt(lesson_id, 10));
            }
            // If lessons is array of objects
            if (typeof cls.lessons[0] === "object" && cls.lessons[0] !== null) {
              return cls.lessons.some((lesson: any) => lesson.id === lessonIdStr || lesson.id === parseInt(lesson_id, 10));
            }
          }
          return false;
        });
        console.log("Classes with this lesson:", classesWithLesson);

        if (classesWithLesson.length === 0) {
            setStudents([]);
            setLoading(false);
            return;
        }

        // 4. Fetch enrolled students from all relevant classes
        const studentPromises = classesWithLesson.map((cls: any) =>
          fetch(`${Server_url}/api/classrooms/classroom/${cls.id}/enrolled-students/`, { headers })
            .then(res => res.ok ? res.json() : [])
        );

        const studentsByClass = await Promise.all(studentPromises);
        // Handle paginated or direct array responses
        const allStudentsRaw = studentsByClass.flatMap(data => data.results || data);

        console.log("Flattened students:", allStudentsRaw);

        // Deduplicate by student ID (for direct student objects)
        const uniqueStudents = Array.from(
          new Map(
            allStudentsRaw.map(student => [student.id, student])
          ).values()
        );

        setStudents(uniqueStudents);
        console.log("Unique students:", uniqueStudents);

      } catch (err) {
        console.error("Error fetching students for lesson:", err);
        toast.error("Failed to fetch students for this lesson.");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    if (lesson_id) {
        fetchStudentsForLesson();
    }
  }, [lesson_id]);

  // Filter students by search
  const filteredStudents = students.filter((student) => {
    const searchValue = search.toLowerCase();
    if (!searchValue) return true; // Show all if search is empty

    if (filterType === "first_name") {
      return student.first_name?.toLowerCase().includes(searchValue);
    }
    if (filterType === "last_name") {
      return student.last_name?.toLowerCase().includes(searchValue);
    }
    if (filterType === "username") {
      return student.username?.toLowerCase().includes(searchValue);
    }
    // "all" or default: search all fields
    return (
      student.first_name?.toLowerCase().includes(searchValue) ||
      student.last_name?.toLowerCase().includes(searchValue) ||
      student.username?.toLowerCase().includes(searchValue)
    );
  });

  // Add this function in your component
  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/lesson/${lesson_id}`;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(inviteLink)
        .then(() => toast.success("Lesson invite link copied!"))
        .catch(() => toast.error("Failed to copy link!"));
    } else {
      // Fallback for unsupported browsers
      try {
        const tempInput = document.createElement("input");
        tempInput.value = inviteLink;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        toast.success("Lesson invite link copied!");
      } catch {
        toast.error("Failed to copy link!");
      }
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
      <div>
        <Sidebar />
      </div>
      <div className="ml-[17%]">
        <Header />

        <div className="flex-1 flex flex-col p-6">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm mb-6 flex-wrap">
            <button onClick={() => navigate('/admin/lesson/display')} className="flex items-center text-gray-500 hover:text-gray-700">
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-500">Lessons</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-800 font-medium">{lessonTitle || 'Lesson'}</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-blue-600 font-medium">View Students</span>
          </div>
          
          {/* Filter/Search Bar */}
          <div className="bg-white px-8 py-6 border-b rounded-t-lg">
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
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="bg-transparent border-none outline-none"
                  >
                    <option value="all">All</option>
                    <option value="first_name">First Name</option>
                    <option value="last_name">Last Name</option>
                    <option value="username">Username</option>
                  </select>
                </button>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold text-sm border border-blue-100 hover:bg-blue-100 transition"
                onClick={handleCopyInviteLink}
              >
                <FiCopy />
                Copy Lesson Invite Link
              </button>
            </div>
          </div>
          {/* Table */}
          <div className="flex-1 overflow-x-auto bg-white px-8 rounded-b-lg">
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
                    <th className="py-3 px-4 text-left font-semibold">
                      Username
                    </th>
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
                        No students found for this lesson.
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