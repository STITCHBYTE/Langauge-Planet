import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Character from './Character.tsx';
import './FightingGame.css';

// Import CharacterType from CharacterSelect
import type { Character as CharacterType } from './CharacterSelect';

// Re-introduce PlayerCooldown interface
interface PlayerCooldown {
  dodge: number;
  attack1: number;
  attack2: number;
  heal: number;
  wrongAnswer: number;
}

interface PlayerState {
  x: number;
  health: number;
  action: string;
  direction: string;
  hitEffect: number;
  triggerActionAnim: number;
  cooldowns: PlayerCooldown; // Re-introduced cooldowns
  isDodging: boolean;
  isHealing: boolean;
  consecutiveAttacks: number;
}

// Re-introduce TranslationQuestion interface
interface TranslationQuestion {
  word: string;
  language: string;
  options: string[];
  correct: number;
}

interface PendingAttack {
  attackerPlayer: number;
  targetPlayer: number;
  damage: number;
  attackType: 'attack1' | 'attack2'; // Now explicitly tracking attack type
}

interface ReconnectTimeout extends NodeJS.Timeout {
  retryCount?: number;
}

interface FightingFriendsOnlineProps { // Updated props interface for CharacterType and onRestartGame
  isMultiplayer?: boolean;
  roomId?: string; // This prop can be used if a room ID is predetermined outside of URL
  joinRoomId?: string; // This prop can be used if joining a specific room from a UI input
  roomAction?: 'create' | 'join'; // 'create' if this client explicitly wants to create, 'join' if to join
  // New props from GameScreen
  selectedCharacter: CharacterType | null;
  onRestartGame: () => void;
}


const FightingFriendsOnline: React.FC<FightingFriendsOnlineProps> = ({
  isMultiplayer = true, // Default to true for this component
  roomId: propRoomId, // Room ID possibly passed from parent component (e.g., if dynamically generated)
  joinRoomId: propJoinRoomId, // Room ID for joining, potentially from an input field
  roomAction, // 'create' or 'join' action from parent component
  selectedCharacter, // Now a prop
  onRestartGame // Now a prop
}) => {
  const { roomId: urlRoomId } = useParams<{ roomId: string }>(); // Get roomId from URL parameters
  const navigate = useNavigate();

  // Load opponent character similar to FightingGame.tsx
  const [opponentCharacter, setOpponentCharacter] = useState<CharacterType | null>(null); // Renamed botCharacter to opponentCharacter for multiplayer clarity

  useEffect(() => {
    const loadOpponentCharacter = async () => {
        try {
            const response = await fetch('/assets/data/characters.json');
            const data = await response.json();
            // Select a random character for the opponent if no specific logic
            // For true multiplayer, the opponent's chosen character would come from the server
            const availableOpponents = data.filter((char: CharacterType) => char.key !== selectedCharacter?.key);
            setOpponentCharacter(availableOpponents[Math.floor(Math.random() * availableOpponents.length)] || data[0]);
        } catch (error) {
            console.error('Error loading opponent character:', error);
        }
    };
    if (selectedCharacter) { // Only load opponent if my character is selected
      loadOpponentCharacter();
    }
  }, [selectedCharacter]);


  // Character Image and FrameCount mappings will now be dynamic based on selectedCharacter and opponentCharacter
  const character1Images = useMemo(() => {
    if (!selectedCharacter) return {};
    const basePath = `/assets/sprites/${selectedCharacter.key}`;
    return {
      'idle-left': `${basePath}/idle.png`, 'idle-right': `${basePath}/idle.png`,
      'walk-left': `${basePath}/run.png`, 'walk-right': `${basePath}/run.png`,
      'attack1-left': `${basePath}/attack1.png`, 'attack1-right': `${basePath}/attack1.png`,
      'attack2-left': `${basePath}/attack2.png`, 'attack2-right': `${basePath}/attack2.png`,
      'dodge-left': `${basePath}/jump.png`, 'dodge-right': `${basePath}/jump.png`,
      'heal-left': `${basePath}/idle.png`, // Assuming heal uses idle or another placeholder
      'heal-right': `${basePath}/idle.png`,
      'ko-left': `${basePath}/death.png`, 'ko-right': `${basePath}/death.png`,
      'hit-left': `${basePath}/take_hit.png`, 'hit-right': `${basePath}/take_hit.png`,
    };
  }, [selectedCharacter]);

  const character2Images = useMemo(() => {
    if (!opponentCharacter) return {};
    const basePath = `/assets/sprites/${opponentCharacter.key}`;
    return {
      'idle-left': `${basePath}/idle.png`, 'idle-right': `${basePath}/idle.png`,
      'walk-left': `${basePath}/run.png`, 'walk-right': `${basePath}/run.png`,
      'attack1-left': `${basePath}/attack1.png`, 'attack1-right': `${basePath}/attack1.png`,
      'attack2-left': `${basePath}/attack2.png`, 'attack2-right': `${basePath}/attack2.png`,
      'dodge-left': `${basePath}/jump.png`, 'dodge-right': `${basePath}/jump.png`,
      'heal-left': `${basePath}/idle.png`, // Assuming heal uses idle or another placeholder
      'heal-right': `${basePath}/idle.png`,
      'ko-left': `${basePath}/death.png`, 'ko-right': `${basePath}/death.png`,
      'hit-left': `${basePath}/take_hit.png`, 'hit-right': `${basePath}/take_hit.png`,
    };
  }, [opponentCharacter]);


  const initialMaxHealth = 100;
  const moveSpeed = 20;
  const attackRange = 50; // Keep consistency with single-player
  const characterWidth = 300; // Keep consistency with single-player


  // Initial difficulty setting is not directly used for bot AI here, but kept for context if desired
  const initialDifficulty = 'medium'; // Can be passed as prop if needed

  // Translation questions array
  const translationQuestions: TranslationQuestion[] = useMemo(() => [
    { word: "Hello", language: "Spanish", options: ["Hola", "Adiós", "Gracias", "Por favor"], correct: 0 },
    { word: "Water", language: "French", options: ["Feu", "Terre", "Eau", "Air"], correct: 2 },
    { word: "Book", language: "German", options: ["Stuhl", "Tisch", "Buch", "Fenster"], correct: 2 },
    { word: "Cat", language: "Italian", options: ["Cane", "Gatto", "Pesce", "Uccello"], correct: 1 },
    { word: "Good", language: "Portuguese", options: ["Mau", "Bom", "Grande", "Pequeno"], correct: 1 },
  ], []);


  const calculateInitialPositions = useCallback(() => {
    const screenWidth = window.innerWidth;
    const offsetFromEdge = 50; // Pixels from the edge of the screen

    return {
      player1X: offsetFromEdge, // Player 1 starts from the left edge
      player2X: screenWidth - characterWidth - offsetFromEdge, // Player 2 starts from the right edge
    };
  }, [characterWidth])

  const [player1, setPlayer1] = useState<PlayerState>(() => ({
    x: calculateInitialPositions().player1X, health: initialMaxHealth, action: 'idle', direction: 'right', hitEffect: 0, triggerActionAnim: 0,
    cooldowns: { dodge: 0, attack1: 0, attack2: 0, heal: 0, wrongAnswer: 0 }, // Re-introduced cooldowns
    isDodging: false, isHealing: false, consecutiveAttacks: 0,
  }));

  const [player2, setPlayer2] = useState<PlayerState>(() => ({
    x: calculateInitialPositions().player2X, health: initialMaxHealth, action: 'idle', direction: 'left', hitEffect: 0, triggerActionAnim: 0,
    cooldowns: { dodge: 0, attack1: 0, attack2: 0, heal: 0, wrongAnswer: 0 }, // Re-introduced cooldowns
    isDodging: false, isHealing: false, consecutiveAttacks: 0,
  }));

  // Game State
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [roundStart, setRoundStart] = useState<boolean>(true);
  const [gamePaused, setGamePaused] = useState<boolean>(false); // Used for quiz

  // Network State
  const [roomIdState, setRoomId] = useState<string | null>(propRoomId || urlRoomId || null); // Use prop or URL param
  const [joinRoomIdInput, setJoinRoomIdInput] = useState<string>(propJoinRoomId || ''); // Use a different name for the input state
  const [myPlayerNumber, setMyPlayerNumber] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReconnectTimeout | null>(null);
  const messageQueue = useRef<any[]>([]); // Using a ref for messageQueue to avoid stale closures in ws.onmessage


  // UI & Effects State
  const [screenShake, setScreenShake] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [particles, setParticles] = useState<any[]>([]);

  // Quiz State
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<TranslationQuestion | null>(null);
  const [pendingAttack, setPendingAttack] = useState<PendingAttack | null>(null);


  // Sound Refs (initialized once)
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const punchSoundRef = useRef<HTMLAudioElement | null>(null);
  const woahSoundRef = useRef<HTMLAudioElement | null>(null);
  const fightStartSoundRef = useRef<HTMLAudioElement | null>(null);
  const koSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);


  // Helper to get animation duration based on character's frameCounts
  const getAnimationDuration = useCallback((playerNum: number, actionType: string) => {
    const char = playerNum === 1 ? selectedCharacter : opponentCharacter;
    // Map 'dodge' and 'heal' to 'jump' for frame counts, as per Character.tsx logic
    const mappedAction = { 'dodge': 'jump', 'heal': 'jump' }[actionType] || actionType;

    let frameCount: number = 6; // Default to 6 for safety

    // Safely access frameCounts
    if (char && char.frameCounts) {
        // First try the mapped action
        if (char.frameCounts[mappedAction as keyof typeof char.frameCounts] !== undefined) {
            frameCount = char.frameCounts[mappedAction as keyof typeof char.frameCounts];
        }
        // If mapped action not found, try the original actionType
        else if (char.frameCounts[actionType as keyof typeof char.frameCounts] !== undefined) {
            frameCount = char.frameCounts[actionType as keyof typeof char.frameCounts];
        }
        // Fallback to idle if neither is found
        else if (char.frameCounts.idle !== undefined) {
            frameCount = char.frameCounts.idle;
        }
    }

    return frameCount * 100; // 0.1s per frame = 100ms per frame
  }, [selectedCharacter, opponentCharacter]);


  // --- CORE GAME LOGIC (Adapted from FightingGame.tsx) ---

  // Moved createParticles here so it's defined before handleHit
  const createParticles = useCallback((x: number, y: number) => {
    const newParticles = Array.from({ length: 10 }).map(() => ({
      id: Math.random(),
      x: x + (Math.random() - 0.5) * 80,
      y: y + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - Math.random() * 4,
      life: 100,
    }));
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const handleHit = useCallback((targetPlayerNum: number, damage: number, attackerPlayerNum: number) => {
    if (punchSoundRef.current) {
      punchSoundRef.current.currentTime = 0; // Rewind to play immediately
      punchSoundRef.current.play().catch(e => console.log("Punch sound error:", e));
    }

    const targetSetter = targetPlayerNum === 1 ? setPlayer1 : setPlayer2;
    const currentTarget = targetPlayerNum === 1 ? player1 : player2;
    // For multiplayer, winner names are "You" or "Opponent"
    const winnerPlayerText = myPlayerNumber === attackerPlayerNum ? 'You' : 'Opponent';


    targetSetter(prev => {
      const newHealth = Math.max(0, prev.health - damage);
      if (newHealth === 0) {
        if (koSoundRef.current) {
          koSoundRef.current.currentTime = 0;
          koSoundRef.current.play().catch(e => console.log("KO sound error:", e));
        }
        setTimeout(() => {
          if (gameOverSoundRef.current) {
            gameOverSoundRef.current.currentTime = 0;
            gameOverSoundRef.current.play().catch(e => console.log("Game over sound error:", e));
          }
        }, 1500); // Delay game over sound slightly
        setGameOver(true);
        setWinner(winnerPlayerText); // Set winner for display
        return { ...prev, health: 0, action: 'ko', triggerActionAnim: prev.triggerActionAnim + 1 };
      }
      return { ...prev, health: newHealth, hitEffect: prev.hitEffect + 1 };
    });

    const targetPlayer = targetPlayerNum === 1 ? player1 : player2;
    createParticles(targetPlayer.x + characterWidth / 2, window.innerHeight * 0.7);
    setScreenShake(prev => prev + 1);
  }, [player1, player2, characterWidth, createParticles, koSoundRef, gameOverSoundRef, punchSoundRef, myPlayerNumber]);


  // Re-introduced Cooldown reduction
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayer1(prev => ({ ...prev, cooldowns: {
          dodge: Math.max(0, prev.cooldowns.dodge - 50),
          attack1: Math.max(0, prev.cooldowns.attack1 - 50),
          attack2: Math.max(0, prev.cooldowns.attack2 - 50),
          heal: Math.max(0, prev.cooldowns.heal - 50),
          wrongAnswer: Math.max(0, prev.cooldowns.wrongAnswer - 50),
      }}));
      setPlayer2(prev => ({ ...prev, cooldowns: {
          dodge: Math.max(0, prev.cooldowns.dodge - 50),
          attack1: Math.max(0, prev.cooldowns.attack1 - 50),
          attack2: Math.max(0, prev.cooldowns.attack2 - 50),
          heal: Math.max(0, prev.cooldowns.heal - 50),
          wrongAnswer: Math.max(0, prev.cooldowns.wrongAnswer - 50),
      }}));
    }, 50);
    return () => clearInterval(interval);
  }, []);


  // --- Player Action Definitions (executeAttack, executeDodge, executeHeal) ---
  // Moved these up to prevent initialization errors in handleTranslationAnswer


  const executeAttack = useCallback((attackerNum: number, attackType: 'attack1' | 'attack2') => {
    const attacker = attackerNum === 1 ? player1 : player2;
    const target = attackerNum === 1 ? player2 : player1;
    const attackerSetter = attackerNum === 1 ? setPlayer1 : setPlayer2;

    // Determine if the attack would hit (for local visual feedback and server communication)
    const distance = Math.abs((attacker.x + characterWidth / 2) - (target.x + characterWidth / 2));
    const isInRange = distance <= attackRange + characterWidth / 2;
    const isFacingTarget = (attacker.direction === 'right' && attacker.x < target.x) || (attacker.direction === 'left' && attacker.x > target.x);
    const wouldHit = isInRange && isFacingTarget && !target.isDodging; // Note: target.isDodging is local prediction

    // Set attacker's animation locally
    attackerSetter(prev => ({ ...prev, action: attackType, triggerActionAnim: prev.triggerActionAnim + 1 }));

    // Send action to server
    if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
            type: 'PLAYER_ACTION',
            action: attackType,
            // Inform server if this attack would hit based on client-side state
            // Server should re-verify this for authority
            hit: wouldHit,
            damage: attackType === 'attack1' ? 15 : 25, // Send expected damage
        }));
    }

    // Apply cooldown
    const cooldownTime = attackType === 'attack1' ? 1000 : 1800; // Cooldowns from FightingGame.tsx
    attackerSetter(prev => ({ ...prev, cooldowns: { ...prev.cooldowns, [attackType]: cooldownTime } }));

    // Reset action to idle after animation
    const animDuration = getAnimationDuration(attackerNum, attackType);
    setTimeout(() => {
        attackerSetter(prev => ({ ...prev, action: 'idle' }));
    }, animDuration);

    // If it's my attack and it would hit, trigger local handleHit (for immediate visual feedback)
    // Server will send back a definitive health update, which might override this.
    if (myPlayerNumber === attackerNum && wouldHit) {
        const damage = attackType === 'attack1' ? 15 : 25;
        handleHit(attackerNum === 1 ? 2 : 1, damage, attackerNum);
    }
  }, [player1, player2, attackRange, characterWidth, getAnimationDuration, myPlayerNumber, handleHit, wsRef]);

  const executeDodge = useCallback((playerNum: number) => {
    const setter = playerNum === 1 ? setPlayer1 : setPlayer2;
    const currentPlayer = playerNum === 1 ? player1 : player2;

    if (currentPlayer.cooldowns.dodge > 0 || currentPlayer.isDodging) {
        console.log(`Dodge blocked for player ${playerNum} due to cooldown or already dodging.`);
        return;
    }

    setter(prev => ({
      ...prev,
      action: 'dodge',
      isDodging: true,
      triggerActionAnim: prev.triggerActionAnim + 1,
      cooldowns: { ...prev.cooldowns, dodge: 2500 } // Cooldown from FightingGame.tsx
    }));

    if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'PLAYER_ACTION', action: 'dodge' }));
    }
    if (woahSoundRef.current) {
        woahSoundRef.current.currentTime = 0;
        woahSoundRef.current.play().catch(e => console.log("Woah sound error:", e));
    }

    const animDuration = getAnimationDuration(playerNum, 'dodge');
    setTimeout(() => {
      setter(prev => ({ ...prev, isDodging: false, action: 'idle' }));
    }, animDuration);
  }, [player1, player2, getAnimationDuration, woahSoundRef, wsRef]);


  const executeHeal = useCallback((playerNum: number) => {
    const setter = playerNum === 1 ? setPlayer1 : setPlayer2;
    const currentPlayer = playerNum === 1 ? player1 : player2;

    if (currentPlayer.cooldowns.heal > 0 || currentPlayer.health >= initialMaxHealth || currentPlayer.isHealing) {
        console.log(`Heal blocked for player ${playerNum}: Cooldown, Health full, or already healing.`);
        return;
    }

    const healAmount = 20;
    setter(prev => ({
      ...prev,
      action: 'heal',
      health: Math.min(initialMaxHealth, prev.health + healAmount),
      isHealing: true,
      triggerActionAnim: prev.triggerActionAnim + 1,
      cooldowns: { ...prev.cooldowns, heal: 5000 } // Cooldown from FightingGame.tsx
    }));

    if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
            type: 'PLAYER_ACTION',
            action: 'heal',
            healAmount: healAmount,
            newHealth: Math.min(initialMaxHealth, currentPlayer.health + healAmount) // Send new health to server for sync
        }));
    }

    const animDuration = getAnimationDuration(playerNum, 'heal');
    setTimeout(() => {
        setter(prev => ({ ...prev, isHealing: false, action: 'idle' }));
    }, animDuration);
  }, [player1, player2, initialMaxHealth, getAnimationDuration, wsRef]);


  // --- Quiz Logic (from FightingGame.tsx) ---

  const startTranslationQuiz = useCallback((attackerNum: number, targetNum: number, damage: number, attackType: 'attack1' | 'attack2') => {
    // Only start quiz if game is not already paused
    if (gamePaused) {
        console.log("Quiz already active or game paused. Not starting new quiz.");
        return;
    }
    setGamePaused(true);
    setQuizActive(true);
    setCurrentQuestion(translationQuestions[Math.floor(Math.random() * translationQuestions.length)]);
    setPendingAttack({ attackerPlayer: attackerNum, targetPlayer: targetNum, damage, attackType });
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
  }, [translationQuestions, gamePaused, backgroundMusicRef]);


  const handleTranslationAnswer = useCallback((selectedOption: number) => {
    if (!currentQuestion || !pendingAttack) return;

    if (selectedOption === currentQuestion.correct) {
      // Correct answer: Re-trigger the attack animation and logic
      executeAttack(pendingAttack.attackerPlayer, pendingAttack.attackType);
    } else {
      // Wrong answer: Apply penalty (only for the player who answered)
      const attackerSetter = pendingAttack.attackerPlayer === 1 ? setPlayer1 : setPlayer2;
      attackerSetter(prev => ({
        ...prev,
        cooldowns: { ...prev.cooldowns, wrongAnswer: 1500 } // 1.5s penalty
      }));
       // Optionally, send a message to the server about a failed quiz/wrong answer
       if (wsRef.current?.readyState === WebSocket.OPEN) {
         wsRef.current.send(JSON.stringify({
           type: 'QUIZ_RESULT',
           result: 'incorrect',
           attackerPlayer: pendingAttack.attackerPlayer
         }));
       }
    }

    // Reset quiz state
    setGamePaused(false);
    setQuizActive(false);
    setCurrentQuestion(null);
    setPendingAttack(null);
    if (audioEnabled && backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(e => console.log("Background music resume error:", e));
    }
  }, [currentQuestion, pendingAttack, executeAttack, audioEnabled, backgroundMusicRef, wsRef]);

 // Reset Game Function
  const resetGame = useCallback(() => {
    const { player1X, player2X } = calculateInitialPositions();
    setPlayer1({
      x: player1X,
      health: initialMaxHealth,
      action: 'idle',
      direction: 'right',
      hitEffect: 0,
      triggerActionAnim: 0,
      cooldowns: { dodge: 0, attack1: 0, attack2: 0, heal: 0, wrongAnswer: 0 },
      isDodging: false,
      isHealing: false,
      consecutiveAttacks: 0,
    });
    setPlayer2({
      x: player2X,
      health: initialMaxHealth,
      action: 'idle',
      direction: 'left',
      hitEffect: 0,
      triggerActionAnim: 0,
      cooldowns: { dodge: 0, attack1: 0, attack2: 0, heal: 0, wrongAnswer: 0 },
      isDodging: false,
      isHealing: false,
      consecutiveAttacks: 0,
    });
    setGameOver(false);
    setWinner(null);
    setParticles([]);
    setRoundStart(true);
    setQuizActive(false);
    setGamePaused(false);
    setCurrentQuestion(null);
    setPendingAttack(null);
    setMyPlayerNumber(null); // Crucial: Reset player number on game over to re-enter lobby state

    // Initial fight start sound for the new round
    setTimeout(() => {
      if (fightStartSoundRef.current) {
        fightStartSoundRef.current.currentTime = 0;
        fightStartSoundRef.current.play().catch(e => console.log("Fight start sound error:", e));
      }
    }, 1000);

    // If multiplayer, this typically leads back to a lobby or character select
    if (isMultiplayer) {
      onRestartGame(); // Call the prop from GameScreen to reset overall game state
    }
  }, [calculateInitialPositions, initialMaxHealth, onRestartGame, isMultiplayer, fightStartSoundRef]);



  // --- Network Connection & Message Handling ---

  const handleServerMessage = useCallback((data: any) => { // Moved this up to define before connectToWebSocket
    switch (data.type) {
      case 'ROOM_CREATED':
        setRoomId(data.roomId);
        setMyPlayerNumber(data.playerNum);
        console.log(`🚪 Room created: ${data.roomId}, Player: ${data.playerNum}`);
        // Reset game state when room is created, effectively starting a new round locally
        // The actual "FIGHT!" screen will show when GAME_START is received from server
        resetGame(); // Ensure local game state is clean
        break;
      case 'GAME_START':
        setMyPlayerNumber(data.playerNum);
        setRoomId(data.roomId); // Ensure roomId is set if joined via URL
        // Acknowledge game start and reset local game state
        setRoundStart(true); // Trigger the "FIGHT!" screen
        resetGame(); // Ensure game state is reset for new match
        console.log(`🎮 Game starting! You are Player ${data.playerNum}`);
        break;
      case 'ERROR':
        console.error('Server error:', data.message);
        alert(`Server Error: ${data.message}`);
        // Consider navigating away or prompting user to try again
        break;
      case 'PLAYER_MOVE': // This message is now used for both my moves and opponent moves
        const playerNumber = data.playerNumber;
        const targetSetter = playerNumber === 1 ? setPlayer1 : setPlayer2;
        targetSetter(prev => ({
          ...prev,
          x: data.x,
          action: data.action,
          direction: data.direction
        }));
        break;

      case 'PLAYER_ACTION': // General action from any player
        const actionPlayerNum = data.playerNumber;
        const actionType = data.action;
        const actionSetter = actionPlayerNum === 1 ? setPlayer1 : setPlayer2;

        actionSetter(prev => ({ ...prev, action: actionType, triggerActionAnim: prev.triggerActionAnim + 1 }));

        // Server authoritative hit detection/damage application
        if (data.action.startsWith('attack') && data.hit) {
            handleHit(data.targetPlayer, data.damage, actionPlayerNum);
        } else if (data.action === 'heal' && data.newHealth) {
            actionSetter(prev => ({ ...prev, health: data.newHealth }));
        }

        // Handle specific action animations and state resets
        const animDuration = getAnimationDuration(actionPlayerNum, actionType);
        if (actionType === 'dodge') {
            actionSetter(prev => ({ ...prev, isDodging: true }));
            if (woahSoundRef.current) { woahSoundRef.current.play(); }
            setTimeout(() => actionSetter(prev => ({ ...prev, isDodging: false, action: 'idle' })), animDuration);
        } else if (actionType === 'heal') {
            actionSetter(prev => ({ ...prev, isHealing: true }));
            setTimeout(() => actionSetter(prev => ({ ...prev, isHealing: false, action: 'idle' })), animDuration);
        } else { // For attacks and other short actions
            setTimeout(() => actionSetter(prev => ({ ...prev, action: 'idle' })), animDuration);
        }
        break;

      case 'HEALTH_UPDATE': // This is usually a server-initiated health sync, overriding local client prediction
        const updatedPlayerNum = data.playerNum;
        const updatedHealth = data.health;
        const setter = updatedPlayerNum === 1 ? setPlayer1 : setPlayer2;
        setter(prev => ({ ...prev, health: updatedHealth }));
        if (data.isKO) {
            setGameOver(true);
            setWinner(data.winner); // Server explicitly sends winner now
        }
        break;

      case 'OPPONENT_DISCONNECTED':
        alert('Opponent has disconnected. Returning to main menu.');
        setRoomId(null);
        setMyPlayerNumber(null);
        onRestartGame(); // Go back to character select / main menu
        break;
      default:
        console.log(`❓ Unknown message type: ${data.type}`);
        break;
    }
  }, [myPlayerNumber, handleHit, getAnimationDuration, onRestartGame, woahSoundRef, resetGame, player1, player2, initialMaxHealth]);


  const connectToWebSocket = useCallback(() => {
    // Only connect if there isn't an existing open or connecting WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
        console.log("WebSocket already open or connecting. Skipping new connection attempt.");
        return;
    }

    setConnectionStatus('connecting');
    // Ensure the WebSocket URL includes a room ID if available from URL or props
    const wsUrlRoomId = urlRoomId || propRoomId;
    const ws = new WebSocket(`ws://localhost:3001/?roomId=${wsUrlRoomId || ''}`); // Send room ID as query param for server's initial handling
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setConnectionStatus('connected');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Process any messages that might have queued up before myPlayerNumber was set
      while (messageQueue.current.length > 0) {
        const msg = messageQueue.current.shift();
        handleServerMessage(msg);
      }

      // Explicitly send room creation/join request *after* WebSocket is open.
      // Prioritize URL room ID, then join input, then explicit create action.
      const currentUrlRoomId = urlRoomId;
      const currentPropRoomId = propRoomId;
      const currentPropJoinRoomId = propJoinRoomId; // From the input field in GameScreen

      if (currentUrlRoomId) {
        console.log(`Client sending JOIN_ROOM for URL ID: ${currentUrlRoomId}`);
        ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomId: currentUrlRoomId }));
      } else if (currentPropJoinRoomId && roomAction === 'join') { // If specifically joining a room via input
        console.log(`Client sending JOIN_ROOM for input ID: ${currentPropJoinRoomId}`);
        ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomId: currentPropJoinRoomId.trim() }));
      } else if (roomAction === 'create' || currentPropRoomId) { // If explicitly creating or a predetermined propRoomId exists
        const roomIDToSend = currentPropRoomId || uuidv4(); // Use prop ID or generate new for CREATE
        console.log(`Client sending CREATE_ROOM for ID: ${roomIDToSend}`);
        ws.send(JSON.stringify({ type: 'CREATE_ROOM', roomId: roomIDToSend }));
      } else {
        // This case should ideally not be hit if GameScreen passes correct props.
        // If it is, it means the client doesn't know what room to join/create.
        console.warn("Client connected but no room action specified. Defaulting to CREATE_ROOM.");
        ws.send(JSON.stringify({ type: 'CREATE_ROOM' })); // Fallback: server generates ID
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Queue messages if myPlayerNumber is not set AND it's not a GAME_START or ROOM_CREATED message
        if (myPlayerNumber === null && !['GAME_START', 'ROOM_CREATED'].includes(data.type)) {
          messageQueue.current.push(data);
        } else {
          handleServerMessage(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('❌ WebSocket disconnected');
      setConnectionStatus('disconnected');
      if (!gameOver) { // Only attempt reconnect if game is not over
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect WebSocket...");
          connectToWebSocket(); // Attempt to reconnect
        }, 3000); // Try reconnecting after 3 seconds
      }
    };
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
    };
  }, [myPlayerNumber, propRoomId, urlRoomId, propJoinRoomId, roomAction, gameOver, handleServerMessage]); // Dependencies for connectToWebSocket

  useEffect(() => {
    // This useEffect is responsible for initiating the connection when the component mounts.
    // It should only run once unless `isMultiplayer` changes or `connectToWebSocket` function itself changes (due to its dependencies).
    if (isMultiplayer) {
      console.log("Initiating WebSocket connection...");
      connectToWebSocket();
    }

    return () => {
      // Cleanup function: Close WebSocket and clear timers on component unmount
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        console.log("Closing WebSocket on component unmount.");
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [isMultiplayer, connectToWebSocket]); // Depend on isMultiplayer and the memoized connectToWebSocket


  // Initialize Audio elements and handle first interaction
  useEffect(() => {
    backgroundMusicRef.current = new Audio('/sounds/background.mp3');
    punchSoundRef.current = new Audio('/sounds/punch.mp3');
    woahSoundRef.current = new Audio('/sounds/swoosh.mp3');
    fightStartSoundRef.current = new Audio('/sounds/fight-start.mp3');
    koSoundRef.current = new Audio('/sounds/KO.mp3');
    gameOverSoundRef.current = new Audio('/sounds/game-over.mp3');

    const handleFirstInteraction = () => {
      setAudioEnabled(true);
      if (backgroundMusicRef.current && backgroundMusicRef.current.paused) {
        backgroundMusicRef.current.loop = true;
        backgroundMusicRef.current.volume = 0.2;
        backgroundMusicRef.current.play().catch(e => console.log("Audio autoplay prevented:", e));
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction); // Also remove on keydown
    };
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []); // Empty dependency array means this runs once on mount


  // Particle Update Loop
  useEffect(() => {
    if (particles.length > 0) {
      const interval = setInterval(() => {
        setParticles(prev => prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.5, life: p.life - 2 })).filter(p => p.life > 0));
      }, 16);
      return () => clearInterval(interval);
    }
  }, [particles.length]);

  // Round start timer (from FightingGame.tsx)
  useEffect(() => {
    if (roundStart) {
      const timer = setTimeout(() => setRoundStart(false), 2000);
      const fightStartTimer = setTimeout(() => {
        if (fightStartSoundRef.current) {
          fightStartSoundRef.current.currentTime = 0;
          fightStartSoundRef.current.play().catch(e => console.log("Fight start sound error:", e));
        }
      }, 500);
      return () => {
        clearTimeout(timer);
        clearTimeout(fightStartTimer);
      };
    }
  }, [roundStart, fightStartSoundRef]);


  // --- Input Handling (Adapted from FightingGame.tsx) ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Game flow control: If game over or paused, restrict input
      if (gameOver || gamePaused || myPlayerNumber === null) return;

      // Quiz input: If quiz is active, only process number keys
      if (quizActive) {
        const optionIndex = parseInt(e.key, 10) - 1; // '1' -> 0, '2' -> 1, etc.
        if (!isNaN(optionIndex) && optionIndex >= 0 && optionIndex < (currentQuestion?.options.length || 0)) {
          handleTranslationAnswer(optionIndex);
          e.preventDefault(); // Prevent default browser behavior (e.g., scrolling)
        }
        return; // Consume the key event, don't process game controls
      }

      // Normal game controls
      const myPlayer = myPlayerNumber === 1 ? player1 : player2;
      const opponentPlayer = myPlayerNumber === 1 ? player2 : player1;

      // Prevent actions if player is already performing certain animations
      const performingAction = ['attack1', 'attack2', 'hit', 'ko', 'jump', 'dodge', 'heal'].includes(myPlayer.action);
      if (performingAction) return;

      // Determine if player is in range and facing opponent for a potential hit (for quiz trigger)
      const distance = Math.abs((myPlayer.x + characterWidth / 2) - (opponentPlayer.x + characterWidth / 2));
      const isInRange = distance <= attackRange + characterWidth / 2;
      const isFacingTarget = (myPlayer.direction === 'right' && myPlayer.x < opponentPlayer.x) || (myPlayer.direction === 'left' && myPlayer.x > opponentPlayer.x);
      const willHit = isInRange && isFacingTarget && !opponentPlayer.isDodging;


      switch (e.key.toLowerCase()) {
        case 'a': case 'arrowleft':
          const newX_left = Math.max(0, myPlayer.x - moveSpeed);
          setMyPlayerNumber(prevNum => (prevNum === 1 ? setPlayer1 : setPlayer2)(prev => ({ ...prev, x: newX_left, action: 'walk', direction: 'left' })));
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'PLAYER_MOVE', playerNumber: myPlayerNumber, x: newX_left, action: 'walk', direction: 'left' }));
          }
          break;
        case 'd': case 'arrowright':
          const newX_right = Math.min(window.innerWidth - characterWidth, myPlayer.x + moveSpeed);
          setMyPlayerNumber(prevNum => (prevNum === 1 ? setPlayer1 : setPlayer2)(prev => ({ ...prev, x: newX_right, action: 'walk', direction: 'right' })));
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'PLAYER_MOVE', playerNumber: myPlayerNumber, x: newX_right, action: 'walk', direction: 'right' }));
          }
          break;
        case 'w': case 'arrowup': // Dodge
        case 's': case 'arrowdown': // Dodge
          executeDodge(myPlayerNumber);
          break;
        case 'j': // Light Attack
          if (myPlayer.cooldowns.attack1 === 0) { // Check cooldown
              if (willHit) {
                  startTranslationQuiz(myPlayerNumber, myPlayerNumber === 1 ? 2 : 1, 15, 'attack1');
              } else {
                  executeAttack(myPlayerNumber, 'attack1'); // Play animation, server still gets action
              }
          }
          break;
        case 'k': // Heavy Attack
          if (myPlayer.cooldowns.attack2 === 0) { // Check cooldown
              if (willHit) {
                  startTranslationQuiz(myPlayerNumber, myPlayerNumber === 1 ? 2 : 1, 25, 'attack2');
              } else {
                  executeAttack(myPlayerNumber, 'attack2'); // Play animation, server still gets action
              }
          }
          break;
        case 'h': // Heal
          if (myPlayer.cooldowns.heal === 0) { // Check cooldown
              executeHeal(myPlayerNumber);
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameOver || myPlayerNumber === null) return;
      const myPlayer = myPlayerNumber === 1 ? player1 : player2;

      // Only set to idle if a movement key is released AND not performing an action that keeps character from idling
      if ((e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft' ||
           e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') &&
          !['attack1', 'attack2', 'hit', 'ko', 'jump', 'dodge', 'heal'].includes(myPlayer.action)) {
          setMyPlayerNumber(prevNum => (prevNum === 1 ? setPlayer1 : setPlayer2)(prev => ({ ...prev, action: 'idle' })));
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'PLAYER_MOVE', playerNumber: myPlayerNumber, x: myPlayer.x, action: 'idle', direction: myPlayer.direction }));
          }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    gameOver, gamePaused, quizActive, myPlayerNumber, player1, player2,
    handleTranslationAnswer, executeAttack, executeDodge, executeHeal, startTranslationQuiz,
    moveSpeed, attackRange, characterWidth, currentQuestion, wsRef
  ]);

  // Player direction update based on opponent position
  useEffect(() => {
    // Only update direction if not currently performing an attack/dodge/hit/ko
    const player1CanChangeDirection = !['attack1', 'attack2', 'hit', 'ko', 'jump', 'dodge', 'heal'].includes(player1.action);
    const player2CanChangeDirection = !['attack1', 'attack2', 'hit', 'ko', 'jump', 'dodge', 'heal'].includes(player2.action);

    if (player1CanChangeDirection) {
      setPlayer1(prev => ({ ...prev, direction: prev.x < player2.x ? 'right' : 'left' }));
    }
    if (player2CanChangeDirection) {
      setPlayer2(prev => ({ ...prev, direction: prev.x > player1.x ? 'left' : 'right' }));
    }
  }, [player1.x, player2.x, player1.action, player2.action]); // Depend on .action to prevent constant direction changes during animations


  // Luxury helper function for health bar styling
  const getHealthBarClass = useCallback((health: number, maxHealth: number) => {
    const healthPercentage = (health / maxHealth) * 100;
    if (healthPercentage > 60) return 'high-health';
    else if (healthPercentage > 30) return 'medium-health';
    else return 'low-health';
  }, []);

  // Ensure selectedCharacter and opponentCharacter are loaded before rendering game
  if (!selectedCharacter || !opponentCharacter) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading characters for online battle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`game-container ${screenShake > 0 ? 'shake' : ''}`}>
      {/* Dim overlay that appears when quiz is active */}
      {quizActive && <div className="game-dim-overlay"></div>}

      {/* New wrapper for the entire quiz block, to be centered */}
      {quizActive && currentQuestion && (myPlayerNumber === pendingAttack?.attackerPlayer) && ( // Only show quiz to the attacking player
          <div className="quiz-centered-container">
              {/* Question display area (top part of the centered block) */}
              <div className="quiz-top-question-area">
                  <div className="quiz-question-display">
                      Translate "{currentQuestion.word}" to {currentQuestion.language}
                  </div>
              </div>

              {/* Options display area (bottom part of the centered block) */}
              <div className="quiz-options-area">
                  {currentQuestion.options.map((option, index) => (
                      <button
                          key={index}
                          onClick={() => handleTranslationAnswer(index)}
                          className="quiz-option-button"
                      >
                          {index + 1}. {option}
                      </button>
                  ))}
                  <p className="quiz-instruction-bottom">Press 1-4 or click to answer</p>
              </div>
          </div>
      )}

      {/* Connection/Room Info */}
      <h1 className="game-title">Real-Time Fighter (Online)</h1>
      <div className="game-mode-controls">
        <div className={`bot-connection-status ${connectionStatus}`}>
          <span className="status-indicator"></span>
          Server: {connectionStatus}
        </div>
        {connectionStatus === 'connected' && !roomIdState && (myPlayerNumber === null) && ( // Only show if connected and not yet in a room
          <>
            {/* Create Room button */}
            <button onClick={() => wsRef.current?.send(JSON.stringify({ type: 'CREATE_ROOM', roomId: (propRoomId || urlRoomId || undefined) }))}>Create Room</button>
            {/* Join Room input and button */}
            <div className="join-room-container">
              <input type="text" placeholder="Enter Room ID" value={joinRoomIdInput} onChange={(e) => setJoinRoomIdInput(e.target.value)} />
              <button onClick={() => wsRef.current?.send(JSON.stringify({ type: 'JOIN_ROOM', roomId: joinRoomIdInput.trim() }))}>Join</button>
            </div>
          </>
        )}
        {roomIdState && (myPlayerNumber !== null) && ( // Show room info once connected to a room
          <div className="room-info">
            Room ID: <span className="room-id-text">{roomIdState}</span>
            {/* Show player number for clarity */}
            <span style={{ marginLeft: '10px' }}>You are: P{myPlayerNumber}</span>
            <button
                style={{ marginLeft: '12px' }}
                onClick={() => navigator.clipboard.writeText(`http://localhost:3000/game/${roomIdState}`)}
            >
              Copy Join Link
            </button>
          </div>
        )}
      </div>


      {roundStart && (
        <div className="round-start-screen">
          <div className="round-start-text">FIGHT!</div>
          <div className="round-start-subtitle">Online Battle Begins!</div>
        </div>
      )}

      {/* Health bars - dynamically display 'You' and 'Opponent' */}
      <div className="health-container">
        {/* Conditional rendering for player names */}
        {myPlayerNumber !== null ? ( // Only render player names if myPlayerNumber is set
            <>
                <div className="player-health left">
                <div className="player-name">You (P{myPlayerNumber})</div>
                <div className="health-bar-container">
                    <div
                    className={`health-bar ${myPlayerNumber === 1 ? getHealthBarClass(player1.health, initialMaxHealth) : getHealthBarClass(player2.health, initialMaxHealth)}`}
                    >
                    <div
                        className="health-fill"
                        style={{ width: `${(myPlayerNumber === 1 ? player1.health : player2.health) / initialMaxHealth * 100}%` }}
                    ></div>
                    </div>
                    <div className="health-text">{myPlayerNumber === 1 ? player1.health : player2.health}/{initialMaxHealth}</div>
                </div>
                {/* My wrong answer penalty if applicable */}
                {myPlayerNumber === 1 && player1.cooldowns.wrongAnswer > 0 && (
                    <div className="wrong-answer-penalty">
                    <span className="penalty-text">Penalty: {(player1.cooldowns.wrongAnswer / 1000).toFixed(1)}s</span>
                    </div>
                )}
                {myPlayerNumber === 2 && player2.cooldowns.wrongAnswer > 0 && (
                    <div className="wrong-answer-penalty">
                    <span className="penalty-text">Penalty: {(player2.cooldowns.wrongAnswer / 1000).toFixed(1)}s</span>
                    </div>
                )}
                </div>

                <div className="vs-text">VS</div>

                <div className="player-health right">
                <div className="player-name">Opponent (P{myPlayerNumber === 1 ? 2 : 1})</div>
                <div className="health-bar-container">
                    <div
                    className={`health-bar ${myPlayerNumber === 1 ? getHealthBarClass(player2.health, initialMaxHealth) : getHealthBarClass(player1.health, initialMaxHealth)}`}
                    >
                    <div
                        className="health-fill"
                        style={{ width: `${(myPlayerNumber === 1 ? player2.health : player1.health) / initialMaxHealth * 100}%` }}
                    ></div>
                    </div>
                    <div className="health-text">{myPlayerNumber === 1 ? player2.health : player1.health}/{initialMaxHealth}</div>
                </div>
                {/* Opponent's wrong answer penalty if applicable */}
                {myPlayerNumber === 1 && player2.cooldowns.wrongAnswer > 0 && (
                    <div className="bot-penalty"> {/* Reusing bot-penalty class for opponent's penalty */}
                    <span className="penalty-text">Opponent Penalty: {(player2.cooldowns.wrongAnswer / 1000).toFixed(1)}s</span>
                    </div>
                )}
                {myPlayerNumber === 2 && player1.cooldowns.wrongAnswer > 0 && (
                    <div className="bot-penalty">
                    <span className="penalty-text">Opponent Penalty: {(player1.cooldowns.wrongAnswer / 1000).toFixed(1)}s</span>
                    </div>
                )}
                </div>
            </>
        ) : (
            <p className="connecting-text">Waiting for player number...</p> /* Placeholder while connecting/assigning player number */
        )}
      </div>

      {gameOver && (
        <div className="game-over-screen">
          <h2>Game Over!</h2>
          <p>{winner} wins!</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}

      {/* Characters - Render based on myPlayerNumber to ensure 'my' character is always on left, opponent on right */}
      {myPlayerNumber === 1 ? (
        <>
          <Character
            name={selectedCharacter.name}
            initialX={player1.x}
            images={character1Images}
            direction={player1.direction}
            currentAction={player1.action}
            onHitEffect={player1.hitEffect}
            triggerActionAnimation={player1.triggerActionAnim}
            frameCounts={selectedCharacter.frameCounts} // Pass selected character's frame counts
            scale={selectedCharacter.scale}
            yOffset={selectedCharacter.yOffset} // Pass yOffset if applicable
          />
          <Character
            name={opponentCharacter.name}
            initialX={player2.x}
            images={character2Images}
            direction={player2.direction}
            currentAction={player2.action}
            onHitEffect={player2.hitEffect}
            triggerActionAnimation={player2.triggerActionAnim}
            frameCounts={opponentCharacter.frameCounts} // Pass opponent character's frame counts
            scale={opponentCharacter.scale}
            yOffset={opponentCharacter.yOffset} // Pass yOffset if applicable
          />
        </>
      ) : ( // If I am Player 2, render Player 2 (me) on left, Player 1 (opponent) on right
        <>
          <Character
            name={opponentCharacter.name} // Player 1 is now opponent
            initialX={player1.x} // Player 1's position is opponent's position
            images={character1Images} // Player 1's images
            direction={player1.direction}
            currentAction={player1.action}
            onHitEffect={player1.hitEffect}
            triggerActionAnimation={player1.triggerActionAnim}
            frameCounts={opponentCharacter.frameCounts} // Still use opponentCharacter's frame counts here for player1 model
            scale={opponentCharacter.scale}
            yOffset={opponentCharacter.yOffset}
          />
          <Character
            name={selectedCharacter.name} // Player 2 is now me
            initialX={player2.x} // Player 2's position is my position
            images={character2Images} // Player 2's images
            direction={player2.direction}
            currentAction={player2.action}
            onHitEffect={player2.hitEffect}
            triggerActionAnimation={player2.triggerActionAnim}
            frameCounts={selectedCharacter.frameCounts} // Still use selectedCharacter's frame counts here for player2 model
            scale={selectedCharacter.scale}
            yOffset={selectedCharacter.yOffset}
          />
        </>
      )}

      {/* Particles layer */}
      <div className="particles-container">
        {particles.map(p => <div key={p.id} className="particle" style={{ left: `${p.x}px`, top: `${p.y}px`, opacity: p.life / 100 }} />)}
      </div>
    </div>
  );
};

export default FightingFriendsOnline;

