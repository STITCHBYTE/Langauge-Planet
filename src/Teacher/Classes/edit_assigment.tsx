import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import hooks
import {
  ChevronDown,
  Calendar,
  UploadCloud,
  Plus,
  Trash2,
  Edit,
  Check,
  AlertCircle,
} from 'lucide-react';
import Header from '../../Component/Home/Header.tsx';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Server_url from '../../config';          

interface Discussion {
  id: number;
  title: string;
}

// This interface now represents the User object directly from the API
interface Student {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

// QuestionDisplayCard component remains the same
const QuestionDisplayCard = ({ question, index, onEdit, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
          Question {index + 1}
        </span>
        <span className="text-sm font-medium text-gray-600">{question.points} Points</span>
      </div>
      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{question.text || "No question text saved."}</p>
      
      {question.answer_type === 'FILE' && (
        <>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Required Answer: File Upload
          </p>
          <div className="mt-2 flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-slate-50">
            <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
            <span className="block text-sm font-medium text-gray-600">Student will upload a file</span>
          </div>
        </>
      )}
      {question.answer_type === 'TEXT' && (
        <>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Required Answer: Text
            </p>
            <div className="mt-2 w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-slate-50">
                <p className="text-sm text-gray-400">Student will type their answer here.</p>
            </div>
        </>
      )}

      <div className="mt-4 flex items-center justify-end space-x-3">
        <button
          onClick={() => onDelete(question.id)}
          className="flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </button>
        <button
          onClick={() => onEdit(question.id)}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" /> Edit
        </button>
      </div>
    </div>
  );
};

// QuestionEditForm component remains the same, with one small change for 'answer_type'
const QuestionEditForm = ({ question, index, onSave, onFormChange, onDelete }) => {
    return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-md transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <span className="inline-block bg-white text-blue-600 text-sm font-medium px-3 py-1 rounded-md">
          Editing Question {index + 1}
        </span>
         <button
          onClick={() => onDelete(question.id)}
          className="text-sm font-medium text-red-600 hover:text-red-800"
          title="Delete this question"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Question<span className="text-red-500">*</span>
        </label>
        <textarea
          value={question.text}
          onChange={(e) => onFormChange(question.id, 'text', e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          rows={4}
          placeholder="e.g., What is the main theme of the assigned reading?"
        />
        <p className="text-xs text-gray-500 mt-1">{question.text.split(/\s+/).filter(Boolean).length} Words</p>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Mode of Answer<span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <select
            value={question.answer_type}
            onChange={(e) => onFormChange(question.id, 'answer_type', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="FILE">Upload a File</option>
            <option value="TEXT">Text Answer</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Points Allocated<span className="text-red-500">*</span>
        </label>
        <input
            type="number"
            value={question.points}
            onChange={(e) => onFormChange(question.id, 'points', parseInt(e.target.value, 10) || 0)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            min="0"
            max="100"
        />
         <p className="text-xs text-gray-500 mt-1">Max. of 100 points</p>
      </div>

      <div className="mt-6 flex items-center justify-end">
        <button
          onClick={() => onSave(question.id)}
          className="flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Question <Check className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};


// Main Page Component
const EditAssignmentPage = () => {
  const { classroomId } = useParams(); // Get classroomId from URL
  const navigate = useNavigate(); // For redirecting after success

  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // New state for description
  const [discussionId, setDiscussionId] = useState('');
  const [assignedStudents, setAssignedStudents] = useState<string[]>([]); // Will hold selected student IDs
  const [dueDate, setDueDate] = useState(''); // Using simple string for date input

  const [questions, setQuestions] = useState([]);
  const [discussionOptions, setDiscussionOptions] = useState<Discussion[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]); // Use the new Student interface
  const [classData, setClassData] = useState(null); // NEW: To hold class details
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const questionsEndRef = useRef(null);

  // --- New derived state and handlers for student selection ---
  const isAllStudentsSelected = enrolledStudents.length > 0 && assignedStudents.length === enrolledStudents.length;

  const handleToggleStudent = (studentId: string) => {
    setAssignedStudents(prev => {
      const isSelected = prev.includes(studentId);
      if (isSelected) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleToggleAllStudents = () => {
    if (isAllStudentsSelected) {
      setAssignedStudents([]); // Deselect all
    } else {
      setAssignedStudents(enrolledStudents.map(s => s.id)); // Select all
    }
  };
  // --- End of new handlers ---

  // Scroll to new question form
  const scrollToBottom = () => {
    questionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if(questions.some(q => q.isEditing)) {
      scrollToBottom();
    }
  }, [questions.length]);

  // Fetch discussions and students from the backend
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
    }

    // NEW: Fetch class data to get google_classroom_id
    const fetchClassData = async () => {
      try {
        const response = await fetch(`${Server_url}/api/classrooms/classroom/${classroomId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch class details');
        const data = await response.json();
        console.log('Fetched class data:', data);
        setClassData(data);
      } catch (error) {
        console.error('Error fetching class data:', error);
        setError('Could not load class details.');
      }
    };

    const fetchDiscussions = async () => {
      try {
        const response = await fetch(`${Server_url}/api/classrooms/classroom/${classroomId}/discussions/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch discussions');
        const data = await response.json();
        console.log('Fetched discussions:', data);
        setDiscussionOptions(data);
      } catch (error) {
        console.error('Error fetching discussions:', error);
        setError('Could not load discussion options.');
      }
    };

    const fetchEnrolledStudents = async () => {
      try {
        // Fetch students with an 'enrolled' status for this classroom
        const response = await fetch(`${Server_url}/api/classrooms/classroom/${classroomId}/enrolled-students/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch enrolled students');
        const data = await response.json();
        console.log('Fetched enrolled students raw data:', data);
        
        // Normalize the data to handle different API response structures
        const studentList = (data.results || data).map(item => item.student || item);

        setEnrolledStudents(studentList); 
      } catch (error) {
          console.error('Error fetching students:', error);
          setError(prev => prev + ' Could not load student list.');
      }
    };

    fetchClassData(); // Call the new function
    fetchDiscussions();
    fetchEnrolledStudents();
  }, [classroomId]);

  const handleAddQuestion = () => {
    if (questions.some(q => q.isEditing)) {
        alert("Please save the currently editing question before adding a new one.");
        return;
    }
    const newQuestion = {
        id: Date.now(), // Temporary frontend ID
        text: '',
        points: 5,
        answer_type: 'FILE', // Use 'answer_type' to match backend
        isEditing: true,
    };
    setQuestions([...questions, newQuestion]);
  };
  
  const handleQuestionFormChange = (id, fieldName, value) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, [fieldName]: value } : q)));
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
        setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  const handleSaveQuestion = (id) => {
    const questionToSave = questions.find(q => q.id === id);
    if (!questionToSave?.text?.trim()) {
        alert("Question text cannot be empty.");
        return;
    }
    if (questionToSave.points <= 0) {
        alert("Points must be greater than zero.");
        return;
    }
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, isEditing: false } : q)));
  };

  const handleEditQuestion = (id) => {
    if (questions.some(q => q.isEditing)) {
        alert("Please save the currently editing question first.");
        return;
    }
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, isEditing: true } : q)));
  };
  
  // Main function to save the entire assignment
  const handleSaveAssignment = async () => {
    setError('');
    // 1. Validate all inputs
    if (!title.trim() || !description.trim() || !discussionId) {
        setError("Please fill out all required fields: Title, Description, and Discussion.");
        return;
    }
    if (questions.some(q => q.isEditing)) {
        setError("You have an unsaved question. Please save all questions first.");
        return;
    }
    if (questions.length === 0) {
        setError("Please add at least one question to the assignment.");
        return;
    }
    
    setIsSubmitting(true);
    
    try {
        const token = localStorage.getItem('authToken');
        
        // 2. Prepare the single, nested payload
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
        
        // Map the questions from the state to the required payload format
        const questionsPayload = questions.map(q => ({
            question_text: q.text,
            points: q.points,
            answer_type: q.answer_type,
        }));

        const submissionPayload = {
            classroom: classroomId,
            title: title,
            description: description,
            discussion: discussionId,
            assigned_students: assignedStudents,
            due_date: dueDate || null,
            points: totalPoints,
            questions: questionsPayload, // Nest the questions array
        };

        console.log("Submitting payload:", JSON.stringify(submissionPayload, null, 2));

        // 3. Make a SINGLE API call to create the assignment and its questions
        const response = await fetch(`${Server_url}/api/classrooms/assignments/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(submissionPayload),
        });

        if (!response.ok) {
            const errData = await response.json();
            const errorMessage = errData.detail || (typeof errData === 'object' ? JSON.stringify(errData) : 'Failed to save assignment.');
            throw new Error(errorMessage);
        }
        
        // 4. Success!
        alert("Assignment saved to Language Planet!");

        // 5. Google Classroom Integration
        const google_token = localStorage.getItem('google_access_token');
        let googleClassroomId = classData?.google_classroom_id;

        // If we don't have a Google Classroom ID, try to find it by matching.
        if (!googleClassroomId && classData) {
            console.log("google_classroom_id not found in classData. Attempting to find it by matching...");
            if (google_token) {
              try {
                const coursesResponse = await fetch('https://classroom.googleapis.com/v1/courses', {
                  headers: {
                    'Authorization': `Bearer ${google_token}`,
                  },
                });
    
                if (coursesResponse.status === 401) {
                    // Handle expired token: You would ideally call your backend to refresh the token.
                    // For now, we will just alert the user. A real implementation
                    // would get a new token and retry the request.
                    throw new Error("Google token has expired. Please re-authenticate with Google.");
                }

                if (coursesResponse.ok) {
                  const coursesData = await coursesResponse.json();
                    console.log('Fetched Google Classroom courses:', coursesData);
                  // Match using the 'section' field which should store your app's class ID
                  const matchingCourse = coursesData.courses?.find(course => course.section === classData.id || course.section === classData._id);
                  
                  if (matchingCourse) {
                    console.log(`Found matching Google Classroom course: ${matchingCourse.name} (ID: ${matchingCourse.id})`);
                    googleClassroomId = matchingCourse.id;
                    // TODO: You should consider saving this matched ID to your backend
                    // to avoid looking it up every time.
                  } else {
                    console.warn(`No Google Classroom course found with a matching section ID: "${classData.id || classData._id}"`);
                  }
                }
              } catch (error) {
                console.error("Error fetching or matching Google Classroom courses:", error);
              }
            }
        }

        if (google_token && googleClassroomId) {
            console.log("Creating assignment in Google Classroom...");
            try {
                const gcPayload: any = { // Use 'any' to dynamically build the payload
                    title: title,
                    description: description,
                    workType: 'ASSIGNMENT',
                    state: 'PUBLISHED',
                    maxPoints: totalPoints,
                    // assigneeMode: assignedStudents.length > 0 ? 'INDIVIDUAL_STUDENTS' : 'ALL_STUDENTS',
                };

                // More robust due date handling
                if (dueDate) {
                    const date = new Date(dueDate);
                    // Check if the date is valid before adding it to the payload
                    if (!isNaN(date.getTime())) {
                        gcPayload.dueDate = {
                            year: date.getFullYear(),
                            month: date.getMonth() + 1,
                            day: date.getDate(),
                        };
                        gcPayload.dueTime = {
                            hours: date.getUTCHours(),
                            minutes: date.getUTCMinutes(),
                        };
                    } else {
                        console.warn("Invalid due date provided, skipping for Google Classroom.");
                    }
                }

                if (gcPayload.assigneeMode === 'INDIVIDUAL_STUDENTS') {
                    const studentEmails = assignedStudents
                        .map(id => enrolledStudents.find(s => s.id === id)?.email)
                        .filter(Boolean); // Filter out any null/undefined emails
                    
                    // Only add if we have valid student emails
                    if (studentEmails.length > 0) {
                        // DEBUG: Only sending the first selected student for testing
                        const firstStudentEmail = studentEmails[0];
                        console.log(`DEBUG: Assigning to the first selected student only: ${firstStudentEmail}`);
                        gcPayload.individualStudentsOptions = { studentIds: [firstStudentEmail] };
                    } else {
                        // If no valid emails found, assign to all students to avoid an error
                        console.warn("No matching student emails found for individual assignment. Assigning to all students in Google Classroom.");
                        gcPayload.assigneeMode = 'ALL_STUDENTS';
                    }
                }

                console.log("Submitting to Google Classroom:", JSON.stringify(gcPayload, null, 2));

                const gcResponse = await fetch(`https://classroom.googleapis.com/v1/courses/${googleClassroomId}/courseWork`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${google_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(gcPayload),
                });

                if (!gcResponse.ok) {
                    const gcError = await gcResponse.json();
                    console.error("Google Classroom API Error:", gcError);
                    
                    // Provide a more specific error message for this common issue
                    if (gcError.error?.status === 'FAILED_PRECONDITION') {
                        alert(`Assignment saved to Language Planet, but failed to post to Google Classroom. Error: One or more selected students are not enrolled in the Google Classroom course. Please check the student list in Google Classroom.`);
                    } else {
                        alert(`Assignment saved to Language Planet, but failed to post to Google Classroom: ${gcError.error.message}`);
                    }
                } else {
                    alert("Assignment also posted successfully to Google Classroom!");
                }
            } catch (gcError) {
                console.error("Error posting to Google Classroom:", gcError);
                alert(`Assignment saved to Language Planet, but an error occurred while posting to Google Classroom.`);
            }
        } else {
            console.log("Skipping Google Classroom post: No token or google_classroom_id found/matched.");
        }

        navigate(`/Class_info_Page/${classroomId}`);

    } catch (error) {
        console.error("Error saving assignment:", error);
        setError(error.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 lg:ml-[17%]">
      {/* Header */}
      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="hidden lg:block bg-white shadow-md">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <header>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Assignment</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">For Classroom ID: {classroomId}</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
              {/* Assignment Details */}
              <div className="md:col-span-1 lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Assignment General Details</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Fill out the general details for this assignment.</p>

                <form className="mt-6 space-y-6">
                  {/* Assignment Title */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Assignment Title<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                    />
                  </div>

                  {/* Assignment Description */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                    />
                  </div>

                  {/* Discussion Assigned */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Discussion Assigned<span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <select
                        value={discussionId}
                        onChange={(e) => setDiscussionId(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Discussion</option>
                        {discussionOptions.map((d) => (
                          <option key={d.id} value={d.id}>{d.title}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Due Date <span className="text-gray-500">(optional)</span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm"
                      />
                      <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Assign to Students
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Select students to assign this to. Leave blank to assign to the whole class.</p>
                    <div className="mt-2 p-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto flex flex-wrap gap-2 bg-slate-50">
                      {enrolledStudents.length === 0 ? (
                        <span className="text-sm text-gray-500 px-2 py-1">Loading or no students enrolled...</span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleToggleAllStudents}
                            className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors ${
                              isAllStudentsSelected
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            All Students
                          </button>
                          {enrolledStudents
                            .filter(student => student && student.id)
                            .map((student) => (
                            <button
                              key={student.id}
                              type="button"
                              onClick={() => handleToggleStudent(student.id)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${
                                assignedStudents.includes(student.id)
                                  ? 'bg-blue-100 text-blue-800 border-blue-500' // This is the "blue line" style
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {student.username || student.email}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </form>
              </div>
              {/* Questions Section */}
              <div className="lg:col-span-1 flex flex-col">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Questions</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Questions will appear to your students in this order.</p>
                <div className="mt-6 space-y-4 flex-grow overflow-y-auto pr-2" style={{ maxHeight: 'calc(2.5 * 18rem)'}}> 
                  {questions.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-300 rounded-lg h-48">
                        <p className="text-gray-500 font-medium">No questions yet.</p>
                        <p className="text-xs sm:text-sm text-gray-400">Click "Add Another Question" to get started.</p>
                    </div>
                  )}
                  {questions.map((q, idx) => (
                    q.isEditing ? (
                        <QuestionEditForm
                            key={q.id} question={q} index={idx} onSave={handleSaveQuestion}
                            onFormChange={handleQuestionFormChange} onDelete={handleDeleteQuestion}
                        />
                    ) : (
                        <QuestionDisplayCard
                            key={q.id} question={q} index={idx} onEdit={handleEditQuestion}
                            onDelete={handleDeleteQuestion}
                        />
                    )
                  ))}
                    <div ref={questionsEndRef} />
                </div>

                <button
                  onClick={handleAddQuestion}
                  className="w-full mt-4 flex items-center justify-center py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" /> Add Another Question
                </button>
              </div>
            </main>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-3">
              {error && (
                <div className="flex items-center text-xs sm:text-sm text-red-600 mb-2 sm:mb-0">
                  <AlertCircle className="w-5 h-5 mr-2"/> {error}
                </div>
              )}
              <button 
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => navigate(-1)} // Go back
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssignment}
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-2 border border-transparent rounded-lg text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                <Check className="w-5 h-5 mr-2" /> {isSubmitting ? 'Saving...' : 'Save Assignment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAssignmentPage;