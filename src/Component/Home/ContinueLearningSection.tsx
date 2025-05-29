import React from 'react';
import LearningCard from './LearningCard.tsx';
import './Style.css';

const learningItems = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/3d01ae8fb2833a67683840c352b95309be5d1e97?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b",
    title: "Basic Spanish",
    subtitle: "Introduction to Spanish",
    progress: null
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/4d4d02d70f6485ca957ee1b986f9ffea67d09c2b?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b",
    title: "Food",
    subtitle: "Beginner Level Spanish",
    progress: "0%"
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/7ed752574a5c480915286768f9a304dd336425de?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b",
    title: "Fruits",
    subtitle: "Intermediate Spanish",
    progress: null
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/ba69876d718265a40719316e194e204a7d68a858?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b",
    title: "Colors",
    subtitle: "Advance Spanish",
    progress: null
  }
];

const ContinueLearningSection = () => {
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
        {learningItems.map((item, index) => (
          <LearningCard
            icon={item.icon}
            title={item.title}
            subtitle={item.subtitle}
            progress={item.progress}
          />
        ))}
      </div>
    </div>
  );
};

export default ContinueLearningSection;
