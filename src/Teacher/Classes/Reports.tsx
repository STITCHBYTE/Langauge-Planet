import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUsers, FiCheckCircle, FiEye } from "react-icons/fi";
import { BsQuestionCircle } from "react-icons/bs";
import { MdOutlineStar } from "react-icons/md";
import Server_url from "../../config";
import { toast } from "react-toastify";
import axios from "axios";
import Sidebar from "../../Component/Home/Sidebar.tsx";
import Header from "../../Component/Home/Header.tsx";

// Google Classroom API functions
const handleApiError = (error: any, functionName: string) => {
  console.error(`Error in ${functionName}:`, error);
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
      // REMOVED the incorrect 'params' object that was causing the 400 error.
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

  // CORRECTED: Use PATCH to update the assignedGrade.
  // The updateMask query parameter is crucial.
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

/**
 * Retrieves the Google User ID.
 * First, it checks localStorage. If not found, it fetches it from Google's userinfo endpoint.
 * Throws an error if the token is invalid or the ID cannot be retrieved.
 * @param googleToken The user's Google access token.
 * @returns The Google User ID (sub).
 */
const getGoogleUserId = async (googleToken: string): Promise<string> => {
  let googleUserId = localStorage.getItem('google_user_id');

  if (googleUserId) {
    console.log('[getGoogleUserId] Found user ID in localStorage:', googleUserId);
    return googleUserId;
  }

  console.log('[getGoogleUserId] User ID not in localStorage, fetching from Google...');
  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${googleToken}` }
  });

  if (!userInfoRes.ok) {
    const errorText = await userInfoRes.text();
    console.error('[getGoogleUserId] Failed to fetch user info:', errorText);
    throw new Error('Your Google login has expired or is invalid. Please reconnect your Google account.');
  }

  const userInfo = await userInfoRes.json();
  googleUserId = userInfo.sub;

  if (!googleUserId) {
    console.error('[getGoogleUserId] User info response did not contain a "sub" (user ID) field.');
    throw new Error('Could not retrieve Google User ID from Google.');
  }

  console.log('[getGoogleUserId] Successfully fetched user ID:', googleUserId);
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
  const [currentClass, setCurrentClass] = useState<any>(null); // ADD THIS STATE

  useEffect(() => {
    if (!classId) return;
    const token = localStorage.getItem("authToken");

    const fetchAll = async () => {
      try {
        // --- ADD THIS: Fetch current class details ---
        const classRes = await fetch(
          `${Server_url}/api/classrooms/classroom/${classId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (classRes.ok) {
          const classData = await classRes.json();
          setCurrentClass(classData);
          console.log("Fetched current class details:", classData);
        }
        // --- END OF ADDITION ---

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
    console.log("--- DEBUG: Starting handleSaveGrade ---");
    if (!selectedAssignment?.submission?.id) {
      console.error("DEBUG: Aborting. No selected assignment or submission ID.");
      return;
    }

    const localSubmissionId = selectedAssignment.submission.id;
    const token = localStorage.getItem("authToken");
    const googleToken = localStorage.getItem("google_access_token");
    const score = Object.values(gradingPoints).reduce((sum, val) => sum + Number(val), 0);

    console.log("DEBUG: Step 1 - Initial Data");
    console.log("  > Local Submission ID:", localSubmissionId);
    console.log("  > Calculated Score:", score);
    console.log("  > Has Google Token?", !!googleToken);
    console.log("  > Current Class details available?", !!currentClass);

    // --- Start Google Classroom Sync First ---
    if (googleToken && currentClass) {
      console.log("DEBUG: Step 2 - Conditions met. Attempting to sync with Google Classroom.");
      toast.info("Syncing grade with Google Classroom...", { id: "google-sync" });

      try {
        // --- Get Teacher's Google ID ---
        const teacherId = await getGoogleUserId(googleToken);

        // --- Find Google Course ID ---
        console.log("DEBUG: Step 3 - Finding Google Course ID...");
        const coursesRes = await axios.get("https://classroom.googleapis.com/v1/courses", {
          headers: { Authorization: `Bearer ${googleToken}` },
          params: { teacherId: teacherId, courseStates: 'ACTIVE' }
        });
        
        console.log("  > Searching for course with title:", currentClass.title);
        const googleCourse = coursesRes.data.courses.find((c: any) => {
          const normalizedCurrentTitle = currentClass.title.trim().toLowerCase();
          const normalizedGoogleTitle = c.name.trim().toLowerCase();
          return normalizedGoogleTitle === normalizedCurrentTitle;
        });
        if (!googleCourse) {
          throw new Error(`Course '${currentClass.title}' not found in your Google Classroom account.`);
        }
        const courseId = googleCourse.id;
        console.log("  > SUCCESS: Found Google Course ID:", courseId);

        // --- Find Google CourseWork (Assignment) ID ---
        console.log("DEBUG: Step 4 - Finding Google Assignment (CourseWork) ID...");
        let courseWorkId = selectedAssignment.assignment.google_classroom_id;
        
        if (!courseWorkId) {
          console.log("  > CourseWork ID is missing locally, searching on Google...");
          const courseWorkRes = await axios.get(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
            headers: { Authorization: `Bearer ${googleToken}` }
          });
          console.log("  > Searching for assignment with title:", selectedAssignment.assignment.title);
          const googleCourseWork = courseWorkRes.data.courseWork?.find(
            (cw: any) => cw.title === selectedAssignment.assignment.title
          );
          if (!googleCourseWork) {
            throw new Error(`Assignment '${selectedAssignment.assignment.title}' not found in the Google Classroom course.`);
          }
          courseWorkId = googleCourseWork.id;
        }
        console.log("  > SUCCESS: Found Google CourseWork ID:", courseWorkId);

        // --- Find the Google Submission ID for this student ---
        console.log("DEBUG: Step 5 - Finding Student's Google ID and Submission ID...");
        const studentEmail = selectedAssignment.student.email; // Make sure student object has email
        console.log("  > Student Email:", studentEmail);

        // const studentGoogleId = await studentGoogleId(googleToken, courseId, studentEmail);
        // if (!studentGoogleId) {
        //   console.error("Could not find Google ID for student");
        //   toast.error("Could not find Google ID for student.  Google sync failed.", { id: "google-sync", duration: 6000 });
        //   return;
        // }

        // console.log("  > Google ID:", studentGoogleId);

        console.log("  > Fetching Submission ID...");
        const submissionId = await getStudentSubmissions(googleToken, courseId, courseWorkId);
        if (!submissionId) {
          console.error("Could not find submission for student");
          toast.error("Could not find submission for student.  Google sync failed.", { id: "google-sync", duration: 6000 });
          return;
        }

        console.log("  > Google Submission ID:", submissionId);

        // --- Submit the grade to Google Classroom ---
        console.log("DEBUG: Step 6 - Submitting grade to Google...");
        console.log("  > googleToken:", googleToken);
        console.log("  > courseId:", courseId);
        console.log("  > courseWorkId:", courseWorkId);
        console.log("  > submissionId:", submissionId.data.studentSubmissions[0].id);
        console.log("  > score:", score);

        try {
          const gradeSubmissionResponse = await axios.patch(
            `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions/${submissionId.data.studentSubmissions[0].id}?updateMask=assignedGrade`,
            {
              assignedGrade: score,
            },
            {
              headers: {
                Authorization: `Bearer ${googleToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          const gradeSubmissionReturnResponse = await axios.post(
    `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions/${submissionId.data.studentSubmissions[0].id}:return`,
    {},
    {
      headers: { 
        Authorization: `Bearer ${googleToken}`,
        'Content-Type': 'application/json'
      },
    }
  ).catch(error => handleApiError(error, 'returnStudentSubmission'));
          console.log("  > Google Classroom API Response:", gradeSubmissionResponse.data); // Log the response data
          console.log("  > Google Classroom API Return Response:", gradeSubmissionReturnResponse.data); // Log the return response data
          console.log("  > SUCCESS! Grade submitted to Google Classroom.");
          toast.success("Grade synced with Google Classroom!", { id: "google-sync" });
        } catch (googleError: any) {
          console.error("  > Google Classroom API Error:", googleError); // Log the entire error object

          const errorMessage = googleError.response?.data?.error?.message || googleError.message;
          console.error("DEBUG: --- GOOGLE SYNC FAILED ---", { message: errorMessage, fullError: googleError });
          toast.error(`Google Sync Failed: ${errorMessage}`, { id: "google-sync", duration: 6000 });
          return;
        }
      } catch (googleError: any) {
        const errorMessage = googleError.response?.data?.error?.message || googleError.message;
        console.error("DEBUG: --- GOOGLE SYNC FAILED ---", { message: errorMessage, fullError: googleError });
        toast.error(`Google Sync Failed: ${errorMessage}`, { id: "google-sync", duration: 6000 });
        return; 
      }
    } else {
      console.log("DEBUG: Skipping Google Classroom sync. Conditions not met.");
    }

    // --- If Google Sync is successful (or not applicable), save to local server ---
    console.log("DEBUG: Step 7 - Proceeding to save grade to local server...");
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
        toast.success("Grades saved to our server!");
        setShowPopup(false);
        // You might want to refresh your data here to show the new grade
      } else {
        toast.error("Failed to save grades to our server.");
      }
    } catch (err) {
      toast.error("Error saving grades to our server.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[17%]">
        <Header />
        <div className="items-center  border-b border-gray-200 bg-white">
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
        {/* <div className="w-56 bg-white border-r border-gray-200 pt-8"></div> */}
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
      </div> {/* <-- This closes the .flex-1.flex.flex-col div */}
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
                        disabled={selectedAssignment.submission?.graded}
                      />
                    </div>
                  </div>
                );
              })}
            <div className="mt-6">
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
    </div>
  );
};

export default Reports;