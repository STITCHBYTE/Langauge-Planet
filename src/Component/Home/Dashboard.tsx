import React from 'react';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';
import ContinueLearningSection from './ContinueLearningSection.tsx';
import JoinedClassesSection from './JoinedClassesSection.tsx';
import WeeklyStatsSection from './WeeklyStatsSection.tsx';
import GamesSection from './GamesSection.tsx';
import './Style.css';

const DashboardReturning = () => {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="dashboard-main">
        <div className="dashboard-content">
          <Header />
          <div className="dashboard-sections">
            <div className="dashboard-row">
              <ContinueLearningSection />
              <JoinedClassesSection />
            </div>
            <div className="dashboard-row">
              <WeeklyStatsSection />
              <GamesSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default DashboardReturning;
