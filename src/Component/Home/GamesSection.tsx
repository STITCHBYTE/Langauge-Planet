import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameCard from './GameCard.tsx';
import './Style.css';

interface Game {
  id: string;
  image: string;
  title: string;
  description: string;
  color: 'blue' | 'green';
  path: string;
}

interface GamesSectionProps {
  games: Game[];
}

const GamesSection: React.FC<GamesSectionProps> = ({ games }) => {
  const navigate = useNavigate();

  const handleGameClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="games-section">
      <div className="games-header">
        <h2 className="section-title">Explore Games</h2>
        <button className="view-all-button" onClick={() => navigate('/games')}>
          <span>View All</span>
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/84f114468c32a8742b810c1d02fef2aa97bc858e?placeholderIfAbsent=true&apiKey=1b496253e45e4fc2b46bf96bdfd3025b" alt="Arrow right" className="arrow-icon" />
        </button>
      </div>
      <div className="games-list">
        {games.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No games available.</div>
        ) : (
          games.map((game) => (
            <GameCard
              key={game.id}
              image={game.image}
              title={game.title}
              description={game.description}
              color={game.color}
              onClick={() => handleGameClick(game.path)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GamesSection;
