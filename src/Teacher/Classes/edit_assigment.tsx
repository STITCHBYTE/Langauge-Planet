import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Header from '../../Component/Home/Header.tsx';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Server_url from '../../config';

interface Discussion {
  id: number;
  title: string;
}

interface Student {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

const CustomDateInput = React.forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder }, ref) => (
  <div className="relative w-full">
    <input
      ref={ref}
      value={value}
      onClick={onClick}
      readOnly
      placeholder={placeholder}
      className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white"
    />
    <Calendar
      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-600 pointer-events-none"
    />
  </div>
));

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

const EditAssignmentPage = () => {
  const { classroomId } = useParams(); 
  const navigate = useNavigate(); 
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); 
  const [discussionId, setDiscussionId] = useState('');
  const [assignedStudents, setAssignedStudents] = useState<string[]>([]); 
  const [dueDate, setDueDate] = useState<Date | null>(null); 
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); 

  const [questions, setQuestions] = useState([]);
  const [discussionOptions, setDiscussionOptions] = useState<Discussion[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]); 
  const [classData, setClassData] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const questionsEndRef = useRef(null);
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
      setAssignedStudents([]);
    } else {
      setAssignedStudents(enrolledStudents.map(s => s.id));
    }
  };
  const scrollToBottom = () => {
    questionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if(questions.some(q => q.isEditing)) {
      scrollToBottom();
    }
  }, [questions.length]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
    }

    const fetchClassData = async () => {
      try {
        const response = await fetch(`${Server_url}/api/classrooms/classroom/${classroomId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch class details');
        const data = await response.json();
        setClassData(data);
      } catch (error) {
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
        setDiscussionOptions(data);
      } catch (error) {
        setError('Could not load discussion options.');
      }
    };

    const fetchEnrolledStudents = async () => {
      try {
        const response = await fetch(`${Server_url}/api/classrooms/classroom/${classroomId}/enrolled-students/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch enrolled students');
        const data = await response.json();
        
        const studentList = (data.results || data).map(item => item.student || item);

        setEnrolledStudents(studentList); 
      } catch (error) {
          setError(prev => prev + ' Could not load student list.');
      }
    };

    fetchClassData(); 
    fetchDiscussions();
    fetchEnrolledStudents();
  }, [classroomId]);

  const handleAddQuestion = () => {
    if (questions.some(q => q.isEditing)) {
        toast.error("Please save the currently editing question before adding a new one.");
        return;
    }
    const newQuestion = {
        id: Date.now(), 
        text: '',
        points: 5,
        answer_type: 'FILE', 
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
        toast.error("Question text cannot be empty.");
        return;
    }
    if (questionToSave.points <= 0) {
        toast.error("Points must be greater than zero.");
        return;
    }
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, isEditing: false } : q)));
    toast.success("Question saved.");
  };

  const handleEditQuestion = (id) => {
    if (questions.some(q => q.isEditing)) {
        toast.error("Please save the currently editing question first.");
        return;
    }
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, isEditing: true } : q)));
  };
  
  const handleSaveAssignment = async () => {
    setError('');
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
        
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
        
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
            due_date: dueDate ? dueDate.toISOString() : null, 
            points: totalPoints,
            questions: questionsPayload, 
        };

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
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
        toast.success("Assignment saved to Language Planet!");

        const google_token = localStorage.getItem('google_access_token');
        let googleClassroomId = classData?.google_classroom_id;

        if (!googleClassroomId && classData) {
            if (google_token) {
              try {
                const coursesResponse = await fetch('https://classroom.googleapis.com/v1/courses', {
                  headers: {
                    'Authorization': `Bearer ${google_token}`,
                  },
                });
    
                if (coursesResponse.status === 401) {
                    throw new Error("Google token has expired. Please re-authenticate with Google.");
                }

                if (coursesResponse.ok) {
                  const coursesData = await coursesResponse.json();
                  const matchingCourse = coursesData.courses?.find(course => course.section === classData.id || course.section === classData._id);
                  
                  if (matchingCourse) {
                    googleClassroomId = matchingCourse.id;
                  } 
                }
              } catch (error) {
              }
            }
        }

        if (google_token && googleClassroomId) {
            try {
                const gcPayload: any = { 
                    title: title,
                    description: description,
                    workType: 'ASSIGNMENT',
                    state: 'PUBLISHED',
                    maxPoints: totalPoints,
                };

                if (dueDate) {
                    const date = new Date(dueDate);
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
                    } 
                }

                if (gcPayload.assigneeMode === 'INDIVIDUAL_STUDENTS') {
                    const studentEmails = assignedStudents
                        .map(id => enrolledStudents.find(s => s.id === id)?.email)
                        .filter(Boolean); 
                    if (studentEmails.length > 0) {
                        const firstStudentEmail = studentEmails[0];
                        gcPayload.individualStudentsOptions = { studentIds: [firstStudentEmail] };
                    } else {
                        gcPayload.assigneeMode = 'ALL_STUDENTS';
                    }
                }

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
                    if (gcError.error?.status === 'FAILED_PRECONDITION') {
                        toast.error(`Assignment saved to Language Planet, but failed to post to Google Classroom. Error: One or more selected students are not enrolled in the Google Classroom course. Please check the student list in Google Classroom.`);
                    } else {
                        toast.error(`Assignment saved to Language Planet, but failed to post to Google Classroom: ${gcError.error.message}`);
                    }
                } else {
                    toast.success("Assignment also posted successfully to Google Classroom!");
                }
            } catch (gcError) {
                toast.error(`Assignment saved to Language Planet, but an error occurred while posting to Google Classroom.`);
            }
        }

        navigate(`/Class_info_Page/${classroomId}`);

    } catch (error) {
        setError(error.message);
        toast.error(error.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 lg:ml-[17%]">
      <Header />

      <div className="flex flex-1">
        <div className="hidden lg:block bg-white shadow-md">
          <Sidebar />
        </div>

        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <header>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Assignment</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">For Classroom ID: {classroomId}</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
              <div className="md:col-span-1 lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Assignment General Details</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Fill out the general details for this assignment.</p>

                <form className="mt-6 space-y-6">
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
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Due Date <span className="text-gray-500">(optional)</span>
                    </label>
                    <div className="mt-1 w-full">
                      <DatePicker
                        selected={dueDate}
                        onChange={(date: Date) => setDueDate(date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="dd/MM/yyyy, HH:mm"
                        placeholderText="dd/mm/yyyy, --:-- --"
                        customInput={<CustomDateInput />}
                        popperClassName="react-datepicker-popper"
                        calendarClassName="react-datepicker-calendar"
                        minDate={new Date()}
                        isClearable={false}
                        wrapperClassName="w-full"
                      />
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
                                  ? 'bg-blue-100 text-blue-800 border-blue-500' 
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
            <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-3">
              {error && (
                <div className="flex items-center text-xs sm:text-sm text-red-600 mb-2 sm:mb-0">
                  <AlertCircle className="w-5 h-5 mr-2"/> {error}
                </div>
              )}
              <button 
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => navigate(-1)} 
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

      <style jsx>{`
        .react-datepicker-popper {
          z-index: 9999 !important;
        }
        
        .react-datepicker {
          font-family: inherit;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .react-datepicker__header {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 8px 8px 0 0;
        }
        
        .react-datepicker__current-month {
          font-weight: 600;
          color: #374151;
        }
        
        .react-datepicker__day {
          color: #374151;
          border-radius: 4px;
          transition: all 0.15s ease-in-out;
        }
        
        .react-datepicker__day:hover {
          background-color: #dbeafe;
          color: #1d4ed8;
        }
        
        .react-datepicker__day--selected {
          background-color: #2563eb !important;
          color: white !important;
        }
        
        .react-datepicker__day--keyboard-selected {
          background-color: #3b82f6;
          color: white;
        }
        
        .react-datepicker__time-container {
          border-left: 1px solid #e5e7eb;
        }
        
        .react-datepicker__time-list-item {
          padding: 8px 12px;
          transition: background-color 0.15s ease-in-out;
        }
        
        .react-datepicker__time-list-item:hover {
          background-color: #f3f4f6;
        }
        
        .react-datepicker__time-list-item--selected {
          background-color: #2563eb !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default EditAssignmentPage;