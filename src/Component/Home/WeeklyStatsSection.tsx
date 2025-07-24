import React, { useState, useEffect, useMemo } from 'react';
import BarChart from './BarChart.tsx';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Server_url from '../../config.js';
import './Style.css';

const WeeklyStatsSection = () => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const getWeekDates = (weekOffset = 0) => {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset + (weekOffset * 7));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return {
      fromDate: monday.toISOString().split('T')[0],
      endDate: sunday.toISOString().split('T')[0]
    };
  };
  const formatWeekDisplay = (weekOffset) => {
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === -1) return 'Last Week';
    
    const { fromDate } = getWeekDates(weekOffset);
    const date = new Date(fromDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  useEffect(() => {
    const fetchActivityData = async (weekOffset) => {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId') || 'current';
      
      if (!token) {
        setLoading(false);
        return;
      }

      const { fromDate, endDate } = getWeekDates(weekOffset);
      
      try {
        const response = await fetch(
          `${Server_url}/api/users/activity-summary/?user_id=${userId}&from_date=${fromDate}&end_date=${endDate}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setActivityData(data);
        } else {
          setActivityData(null);
        }
      } catch (error) {
        setActivityData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchActivityData(currentWeekOffset);
  }, [currentWeekOffset]);
  const processChartData = (apiData) => {
    if (!apiData || typeof apiData !== 'object') {
      return [];
    }

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dateToDayMap = {};
    for (const dateStr in apiData) {
      if (Object.prototype.hasOwnProperty.call(apiData, dateStr) && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const date = new Date(dateStr);
        const utcDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
        const dayIndex = utcDate.getUTCDay();
        const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        const dayName = daysOfWeek[adjustedDayIndex];
        if (dayName) {
          dateToDayMap[dayName] = apiData[dateStr];
        }
      }
    }
    
    const chartData = daysOfWeek.map(day => {
      const dayData = dateToDayMap[day] || {};
      
      return {
        day,
        lessons: dayData.lessons_completed || 0,
        class: dayData.class || 0,
        quizzes: dayData.quizzes_completed || 0
      };
    });

    return chartData;
  };
  const stats = useMemo(() => {
    if (!activityData) {
      return {
        currentWeekHours: 0,
        lastWeekHours: 0,
        chartData: [],
        yAxisMax: 5
      };
    }

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dateToDayMap = {};

    for (const dateStr in activityData) {
      if (Object.prototype.hasOwnProperty.call(activityData, dateStr) && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const date = new Date(`${dateStr}T00:00:00Z`);
        const dayIndex = date.getUTCDay();
        const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        const dayName = daysOfWeek[adjustedDayIndex];
        if (dayName) {
          dateToDayMap[dayName] = activityData[dateStr];
        }
      }
    }
    
    const chartData = daysOfWeek.map(day => {
      const dayData = dateToDayMap[day] || {};
      
      return {
        day,
        lessons: dayData.lessons_completed || 0,
        class: dayData.class || 0,
        quizzes: dayData.quizzes_completed || 0
      };
    });

    const dailyTotalsInSeconds = chartData.map(day => day.lessons + day.class + day.quizzes);
    const maxDailyTotalInSeconds = Math.max(...dailyTotalsInSeconds);
    const maxDailyTotalInHours = maxDailyTotalInSeconds / 3600;
    let yAxisMax = Math.ceil(maxDailyTotalInHours);
    if (yAxisMax < 5) {
      yAxisMax = 5;
    } else if (yAxisMax > 10) {
      yAxisMax = Math.ceil(yAxisMax / 5) * 5;
    }

    const currentWeekHours = (activityData.total_time_in_seconds || 0) / 3600;
    const lastWeekHours = (activityData.previous_week_total_time_in_seconds || 0) / 3600;

    return { currentWeekHours, lastWeekHours, chartData, yAxisMax };
  }, [activityData]);
  const hoursDifference = Math.round((stats.currentWeekHours - stats.lastWeekHours) * 10) / 10;
  const isIncrease = hoursDifference >= 0;

  if (loading) {
    return <div className="weekly-stats-container loading">Loading Stats...</div>;
  }

  return (
    <div className="weekly-stats-container">
      <div className="weekly-stats-header">
        <div className="weekly-stats-info">
          <h2 className="weekly-stats-title">Hours Spent Weekly</h2>
          <div className="weekly-stats-trend">
            <span className={`weekly-stats-change ${isIncrease ? 'increase' : 'decrease'}`}>
              {hoursDifference === 0 
                ? 'Same as last week' 
                : `${isIncrease ? '+' : ''}${Math.abs(hoursDifference)} hrs ${isIncrease ? 'more' : 'less'}`
              }
            </span>
          </div>
        </div>
        <div className="weekly-stats-controls">
          <span className="weekly-stats-period">{formatWeekDisplay(currentWeekOffset)}</span>
          <div className="weekly-stats-nav">
            <button className="nav-button" onClick={() => setCurrentWeekOffset(p => p - 1)}>
              <FiChevronLeft className="nav-icon" />
            </button>
            <button 
              className="nav-button" 
              onClick={() => setCurrentWeekOffset(p => p + 1)}
              disabled={currentWeekOffset >= 0}
            >
              <FiChevronRight className="nav-icon" />
            </button>
          </div>
        </div>
      </div>

      <div className="weekly-stats-legend">
        <div className="legend-item">
          <div className="legend-dot lessons-dot" />
          <span className="legend-text">Lessons</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot class-dot" />
          <span className="legend-text">Class</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot quizzes-dot" />
          <span className="legend-text">Quizzes</span>
        </div>
      </div>

      <div className="weekly-stats-chart">
        {stats.chartData.length > 0 ? (
          <BarChart data={stats.chartData} yAxisMax={stats.yAxisMax} />
        ) : (
          <div className="no-data-message">
            No activity data for this week
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyStatsSection;
