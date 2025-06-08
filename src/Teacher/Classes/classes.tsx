import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import Header from '../../Component/Home/Header.tsx';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import { useNavigate } from 'react-router-dom';
import Server_url from '../../config';
// Interface representing each class
interface Class {
  id: string;
  title: string;
  description: string;
  is_private: boolean;
  image: string;
  students?: number;
}

// Component props for a single class card
interface ClassCardProps {
  classItem: Class;
}

const ClassCard: React.FC<ClassCardProps> = ({ classItem }) => {
  const isPrivate = classItem.is_private;
  const accessLabel = isPrivate ? 'Private' : 'Public';
  const imageUrl = `${classItem.image}`;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col overflow-hidden relative">
      {/* Top: Class Image + Dots */}
      <div className="absolute top-[1.5rem] right-[1rem] cursor-pointer text-gray-500 hover:text-gray-800">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
  </svg>
</div>

      <div className="w-[100px] h-[100px] p-4 relative">
        <img
          src={imageUrl}
          alt={classItem.title}
          className="w-full h-full object-cover rounded-[5px]"
          onError={(e) => {
            e.currentTarget.src =
              'https://via.placeholder.com/50x50/CCCCCC/FFFFFF?text=No+Image';
          }}
        />
      </div>
        {/* Three dots icon at top-right */}
       

      {/* Middle: Title and Description */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {classItem.title}
        </h3>
        <p className="text-sm text-gray-600">{classItem.description}</p>

        {/* Horizontal line */}
        <hr className="my-3 border-gray-200" />

        {/* Bottom: Public/Private + Student count */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isPrivate
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {accessLabel}
          </span>

          <div className="flex items-center text-gray-600 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 015.356-1.857M17 20v-2c0-.653-.133-1.272-.375-1.84M2 12A8 8 0 0110 4h.01M17 12a8 8 0 01-16 0"
              />
            </svg>
            {classItem.students || 20} Students
          </div>
        </div>
      </div>
    </div>
  );
};

const ClassDashboard: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const navigate = useNavigate();

  const API_URL = `${Server_url}/api/classrooms/classroom/`;
const TOKEN = localStorage.getItem("authToken"); // Replace with your actual token

useEffect(() => {
  const fetchClasses = async () => {
    try {
      const response = await axios.get<Class[]>(API_URL, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      setClasses(response.data);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || 'An error occurred fetching classes.');
      } else {
        setError('Failed to fetch classes.');
      }
    } finally {
      setLoading(false);
    }
  };

  fetchClasses();
}, []);


  const filteredClasses = classes
    .filter((classItem) =>
      classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((classItem) => {
      if (filterValue === 'public') return !classItem.is_private;
      if (filterValue === 'private') return classItem.is_private;
      return true;
    });

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100">
        <div className="flex flex-col p-[1%] ml-[17%]">
      <Header />
        </div>
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-grow p-8 ml-[17%]">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
  {/* Search and Filter Group */}
  <div className="flex items-center w-full md:w-2/3 gap-3">
    
    {/* Search */}
    <div className="relative w-[70%]">
      <input
        type="text"
        placeholder="Search here..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    {/* Filter (placed to the right of search) */}
    <select
      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      value={filterValue}
      onChange={(e) => setFilterValue(e.target.value)}
    >
      <option value="">All</option>
      <option value="public">Public</option>
      <option value="private">Private</option>
    </select>
  </div>

  {/* Create New Class Button (remains on the right side on wider screens) */}
  <button
    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
    onClick={() => navigate('/create-class')}
  >
    + Create New Class
  </button>
</div>

          {/* Content Area */}
          {loading && <div className="text-center text-lg text-gray-600">Loading classes...</div>}
          {error && <div className="text-center text-red-600 text-lg">Error: {error}</div>}
          {!loading && !error && filteredClasses.length === 0 && (
            <div className="text-center text-gray-600 text-lg">No classes found.</div>
          )}
          {!loading && !error && filteredClasses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((classItem) => (
                <ClassCard key={classItem.id} classItem={classItem} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDashboard;
