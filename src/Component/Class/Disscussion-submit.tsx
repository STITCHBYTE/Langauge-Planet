import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'; // Import Google Auth components
import Sidebar from '../Home/Sidebar.tsx';
import Header from '../Home/Header.tsx';
import Server_url, { client_id } from '../../config.js'; // Import client_id
import { useView } from '../../Context/ViewContext.tsx';
import { FiArrowLeft, FiUpload, FiPlay, FiDownload, FiLogIn } from 'react-icons/fi';
import {toast} from 'react-toastify';
import axios from 'axios'; // Import axios

interface DiscussionData {
  id: string;
  title: string;
  description: string;
  content?: string;
  due_date?: string;
  points?: number;
  file?: string; // Single file field from your API
  classroom?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  points: number;
  questions: Question[];
  google_course_id?: string; // The ID of the course in Google Classroom
  google_classroom_id?: string; // The ID of the assignment (CourseWork) in Google Classroom
}

interface Question {
  id: string;
  question_text: string;
  points: number;
  question_type: 'text' | 'file_upload' | 'multiple_choice';
  options?: string[];
}

interface Answer {
  question_id: string;
  answer_text?: string;
  file?: File;
}

// Move helper functions here
const getFileType = (url: string) => {
  if (!url) return null;
  
  const extension = url.split('.').pop()?.toLowerCase();
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  const pdfExtensions = ['pdf'];
  
  if (videoExtensions.includes(extension || '')) return 'video';
  if (imageExtensions.includes(extension || '')) return 'image';
  if (pdfExtensions.includes(extension || '')) return 'pdf';
  
  return 'unknown';
};

const getFileName = (url: string) => {
  if (!url) return 'File';
  return url.split('/').pop()?.split('.')[0] || 'File';
};

const getFileSize = (url: string) => {
  // You can implement actual file size detection if needed
  return 'Unknown size';
};

// --- Google Classroom API Helper ---
const handleGoogleApiError = (error: any, functionName: string) => {
  console.error(`Error in Google API function '${functionName}':`, error);
  const message = error.response?.data?.error?.message || 'An unknown Google Classroom API error occurred.';
  toast.error(`Google Classroom: ${message}`, { id: 'google-api-error' });
  throw new Error(message);
};

/**
 * Marks an assignment as "Turned In" using the Google API Client Library (gapi).
 * This is a different approach to avoid CORS issues with axios/fetch.
 */
export async function turnInGoogleClassroomAssignment(
  studentGoogleToken: string,
  courseId: string,
  courseWorkId: string
): Promise<any> {
  if (!studentGoogleToken) {
    throw new Error("Student's Google authentication token is missing.");
  }

  console.log('[DEBUG] Attempting to turn in assignment using GAPI library...');

  return new Promise((resolve, reject) => {
    const gapi = (window as any).gapi;

    if (!gapi) {
      const gapiError = new Error("Google API Client Library (gapi) is not loaded.");
      handleGoogleApiError(gapiError, 'gapi.load');
      return reject(gapiError);
    }

    gapi.load('client:auth2', () => {
      gapi.client.load('classroom', 'v1', () => {
        gapi.client.setToken({ access_token: studentGoogleToken });

        // Step 1: List submissions for this coursework
        gapi.client.classroom.courses.courseWork.studentSubmissions.list({
          courseId: courseId,
          courseWorkId: courseWorkId,
          userId: 'me'
        }).then(
          (listResponse: any) => {
            const submissions = listResponse.result.studentSubmissions;
            if (!submissions || submissions.length === 0) {
              const err = new Error("No submission found for this coursework.");
              handleGoogleApiError(err, 'studentSubmissions.list');
              return reject(err);
            }
            const submissionId = submissions[0].id;
            console.log('[DEBUG] Found submission:', submissionId);

            // Step 2: Turn in the submission
            gapi.client.classroom.courses.courseWork.studentSubmissions.turnIn({
              courseId: courseId,
              courseWorkId: courseWorkId,
              id: submissionId
            }).then(
              (turnInResponse: any) => {
                console.log('[DEBUG] GAPI Success: Turned in on Google Classroom.', turnInResponse);
                resolve(turnInResponse);
              },
              (turnInError: any) => {
                console.error('[DEBUG] GAPI Error (turnIn):', turnInError);
                handleGoogleApiError(turnInError, 'turnInGoogleClassroomAssignment');
                reject(turnInError);
              }
            );
          },
          (listError: any) => {
            console.error('[DEBUG] GAPI Error (list):', listError);
            handleGoogleApiError(listError, 'studentSubmissions.list');
            reject(listError);
          }
        );
      });
    });
  });
}


// Create a new component for the main page logic so we can use the hook inside the provider
const DiscussionSubmitContent: React.FC = () => {
  const { discussionId } = useParams<{ discussionId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useView();
  
  const [discussionData, setDiscussionData] = useState<DiscussionData | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedAssignments, setSubmittedAssignments] = useState<string[]>([]);
  
  // State for Google Login Modal
  const [showGoogleLoginModal, setShowGoogleLoginModal] = useState(false);
  const [pendingGoogleAssignment, setPendingGoogleAssignment] = useState<Assignment | null>(null);

  // --- REAL Google Login Handler ---
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('[DEBUG] Google Login Success:', tokenResponse);
      const accessToken = tokenResponse.access_token;
      localStorage.setItem('googleClassroomToken', accessToken);
      toast.success('Google Login Successful!', { id: 'google-login' });

      // NOW, resume the submission process for the pending assignment
      if (pendingGoogleAssignment) {
        // We call handleAssignmentSubmit which contains the full logic,
        // rather than proceeding directly. This is safer.
        await handleAssignmentSubmit(pendingGoogleAssignment, -1);
      }
      setShowGoogleLoginModal(false);
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
      toast.error('Google Login Failed. Please try again.', { id: 'google-login' });
      setShowGoogleLoginModal(false);
    },
    // This scope is correct. It allows reading courses and modifying submissions.
    scope: 'openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me',
  });

  const handleGoogleLogin = () => {
    console.log("Initiating Google Login...");
    toast.loading('Waiting for Google Login...', { id: 'google-login' });
    login(); // This will open the Google login popup
  };

  // --- NEW HELPER FUNCTION ---
  // This function tries to find the Google IDs on-the-fly.
  const findGoogleIdsAndCreateSubmission = async (assignment: Assignment, studentGoogleToken: string) => {
    // toast.loading('Finding assignment on Google Classroom...', { id: 'google-find' });
    
    try {
      // Step 1: Find the Google Course ID
      console.log('[DEBUG] Finding Google Course ID...');
      const coursesResponse = await axios.get('https://classroom.googleapis.com/v1/courses?studentId=me', {
        headers: { Authorization: `Bearer ${studentGoogleToken}` },
      });
      
      const matchingCourse = coursesResponse.data.courses?.find(
        (course: any) => course.section === discussionData?.classroom
      );

      if (!matchingCourse) {
        throw new Error("Please accept invite if accepted, then contact support");
      }
      const googleCourseId = matchingCourse.id;
      console.log(`[DEBUG] Found matching Google Course ID: ${googleCourseId}`);

      // Step 2: Find the Google CourseWork (Assignment) ID
      console.log('[DEBUG] Finding Google CourseWork ID...');
      const courseWorkResponse = await axios.get(`https://classroom.googleapis.com/v1/courses/${googleCourseId}/courseWork`, {
        headers: { Authorization: `Bearer ${studentGoogleToken}` },
      });

      const matchingCourseWork = courseWorkResponse.data.courseWork?.find(
        (work: any) => work.title === assignment.title
      );

      if (!matchingCourseWork) {
        throw new Error("Please accept invite if accepted, then contact support");
      }
      const googleClassroomId = matchingCourseWork.id;
      console.log(`[DEBUG] Found matching Google CourseWork ID: ${googleClassroomId}`);
      
      toast.success('Found assignment on Google Classroom!', { id: 'google-find' });

      // Step 3: Create a new assignment object with the found IDs and submit
      const googleReadyAssignment: Assignment = {
        ...assignment,
        google_course_id: googleCourseId,
        google_classroom_id: googleClassroomId,
      };

      await proceedWithSubmission(googleReadyAssignment);

    } catch (error) {
      console.error('[DEBUG] Failed to find Google IDs:', error);
      toast.error(error.message || 'Could not link to Google Classroom.', { id: 'google-find' });
      // Optionally, you could ask the user if they want to submit to your server anyway.
      // For now, we stop the process.
      setSubmitting(false);
    }
  };


  // This function will contain the actual submission logic
  const proceedWithSubmission = async (assignmentToSubmit: Assignment) => {
    console.log(`[DEBUG] --- Starting submission for: "${assignmentToSubmit.title}" ---`);
    const token = localStorage.getItem('authToken');
    const studentGoogleToken = localStorage.getItem('googleClassroomToken');
    setSubmitting(true);

    try {
      const isGoogleAssignment = assignmentToSubmit.google_course_id && assignmentToSubmit.google_classroom_id;
      
      console.log('[DEBUG] Assignment Data:', assignmentToSubmit);
      console.log('[DEBUG] Is this a Google Classroom assignment?', isGoogleAssignment);
      console.log('[DEBUG] Does the student have a Google token?', !!studentGoogleToken);

      // 1. Submit to Google Classroom FIRST if applicable
      if (isGoogleAssignment && studentGoogleToken) {
        console.log('[DEBUG] Conditions met. Attempting to submit to Google Classroom first.');
        toast.info('Turning in on Google Classroom...', { id: 'google-turn-in' });
        try {
          // The helper function now has its own logs
          await turnInGoogleClassroomAssignment(
            studentGoogleToken,
            assignmentToSubmit.google_course_id,
            assignmentToSubmit.google_classroom_id
          );
          toast.success('Turned in on Google Classroom!', { id: 'google-turn-in' });
        } catch (googleError) {
          console.error('[DEBUG] Submission to Google Classroom FAILED. Halting process.', googleError);
          // The handleGoogleApiError function will show a toast and throw an error.
          throw googleError;
        }
      } else {
        console.log('[DEBUG] Skipping Google Classroom submission. Conditions not met.');
      }
      
      // 2. Submit to Learning Planet Database
      console.log('[DEBUG] Proceeding with submission to Language Planet server.');
      toast.info('Submitting to Language Planet...', { id: 'lp-submit' });
      
      // Prepare answers payload
      const answersPayload = [];
      for (const question of assignmentToSubmit.questions || []) {
        const userAnswer = answers.find(answer => answer.question_id === question.id);
        if (userAnswer && (userAnswer.answer_text || userAnswer.file)) {
          if (question.question_type === 'file_upload' && userAnswer.file) {
            const base64File = await toBase64(userAnswer.file);
            answersPayload.push({ question: question.id, answer_file: base64File });
          } else if (userAnswer.answer_text) {
            answersPayload.push({ question: question.id, answer_text: userAnswer.answer_text });
          }
        }
      }

      const submissionBody = {
        assignment: assignmentToSubmit.id,
        answers: answersPayload,
      };

      console.log('[DEBUG] Payload for Language Planet server:', submissionBody);

      const response = await fetch(`${Server_url}/api/classrooms/assignment-submissions/create/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionBody),
      });

      const responseData = await response.json(); // Get JSON response regardless of status

      if (!response.ok) {
        console.error('[DEBUG] FAILED to submit to Language Planet server. Response:', responseData);
        throw new Error(responseData.detail || `Failed to submit assignment: ${assignmentToSubmit.title}`);
      }

      console.log('[DEBUG] Successfully submitted to Language Planet server. Response:', responseData);
      toast.success(`Submitted to Language Planet!`, { id: 'lp-submit' });
      setSubmittedAssignments(prev => [...prev, assignmentToSubmit.id]);

    } catch (err) {
      // This will catch errors from both Google and LP submissions.
      // Specific toasts are handled inside the try block or by the helper.
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
      setPendingGoogleAssignment(null);
    }
  };

  // This is the entry point when the user clicks the submit button
  const handleAssignmentSubmit = async (assignment: Assignment, index: number) => {
    const isGoogleAssignment = assignment.google_course_id && assignment.google_classroom_id;
    const studentGoogleToken = localStorage.getItem('googleClassroomToken');

    if (isGoogleAssignment) {
      // If IDs are already present, the logic is simple.
      if (!studentGoogleToken) {
        setPendingGoogleAssignment(assignment);
        setShowGoogleLoginModal(true); // Open modal for Google login if token is missing
        return; // Stop further processing until login is complete
      } else {
        await proceedWithSubmission(assignment);
      }
    } else {
      // --- MODIFIED LOGIC ---
      // If IDs are MISSING, we try to find them.
      console.log('[DEBUG] Google IDs missing. Attempting to find them on-the-fly.');
      if (!studentGoogleToken) {
        // We still need the user to log in first.
        setPendingGoogleAssignment(assignment);
        setShowGoogleLoginModal(true); // Open modal for Google login if token is missing
        return; // Stop further processing until login is complete
      } else {
        // User is logged in, so let's start the search.
        await findGoogleIdsAndCreateSubmission(assignment, studentGoogleToken);
      }
    }
  };

  // Function to resume submission after a successful login
  const resumeGoogleClassroomSubmit = async (token: string, assignment: Assignment) => {
    if (!assignment.google_course_id || !assignment.google_classroom_id) return;
    
    // After login, the main submission function handles the logic.
    // We just need to call it.
    await proceedWithSubmission(assignment);
  };

  useEffect(() => {
    if (!discussionId) return;
    
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      
      try {
        setLoading(true);
        
        // 1. Fetch discussion details
        const discussionResponse = await fetch(`${Server_url}/api/classrooms/discussions/${discussionId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!discussionResponse.ok) throw new Error('Failed to fetch discussion data');
        const discussionData = await discussionResponse.json();
        console.log("Fetched discussion data:", discussionData);
        setDiscussionData(discussionData);

        // 2. Fetch assignments associated with this discussion
        const assignmentsResponse = await fetch(`${Server_url}/api/classrooms/discussions/${discussionId}/assignments/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          console.log("Fetched assignments data:", assignmentsData);
          // Handle both array and paginated response
          const assignmentsList = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.results || [];
          setAssignments(assignmentsList);

          // Initialize answers array for all questions from all assignments
          const allQuestions = assignmentsList.flatMap((assignment: Assignment) => assignment.questions || []);
          setAnswers(allQuestions.map((q: Question) => ({
            question_id: q.id,
            answer_text: '',
            file: undefined
          })));
        }

        // Check for existing submissions to update the UI
        const submissionsResponse = await fetch(`${Server_url}/api/classrooms/discussion/${discussionId}/my-submissions/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (submissionsResponse.ok) {
            const submissionsData = await submissionsResponse.json();
            const submittedIds = submissionsData.map((sub: any) => sub.assignment);
            setSubmittedAssignments(submittedIds);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [discussionId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => 
      prev.map(answer => 
        answer.question_id === questionId 
          ? { ...answer, answer_text: value }
          : answer
      )
    );
  };

  const handleFileUpload = (questionId: string, file: File) => {
    setAnswers(prev => 
      prev.map(answer => 
        answer.question_id === questionId 
          ? { ...answer, file }
          : answer
      )
    );
  };

  // Helper to check if an assignment is unlocked
  const isAssignmentUnlocked = (index: number) => {
    if (index === 0) return true;
    // Previous assignment must be in submittedAssignments
    return assignments[index - 1] && submittedAssignments.includes(assignments[index - 1].id);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('authToken');
    setSubmitting(true);

    try {
      // Process each assignment as a separate submission
      for (const assignment of assignments) {
        
        const answersPayload = [];

        // Use a for...of loop to handle async operations inside
        for (const question of assignment.questions || []) {
          const userAnswer = answers.find(answer => answer.question_id === question.id);

          if (userAnswer && (userAnswer.answer_text || userAnswer.file)) {
            if (question.question_type === 'file_upload' && userAnswer.file) {
              // Convert the file to a Base64 string
              const base64File = await toBase64(userAnswer.file);
              answersPayload.push({
                question: question.id,
                answer_file: base64File // Send the Base64 string
              });
            } else if (userAnswer.answer_text) {
              answersPayload.push({
                question: question.id,
                answer_text: userAnswer.answer_text
              });
            }
          }
        }

        // Construct the final JSON body
        const submissionBody = {
          assignment: assignment.id,
          answers: answersPayload,
        };

        console.log(`Submitting JSON for assignment: ${assignment.id}`, submissionBody);

        // 3. Submit this assignment as raw JSON
        const response = await fetch(`${Server_url}/api/classrooms/assignment-submissions/create/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.detail || `Failed to submit assignment: ${assignment.title}`);
          throw new Error(errorData.detail || `Failed to submit assignment: ${assignment.title}`);
        }

        const responseData = await response.json();
        toast.success(`Assignment "${assignment.title}" submitted!`);
        console.log(`Assignment ${assignment.title} submitted successfully:`, responseData);
      }

      toast.success("All assignments submitted successfully!");
      navigate(-1);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      toast.error(err instanceof Error ? err.message : 'Submission failed');
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center ml-64">
            <div className="text-gray-500">Loading discussion...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center ml-64">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md fixed left-0 top-0 h-full">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header with breadcrumb */}
           

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Discussion Content */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    {discussionData?.title || 'Basic Spanish Culture'}
                  </h1>
                  
                  {/* Discussion Content */}
                  <div className="prose max-w-none mb-8">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {discussionData?.description || discussionData?.content || 
                       "Lorem ipsum dolor sit amet consectetur. Tincidunt faucibus ut tincidunt malesuada sed quam ac rhoncus. Nisl diam nibh lobortis scelerisque. Nunc sed porta arcu malesuada felis ut aliquam diam."}
                    </p>
                  </div>

                  {/* Media Section */}
                  <div className="flex space-x-4 mb-8">
                    {/* Video Player */}
                    {discussionData?.video_url && (
                      <div className="relative w-48 h-32 bg-gray-200 rounded-lg overflow-hidden">
                        <video 
                          src={discussionData.video_url}
                          className="w-full h-full object-cover"
                          poster="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face"
                        />
                        <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-opacity">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <FiPlay className="w-6 h-6 text-white ml-1" />
                          </div>
                        </button>
                      </div>
                    )}

                    {/* PDF Document */}
                    {discussionData?.pdf_url && (
                      <div className="relative w-48 h-32 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-2">
                          <span className="text-white font-bold text-xs">PDF</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 text-center px-2">
                          {discussionData.pdf_name || 'Name Goes Here'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {discussionData.pdf_size || '621KB'}
                        </p>
                        <a 
                          href={discussionData.pdf_url}
                          download
                          className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"
                        >
                          <FiDownload className="w-4 h-4 text-white" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Media Section - Only show if file exists */}
                  {discussionData?.file && (
                    <div className="flex space-x-4 mb-8">
                      {(() => {
                        const fileType = getFileType(discussionData.file);
                        const fileName = getFileName(discussionData.file);
                        const fileSize = getFileSize(discussionData.file);
                        
                        switch (fileType) {
                          case 'video':
                            return (
                              <div className="relative w-48 h-32 bg-gray-200 rounded-lg overflow-hidden">
                                <video 
                                  src={discussionData.file}
                                  className="w-full h-full object-cover"
                                  poster="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face"
                                />
                                <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-opacity">
                                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                    <FiPlay className="w-6 h-6 text-white ml-1" />
                                  </div>
                                </button>
                              </div>
                            );
                            
                          case 'image':
                            return (
                              <div className="relative w-[14rem] h-[15rem] bg-gray-200 rounded-lg overflow-hidden">
                                <img 
                                  src={discussionData.file}
                                  alt={fileName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/192x128/e5e7eb/6b7280?text=Image';
                                  }}
                                />
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 rounded px-2 py-1">
                                  <span className="text-white text-xs font-bold">IMG</span>
                                </div>
                              </div>
                            );
                            
                          case 'pdf':
                            return (
                              <div className="relative w-48 h-32 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-2">
                                  <span className="text-white font-bold text-xs">PDF</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 text-center px-2">
                                  {fileName}
                                </p>
                                <p className="text-xs text-gray-500">PDF Document</p>
                                <a 
                                  href={discussionData.file}
                                  download
                                  className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                                >
                                  <FiDownload className="w-4 h-4 text-white" />
                                </a>
                              </div>
                            );
                            
                          default:
                            return (
                              <div className="relative w-48 h-32 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mb-2">
                                  <span className="text-white font-bold text-xs">FILE</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 text-center px-2">
                                  {fileName}
                                </p>
                                <p className="text-xs text-gray-500">Document</p>
                                <a 
                                  href={discussionData.file}
                                  download
                                  className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                                >
                                  <FiDownload className="w-4 h-4 text-white" />
                                </a>
                              </div>
                            );
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Assignment Submission */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6">
                  {assignments.length > 0 ? (
                    assignments.map((assignment, assignmentIndex) => {
                      const unlocked = isAssignmentUnlocked(assignmentIndex);
                      const submitted = submittedAssignments.includes(assignment.id);
                      return (
                        <div key={assignment.id} className="mb-8 opacity-100">
                          <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Assignment: {assignment.title}
                          </h2>
                          <p className="text-sm text-gray-500 mb-6">
                            DUE BY: {assignment.due_date ? formatDueDate(assignment.due_date) : 'MON 17 MAR • 12:00PM'}
                          </p>
                          {assignment.questions?.map((question, questionIndex) => (
                            <div key={question.id} className="mb-6">
                              <div className={`bg-blue-50 rounded-lg p-4 mb-4 ${!unlocked || submitted ? 'opacity-50 pointer-events-none' : ''}`}>
                                <h3 className="text-blue-600 font-semibold mb-2">
                                  Question {questionIndex + 1}
                                </h3>
                                <p className="text-gray-700 text-sm mb-4">
                                  {question.question_text}
                                </p>
                                <div className="mb-4">
                                  <p className="text-xs text-gray-500 mb-2">
                                    {question.question_type === 'file_upload' ? 'UPLOAD ANSWER' : 'ENTER ANSWER'} ({question.points} Points)
                                  </p>
                                  {question.question_type === 'file_upload' ? (
                                    <label className="block cursor-pointer">
                                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                        <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-600 mb-1">Tap to Upload</p>
                                        <p className="text-xs text-gray-400">SVG, PNG, JPG, GIF | 10MB max.</p>
                                      </div>
                                      <input 
                                        type="file" 
                                        className="hidden" 
                                        accept=".svg,.png,.jpg,.jpeg,.gif,.pdf,.doc,.docx"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(question.id, e.target.files[0])}
                                        disabled={!unlocked || submitted}
                                      />
                                    </label>
                                  ) : (
                                    <textarea
                                      className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                      placeholder="Type your answer here..."
                                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                      disabled={!unlocked || submitted}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => handleAssignmentSubmit(assignment, assignmentIndex)}
                            disabled={!unlocked || submitted || submitting}
                            className={`w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2`}
                          >
                            {submitted ? 'Submitted' : submitting ? 'Submitting...' : 'Submit Assignment'}
                          </button>
                          {!unlocked && (
                            <div className="text-xs text-gray-400 mt-2 text-center">
                              Complete the previous assignment to unlock this one.
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div>No assignments found.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Login Modal */}
      {showGoogleLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Google Classroom Submission</h2>
            <p className="text-gray-600 mb-6">
              To turn in this assignment on Google Classroom, please log in with your Google account.
            </p>
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
            >
              <FiLogIn />
              Login with Google to Submit
            </button>
            <button
              onClick={() => {
                setShowGoogleLoginModal(false);
                setPendingGoogleAssignment(null);
                toast.info('You can submit to Google Classroom later.', { icon: 'ℹ️' });
              }}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// The main exported component will now just be the provider wrapper
const DiscussionSubmitPage: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={client_id}>
      <DiscussionSubmitContent />
    </GoogleOAuthProvider>
  );
};

// Helper for file to base64
async function toBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export default DiscussionSubmitPage;