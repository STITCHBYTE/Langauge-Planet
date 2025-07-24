import React, { useEffect, useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';
import LearningCard from './LearningCard.tsx';
import ClassCard from './ClassCard.tsx';
import GameCard from './GameCard.tsx';
import WeeklyStatsSection from './WeeklyStatsSection.tsx';
import Server_url from '../../config.js';
import './Style.css';

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${Server_url}${path}`;
};

const AvailableClassCard = ({ classId, icon, title, teacher }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const handleRequestToJoin = async () => {
    if (isRequesting || hasRequested) return;
    setIsRequesting(true);
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${Server_url}/api/classrooms/classroom/invite/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ classroom: classId }),
      });
      if (response.ok) {
        setHasRequested(true);
        toast.success('Request sent successfully!');
      } else {
        toast.error('Failed to send request');
      }
    } catch (error) {
      toast.error('Error sending request');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="class-card">
      <div className="class-card-header">
        <div className="class-card-left">
          <img src={getFullImageUrl(icon) || "https://via.placeholder.com/60"} alt={title} className="class-card-icon" />
          <div className="class-card-topic">{title}</div>
          <div className="class-card-teacher">{teacher}</div>
        </div>
        <div className="class-card-right">
          <button className={`class-card-button ${hasRequested ? 'requested' : ''}`} onClick={handleRequestToJoin} disabled={isRequesting || hasRequested}>
            {isRequesting ? 'Requesting...' : hasRequested ? 'Requested' : 'Request to Join'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AvailableClassesSection = ({ availableClasses }) => (
  <div className="joined-classes-section">
    <div className="joined-classes-header">
      <h2 className="section-title">Available Classes</h2>
      <button className="view-all-button"><span>View All</span><img src="https://cdn.builder.io/api/v1/image/assets/TEMP/84f114468c32a8742b810c1d02fef2aa97bc858e?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b" alt="" className="arrow-icon" /></button>
    </div>
    <div className="class-cards-list">
      {availableClasses.length === 0 ? <div className="text-gray-400 text-center py-8">No classes available.</div> : availableClasses.map((c) => <AvailableClassCard key={c.id} classId={c.id} icon={c.image} title={c.title} teacher={c.teacher_name ? `Teacher: ${c.teacher_name}` : ""} />)}
    </div>
  </div>
);

const StartLearningSection = ({ learningItems }) => (
  <div className="continue-learning-section">
    <div className="continue-learning-header">
      <h2 className="continue-learning-title">Start Learning</h2>
      <button className="continue-learning-button"><span>View All</span><img src="https://cdn.builder.io/api/v1/image/assets/TEMP/84f114468c32a8742b810c1d02fef2aa97bc858e?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b" alt="" className="arrow-icon" /></button>
    </div>
    <div className="continue-learning-grid">
      {learningItems.length === 0 ? <div className="text-gray-400 text-center py-8">No lessons available.</div> : learningItems.map((item) => <LearningCard key={item.id} icon={getFullImageUrl(item.image)} title={item.title} subtitle={item.description} progress={null} />)}
    </div>
  </div>
);

const ContinueLearningSection = ({ learningItems }) => (
  <div className="continue-learning-section">
    <div className="continue-learning-header">
      <h2 className="continue-learning-title">Continue Learning</h2>
      <button className="continue-learning-button"><span>View All</span><img src="https://cdn.builder.io/api/v1/image/assets/TEMP/84f114468c32a8742b810c1d02fef2aa97bc858e?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b" alt="" className="arrow-icon" /></button>
    </div>
    <div className="continue-learning-grid">
      {learningItems.length === 0 ? <div className="text-gray-400 text-center py-8">No lessons found.</div> : learningItems.map((item) => <LearningCard key={item.id} icon={getFullImageUrl(item.image)} title={item.title} subtitle={item.description} progress={item.progress || null} />)}
    </div>
  </div>
);

const JoinedClassesSection = ({ joinedClasses }) => (
  <div className="joined-classes-section">
    <div className="joined-classes-header">
      <h2 className="section-title">Joined Classes</h2>
      <button className="view-all-button"><span>View All</span><img src="https://cdn.builder.io/api/v1/image/assets/TEMP/84f114468c32a8742b810c1d02fef2aa97bc858e?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b" alt="" className="arrow-icon" /></button>
    </div>
    <div className="class-cards-list">
      {joinedClasses.length === 0 ? <div className="text-gray-400 text-center py-8">No classes found.</div> : joinedClasses.map((c) => <ClassCard key={c.id} icon={getFullImageUrl(c.image)} title={c.title} teacher={c.teacher_name ? `Teacher: ${c.teacher_name}` : ""} status={c.status || ""} />)}
    </div>
  </div>
);

const GamesSection = ({ games }) => (
  <div className="games-section">
    <div className="games-header">
      <h2 className="section-title">Explore Games</h2>
      <button className="view-all-button"><span>View All</span><img src="https://cdn.builder.io/api/v1/image/assets/TEMP/84f114468c32a8742b810c1d02fef2aa97bc858e?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b" alt="" className="arrow-icon" /></button>
    </div>
    <div className="games-list">
      {games.length === 0 ? <div className="text-gray-400 text-center py-8">No games available.</div> : games.map((game) => <GameCard key={game.id} image={game.image} title={game.title} description={game.description} color={game.color} />)}
    </div>
  </div>
);

const DashboardReturning = () => {
  const [learningItems, setLearningItems] = useState([]);
  const [joinedClasses, setJoinedClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(true);

  const staticGames = [
    {
      id: 'game-1',
      title: 'Word Racing Game',
      description: 'Lorem ipsum dolor sit amet consectetur. Cursus diam nisi sit lacinia diam integer urna proin malesuada.',
      image: 'https://i.imgur.com/sJGG8a9.png',
      color: 'blue',
      path: '/games/racing'
    },
    {
      id: 'game-2',
      title: 'Word Fight Game',
      description: 'Lorem ipsum dolor sit amet consectetur. Cursus diam nisi sit lacinia diam integer urna proin malesuada.',
      image: 'https://i.imgur.com/uI4aJ1j.png',
      color: 'green',
      path: '/games'
    }
  ];

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { setLoading(false); return; }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const userRes = await fetch(`${Server_url}/api/auth/user/`, { headers: { Authorization: `Bearer ${token}` } });
        if (!userRes.ok) throw new Error('Failed to fetch user data');
        const currentUser = await userRes.json();

        const classesRes = await fetch(`${Server_url}/api/classrooms/classroom/`, { headers: { Authorization: `Bearer ${token}` } });
        if (!classesRes.ok) throw new Error('Failed to fetch classrooms');
        const allClasses = await classesRes.json();

        const enrolledClasses = [];
        const nonEnrolledClasses = [];
        for (const classItem of allClasses) {
          const membershipsRes = await fetch(`${Server_url}/api/classrooms/classroom/${classItem.id}/memberships/`, { headers: { Authorization: `Bearer ${token}` } });
          if (membershipsRes.ok) {
            const memberships = await membershipsRes.json();
            const userMembership = memberships.find(m => (m.student?.id === currentUser.id || m.user?.id === currentUser.id) && m.status === 'ENROLLED');
            if (userMembership) {
              enrolledClasses.push(classItem);
            } else {
              nonEnrolledClasses.push(classItem);
            }
          } else {
            nonEnrolledClasses.push(classItem);
          }
        }
        
        setJoinedClasses(enrolledClasses);
        setAvailableClasses(nonEnrolledClasses.slice(0, 4));

        let lessonsToFetch = [];
        if (enrolledClasses.length > 0) {
          setIsNewUser(false);
          const lessonPromises = enrolledClasses.map(async (cls) => {
            if (!cls.lessons || cls.lessons.length === 0) return [];
            const lessonDetailPromises = cls.lessons.map(lessonId => 
              fetch(`${Server_url}/api/lessons/lesson/${lessonId}/`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.ok ? res.json() : null)
            );
            return Promise.all(lessonDetailPromises);
          });
          const lessonsByClass = await Promise.all(lessonPromises);
          lessonsToFetch = lessonsByClass.flat().filter(Boolean);
        } else {
          setIsNewUser(true);
          const publicLessonsRes = await fetch(`${Server_url}/api/lessons/lesson/public/`, { headers: { Authorization: `Bearer ${token}` } });
          if (publicLessonsRes.ok) {
            const publicLessonsData = await publicLessonsRes.json();
            lessonsToFetch = (publicLessonsData.results || publicLessonsData).slice(0, 4);
          }
        }
        setLearningItems(lessonsToFetch);

      } catch (error) {
        toast.error('Could not load dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-main">
          <Header />
          <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading dashboard...</div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="dashboard-main">
        <div className="dashboard-content">
          <Header />
          <div className="dashboard-sections">
            {isNewUser ? (
              <>
                <div className="dashboard-row">
                  <StartLearningSection learningItems={learningItems} />
                  <AvailableClassesSection availableClasses={availableClasses} />
                </div>
                <div className="dashboard-row">
                  <WeeklyStatsSection />
                  <GamesSection games={staticGames} />
                </div>
              </>
            ) : (
              <>
                <div className="dashboard-row">
                  <ContinueLearningSection learningItems={learningItems} />
                  <JoinedClassesSection joinedClasses={joinedClasses} />
                </div>
                <div className="dashboard-row">
                  <WeeklyStatsSection />
                  <GamesSection games={staticGames} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardReturning;
