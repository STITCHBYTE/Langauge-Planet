import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Home/Sidebar.tsx';
import Header from '../Home/Header.tsx';
import Server_url from '../../config.js';
import { useView } from '../../Context/ViewContext.tsx';
import { FiArrowLeft, FiUpload, FiPlay, FiDownload } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

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

const DiscussionSubmitPage: React.FC = () => {
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

  // Submission handler for a single assignment
  const handleAssignmentSubmit = async (assignment: Assignment, index: number) => {
    const token = localStorage.getItem('authToken');
    setSubmitting(true);

    try {
      // Prepare answers for this assignment
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

      toast.success(`Assignment "${assignment.title}" submitted!`);
      setSubmittedAssignments(prev => [...prev, assignment.id]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
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
      <Toaster position="bottom-center" />
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
    </div>
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