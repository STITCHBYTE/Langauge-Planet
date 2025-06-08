'use client'; // Required for using hooks in Next.js App Router

import React, { useState, FormEvent } from 'react';
import { FiCheck, FiUploadCloud } from 'react-icons/fi';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Header from '../../Component/Home/Header.tsx';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Server_url from '../../config';
// This is the single component that contains all the UI for the main content area.
export default function AddDiscussionPage() {
    const { classId } = useParams<{ classId: string }>();

        console.log("classId:", classId);
    // State to hold form data
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState<FileList | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    // Handler for form submission
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        // ---[ NEW ]--- Get the token from local storage
        // Make sure you use the same key ('authToken') you used when storing it at login.
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
        formData.append('classroom', classId || '');

        formData.append('title', title);
        formData.append('description', description);
        
        if (files && files.length > 0) {
            formData.append('image', files[0]);
        }

        try {
            const response = await fetch(`${Server_url}/api/classrooms/discussions/create/`, {
                method: 'POST',
                // ---[ NEW ]--- Add the Authorization header
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Note: No 'Content-Type' header is needed.
                    // The browser automatically sets it to 'multipart/form-data'
                    // with the correct boundary when you use FormData.
                },
                body: formData,
            });

            if (!response.ok) {
                // Handle different error status codes
                if (response.status === 401 || response.status === 403) {
                     setError("Authorization failed. Please log in again.");
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Something went wrong');
                }
                return; // Stop execution if response is not ok
            }

            const result = await response.json();
            console.log('Success:', result);
            alert('Discussion added successfully!');
            navigate(`/Class_info_Page/${classId}`);
            // Optionally, redirect or clear the form here
            setTitle('');
            setDescription('');
            setFiles(null);

        } catch (err: any) {
            console.error('Error submitting form:', err);
            // Use the error state set in the try block, or set a generic one
            if (!error) {
                setError(err.message);
            }
            alert(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-1">
            <Sidebar />
            <div className="flex-1 p-[1%] ml-[17%]">
                <Header />

                <main className="w-full min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm w-full max-w-6xl">
                        
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* === LEFT COLUMN: DISCUSSION DETAILS FORM === */}
                                <div className="lg:col-span-2">
                                    <h2 className="text-xl font-bold text-gray-800">Discussions Details</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Fill out the basic details for this discussion.
                                    </p>
                                    
                                    <div className="mt-6 space-y-6">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                                Discussion Title*
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                                placeholder="Enter title"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="discussion" className="block text-sm font-medium text-gray-700 mb-1">
                                                Discussion*
                                            </label>
                                            <textarea
                                                id="discussion"
                                                rows={5}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                                placeholder="Start typing discussion"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* === RIGHT COLUMN: MEDIA UPLOADER === */}
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Discussion Media</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Upload an image for this discussion. PDF, PNG, JPG | 10MB max.
                                    </p>
                                    
                                    <div className="mt-6">
                                        <label htmlFor="file-upload" className="flex justify-center items-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                                            <div className="text-center">
                                                {files && files.length > 0 ? (
                                                    <p className="text-sm font-semibold text-green-600">{files[0].name}</p>
                                                ) : (
                                                    <>
                                                        <div className="mx-auto bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center">
                                                            <FiUploadCloud className="text-gray-500" size={30} />
                                                        </div>
                                                        <p className="mt-3 text-sm font-semibold text-blue-600">Tap to Upload</p>
                                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF | 10MB max.</p>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            onChange={(e) => setFiles(e.target.files)}
                                            accept="image/png, image/jpeg, image/gif"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* === ACTION BUTTONS SECTION === */}
                            <div className="flex justify-end items-center mt-8 pt-6 border-t border-gray-200 space-x-4">
                                {error && <p className="flex-1 text-sm text-red-500 text-left">{error}</p>}
                                <button type="button" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-100 transition-all">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-gray-400"
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
    );
}