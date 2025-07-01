import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';
import ContinueLearningSection from './ContinueLearningSection.tsx';
import JoinedClassesSection from './JoinedClassesSection.tsx';
import WeeklyStatsSection from './WeeklyStatsSection.tsx';
import GamesSection from './GamesSection.tsx';
import Server_url from '../../config.js';
import './Style.css';

const DashboardReturning = () => {
  // State for API data
  const [learningItems, setLearningItems] = useState([]);
  const [joinedClasses, setJoinedClasses] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoading(true);

    // Fetch Continue Learning (lessons in progress)
    const fetchLearning = async () => {
      try {
        const res = await fetch(`${Server_url}/api/lessons/lesson/my/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setLearningItems(data.results || data);
      } catch {
        setLearningItems([]);
      }
    };

    // Fetch Joined Classes
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${Server_url}/api/classrooms/my-classrooms/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setJoinedClasses(data.results || data);
      } catch {
        setJoinedClasses([]);
      }
    };

    // Fetch Weekly Stats (example endpoint, adjust as needed)
    const fetchWeeklyStats = async () => {
      try {
        const res = await fetch(`${Server_url}/api/users/weekly-stats/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setWeeklyStats(data);
        }
      } catch {
        setWeeklyStats(null);
      }
    };

    // Fetch Games (static or from API if available)
    const fetchGames = async () => {
      try {
        const res = await fetch(`${Server_url}/api/games/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setGames(data.results || data);
        } else {
          setGames([]);
        }
      } catch {
        setGames([]);
      }
    };

    fetchLearning();
    fetchClasses();
    fetchWeeklyStats();
    fetchGames();
    setLoading(false);
  }, []);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="dashboard-main">
        <div className="dashboard-content">
          <Header />
          <div className="dashboard-sections">
            <div className="dashboard-row">
              <ContinueLearningSection learningItems={learningItems} />
              <JoinedClassesSection joinedClasses={joinedClasses} />
            </div>
            <div className="dashboard-row">
              <WeeklyStatsSection weeklyStats={weeklyStats} />
              <GamesSection games={games} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardReturning;
