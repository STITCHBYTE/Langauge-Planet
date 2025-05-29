import React from 'react';
import './Learning.css'; 

const LEVELS = [
  "Beginner Level",
  "Intermediate Level",
  "Advance Level",
  "Professional Level"
];

const LessonTabs = () => {
  return (
    <nav style={{ margin: '20px 0' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        {LEVELS.map((level, index) => (
          <button
            key={level}
            style={{
              padding: '10px 20px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: index === 0 ? '#007bff' : '#fff',
              color: index === 0 ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            {level}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default LessonTabs;