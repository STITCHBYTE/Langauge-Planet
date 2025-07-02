import React, { useState, useEffect } from 'react';
import Sidebar from '../Home/Sidebar.tsx';
import Header from '../Home/Header.tsx';
import Server_url, { client_id } from '../../config';
import { FiCopy, FiCheck, FiUploadCloud, FiSearch } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";

// --- Global Styles for Buttons and Inputs (to match the screenshot) ---
const GlobalStyles = () => (
  <style>{`
    .btn-primary {
      background-color: #3b82f6; /* blue-500 */
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    .btn-primary:hover {
      background-color: #2563eb; /* blue-600 */
    }
    .btn-secondary {
      background-color: #ffffff;
      color: #3b82f6; /* blue-500 */
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 500;
      border: 1px solid #d1d5db; /* gray-300 */
      transition: background-color 0.2s;
    }
    .btn-secondary:hover {
      background-color: #f9fafb; /* gray-50 */
    }
    .form-input {
      background-color: #f9fafb; /* gray-50 */
      border: 1px solid #e5e7eb; /* gray-200 */
      color: #111827; /* gray-900 */
      padding: 0.65rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }
    .form-input:disabled {
      background-color: #f3f4f6; /* gray-100 */
      cursor: not-allowed;
    }
  `}</style>
);


// --- Type Definitions ---
interface User {
  first_name: string;
  last_name?: string;
  username: string;
  is_teacher: boolean;
}

// --- Sub-components for better organization ---
//google scopes
const ADMIN_SCOPES =
  "openid profile email " +
  "https://www.googleapis.com/auth/classroom.courses " +
  "https://www.googleapis.com/auth/classroom.coursework.students " +
  "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly " +
  "https://www.googleapis.com/auth/classroom.announcements " +
  "https://www.googleapis.com/auth/classroom.rosters " +
  "https://www.googleapis.com/auth/classroom.profile.emails " +
  "https://www.googleapis.com/auth/classroom.profile.photos";
// Personal Info Card Component
const PersonalInfoCard: React.FC<{ user: User | null }> = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    const formData = new FormData();
    formData.append('profile_picture', file);
    try {
      const res = await fetch(`${Server_url}/api/users/upload-profile-picture/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload profile picture');
      // Optionally update user state here
    } catch (err) {
      alert('Failed to upload profile picture');
    }
    setUploading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Personal Info</h2>
          <p className="text-sm text-gray-500">Update your personal info</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleCopyLink} className="btn-secondary text-sm flex items-center gap-2">
            {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
            {copied ? 'Copied!' : 'Copy Profile Link'}
          </button>
          <button className="btn-primary text-sm flex items-center gap-2">
            <FiCheck />
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-2">Name & Username</label>
          <p className="text-xs text-gray-400 mb-2">Update your name & username</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              className="form-input w-full"
              value={user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Loading...'}
              disabled
            />
            <input
              className="form-input w-full sm:w-1/2"
              value={user ? `@${user.username}` : ''}
              disabled
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-2">Profile Picture</label>
          <p className="text-xs text-gray-400 mb-2">Update your profile Picture</p>
          <input
            type="file"
            accept="image/png, image/jpeg"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <div
            className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 flex flex-col items-center"
            onClick={() => fileInputRef.current?.click()}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile Preview"
                className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
              />
            ) : (
              <FiUploadCloud className="text-blue-500 text-3xl mx-auto mb-2" />
            )}
            <p className="text-sm font-semibold text-gray-700">{uploading ? 'Uploading...' : 'Tap to Upload'}</p>
            <p className="text-xs text-gray-400">PNG, JPG | 10MB max.</p>
          </div>
        </div>

        <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Languages</label>
            <p className="text-xs text-gray-400 mb-2">List of languages being learned will be displayed here</p>
            <div className="flex gap-3 mt-2">
              <img src="https://flagcdn.com/gb.svg" alt="English" title="English" className="w-10 h-7 object-cover rounded-sm shadow-md" />
              <img src="https://flagcdn.com/es.svg" alt="Spanish" title="Spanish" className="w-10 h-7 object-cover rounded-sm shadow-md" />
              <img src="https://flagcdn.com/fr.svg" alt="French" title="French" className="w-10 h-7 object-cover rounded-sm shadow-md" />
            </div>
        </div>
      </div>
    </div>
  );
};

// Friends Card Component
const FriendsCard: React.FC = () => {
  const myFriends = [
    { name: 'Samuel Jacob', handle: '@sammy', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { name: 'John Doe', handle: '@john', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { name: 'Jane Smith', handle: '@jane', avatar: 'https://randomuser.me/api/portraits/women/3.jpg' },
  ];
  const suggestedFriends = [
    { name: 'Emily White', handle: '@emily', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
    { name: 'Michael Brown', handle: '@mike', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-1">My Friends</h2>
      <p className="text-sm text-gray-500 mb-6">Learn with friends and grow together</p>

      <div className="space-y-4">
        {myFriends.map((friend, idx) => (
          <div className="flex items-center justify-between" key={`my-${idx}`}>
            <div className="flex items-center gap-3">
              <img src={friend.avatar} alt="Friend" className="w-10 h-10 rounded-full" />
              <div>
                <div className="text-sm font-semibold text-gray-800">{friend.name}</div>
                <div className="text-xs text-gray-400">{friend.handle}</div>
              </div>
            </div>
            <button className="text-blue-500 text-sm font-medium hover:underline">Remove Friend</button>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">Suggested Friends</h3>
      <div className="relative mb-4">
        <input type="text" placeholder="Search for your friends by name to add" className="form-input w-full pl-9" />
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      <div className="space-y-4">
        {suggestedFriends.map((friend, idx) => (
          <div className="flex items-center justify-between" key={`sug-${idx}`}>
            <div className="flex items-center gap-3">
              <img src={friend.avatar} alt="Suggested" className="w-10 h-10 rounded-full" />
              <div>
                <div className="text-sm font-semibold text-gray-800">{friend.name}</div>
                <div className="text-xs text-gray-400">{friend.handle}</div>
              </div>
            </div>
            <button className="text-blue-500 text-sm font-medium hover:underline">Add Friend</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Account Settings Section
const AccountSettings: React.FC<{ user: User | null, onToggle: () => void }> = ({ user, onToggle }) => {
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const [isGoogleConnected, setIsGoogleConnected] = useState(() => {
      // Check localStorage for Google connection (token)
      return Boolean(localStorage.getItem('google_access_token'));
    });
    
    const teacherFeatures = [
        "Create custom classes for your students",
        "Customize quizzes and assignments for your students",
        "Manage your students activity",
        "Track the progress of your students"
    ];
    const extensionFeatures = [
        "Use our Chrome Extension for seamless learning while you browse.",
        "See foreign words on websites for practical learning.",
        "Learn at your own pace, no pressure.",
        "Access Language Planet anywhere, anytime."
    ];

    const handleTeacherActivation = () => {
        if (user?.is_teacher) {
            if (isGoogleConnected) {
                // Deactivate Google Classroom connection
                if (window.confirm('Are you sure you want to disconnect your Google Classroom account?')) {
                  localStorage.removeItem('google_access_token');
                  setIsGoogleConnected(false);
                  alert('Google Classroom disconnected.');
                }
            } else {
                // Deactivate teacher panel
                onToggle();
            }
        } else {
            // Not a teacher: show modal, but make Google Classroom optional
            setShowGoogleModal(true);
        }
    };

    const GoogleLoginButton = ({ onSuccess, onFailure, onPermissionError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Starting admin OAuth login...');
      
    //   const redirectUri = `${window.location.origin}/auth-callback`;
    const redirectUri = "http://localhost:3000/auth-callback"; // Use your actual redirect URI here
      console.log('Redirect URI:', redirectUri);
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(client_id)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(ADMIN_SCOPES)}&` +
        `response_type=token&` +
        `include_granted_scopes=true&` +
        `access_type=online&` +
        `state=admin_login`;
      
      console.log('Redirecting to:', authUrl);
      window.location.href = authUrl;

    } catch (error) {
      console.error('Admin login error:', error);
      setIsLoading(false);
      
      // Check for ProjectPermissionDenied error
      if (error.message?.includes('ProjectPermissionDenied') || 
          error.message?.includes('The Developer Console project is not permitted')) {
        onPermissionError();
      } else {
        onFailure(error);
        alert(`Login failed: ${error.message}`);
      }
    }
    };
  
    return (
      <button
        onClick={handleLogin}
        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
            Connect with Google
          </>
        )}
      </button>
    );
  };
  
      const GoogleConnectionModal = () => (
          showGoogleModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                      <div className="text-center mb-6">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl">🎓</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">Connect Google Classroom (Optional)</h3>
                          <p className="text-sm text-gray-600">
                              You can connect your Google account to link with Google Classroom for seamless class management. This step is optional. You can activate your teacher panel without connecting Google Classroom.
                          </p>
                      </div>
  
                      <div className="space-y-4 mb-6">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <FiCheck className="text-green-500" />
                              <span className="text-sm text-gray-700">Import existing classes from Google Classroom</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <FiCheck className="text-green-500" />
                              <span className="text-sm text-gray-700">Sync student rosters automatically</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <FiCheck className="text-green-500" />
                              <span className="text-sm text-gray-700">Share assignments and resources seamlessly</span>
                          </div>
                      </div>
  
                      <div className="space-y-3">
                          <GoogleLoginButton
                              onSuccess={() => {
                                setIsGoogleConnected(true);
                                setShowGoogleModal(false);
                                alert('Google Classroom connected!');
                              }}
                              onFailure={() => {
                                alert('Google login failed');
                              }}
                              onPermissionError={() => {
                                alert('Google Classroom API permission error. Please check your Google Cloud project.');
                              }}
                          />
                          <button
                              onClick={() => {
                                setShowGoogleModal(false);
                                // Allow teacher activation without Google
                                onToggle();
                              }}
                              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                          >
                            Continue without Google
                          </button>
                          <button
                              onClick={() => setShowGoogleModal(false)}
                              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                          >
                              Cancel
                          </button>
                      </div>
                  </div>
              </div>
          )
      );
    
      return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Account Settings</h2>
        <p className="text-sm text-gray-500 mb-6">Some other perks we have for you</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Teacher’s Panel</h3>
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-500 shadow-sm text-xl">
                <span role="img" aria-label="teacher">👩‍🏫</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 font-semibold mb-4">Free</p>
            <ul className="text-sm list-none text-gray-700 space-y-2 flex-grow">
              {teacherFeatures.map((feat, i) => (
                <li key={i} className="flex items-start gap-2">
                  <FiCheck className="text-blue-500 mt-1 flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleTeacherActivation}
              className={`w-full mt-6 text-sm font-bold py-3 rounded-lg transition-colors ${user?.is_teacher ? (isGoogleConnected ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300') : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              {user?.is_teacher
                ? (isGoogleConnected ? 'Deactivate Google Classroom' : 'Deactivate Teacher Panel')
                : 'Activate Teacher Panel'}
            </button>
          </div>

          <div className="bg-blue-600 p-6 rounded-2xl text-white flex flex-col">
             <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white text-lg">Chrome Extension</h3>
            <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center text-white text-xl">
               <span role="img" aria-label="extension">🧩</span>
            </div>
          </div>
          <p className="text-sm text-blue-200 font-semibold mb-4">$5/Monthly</p>
          <ul className="text-sm list-none text-blue-100 space-y-2 flex-grow">
             {extensionFeatures.map((feat, i) => (
                <li key={i} className="flex items-start gap-2">
                    <FiCheck className="text-white mt-1 flex-shrink-0"/>
                    <span>{feat}</span>
                </li>
            ))}
          </ul>
          <button className="w-full mt-6 bg-white text-blue-600 font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors">
            Subscribe For Extension
          </button>
        </div>
        </div>
        <GoogleConnectionModal />
      </div>
    );
};

// --- Main Profile Page Component ---
const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${Server_url}/api/users/current`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    };
    fetchUser();
  }, []);

  const handleToggleTeacherPanel = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${Server_url}/api/users/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ is_teacher: !user.is_teacher }),
      });
      if (!res.ok) throw new Error('Failed to update teacher role');
      window.location.reload(); // Force full page reload
    } catch (err) {
      console.error('Error updating teacher panel role:', err);
      alert('Failed to update teacher panel status');
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="flex min-h-screen bg-gray-50 font-sans flex-col lg:flex-row">
        <Sidebar isMobileMenuOpen={isSidebarOpen} toggleMobileMenu={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex-1 flex flex-col lg:ml-64">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

          <main className="flex-grow p-3 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="flex flex-col gap-6">
              {/* Top Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PersonalInfoCard user={user} />
                </div>
                <div className="lg:col-span-1">
                  <FriendsCard />
                </div>
              </div>

              {/* Bottom Row */}
              <div>
                <AccountSettings user={user} onToggle={handleToggleTeacherPanel} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Parse the hash fragment for tokens
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    if (accessToken) {
      localStorage.setItem("google_access_token", accessToken);
      // You can also store other params if needed
    }

    // Redirect to profile or dashboard
    navigate("/profile", { replace: true });
  }, [navigate]);

  return <div>Authenticating...</div>;
};

export default ProfilePage;
export { AuthCallback };