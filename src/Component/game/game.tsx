import React, { useState } from "react";
import Header from "../Home/Header.tsx";
import Sidebar from "../Home/Sidebar.tsx";
import GameCard from "../game/SectionA.tsx";
import AddFriends from "./AddFriends.tsx";
import "./GameCard.css"; // Import your stylesheet
import FightGame from "./FightGame.tsx";

function Class() {
  const [showFightingGame, setShowFightingGame] = useState(false);

  const handleGameCardClick = () => {
    setShowFightingGame(true);
  };

  const handleBackFromGame = () => {
    setShowFightingGame(false);
  };

  if (showFightingGame) {
    return (
      <div className="full-screen-game">
        <button 
          className="absolute top-5 left-5 z-50 bg-black bg-opacity-80 text-white border-none py-3 px-6 rounded-full cursor-pointer text-base font-bold transition-all duration-300 hover:bg-opacity-90 hover:-translate-x-1"
          onClick={handleBackFromGame}
        >
          ← Back to Games
        </button>
        <FightGame />
      </div>
    );
  }

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
          <div className="class-game" onClick={handleGameCardClick} style={{ cursor: 'pointer' }}>
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
