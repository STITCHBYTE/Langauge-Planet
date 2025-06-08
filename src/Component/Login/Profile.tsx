import React, { useEffect, useState } from 'react';
import Sidebar from '../Home/Sidebar.tsx';
import Header from '../Home/Header.tsx';
import Server_url from '../../config';

export default function ProfilePanel() {

  interface User {
    first_name: string;
    last_name?: string;
    username: string;
    is_teacher: boolean;
  }
  const [user, setUser] = useState<User | null>(null);
  const Name = user?.first_name || 'User';
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${Server_url}/api/users/current`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
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
  try {
    const res = await fetch(`${Server_url}/api/users/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        is_teacher: !user?.is_teacher,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to update teacher role');
    }

    // Refresh the entire page
    window.location.reload(); // 👈 this line forces full page reload
  } catch (err) {
    console.error('Error updating teacher panel role:', err);
    alert('Failed to update teacher panel status');
  }
};

  console.log('User:', user?.first_name, user?.last_name, user?.username, user?.is_teacher);
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ marginLeft: '17%' }}>
        {/* Sidebar */}
      
          <Sidebar />

        {/* Main Panel */}
        <div className="col-span-4 space-y-6">
          {/* Header */}
         <Header />

          {/* User Info and Friends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
            {/* Personal Info */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Personal Info</h2>
                <button className="text-blue-500 text-sm">Copy Profile Link</button>
              </div>
              <div>
                <label className="text-sm font-medium">Name & Username</label>
               <input
  className="w-full border rounded px-3 py-2 mt-1"
  value={user ? `${user.first_name} ${user.last_name || ''}`.trim() : ''}
  disabled
/>

<input
  className="w-full border rounded px-3 py-2 mt-2"
  value={user?.username || ''}
  disabled
/>

              </div>
              <div>
                <label className="text-sm font-medium">Profile Picture</label>
                <div className="border border-dashed rounded-lg h-32 flex items-center justify-center mt-2">
                  <span className="text-gray-400">Tap to Upload</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Languages</label>
                <div className="flex gap-2 mt-2">
                  <img src="https://flagcdn.com/gb.svg" alt="English" className="w-6 h-4" />
                  <img src="https://flagcdn.com/es.svg" alt="Spanish" className="w-6 h-4" />
                  <img src="https://flagcdn.com/fr.svg" alt="French" className="w-6 h-4" />
                </div>
              </div>
              <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Save Changes</button>
            </div>

            {/* Friends Panel */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <h2 className="text-lg font-semibold">My Friends</h2>
              {[...Array(3)].map((_, idx) => (
                <div className="flex items-center justify-between" key={idx}>
                  <div className="flex items-center gap-3">
                    <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="Friend" className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="text-sm font-medium">Samuel Jacob</div>
                      <div className="text-xs text-gray-500">@sammy</div>
                    </div>
                  </div>
                  <button className="text-blue-500 text-sm">Remove Friend</button>
                </div>
              ))}

              <h3 className="mt-4 font-medium">Suggested Friends</h3>
              {[...Array(3)].map((_, idx) => (
                <div className="flex items-center justify-between" key={idx}>
                  <div className="flex items-center gap-3">
                    <img src="https://randomuser.me/api/portraits/men/2.jpg" alt="Suggested" className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="text-sm font-medium">Samuel Jacob</div>
                      <div className="text-xs text-gray-500">@sammy</div>
                    </div>
                  </div>
                  <button className="text-blue-500 text-sm">Add Friend</button>
                </div>
              ))}
            </div>
          </div>

          {/* Subscriptions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg shadow">
              <h2 className="font-semibold text-blue-600 mb-2">Teacher’s Panel</h2>
              <ul className="text-sm list-disc list-inside text-gray-700 space-y-1">
                <li>Create custom classes for your students</li>
                <li>Customize quizzes and assignments for your students</li>
                <li>Manage your students activity</li>
                <li>Track the progress of your students</li>
              </ul>
              {user?.is_teacher ? (
  <button className="mt-4 bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={handleToggleTeacherPanel}>
    Deactivate Teacher Panel
  </button>
) : (
  <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={handleToggleTeacherPanel}>
    Activate Teacher Panel
  </button>
)}

            </div>

            <div className="bg-blue-600 p-6 rounded-lg text-white shadow">
              <h2 className="font-semibold text-white mb-2">Chrome Extension</h2>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>Use our Chrome Extension for seamless learning</li>
                <li>See foreign words on websites for practical learning</li>
                <li>Learn at your own pace</li>
                <li>Access Language Planet anywhere, anytime</li>
              </ul>
              <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded">Subscribe For Extension</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}