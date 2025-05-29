import React from 'react';
import Sidebar from '../Home/Sidebar.tsx';
import Header from '../Home/Header.tsx';
import LessonTabs from './LessonCard.tsx';
import StatusFilter from './StatusFilter.tsx';
import LessonGrid from './LessonGrid.tsx';
import './Learning.css'; // Include the CSS file

function Learning() {
  return (
    <div className="learning-container">
      <div className="header">
                <Header />


      <div className="main-content">

        <div className="sidebar">
          <Sidebar />
        </div>

        <div className="content-area">
          <div className="top-bar">
            <LessonTabs />
            <StatusFilter />
          </div>
          <div className="lesson-grid-wrapper">
            <LessonGrid />
          </div>
        </div>
      </div>
    </div>
          </div>
  );
}

export default Learning;
