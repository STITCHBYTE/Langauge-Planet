"use client";

import * as React from "react";
import SearchBar from "./SearchBar.tsx";
import SuggestedFriends  from "./SuggestedFriends.tsx";
import "./GameCard.css";

export default function AddFriends() {
  return (
    <section className="add-friends">
      <header className="add-friends__header">
        <h1 className="add-friends__title">Add Friends</h1>
        <p className="add-friends__subtitle">
          Play with friends and you won't even notice you're learning.
        </p>
      </header>

      <div className="add-friends__search">
        <SearchBar />
      </div>

      <SuggestedFriends />
    </section>
  );
}
