"use client";

import * as React from "react";
import "./GameCard.css"; 

interface GameCardProps {
  backgroundClass: string;
  coverImage: string;
  overlayImage: string;
  title: string;
  description: string;
}

function GameCard(props: GameCardProps) {
  const { backgroundClass, coverImage, overlayImage, title, description } = props;

  return (
    <article className={`game-card ${backgroundClass}`}>
      <figure className="game-card__media">
        <img src={coverImage} alt="" className="game-card__cover" />
        <img src={overlayImage} alt="" className="game-card__overlay" />
      </figure>
      <div className="game-card__content">
        <h2 className="game-card__title">{title}</h2>
        <p className="game-card__description">{description}</p>
      </div>
    </article>
  );
}

export default GameCard;
