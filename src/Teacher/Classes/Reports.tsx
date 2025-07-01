import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUsers, FiCheckCircle, FiEye } from "react-icons/fi";
import { BsQuestionCircle } from "react-icons/bs";
import { MdOutlineStar } from "react-icons/md";
import Server_url from "../../config";
import { Toaster, toast } from "react-hot-toast";

const Reports: React.FC = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"summary" | "students" | "assignment">("summary");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [studentsSubmitted, setStudentsSubmitted] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);

  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [studentsReport, setStudentsReport] = useState<any[]>([]);
  const [gradingPoints, setGradingPoints] = useState<{ [questionId: string]: number }>({});

  useEffect(() => {
    if (!classId) return;
    const token = localStorage.getItem("authToken");

    const fetchAll = async () => {
      try {
        // Fetch students
        const studentsRes = await fetch(
          `${Server_url}/api/classrooms/classroom/${classId}/enrolled-students/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let studentsData: any[] = [];
        if (studentsRes.ok) {
          const data = await studentsRes.json();
          studentsData = data.results || data;
          setStudents(studentsData);
          setTotalStudents(studentsData.length);
        }

        // Fetch assignments
        const assignmentsRes = await fetch(
          `${Server_url}/api/classrooms/classroom/${classId}/assignments/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let assignmentsData: any[] = [];
        let questions = 0;
        let points = 0;
        if (assignmentsRes.ok) {
          assignmentsData = await assignmentsRes.json();
          setAssignments(assignmentsData);
          assignmentsData.forEach((assignment: any) => {
            if (assignment.questions) {
              questions += assignment.questions.length;
              points += assignment.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
            }
          });
        }
        setTotalQuestions(questions);
        setTotalPoints(points);

        // Fetch submissions
        const submissionsRes = await fetch(
          `${Server_url}/api/classrooms/classroom/${classId}/assignment-submissions/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let submissionsData: any[] = [];
        if (submissionsRes.ok) {
          submissionsData = await submissionsRes.json();
          console.log("Fetching submissions", submissionsData); // Debug log
          setSubmissions(submissionsData);
          // Unique student count who submitted
          const uniqueStudents = new Set(submissionsData.map((s: any) => s.student));
          setStudentsSubmitted(uniqueStudents.size);
        }

        // Build studentsReport
        const report = [];
        for (const assignment of assignmentsData) {
          for (const student of studentsData) {
            const submission = submissionsData.find(
              (sub: any) => sub.assignment === assignment.id && sub.student === student.id
            );
            report.push({
              id: `${assignment.id}-${student.id}`,
              assignment: assignment.title,
              dueDate: assignment.due_date
                ? new Date(assignment.due_date).toLocaleString()
                : "-",
              status: submission
                ? submission.graded
                  ? "Graded"
                  : "Submitted"
                : "Pending",
              points: submission && submission.graded
                ? submission.points
                : "-",
              student,
              assignmentObj: assignment,
              submission,
            });
          }
        }
        setStudentsReport(report);

      } catch (err) {
        // Handle error as needed
      }
    };

    fetchAll();
  }, [classId]);

  const assignmentReportRows = React.useMemo(() => {
    // If no assignment selected, show all students for all assignments
    let filteredAssignments = assignments;
    if (selectedAssignmentId) {
      filteredAssignments = assignments.filter((a: any) => a.id === selectedAssignmentId);
    }
    const rows: any[] = [];
    for (const assignment of filteredAssignments) {
      for (const student of students) {
        const submission = submissions.find(
          (sub: any) => sub.assignment === assignment.id && sub.student === student.id
        );
        rows.push({
          id: `${assignment.id}-${student.id}`,
          name: `${student.first_name} ${student.last_name}`,
          username: student.username,
          dueDate: assignment.due_date
            ? new Date(assignment.due_date).toLocaleString()
            : "-",
          status: submission
            ? submission.graded
              ? "Graded"
              : "Submitted"
            : "Pending",
          points: submission && submission.graded
            ? submission.points
            : "-",
          assignment,
          student,
          submission,
        });
      }
    }
    return rows;
  }, [assignments, students, submissions, selectedAssignmentId]);

  const handleSaveGrade = async () => {
    if (!selectedAssignment?.submission?.id) return;
    const submissionId = selectedAssignment.submission.id;
    const token = localStorage.getItem("authToken");

    // Calculate total score from gradingPoints
    const score = Object.values(gradingPoints).reduce((sum, val) => sum + Number(val), 0);

    try {
      const res = await fetch(
        `${Server_url}/api/classrooms/assignment-submissions/${submissionId}/grade/`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score, // Send as { "score": 5 }
          }),
        }
      );
      if (res.ok) {
        toast.success("Grades saved!");
        setShowPopup(false);
        // Optionally, refresh data here
      } else {
        toast.error("Failed to save grades.");
      }
    } catch (err) {
      toast.error("Error saving grades.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center px-8 py-6 border-b border-gray-200 bg-white">
        <button
          className="text-blue-600 font-medium text-sm mr-4 hover:underline"
          onClick={() => navigate(-1)}
        >
          &lt; Go Back
        </button>
        <span className="text-gray-500 text-sm">Classes / Culture in Spanish / </span>
        <span className="text-blue-700 font-semibold text-sm ml-1">View Assignment Report</span>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar Placeholder */}
        <div className="w-56 bg-white border-r border-gray-200 pt-8"></div>
        <div className="flex-1 px-8 py-10">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex gap-2 mb-6">
              <button
                className={`px-4 py-2 rounded-lg font-semibold border ${activeTab === "summary" ? "bg-blue-50 text-blue-700 border-blue-200" : "text-gray-600 hover:bg-gray-100 border-transparent"}`}
                onClick={() => setActiveTab("summary")}
              >
                Report Summary
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold border ${activeTab === "students" ? "bg-blue-50 text-blue-700 border-blue-200" : "text-gray-600 hover:bg-gray-100 border-transparent"}`}
                onClick={() => setActiveTab("students")}
              >
                Students Report
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold border ${activeTab === "assignment" ? "bg-blue-50 text-blue-700 border-blue-200" : "text-gray-600 hover:bg-gray-100 border-transparent"}`}
                onClick={() => setActiveTab("assignment")}
              >
                Assignment Report
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "summary" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Quick Metrics</h2>
                <div className="grid grid-cols-4 gap-4">
                  {/* Total No. of Students */}
                  <div className="border-2 border-blue-400 rounded-xl p-4 flex flex-col items-start bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <FiUsers className="text-blue-600" size={20} />
                      <span className="font-medium text-gray-700 text-sm">Total No. of Students</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
                  </div>
                  {/* Students Who Submitted */}
                  <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-start bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <FiCheckCircle className="text-blue-600" size={20} />
                      <span className="font-medium text-gray-700 text-sm">Students Who Submitted</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{studentsSubmitted}</div>
                  </div>
                  {/* Total No. of Questions */}
                  <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-start bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <BsQuestionCircle className="text-blue-600" size={20} />
                      <span className="font-medium text-gray-700 text-sm">Total No. of Questions</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
                  </div>
                  {/* Total Assignment Points */}
                  <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-start bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <MdOutlineStar className="text-blue-600" size={20} />
                      <span className="font-medium text-gray-700 text-sm">Total Assignment Points</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{totalPoints}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "students" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="font-semibold text-lg">Assignment</div>
                  <div>
                    <select className="border rounded-lg px-4 py-2 text-sm">
                      <option>Select a Student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} ({student.username})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead>
                      <tr className="text-gray-500 text-sm border-b">
                        <th className="py-3 px-4 text-left">Assignment</th>
                        <th className="py-3 px-4 text-left">Due Date</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-left">Points</th>
                        <th className="py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsReport.map((item, idx) => (
                        <tr key={item.id} className="border-b last:border-b-0">
                          <td className="py-3 px-4">{item.assignment}</td>
                          <td className="py-3 px-4">{item.dueDate}</td>
                          <td className="py-3 px-4">
                            {item.status === "Submitted" && (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Submitted</span>
                            )}
                            {item.status === "Pending" && (
                              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">Pending</span>
                            )}
                            {item.status === "Graded" && (
                              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">Graded</span>
                            )}
                          </td>
                          <td className="py-3 px-4 flex items-center gap-2">
                            {item.points}
                            <MdOutlineStar className="text-blue-600" />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              className={`text-gray-500 hover:text-blue-600 ${item.status === "Pending" ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => {
                                if (item.status === "Pending") return;
                                setSelectedAssignment({
                                  assignment: item.assignmentObj,
                                  questions: item.assignmentObj.questions,
                                  submission: item.submission,
                                  student: item.student,
                                });
                                // Initialize grading points
                                const initialPoints: any = {};
                                item.assignmentObj.questions.forEach((q: any) => {
                                  initialPoints[q.id] = q.points || 0;
                                });
                                setGradingPoints(initialPoints);
                                setShowPopup(true);
                              }}
                              disabled={item.status === "Pending"}
                              tabIndex={item.status === "Pending" ? -1 : 0}
                              aria-disabled={item.status === "Pending"}
                            >
                              <FiEye className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "assignment" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="font-semibold text-lg">Assignment Report</div>
                  <div>
                    <select
                      className="border rounded-lg px-4 py-2 text-sm"
                      value={selectedAssignmentId || ""}
                      onChange={e => setSelectedAssignmentId(e.target.value || null)}
                    >
                      <option value="">Select an Assignment</option>
                      {assignments.map((assignment) => (
                        <option key={assignment.id} value={assignment.id}>
                          {assignment.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead>
                      <tr className="text-gray-500 text-sm border-b">
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Due Date</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-left">Points</th>
                        <th className="py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignmentReportRows.map((row) => (
                        <tr key={row.id} className="border-b last:border-b-0">
                          <td className="py-3 px-4">
                            <div className="font-medium">{row.name}</div>
                            <div className="text-xs text-gray-400">@{row.username}</div>
                          </td>
                          <td className="py-3 px-4">{row.dueDate}</td>
                          <td className="py-3 px-4">
                            {row.status === "Submitted" && (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Submitted</span>
                            )}
                            {row.status === "Pending" && (
                              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">Pending</span>
                            )}
                            {row.status === "Graded" && (
                              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">Graded</span>
                            )}
                          </td>
                          <td className="py-3 px-4 flex items-center gap-2">
                            {row.points}
                            <MdOutlineStar className="text-blue-600" />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              className="text-gray-500 hover:text-blue-600"
                              onClick={() => {
                                setSelectedAssignment({
                                  assignment: row.assignment,
                                  questions: row.assignment.questions,
                                  submission: row.submission,
                                  student: row.student,
                                });
                                setShowPopup(true);
                              }}
                            >
                              <FiEye className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Grading Popup */}
      {showPopup && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-end z-50">
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-xl p-8 relative">
            <button
              className="absolute top-6 right-6 text-2xl text-gray-400 hover:text-gray-600"
              onClick={() => setShowPopup(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6">
              Assignment: {selectedAssignment.assignment?.title}
            </h2>
            {console.log("Popup selectedAssignment:", selectedAssignment)}
            {selectedAssignment.questions &&
              selectedAssignment.questions.map((q: any, idx: number) => {
                // Find the answer for this question
                const answerObj = selectedAssignment.submission?.answers?.find(
                  (a: any) =>
                    String(a.question) === String(q.id) ||
                    String(a.question) === String(q.question) ||
                    String(a.question) === String(q.question_id)
                );
                console.log(`Question ${idx + 1}:`, q);
                console.log(`AnswerObj for Question ${idx + 1}:`, answerObj);
                return (
                  <div key={q.id} className="mb-8">
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <span className="text-blue-600 font-semibold">Question {idx + 1}</span>
                      <p className="text-gray-800 mt-2">{q.question_text || q.text}</p>
                      <div className="mt-4">
                        <span className="block text-xs text-gray-500 mb-1">ANSWER</span>
                        <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-700">
                          {answerObj ? (
                            <>
                              {answerObj.answer_text && <div>{answerObj.answer_text}</div>}
                              {answerObj.answer_file && (
                                <div>
                                  <a
                                    href={answerObj.answer_file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                  >
                                    View File
                                  </a>
                                </div>
                              )}
                              {!answerObj.answer_text && !answerObj.answer_file && (
                                <span className="text-gray-400">No answer submitted.</span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">No answer submitted.</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Assign points <span className="text-gray-400">(Max. of {q.points})*</span>
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-lg px-4 py-2"
                        max={q.points}
                        min={0}
                        value={gradingPoints[q.id] ?? ""}
                        onChange={e => {
                          let val = Number(e.target.value);
                          if (val > q.points) val = q.points;
                          if (val < 0) val = 0;
                          setGradingPoints(prev => ({ ...prev, [q.id]: val }));
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold mt-4 hover:bg-blue-700"
              onClick={handleSaveGrade}
            >
              Save Assignment Grade <span className="ml-2">&#10003;</span>
            </button>
          </div>
        </div>
      )}
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Reports;