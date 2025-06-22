import React from 'react';
import { FiClock, FiCheckCircle } from 'react-icons/fi';
import './Learning.css'; // Styles are shared in the same CSS file

const LessonCard = ({ title, description, icon, progress, timeLeft, isCompleted }) => {
    return (
        <article className="lesson-card">
            <div className="card-icon-container">
                <img src={icon} alt={`${title} icon`} className="card-icon" />
            </div>
            <h3 className="card-title">{title}</h3>
            <p className="card-description">{description}</p>
            <div className="card-footer">
                {isCompleted ? (
                    <div className="status-completed">
                        <FiCheckCircle />
                        <span>Completed</span>
                    </div>
                ) : (
                    <>
                        {progress && (
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                <span className="progress-text">{progress}% Complete</span>
                            </div>
                        )}
                        {timeLeft && (
                            <div className="time-left">
                                <FiClock />
                                <span>{timeLeft}</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </article>
    );
};

export default LessonCard;