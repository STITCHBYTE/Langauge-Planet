import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../Component/Home/Header.tsx';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Server_url from '../../config';

// Interface for assignment data
interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  max_points?: number;
  classroom: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const EditAssignmentForm: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxPoints, setMaxPoints] = useState<number>(100);
  const [image, setImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [classroomId, setClassroomId] = useState<string>('');
  const [descriptionWordCount, setDescriptionWordCount] = useState(0);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get full image URL
  const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
    if (!imagePath) return undefined;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    } else if (imagePath.startsWith('/media/') || imagePath.startsWith('media/')) {
      return `${Server_url}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    } else if (imagePath.startsWith('/')) {
      return `${Server_url}${imagePath}`;
    } else {
      return `${Server_url}/${imagePath}`;
    }
  };

  // Function to format date for input
  const formatDateForInput = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  };

  // Fetch assignment details on component mount
  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      if (!assignmentId) {
        setError('No assignment ID provided');
        setIsFetching(false);
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setIsFetching(false);
        return;
      }

      try {
        setIsFetching(true);
        setError(null);

        const response = await fetch(`${Server_url}/api/classrooms/assignments/${assignmentId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Assignment not found');
          } else if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          } else {
            throw new Error(`Failed to fetch assignment: ${response.status}`);
          }
        }

        const assignmentData: Assignment = await response.json();
        console.log('Fetched assignment data:', assignmentData);

        // Populate form fields with existing data
        setTitle(assignmentData.title || '');
        setDescription(assignmentData.description || '');
        setDueDate(formatDateForInput(assignmentData.due_date));
        setMaxPoints(assignmentData.max_points || 100);
        setClassroomId(assignmentData.classroom || '');
        setDescriptionWordCount(
          (assignmentData.description || '').split(/\s+/).filter((word) => word.length > 0).length
        );
        
        if (assignmentData.image) {
          const fullImageUrl = getImageUrl(assignmentData.image);
          setCurrentImageUrl(fullImageUrl || null);
        }

      } catch (err) {
        console.error('Error fetching assignment:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch assignment details');
      } finally {
        setIsFetching(false);
      }
    };

    fetchAssignmentDetails();
  }, [assignmentId]);

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setDescription(text);
    setDescriptionWordCount(text.split(/\s+/).filter((word) => word.length > 0).length);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);
      // Clear current image URL when new image is selected
      setCurrentImageUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setCurrentImageUrl(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !dueDate) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('due_date', new Date(dueDate).toISOString());
    formData.append('max_points', maxPoints.toString());
    
    // Only append image if a new one was selected
    if (image) {
      formData.append('image', image);
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Authentication token not found. Please login again.');
      setIsLoading(false);
      return;
    }

    try {
      console.log("--- Updating Assignment ---");
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: ${(pair[1] as File).name}`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      const response = await fetch(`${Server_url}/api/classrooms/assignments/${assignmentId}/update/`, {
        method: 'PUT', // or 'PATCH' depending on your backend
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Assignment updated successfully:', data);
        alert('Assignment updated successfully!');
        navigate(`/Class_info_Page/${classroomId}`);
      } else {
        const errorData = await response.text();
        console.error('Server Error:', errorData);
        alert(`Failed to update assignment: ${response.status}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while fetching data
  if (isFetching) {
    return <LoadingSpinner />;
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <div className="flex flex-1">
          
            <Sidebar isMobileMenuOpen={isSidebarOpen} toggleMobileMenu={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => navigate(-1)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-md">
          <Sidebar />
        </div>
        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center text-xs sm:text-sm mb-6">
            <button onClick={() => navigate(`/Class_info_Page/${classroomId}`)} className="flex items-center text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Go Back
            </button>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-500">Class</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-800 font-medium">Edit Assignment</span>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-5xl mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Left column */}
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Edit Assignment Details</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mb-6">Update the details for this assignment</p>
                  {/* Assignment Title */}
                  <div className="mb-6">
                    <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Assignment Title<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      placeholder="Enter assignment title"
                    />
                  </div>
                  {/* Due Date */}
                  <div className="mb-6">
                    <label htmlFor="dueDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Due Date<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="dueDate"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                  {/* Max Points */}
                  <div className="mb-6">
                    <label htmlFor="maxPoints" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Maximum Points
                    </label>
                    <input
                      type="number"
                      id="maxPoints"
                      value={maxPoints}
                      onChange={(e) => setMaxPoints(Number(e.target.value))}
                      min="1"
                      max="1000"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      placeholder="100"
                    />
                  </div>
                  {/* Assignment Description */}
                  <div className="mb-6">
                    <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Assignment Description<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={handleDescriptionChange}
                      rows={4}
                      maxLength={1000}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm resize-y"
                      placeholder="Enter assignment description"
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500">{descriptionWordCount} words</p>
                  </div>
                </div>
                {/* Right column - Image upload */}
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Assignment Image</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mb-6">Upload an image for this assignment</p>
                  <div className="flex justify-center items-center h-40 sm:h-56 md:h-64 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition relative group">
                    <input
                      type="file"
                      id="displayImageUpload"
                      accept="image/png, image/jpeg, image/jpg, image/gif"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {/* Show new image preview with hover overlay */}
                    {image ? (
                      <div className="relative w-full h-full group">
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt="Preview" 
                          className="w-full h-full object-contain rounded-md" 
                        />
                        <p className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs sm:text-sm text-gray-600 bg-white px-2 py-1 rounded shadow">
                          {image.name}
                        </p>
                        {/* Hover overlay with buttons */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById('displayImageUpload')?.click();
                              }}
                              className="px-4 py-2 bg-white text-gray-800 text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-100 flex items-center gap-2"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage();
                              }}
                              className="px-4 py-2 bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-red-700 flex items-center gap-2"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : currentImageUrl ? (
                      <div className="relative w-full h-full group">
                        <img 
                          src={currentImageUrl} 
                          alt="Current" 
                          className="w-full h-full object-contain rounded-md" 
                        />
                        <p className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs sm:text-sm text-gray-600 bg-white px-2 py-1 rounded shadow">
                          Current Image
                        </p>
                        {/* Hover overlay with buttons */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById('displayImageUpload')?.click();
                              }}
                              className="px-4 py-2 bg-white text-gray-800 text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-100 flex items-center gap-2"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage();
                              }}
                              className="px-4 py-2 bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-red-700 flex items-center gap-2"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 48 48">
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L40 32"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="mt-2 text-xs sm:text-sm text-gray-600">Tap to Upload</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF | 10MB max.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/Class_info_Page/${classroomId}`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAssignmentForm;