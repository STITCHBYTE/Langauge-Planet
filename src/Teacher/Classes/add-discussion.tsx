'use client'; // Required for using hooks in Next.js App Router

import React, { useState, FormEvent } from 'react';
import { FiCheck, FiUploadCloud, FiFile, FiImage } from 'react-icons/fi';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Header from '../../Component/Home/Header.tsx';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Server_url from '../../config';
import { toast } from 'react-toastify';

export default function AddDiscussionPage() {
    const { classId } = useParams<{ classId: string }>();
 
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState<FileList | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
            return <FiImage className="text-blue-500" size={24} />;
        }
        return <FiFile className="text-red-500" size={24} />;
    };

    const validateFile = (file: File): string | null => {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        const maxSize = 10 * 1024 * 1024; 
        
        if (!allowedTypes.includes(file.type)) {
            return 'File type not supported. Please upload PDF, PNG, JPG, GIF, WEBP, TXT, DOC, or DOCX files.';
        }
        
        if (file.size > maxSize) {
            return 'File size must be less than 10MB.';
        }
        
        return null;
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            const file = selectedFiles[0];
            const validationError = validateFile(file);
            
            if (validationError) {
                setError(validationError);
                e.target.value = ''; 
                setFiles(null);
                return;
            }
            
            setError(null);
            setFiles(selectedFiles);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');

        if (!token) {
            setError('Authentication token not found. Please log in again.');
            toast.error('Authentication token not found. Please log in again.');
            setIsLoading(false);
            return;
        }

        if (!title || !description) {
            setError('Title and description are required.');
            toast.error('Title and description are required.');
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('classroom', classId || '');
        formData.append('title', title);
        formData.append('description', description);
        
        if (files && files.length > 0) {
            formData.append('file', files[0]);
        }

        try {
            const response = await fetch(`${Server_url}/api/classrooms/discussions/create/`, {
                method: 'POST',
                headers: {
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
            toast.success('Discussion added successfully!');
            navigate(`/Class_info_Page/${classId}`);
            setTitle('');
            setDescription('');
            setFiles(null);

        } catch (err: any) {
            if (!error) {
                setError(err.message);
                toast.error(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            
            <div className="flex flex-1">
                <div>
                    <Sidebar />
                </div>
<div className="w-full ml-[17%]">
                <Header />
  
                <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
                    <main className="w-full min-h-screen flex items-center justify-center">
                        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm w-full max-w-5xl mx-auto">
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                                    <div className="md:col-span-2">
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Discussion Details</h2>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            Fill out the basic details for this discussion.
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
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Discussion Media</h2>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            Upload a file for this discussion. PDF, PNG, JPG, GIF, WEBP, TXT, DOC, DOCX | 10MB max.
                                        </p>
                                        <div className="mt-6">
                                            <label htmlFor="file-upload" className="flex justify-center items-center w-full h-40 sm:h-48 md:h-56 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
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
                                                            <p className="mt-3 text-xs sm:text-sm font-semibold text-blue-600">Tap to Upload</p>
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
                                                onChange={handleFileChange}
                                                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.doc,.docx,image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            />
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
                                                    Remove file
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-end items-center mt-8 pt-6 border-t border-gray-200 gap-3">
                                    {error && <p className="w-full text-xs sm:text-sm text-red-500 text-left">{error}</p>}
                                    <button 
                                        type="button" 
                                        onClick={() => navigate(`/Class_info_Page/${classId}`)}
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
                                        {isLoading ? 'Saving...' : 'Save Details'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </main>
                </div>
            </div>
                      </div>
        </div>
    );
}