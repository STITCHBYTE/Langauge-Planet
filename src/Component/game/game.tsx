import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Home/Header.tsx";
import Sidebar from "../Home/Sidebar.tsx";
import SectionA from "../game/SectionA.tsx";
import AddFriends from "./AddFriends.tsx";
import "./GameCard.css";
import FightGame from "./FightGame.tsx";

function Game() {
  const [showFightingGame, setShowFightingGame] = useState(false);
  const navigate = useNavigate();

  const handleFightingGameClick = () => setShowFightingGame(true);
  const handleCarGameClick = () => navigate('/carGame');
  const handleBackFromGame = () => setShowFightingGame(false);

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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <div className="ml-[17%]">
        <Header />
      </div>
      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <Sidebar />
        </aside>
        <main className="flex-1 flex justify-center items-start py-12 px-8 bg-[#f8fafc]">
          <div className="flex gap-8 w-full max-w-[1400px]">
            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 w-[520px]">
              <SectionA
                onCarGameClick={handleCarGameClick}
                onFightingGameClick={handleFightingGameClick}
              />
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 w-[520px] min-h-[600px]">
              <AddFriends />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Game;