"use client";

import * as React from "react";
import { FriendCard } from "./FriendCard.tsx";
import "./GameCard.css";

const SuggestedFriends = () => {
  const handleAddFriend = (username: string) => {
    console.log(`Adding friend: ${username}`);
  };

  const suggestedFriends = Array(5).fill({
    name: "Samuel Jacob",
    username: "@sammy",
    avatarUrl:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/8200231253e2c77c3020e24561ad097a2c9c4f06?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775",
  });

  return (
    <section className="suggested-friends">
      <div>
        <h2 className="suggested-friends__title">Suggested Friends</h2>
        <div className="suggested-friends__list">
          {suggestedFriends.map((friend, index) => (
            <div
              key={index}
              className={`suggested-friends__card${
                index > 0 ? " suggested-friends__card--spaced" : ""
              }`}
            >
              <FriendCard
                name={friend.name}
                username={friend.username}
                avatarUrl={friend.avatarUrl}
                onAddFriend={() => handleAddFriend(friend.username)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default SuggestedFriends;