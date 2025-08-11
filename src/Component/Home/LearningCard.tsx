import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Style.css';

interface LearningCardProps {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  progress?: string | null;
}

const LearningCard = ({ id, icon, title, subtitle, progress }: LearningCardProps) => {
  const navigate = useNavigate();

  const handleGoToLesson = () => {
    navigate(`/lesson/${id}`);
  };

  return (
    <button className="learning-card" onClick={handleGoToLesson}>
      <div className="learning-card-header">
        <div className="icon-wrapper">
          <img src={icon} alt={title} className="icon-image" />
        </div>
        {progress && (
          <div className="progress-badge">
            <span className="progress-text">{progress}</span>
          </div>
        )}
      </div>
      <h3 className="card-title">{title}</h3>
      <div className="subtitle-row">
        <p className="card-subtitle">{subtitle}</p>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/84f114468c32a8742b810c1d02fef2aa97bc858e?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b"
          alt="Arrow"
          className="arrow-icon-rotated"
        />
      </div>
    </button>
  );
};

export default LearningCard;
