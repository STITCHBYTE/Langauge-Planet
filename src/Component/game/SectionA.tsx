"use client";

import * as React from "react";
import GameCard from "./GameCard.tsx";
import "./GameCard.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SectionA: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
   const navigate = useNavigate();

  const handlePlayWithBot = () => {
    setShowModal(false);
    navigate("/fighting-game"); // change to your actual route
  };

  const handlePlayWithFriends = () => {
    alert("Multiplayer mode coming soon!");
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
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        background: "#1a1a2e",
        padding: "48px",
        borderRadius: "20px",
        color: "#fff",
        width: "700px",
        textAlign: "center",
        boxShadow: "0 0 40px #00f0ff88",
        fontFamily: "'Orbitron', sans-serif",
      }}
    >
      <h2 style={{ fontSize: "32px", marginBottom: "32px", letterSpacing: "1px" }}>
        ⚔️ Word Fight Game
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "30px",
          justifyContent: "center",
        }}
      >
        {/* Option 1: Play with Bot */}
        <div
          onClick={handlePlayWithBot}
          style={{
            flex: 1,
            background: "#00f0ff22",
            border: "2px solid #00f0ff",
            borderRadius: "12px",
            padding: "24px",
            cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 0 20px #00f0ff";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ fontSize: "48px" }}>🤖</div>
          <div style={{ fontSize: "24px", marginTop: "10px", fontWeight: "bold" }}>
            Play with Bot
          </div>
        </div>

        {/* Option 2: Play with Friends */}
        <div
          onClick={handlePlayWithFriends}
          style={{
            flex: 1,
            background: "#ff00c822",
            border: "2px solid #ff00c8",
            borderRadius: "12px",
            padding: "24px",
            cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 0 20px #ff00c8";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ fontSize: "48px" }}>🧑‍🤝‍🧑</div>
          <div style={{ fontSize: "24px", marginTop: "10px", fontWeight: "bold" }}>
            Play with Friends
          </div>
        </div>
      </div>

      <div style={{ marginTop: "32px" }}>
        <button
          onClick={() => setShowModal(false)}
          style={{
            color: "#ccc",
            fontSize: "14px",
            textDecoration: "underline",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
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
