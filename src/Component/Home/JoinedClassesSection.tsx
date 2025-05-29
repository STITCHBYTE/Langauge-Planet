import React from 'react';
import ClassCard from './ClassCard.tsx';
import './Style.css';

const classes = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/8200231253e2c77c3020e24561ad097a2c9c4f06?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b",
    title: "Cultures in Spanish",
    teacher: "Teacher: Carlos Juan",
    status: "• Pending Assignments"
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/8200231253e2c77c3020e24561ad097a2c9c4f06?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b",
    title: "Cultures in Spanish",
    teacher: "Teacher: Carlos Juan",
    status: "No Pending Assignments"
  }
];

const JoinedClassesSection = () => {
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
        {classes.map((classItem, index) => (
          <ClassCard
            // key={index}
            icon={classItem.icon}
            title={classItem.title}
            teacher={classItem.teacher}
            status={classItem.status}
          />
        ))}
      </div>
    </div>
  );
};

export default JoinedClassesSection;
