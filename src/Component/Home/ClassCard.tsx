import React from 'react';
import './Style.css';

const ClassCard = ({ icon, title, teacher, status }) => {
  return (
  <div className="class-card">
  <div className="class-card-header">
    <div className="class-card-left">
      <img src={icon} alt={title} className="class-card-icon" />
      <div className="class-card-topic">{title}</div>
      <div className="class-card-teacher">{teacher}</div>
    </div>
    <div className="class-card-right">
      <div className="class-card-status">{status}</div>
      <button className="class-card-button">Go to Class</button>
    </div>
  </div>
</div>

  );
};

export default ClassCard;
