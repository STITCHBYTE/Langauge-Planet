import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./fighting.css"; // Import the new CSS file

const socket = io("http://localhost:8082");

type CharacterType = "player" | "bot";
type QuizOption = { text: string; isCorrect: boolean };

// Simplified animation key mapping for 2D
const getAnimKey = (anim: string) => {
  const map: Record<string, string> = {
    attack1: "attack",
    attack2: "attack",
    combo: "attack",
    hit: "hit",
    death: "death",
    idle: "idle",
    dodge: "dodge",
    heal: "idle", // Heal can show idle or a specific heal sprite if available
  };
  return map[anim] || "idle";
};

const Character = ({
  characterType,
  animationKey,
}: {
  characterType: CharacterType;
  animationKey: string;
}) => {
  const [currentAnim, setCurrentAnim] = useState('idle');

  useEffect(() => {
    const anim = getAnimKey(animationKey);
    setCurrentAnim(anim);

    // For non-looping animations, return to idle after a short time
    if (anim !== 'idle' && anim !== 'death') {
      const timer = setTimeout(() => {
        // Only revert to idle if the character is not in a final state like death
        if (getAnimKey(animationKey) !== 'death') {
          setCurrentAnim('idle');
        }
      }, 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [animationKey]);

  // Add a key to the div to force a re-render when the animation changes,
  // which can help reset CSS animations.
  return <div key={`${characterType}-${currentAnim}`} className={`character ${characterType} ${currentAnim}`} />;
};


export default function FightingGame() {
  const [playerAnim, setPlayerAnim] = useState("idle");
  const [botAnim, setBotAnim] = useState("idle");
  const [playerHp, setPlayerHp] = useState(100);
  const [botHp, setBotHp] = useState(100);
  const [showQuiz, setShowQuiz] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<"correct" | "wrong" | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

 type Question = {
  question: string;
  options: QuizOption[];
};

const questions: Question[] = [
  {
    question: 'Translate: "To attack"',
    options: [
      { text: "Attaquer", isCorrect: true },
      { text: "Soigner", isCorrect: false },
      { text: "Esquiver", isCorrect: false }
    ]
  },
  {
    question: 'Translate: "To dodge"',
    options: [
      { text: "Esquiver", isCorrect: true },
      { text: "Combattre", isCorrect: false },
      { text: "Blesser", isCorrect: false }
    ]
  },
  {
    question: 'Translate: "To heal"',
    options: [
      { text: "Soigner", isCorrect: true },
      { text: "Frapper", isCorrect: false },
      { text: "Courir", isCorrect: false }
    ]
  },
  {
    question: 'Translate: "Hit"',
    options: [
      { text: "Frapper", isCorrect: true },
      { text: "Cacher", isCorrect: false },
      { text: "Guérir", isCorrect: false }
    ]
  },
  {
    question: 'Translate: "Death"',
    options: [
      { text: "Mort", isCorrect: true },
      { text: "Vie", isCorrect: false },
      { text: "Douleur", isCorrect: false }
    ]
  },
  {
    question: 'Translate: "Fight"',
    options: [
      { text: "Combattre", isCorrect: true },
      { text: "Fuir", isCorrect: false },
      { text: "Dormir", isCorrect: false }
    ]
  },
  {
    question: 'Translate: "Defend"',
    options: [
      { text: "Défendre", isCorrect: true },
      { text: "Blesser", isCorrect: false },
      { text: "Soigner", isCorrect: false }
    ]
  },
  {
    question: 'Translate: "Dodge quickly"',
    options: [
      { text: "Esquiver rapidement", isCorrect: true },
      { text: "Combattre lentement", isCorrect: false },
      { text: "Soigner fort", isCorrect: false }
    ]
  },
  {
    question: 'Translate: "Attack again"',
    options: [
      { text: "Attaquer encore", isCorrect: true },
      { text: "Dormir maintenant", isCorrect: false },
      { text: "Fuir bientôt", isCorrect: false }
    ]
  },
  {
    question: 'Translate: "Strong punch"',
    options: [
      { text: "Coup de poing fort", isCorrect: true },
      { text: "Petite blessure", isCorrect: false },
      { text: "Course lente", isCorrect: false }
    ]
  },
  // Add 20 more in similar format...
];


  useEffect(() => {
    socket.on("gameState", ({ player, bot }) => {
      setPlayerAnim(player.currentAnimation || "idle");
      setBotAnim(bot.currentAnimation || "idle");
      setPlayerHp(player.hp);
      setBotHp(bot.hp);
    });
    return () => {
      socket.off("gameState");
    };
  }, []);

//   const handleAction = (action: string) => {
//     if (playerHp <= 0 || botHp <= 0) return;
//     if (["attack1", "attack2", "combo", "heal", "dodge"].includes(action)) {
//       setPendingAction(action);
//       setShowQuiz(true);
//       setQuizResult(null);
//     } else {
//       socket.emit("playerAction", action);
//     }
//   };
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const handleAction = (action: string) => {
  if (playerHp <= 0 || botHp <= 0) return;

  // Pick a random quiz and shuffle its options
  const randomQuiz = questions[Math.floor(Math.random() * questions.length)];
  const shuffledOptions = shuffleArray(randomQuiz.options);

  setCurrentQuestion({ ...randomQuiz, options: shuffledOptions });
  setPendingAction(action);
  setShowQuiz(true);
  setQuizResult(null);
};

  const handleQuizChoice = (isCorrect: boolean) => {
    if (isCorrect && pendingAction) {
      socket.emit("playerAction", pendingAction);
      setQuizResult("correct");
    } else {
      setQuizResult("wrong");
    }
  };

  const handleRestart = () => {
    socket.emit("restartGame");
  };

  return (
    <div style={{ height: "100vh", width: "100vw", background: "#111", overflow: "hidden" }}>
      {/* Health Bars */}
      <div style={{ position: "absolute", top: 20, left: "10%", color: "#fff", zIndex: 1 }}>
        <div>Player HP: {playerHp}</div>
        <div style={{ height: 20, width: 250, background: "#444", marginTop: 4, borderRadius: 4 }}>
          <div style={{ height: "100%", width: `${playerHp}%`, background: "#fff", borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 20, right: "10%", color: "#fff", zIndex: 1 }}>
        <div>Bot HP: {botHp}</div>
        <div style={{ height: 20, width: 250, background: "#444", marginTop: 4, borderRadius: 4 }}>
          <div style={{ height: "100%", width: `${botHp}%`, background: "#f00", borderRadius: 4 }} />
        </div>
      </div>
      
      {/* 2D Game Container */}
      <div className="fighting-game-container">
        <Character characterType="player" animationKey={playerAnim} />
        <Character characterType="bot" animationKey={botAnim} />
      </div>

      {/* Action Buttons */}
     <div style={{
  position: "fixed",
  bottom: 30,
  width: "100%",
  display: "flex",
  justifyContent: "center",
  gap: 20,
  zIndex: 5
}}>
  {["attack1", "attack2", "combo", "dodge", "heal"].map((action) => (
    <button
      key={action}
      onClick={() => handleAction(action)}
      disabled={playerHp <= 0 || botHp <= 0}
      style={{
        padding: "12px 20px",
        fontWeight: "bold",
        borderRadius: "8px",
        background: "#0f0f0f",
        color: "#00ffea",
        cursor: "pointer",
        border: "2px solid #00ffea",
        boxShadow: "0 0 10px #00ffea88, 0 0 30px #00ffea44 inset",
        textTransform: "uppercase",
        fontFamily: "Orbitron, sans-serif",
        transition: "all 0.3s ease",
        letterSpacing: "1px"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "#00ffea";
        e.currentTarget.style.color = "#000";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "#0f0f0f";
        e.currentTarget.style.color = "#00ffea";
      }}
    >
      {action}
    </button>
  ))}

  {(playerHp <= 0 || botHp <= 0) && (
    <button
      onClick={handleRestart}
      style={{
        padding: "12px 20px",
        fontWeight: "bold",
        borderRadius: "8px",
        background: "#0f0f0f",
        color: "#ff0055",
        border: "2px solid #ff0055",
        boxShadow: "0 0 10px #ff005588, 0 0 30px #ff005544 inset",
        textTransform: "uppercase",
        fontFamily: "Orbitron, sans-serif",
        letterSpacing: "1px",
        cursor: "pointer"
      }}
    >
      Restart
    </button>
  )}

     </div>

      {/* Quiz Modal */}
  {showQuiz && currentQuestion && (
  <div style={{
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0, 0, 0, 0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  }}>
    <div style={{
      background: "#1a1a1a",
      padding: "32px",
      borderRadius: "16px",
      color: "#fff",
      width: "420px",
      textAlign: "center",
      border: "2px solid #00f0ff",
      boxShadow: "0 0 20px #00f0ff88",
      fontFamily: "Orbitron, sans-serif"
    }}>
      <h3 style={{ marginBottom: "20px", fontSize: "20px", color: "#00f0ff" }}>{currentQuestion.question}</h3>

      {currentQuestion.options.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleQuizChoice(opt.isCorrect)}
          disabled={quizResult !== null}
          style={{
            margin: "8px 0",
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            background: quizResult !== null && opt.isCorrect ? "#00c853" : "#2c2c2c",
            color: "#fff",
            border: "2px solid #444",
            fontWeight: "bold",
            cursor: quizResult === null ? "pointer" : "default",
            transition: "all 0.3s",
            letterSpacing: "0.5px"
          }}
          onMouseEnter={e => {
            if (quizResult === null) e.currentTarget.style.borderColor = "#00f0ff";
          }}
          onMouseLeave={e => {
            if (quizResult === null) e.currentTarget.style.borderColor = "#444";
          }}
        >
          {opt.text}
        </button>
      ))}

      {quizResult && (
        <div style={{
          marginTop: 16,
          fontSize: "16px",
          color: quizResult === "correct" ? "#00ff73" : "#ff3b3b",
          fontWeight: "bold"
        }}>
          {quizResult === "correct"
            ? "✔ Correct!"
            : `✖ Wrong! Correct: ${currentQuestion.options.find(o => o.isCorrect)?.text}`}
        </div>
      )}

      {quizResult && (
        <button
          onClick={() => {
            setShowQuiz(false);
            setPendingAction(null);
            setCurrentQuestion(null);
            setQuizResult(null);
          }}
          style={{
            marginTop: 20,
            padding: "10px 18px",
            background: "#00f0ff",
            border: "none",
            color: "#000",
            fontWeight: "bold",
            borderRadius: "6px",
            cursor: "pointer",
            textTransform: "uppercase"
          }}
        >
          Continue
        </button>
      )}
    </div>
  </div>
)}

    </div>
  );
}
