import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Header from '../../Component/Home/Header.tsx';
import Server_url from '../../config'; // Your server URL import

// A reusable component for form input fields for cleaner code
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

// A reusable component for dropdown/select fields
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


// Main Component
const CreateLessonComponent: React.FC = () => {
    const navigate = useNavigate(); // Hook for navigation

    // State management for form fields
    const [title, setTitle] = useState('');
    const [isPrivate, setIsPrivate] = useState(false); // **CHANGED**: Handles access type as a boolean
    const [level, setLevel] = useState('BEGINNER'); // Default level set to 'BEGINNER'
    const [points, setPoints] = useState(10);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // State for the image file and its preview
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    // Ref for the hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    const wordCount = description.trim().split(/\s+/).filter(Boolean).length;

    // Handler for image selection
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file); // Store the actual file
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string); // Set preview URL
            };
            reader.readAsDataURL(file);
        }
    };

    // Handler to trigger the hidden file input
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Handler to delete the image
    const handleDeleteImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Main submit handler
    const handleSave = async () => {
        if (!title.trim() || !description.trim()) {
            alert('Please fill out all required fields.');
            return;
        }

        setIsLoading(true);

        // Use FormData to send both text and file data
        const formData = new FormData();
        formData.append('title', title);
        formData.append('is_private', isPrivate.toString());
        formData.append('lesson_level', level);
        formData.append('points', points.toString());
        formData.append('description', description);
        
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const token = localStorage.getItem('authToken'); // Retrieve token from local storage
        
        // --- CORRECT DEBUGGING ---
        // console.log("--- Checking FormData Contents ---");
        for (const pair of formData.entries()) {
            // console.log(`${pair[0]}:`, pair[1]);
        }
        // console.log("---------------------------------");

        try {
            const response = await fetch(`${Server_url}/api/lessons/lesson/create/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the headers
                },
                // Do NOT set Content-Type header when using FormData, 
                // the browser will do it automatically with the correct boundary.
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create lesson.');
            }

            const result = await response.json();
            console.log('Lesson created successfully:', result);
            alert('Lesson created successfully!');
            navigate(`/lesson-view/${result.id}`); 

        } catch (error) {
            console.error('Error creating lesson:', error);
            alert(`An error occurred: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div >
            <Sidebar />
            <div className='ml-[17%] p-[1%]'>
                <Header/>
                <main className="flex-1 bg-gray-50 p-6">
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

                    <div className="bg-white p-8 rounded-xl shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-800">Basic Details</h2>
                                    <p className="text-sm text-slate-500 mt-1">Fill out the basic details for this lesson</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput label="Lesson Title" placeholder="Enter class title" value={title} onChange={(e) => setTitle(e.target.value)} />
                                    {/* **CHANGED**: The dropdown now controls the `isPrivate` boolean state */}
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
                                        <option value="ADVANCE">Advance</option>
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

                        <div className="flex justify-end items-center gap-4 mt-8 pt-6 border-t border-slate-200">
                            <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-white border border-slate-300 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-50">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={isLoading} className="flex items-center justify-center px-6 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 disabled:opacity-50">
                                {isLoading ? 'Saving...' : 'Save Details'}
                                {!isLoading && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateLessonComponent;