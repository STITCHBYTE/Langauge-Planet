import * as React from "react";
import "./GameCard.css";

interface FriendCardProps {
  name: string;
  username: string;
  avatarUrl: string;
  onAddFriend: () => void;
}

export const FriendCard = ({
  name,
  username,
  avatarUrl,
  onAddFriend,
}: FriendCardProps) => {
  return (
    <article className="friend-card">
      <div className="friend-card__info">
        <img
          src={avatarUrl}
          alt={`${name}'s avatar`}
          className="friend-card__avatar"
        />
        <div className="friend-card__text">
          <h3 className="friend-card__name">{name}</h3>
          <p className="friend-card__username">@{username}</p>
        </div>
      </div>
      <button onClick={onAddFriend} className="friend-card__button">
        Add Friend
      </button>
    </article>
  );
};
