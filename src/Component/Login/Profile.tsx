import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../Home/Sidebar.tsx';
import Header from '../Home/Header.tsx';
import Server_url, { client_id } from '../../config';
import { FiCopy, FiCheck, FiSearch } from 'react-icons/fi';
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

// --- Global Styles for Buttons and Inputs ---
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
interface User {
  first_name: string;
  last_name?: string;
  username: string;
  is_teacher: boolean;
  avatar_url?: string;
}

const ADMIN_SCOPES =
  "openid profile email " +
  "https://www.googleapis.com/auth/classroom.courses " +
  "https://www.googleapis.com/auth/classroom.coursework.students " +
  "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly " +
  "https://www.googleapis.com/auth/classroom.announcements " +
  "https://www.googleapis.com/auth/classroom.rosters " +
  "https://www.googleapis.com/auth/classroom.profile.emails " +
  "https://www.googleapis.com/auth/classroom.profile.photos";

const HAPPY_MOUTH_TYPES = ['smile', 'twinkle', 'eating', 'tongue', 'concerned'];
const EYES_TYPES = ['default', 'happy', 'wink', 'squint', 'hearts', 'side'];
const HAIR_COLOR = ['#2c1b18', '#4a312c', '#af6e51', '#e8e1e1', '#d2b48c', '#a55728', '#b58143'];
const SKIN_COLOR = ['#f8d25c', '#ffdbb4', '#edb0a1', '#d08b5b', '#a0522d', '#614335'];

const CHARACTER_OPTIONS = [
  { seed: 'Abby', name: 'Abby' },
  { seed: 'Max', name: 'Max' },
  { seed: 'Zoe', name: 'Zoe' },
  { seed: 'Leo', name: 'Leo' },
  { seed: 'Mia', name: 'Mia' },
  { seed: 'Sam', name: 'Sam' },
  { seed: 'Luna', name: 'Luna' },
  { seed: 'Jack', name: 'Jack' },
  { seed: 'Ruby', name: 'Ruby' },
  { seed: 'Oscar', name: 'Oscar' },
  { seed: 'Chloe', name: 'Chloe' },
  { seed: 'Toby', name: 'Toby' },
  { seed: 'Lily', name: 'Lily' },
  { seed: 'Finn', name: 'Finn' },
  { seed: 'Nora', name: 'Nora' },
  { seed: 'Milo', name: 'Milo' },
  { seed: 'Ella', name: 'Ella' },
  { seed: 'Owen', name: 'Owen' },
  { seed: 'Ivy', name: 'Ivy' },
  { seed: 'Levi', name: 'Levi' },
].map(char => ({
  ...char,
  style: 'avataaars',
  preview: `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.seed}`
}));

const CharacterSelectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter: (character: any) => void;
}> = ({ isOpen, onClose, onSelectCharacter }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-2 sm:p-6 w-full max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Choose Your Character</h3>
            <p className="text-sm text-gray-500">Select a character style to customize</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CHARACTER_OPTIONS.map((character) => (
            <div key={character.id} className="flex flex-col items-center">
              <button
                onClick={() => onSelectCharacter(character)}
                className="w-20 h-20 rounded-full border-2 border-gray-200 hover:border-blue-400 transition-colors p-1 mb-2 bg-gray-50 hover:bg-blue-50"
              >
                <img
                  src={character.preview}
                  alt={character.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.seed}`;
                  }}
                />
              </button>
              <span className="text-xs font-medium text-gray-600 text-center">{character.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AvatarEditor: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  initialAvatarUrl: string;
  selectedCharacter?: any;
}> = ({ isOpen, onClose, onSave, initialAvatarUrl, selectedCharacter }) => {
  const [activeTab, setActiveTab] = useState<'customize' | 'stickers'>('customize');
  
  const [avatarConfig, setAvatarConfig] = useState({
    mouth: 'smile',
    eyes: 'happy',
    hairColor: '4a312c',
    skinColor: 'ffdbb4',
    seed: 'default',
  });

  const [selectedExpression, setSelectedExpression] = useState<object | null>(null);

  const buildAvatarUrl = (config: object) => {
    const params = new URLSearchParams(config as Record<string, string>);
    return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
  };

  const finalAvatarUrl = useMemo(() => {
    const finalConfig = selectedExpression
      ? { ...avatarConfig, ...selectedExpression }
      : avatarConfig;
    return buildAvatarUrl(finalConfig);
  }, [avatarConfig, selectedExpression]);

  useEffect(() => {
    if (selectedCharacter) {
      setAvatarConfig({
        mouth: 'smile',
        eyes: 'happy',
        hairColor: '4a312c',
        skinColor: 'ffdbb4',
        seed: selectedCharacter.seed
      });
      setSelectedExpression(null);
    }
  }, [selectedCharacter]);

  const stickerExpressions = [
    { name: 'Smiling', config: { eyes: 'happy', mouth: 'smile' } },
    { name: 'Laughing', config: { eyes: 'squint', mouth: 'twinkle' } },
    { name: 'Winking', config: { eyes: 'wink', mouth: 'smile' } },
    { name: 'In Love', config: { eyes: 'hearts', mouth: 'eating' } },
    { name: 'Grinning', config: { eyes: 'happy', mouth: 'smile' } },
    { name: 'Cheeky', config: { eyes: 'winkWacky', mouth: 'tongue' } },
  ];

  if (!isOpen) return null;

  const handleSelectSticker = (stickerConfig: object, stickerName: string) => {
    setSelectedExpression(stickerConfig); 
    toast.info(`${stickerName} selected as profile picture!`);
  };
  
  const handleTabSwitch = (tab: 'customize' | 'stickers') => {
    if (tab === 'customize') {
      setSelectedExpression(null);
    }
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-2 sm:p-6 w-full max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex-shrink-0 flex flex-col items-center gap-4 bg-gray-100 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-gray-800">Your Avatar</h3>
          {selectedCharacter && (
            <div className="text-center mb-2">
              <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {selectedCharacter.name}
              </span>
            </div>
          )}
          <img 
            src={finalAvatarUrl} 
            alt="Avatar Preview" 
            className="w-48 h-48 rounded-full border-4 border-white shadow-md bg-white" 
          />
          
          <div className="flex gap-2 bg-gray-200 p-1 rounded-full">
            <button 
              onClick={() => handleTabSwitch('customize')}
              className={`px-4 py-1 text-sm font-semibold rounded-full ${activeTab === 'customize' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
            >
              Customize
            </button>
            <button 
              onClick={() => handleTabSwitch('stickers')}
              className={`px-4 py-1 text-sm font-semibold rounded-full ${activeTab === 'stickers' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
            >
              Stickers
            </button>
          </div>
        </div>

        <div className="flex-grow">
          {activeTab === 'customize' ? (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Customize Your Look</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Eyes</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {EYES_TYPES.map(eye => (
                      <button key={eye} onClick={() => setAvatarConfig(prev => ({...prev, eyes: eye}))}
                        className={`px-3 py-1 text-xs rounded-full border-2 ${avatarConfig.eyes === eye ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      >{eye}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Mouth (Happy Styles)</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {HAPPY_MOUTH_TYPES.map(mouth => (
                      <button key={mouth} onClick={() => setAvatarConfig(prev => ({...prev, mouth: mouth}))}
                        className={`px-3 py-1 text-xs rounded-full border-2 ${avatarConfig.mouth === mouth ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      >{mouth}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Hair Color</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {HAIR_COLOR.map(color => (
                       <button key={color} onClick={() => setAvatarConfig(prev => ({...prev, hairColor: color.replace('#','')}))}
                        className={`w-8 h-8 rounded-full border-2 ${avatarConfig.hairColor === color.replace('#','') ? 'border-blue-500' : 'border-gray-200'}`}
                        style={{ backgroundColor: color }}
                      ></button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Skin Color</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SKIN_COLOR.map(color => (
                       <button key={color} onClick={() => setAvatarConfig(prev => ({...prev, skinColor: color.replace('#','')}))}
                        className={`w-8 h-8 rounded-full border-2 ${avatarConfig.skinColor === color.replace('#','') ? 'border-blue-500' : 'border-gray-200'}`}
                        style={{ backgroundColor: color }}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
               <h3 className="text-xl font-bold text-gray-800 mb-2">Create a Sticker</h3>
               <p className="text-sm text-gray-500 mb-4">Click a sticker to set it as your profile picture.</p>
               <div className="grid grid-cols-3 gap-4">
                 {stickerExpressions.map(sticker => {
                   const stickerUrl = buildAvatarUrl({...avatarConfig, ...sticker.config});
                   return (
                     <div key={sticker.name} className="flex flex-col items-center gap-2">
                       <button onClick={() => handleSelectSticker(sticker.config, sticker.name)}
                         className={`rounded-full p-1 border-2 hover:border-blue-400 ${finalAvatarUrl === stickerUrl ? 'border-blue-500' : 'border-transparent'}`}
                       >
                         <img src={stickerUrl} alt={sticker.name} className="w-20 h-20 rounded-full bg-gray-200" />
                       </button>
                       <span className="text-xs font-medium text-gray-600">{sticker.name}</span>
                     </div>
                   );
                 })}
               </div>
            </div>
          )}

          <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
            <button onClick={onClose} className="btn-secondary w-full justify-center">Cancel</button>
            <button onClick={() => onSave(finalAvatarUrl)} className="btn-primary w-full justify-center">Save Avatar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PersonalInfoCard: React.FC<{
  user: User | null,
  setShowGoogleModal: (show: boolean) => void,
  isGoogleConnected: boolean,
  handleDeactivation: () => void
}> = ({ user, setShowGoogleModal, isGoogleConnected, handleDeactivation }) => {
  const [copied, setCopied] = useState(false);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [displayAvatarUrl, setDisplayAvatarUrl] = useState(`https://api.dicebear.com/7.x/avataaars/svg?seed=1`);

  useEffect(() => {
    if (user?.avatar_url) {
      setDisplayAvatarUrl(user.avatar_url);
    }
  }, [user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectCharacter = (character: any) => {
    setSelectedCharacter(character);
    setShowCharacterSelection(false);
    setShowAvatarEditor(true);
  };

  const handleSaveAvatar = async (url: string) => {
    setDisplayAvatarUrl(url); 
    setShowAvatarEditor(false); 
    setSelectedCharacter(null);
    
    try {
      const res = await fetch(`${Server_url}/api/users/user/update-avatar/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ avatar_url: url }),
      });
      if (!res.ok) throw new Error('Failed to update avatar on server');
      toast.success('Avatar updated successfully!');
      window.location.reload();
    } catch (err) {
      toast.error('Failed to save avatar. Please try again.');
      if (user?.avatar_url) setDisplayAvatarUrl(user.avatar_url);
    }
  };

  return (
    <>
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
            <label className="text-sm font-medium text-gray-600 block mb-2">Avatar</label>
            <p className="text-xs text-gray-400 mb-2">Choose a character and customize your avatar</p>
            <div
              className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 flex flex-col items-center"
              onClick={() => setShowCharacterSelection(true)}
            >
              <img
                src={displayAvatarUrl}
                alt="User Avatar"
                className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                onError={e => { e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'; }}
              />
              <p className="text-sm font-semibold text-gray-700">Choose Character & Customize</p>
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

          {user?.is_teacher && (
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Platform Integrations</label>
              <p className="text-xs text-gray-400 mb-2">Connect your account to other learning platforms.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <button
                  className={`btn-secondary flex items-center justify-center gap-2 w-full py-3 ${isGoogleConnected ? 'text-red-500 border-red-300 hover:bg-red-50' : ''}`}
                  onClick={() => isGoogleConnected ? handleDeactivation() : setShowGoogleModal(true)}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  {isGoogleConnected ? 'Deactivate Google Classroom' : 'Connect Google Classroom'}
                </button>
                {/* <button
                  className="btn-secondary flex items-center justify-center gap-2 w-full py-3"
                  onClick={() => {
                    const clientId = '6mZnmwLrrhHc2wYzUNvAwH4tevY834BBWCUfkAMKCZBTT8mzUBUWkBfVwENKuvPY'; // Your developer API key
                    const redirectUri = encodeURIComponent(window.location.origin + '/canvas-auth-callback');
                    const canvasDomain = 'https://canvas.instructure.com'; // Change if using a custom Canvas instance
                    const authUrl = `${canvasDomain}/login/oauth2/auth?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=url:GET|/api/v1/courses`;

                    window.location.href = authUrl;
                  }}
                >
                  <img src="https://static.instructure.com/images/canvas-logo.png" alt="Canvas" className="w-5 h-5" />
                  Connect with Canvas
                </button> */}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <CharacterSelectionModal
        isOpen={showCharacterSelection}
        onClose={() => setShowCharacterSelection(false)}
        onSelectCharacter={handleSelectCharacter}
      />
      
      <AvatarEditor 
        isOpen={showAvatarEditor}
        onClose={() => {
          setShowAvatarEditor(false);
          setSelectedCharacter(null);
        }}
        onSave={handleSaveAvatar}
        initialAvatarUrl={displayAvatarUrl}
        selectedCharacter={selectedCharacter}
      />
    </>
  );
};
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
const AccountSettings: React.FC<{
  user: User | null,
  showGoogleModal: boolean,
  setShowGoogleModal: (show: boolean) => void,
  isGoogleConnected: boolean,
  handleTeacherActivation: () => void
}> = ({ user, showGoogleModal, setShowGoogleModal, isGoogleConnected, handleTeacherActivation }) => {

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

    const GoogleLoginButton = ({ onSuccess, onFailure, onPermissionError }) => {
      const [isLoading, setIsLoading] = useState(false);

      const handleLogin = async () => {
        try {
          setIsLoading(true);
          const redirectUri = "http://localhost:3000/auth-callback";

          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${encodeURIComponent(client_id)}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${encodeURIComponent(ADMIN_SCOPES)}&` +
            `response_type=token&` +
            `include_granted_scopes=true&` +
            `access_type=online&` +
            `state=admin_login`;

          window.location.href = authUrl;
        } catch (error) {
          setIsLoading(false);
          if (error.message?.includes('ProjectPermissionDenied') ||
              error.message?.includes('The Developer Console project is not permitted')) {
            onPermissionError();
          } else {
            onFailure(error);
            toast.error(`Login failed: ${error.message}`);
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
                            You can connect your Google account to link with Google Classroom for seamless class management. This step is optional.
                        </p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <FiCheck className="text-green-500" />
                            <span className="text-sm text-gray-700">Import existing classes</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <FiCheck className="text-green-500" />
                            <span className="text-sm text-gray-700">Sync student rosters</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <FiCheck className="text-green-500" />
                            <span className="text-sm text-gray-700">Share assignments and resources</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <GoogleLoginButton
                            onSuccess={() => {
                              toast.success('Google Classroom connected!');
                              setShowGoogleModal(false);
                            }}
                            onFailure={() => toast.error('Google login failed')}
                            onPermissionError={() => toast.error('Google Classroom API permission error.')}
                        />
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
              className={`w-full mt-6 text-sm font-bold py-3 rounded-lg transition-colors ${user?.is_teacher ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              {user?.is_teacher ? 'Deactivate Teacher Panel' : 'Activate Teacher Panel'}
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
const DeactivationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl" role="img" aria-label="warning">⚠️</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Are you sure?</h3>
        <p className="text-sm text-gray-600 mb-6">
          Deactivating your Teacher Panel will also disconnect your Google Classroom integration. You will lose access to teacher-specific features.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Confirm Deactivation
          </button>
        </div>
      </div>
    </div>
  );
};
const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showDeactivationModal, setShowDeactivationModal] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(() => {
    return Boolean(localStorage.getItem('google_access_token'));
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${Server_url}/api/users/current`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
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
      window.location.reload(); 
    } catch (err) {
      toast.error('Failed to update teacher panel status');
    }
  };

  const handleTeacherActivation = () => {
    if (user?.is_teacher) {
      setShowDeactivationModal(true);
    } else {
      handleToggleTeacherPanel();
      toast.success('Teacher Panel has been activated!');
    }
  };

  const handleConfirmDeactivation = () => {
    localStorage.removeItem('google_access_token');
    setIsGoogleConnected(false);
    handleToggleTeacherPanel(); 
    toast.success('Teacher Panel and Google Classroom disconnected.');
    setShowDeactivationModal(false);
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PersonalInfoCard
                    user={user}
                    setShowGoogleModal={setShowGoogleModal}
                    isGoogleConnected={isGoogleConnected}
                    handleDeactivation={handleTeacherActivation}
                  />
                </div>
                <div className="lg:col-span-1">
                  <FriendsCard />
                </div>
              </div>

              <div>
                <AccountSettings 
                    user={user} 
                    showGoogleModal={showGoogleModal} 
                    setShowGoogleModal={setShowGoogleModal} 
                    isGoogleConnected={isGoogleConnected} 
                    handleTeacherActivation={handleTeacherActivation} 
                />
              </div>
            </div>
          </main>
        </div>
        <DeactivationModal
          isOpen={showDeactivationModal}
          onClose={() => setShowDeactivationModal(false)}
          onConfirm={handleConfirmDeactivation}
        />
      </div>
    </>
  );
}

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    if (accessToken) {
      localStorage.setItem("google_access_token", accessToken);
    }

    navigate("/profile", { replace: true });
  }, [navigate]);

  return <div>Authenticating...</div>;
};

export default ProfilePage;
export { AuthCallback };

export const CanvasAuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (code) {
      fetch("https://canvas.instructure.com/login/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: "6mZnmwLrrhHc2wYzUNvAwH4tevY834BBWCUfkAMKCZBTT8mzUBUWkBfVwENKuvPY",
          client_secret: "6mZnmwLrrhHc2wYzUNvAwH4tevY834BBWCUfkAMKCZBTT8mzUBUWkBfVwENKuvPY",
          redirect_uri: window.location.origin + "/canvas-auth-callback",
          code,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token) {
            localStorage.setItem("canvas_access_token", data.access_token);
            toast.success("Canvas connected!");
            navigate("/profile");
          } else {
            toast.error("Failed to connect Canvas.");
            navigate("/profile");
          }
        })
        .catch(() => {
          toast.error("Canvas OAuth failed.");
          navigate("/profile");
        });
    } else {
      toast.error("No Canvas code found.");
      navigate("/profile");
    }
  }, [location, navigate]);

  return <div>Connecting to Canvas...</div>;
};