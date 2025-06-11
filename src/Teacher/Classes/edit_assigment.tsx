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
  const [assignedStudents, setAssignedStudents] = useState([]); // As requested
  const [dueDate, setDueDate] = useState(''); // Using simple string for date input

  const [questions, setQuestions] = useState([]);
  const [discussionOptions, setDiscussionOptions] = useState<Discussion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const questionsEndRef = useRef(null);

  // Scroll to new question form
  const scrollToBottom = () => {
    questionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if(questions.some(q => q.isEditing)) {
      scrollToBottom();
    }
  }, [questions.length]);

  // Fetch discussions from the backend
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
    }
    const fetchDiscussions = async () => {
      try {
        const response = await fetch(`${Server_url}/api/classrooms/classroom/${classroomId}/discussions/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch discussions');
        const data = await response.json();
        setDiscussionOptions(data);
      } catch (error) {
        console.error('Error fetching discussions:', error);
        setError('Could not load discussion options.');
      }
    };
    fetchDiscussions();
  }, []);

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
    
    // 2. Prepare the payload for the first API call (create assignment)
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const assignmentData = {
        classroom:classroomId,
        title: title,
        description: description,
        discussion: discussionId,
        assigned_students: assignedStudents,
        due_date: dueDate || null,
        points: totalPoints,
    };

    try {
        const token = localStorage.getItem('authToken');
        
        // 3. FIRST API CALL: Create the main assignment entry
        const assignmentResponse = await fetch(`${Server_url}/api/classrooms/assignments/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(assignmentData),
        });

        if (!assignmentResponse.ok) {
            const errData = await assignmentResponse.json();
            throw new Error(errData.detail || 'Failed to create assignment shell.');
        }
        
        const createdAssignment = await assignmentResponse.json();
        const newAssignmentId = createdAssignment.id; // Assuming the response contains the new ID

        if (!newAssignmentId) {
             throw new Error("Did not receive a valid assignment ID from the server.");
        }
        
        // 4. SECOND API CALL (in a loop): Create each question
        const questionPromises = questions.map((question, index) => {
            const questionData = {
                assignment: newAssignmentId,
                question_text: question.text,
                points: question.points,
                order: index + 1, // The order of the question
                answer_type: question.answer_type,
            };
            
            return fetch(`${Server_url}/api/classrooms/assignment-questions/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(questionData),
            });
        });

        // Wait for all question creation requests to complete
        const questionResponses = await Promise.all(questionPromises);

        // Check if any question creation failed
        const failedResponse = questionResponses.find(res => !res.ok);
        if (failedResponse) {
             throw new Error(`Failed to create one or more questions. Status: ${failedResponse.status}`);
        }

        // 5. Success!
        alert("Assignment and all questions saved successfully!");
        navigate(`/Class_info_Page/${classroomId}`); // Optional: redirect on success

    } catch (error) {
        console.error("Error saving assignment:", error);
        setError(error.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div >
      <Sidebar/>
      <div className="flex-1 ml-[17%] p-[1%]">
        <Header/>
        </div>
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 md:p-8 ml-[17%]">
      <div className="max-w-7xl mx-auto">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Create New Assignment</h1>
          <p className="text-sm text-gray-500 mt-1">For Classroom ID: {classroomId}</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-800">Assignment General Details</h2>
            <p className="text-sm text-gray-500 mt-1">Fill out the general details for this assignment.</p>

            <form className="mt-6 space-y-6">
              {/* Assignment Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assignment Title<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Assignment Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description<span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Discussion Assigned */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Discussion Assigned<span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <select
                    value={discussionId}
                    onChange={(e) => setDiscussionId(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                <label className="block text-sm font-medium text-gray-700">
                  Due Date <span className="text-gray-500">(optional)</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                  />
                  <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800">Questions</h2>
            <p className="text-sm text-gray-500 mt-1">Questions will appear to your students in this order.</p>
            <div className="mt-6 space-y-4 flex-grow overflow-y-auto pr-2" style={{ maxHeight: 'calc(2.5 * 18rem)'}}> 
              {questions.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-300 rounded-lg h-48">
                    <p className="text-gray-500 font-medium">No questions yet.</p>
                    <p className="text-sm text-gray-400">Click "Add Another Question" to get started.</p>
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
              className="w-full mt-4 flex items-center justify-center py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Another Question
            </button>
          </div>
        </main>

        <div className="mt-8 flex justify-end items-center space-x-4">
            {error && <div className="flex items-center text-sm text-red-600"><AlertCircle className="w-5 h-5 mr-2"/> {error}</div>}
          <button 
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => navigate(-1)} // Go back
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAssignment}
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5 mr-2" /> {isSubmitting ? 'Saving...' : 'Save Assignment'}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default EditAssignmentPage;