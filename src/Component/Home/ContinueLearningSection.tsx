import React, { useEffect, useState } from 'react';
import LearningCard from './LearningCard.tsx';
import Server_url from '../../config.js';
import './Style.css';

const ContinueLearningSection = () => {
  const [learningItems, setLearningItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearningItems = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${Server_url}/api/lessons/lesson/my/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setLearningItems(data.results || data);
      } catch {
        setLearningItems([]);
      }
      setLoading(false);
    };
    fetchLearningItems();
  }, []);

  return (
    <div className="continue-learning-section">
      <div className="continue-learning-header">
        <h2 className="continue-learning-title">Continue Learning</h2>
        <button className="continue-learning-button">
          <span>View All</span>
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/84f114468c32a8742b810c1d02fef2aa97bc858e?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b" alt="Arrow right" className="arrow-icon" />
        </button>
      </div>

      <div className="continue-learning-grid">
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading...</div>
        ) : learningItems.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No lessons found.</div>
        ) : (
          learningItems.map((item, index) => (
            <LearningCard
              key={item.id || index}
              icon={item.image || ""}
              title={item.title}
              subtitle={item.description}
              progress={item.progress || null}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ContinueLearningSection;
