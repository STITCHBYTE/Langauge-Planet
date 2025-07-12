'use client'; // Required for using hooks in Next.js App Router

import React, { useState, useEffect, FormEvent } from 'react';
import { FiCheck, FiUploadCloud, FiImage, FiFile } from 'react-icons/fi';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Header from '../../Component/Home/Header.tsx';
import { useParams, useNavigate } from 'react-router-dom';
import Server_url from '../../config';
import { toast } from 'react-toastify';

// Interface for discussion data
interface Discussion {
  id: string;
  title: string;
  description: string;
  image?: string;
  classroom: string;
  created_at?: string;
  updated_at?: string;
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default function EditDiscussionPage() {
  const { discussionId } = useParams<{ discussionId: string }>();
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [classroomId, setClassroomId] = useState<string>('');
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get full image URL
  const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
    if (!imagePath) return undefined;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    } 
    // If it starts with /media/ or media/, construct full URL
    else if (imagePath.startsWith('/media/') || imagePath.startsWith('media/')) {
      return `${Server_url}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    } 
    // If it starts with /, assume it's a path from server root
    else if (imagePath.startsWith('/')) {
      return `${Server_url}${imagePath}`;
    } 
    // If it's just a filename, assume it's in the media directory
    else {
      return `${Server_url}/media/${imagePath}`;
    }
  };

  // Function to get full file URL
  const getFileUrl = (filePath: string | null | undefined): string | undefined => {
    if (!filePath) return undefined;
    
    // If it's already a full URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    } 
    // If it's just a filename, prepend the media path
    else if (!filePath.includes('/')) {
      return `${Server_url}/media/${filePath}`;
    }
    // If it starts with /media/ or media/, construct full URL
    else if (filePath.startsWith('/media/') || filePath.startsWith('media/')) {
      return `${Server_url}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
    } 
    // If it starts with /, assume it's a path from server root
    else if (filePath.startsWith('/')) {
      return `${Server_url}${filePath}`;
    } 
    // Default case: prepend media path
    else {
      return `${Server_url}/media/${filePath}`;
    }
  };

  // Function to get file icon based on file extension or type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <FiImage className="text-blue-500" size={24} />;
    } else if (extension === 'pdf') {
      return <FiFile className="text-red-500" size={24} />;
    }
    return <FiFile className="text-gray-500" size={24} />;
  };

  // Fetch discussion details on component mount
  useEffect(() => {
    const fetchDiscussionDetails = async () => {
      if (!discussionId) {
        setError('No discussion ID provided');
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

        const response = await fetch(`${Server_url}/api/classrooms/discussions/${discussionId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Discussion not found');
          } else if (response.status === 401) {
            throw new Error('Unauthorized. Please login again.');
          } else {
            throw new Error('Failed to fetch discussion details');
          }
        }

        const discussionData = await response.json(); // Define type for discussionData if you haven't
        console.log('Fetched discussion data:', discussionData);

        // Populate form fields with existing data
        setTitle(discussionData.title || '');
        setDescription(discussionData.description || '');
        setClassroomId(discussionData.classroom || '');

        // Handle existing file/image
        if (discussionData.file) { // Use discussionData.file
          console.log('Original file path:', discussionData.file);
          const fullFileUrl = getFileUrl(discussionData.file); // Use discussionData.file
          console.log('Constructed file URL:', fullFileUrl);
          setCurrentImageUrl(fullFileUrl || null);
          
          // Extract filename from path
          const fileName = discussionData.file.split('/').pop() || discussionData.file; // Use discussionData.file
          setCurrentFileName(fileName);
        }

      } catch (err) {
        console.error('Error fetching discussion details:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsFetching(false);
      }
    };

    fetchDiscussionDetails();
  }, [discussionId]);

  const handleRemoveImage = () => {
    setFiles(null);
    setCurrentImageUrl(null);
    setCurrentFileName(null);
  };

  // Handler for form submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('authToken');

    if (!token) {
      setError('Authentication token not found. Please log in again.');
      setIsLoading(false);
      return;
    }

    if (!title || !description) {
      setError('Title and description are required.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    
    // Handle file upload/removal
    if (files && files.length > 0) {
      // New file selected
      formData.append('image', files[0]);
    } else if (!currentImageUrl) {
      // File was removed, send empty string to clear it
      formData.append('remove_image', 'true');
    }
    // If currentImageUrl exists and no new file, keep existing file (don't append anything)

    try {
      console.log("--- Updating Discussion ---");
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: ${(pair[1] as File).name}`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      const response = await fetch(`${Server_url}/api/classrooms/discussions/${discussionId}/`, {
        method: 'PUT',
        headers:
         {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Authorization failed. Please log in again.");
          toast.error("Authorization failed. Please log in again.");
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Something went wrong');
          throw new Error(errorData.message || 'Something went wrong');
        }
        return;
      }

      const result = await response.json();
      console.log('Success:', result);
      toast.success('Discussion updated successfully!');
      navigate(`/Class_info_Page/${classroomId}`);

    } catch (err: any) {
      console.error('Error submitting form:', err);
      if (!error) {
        setError(err.message);
        toast.error(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while fetching data
  if (isFetching) {
    return <LoadingSpinner />;
  }

  // Show error message if fetch failed
  if (error && isFetching === false && !title) {
    return (
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-[1%] ml-[17%]">
          <Header />
          <main className="w-full min-h-screen bg-gray-50 p-8 flex items-center justify-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => navigate(-1)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Go Back
              </button>
            </div>
          </main>
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
          <main className="w-full min-h-screen flex items-center justify-center">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm w-full max-w-5xl mx-auto">
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
                <span className="text-gray-800 font-medium">Edit Discussion</span>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  {/* === LEFT COLUMN: DISCUSSION DETAILS FORM === */}
                  <div className="lg:col-span-2">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Discussion Details</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Update the details for this discussion.
                    </p>
                    <div className="mt-6 space-y-6">
                      <div>
                        <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Discussion Title<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-xs sm:text-sm"
                          placeholder="Enter title"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="discussion" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Discussion<span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="discussion"
                          rows={5}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-xs sm:text-sm"
                          placeholder="Start typing discussion"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  {/* === RIGHT COLUMN: MEDIA UPLOADER === */}
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Discussion Media</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Upload an image or file for this discussion. PDF, PNG, JPG, GIF, WEBP, TXT, DOC, DOCX | 10MB max.
                    </p>
                    <div className="mt-6">
                      {/* Show current file if exists */}
                      {currentImageUrl && currentFileName && !files && (
                        <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Current File:</p>
                          <div className="flex items-center space-x-3">
                            {getFileIcon(currentFileName)}
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-gray-900">{currentFileName}</p>
                              <a 
                                href={currentImageUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                View file
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentImageUrl(null);
                                setCurrentFileName(null);
                              }}
                              className="text-xs sm:text-sm text-red-600 hover:text-red-800 underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                      <label htmlFor="file-upload" className="flex justify-center items-center w-full h-40 sm:h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="text-center">
                          {files && files.length > 0 ? (
                            <div className="flex flex-col items-center">
                              {getFileIcon(files[0].name)}
                              <p className="text-xs sm:text-sm font-semibold text-green-600 mt-2">{files[0].name}</p>
                              <p className="text-xs text-gray-500">{(files[0].size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          ) : (
                            <>
                              <div className="mx-auto bg-gray-100 rounded-full h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center">
                                <FiUploadCloud className="text-gray-500" size={24} />
                              </div>
                              <p className="mt-3 text-xs sm:text-sm font-semibold text-blue-600">
                                {currentImageUrl ? 'Replace File' : 'Tap to Upload'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG, GIF, WEBP, TXT, DOC, DOCX</p>
                              <p className="text-xs text-gray-500">10MB max.</p>
                            </>
                          )}
                        </div>
                      </label>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          setFiles(e.target.files);
                          if (e.target.files && e.target.files.length > 0) {
                            setCurrentImageUrl(null);
                          }
                        }}
                        accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.doc,.docx,image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      />
                      {/* Remove new file button */}
                      {files && files.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFiles(null);
                            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                            if (fileInput) fileInput.value = '';
                          }}
                          className="mt-2 text-xs sm:text-sm text-red-600 hover:text-red-800 underline"
                        >
                          Remove new file
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* === ACTION BUTTONS SECTION === */}
                <div className="flex flex-col sm:flex-row justify-end items-center mt-8 pt-6 border-t border-gray-200 gap-3">
                  {error && <p className="w-full text-xs sm:text-sm text-red-500 text-left">{error}</p>}
                  <button 
                    type="button" 
                    onClick={() => navigate(`/Class_info_Page/${classroomId}`)}
                    className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-100 transition-all text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-gray-400 text-xs sm:text-sm"
                  >
                    <FiCheck className="mr-2 h-5 w-5" />
                    {isLoading ? 'Updating...' : 'Update Discussion'}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}