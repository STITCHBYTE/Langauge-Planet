import React from 'react';
import './Style.css';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = [5, 4, 3, 2, 1, 0];

const BarChart = () => {
  return (
    <div className="barchart-container">
      <div className="barchart-grid">
        {hours.map((hour, index) => (
          <div key={index} className="barchart-row">
            <span className="barchart-hour">{hour} hrs</span>
            <div className="barchart-line" />
          </div>
        ))}
      </div>

      <div className="barchart-bars">
        {days.map((day, index) => (
          <div key={index} className="barchart-day">
            <div className="barchart-day-bars">
              <div className="bar blue" />
              <div className="bar green" />
              <div className="bar purple" />
            </div>
            <span className="barchart-day-label">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
