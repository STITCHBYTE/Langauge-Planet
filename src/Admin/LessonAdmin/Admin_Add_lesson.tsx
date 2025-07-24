import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Header from '../../Component/Home/Header.tsx';
import Server_url from '../../config';


const FormInput = ({ label, placeholder, type = "text", value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}*</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                       focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
    </div>
);

const FormSelect = ({ label, children, value, onChange }) => (
     <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}*</label>
        <select 
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm
                       focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
            {children}
        </select>
    </div>
);


const CreateLessonComponent: React.FC = () => {
    const navigate = useNavigate(); 
    const [title, setTitle] = useState('');
    const [isPrivate, setIsPrivate] = useState(false); 
    const [level, setLevel] = useState('BEGINNER');
    const [points, setPoints] = useState(10);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !description.trim()) {
            toast.error('Please fill out all required fields.');
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('is_private', isPrivate.toString());
        formData.append('lesson_level', level);
        formData.append('points', points.toString());
        formData.append('description', description);
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const token = localStorage.getItem('authToken');
        for (const pair of formData.entries()) {
        }

        try {
            const response = await fetch(`${Server_url}/api/lessons/lesson/create/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create lesson.');
            }

            const result = await response.json();
            toast.success('Lesson created successfully!');
            navigate(`/admin/lesson/view/${result.id}`); 

        } catch (error) {
            toast.error(`An error occurred: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <div className="flex flex-1">
                <div className="hidden lg:block w-64 bg-white border-r border-gray-200">
                    <Sidebar />
                </div>
                <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
                    <main className="max-w-5xl mx-auto">
                      <div className="flex items-center text-sm mb-6">
                        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Go Back
                        </button>
                        <span className="mx-2 text-gray-400">/</span>
                        <span className="text-gray-500">Lessons</span>
                        <span className="mx-2 text-gray-400">/</span>
                        <span className="text-gray-800 font-medium">Create New Lesson</span>
                      </div>

                      <div className="bg-white p-4 sm:p-8 rounded-xl shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="md:col-span-2 space-y-6">
                            <div>
                              <h2 className="text-xl font-semibold text-slate-800">Basic Details</h2>
                              <p className="text-sm text-slate-500 mt-1">Fill out the basic details for this lesson</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormInput label="Lesson Title" placeholder="Enter class title" value={title} onChange={(e) => setTitle(e.target.value)} />
                              <FormSelect 
                                label="Access Type" 
                                value={isPrivate ? 'private' : 'public'} 
                                onChange={(e) => setIsPrivate(e.target.value === 'private')}
                              >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                              </FormSelect>
                              <FormSelect label="Lesson Level" value={level} onChange={(e) => setLevel(e.target.value)}>
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advance</option>
                              </FormSelect>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Points Allocated*</label>
                                <input type="number" value={points} onChange={(e) => setPoints(parseInt(e.target.value))} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
                                <p className="text-xs text-slate-400 mt-1">Max. of 16 points</p>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Lesson Description*</label>
                              <textarea placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
                              <p className="text-right text-xs text-slate-400 mt-1">{wordCount}/100 words</p>
                            </div>
                          </div>
                          <div className="md:col-span-1">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-800">Lesson Display Image</h3>
                              <p className="text-sm text-slate-500 mt-1">Upload a display image for this lesson</p>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/gif" className="hidden"/>
                            <div className="mt-6 group relative flex justify-center items-center w-full h-56 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer" onClick={handleUploadClick}>
                              {imagePreview ? (
                                <>
                                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                                  <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button onClick={(e) => { e.stopPropagation(); handleUploadClick(); }} className="mb-2 px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg">Replace</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(); }} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg">Delete</button>
                                  </div>
                                </>
                              ) : (
                                <div className="text-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                  <p className="mt-2 text-sm font-medium text-slate-600">Tap to Upload</p>
                                  <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG, GIF | 10MB max.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-8 pt-6 border-t border-slate-200">
                          <button
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-300 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 disabled:opacity-50"
                          >
                            {isLoading ? 'Saving...' : 'Save Details'}
                            {!isLoading && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </main>
                  </div>
                </div>
              </div>
    );
};

export default CreateLessonComponent;