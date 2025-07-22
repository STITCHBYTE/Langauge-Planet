import React from 'react';
import './Style.css';

interface GameCardProps {
  image: string;
  title: string;
  description: string;
  color: 'blue' | 'green';
  onClick: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ image, title, description, color, onClick }) => {
  return (
    <article className={`new-game-card new-game-card-${color}`} onClick={onClick}>
      <figure className="new-game-card-media">
        <img src={image} alt={title} className="new-game-card-image" />
      </figure>
      <div className="new-game-card-content">
        <h3 className="new-game-card-title">{title}</h3>
        <p className="new-game-card-description">{description}</p>
      </div>
    </article>
  );
};

export default GameCard;
