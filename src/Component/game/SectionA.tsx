"use client";

import React, { useState, useEffect, useRef } from "react";
import GameCard from "./GameCard.tsx";
import "./GameCard.css";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const SectionA: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://192.168.1.2:8082/friend", {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      timeout: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to friend namespace");
    });

    socket.on("roomCreated", ({ roomCode, error }) => {
      if (roomCode) {
        console.log(`Room created successfully: ${roomCode}`);
        setShowModal(false);
        navigate(`/fighting-friends/${roomCode}`);
      } else {
        console.error("Room creation failed:", error || "Unknown error");
      }
    });

    socket.on("joinRoomResult", ({ success, message }) => {
      if (success) {
        setShowModal(false);
      } else {
        alert(`Join failed: ${message}`);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Connection Error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  const handlePlayWithBot = () => {
    setShowModal(false);
    navigate("/fighting-game");
  };

  const handlePlayWithFriends = () => {
  console.log("Requesting room creation from server...");
  socketRef.current?.emit("createRoom");
};


  return (
    <>
      <section className="section-a">
        <GameCard
          backgroundClass="bg-blue"
          coverImage="https://cdn.builder.io/api/v1/image/assets/TEMP/1bf32348527794d1efa089cc8ab15e204fdcad56?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
          overlayImage="https://cdn.builder.io/api/v1/image/assets/TEMP/620c4404ba32be14d604579e55c1a6f129050c79?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
          title="Word Racing Game"
          description="Lorem ipsum dolor sit amet consectetur. Cursus diam nisi sit lacinia diam integer urna proin malesuada."
        />
        <div className="section-a__spacer">
          <div onClick={() => setShowModal(true)}>
            <GameCard
              backgroundClass="bg-emerald"
              coverImage="https://cdn.builder.io/api/v1/image/assets/TEMP/fc61acc0eef22ec08fc7048e67207c044594a229?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
              overlayImage="https://cdn.builder.io/api/v1/image/assets/TEMP/0fac39aa374587add36623d9f96c01305d023183?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
              title="Word Fight Game"
              description="Lorem ipsum dolor sit amet consectetur. Cursus diam nisi sit lacinia diam integer urna proin malesuada."
            />
          </div>
        </div>
      </section>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2 className="modal-title">⚔️ Word Fight Game</h2>

            <div className="modal-options">
              <div className="option-button bot" onClick={handlePlayWithBot}>
                <div className="emoji">🤖</div>
                <div className="label">Play with Bot</div>
              </div>

              <div className="option-button friends" onClick={handlePlayWithFriends}>
                <div className="emoji">🧑‍🤝‍🧑</div>
                <div className="label">Play with Friends</div>
              </div>
            </div>

            <div className="cancel-button-wrapper">
              <button className="cancel-button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SectionA;
