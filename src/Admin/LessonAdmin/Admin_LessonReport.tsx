import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../Component/Home/Sidebar.tsx";
import Header from "../../Component/Home/Header.tsx";
import Server_url from "../../config.js";
import { FiArrowLeft, FiUsers, FiCheckCircle, FiXCircle, FiClock, FiEdit3 } from "react-icons/fi";
import { MdAssignment } from "react-icons/md";

const LessonReport: React.FC = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "students" | "exercises">("summary");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [questionsById, setQuestionsById] = useState<{ [id: string]: any }>({});

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      try {
        const res = await fetch(`${Server_url}/api/lessons/lesson/${lessonId}/report/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch lesson report");
        const data = await res.json();
        console.log("Lesson stages API response:", data);
        setReport(data);
      } catch (err) {
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) fetchReport();
  }, [lessonId]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!lessonId) return;
      const token = localStorage.getItem("authToken");
      try {
        const res = await fetch(`${Server_url}/api/lessons/lesson/${lessonId}/stages/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch lesson stages");
        const data = await res.json();
        // Flatten all questions from all stages
        const stages = data.results || data;
        const allQuestions: any[] = [];
        stages.forEach((stage: any) => {
          if (stage.questions && Array.isArray(stage.questions)) {
            stage.questions.forEach((q: any) => {
              allQuestions.push(q);
            });
          }
        });
        // Map by id for fast lookup
        const map: { [id: string]: any } = {};
        allQuestions.forEach(q => {
          map[String(q.id)] = q;
        });
        setQuestionsById(map);
      } catch (err) {
        setQuestionsById({});
      }
    };
    fetchQuestions();
  }, [lessonId]);

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-[17%]">
          <Header />
          <main className="flex-1 p-8">
            <div className="text-center text-gray-500 py-12">Loading...</div>
          </main>
        </div>
      </div>
    );
  }

  // Extract metrics
  const {
    "Total No. of Students": totalStudents,
    "Students Who Attempted": studentsWhoAttempted,
    "Students Who Completed": studentsWhoCompleted,
    "Total No. of Exercises": totalExercises,
    "Exercises Passed": exercisesPassed,
    "Exercises Failed": exercisesFailed,
    "Exercises Not Attempted": exercisesNotAttempted,
    "Avg. Completion Time": avgCompletionTime,
    "Most Passed Question": mostPassedId,
    "Most Failed Question": mostFailedId,
    "Detailed Submissions": detailedSubmissions = [],
    "Prompts": prompts = [],
    "Students": students = [],
  } = report;

  // Find most passed/failed question details using the questionsById map
  const mostPassedQuestion = questionsById[String(mostPassedId)];
  const mostFailedQuestion = questionsById[String(mostFailedId)];

  // For dropdowns
  const studentOptions = students || [];
  const exerciseOptions = prompts || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[17%]">
        <Header />
        <main className="flex-1 p-8">
          <div className="flex items-center gap-2 text-gray-400 mb-10 text-base">
            <button className="text-blue-600 hover:underline" onClick={() => navigate('/admin/lesson/display')}>
              <FiArrowLeft />
              
            </button>
            <span className="text-blue-600 hover:underline" onClick={() => navigate('/admin/lesson/display')}>Go Back</span>
            <span></span>
            <span>/</span>
            <span>Lessons</span>
            <span>/</span>
            <span className="text-blue-600 font-semibold">View Quiz Report</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "summary" ? "bg-blue-100 text-blue-700" : "bg-white text-gray-600 border"}`}
              onClick={() => setActiveTab("summary")}
            >
              Report Summary
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "students" ? "bg-blue-100 text-blue-700" : "bg-white text-gray-600 border"}`}
              onClick={() => setActiveTab("students")}
            >
              Students Report
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "exercises" ? "bg-blue-100 text-blue-700" : "bg-white text-gray-600 border"}`}
              onClick={() => setActiveTab("exercises")}
            >
              Exercises Report
            </button>
            {/* Dropdowns for filtering */}
            <div className="ml-auto flex gap-2">
              {activeTab === "students" && (
                <select
                  className="border rounded-lg px-4 py-2 text-sm"
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                >
                  <option value="">Select a Student</option>
                  {studentOptions.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} (@{s.username})
                    </option>
                  ))}
                </select>
              )}
              {activeTab === "exercises" && (
                <select
                  className="border rounded-lg px-4 py-2 text-sm"
                  value={selectedExercise}
                  onChange={e => setSelectedExercise(e.target.value)}
                >
                  <option value="">Select an exercise</option>
                  {exerciseOptions.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.prompt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "summary" && (
            <div>
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col items-center">
                  <FiUsers className="text-blue-500 text-2xl mb-2" />
                  <div className="font-bold text-xl">{totalStudents}</div>
                  <div className="text-xs text-gray-500 mt-1">Total No. of Students</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col items-center">
                  <FiEdit3 className="text-blue-500 text-2xl mb-2" />
                  <div className="font-bold text-xl">{studentsWhoAttempted}</div>
                  <div className="text-xs text-gray-500 mt-1">Students Who Attempted</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col items-center">
                  <FiCheckCircle className="text-blue-500 text-2xl mb-2" />
                  <div className="font-bold text-xl">{studentsWhoCompleted}</div>
                  <div className="text-xs text-gray-500 mt-1">Students Who Completed</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col items-center">
                  <MdAssignment className="text-blue-500 text-2xl mb-2" />
                  <div className="font-bold text-xl">{totalExercises}</div>
                  <div className="text-xs text-gray-500 mt-1">Total No. of Exercises</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col items-center">
                  <FiCheckCircle className="text-blue-500 text-2xl mb-2" />
                  <div className="font-bold text-xl">{exercisesPassed}</div>
                  <div className="text-xs text-gray-500 mt-1">Exercises Passed</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col items-center">
                  <FiXCircle className="text-blue-500 text-2xl mb-2" />
                  <div className="font-bold text-xl">{exercisesFailed}</div>
                  <div className="text-xs text-gray-500 mt-1">Exercises Failed</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col items-center">
                  <FiClock className="text-blue-500 text-2xl mb-2" />
                  <div className="font-bold text-xl">{exercisesNotAttempted}</div>
                  <div className="text-xs text-gray-500 mt-1">Exercises Not Attempted</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col items-center">
                  <FiClock className="text-blue-500 text-2xl mb-2" />
                  <div className="font-bold text-xl">{avgCompletionTime} mins</div>
                  <div className="text-xs text-gray-500 mt-1">Avg. Completion Time</div>
                </div>
              </div>
              {/* Most Passed/Failed Question */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="font-bold text-lg mb-2">Most Passed Question</div>
                  <div className="mb-2 text-gray-700">
                    {mostPassedQuestion?.prompt || mostPassedQuestion?.question_text || "N/A"}
                  </div>
                  {mostPassedQuestion?.options && (
                    <div className="flex gap-2">
                      {mostPassedQuestion.options.map((opt: any, idx: number) => (
                        <div key={idx} className={`bg-white rounded-lg p-4 shadow text-center ${opt.is_correct ? "border border-green-500" : ""}`}>
                          {opt.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-red-50 rounded-lg p-6">
                  <div className="font-bold text-lg mb-2">Most Failed Question</div>
                  <div className="mb-2 text-gray-700">
                    {mostFailedQuestion?.prompt || mostFailedQuestion?.question_text || "N/A"}
                  </div>
                  {mostFailedQuestion?.options && (
                    <div className="flex gap-2">
                      {mostFailedQuestion.options.map((opt: any, idx: number) => (
                        <div key={idx} className={`bg-white rounded-lg p-4 shadow text-center ${opt.is_correct ? "border border-green-500" : ""}`}>
                          {opt.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === "students" && (
            <div>
              <table className="min-w-full bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="text-gray-500 text-sm border-b">
                    <th className="py-3 px-4 text-left font-semibold">Exercise Prompt</th>
                    <th className="py-3 px-4 text-left font-semibold">Completion Time</th>
                    <th className="py-3 px-4 text-left font-semibold">Exercise Type</th>
                    <th className="py-3 px-4 text-left font-semibold">Date Completed</th>
                    <th className="py-3 px-4 text-left font-semibold">Student</th>
                    <th className="py-3 px-4 text-left font-semibold">Student's Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedSubmissions
                    .filter((s: any) => !selectedStudent || s["Student"] === selectedStudent)
                    .map((s: any, idx: number) => (
                      <tr key={idx} className="border-b last:border-b-0">
                        <td className="py-3 px-4">{s["Exercise Prompt"]}</td>
                        <td className="py-3 px-4">{s["Completion Time"] ? `${s["Completion Time"]} Sec` : "-"}</td>
                        <td className="py-3 px-4">{s["Exercise Type"]}</td>
                        <td className="py-3 px-4">{s["Date Completed"] ? new Date(s["Date Completed"]).toLocaleString() : "-"}</td>
                        <td className="py-3 px-4">{s["Student"]}</td>
                        <td className="py-3 px-4">
  {s["Skipped"]
    ? <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">Skipped</span>
    : s["Correct"]
      ? <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Incorrect</span>
      :<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Correct</span>
  }
</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "exercises" && (
            <div>
              <table className="min-w-full bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="text-gray-500 text-sm border-b">
                    <th className="py-3 px-4 text-left font-semibold">Student</th>
                    <th className="py-3 px-4 text-left font-semibold">Exercise Prompt</th>
                    <th className="py-3 px-4 text-left font-semibold">Completion Time</th>
                    <th className="py-3 px-4 text-left font-semibold">Exercise Type</th>
                    <th className="py-3 px-4 text-left font-semibold">Date Completed</th>
                    <th className="py-3 px-4 text-left font-semibold">Student's Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedSubmissions
                    .filter((s: any) => !selectedExercise || s["Exercise Prompt"] === selectedExercise)
                    .map((s: any, idx: number) => (
                      <tr key={idx} className="border-b last:border-b-0">
                        <td className="py-3 px-4">{s["Student"]}</td>
                        <td className="py-3 px-4">{s["Exercise Prompt"]}</td>
                        <td className="py-3 px-4">{s["Completion Time"] ? `${s["Completion Time"]} Sec` : "-"}</td>
                        <td className="py-3 px-4">{s["Exercise Type"]}</td>
                        <td className="py-3 px-4">{s["Date Completed"] ? new Date(s["Date Completed"]).toLocaleString() : "-"}</td>
                        <td className="py-3 px-4">
  {s["Skipped"]
    ? <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">Skipped</span>
    : s["Correct"]
      ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Correct</span>
      : <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Incorrect</span>
  }
</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LessonReport;