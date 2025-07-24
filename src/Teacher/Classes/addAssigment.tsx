import React, { useEffect, useState, useRef, FormEvent } from 'react';
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
  id: string;
  title: string;
}

interface Question {
  id?: string; 
  temp_id?: number; 
  question_text: string;
  points: number;
  answer_type: 'TEXT' | 'FILE';
  isEditing?: boolean;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  discussion?: string; 
  points?: number;
  classroom: string;
  assigned_students?: string[];
  questions?: Question[];
}

interface Student {
  id: string;
  username: string;
  email: string;
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

const QuestionDisplayCard = ({ question, index, onEdit, onDelete }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300">
    <div className="flex justify-between items-center mb-4">
      <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
        Question {index + 1}
      </span>
      <span className="text-sm font-medium text-gray-600">{question.points} Points</span>
    </div>
    <p className="text-gray-800 mb-4 whitespace-pre-wrap">{question.question_text || "No question text."}</p>
    {question.answer_type === 'FILE' ? (
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500"><UploadCloud size={14} /> Student will upload a file.</div>
    ) : (
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500"><Edit size={14} /> Student will type an answer.</div>
    )}
    <div className="mt-4 flex items-center justify-end space-x-3">
      <button onClick={() => onDelete(question.id || question.temp_id)} className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors">
        <Trash2 className="w-4 h-4 mr-2" /> Delete
      </button>
      <button onClick={() => onEdit(question.id || question.temp_id)} className="flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">
        <Edit className="w-4 h-4 mr-2" /> Edit
      </button>
    </div>
  </div>
);

const QuestionEditForm = ({ question, index, onSave, onFormChange, onDelete }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-md">
    <div className="flex justify-between items-center mb-4">
      <span className="text-sm font-medium text-blue-700">Editing Question {index + 1}</span>
      <button onClick={() => onDelete(question.id || question.temp_id)} className="text-red-600 hover:text-red-800" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Question</label>
      <textarea value={question.question_text} onChange={(e) => onFormChange(question.id || question.temp_id, 'question_text', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" rows={3} />
    </div>
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Answer Type</label>
        <select value={question.answer_type} onChange={(e) => onFormChange(question.id || question.temp_id, 'answer_type', e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm text-sm">
          <option value="TEXT">Text Answer</option>
          <option value="FILE">File Upload</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Points</label>
        <input type="number" value={question.points} onChange={(e) => onFormChange(question.id || question.temp_id, 'points', parseInt(e.target.value, 10) || 0)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" min="0" />
      </div>
    </div>
    <div className="mt-6 flex justify-end">
      <button onClick={() => onSave(question.id || question.temp_id)} className="flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700">
        Save Question <Check className="w-4 h-4 ml-2" />
      </button>
    </div>
  </div>
);

const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

const EditAssignmentPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null); 
  const [discussionId, setDiscussionId] = useState(''); 
  const [classroomId, setClassroomId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [discussionOptions, setDiscussionOptions] = useState<Discussion[]>([]); 
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const questionsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      const token = localStorage.getItem('authToken');
      if (!assignmentId || !token) {
        setError('Missing ID or token.');
        setIsFetching(false);
        return;
      }
      try {
        const response = await fetch(`${Server_url}/api/classrooms/assignments/${assignmentId}/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch assignment details.');
        const data: Assignment = await response.json();
        setTitle(data.title);
        setDescription(data.description);
        setDueDate(data.due_date ? new Date(data.due_date) : null); 
        setClassroomId(data.classroom);
        setDiscussionId(data.discussion || ''); 
        setAssignedStudents(data.assigned_students || []);
        setQuestions(data.questions?.map(q => ({ ...q, isEditing: false })) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchAssignmentDetails();
  }, [assignmentId]);

  useEffect(() => {
    if (!classroomId) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const fetchEnrolledStudents = async () => {
      try {
        const response = await fetch(`${Server_url}/api/classrooms/classroom/${classroomId}/enrolled-students/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch students.');
        const data = await response.json();
        setEnrolledStudents(data.results || data);
      } catch (err) {
      }
    };

    const fetchDiscussions = async () => {
      try {
        const response = await fetch(`${Server_url}/api/classrooms/classroom/${classroomId}/discussions/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch discussions.');
        const data = await response.json();
        setDiscussionOptions(data);
      } catch (err) {
      }
    };

    fetchEnrolledStudents();
    fetchDiscussions();
  }, [classroomId]);

  const isAllStudentsSelected = enrolledStudents.length > 0 && assignedStudents.length === enrolledStudents.length;
  const handleToggleStudent = (studentId: string) => setAssignedStudents(p => p.includes(studentId) ? p.filter(id => id !== studentId) : [...p, studentId]);
  const handleToggleAllStudents = () => setAssignedStudents(isAllStudentsSelected ? [] : enrolledStudents.map(s => s.id));

  const handleAddQuestion = () => {
    if (questions.some(q => q.isEditing)) {
      toast.error("Please save the currently editing question first.");
      return;
    }
    setQuestions([...questions, { temp_id: Date.now(), question_text: '', points: 10, answer_type: 'TEXT', isEditing: true }]);
    setTimeout(() => questionsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleQuestionFormChange = (id: string | number, field: keyof Question, value: any) => {
    setQuestions(qs => qs.map(q => (q.id === id || q.temp_id === id) ? { ...q, [field]: value } : q));
  };

  const handleSaveQuestion = (id: string | number) => {
    const questionToSave = questions.find(q => q.id === id || q.temp_id === id);
    if (!questionToSave?.question_text?.trim()) {
      toast.error("Question text cannot be empty.");
      return;
    }
    if (questionToSave.points <= 0) {
      toast.error("Points must be greater than zero.");
      return;
    }
    setQuestions(qs => qs.map(q => (q.id === id || q.temp_id === id) ? { ...q, isEditing: false } : q));
    toast.success("Question saved.");
  };

  const handleEditQuestion = (id: string | number) => {
    if (questions.some(q => q.isEditing)) {
      toast.error("Please save the currently editing question first.");
      return;
    }
    setQuestions(qs => qs.map(q => (q.id === id || q.temp_id === id) ? { ...q, isEditing: true } : q));
  };

  const handleDeleteQuestion = (id: string | number) => {
    toast(
      (t) => (
        <span>
          Are you sure you want to delete this question?
          <button
            onClick={() => {
              setQuestions(qs => qs.filter(q => q.id !== id && q.temp_id !== id));
              toast.dismiss(t.id);
              toast.success("Question deleted.");
            }}
            className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-2 px-2 py-1 bg-gray-300 rounded"
          >
            No
          </button>
        </span>
      ),
      { duration: 5000 }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (questions.some(q => q.isEditing)) {
      toast.error("Please save all questions before updating the assignment.");
      return;
    }
    setIsLoading(true);

    const questionsPayload = questions.map(({ isEditing, temp_id, ...q }) => q);

    const submissionPayload = {
      title,
      description,
      discussion: discussionId,
      due_date: dueDate ? dueDate.toISOString() : null, 
      assigned_students: assignedStudents,
      questions: questionsPayload,
    };

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${Server_url}/api/classrooms/assignments/${assignmentId}/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionPayload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to update assignment.');
      }
      
      toast.success("Assignment updated successfully!");
      navigate(`/Class_info_Page/${classroomId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <LoadingSpinner />;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <div className="flex flex-1">
        <div className="hidden lg:block w-64 bg-white shadow-md">
          <Sidebar />
        </div>
        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Assignment</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">For Classroom ID: {classroomId}</p>
            </header>
            <form onSubmit={handleSubmit}>
              <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Assignment Details</h2>
                  <div className="mt-6 space-y-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Title<span className="text-red-500">*</span></label>
                      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Description<span className="text-red-500">*</span></label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">
                        Discussion Assigned<span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-1">
                        <select
                          value={discussionId}
                          onChange={(e) => setDiscussionId(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
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
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Assign to Students</label>
                      <div className="mt-2 p-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto flex flex-wrap gap-2 bg-slate-50">
                        {enrolledStudents.length > 0 ? (
                          <>
                            <button type="button" onClick={handleToggleAllStudents} className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${isAllStudentsSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300'}`}>All Students</button>
                            {enrolledStudents.map(student => (
                              <button key={student.id} type="button" onClick={() => handleToggleStudent(student.id)} className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 ${assignedStudents.includes(student.id) ? 'bg-blue-100 text-blue-800 border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}>
                                {student.username || student.email}
                              </button>
                            ))}
                          </>
                        ) : <span className="text-sm text-gray-500 p-2">No students enrolled.</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Questions</h2>
                  <div className="mt-6 space-y-4 flex-grow overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
                    {questions.length > 0 ? questions.map((q, idx) => (
                      q.isEditing ? (
                        <QuestionEditForm key={q.id || q.temp_id} question={q} index={idx} onSave={handleSaveQuestion} onFormChange={handleQuestionFormChange} onDelete={handleDeleteQuestion} />
                      ) : (
                        <QuestionDisplayCard key={q.id || q.temp_id} question={q} index={idx} onEdit={handleEditQuestion} onDelete={handleDeleteQuestion} />
                      )
                    )) : (
                      <div className="text-center p-6 border-2 border-dashed rounded-lg"><p className="text-gray-500">No questions yet.</p></div>
                    )}
                    <div ref={questionsEndRef} />
                  </div>
                  <button type="button" onClick={handleAddQuestion} className="w-full mt-4 flex items-center justify-center py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100">
                    <Plus className="w-5 h-5 mr-2" /> Add Question
                  </button>
                </div>
              </main>
              <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-3 border-t pt-6">
                {error && <div className="flex items-center text-sm text-red-600 mr-auto"><AlertCircle className="w-5 h-5 mr-2" /> {error}</div>}
                <button type="button" className="w-full sm:w-auto px-6 py-2 border rounded-lg text-sm font-semibold" onClick={() => navigate(-1)}>Cancel</button>
                <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center px-6 py-2 border rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
                  <Check className="w-5 h-5 mr-2" /> {isLoading ? 'Updating...' : 'Update Assignment'}
                </button>
              </div>
            </form>
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