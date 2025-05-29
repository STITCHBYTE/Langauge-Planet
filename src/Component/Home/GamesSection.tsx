import React from 'react';
import GameCard from './GameCard.tsx';
import './Style.css';

const games = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/7b0dccc96e92678d39bceea24d934de36d42f35c?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b",
    title: "Word Racing Game",
    description: "Lorem ipsum dolor sit amet consectetur. Cursus diam nisi sit lacinia diam integer urna proin malesuada."
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/95c925903d14c92e6dbb7333be480b7de7cc014c?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b",
    title: "Word Fight Game",
    description: "Lorem ipsum dolor sit amet consectetur. Cursus diam nisi sit lacinia diam integer urna proin malesuada."
  }
];

const GamesSection = () => {
  return (
    <div className="games-section-container">
      <div className="games-section-header">
        <h2 className="games-section-title">Explore Games</h2>
        <button className="games-section-view-all-btn">
          <span className="view-all-text">View All</span>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/84f114468c32a8742b810c1d02fef2aa97bc858e?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b"
            alt="Arrow right"
            className="view-all-icon"
          />
        </button>
      </div>

      <div className="games-list">
        {games.map((game, index) => (
          <GameCard
            // key={index}
            icon={game.icon}
            title={game.title}
            description={game.description}
          />
        ))}
      </div>
    </div>
  );
};

export default GamesSection;
