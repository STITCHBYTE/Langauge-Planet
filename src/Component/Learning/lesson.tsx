import React from 'react';
import { FiClock } from 'react-icons/fi';
import './Learning.css'; // Styles are shared in the same CSS file

// Updated to match the props needed for the UI replica
export interface LessonCardProps {
  title: string;
  description: string;
  image: string;
  progress?: number;
  timeLeft?: string;
  duration?: string;
}

const LessonCard: React.FC<LessonCardProps> = ({ title, description, image, progress, timeLeft, duration }) => {
    return (
        <article className="lesson-card">
            <div className="card-icon-container">
                <img src={image} alt={`${title} icon`} className="card-icon" />
            </div>
            <h3 className="card-title">{title}</h3>
            <p className="card-description">{description}</p>
            <div className="card-footer">
                {/* Conditionally render progress or duration */}
                {progress !== undefined && timeLeft ? (
                    <div className="progress-info">
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="progress-text">{progress}% Complete</span>
                        <span className="time-left">
                            <FiClock />
                            {timeLeft}
                        </span>
                    </div>
                ) : (
                    <div className="duration-info">
                        <FiClock />
                        <span>{duration}</span>
                    </div>
                )}
            </div>
        </article>
    );
};

export default LessonCard;