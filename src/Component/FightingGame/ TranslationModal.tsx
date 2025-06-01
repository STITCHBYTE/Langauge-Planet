import React from "react";

const TranslationModal = ({
  word,
  options,
  onAnswer,
}: {
  word: string;
  options: string[];
  onAnswer: (opt: string) => void;
}) => (
  <div style={{
    position: "fixed",
    top: "30%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 0 10px #000",
    zIndex: 1000,
  }}>
    <h3 style={{ textAlign: "center", marginBottom: 10 }}>
      Translate: <span style={{ color: "#00ffcc" }}>{word}</span>
    </h3>
    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onAnswer(opt)}
          style={{
            margin: 5,
            padding: "10px 15px",
            backgroundColor: "#333",
            color: "#fff",
            border: "1px solid #00ffcc",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export default TranslationModal;
