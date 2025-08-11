import React from 'react';
import ClassCard from './ClassCard.tsx';
import './Style.css';

const JoinedClassesSection = ({ joinedClasses }) => {
  console.log('joinedClasses:', joinedClasses); // Add this line

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
        {joinedClasses.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No classes found.</div>
        ) : (
          joinedClasses.map((c, index) => {
            console.log('Class object:', c); // Debug: see all keys
            const classId = c.class_id || c.id || c._id || c.classId;
            return (
              <ClassCard
                key={classId}
                id={classId}
                icon={getFullImageUrl(c.image)}
                title={c.title}
                teacher={c.teacher_name ? `Teacher: ${c.teacher_name}` : ""}
                status={c.status || ""}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default JoinedClassesSection;
