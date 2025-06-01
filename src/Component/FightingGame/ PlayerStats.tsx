import React from "react";

const PlayerStats = ({ label, hp, cooldown }: { label: string; hp: number; cooldown?: boolean }) => (
  <div style={{ flex: 1, textAlign: "center" }}>
    <h2>{label} HP: {hp}</h2>
    {cooldown !== undefined && (
      <p>
        Cooldown:{" "}
        <span style={{ color: cooldown ? "#ffcc00" : "#00ff00" }}>
          {cooldown ? "⏳ Active" : "✅ Ready"}
        </span>
      </p>
    )}
  </div>
);

export default PlayerStats;
