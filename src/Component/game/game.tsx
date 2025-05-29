import React from "react";
import Header from "../Home/Header.tsx";
import Sidebar from "../Home/Sidebar.tsx";
import GameCard from "../game/SectionA.tsx";
import AddFriends from "./AddFriends.tsx";
import "./GameCard.css"; // Import your stylesheet

function Class() {
  return (
    <div className="class-container">
      {/* Header */}
   <div className="hrader">
   <Header />
      {/* Body Content */}
      <div className="class-layout">
        <aside className="class-sidebar">
          <Sidebar />
        </aside>

        <main className="class-main">
          <div className="class-game">
            <GameCard />
          </div>
          <div className="class-friends">
            <AddFriends />
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}

export default Class;
