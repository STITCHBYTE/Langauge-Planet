import React from 'react';
import './Style.css';

interface GameCardProps {
  icon: string;
  title: string;
  description: string;
}

const GameCard = ({ icon, title, description }: GameCardProps) => {
  return (
    <button className="game-card">
      <img src={icon} alt={title} className="game-card-icon" />
      <div className="game-card-content">
        <h3 className="game-card-title">{title}</h3>
        <p className="game-card-description">{description}</p>
      </div>
    </button>
  );
};

export default GameCard;
