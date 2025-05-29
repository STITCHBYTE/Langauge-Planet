import React from 'react';
import BarChart from './BarChart.tsx';
import './Style.css';

const WeeklyStatsSection = () => {
  return (
    <div className="weekly-stats-container">
      <div className="weekly-stats-header">
        <div>
          <h2 className="weekly-stats-title">Hours Spent Weekly</h2>
          <div className="weekly-stats-trend">
            <span className="weekly-stats-increase">+2 hrs more than last week</span>
            <img 
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/35f7fe9431fc25d40c76323f74de4387b91a47e6?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b" 
              alt="Trending up" 
              className="weekly-stats-trending-icon" 
            />
          </div>
        </div>
        <button className="weekly-stats-button">
          <span className="weekly-stats-button-text">This Week</span>
          <img 
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/7ef29ac1a34103720c532206d4b82759cb391679?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b" 
            alt="Calendar" 
            className="weekly-stats-calendar-icon" 
          />
        </button>
      </div>

      <div className="weekly-stats-legend">
        <div className="legend-item">
          <div className="legend-dot blue-dot" />
          <span>Lessons</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot green-dot" />
          <span>Practices</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot purple-dot" />
          <span>Quizzes</span>
        </div>
      </div>

      <BarChart />
    </div>
  );
};

export default WeeklyStatsSection;
