import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Home/Header.tsx";
import Sidebar from "../Home/Sidebar.tsx";
import SectionA from "../game/SectionA.tsx";
import AddFriends from "./AddFriends.tsx";
import "./GameCard.css";
import FightGame from "./FightGame.tsx";

// Utility to generate a random room code
function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function Game() {
  const [showFightingGame, setShowFightingGame] = useState(false);
  const [showCarGameMenu, setShowCarGameMenu] = useState(false);
  const [showCarGameOnlineModal, setShowCarGameOnlineModal] = useState(false);
  const [roomMode, setRoomMode] = useState<"create" | "join" | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [generatedRoomCode, setGeneratedRoomCode] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const navigate = useNavigate();

  const handleFightingGameClick = () => setShowFightingGame(true);
  const handleCarGameClick = () => setShowCarGameMenu(true);
  const handleBackFromGame = () => setShowFightingGame(false);
  const handleBackFromCarGameMenu = () => setShowCarGameMenu(false);

  const handleCarGameSingle = () => navigate('/carGame');
  const handleCarGameOnline = () => setShowCarGameOnlineModal(true);

  // Modal logic
  const handleCreateRoom = () => {
    const code = generateRoomCode();
    setGeneratedRoomCode(code);
    setRoomMode("create");
    setRoomCode(code);
    setCopySuccess(false);
  };

  const handleJoinRoom = () => {
    setRoomMode("join");
    setJoinInput("");
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(generatedRoomCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleStartCreatedRoom = () => {
    if (generatedRoomCode) {
      setShowCarGameOnlineModal(false);
      setRoomMode(null);
      navigate(`/carGame/${generatedRoomCode}`);
    }
  };

  const handleStartJoinRoom = () => {
    if (joinInput.trim().length > 0) {
      setShowCarGameOnlineModal(false);
      setRoomMode(null);
      navigate(`/carGame/${joinInput.trim().toUpperCase()}`);
    }
  };

  const handleCloseModal = () => {
    setShowCarGameOnlineModal(false);
    setRoomMode(null);
    setGeneratedRoomCode("");
    setJoinInput("");
  };

  if (showFightingGame) {
    return (
      <div className="full-screen-game bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex flex-col items-center justify-center min-h-screen">
        <button 
          className="absolute top-5 left-5 z-50 bg-white bg-opacity-90 text-indigo-700 border-none py-3 px-6 rounded-full cursor-pointer text-base font-bold shadow-lg transition-all duration-300 hover:bg-indigo-100 hover:-translate-x-1"
          onClick={handleBackFromGame}
        >
          ← Back to Games
        </button>
        <FightGame />
      </div>
    );
  }

  if (showCarGameMenu) {
    return (
      <div className="full-screen-game flex flex-row h-screen bg-gradient-to-br from-yellow-100 via-blue-100 to-green-100">
        <button 
          className="absolute top-5 left-5 z-50 bg-white bg-opacity-90 text-blue-700 border-none py-3 px-6 rounded-full cursor-pointer text-base font-bold shadow-lg transition-all duration-300 hover:bg-blue-200 hover:-translate-x-1"
          onClick={handleBackFromCarGameMenu}
        >
          ← Back to Games
        </button>
        {/* Left: Controls */}
        <div className="flex flex-col justify-center items-start w-1/2 pl-24">
          <div className="bg-white bg-opacity-80 rounded-2xl shadow-xl p-10">
            <h3 className="text-3xl font-extrabold mb-6 text-blue-700 flex items-center gap-2">
              <span role="img" aria-label="steering wheel">🕹️</span> Car Game Controls
            </h3>
            <ul className="text-lg text-gray-700 space-y-3 font-medium">
              <li><span className="inline-block w-10 text-center font-bold text-blue-600">↑</span> / <span className="font-bold text-blue-600">W</span> — Accelerate</li>
              <li><span className="inline-block w-10 text-center font-bold text-blue-600">↓</span> / <span className="font-bold text-blue-600">S</span> — Brake/Reverse</li>
              <li><span className="inline-block w-10 text-center font-bold text-blue-600">←</span> / <span className="font-bold text-blue-600">A</span> — Steer Left</li>
              <li><span className="inline-block w-10 text-center font-bold text-blue-600">→</span> / <span className="font-bold text-blue-600">D</span> — Steer Right</li>
              <li><span className="inline-block w-10 text-center font-bold text-yellow-600">Space</span> — Boost</li>
              <li><span className="inline-block w-10 text-center font-bold text-green-600">P</span> — Pause</li>
            </ul>
          </div>
        </div>
        {/* Right: Game Mode Buttons */}
        <div className="flex flex-col items-center justify-center w-1/2">
          <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl p-12 flex flex-col items-center">
            <h2 className="text-4xl font-extrabold mb-10 text-yellow-500 drop-shadow-lg flex items-center gap-2">
              <span role="img" aria-label="car">🏎️</span> Choose Car Game Mode
            </h2>
            <button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold py-5 px-12 rounded-full shadow-xl text-2xl mb-6 transition-all duration-300 transform hover:scale-105"
              onClick={handleCarGameSingle}
            >
              Single Player
            </button>
            <button
              className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-extrabold py-5 px-12 rounded-full shadow-xl text-2xl transition-all duration-300 transform hover:scale-105"
              onClick={handleCarGameOnline}
            >
              Online Multiplayer
            </button>
          </div>
        </div>
        {/* Modal for Online Multiplayer */}
        {showCarGameOnlineModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Online Multiplayer</h2>
              {!roomMode && (
                <div className="flex flex-col gap-4">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow mb-2"
                    onClick={handleCreateRoom}
                  >
                    Create Room
                  </button>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow"
                    onClick={handleJoinRoom}
                  >
                    Join Room
                  </button>
                </div>
              )}
              {roomMode === "create" && (
                <div className="flex flex-col items-center gap-4">
                  <div className="text-lg font-semibold text-gray-700 mb-2">Room Code:</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono tracking-widest bg-gray-100 px-4 py-2 rounded">{generatedRoomCode}</span>
                    <button
                      className="bg-gray-200 hover:bg-gray-300 rounded px-3 py-1 text-sm font-medium"
                      onClick={handleCopyRoomCode}
                    >
                      {copySuccess ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full shadow-lg text-xl mt-4"
                    onClick={handleStartCreatedRoom}
                  >
                    Start Game
                  </button>
                </div>
              )}
              {roomMode === "join" && (
                <div className="flex flex-col items-center gap-4">
                  <input
                    type="text"
                    className="border border-gray-300 rounded px-4 py-2 text-lg text-center tracking-widest font-mono"
                    placeholder="Enter Room Code"
                    value={joinInput}
                    onChange={e => setJoinInput(e.target.value.toUpperCase())}
                    maxLength={8}
                  />
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg text-xl"
                    onClick={handleStartJoinRoom}
                    disabled={joinInput.trim().length < 4}
                  >
                    Join Room
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-green-50 flex flex-col">
      <div className="ml-[17%]">
        <Header />
      </div>
      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <Sidebar />
        </aside>
        <main className="flex-1 flex justify-center items-start py-12 px-8 bg-transparent">
          <div className="flex gap-8 w-full max-w-[1400px]">
            <div className="bg-white bg-opacity-90 rounded-2xl shadow-lg p-8 flex flex-col gap-8 w-[520px]">
              <SectionA
                onCarGameClick={handleCarGameClick}
                onFightingGameClick={handleFightingGameClick}
              />
            </div>
            <div className="bg-white bg-opacity-90 rounded-2xl shadow-lg p-8 w-[520px] min-h-[600px]">
              <AddFriends />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Game;