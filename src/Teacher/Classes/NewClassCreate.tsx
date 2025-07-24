import React, { useState, ChangeEvent, FormEvent } from 'react';
import Header from '../../Component/Home/Header.tsx';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import { useNavigate } from 'react-router-dom';
import Server_url from '../../config';
import { toast } from 'react-toastify';

const ClassForm: React.FC = () => {
 const [title, setTitle] = useState('');
  const [accessType, setAccessType] = useState<'public' | 'private'>('public'); // changed
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [descriptionWordCount, setDescriptionWordCount] = useState(0);
  const navigate = useNavigate();


  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setDescription(text);
    setDescriptionWordCount(text.split(/\s+/).filter((word) => word.length > 0).length);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) setImage(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('is_private', accessType === 'private' ? 'true' : 'false');
  if (image) {
    formData.append('image', image);
  }

  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`${Server_url}/api/classrooms/classroom/create/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`, 
      },
      body: formData,
    });

    if (response.ok) {
       const data = await response.json();
       const classId = data.id;
       toast.success('Class created successfully!');

       const googleToken = localStorage.getItem('google_access_token');
       let googleUserId = localStorage.getItem('google_user_id');
       if (googleToken) {
         try {
           let tokenValid = false;
           if (!googleUserId) {
             const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
               headers: { Authorization: `Bearer ${googleToken}` }
             });
             if (userInfoRes.ok) {
               const userInfo = await userInfoRes.json();
               googleUserId = userInfo.sub;
               if (googleUserId) {
                 localStorage.setItem('google_user_id', googleUserId);
                 tokenValid = true;
               }
             } else {
               const errText = await userInfoRes.text();
               toast.error('Your Google login has expired or is invalid. Please reconnect your Google account.');
               
               return;
             }
           } else {
             tokenValid = true;
           }

           if (tokenValid && googleUserId) {
             const gcRes = await fetch('https://classroom.googleapis.com/v1/courses', {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${googleToken}`
               },
               body: JSON.stringify({
                 name: title,
                 description,
                 ownerId: googleUserId,
                 section: classId, 
                 courseState: 'PROVISIONED',
               })
             });

             if (gcRes.ok) {
               const gcData = await gcRes.json();
               toast.success('Class also created in Google Classroom!');
             } else {
               const errData = await gcRes.json();
               try {
                 const axios = (await import('axios')).default;
                 await axios.delete(`${Server_url}/api/classrooms/classroom/${classId}/delete/`, {
                   headers: { 'Authorization': `Bearer ${token}` }
                 });
                 toast.error(
                   'Failed to create class in Google Classroom. The class was removed from your database.\n' +
                   'Google API Error: ' + (errData.error?.message || JSON.stringify(errData))
                 );
               } catch (deleteErr) {
                 toast.error('Failed to create class in Google Classroom, and failed to delete from database. Please contact support.');
               }
               return;
             }
           }
         } catch (gcErr) {
           toast.error('Unexpected error syncing with Google Classroom: ' + (gcErr.message || gcErr));
           return;
         }
       } else {
       }

       setTitle('');
       setDescription('');
       setAccessType('public');
       setImage(null);
       setDescriptionWordCount(0);
       navigate(`/Class_info_Page/${classId}`);
    } else {
      const errorData = await response.json();
      toast.error('Failed to create class.');
    }
  } catch (error) {
    toast.error('Something went wrong. Try again.');
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="w-full">
        <Header />
      </div>

      <div className="flex flex-1">
        <div className="hidden lg:block w-64 bg-white shadow-md">
          <Sidebar />
        </div>

        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-5xl mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Basic Details</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mb-6">Fill out the basic details for this class</p>

                  <div className="mb-6">
                    <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Class Title<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      placeholder="Enter class title"
                    />
                  </div>

                  <div className="mb-6">
  <label htmlFor="accessType" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
    Access Type<span className="text-red-500">*</span>
  </label>
  <select
    id="accessType"
    value={accessType}
    onChange={(e) => setAccessType(e.target.value as 'public' | 'private')}
    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
  >
    <option value="public">Public</option>
    <option value="private">Private</option>
  </select>
</div>

                  <div className="mb-6">
                    <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Class Description<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={handleDescriptionChange}
                      rows={4}
                      maxLength={500}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm resize-y"
                      placeholder="Enter description"
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500">{descriptionWordCount}/100 words</p>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Class Display Image</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mb-6">Upload a display image for this class</p>

                  <div className="flex justify-center items-center h-40 sm:h-56 md:h-64 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition relative group">
                    <input
                      type="file"
                      id="displayImageUpload"
                      accept="image/png, image/jpeg, image/jpg, image/gif"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {image ? (
                      <div className="text-center">
                        <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-32 sm:max-h-40 md:max-h-56 mx-auto object-contain" />
                        <p className="mt-2 text-xs sm:text-sm text-gray-600">{image.name}</p>
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
              <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassForm;
