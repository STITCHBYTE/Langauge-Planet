import React, { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

type CharacterType = "player" | "bot";
type QuizOption = { text: string; isCorrect: boolean };

const animationNames: Record<CharacterType, string[]> = {
  player: ["Idle", "Attack", "Hit", "Death", "Dodging"],
  bot: ["Idle", "Boxing", "Hit", "Death", "Ducking"],
};

const getAnimKey = (char: CharacterType, anim: string) => {
  const map: Record<string, string> = {
    attack1: char === "bot" ? "Boxing" : "Attack",
    attack2: char === "bot" ? "Boxing" : "Attack",
    combo: char === "bot" ? "Boxing" : "Attack",
    hit: "Hit",
    death: "Death",
    idle: "Idle",
    dodge: char === "bot" ? "Ducking" : "Dodging",
    heal: "Idle",
  };
  return map[anim] || "Idle";
};

const getAnimPositionOffset = (characterType: CharacterType, animKeyInput: string) => {
  const key = getAnimKey(characterType, animKeyInput);
  switch (key) {
    case "Attack":
    case "Boxing":
      return new THREE.Vector3(characterType === "player" ? 1.0 : -1.0, 0, 0); // increased from 0.6
    case "Hit":
      return new THREE.Vector3(characterType === "player" ? -0.5 : 0.5, 0, 0); // slight recoil
    case "Dodging":
    case "Ducking":
      return new THREE.Vector3(characterType === "player" ? -0.8 : 0.8, 0, 0); // dodge further
    default:
      return new THREE.Vector3(0, 0, 0);
  }
};


const Character = ({
  characterType,
  animationKey,
  basePosition,
  rotation,
}: {
  characterType: CharacterType;
  animationKey: string;
  basePosition: [number, number, number];
  rotation?: [number, number, number];
}) => {
  const group = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionMapRef = useRef<Record<string, THREE.AnimationAction>>({});
  const previousAnimKey = useRef<string>("");

  const targetOffset = useRef<THREE.Vector3>(new THREE.Vector3());
  const currentOffset = useRef<THREE.Vector3>(new THREE.Vector3());

  const activeFinishListener = useRef<(() => void) | null>(null);

  const { scene } = useGLTF(`/models/${characterType}/Idle.glb`);
  const [animations, setAnimations] = useState<Record<string, THREE.AnimationClip>>({});

  useEffect(() => {
    const loader = new GLTFLoader();
    const loadAnimations = async () => {
      const clips: Record<string, THREE.AnimationClip> = {};
      for (const name of animationNames[characterType]) {
        try {
          const loadedGltf = await loader.loadAsync(`/models/${characterType}/${name}.glb`);
          if (loadedGltf.animations[0]) clips[name] = loadedGltf.animations[0];
        } catch (error) {
          console.error(`Failed to load animation: ${name}`, error);
        }
      }
      setAnimations(clips);
    };
    loadAnimations();
  }, [characterType]);

  useEffect(() => {
    if (!scene || Object.keys(animations).length === 0) return;

    const mixer = new THREE.AnimationMixer(scene);
    mixerRef.current = mixer;

    const actions: Record<string, THREE.AnimationAction> = {};
    for (const [name, clip] of Object.entries(animations)) {
      const action = mixer.clipAction(clip);
      action.clampWhenFinished = true;
      actions[name] = action;
    }
    actionMapRef.current = actions;

    const idleAction = actions["Idle"];
    if (idleAction) {
      idleAction.reset().setLoop(THREE.LoopRepeat, Infinity).play();
      previousAnimKey.current = "Idle";
    }

    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
      actionMapRef.current = {};
    };
  }, [animations, scene]);

  useEffect(() => {
    const mixer = mixerRef.current;
    const actions = actionMapRef.current;
    if (!mixer || !actions.Idle) return;

    const mappedKey = getAnimKey(characterType, animationKey);
    if (previousAnimKey.current === mappedKey && mappedKey !== "Idle") return;

    const current = actions[previousAnimKey.current] || actions.Idle;
    const next = actions[mappedKey];
    if (!next) return;

    if (activeFinishListener.current) {
      mixer.removeEventListener("finished", activeFinishListener.current);
      activeFinishListener.current = null;
    }

    targetOffset.current = getAnimPositionOffset(characterType, animationKey);

    next.reset();
    if (mappedKey === "Idle") {
      next.setLoop(THREE.LoopRepeat, Infinity);
    } else {
      next.setLoop(THREE.LoopOnce, 1);
    }

    if (current !== next) {
      current.crossFadeTo(next, 0.3, true);
    }
    next.play();

    if (mappedKey !== "Idle" && mappedKey !== "Death") {
      const onFinish = () => {
        const idle = actions.Idle;
        if (idle) {
          next.crossFadeTo(idle, 0.3, true);
          idle.reset().play().setLoop(THREE.LoopRepeat, Infinity);
          targetOffset.current.set(0, 0, 0);
          previousAnimKey.current = "Idle";
        }
        mixer.removeEventListener("finished", onFinish);
        activeFinishListener.current = null;
      };
      activeFinishListener.current = onFinish;
      mixer.addEventListener("finished", onFinish);
    }

    previousAnimKey.current = mappedKey;
  }, [animationKey, characterType]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
    if (group.current) {
      currentOffset.current.lerp(targetOffset.current, 0.2);
      group.current.position.set(
        basePosition[0] + currentOffset.current.x,
        basePosition[1],
        basePosition[2]
      );
    }
  });

  return (
    <primitive object={scene} ref={group} rotation={rotation} scale={[1.5, 1.5, 1.5]} />
  );
};

useGLTF.preload(`/models/player/Idle.glb`);
useGLTF.preload(`/models/bot/Idle.glb`);

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
      <Canvas camera={{ position: [0, 1.5, 6], fov: 50 }} style={{ backgroundImage: `url("/models/arena.jpg")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",}}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 10, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <Character characterType="player" animationKey={playerAnim} basePosition={[-1.5, -2, 0]} rotation={[0, Math.PI / 1.75, 0]} />
          <Character characterType="bot" animationKey={botAnim} basePosition={[1.5, -2, 0]} rotation={[0, -Math.PI / 1.75, 0]} />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>

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
