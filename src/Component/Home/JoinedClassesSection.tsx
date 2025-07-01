import React, { useEffect, useState } from 'react';
import ClassCard from './ClassCard.tsx';
import Server_url from '../../config.js';
import './Style.css';

const JoinedClassesSection = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        let res = await fetch(`${Server_url}/api/classrooms/my-classrooms/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        let data = await res.json();
        let classesList = data.results || data;

        // If no classes found, try student endpoint
        if (!classesList.length) {
          res = await fetch(`${Server_url}/api/classrooms/enrolled/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          data = await res.json();
          classesList = data.results || data;
        }

        setClasses(classesList.slice(0, 2));
      } catch {
        setClasses([]);
      }
      setLoading(false);
    };
    fetchClasses();
  }, []);

  return (
    <div className="joined-classes-section">
      <div className="joined-classes-header">
        <h2 className="section-title">Joined Classes</h2>
        <button className="view-all-button">
          <span className="view-all-text">View All</span>
          <img 
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/84f114468c32a8742b810c1d02fef2aa97bc858e?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b" 
            alt="Arrow right" 
            className="arrow-icon" 
          />
        </button>
      </div>

      <div className="class-cards-list">
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading...</div>
        ) : classes.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No classes found.</div>
        ) : (
          classes.map((classItem, index) => (
            <ClassCard
              key={classItem.id || index}
              icon={classItem.image || ""}
              title={classItem.title}
              teacher={classItem.teacher_name ? `Teacher: ${classItem.teacher_name}` : ""}
              status={classItem.status || ""}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default JoinedClassesSection;
