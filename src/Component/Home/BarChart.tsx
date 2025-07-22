import React from 'react';
import './Style.css';

const BarChart = ({ data = [], yAxisMax = 5 }) => {
  // Helper to generate labels for the Y-axis based on the max value
  const generateYAxisLabels = (maxValue) => {
    const labels = [];
    // Create 5 steps for the axis (e.g., if max is 10, steps are 10, 8, 6, 4, 2, 0)
    for (let i = 5; i >= 0; i--) {
      labels.push((maxValue / 5) * i);
    }
    return labels;
  };

  const yAxisLabels = generateYAxisLabels(yAxisMax);
  const getBarHeight = (valueInSeconds) => {
    if (!valueInSeconds || valueInSeconds <= 0) return '0%';
    
    const hours = valueInSeconds / 3600;
    const percentage = Math.min((hours / yAxisMax) * 100, 100);
    
    return `${percentage}%`;
  };

  return (
    <div className="bar-chart">
      <div className="chart-y-axis">
        {yAxisLabels.map((value, index) => (
          <div key={index} className="y-axis-row">
            <span className="y-axis-label">
              {/* Show integer if it's a whole number, otherwise 1 decimal place */}
              {Number.isInteger(value) ? value : value.toFixed(1)} hrs
            </span>
            <div className="grid-line" />
          </div>
        ))}
      </div>
      <div className="chart-content">
        <div className="chart-bars">
          {data.map((dayData, index) => (
            <div key={index} className="bar-group">
              <div className="bar-container">
                <div 
                  className="bar lessons-bar" 
                  style={{ height: getBarHeight(dayData.lessons) }}
                />
                <div 
                  className="bar class-bar"
                  style={{ height: getBarHeight(dayData.class) }}
                />
                <div 
                  className="bar quizzes-bar" 
                  style={{ height: getBarHeight(dayData.quizzes) }}
                />
              </div>
              <span className="x-axis-label">{dayData.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarChart;
