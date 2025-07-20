import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar.tsx';
import Server_url from "../config.js"

// --- SVG Icon Components ---

const HomeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const LanguageIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m4 13l4-4M19 9l-4 4M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const BookOpenIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const UsersIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a4 4 0 110-5.292" />
  </svg>
);

const BellIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);

const MoreIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M5 12a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2z" /></svg>
);

const UploadIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
);

const CloseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);

// --- Component Props Interfaces ---

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

interface LanguageCardProps {
    flagUrl: string;
    name: string;
    published: boolean;
    learners: number;
}

interface AddLanguageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (languageData: any, isPublic: boolean) => void;
    language?: any;
    isEditMode?: boolean;
}

// --- Reusable Components ---

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false }) => (
  <a href="#" className={`flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors duration-200 ${active ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}>
    {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`})}
    <span className={`ml-4 font-medium ${active ? 'text-blue-600' : 'text-gray-800'}`}>{label}</span>
  </a>
);

const LanguageCard: React.FC<LanguageCardProps & {
    onEdit?: () => void;
    onPublish?: () => void;
    onDelete?: () => void;
}> = ({ flagUrl, name, published, learners, onEdit, onPublish, onDelete }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <div className="flex justify-between items-start">
                {/* Use flag as the image source, not flagUrl */}
                <img src={flagUrl} alt={`${name} flag`} className="w-12 h-8 object-cover rounded-md shadow-sm" />
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(prev => !prev)} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <MoreIcon />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 border border-gray-200 py-1">
                            <button onClick={onEdit} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit Language</button>
                            <button onClick={onPublish} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                {published ? 'Unpublish Language' : 'Publish Language'}
                            </button>
                            <div className="border-t my-1 border-gray-100"></div>
                            <button onClick={onDelete} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete Language</button>
                        </div>
                    )}
                </div>
            </div>
            <h3 className="mt-4 font-semibold text-gray-800">{name}</h3>
            <div className="mt-auto pt-4 flex justify-between items-center text-sm text-gray-500">
                {published ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Published</span>
                ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Not Published</span>
                )}
                <span>{learners} Learners</span>
            </div>
        </div>
    );
};

const AddLanguageModal: React.FC<AddLanguageModalProps> = ({ isOpen, onClose, onSave, language, isEditMode }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [flagFile, setFlagFile] = React.useState<File | null>(null);
    const [flagPreview, setFlagPreview] = React.useState<string | null>(null);
    const [languageName, setLanguageName] = React.useState('');

    // Populate fields if editing
    useEffect(() => {
        if (isEditMode && language) {
            setLanguageName(language.name || '');
            setFlagPreview(language.flag || null);
            setFlagFile(null); // Only set if user uploads a new file
        } else {
            setLanguageName('');
            setFlagPreview(null);
            setFlagFile(null);
        }
    }, [isEditMode, language]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFlagFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setFlagPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (isPublic: boolean) => {
        if (isEditMode && language) {
            await onSave(language.id, { name: languageName, flag: flagFile }, isPublic);
        } else {
            await onSave({ name: languageName, flag: flagFile }, isPublic);
        }
        onClose();
    };

    if (!isOpen) return null;

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
            <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {isEditMode ? "Edit Language" : "Add New Language"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <CloseIcon />
                    </button>
                </div>
                <div className="flex-1 p-6 space-y-6">
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Language <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="language"
                            value={languageName}
                            onChange={e => setLanguageName(e.target.value)}
                            placeholder="Enter language"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Flag <span className="text-red-500">*</span></label>
                        <div className="mt-1 flex flex-col items-center justify-center px-6 pt-10 pb-10 border-2 border-gray-300 border-dashed rounded-md cursor-pointer" onClick={handleUploadClick}>
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            {flagPreview && (
                                <img src={flagPreview} alt="Flag Preview" className="mb-4 w-20 h-14 object-cover rounded" />
                            )}
                            <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-blue-600 cursor-pointer hover:text-blue-700">Drag & drop or click to upload files</span>
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG | 10MB max</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 border-t flex items-center justify-end space-x-4">
                    <button
                        className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
                        onClick={() => handleSave(false)}
                    >
                        {isEditMode ? "Save Changes" : "Just Save; Don't Publish"}
                    </button>
                    <button
                        className="px-4 py-2.5 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center"
                        onClick={() => handleSave(true)}
                    >
                        {isEditMode ? "Save & Publish" : "Publish Language"}
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---

const App: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [languages, setLanguages] = useState([]);
    const [filteredLanguages, setFilteredLanguages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Fetch languages from API
    const fetchLanguages = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${Server_url}/api/users/languages/all/`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
            });
            if (!response.ok) throw new Error('Failed to fetch languages');
            const data = await response.json();
            setLanguages(data);
            setFilteredLanguages(data); // Initialize filtered list
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLanguages();
    }, []);

    // Filter languages by search term
    useEffect(() => {
        if (!searchTerm) {
            setFilteredLanguages(languages);
        } else {
            setFilteredLanguages(
                languages.filter(lang =>
                    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    }, [searchTerm, languages]);

    // Handler functions for API actions
    const handleAddLanguage = async (languageData, isPublic) => {
        const token = localStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('name', languageData.name);
        formData.append('flag', languageData.flag); // File object
        formData.append('is_published', isPublic ? 'true' : 'false');

        await fetch(`${Server_url}/api/users/languages/`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        });
        await fetchLanguages(); // Refresh list
    };

    const handleEditLanguage = async (languageId, languageData, isPublic) => {
        const token = localStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('id', languageId);
        formData.append('name', languageData.name);
        if (languageData.flag) formData.append('flag', languageData.flag); // File object
        formData.append('is_published', isPublic ? 'true' : 'false'); // <-- FIXED HERE

        await fetch(`${Server_url}/api/users/languages/${languageId}/update/`, {
            method: 'PUT',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        });
        await fetchLanguages(); // Refresh list
    };

    const handlePublishLanguage = async (languageId) => {
        const token = localStorage.getItem('authToken');
        await fetch(`${Server_url}/api/users/languages/${languageId}/toggle-published/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ id: languageId })
        });
        await fetchLanguages(); // Refresh list
    };

    const handleDeleteLanguage = async (languageId) => {
        const token = localStorage.getItem('authToken');
        await fetch(`${Server_url}/api/users/languages/${languageId}/delete/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ id: languageId })
        });
        await fetchLanguages(); // Refresh list
    };

    // Modal open for add/edit
    const openAddModal = () => {
        setSelectedLanguage(null);
        setIsEditMode(false);
        setIsModalOpen(true);
    };
    const openEditModal = (language) => {
        setSelectedLanguage(language);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="flex h-screen bg-gray-50 font-sans">
                <Sidebar />
                <main className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="h-20 bg-white border-b flex items-center px-8 justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Languages</h1>
                        </div>
                        <div className="flex items-center space-x-6">
                            <button className="text-gray-500 hover:text-gray-700 relative">
                                <BellIcon className="w-6 h-6" />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                        </div>
                    </header>
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div className="relative w-full max-w-xs">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search here..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <button onClick={openAddModal} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                                <span className="text-lg mr-2">+</span> Add New Language
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredLanguages.map((lang, index) => (
                                <LanguageCard
                                    key={lang.id || index}
                                    flagUrl={lang.flag}
                                    name={lang.name}
                                    published={lang.is_published}
                                    learners={lang.learners}
                                    onEdit={() => openEditModal(lang)}
                                    onPublish={() => handlePublishLanguage(lang.id)}
                                    onDelete={() => handleDeleteLanguage(lang.id)}
                                />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
            <AddLanguageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                language={selectedLanguage}
                isEditMode={isEditMode}
                onSave={isEditMode ? handleEditLanguage : handleAddLanguage}
            />
        </>
    );
};

export default App;