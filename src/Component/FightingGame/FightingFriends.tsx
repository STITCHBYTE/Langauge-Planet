import React, { useEffect, useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import io, { Socket } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";

const SERVER_URL = "http://localhost:8082"; // Ensure this is your actual server IP/domain

interface PlayerState {
  id: string;
  hp: number;
  currentAnimation: string;
  isDodging: boolean;
  cooldown: boolean;
}

interface PvPGameState {
  players: {
    [playerId: string]: PlayerState;
  };
}

type QuizOption = { text: string; isCorrect: boolean };
type CharacterType = "player1" | "player2";

const animationNames: Record<CharacterType, string[]> = {
  player1: ["Idle", "Attack", "Hit", "Death", "Dodging"],
  player2: ["Idle", "Boxing", "Hit", "Death", "Ducking"],
};

const getAnimKey = (char: CharacterType, anim: string) => {
  const isBoxer = char === "player2";
  const map: Record<string, string> = {
    attack1: isBoxer ? "Boxing" : "Attack",
    attack2: isBoxer ? "Boxing" : "Attack",
    combo: isBoxer ? "Boxing" : "Attack",
    hit: "Hit",
    death: "Death",
    idle: "Idle",
    dodge: isBoxer ? "Ducking" : "Dodging",
    heal: "Idle",
  };
  return map[anim] || "Idle";
};

const getAnimPositionOffset = (characterType: CharacterType, animKeyInput: string) => {
  const key = getAnimKey(characterType, animKeyInput);
  switch (key) {
    case "Attack":
    case "Boxing":
      return new THREE.Vector3(characterType === "player1" ? 1.0 : -1.0, 0, 0);
    case "Hit":
      return new THREE.Vector3(characterType === "player1" ? -0.5 : 0.5, 0, 0);
    case "Dodging":
    case "Ducking":
      return new THREE.Vector3(characterType === "player1" ? -0.8 : 0.8, 0, 0);
    default:
      return new THREE.Vector3(0, 0, 0);
  }
};

export const Character = React.memo(({
  characterType,
  animationKey,
  basePosition,
  rotation = [0, 0, 0],
  isSelf = false,
}: {
  characterType: CharacterType;
  animationKey: string;
  basePosition: [number, number, number];
  rotation?: [number, number, number];
  isSelf?: boolean;
}) => {
  const group = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionMapRef = useRef<Record<string, THREE.AnimationAction>>({});
  const previousAnimKey = useRef<string>("Idle");
  const targetOffset = useRef(new THREE.Vector3());
  const currentOffset = useRef(new THREE.Vector3());
  const activeFinishListener = useRef<(() => void) | null>(null);

  const { scene } = useGLTF(`/models/${characterType}/Idle.glb`);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const [animations, setAnimations] = useState<Record<string, THREE.AnimationClip>>({});

  useEffect(() => {
    const loader = new GLTFLoader();
    const loadAnimations = async () => {
      const clips: Record<string, THREE.AnimationClip> = {};
      await Promise.all(animationNames[characterType].map(async (name) => {
        try {
          const gltf = await loader.loadAsync(`/models/${characterType}/${name}.glb`);
          if (gltf.animations?.length) {
            clips[name] = gltf.animations[0];
          } else {
            console.warn(`[${characterType}] No animation found in ${name}.glb`);
          }
        } catch (e) {
          console.error(`[${characterType}] Failed to load ${name}.glb`, e);
        }
      }));
      setAnimations(clips);
    };
    loadAnimations();
  }, [characterType]);

  useEffect(() => {
    if (!clonedScene || !Object.keys(animations).length) return;

    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;

    const actions: Record<string, THREE.AnimationAction> = {};
    for (const [name, clip] of Object.entries(animations)) {
      const action = mixer.clipAction(clip);
      action.clampWhenFinished = true;
      actions[name] = action;
    }

    actionMapRef.current = actions;

    actions.Idle?.reset().setLoop(THREE.LoopRepeat, Infinity).play();
    previousAnimKey.current = "Idle";

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(clonedScene);
    };
  }, [clonedScene, animations]);

  useEffect(() => {
    const mixer = mixerRef.current;
    const actions = actionMapRef.current;
    if (!mixer || !animationKey || !actions.Idle) return;

    const mappedKey = getAnimKey(characterType, animationKey);
    const currentAction = actions[previousAnimKey.current] || actions.Idle;
    const nextAction = actions[mappedKey];

    if (previousAnimKey.current === mappedKey && mappedKey !== "Hit") return;

    if (!nextAction) {
      currentAction.crossFadeTo(actions.Idle, 0.2, true);
      actions.Idle.reset().setLoop(THREE.LoopRepeat, Infinity).play();
      previousAnimKey.current = "Idle";
      targetOffset.current.set(0, 0, 0);
      return;
    }

    if (activeFinishListener.current) {
      mixer.removeEventListener("finished", activeFinishListener.current);
      activeFinishListener.current = null;
    }

    targetOffset.current.copy(getAnimPositionOffset(characterType, animationKey));

    nextAction.reset().setLoop(
      mappedKey === "Idle" ? THREE.LoopRepeat : THREE.LoopOnce,
      mappedKey === "Idle" ? Infinity : 1
    ).play();

    if (currentAction !== nextAction) {
      currentAction.crossFadeTo(nextAction, 0.2, true);
    }

    if (mappedKey !== "Idle" && mappedKey !== "Death") {
      const onFinish = () => {
        if (actionMapRef.current[mappedKey] === nextAction) {
          nextAction.crossFadeTo(actions.Idle, 0.2, true);
          actions.Idle.reset().setLoop(THREE.LoopRepeat, Infinity).play();
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
  }, [animationKey, animations]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
    if (group.current) {
      currentOffset.current.lerp(targetOffset.current, 0.15);
      group.current.position.set(
        basePosition[0] + currentOffset.current.x,
        basePosition[1] + currentOffset.current.y,
        basePosition[2] + currentOffset.current.z
      );
    }
  });

  if (!clonedScene) return null;

  return (
    <primitive
      object={clonedScene}
      ref={group}
      rotation={rotation}
      scale={[1.5, 1.5, 1.5]}
    />
  );
});

// Preload all character animations
["player1", "player2"].forEach((type) => {
  animationNames[type as CharacterType].forEach((name) => {
    useGLTF.preload(`/models/${type}/${name}.glb`);
  });
});

export default function PvPHealingTouchFightingGame() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);

  const [selfState, setSelfState] = useState<PlayerState | null>(null);
  const [opponentState, setOpponentState] = useState<PlayerState | null>(null);
  const [myId, setMyId] = useState<string | null>(null); // Socket ID of current client
  const [isPlayer1, setIsPlayer1] = useState<boolean>(false); // Is this client designated as P1 (e.g., host)
  const [playerCount, setPlayerCount] = useState<number>(0);

  const [gameStatus, setGameStatus] = useState<"connecting" | "waiting" | "active" | "finished">("connecting");
  const [message, setMessage] = useState<string>("Connecting...");

  const [showQuiz, setShowQuiz] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<"correct" | "wrong" | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [winnerId, setWinnerId] = useState<string|null>(null);

  type Question = { question: string; options: QuizOption[]; };
  const questions: Question[] = [
    { question: 'Translate: "To attack"', options: [{ text: "Attaquer", isCorrect: true }, { text: "Soigner", isCorrect: false }, { text: "Esquiver", isCorrect: false }] },
    { question: 'Translate: "To dodge"', options: [{ text: "Esquiver", isCorrect: true }, { text: "Combattre", isCorrect: false }, { text: "Blesser", isCorrect: false }] },
    { question: 'Translate: "To heal"', options: [{ text: "Soigner", isCorrect: true }, { text: "Frapper", isCorrect: false }, { text: "Courir", isCorrect: false }] },
    { question: 'Translate: "Hit"', options: [{ text: "Frapper", isCorrect: true }, { text: "Cacher", isCorrect: false }, { text: "Guérir", isCorrect: false }] },
    { question: 'Translate: "Death"', options: [{ text: "Mort", isCorrect: true }, { text: "Vie", isCorrect: false }, { text: "Douleur", isCorrect: false }] },
  ];

  useEffect(() => {
    const statusMessageLog = `[PvPGame Status] Status: ${gameStatus}, Msg: "${message}", Players: ${playerCount}, MyID: ${myId}, IsP1: ${isPlayer1}`;
    console.log(statusMessageLog);
  }, [gameStatus, message, playerCount, myId, isPlayer1]);

  useEffect(() => {
    // This effect manages the primary user-facing message based on gameStatus and playerCount
    let newMsg = "";
    switch(gameStatus) {
        case "connecting":
            newMsg = `Connecting to room ${roomCode || '...'}...`;
            break;
        case "waiting":
            if (playerCount === 0 && roomCode) newMsg = `Joined room ${roomCode}. Waiting for players... (0/2)`;
            else if (playerCount === 1) newMsg = `Waiting for opponent... (1/2)`;
            else if (playerCount === 2) newMsg = "Opponent found! Preparing game... (2/2)";
            else newMsg = "Waiting for players..."; // Fallback
            break;
        case "active":
            newMsg = "Game Started! FIGHT!";
            break;
        case "finished":
            // Specific finished messages (win/loss/disconnect) are set by their handlers.
            // This is a fallback or if a specific message isn't set.
            if (winnerId) {
                newMsg = winnerId === myId ? "🎉 You Won! 🎉" : "☠️ You Lost! ☠️";
            } else if (message === "Connection lost. Game interrupted." || message.includes("left")) {
                // Keep existing disconnect/left message
                newMsg = message;
            } else {
                newMsg = "Game Over.";
            }
            break;
        default: newMsg = "Loading...";
    }
    setMessage(newMsg);
  }, [gameStatus, playerCount, roomCode, winnerId, myId]); // myId added for winner message


  useEffect(() => {
    console.log(`[PvPGame] Main Effect Init: roomCode=${roomCode}.`);
    if (!roomCode) {
      console.error("[PvPGame] No room code. Redirecting.");
      setGameStatus("finished");
      setTimeout(() => navigate("/dashboard"), 2000);
      return;
    }

    const socket = io(`${SERVER_URL}/friend`, {
      transports: ["websocket"], reconnectionAttempts: 3,
    });
    socketRef.current = socket;
    setGameStatus("connecting");

    socket.on("connect", () => {
      const currentSocketId = socket.id;
      if (currentSocketId) {
        setMyId(currentSocketId);
        console.log(`[PvPGame] ✅ Connected to /friend (ID: ${currentSocketId}). Emitting joinRoom for: ${roomCode}`);
        socket.emit("joinRoom", roomCode);
      } else {
        console.error("[PvPGame] Socket connected but ID is undefined!");
        setGameStatus("finished"); 
      }
    });

    socket.on("roomResponse", (response: { success: boolean; message: string; roomCode?: string; isHost?: boolean }) => {
      console.log("[PvPGame] Received 'roomResponse':", response);
      if (response.success) {
        setGameStatus("waiting");
        if (response.isHost !== undefined) setIsPlayer1(response.isHost);
      } else {
        console.error(`[PvPGame] Failed to join room: ${response.message}`);
        setGameStatus("finished"); // Update status before setting message
        setMessage(`Error: ${response.message}. Redirecting...`);
        setTimeout(() => navigate("/dashboard"), 3000);
      }
    });
    
    socket.on("playersUpdated", (data: { players: string[]; hostId?: string }) => {
      const currentActiveSocketId = socketRef.current?.id;
      console.log("[PvPGame] Received 'playersUpdated'. Players:", data.players, "MyID:", currentActiveSocketId, "HostID:", data.hostId);
      setPlayerCount(data.players.length);

      if (currentActiveSocketId && data.hostId) {
          setIsPlayer1(currentActiveSocketId === data.hostId);
      } else if (currentActiveSocketId && data.players.length > 0 && !data.hostId) {
          setIsPlayer1(data.players.indexOf(currentActiveSocketId) === 0);
      }
      // Message updated by MessageEffect
    });

    socket.on("startGame", (data: { roomCode: string; players: string[]; initialStates?: PvPGameState['players'] }) => {
      console.log("[PvPGame] Received 'startGame'. Room:", data.roomCode, "Client Room:", roomCode);
      if (data.roomCode === roomCode) {
        console.log("[PvPGame] startGame matches room. Setting gameStatus=ACTIVE. Initial states:", data.initialStates);
        setGameStatus("active"); // MessageEffect will update the message
        setWinnerId(null); // Reset winner on new game start

        if (data.initialStates) {
            const currentActiveSocketId = socketRef.current?.id;
            if (currentActiveSocketId && data.initialStates) {
                let foundSelf: PlayerState | null = null;
                let foundOpponent: PlayerState | null = null;
                for (const pId in data.initialStates) {
                    if (pId === currentActiveSocketId) foundSelf = data.initialStates[pId];
                    else foundOpponent = data.initialStates[pId];
                }
                setSelfState(foundSelf);
                setOpponentState(foundOpponent);
                console.log("[PvPGame] Initial self/opponent states set from startGame.");
            } else {
                 console.warn("[PvPGame] Could not set initial states from 'startGame': MyID or initialStates missing.");
            }
        } else {
            console.warn("[PvPGame] 'startGame' event received without 'initialStates'. Characters might not render correctly at start.");
             // Initialize with default states if server doesn't send them
            setSelfState({id: socketRef.current?.id || "self", hp: 100, currentAnimation: "Idle", isDodging: false, cooldown: false});
            // Need a placeholder for opponent if not provided
            const oppId = data.players.find(p => p !== socketRef.current?.id) || "opponent";
            setOpponentState({id: oppId, hp: 100, currentAnimation: "Idle", isDodging: false, cooldown: false});

        }
      } else {
        console.warn("[PvPGame] Received startGame for a different room:", data.roomCode);
      }
    });

  socket.on("gameState", (state: PvPGameState) => {
    console.log("Received gameState:", state);
  const currentActiveSocketId = socketRef.current?.id;
  if (!currentActiveSocketId || !state.players) return;

  let foundSelf: PlayerState | null = null;
  let foundOpponent: PlayerState | null = null;
  for (const pId in state.players) {
    if (pId === currentActiveSocketId) foundSelf = state.players[pId];
    else foundOpponent = state.players[pId];
  }


 if (foundSelf) setSelfState(foundSelf);
if (foundOpponent) setOpponentState(foundOpponent);


  if (foundSelf && foundOpponent && (foundSelf.hp <= 0 || foundOpponent.hp <= 0)) {
    if (gameStatus !== "finished") {
      setGameStatus("finished");
      const WID = foundSelf.hp <= 0 ? (foundOpponent.id || null) : (foundSelf.id || null);
      setWinnerId(WID);
    }
  }
});


    socket.on("playerLeft", (data: { playerId: string; message?: string; remainingPlayers?: string[] }) => {
      console.log(`[PvPGame] Received 'playerLeft': Player ${data.playerId} left.`);
      const currentActiveSocketId = socketRef.current?.id;
      setGameStatus("finished");
      if (data.playerId !== currentActiveSocketId) {
        setMessage(`Opponent left. ${selfState && selfState.hp > 0 ? "You win by default!" : "Game Over."}`);
        setOpponentState(null);
      } else {
        setMessage("You have left the game.");
      }
      setPlayerCount(data.remainingPlayers?.length || 0);
    });
    
    socket.on("disconnect", (reason: string) => {
      console.warn(`[PvPGame] 🔌 Disconnected: ${reason}`);
      if (gameStatus !== "finished") {
        setMessage("Connection lost.");
        setGameStatus("finished");
      }
    });

    socket.on("connect_error", (err: Error) => {
        console.error(`[PvPGame] ❌ Connection Error: ${err.message}`);
        if (gameStatus !== "finished") {
            setMessage(`Connection failed. Please refresh.`);
            setGameStatus("finished");
        }
    });

    return () => {
      console.log("[PvPGame] Cleanup: Component unmounting.");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomCode, navigate]);
  function shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }
  const handleAction = (action: string) => {
    if (!selfState || selfState.hp <= 0 || gameStatus !== 'active' || selfState.cooldown ) {
      console.log("Self:", selfState, "Opponent:", opponentState);
      if(selfState?.cooldown) setMessage("Action on cooldown!");
      return;
    }
    const randomQuiz = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion({ ...randomQuiz, options: shuffleArray(randomQuiz.options) });
    setPendingAction(action); setShowQuiz(true); setQuizResult(null);
  };
  const handleQuizChoice = (isCorrect: boolean) => {
    if (isCorrect && pendingAction && socketRef.current?.connected && roomCode) {
      socketRef.current.emit("playerAction", { roomCode, action: pendingAction });
      setQuizResult("correct");
    } else {
      setQuizResult("wrong");
    }
  };
  const handleRestart = () => {
    if (socketRef.current?.connected && roomCode && gameStatus === 'finished') {
      socketRef.current.emit("restartFriendGameRequest", roomCode);
      setGameStatus("waiting"); // Optimistic update
      setWinnerId(null);
    }
  };
  // const selfBasePosition: [number, number, number] = isPlayer1 ? [-1.5, -2, 0] : [1.5, -2, 0];
  // const opponentBasePosition: [number, number, number] = isPlayer1 ? [1.5, -2, 0] : [-1.5, -2, 0];
  const selfRotation: [number, number, number] = isPlayer1 ? [0, Math.PI / 1.75, 0] : [0, -Math.PI / 1.75, 0];
  const opponentRotation: [number, number, number] = isPlayer1 ? [0, -Math.PI / 1.75, 0] : [0, Math.PI / 1.75, 0];
  const selfBasePosition: [number, number, number] = [0, -2, 0];
const opponentBasePosition: [number, number, number] = [0, -2, 0];
  return (
    <div style={{ height: "100vh", width: "100vw", background: "#111", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 10, width: "100%", textAlign:"center", color: "#fff", zIndex: 10, fontSize: "18px", fontWeight: "bold", textShadow: "0 0 5px #000" }}>
        {message} {roomCode && `(Room: ${roomCode})`} {playerCount > 0 && `(${playerCount}/2 players)`}
      </div>
      {selfState && (
        <div style={{ position: "absolute", bottom: 100, left: 20, color: "#fff", zIndex: 10 }}>
          <div>Your HP: {selfState.hp}</div>
          <div style={{ width: 200, height: 20, background: "#333", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ width: `${selfState.hp}%`, height: "100%", background: "#00ff00", transition: "width 0.3s" }} />
          </div>
        </div>
      )}
      {opponentState && (
        <div style={{ position: "absolute", bottom: 100, right: 20, color: "#fff", zIndex: 10 }}>
          <div>Opponent HP: {opponentState.hp}</div>
          <div style={{ width: 200, height: 20, background: "#333", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ width: `${opponentState.hp}%`, height: "100%", background: "#ff0000", transition: "width 0.3s" }} />
          </div>
        </div>
      )}
      <Canvas camera={{ position: [0, 1.5, 7], fov: 50 }} style={{ backgroundImage: `url("/models/arena.jpg")`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[0, 10, 5]} intensity={1.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
       <Suspense fallback={null}>
  {/* Self Character */}
  {selfState && (
    <Character
      characterType={isPlayer1 ? "player1" : "player2"}
      animationKey={selfState.currentAnimation || "idle"}
      basePosition={selfBasePosition}
      rotation={selfRotation}
      isSelf={true}
    />
  )}

  {/* Opponent Character */}
  {opponentState && (
    <Character
      characterType={isPlayer1 ? "player2" : "player1"}
      animationKey={opponentState.currentAnimation || "idle"}
      basePosition={opponentBasePosition}
      rotation={opponentRotation}
      isSelf={false}
    />
  )}
</Suspense>

        <OrbitControls enablePan={false} enableZoom={false} enableRotate={true} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2} minAzimuthAngle={-Math.PI/20} maxAzimuthAngle={Math.PI/20} />
      </Canvas>
            <div style={{ position: "fixed", bottom: 30, width: "100%", display: "flex", justifyContent: "center", gap: 15, zIndex: 5 }}>
        {["attack1", "attack2", "combo", "dodge", "heal"].map((action) => (
          <button
            key={action} onClick={() => handleAction(action)}
            disabled={gameStatus !== 'active' || !selfState || selfState.hp <= 0 || selfState.cooldown}
            style={{ 
              padding: "12px 20px", fontWeight: "bold", borderRadius: "8px", background: "#0f0f0f",
              color: (selfState?.cooldown || gameStatus !== 'active' || !selfState || selfState.hp <= 0) ? "#555" : "#00ffea",
              cursor: (gameStatus !== 'active' || !selfState || selfState.hp <= 0 || selfState.cooldown) ? "not-allowed" : "pointer",
              border: `2px solid ${(selfState?.cooldown || gameStatus !== 'active' || !selfState || selfState.hp <= 0) ? "#555" : "#00ffea"}`,
              boxShadow: `0 0 10px ${(selfState?.cooldown || gameStatus !== 'active' || !selfState || selfState.hp <= 0) ? "#55555588" : "#00ffea88"}, 0 0 20px ${(selfState?.cooldown || gameStatus !== 'active' || !selfState || selfState.hp <= 0) ? "#55555544" : "#00ffea44"} inset`,
              textTransform: "uppercase", fontFamily: "Orbitron, sans-serif", transition: "all 0.3s ease", letterSpacing: "1px"
            }}
          >
            {action}
          </button>
        ))}
        {gameStatus === 'finished' && (
          <button onClick={handleRestart}
            style={{
              padding: "12px 20px", fontWeight: "bold", borderRadius: "8px", background: "#0f0f0f", color: "#ffcc00",
              border: "2px solid #ffcc00", boxShadow: "0 0 10px #ffcc0088, 0 0 20px #ffcc0044 inset", textTransform: "uppercase",
              fontFamily: "Orbitron, sans-serif", letterSpacing: "1px", cursor: "pointer"
            }}
          >
            Restart
          </button>
        )}
      </div>

      {showQuiz && currentQuestion && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 }}>
          <div style={{ background: "#1a1a1a", padding: "32px", borderRadius: "16px", color: "#fff", width: "420px", textAlign: "center", border: "2px solid #00f0ff", boxShadow: "0 0 20px #00f0ff88", fontFamily: "Orbitron, sans-serif" }}>
            <h3 style={{ marginBottom: "20px", fontSize: "20px", color: "#00f0ff" }}>{currentQuestion.question}</h3>
            {currentQuestion.options.map((opt, i) => (
              <button key={i} onClick={() => handleQuizChoice(opt.isCorrect)} disabled={quizResult !== null}
                style={{
                  margin: "8px 0", width: "100%", padding: "12px", borderRadius: "8px",
                  background: quizResult !== null && opt.isCorrect ? "#00c853" : (quizResult !== null && !opt.isCorrect ? "#d32f2f" : "#2c2c2c"),
                  color: "#fff", border: "2px solid #444", fontWeight: "bold",
                  cursor: quizResult === null ? "pointer" : "default", transition: "all 0.3s", letterSpacing: "0.5px"
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { if (quizResult === null) (e.target as HTMLButtonElement).style.borderColor = "#00f0ff";}}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { if (quizResult === null) (e.target as HTMLButtonElement).style.borderColor = "#444";}}
              >
                {opt.text}
              </button>
            ))}
            {quizResult && (
              <div style={{ marginTop: 16, fontSize: "16px", color: quizResult === "correct" ? "#00ff73" : "#ff3b3b", fontWeight: "bold" }}>
                {quizResult === "correct" ? "✔ Correct!" : `✖ Wrong! Correct: ${currentQuestion.options.find(o => o.isCorrect)?.text}`}
              </div>
            )}
            {quizResult && (
              <button onClick={() => { setShowQuiz(false); setPendingAction(null); setCurrentQuestion(null); setQuizResult(null); }}
                style={{ marginTop: 20, padding: "10px 18px", background: "#00f0ff", border: "none", color: "#000", fontWeight: "bold", borderRadius: "6px", cursor: "pointer", textTransform: "uppercase" }}
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