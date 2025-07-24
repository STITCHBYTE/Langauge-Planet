import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import Sidebar from '../Home/Sidebar.tsx';
import Header from '../Home/Header.tsx';
import Server_url, { client_id } from '../../config.js';
import { useView } from '../../Context/ViewContext.tsx';
import { FiArrowLeft, FiUpload, FiPlay, FiDownload, FiLogIn, FiMessageCircle, FiUser, FiClock, FiSend } from 'react-icons/fi';
import {toast} from 'react-toastify';
import axios from 'axios';
import useTrackTime from "../../hooks/useTrackTime.ts";

interface DiscussionData {
  id: string;
  title: string;
  description: string;
  content?: string;
  due_date?: string;
  points?: number;
  file?: string;
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
  google_course_id?: string;
  google_classroom_id?: string;
}

interface Question {
  id: string;
  question_text: string;
  points: number;
  answer_type: 'TEXT' | 'FILE' | 'MULTIPLE_CHOICE';
  options?: string[];
}

interface Answer {
  question_id: string;
  answer_text?: string;
  file?: File;
}
interface Reply {
  id: number;
  thread: number;
  parent: number | null;
  author: { username: string };
  message: string;
  created_at: string;
}

interface Thread {
  id: number;
  classroom: string;
  author: { username: string };
  title: string;
  message: string;
  created_at: string;
  replies: Reply[];
}
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
  return 'Unknown size';
};
const handleGoogleApiError = (error: any, functionName: string) => {
  const message = error.response?.data?.error?.message || 'An unknown Google Classroom API error occurred.';
  toast.error(`Google Classroom: ${message}`, { id: 'google-api-error' });
  throw new Error(message);
};

export async function turnInGoogleClassroomAssignment(
  studentGoogleToken: string,
  courseId: string,
  courseWorkId: string
): Promise<any> {
  if (!studentGoogleToken) {
    throw new Error("Student's Google authentication token is missing.");
  }

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
            gapi.client.classroom.courses.courseWork.studentSubmissions.turnIn({
              courseId: courseId,
              courseWorkId: courseWorkId,
              id: submissionId
            }).then(
              (turnInResponse: any) => {
                resolve(turnInResponse);
              },
              (turnInError: any) => {
                handleGoogleApiError(turnInError, 'turnInGoogleClassroomAssignment');
                reject(turnInError);
              }
            );
          },
          (listError: any) => {
            handleGoogleApiError(listError, 'studentSubmissions.list');
            reject(listError);
          }
        );
      });
    });
  });
}

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
  const [threads, setThreads] = useState<Thread[]>([]);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [showGoogleLoginModal, setShowGoogleLoginModal] = useState(false);
  const [pendingGoogleAssignment, setPendingGoogleAssignment] = useState<Assignment | null>(null);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!discussionId) {
        setError("Discussion ID is missing.");
        setLoading(false);
        return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const discussionResponse = await fetch(`${Server_url}/api/classrooms/discussions/${discussionId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!discussionResponse.ok) throw new Error('Failed to fetch discussion data');
      const discussionData = await discussionResponse.json();
      setDiscussionData(discussionData);
      const assignmentsResponse = await fetch(`${Server_url}/api/classrooms/discussions/${discussionId}/assignments/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        const assignmentsList = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.results || [];
        setAssignments(assignmentsList);

        const allQuestions = assignmentsList.flatMap((assignment: Assignment) => assignment.questions || []);
        setAnswers(allQuestions.map((q: Question) => ({
          question_id: q.id,
          answer_text: '',
          file: undefined
        })));
      }

      const threadsRes = await fetch(`${Server_url}/api/forums/discussion/${discussionId}/threads/`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (threadsRes.status === 404) {
          setThreads([]);
      } else if (threadsRes.ok) {
          const threadsData = await threadsRes.json();
          const threadsWithReplies = await Promise.all(threadsData.map(async (thread: Thread) => {
              const repliesRes = await fetch(`${Server_url}/api/forums/thread/${thread.id}/replies/`, {
                   headers: { 'Authorization': `Bearer ${token}` }
              });
              const repliesData = repliesRes.ok ? await repliesRes.json() : [];
              return { ...thread, replies: repliesData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) };
          }));
          setThreads(threadsWithReplies);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [discussionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;
      localStorage.setItem('googleClassroomToken', accessToken);
      toast.success('Google Login Successful!', { id: 'google-login' });

      if (pendingGoogleAssignment) {
        await handleAssignmentSubmit(pendingGoogleAssignment, -1);
      }
      setShowGoogleLoginModal(false);
    },
    onError: (error) => {
      toast.error('Google Login Failed. Please try again.', { id: 'google-login' });
      setShowGoogleLoginModal(false);
    },
    scope: 'openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me',
  });

  const handleGoogleLogin = () => {
    toast.loading('Waiting for Google Login...', { id: 'google-login' });
    login();
  };

  const findGoogleIdsAndCreateSubmission = async (assignment: Assignment, studentGoogleToken: string) => {
    try {
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
      
      toast.success('Found assignment on Google Classroom!', { id: 'google-find' });
      const googleReadyAssignment: Assignment = {
        ...assignment,
        google_course_id: googleCourseId,
        google_classroom_id: googleClassroomId,
      };

      await proceedWithSubmission(googleReadyAssignment);

    } catch (error) {
      toast.error(error.message || 'Could not link to Google Classroom.', { id: 'google-find' });
      setSubmitting(false);
    }
  };
  const proceedWithSubmission = async (assignmentToSubmit: Assignment, skipGoogle: boolean = false) => {
    const token = localStorage.getItem('authToken');
    const studentGoogleToken = localStorage.getItem('googleClassroomToken');
    setSubmitting(true);

    try {
      const isGoogleAssignment = assignmentToSubmit.google_course_id && assignmentToSubmit.google_classroom_id;
      if (isGoogleAssignment && studentGoogleToken && !skipGoogle) {
        toast.info('Turning in on Google Classroom...', { id: 'google-turn-in' });
        try {
          await turnInGoogleClassroomAssignment(
            studentGoogleToken,
            assignmentToSubmit.google_course_id,
            assignmentToSubmit.google_classroom_id
          );
          toast.success('Turned in on Google Classroom!', { id: 'google-turn-in' });
        } catch (googleError) {
          throw googleError;
        }
      } else {
      }
      toast.info('Submitting to Language Planet...', { id: 'lp-submit' });
      
      const formData = new FormData();
      formData.append('assignment', assignmentToSubmit.id);
      const answersPayload = [];

      for (const question of assignmentToSubmit.questions || []) {
        const userAnswer = answers.find(answer => answer.question_id === question.id);
        if (!userAnswer) continue;

        if (question.answer_type === 'FILE' && userAnswer.file) {
          const fileFieldName = `answer_file_${question.id}`;
          formData.append(fileFieldName, userAnswer.file);
          answersPayload.push({
            question: question.id,
            answer_file: fileFieldName,
          });
        } else if (question.answer_type === 'TEXT' && userAnswer.answer_text) {
          answersPayload.push({
            question: question.id,
            answer_text: userAnswer.answer_text,
          });
        }
      }
      if (answersPayload.length > 0) {
        formData.append('answers', JSON.stringify(answersPayload));
      }

      // Add the skip flag to the payload if true
      if (skipGoogle) {
        formData.append('google_submission_skipped', 'true');
      }
      // Log formData entries for debugging
      for (let [key, value] of formData.entries()) {
      }

      const response = await fetch(`${Server_url}/api/classrooms/assignment-submissions/create/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.detail || `Failed to submit assignment: ${assignmentToSubmit.title}`);
      }
      toast.success(`Assignment "${assignmentToSubmit.title}" submitted!`, { id: 'lp-submit' });
      const newSubmitted = [...submittedAssignments, assignmentToSubmit.id];
      setSubmittedAssignments(newSubmitted);

      if (assignments.every(a => newSubmitted.includes(a.id))) {
        toast.success("All assignments submitted! Redirecting back to class.", {
          autoClose: 2000,
          onClose: () => {
            if (discussionData?.classroom) {
              navigate(`/classes/${discussionData.classroom}/students`);
            } else {
              navigate(-1);
            }
          }
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
      setPendingGoogleAssignment(null);
    }
  };
  const handleAssignmentSubmit = async (assignment: Assignment, index: number) => {
    const isGoogleAssignment = assignment.google_course_id && assignment.google_classroom_id;
    const studentGoogleToken = localStorage.getItem('googleClassroomToken');

    if (isGoogleAssignment) {
      if (!studentGoogleToken) {
        setPendingGoogleAssignment(assignment);
        setShowGoogleLoginModal(true);
        return;
      } else {
        await proceedWithSubmission(assignment);
      }
    } else {
      if (!studentGoogleToken) {
        setPendingGoogleAssignment(assignment);
        setShowGoogleLoginModal(true);
        return;
      } else {
        await findGoogleIdsAndCreateSubmission(assignment, studentGoogleToken);
      }
    }
  };
  const handleSkipAndSubmit = async () => {
    if (pendingGoogleAssignment) {
      console.log('[DEBUG] User chose to skip Google Classroom submission.');
      setShowGoogleLoginModal(false);
      await proceedWithSubmission(pendingGoogleAssignment, true);
    }
  };
  const resumeGoogleClassroomSubmit = async (token: string, assignment: Assignment) => {
    if (!assignment.google_course_id || !assignment.google_classroom_id) return;
    await proceedWithSubmission(assignment);
  };

  useEffect(() => {
    if (!discussionId) return;
    
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      
      try {
        setLoading(true);
        const discussionResponse = await fetch(`${Server_url}/api/classrooms/discussions/${discussionId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!discussionResponse.ok) throw new Error('Failed to fetch discussion data');
        const discussionData = await discussionResponse.json();
        setDiscussionData(discussionData);
        const assignmentsResponse = await fetch(`${Server_url}/api/classrooms/discussions/${discussionId}/assignments/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          const assignmentsList = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.results || [];
          setAssignments(assignmentsList);
          const allQuestions = assignmentsList.flatMap((assignment: Assignment) => assignment.questions || []);
          setAnswers(allQuestions.map((q: Question) => ({
            question_id: q.id,
            answer_text: '',
            file: undefined
          })));
        }
        const threadsRes = await fetch(`${Server_url}/api/forums/discussion/${discussionId}/threads/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (threadsRes.status === 404) {
            setThreads([]);
        } else if (threadsRes.ok) {
            const threadsData = await threadsRes.json();
            const threadsWithReplies = await Promise.all(threadsData.map(async (thread: Thread) => {
                const repliesRes = await fetch(`${Server_url}/api/forums/thread/${thread.id}/replies/`, {
                     headers: { 'Authorization': `Bearer ${token}` }
              });
              const repliesData = repliesRes.ok ? await repliesRes.json() : [];
              return { ...thread, replies: repliesData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) };
            }));
            setThreads(threadsWithReplies);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [discussionId]);
  const handleCreateReply = async (e: FormEvent) => {
    e.preventDefault();
    const mainThread = threads[0];
    if (!newReplyContent.trim() || !mainThread) return;
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(`${Server_url}/api/forums/thread/reply/`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              thread: mainThread.id,
              message: newReplyContent 
            })
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to post reply.');
        }
        await fetchData();
        setNewReplyContent('');
        toast.success("Reply posted!");
    } catch (err: any) {
        toast.error(err.message);
    }
  };
  useTrackTime({
    activityType: "class",
    activityId: discussionId,
    userId: currentUser?.id
  });

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
  const isAssignmentUnlocked = (index: number) => {
    if (index === 0) return true;
    return assignments[index - 1] && submittedAssignments.includes(assignments[index - 1].id);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('authToken');
    setSubmitting(true);

    try {
      for (const assignment of assignments) {
        const answersPayload = [];
        for (const question of assignment.questions || []) {
          const userAnswer = answers.find(answer => answer.question_id === question.id);

          if (userAnswer && (userAnswer.answer_text || userAnswer.file)) {
            if (question.question_type === 'file_upload' && userAnswer.file) {
              const base64File = await toBase64(userAnswer.file);
              answersPayload.push({
                question: question.id,
                answer_file: base64File
              });
            } else if (userAnswer.answer_text) {
              answersPayload.push({
                question: question.id,
                answer_text: userAnswer.answer_text
              });
            }
          }
        }
        const submissionBody = {
          assignment: assignment.id,
          answers: answersPayload,
        };
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
      }

      toast.success("All assignments submitted successfully!");
      navigate(-1);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      toast.error(err instanceof Error ? err.message : 'Submission failed');
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
        <div className="w-64 bg-white shadow-md fixed left-0 top-0 h-full">
          <Sidebar />
        </div>
        <div className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    {discussionData?.title || 'Basic Spanish Culture'}
                  </h1>
                  <div className="prose max-w-none mb-8">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {discussionData?.description || discussionData?.content || 
                       "Lorem ipsum dolor sit amet consectetur. Tincidunt faucibus ut tincidunt malesuada sed quam ac rhoncus. Nisl diam nibh lobortis scelerisque. Nunc sed porta arcu malesuada felis ut aliquam diam."}
                    </p>
                  </div>
                  <div className="flex space-x-4 mb-8">
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
                          {assignment.questions?.map((question, questionIndex) => {
                            const currentAnswer = answers.find(a => a.question_id === question.id);
                            return (
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
                                      {question.answer_type === 'FILE' ? 'UPLOAD ANSWER' : 'ENTER ANSWER'} ({question.points} Points)
                                    </p>
                                    {question.answer_type === 'FILE' ? (
                                      <label className="block cursor-pointer">
                                        {currentAnswer?.file ? (
                                          <div className="border-2 border-dashed border-green-400 bg-green-50 rounded-lg p-6 text-center">
                                            <FiUpload className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-green-700 mb-1">File Ready for Upload</p>
                                            <p className="text-xs text-gray-500 truncate" title={currentAnswer.file.name}>
                                              {currentAnswer.file.name}
                                            </p>
                                          </div>
                                        ) : (
                                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                            <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-gray-600 mb-1">Tap to Upload</p>
                                            <p className="text-xs text-gray-400">SVG, PNG, JPG, GIF | 10MB max.</p>
                                          </div>
                                        )}
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
                            );
                          })}
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
            <div className="mt-8">
              {threads.length > 0 && (
                <DiscussionForumView 
                  thread={threads[0]}
                  replyContent={newReplyContent}
                  onReplyChange={setNewReplyContent}
                  onReplySubmit={handleCreateReply}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {showGoogleLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Google Classroom Submission</h2>
            <p className="text-gray-600 mb-6">
              To turn in this assignment on Google Classroom, please log in. You can also skip this step and submit only to Language Planet.
            </p>
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
            >
              <FiLogIn />
              Login with Google to Submit
            </button>
            <button
              onClick={handleSkipAndSubmit}
              className="w-full mt-3 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Skip & Submit to Language Planet
            </button>
            <button
              onClick={() => {
                setShowGoogleLoginModal(false);
                setPendingGoogleAssignment(null);
                toast.dismiss('google-login');
              }}
              className="w-full mt-4 text-sm text-gray-500 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
interface DiscussionForumViewProps {
  thread: Thread;
  replyContent: string;
  onReplyChange: (value: string) => void;
  onReplySubmit: (e: FormEvent) => void;
}

const DiscussionForumView: React.FC<DiscussionForumViewProps> = ({ thread, replyContent, onReplyChange, onReplySubmit }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {(thread.author?.username ?? 'A').charAt(0).toUpperCase()}
        </div>
        <div className="ml-3">
          <p className="text-sm font-semibold text-gray-800">{thread.author?.username ?? 'Anonymous'}</p>
          <p className="text-xs text-gray-500">
            {new Date(thread.created_at).toLocaleString('en-US', { 
              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', 
              hour: '2-digit', minute: '2-digit', hour12: true 
            })}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">{thread.title}</h3>
      <p className="text-gray-700 mb-4">{thread.message}</p>
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Replies ({thread.replies.length})</h4>
        {thread.replies.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No replies yet. Be the first to reply!</p>
        ) : (
          <div className="space-y-4">
            {thread.replies.map(reply => (
              <div key={reply.id} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {(reply.author?.username ?? 'A').charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{reply.author?.username ?? 'Anonymous'}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(reply.created_at).toLocaleString('en-US', { 
                      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', 
                      hour: '2-digit', minute: '2-digit', hour12: true 
                    })}
                  </p>
                  <p className="text-gray-700 mt-1">{reply.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Leave a Reply</h4>
        <form onSubmit={onReplySubmit} className="flex flex-col">
          <textarea
            value={replyContent}
            onChange={(e) => onReplyChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-2"
            placeholder="Type your reply here..."
            rows={3}
          />
          <button
            type="submit"
            className="self-end bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Post Reply
          </button>
        </form>
      </div>
    </div>
  );
};
const DiscussionSubmitPage: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={client_id}>
      <DiscussionSubmitContent />
    </GoogleOAuthProvider>
  );
};

export default DiscussionSubmitPage;