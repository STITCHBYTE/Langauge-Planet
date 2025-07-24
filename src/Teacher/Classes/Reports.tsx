import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUsers, FiCheckCircle, FiEye, FiPrinter } from "react-icons/fi";
import { BsQuestionCircle } from "react-icons/bs";
import { MdOutlineStar } from "react-icons/md";
import Server_url from "../../config";
import { toast } from "react-toastify";
import axios from "axios";
import Sidebar from "../../Component/Home/Sidebar.tsx";
import Header from "../../Component/Home/Header.tsx";

const handleApiError = (error: any, functionName: string) => {
  if (error.response?.status === 401) {
    throw new Error("Authentication failed. Please log in again.");
  }
  throw error;
};

export function getStudentSubmissions(token: string, courseId: string, courseWorkId: string) {
  if (!token) {
    throw new Error("No authentication token found. Please log in again.");
  }

  return axios.get(
    `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  ).catch(error => handleApiError(error, 'getStudentSubmissions'));
}

export function submitGradeToGoogleClassroom(
  token: string, 
  courseId: string, 
  courseWorkId: string, 
  submissionId: string, 
  grade: number
) {
  if (!token) {
    throw new Error("No authentication token found. Please log in again.");
  }

  return axios.patch(
    `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions/${submissionId}?updateMask=assignedGrade`,
    {
      assignedGrade: grade,
    },
    {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    }
  ).catch(error => handleApiError(error, 'submitGradeToGoogleClassroom'));
}

const getGoogleUserId = async (googleToken: string): Promise<string> => {
  let googleUserId = localStorage.getItem('google_user_id');
  if (googleUserId) return googleUserId;

  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${googleToken}` }
  });

  if (!userInfoRes.ok) {
    throw new Error('Your Google login has expired or is invalid. Please reconnect your Google account.');
  }

  const userInfo = await userInfoRes.json();
  googleUserId = userInfo.sub;

  if (!googleUserId) {
    throw new Error('Could not retrieve Google User ID from Google.');
  }

  localStorage.setItem('google_user_id', googleUserId);
  return googleUserId;
};

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
  const [currentClass, setCurrentClass] = useState<any>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const [showPrintPage, setShowPrintPage] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  useEffect(() => {
    if (!classId) return;
    const token = localStorage.getItem("authToken");

    const fetchAll = async () => {
      try {
        const classRes = await fetch(
          `${Server_url}/api/classrooms/classroom/${classId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (classRes.ok) setCurrentClass(await classRes.json());
        
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

        const submissionsRes = await fetch(
          `${Server_url}/api/classrooms/classroom/${classId}/assignment-submissions/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let submissionsData: any[] = [];
        if (submissionsRes.ok) {
          submissionsData = await submissionsRes.json();
          setSubmissions(submissionsData);
          const uniqueStudents = new Set(submissionsData.map((s: any) => s.student));
          setStudentsSubmitted(uniqueStudents.size);
        }

        const report = [];
        for (const assignment of assignmentsData) {
          for (const student of studentsData) {
            const submission = submissionsData.find(
              (sub: any) => sub.assignment === assignment.id && sub.student === student.id
            );
            report.push({
              id: `${assignment.id}-${student.id}`,
              assignment: assignment.title,
              dueDate: assignment.due_date ? new Date(assignment.due_date).toLocaleString() : "-",
              status: submission ? (submission.graded ? "Graded" : "Submitted") : "Pending",
              points: submission && submission.graded ? submission.points : "-",
              student,
              assignmentObj: assignment,
              submission,
            });
          }
        }
        setStudentsReport(report);
      } catch (err) {
      }
    };
    fetchAll();
  }, [classId]);

  const assignmentReportRows = React.useMemo(() => {
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
          dueDate: assignment.due_date ? new Date(assignment.due_date).toLocaleString() : "-",
          status: submission ? (submission.graded ? "Graded" : "Submitted") : "Pending",
          points: submission && submission.graded ? submission.points : "-",
          assignment,
          student,
          submission,
        });
      }
    }
    return rows;
  }, [assignments, students, submissions, selectedAssignmentId]);

  const handleSaveGrade = async () => {
    if (!selectedAssignment?.submission?.id) {
      toast.error("No submission selected.");
      return;
    }

    const localSubmissionId = selectedAssignment.submission.id;
    const token = localStorage.getItem("authToken");
    const googleToken = localStorage.getItem("google_access_token");
    const score = Object.values(gradingPoints).reduce((sum, val) => sum + Number(val), 0);

    if (googleToken && currentClass) {
      toast.info("Syncing grade with Google Classroom...", { autoClose: 2000 });
      try {
        const teacherId = await getGoogleUserId(googleToken);
        const coursesRes = await axios.get("https://classroom.googleapis.com/v1/courses", {
          headers: { Authorization: `Bearer ${googleToken}` },
          params: { teacherId: teacherId, courseStates: 'ACTIVE' }
        });
        
        const googleCourse = coursesRes.data.courses.find((c: any) => 
            c.name.trim().toLowerCase() === currentClass.title.trim().toLowerCase()
        );

        if (!googleCourse) {
          throw new Error(`Course '${currentClass.title}' not found in Google Classroom.`);
        }
        const courseId = googleCourse.id;

        let courseWorkId = selectedAssignment.assignment.google_classroom_id;
        if (!courseWorkId) {
          const courseWorkRes = await axios.get(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
            headers: { Authorization: `Bearer ${googleToken}` }
          });
          const googleCourseWork = courseWorkRes.data.courseWork?.find(
            (cw: any) => cw.title === selectedAssignment.assignment.title
          );
          if (!googleCourseWork) {
            throw new Error(`Assignment '${selectedAssignment.assignment.title}' not found in the Google course.`);
          }
          courseWorkId = googleCourseWork.id;
        }

        const submissionsResponse = await getStudentSubmissions(googleToken, courseId, courseWorkId);
        const studentEmail = selectedAssignment.student.email;

        const googleSubmission = submissionsResponse.data.studentSubmissions[0]; 
        if (!googleSubmission) {
            throw new Error(`Submission for student ${studentEmail} not found in Google Classroom.`);
        }
        const submissionId = googleSubmission.id;

        await submitGradeToGoogleClassroom(googleToken, courseId, courseWorkId, submissionId, score);
        await axios.post(
            `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions/${submissionId}:return`,
            {},
            { headers: { Authorization: `Bearer ${googleToken}` } }
        );

        toast.success("Grade synced and returned in Google Classroom!");
      } catch (googleError: any) {
        const errorMessage = googleError.response?.data?.error?.message || googleError.message;
        toast.error(`Google Sync Failed: ${errorMessage}`);
      }
    }

    try {
      const res = await fetch(
        `${Server_url}/api/classrooms/assignment-submissions/${localSubmissionId}/grade/`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ score }),
        }
      );
      
      if (res.ok) {
        toast.success("Grades saved successfully!");
        setShowPopup(false);
      } else {
        const errorData = await res.json();
        toast.error(`Failed to save grades: ${errorData.detail || "Unknown error"}`);
      }
    } catch (err) {
      toast.error("An error occurred while saving grades.");
    }
  };

  const handlePrintReport = (studentReportItem: any) => {
    setPrintData(studentReportItem);
    setShowPrintPage(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[17%]">
        <Header />
        <div className="items-center border-b border-gray-200 bg-white p-4">
          <button
            className="text-blue-600 font-medium text-sm mr-4 hover:underline"
            onClick={() => navigate(-1)}
          >&lt; Go Back</button>
          <span className="text-gray-500 text-sm">/{classId}/</span>
          <span className="text-blue-700 font-semibold text-sm ml-1">View Assignment Report</span>
        </div>

        <div className="flex flex-1">
          <div className="flex-1 px-8 py-10">
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

              {activeTab === "summary" && (
                <div>
                    <h2 className="text-lg font-semibold mb-4">Quick Metrics</h2>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="border-2 border-blue-400 rounded-xl p-4 flex flex-col items-start bg-white">
                            <div className="flex items-center gap-2 mb-2">
                                <FiUsers className="text-blue-600" size={20} />
                                <span className="font-medium text-gray-700 text-sm">Total No. of Students</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
                        </div>
                        <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-start bg-white">
                            <div className="flex items-center gap-2 mb-2">
                                <FiCheckCircle className="text-blue-600" size={20} />
                                <span className="font-medium text-gray-700 text-sm">Students Who Submitted</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{studentsSubmitted}</div>
                        </div>
                        <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-start bg-white">
                            <div className="flex items-center gap-2 mb-2">
                                <BsQuestionCircle className="text-blue-600" size={20} />
                                <span className="font-medium text-gray-700 text-sm">Total No. of Questions</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
                        </div>
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
                        <div className="font-semibold text-lg">Students Report</div>
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
                            {studentsReport.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                                  No assignment submitted.
                                </td>
                              </tr>
                            ) : (
                              studentsReport.map((item) => (
                                <tr key={item.id} className="border-b last:border-b-0">
                                  <td className="py-3 px-4">{item.assignment}</td>
                                  <td className="py-3 px-4">{item.dueDate}</td>
                                  <td className="py-3 px-4">
                                    {typeof item.submission?.score === "number" && (
                                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">Graded</span>
                                    )}
                                    {item.submission && typeof item.submission?.score !== "number" && (
                                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Submitted</span>
                                    )}
                                    {!item.submission && (
                                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">Pending</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 flex items-center gap-2">
                                    {typeof item.submission?.score === "number" ? item.submission.score : "-"}
                                    <MdOutlineStar className="text-blue-600" />
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <button
                                        className={`text-gray-500 hover:text-blue-600 ${typeof item.submission?.score === "number" ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={() => {
                                          if (typeof item.submission?.score === "number") return; 
                                          setSelectedAssignment({
                                            assignment: item.assignmentObj,
                                            questions: item.assignmentObj.questions,
                                            submission: item.submission,
                                            student: item.student,
                                          });
                                          const initialPoints: any = {};
                                          item.assignmentObj.questions.forEach((q: any) => {
                                            initialPoints[q.id] = item.submission?.score
                                              ? (item.submission.answers.find(a => a.question === q.id)?.points ?? 0)
                                              : (q.points || 0);
                                          });
                                          setGradingPoints(initialPoints);
                                          setShowPopup(true);
                                        }}
                                        disabled={typeof item.submission?.score === "number"}
                                        title="View Submission"
                                      >
                                        <FiEye className="w-5 h-5" />
                                      </button>
                                      <button
                                        className={`text-gray-500 hover:text-blue-600 ${typeof item.submission?.score === "number" ? "" : "opacity-50 cursor-not-allowed"}`}
                                        onClick={() => {
                                          if (typeof item.submission?.score === "number") {
                                            handlePrintReport({
                                              student: item.student,
                                              assignment: item.assignmentObj,
                                              submission: item.submission,
                                            });
                                          }
                                        }}
                                        disabled={typeof item.submission?.score !== "number"}
                                        title="Print Report Card"
                                      >
                                        <FiPrinter className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
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
                            {assignmentReportRows.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                                  No assignment submitted.
                                </td>
                              </tr>
                            ) : (
                              assignmentReportRows.map((row) => (
                                <tr key={row.id} className="border-b last:border-b-0">
                                  <td className="py-3 px-4">
                                    <div className="font-medium">{row.name}</div>
                                    <div className="text-xs text-gray-400">@{row.username}</div>
                                  </td>
                                  <td className="py-3 px-4">{row.dueDate}</td>
                                  <td className="py-3 px-4">
                                    {typeof row.submission?.score === "number" && (
                                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">Graded</span>
                                    )}
                                    {row.submission && typeof row.submission?.score !== "number" && (
                                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Submitted</span>
                                    )}
                                    {!row.submission && (
                                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">Pending</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 flex items-center gap-2">
                                    {typeof row.submission?.score === "number" ? row.submission.score : "-"}
                                    <MdOutlineStar className="text-blue-600" />
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <button
                                        className={`text-gray-500 hover:text-blue-600 ${typeof row.submission?.score === "number" ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={() => {
                                          if (typeof row.submission?.score === "number") return; 
                                          setSelectedAssignment({
                                            assignment: row.assignment,
                                            questions: row.assignment.questions,
                                            submission: row.submission,
                                            student: row.student,
                                          });
                                          const initialPoints: any = {};
                                          row.assignment.questions.forEach((q: any) => {
                                            initialPoints[q.id] = row.submission?.score
                                              ? (row.submission.answers.find(a => a.question === q.id)?.points ?? 0)
                                              : (q.points || 0);
                                          });
                                          setGradingPoints(initialPoints);
                                          setShowPopup(true);
                                        }}
                                        disabled={typeof row.submission?.score === "number"}
                                        title="View Details"
                                      >
                                        <FiEye className="w-5 h-5" />
                                      </button>
                                      <button
                                        className={`text-gray-500 hover:text-blue-600 ${typeof row.submission?.score === "number" ? "" : "opacity-50 cursor-not-allowed"}`}
                                        onClick={() => {
                                          if (typeof row.submission?.score === "number") {
                                            handlePrintReport({
                                              student: row.student,
                                              assignment: row.assignment,
                                              submission: row.submission,
                                            });
                                          }
                                        }}
                                        disabled={typeof row.submission?.score !== "number"}
                                        title="Print Report Card"
                                      >
                                        <FiPrinter className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                        </tbody>
                        </table>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
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
            {selectedAssignment.questions &&
              selectedAssignment.questions.map((q: any, idx: number) => {
                const answerObj = selectedAssignment.submission?.answers?.find(
                  (a: any) =>
                    String(a.question) === String(q.id) ||
                    String(a.question) === String(q.question) ||
                    String(a.question) === String(q.question_id)
                );
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
            <div className="mt-6 flex flex-col gap-2">
              <button
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition"
                onClick={handleSaveGrade}
              >
                {selectedAssignment.submission && selectedAssignment.submission.graded ? "Update Grade" : "Save Grade"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrintPage && printData && (
        <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center print-page">
            <div ref={printRef} className="w-full max-w-2xl mx-auto bg-white p-10 rounded-xl shadow-xl border border-gray-200">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-xl font-bold text-blue-700">Language Planet Report Card</span>
                </div>
                <div className="mb-6">
                    <div className="text-lg font-semibold text-gray-800">Student: {printData.student?.first_name} {printData.student?.last_name}</div>
                    <div className="text-sm text-gray-600">Email: {printData.student?.email}</div>
                    <div className="text-sm text-gray-600">Username: {printData.student?.username}</div>
                </div>
                <div className="mb-6">
                    <div className="font-semibold text-gray-700">Assignment: {printData.assignment?.title}</div>
                    <div className="text-sm text-gray-500">Due Date: {printData.assignment?.due_date ? new Date(printData.assignment.due_date).toLocaleString() : "-"}</div>
                    <div className="text-sm text-gray-500">Total Marks: {printData.assignment?.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0)}</div>
                    <div className="text-sm text-gray-500">Grade Awarded: {printData.submission?.score ?? "-"}</div>
                </div>
                <div>
                    <div className="font-semibold text-gray-700 mb-2">Answers:</div>
                    {printData.assignment?.questions?.map((q: any, idx: number) => {
                    const answerObj = printData.submission?.answers?.find(
                        (a: any) =>
                        String(a.question) === String(q.id) ||
                        String(a.question) === String(q.question) ||
                        String(a.question) === String(q.question_id)
                    );
                    return (
                        <div key={q.id} className="mb-4 border-b pb-2">
                        <div className="font-medium text-gray-800">Q{idx + 1}: {q.question_text || q.text}</div>
                        <div className="text-sm text-gray-700">
                            <span className="font-semibold">Answer:</span>{" "}
                            {answerObj?.answer_text || (answerObj?.answer_file ? <a href={answerObj.answer_file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View File</a> : <span className="text-gray-400">No answer submitted.</span>)}
                        </div>
                        </div>
                    );
                    })}
                </div>
                <div className="mt-8 flex justify-end gap-4 print-hide">
                    <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                    onClick={() => {
                        window.print();
                    }}
                    >
                    Print
                    </button>
                    <button
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                    onClick={() => setShowPrintPage(false)}
                    >
                    Close
                    </button>
                </div>
                <div className="mt-10 text-center text-xs text-gray-400">
                    Powered by Language Planet &copy; {new Date().getFullYear()}
                </div>
            </div>
        </div>
      )}

      <style>
        {`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print-page, .print-page * {
            visibility: visible !important;
          }
          .print-page {
            position: absolute !important;
            left: 0; 
            top: 0; 
            width: 100vw; 
            height: 100vh; 
            background: white !important;
            z-index: 99999 !important;
          }
          .print-hide { 
            display: none !important;
          }
        }
        `}
      </style>
    </div>
  );
};

export default Reports;