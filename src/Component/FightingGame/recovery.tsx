import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Character from './Character.tsx';
import './FightingGame.css';

interface PlayerState {
  x: number;
  health: number;
  action: string;
  direction: string;
  hitEffect: number;
  triggerActionAnim: number;
  cooldowns: PlayerCooldown;
  isDodging: boolean;
  isHealing: boolean;
  consecutiveAttacks: number; // Track consecutive attacks for progressive cooldown
}

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
  attackType: 'attack1' | 'attack2';
}

interface PlayerCooldown {
  dodge: number;
  attack1: number;
  attack2: number;
  heal: number;
  wrongAnswer: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface FightingGameProps {
  initialDifficulty?: 'easy' | 'medium' | 'hard';
  isMultiplayer?: boolean;
  roomId?: string;
  joinRoomId?: string;
  roomAction?: 'create' | 'join';
}

const FightingGame: React.FC<FightingGameProps> = ({ 
  initialDifficulty = 'medium', 
  isMultiplayer = false,
  roomId: propRoomId,
  joinRoomId: propJoinRoomId,
  roomAction
}) => {
  // Image mappings for Player 1 (Ryu-like)
  const character1Images = {
    'idle-left': '/images/idel-left.png',
    'idle-right': '/images/idel-left.png',
    'walk-left': '/images/left.png',
    'walk-right': '/images/left.png',
    'attack1-left': '/images/attack-left.png',
    'attack1-right': '/images/attack-left.png',
    'attack2-left': '/images/attack-left1.png',
    'attack2-right': '/images/attack-left1.png',
    'dodge-left': '/images/doge-left.png',
    'dodge-right': '/images/doge-left.png',
    'heal-left': '/images/idel-left.png',
    'heal-right': '/images/idel-left.png',
    'ko-left': '/images/KO-left.png',
    'ko-right': '/images/KO-left.png',
  };

  // Image mappings for Player 2 (Cyborg-like)
  const character2Images = {
    'idle-left': '/images/idle-right.png',
    'idle-right': '/images/idle-right.png',
    'walk-left': '/images/walk1-right.png',
    'walk-right': '/images/right.png',
    'attack1-left': '/images/attack-right.png',
    'attack1-right': '/images/attack-right.png',
    'attack2-left': '/images/attack-right1.png',
    'attack2-right': '/images/attack-right1.png',
    'dodge-left': '/images/dodge-right.png',
    'dodge-right': '/images/dodge-right.png',
    'heal-left': '/images/idle-right.png',
    'heal-right': '/images/idle-right.png',
    'ko-left': '/images/KO-right.png',
    'ko-right': '/images/KO-right.png',
  };

  const initialMaxHealth = 100;
  const moveSpeed = 20;
  const attackRange = 50; // Reduced from 200 to ~2 inches (50px ≈ 2 inches on most screens)
  const characterWidth = 300;
  const gapBetweenCharacters = 250;
  
  // Difficulty-based settings
  const getDifficultySettings = useCallback(() => {
    switch (initialDifficulty) {
      case 'easy':
        return {
          botMoveSpeed: 38, // 50% increase from original 25 (25 * 1.5 = 37.5)
          botActionInterval: 50, // Faster movement decisions (was 65)
          botAttackDamage: 8, // Less damage
          playerAttackDamage: 15, // Player does more damage
        };
      case 'medium':
        return {
          botMoveSpeed: 45, // 50% increase from original 30 (30 * 1.5 = 45)
          botActionInterval: 45, // Faster movement decisions (was 55)
          botAttackDamage: 15, // Standard damage
          playerAttackDamage: 20, // Equal damage
        };
      case 'hard':
        return {
          botMoveSpeed: 50, // Kept the same as before
          botActionInterval: 45, // Kept the same as before
          botAttackDamage: 15, // More damage
          playerAttackDamage: 12, // Player does less damage
        };
        default:
        return {
          botMoveSpeed: 30,
          botActionInterval: 70,
          botAttackDamage: 15,
          playerAttackDamage: 15,
        };
    }
  }, [initialDifficulty]);

  const difficultySettings = getDifficultySettings();

  // Calculate progressive attack cooldown based on consecutive attacks (BOT ONLY)
  const getBotAttackCooldown = useCallback((consecutiveAttacks: number, attackType: 'attack1' | 'attack2') => {
    const baseCooldown = attackType === 'attack1' ? 1500 : 2500;
    
    if (consecutiveAttacks === 0) {
      return baseCooldown; // First attack uses base cooldown
    } else if (consecutiveAttacks === 1) {
      // Second consecutive attack - difficulty-based cooldown
      switch (initialDifficulty) {
        case 'easy': return 7000; // 7 seconds
        case 'medium': return 5000; // 5 seconds  
        case 'hard': return 3000; // 3 seconds
        default: return 5000;
      }
    } else {
      // Third+ consecutive attack - even longer cooldown
      switch (initialDifficulty) {
        case 'easy': return 10000; // 10 seconds
        case 'medium': return 8000; // 8 seconds
        case 'hard': return 6000; // 6 seconds
        default: return 8000;
      }
    }
  }, [initialDifficulty]);

  const calculateInitialPositions = useCallback(() => {
    const screenWidth = window.innerWidth;
    const totalOccupiedWidth = 2 * characterWidth + gapBetweenCharacters;
    const leftEdgeOfBlock = (screenWidth - totalOccupiedWidth) / 2;

    return {
      player1X: leftEdgeOfBlock,
      player2X: leftEdgeOfBlock + characterWidth + gapBetweenCharacters,
    };
  }, [characterWidth, gapBetweenCharacters]);

  const [player1, setPlayer1] = useState<PlayerState>(() => {
    const { player1X } = calculateInitialPositions();
    return {
      x: player1X,
      health: initialMaxHealth,
      action: 'idle',
      direction: 'right',
      hitEffect: 0,
      triggerActionAnim: 0,
      cooldowns: {
        dodge: 0,
        attack1: 0,
        attack2: 0,
        heal: 0,
        wrongAnswer: 0,
      },
      isDodging: false,
      isHealing: false,
      consecutiveAttacks: 0, // Track consecutive attacks for progressive cooldown
    };
  });

  const [player2, setPlayer2] = useState<PlayerState>(() => {
    const { player2X } = calculateInitialPositions();
    return {
      x: player2X,
      health: initialMaxHealth,
      action: 'idle',
      direction: 'left',
      hitEffect: 0,
      triggerActionAnim: 0,
      cooldowns: {
        dodge: 0,
        attack1: 0,
        attack2: 0,
        heal: 0,
        wrongAnswer: 0,
      },
      isDodging: false,
      isHealing: false,
      consecutiveAttacks: 0, // Track consecutive attacks for progressive cooldown
    };
  });

  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [screenShake, setScreenShake] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [roundStart, setRoundStart] = useState<boolean>(true);
  const [botDifficulty] = useState<string>(initialDifficulty);

  // Multiplayer states
  const [roomId, setRoomId] = useState<string | null>(propRoomId || null);
  const [myPlayerNumber, setMyPlayerNumber] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueue = useRef<any[]>([]);

  // Legacy compatibility: isConnected state
  const [isConnected, setIsConnected] = useState(false);

  // Translation system states
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<TranslationQuestion | null>(null);
  const [gamePaused, setGamePaused] = useState<boolean>(false);
  const [pendingAttack, setPendingAttack] = useState<PendingAttack | null>(null);

  // Sync isConnected with connectionStatus
  useEffect(() => {
    setIsConnected(connectionStatus === 'connected');
  }, [connectionStatus]);

  const translationQuestions = useMemo(() => [
    {
      word: "Hello",
      language: "Spanish",
      options: ["Hola", "Adiós", "Gracias", "Por favor"],
      correct: 0
    },
    {
      word: "Water",
      language: "French", 
      options: ["Feu", "Terre", "Eau", "Air"],
      correct: 2
    },
    {
      word: "Book",
      language: "German",
      options: ["Stuhl", "Tisch", "Buch", "Fenster"],
      correct: 2
    },
    {
      word: "Cat",
      language: "Italian",
      options: ["Cane", "Gatto", "Pesce", "Uccello"],
      correct: 1
    },
    {
      word: "Good",
      language: "Portuguese",
      options: ["Mau", "Bom", "Grande", "Pequeno"],
      correct: 1
    },
  ], []);

  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const punchSoundRef = useRef<HTMLAudioElement | null>(null);
  const woahSoundRef = useRef<HTMLAudioElement | null>(null);
  const fightStartSoundRef = useRef<HTMLAudioElement | null>(null);
  const koSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    backgroundMusicRef.current = new Audio('/sounds/background.mp3');
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.2;

    const playMusic = () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.play().catch(error => {
          console.log("Autoplay prevented:", error);
        });
      }
    };

    const handleFirstInteraction = () => {
      setAudioEnabled(true);
      if (backgroundMusicRef.current && backgroundMusicRef.current.paused) {
        playMusic();
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
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
  }, []);

  useEffect(() => {
    punchSoundRef.current = new Audio('/sounds/punch.mp3');
    woahSoundRef.current = new Audio('/sounds/swoosh.mp3');
    fightStartSoundRef.current = new Audio('/sounds/fight-start.mp3');
    koSoundRef.current = new Audio('/sounds/KO.mp3');
    gameOverSoundRef.current = new Audio('/sounds/game-over.mp3');
  }, []);

  // WebSocket connection and message handling
  const handleOpponentAction = useCallback((action: any) => {
    const opponentSetter = myPlayerNumber === 1 ? setPlayer2 : setPlayer1;
    const mySetter = myPlayerNumber === 1 ? setPlayer1 : setPlayer2;
    
    switch (action.type) {
      case 'attack1':
      case 'attack2':
        // Trigger opponent attack animation
        opponentSetter(prev => ({
          ...prev,
          action: action.type,
          triggerActionAnim: prev.triggerActionAnim + 1
        }));
        
        // Check if I'm in range and not dodging
        if (action.hit && !action.dodged) {
          // Take damage
          mySetter(prev => {
            const newHealth = Math.max(0, prev.health - action.damage);
            return {
              ...prev,
              health: newHealth,
              hitEffect: prev.hitEffect + 1
            };
          });
          
          // Play hit sound
          if (punchSoundRef.current) {
            punchSoundRef.current.play().catch(e => console.log("Punch sound error:", e));
          }
          
          // Create particles - will be called after createParticles is defined
          const targetX = myPlayerNumber === 1 ? player1.x : player2.x;
          const newParticles: Particle[] = Array.from({ length: 10 }).map(() => ({
            id: Math.random(),
            x: targetX + characterWidth / 2 + (Math.random() - 0.5) * 80,
            y: window.innerHeight * 0.7 + (Math.random() - 0.5) * 80,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - Math.random() * 4,
            life: 100,
          }));
          setParticles(prev => [...prev, ...newParticles]);
          setScreenShake(prev => prev + 1);
        }
        break;
        
      case 'dodge':
        opponentSetter(prev => ({
          ...prev,
          action: 'dodge',
          isDodging: true,
          triggerActionAnim: prev.triggerActionAnim + 1
        }));
        
        // End dodge after duration
        setTimeout(() => {
          opponentSetter(prev => ({ ...prev, isDodging: false }));
        }, 800);
        break;
        
      case 'heal':
        opponentSetter(prev => ({
          ...prev,
          action: 'heal',
          health: Math.min(initialMaxHealth, prev.health + action.healAmount),
          isHealing: true,
          triggerActionAnim: prev.triggerActionAnim + 1
        }));
        
        setTimeout(() => {
          opponentSetter(prev => ({ ...prev, isHealing: false }));
        }, 1000);
        break;
    }
  }, [myPlayerNumber, player1.x, player2.x, characterWidth]);

  const handleWebSocketMessage = useCallback((data: any) => {
    console.log('📨 Received:', data);
    
    switch (data.type) {
      case 'ROOM_CREATED':
        setRoomId(data.roomId);
        setMyPlayerNumber(data.playerNum);
        console.log(`🚪 Room created: ${data.roomId}, Player: ${data.playerNum}`);
        break;
        
      case 'GAME_START':
        setMyPlayerNumber(data.playerNum);
        setRoundStart(true);
        console.log(`🎮 Game starting! You are Player ${data.playerNum}`);
        break;
        
      case 'OPPONENT_MOVE':
        // Update opponent position and animation
        const opponentSetter = myPlayerNumber === 1 ? setPlayer2 : setPlayer1;
        opponentSetter(prev => ({
          ...prev,
          x: data.x,
          action: data.action,
          direction: data.direction
        }));
        break;
        
      case 'OPPONENT_ACTION':
        // Handle opponent combat actions
        handleOpponentAction(data.action);
        break;
        
      case 'OPPONENT_HEALTH_UPDATE':
        // Update opponent health
        const healthSetter = data.playerNum === 1 ? setPlayer1 : setPlayer2;
        healthSetter(prev => ({
          ...prev,
          health: data.health,
          hitEffect: prev.hitEffect + 1
        }));
        
        if (data.isKO) {
          setGameOver(true);
          setWinner(myPlayerNumber === data.playerNum ? 'Opponent' : 'You');
        }
        break;
        
      case 'OPPONENT_DISCONNECTED':
        alert('Opponent disconnected');
        break;
        
      case 'ERROR':
        console.error('Server error:', data.message);
        alert(data.message);
        break;
    }
  }, [myPlayerNumber, handleOpponentAction]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    console.log('🔌 Connecting to WebSocket server...');
    setConnectionStatus('connecting');
    
    const ws = new WebSocket('ws://localhost:3001');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setConnectionStatus('connected');
      
      // Send queued messages
      messageQueue.current.forEach(message => {
        ws.send(JSON.stringify(message));
      });
      messageQueue.current = [];

      // Handle room creation or joining
      if (roomAction === 'create') {
        console.log('Creating room...');
        ws.send(JSON.stringify({ 
          type: 'CREATE_ROOM',
          roomId: propRoomId // Send the room ID if provided
        }));
      } else if (roomAction === 'join' && propJoinRoomId) {
        console.log('Joining room:', propJoinRoomId);
        ws.send(JSON.stringify({ 
          type: 'JOIN_ROOM', 
          roomId: propJoinRoomId.trim() // Ensure no whitespace in room ID
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('❌ WebSocket disconnected');
      setConnectionStatus('disconnected');
      
      // Attempt to reconnect after 3 seconds if in multiplayer mode
      if (isMultiplayer && !gameOver) {
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };
  }, [isMultiplayer, roomAction, propRoomId, propJoinRoomId, gameOver, handleWebSocketMessage]);



  // Initialize WebSocket connection for multiplayer
  useEffect(() => {
    if (isMultiplayer) {
      connectWebSocket();
      
      return () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }
  }, [isMultiplayer, connectWebSocket]);

  useEffect(() => {
    const timer = setTimeout(() => setRoundStart(false), 2000); // Shorter round start
    const fightStartTimer = setTimeout(() => {
      if (fightStartSoundRef.current) {
        fightStartSoundRef.current.play().catch(e => console.log("Fight start sound error:", e));
      }
    }, 500); // Start fighting sounds earlier
    return () => {
      clearTimeout(timer);
      clearTimeout(fightStartTimer);
    };
  }, []);

  const createParticles = useCallback((x: number, y: number, count: number = 10) => {
    const newParticles: Particle[] = Array.from({ length: count }).map(() => ({
      id: Math.random(),
      x: x + (Math.random() - 0.5) * 80,
      y: y + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - Math.random() * 4,
      life: 100,
    }));
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  useEffect(() => {
    if (particles.length > 0) {
      const interval = setInterval(() => {
        setParticles(prev => prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.5,
          life: p.life - 2
        })).filter(p => p.life > 0));
      }, 16);
      return () => clearInterval(interval);
    }
  }, [particles.length]);

  const handleHit = useCallback((targetPlayerNum: number, damage: number, attackerPlayerNum: number) => {
    if (punchSoundRef.current) {
      punchSoundRef.current.play().catch(e => console.log("Punch sound error:", e));
    }
    const targetSetter = targetPlayerNum === 1 ? setPlayer1 : setPlayer2;
    const winnerPlayer = attackerPlayerNum === 1 ? 'Player 1' : 'Player 2';

    targetSetter(prev => {
      const newHealth = Math.max(0, prev.health - damage);
      if (newHealth === 0) {
        if (koSoundRef.current) {
          koSoundRef.current.play().catch(e => console.log("KO sound error:", e));
        }
        setTimeout(() => {
          if (gameOverSoundRef.current) {
            gameOverSoundRef.current.play().catch(e => console.log("Game over sound error:", e));
          }
        }, 1500);
        setGameOver(true);
        setWinner(winnerPlayer);
        return { ...prev, health: 0, action: 'ko', triggerActionAnim: prev.triggerActionAnim + 1 };
      }
      return { ...prev, health: newHealth, hitEffect: prev.hitEffect + 1 };
    });

    const targetPlayer = targetPlayerNum === 1 ? player1 : player2;
    createParticles(targetPlayer.x + characterWidth / 2, window.innerHeight * 0.7);
    setScreenShake(prev => prev + 1);
  }, [player1, player2, createParticles, gameOverSoundRef, koSoundRef, punchSoundRef]);

  // Cooldown management effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayer1(prev => ({
        ...prev,
        cooldowns: {
          dodge: Math.max(0, prev.cooldowns.dodge - 50),
          attack1: Math.max(0, prev.cooldowns.attack1 - 50),
          attack2: Math.max(0, prev.cooldowns.attack2 - 50),
          heal: Math.max(0, prev.cooldowns.heal - 50),
          wrongAnswer: Math.max(0, prev.cooldowns.wrongAnswer - 50),
        }
      }));
      setPlayer2(prev => ({
        ...prev,
        cooldowns: {
          dodge: Math.max(0, prev.cooldowns.dodge - 50),
          attack1: Math.max(0, prev.cooldowns.attack1 - 50),
          attack2: Math.max(0, prev.cooldowns.attack2 - 50),
          heal: Math.max(0, prev.cooldowns.heal - 50),
          wrongAnswer: Math.max(0, prev.cooldowns.wrongAnswer - 50),
        }
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const startTranslationQuiz = useCallback((attackerPlayer: number, targetPlayer: number, damage: number, attackType: 'attack1' | 'attack2') => {
    setGamePaused(true);
    const randomQuestion = translationQuestions[Math.floor(Math.random() * translationQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setPendingAttack({ attackerPlayer, targetPlayer, damage, attackType });
    setQuizActive(true);
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
  }, [translationQuestions]);

  const handleTranslationAnswer = useCallback((selectedOption: number) => {
    if (!currentQuestion || !pendingAttack) return;
    
    if (selectedOption === currentQuestion.correct) {
      // Correct answer - execute attack
      handleHit(pendingAttack.targetPlayer, pendingAttack.damage, pendingAttack.attackerPlayer);
    } else {
      // Wrong answer - apply cooldown penalty
      const attackerSetter = pendingAttack.attackerPlayer === 1 ? setPlayer1 : setPlayer2;
      attackerSetter(prev => ({
        ...prev,
        cooldowns: {
          ...prev.cooldowns,
          wrongAnswer: 1500, // 1.5 second cooldown for wrong answer
        }
      }));
    }
    
    setQuizActive(false);
    setGamePaused(false);
    setCurrentQuestion(null);
    setPendingAttack(null);
    if (audioEnabled && backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(e => console.log("Background music resume error:", e));
    }
  }, [currentQuestion, pendingAttack, handleHit, audioEnabled]);

  const resetAction = useCallback((playerNum: number) => {
    setTimeout(() => {
      const setter = playerNum === 1 ? setPlayer1 : setPlayer2;
      setter(prev => ({ ...prev, action: 'idle' }));
    }, 300);
  }, []);

  const handlePlayer1Action = useCallback((actionType: string) => {
    if (gameOver || gamePaused || player1.action !== 'idle' || (isMultiplayer && !isConnected)) return;
    
    // Check cooldowns and wrong answer penalty
    if (player1.cooldowns.wrongAnswer > 0) return;
    
    if (actionType === 'dodge' && player1.cooldowns.dodge > 0) return;
    if (actionType === 'attack1' && player1.cooldowns.attack1 > 0) return;
    if (actionType === 'attack2' && player1.cooldowns.attack2 > 0) return;
    if (actionType === 'heal' && player1.cooldowns.heal > 0) return;
    
    setPlayer1(prev => ({ ...prev, action: actionType, triggerActionAnim: prev.triggerActionAnim + 1 }));

    // Broadcast action to WebSocket if in multiplayer mode
    if (isMultiplayer && wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'player-action',
        roomId: roomId,
        playerNumber: myPlayerNumber,
        action: actionType,
        timestamp: Date.now(),
        position: { x: player1.x, direction: player1.direction }
      }));
    }

    if (actionType === 'dodge') {
      setPlayer1(prev => ({ 
        ...prev, 
        isDodging: true,
        cooldowns: { ...prev.cooldowns, dodge: 2500 } // 2.5 second cooldown
      }));
      if (woahSoundRef.current) {
        woahSoundRef.current.play().catch(e => console.log("Woah sound error:", e));
      }
      // Dodge lasts 800ms
      setTimeout(() => {
        setPlayer1(prev => ({ ...prev, isDodging: false }));
      }, 800);
    } else if (actionType === 'attack1') {
      const distance = Math.abs((player1.x + characterWidth / 2) - (player2.x + characterWidth / 2));
      const isFacingOpponent = (player1.direction === 'right' && player1.x < player2.x) || (player1.direction === 'left' && player1.x > player2.x);
      console.log(`Player attack1 attempt: distance=${distance}, facing=${isFacingOpponent}, range=${attackRange + characterWidth / 2}`);
      if (distance < attackRange + characterWidth / 2 && isFacingOpponent && !player2.isDodging) {
        if (isMultiplayer) {
          // In multiplayer, we need to handle damage differently
          const damage = difficultySettings.playerAttackDamage;
          setPlayer2(prev => ({ 
            ...prev, 
            health: Math.max(0, prev.health - damage),
            action: 'hit',
            triggerActionAnim: prev.triggerActionAnim + 1
          }));
          
          // Broadcast hit to opponent
          if (wsRef.current && isConnected) {
            wsRef.current.send(JSON.stringify({
              type: 'hit',
              roomId: roomId,
              playerNumber: myPlayerNumber,
              damage: damage,
              targetPlayer: myPlayerNumber === 1 ? 2 : 1,
              timestamp: Date.now()
            }));
          }
        } else {
          startTranslationQuiz(1, 2, difficultySettings.playerAttackDamage, 'attack1'); // Light attack
        }
      }
      setPlayer1(prev => ({ 
        ...prev, 
        cooldowns: { ...prev.cooldowns, attack1: 1000 } // Standard 1 second cooldown for player
      }));
    } else if (actionType === 'attack2') {
      const distance = Math.abs((player1.x + characterWidth / 2) - (player2.x + characterWidth / 2));
      const isFacingOpponent = (player1.direction === 'right' && player1.x < player2.x) || (player1.direction === 'left' && player1.x > player2.x);
      console.log(`Player attack2 attempt: distance=${distance}, facing=${isFacingOpponent}, range=${attackRange + characterWidth / 2}`);
      if (distance < attackRange + characterWidth / 2 && isFacingOpponent && !player2.isDodging) {
        if (isMultiplayer) {
          // In multiplayer, we need to handle damage differently
          const damage = difficultySettings.playerAttackDamage + 10;
          setPlayer2(prev => ({ 
            ...prev, 
            health: Math.max(0, prev.health - damage),
            action: 'hit',
            triggerActionAnim: prev.triggerActionAnim + 1
          }));
          
          // Broadcast hit to opponent
          if (wsRef.current && isConnected) {
            wsRef.current.send(JSON.stringify({
              type: 'hit',
              roomId: roomId,
              playerNumber: myPlayerNumber,
              damage: damage,
              targetPlayer: myPlayerNumber === 1 ? 2 : 1,
              timestamp: Date.now()
            }));
          }
        } else {
          startTranslationQuiz(1, 2, difficultySettings.playerAttackDamage + 10, 'attack2'); // Heavy attack
        }
      }
      setPlayer1(prev => ({ 
        ...prev, 
        cooldowns: { ...prev.cooldowns, attack2: 1800 } // Standard 1.8 second cooldown for player
      }));
    } else if (actionType === 'heal') {
      const healAmount = 20;
      setPlayer1(prev => ({ 
        ...prev, 
        health: Math.min(initialMaxHealth, prev.health + healAmount),
        isHealing: true,
        cooldowns: { ...prev.cooldowns, heal: 5000 } // 5 second cooldown
      }));
      
      // Broadcast heal to WebSocket
      if (isMultiplayer && wsRef.current && isConnected) {
        wsRef.current.send(JSON.stringify({
          type: 'heal',
          roomId: roomId,
          playerNumber: myPlayerNumber,
          healAmount: healAmount,
          newHealth: Math.min(initialMaxHealth, player1.health + healAmount),
          timestamp: Date.now()
        }));
      }
      
      setTimeout(() => {
        setPlayer1(prev => ({ ...prev, isHealing: false }));
      }, 1000);
    }
    resetAction(1);
  }, [player1, player2, gameOver, gamePaused, resetAction, startTranslationQuiz, difficultySettings.playerAttackDamage, woahSoundRef, isMultiplayer, wsRef, isConnected, roomId, myPlayerNumber]);

  const handlePlayer2Action = useCallback((actionType: string) => {
    if (gameOver || gamePaused || (isMultiplayer && (!isConnected || myPlayerNumber !== 2))) return;

    // Handle movement actions separately since they don't require idle state
    if (actionType === 'move-left' || actionType === 'move-right') {
      if (actionType === 'move-left') {
        console.log(`Bot moving left: current x=${player2.x}, speed=${difficultySettings.botMoveSpeed}`);
        setPlayer2(prev => ({ 
          ...prev, 
          x: Math.max(0, prev.x - difficultySettings.botMoveSpeed), 
          action: 'walk', 
          direction: 'left' 
        }));
      } else if (actionType === 'move-right') {
        console.log(`Bot moving right: current x=${player2.x}, speed=${difficultySettings.botMoveSpeed}, window width=${window.innerWidth}`);
        setPlayer2(prev => ({ 
          ...prev, 
          x: Math.min(window.innerWidth - characterWidth, prev.x + difficultySettings.botMoveSpeed), 
          action: 'walk', 
          direction: 'right' 
        }));
      }
      // Reset to idle after movement with shorter delay
      setTimeout(() => {
        setPlayer2(prev => ({ ...prev, action: 'idle' }));
      }, 50);
      return;
    }

    // Handle combat actions that require idle state
    if (player2.action !== 'idle') return;
    
    // Check cooldowns
    if (player2.cooldowns.wrongAnswer > 0) return;
    if (actionType === 'dodge' && player2.cooldowns.dodge > 0) return;
    if (actionType === 'attack1' && player2.cooldowns.attack1 > 0) return;
    if (actionType === 'attack2' && player2.cooldowns.attack2 > 0) return;
    if (actionType === 'heal' && player2.cooldowns.heal > 0) return;
    
    setPlayer2(prev => ({ ...prev, action: actionType, triggerActionAnim: prev.triggerActionAnim + 1 }));

    if (actionType === 'dodge') {
      setPlayer2(prev => ({ 
        ...prev, 
        isDodging: true,
        consecutiveAttacks: 0, // Reset consecutive attacks on dodge
        cooldowns: { ...prev.cooldowns, dodge: 2500 }
      }));
      if (woahSoundRef.current) {
        woahSoundRef.current.play().catch(e => console.log("Woah sound error:", e));
      }
      setTimeout(() => {
        setPlayer2(prev => ({ ...prev, isDodging: false }));
      }, 800);
    } else if (actionType === 'attack1') {
      const distance = Math.abs((player1.x + characterWidth / 2) - (player2.x + characterWidth / 2));
      const isFacingOpponent = (player2.direction === 'left' && player2.x > player1.x) || (player2.direction === 'right' && player2.x < player1.x);
      console.log(`Bot attack1 attempt: distance=${distance}, facing=${isFacingOpponent}, range=${attackRange + characterWidth / 2}`);
      if (distance < attackRange + characterWidth / 2 && isFacingOpponent && !player1.isDodging) {
        // Bot attacks directly without quiz system
        console.log('Bot executing light attack!');
        // Play attack sound
        if (punchSoundRef.current) {
          punchSoundRef.current.play().catch(e => console.log("Bot punch sound error:", e));
        }
        handleHit(1, difficultySettings.botAttackDamage, 2);
      }
      const cooldownTime = getBotAttackCooldown(player2.consecutiveAttacks, 'attack1');
      setPlayer2(prev => ({ 
        ...prev, 
        consecutiveAttacks: prev.consecutiveAttacks + 1,
        cooldowns: { ...prev.cooldowns, attack1: cooldownTime }
      }));
    } else if (actionType === 'attack2') {
      const distance = Math.abs((player1.x + characterWidth / 2) - (player2.x + characterWidth / 2));
      const isFacingOpponent = (player2.direction === 'left' && player2.x > player1.x) || (player2.direction === 'right' && player2.x < player1.x);
      console.log(`Bot attack2 attempt: distance=${distance}, facing=${isFacingOpponent}, range=${attackRange + characterWidth / 2}`);
      if (distance < attackRange + characterWidth / 2 && isFacingOpponent && !player1.isDodging) {
        // Bot heavy attack directly without quiz system
        console.log('Bot executing heavy attack!');
        // Play attack sound
        if (punchSoundRef.current) {
          punchSoundRef.current.play().catch(e => console.log("Bot punch sound error:", e));
        }
        handleHit(1, difficultySettings.botAttackDamage + 10, 2);
      }
      const cooldownTime = getBotAttackCooldown(player2.consecutiveAttacks, 'attack2');
      setPlayer2(prev => ({ 
        ...prev, 
        consecutiveAttacks: prev.consecutiveAttacks + 1,
        cooldowns: { ...prev.cooldowns, attack2: cooldownTime }
      }));
    } else if (actionType === 'heal') {
      setPlayer2(prev => ({ 
        ...prev, 
        health: Math.min(initialMaxHealth, prev.health + 20),
        isHealing: true,
        consecutiveAttacks: 0, // Reset consecutive attacks on heal
        cooldowns: { ...prev.cooldowns, heal: 5000 }
      }));
      setTimeout(() => {
        setPlayer2(prev => ({ ...prev, isHealing: false }));
      }, 1000);
    }
    resetAction(2);
  }, [player1, player2, gameOver, gamePaused, resetAction, handleHit, difficultySettings.botMoveSpeed, difficultySettings.botAttackDamage, characterWidth, woahSoundRef, punchSoundRef, getBotAttackCooldown, isMultiplayer, isConnected, myPlayerNumber]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      // Movement controls: A/← for left, D/→ for right (allow during quiz)
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const newX = Math.max(0, player1.x - moveSpeed);
        setPlayer1(prev => ({ ...prev, x: newX, action: 'walk', direction: 'left' }));
        
        // Broadcast movement to WebSocket if in multiplayer mode
        if (isMultiplayer && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'movement',
            roomId: roomId,
            playerNumber: myPlayerNumber,
            position: { x: newX, direction: 'left' },
            action: 'walk',
            timestamp: Date.now()
          }));
        }
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        e.preventDefault();
        const newX = Math.min(window.innerWidth - characterWidth, player1.x + moveSpeed);
        setPlayer1(prev => ({ ...prev, x: newX, action: 'walk', direction: 'right' }));
        
        // Broadcast movement to WebSocket if in multiplayer mode
        if (isMultiplayer && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'movement',
            roomId: roomId,
            playerNumber: myPlayerNumber,
            position: { x: newX, direction: 'right' },
            action: 'walk',
            timestamp: Date.now()
          }));
        }
      } 
      
      // Combat controls only when not in quiz
      if (!gamePaused) {
        // Combat controls: J for light attack, K for heavy attack, S/↓ for dodge, H for heal
        if (e.key === 'j' || e.key === 'J') {
          e.preventDefault();
          handlePlayer1Action('attack1');
        } else if (e.key === 'k' || e.key === 'K') {
          e.preventDefault();
          handlePlayer1Action('attack2');
        } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
          e.preventDefault();
          handlePlayer1Action('dodge');
        } else if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          handlePlayer1Action('heal');
        }
      }
      
      // Translation quiz controls: 1-4 for answer options
      if (quizActive && currentQuestion && ['1', '2', '3', '4'].includes(e.key)) {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < currentQuestion.options.length) {
          handleTranslationAnswer(optionIndex);
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameOver) return;
      // Reset to idle when movement keys are released
      if ((e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') || 
          (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight')) {
        setPlayer1(prev => ({ ...prev, action: 'idle' }));
        
        // Broadcast idle state to WebSocket if in multiplayer mode
        if (isMultiplayer && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'movement',
            roomId: roomId,
            playerNumber: myPlayerNumber,
            position: { x: player1.x, direction: player1.direction },
            action: 'idle',
            timestamp: Date.now()
          }));
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, gamePaused, quizActive, currentQuestion, handlePlayer1Action, handleTranslationAnswer, player1.x, player1.direction, isMultiplayer, roomId, myPlayerNumber]);

  useEffect(() => {
    setPlayer1(prev => ({ ...prev, direction: prev.x < player2.x ? 'right' : 'left' }));
    setPlayer2(prev => ({ ...prev, direction: prev.x > player1.x ? 'left' : 'right' }));
  }, [player1.x, player2.x]);

  const getBotAction = useCallback((): string | null => {
    const player1Center = player1.x + characterWidth / 2;
    const player2Center = player2.x + characterWidth / 2;
    const distance = Math.abs(player1Center - player2Center);
    const playerInRange = distance < attackRange + characterWidth / 2;
    const random = Math.random();
    const optimalDistance = attackRange + characterWidth / 8; // Closer ideal attack distance for shorter range

    console.log(`Bot AI: Distance=${distance.toFixed(0)}, InRange=${playerInRange}, Random=${random.toFixed(2)}, P1Health=${player1.health}, P2Health=${player2.health}`);

    // Check if bot is in cooldown from wrong answer
    if (player2.cooldowns.wrongAnswer > 0) return null;

    // PRIORITY #1: Emergency heal when health is critically low (below 25%)
    if (player2.health < 25 && player2.cooldowns.heal === 0) {
      return 'heal';
    }

    // PRIORITY #2: Dodge incoming attacks (difficulty-based reaction)
    if (player1.action === 'attack1' || player1.action === 'attack2') {
      let dodgeChance = 0;
      if (botDifficulty === 'easy') dodgeChance = 0.35;
      else if (botDifficulty === 'medium') dodgeChance = 0.65;
      else dodgeChance = 0.9;
      
      if (random < dodgeChance && player2.cooldowns.dodge === 0) return 'dodge';
    }

    // PRIORITY #3: Strategic healing when health is low but not critical
    if (player2.health < 50 && player2.cooldowns.heal === 0) {
      let healChance = 0;
      if (botDifficulty === 'easy') healChance = 0.3; // Conservative healing
      else if (botDifficulty === 'medium') healChance = 0.5; // Moderate healing
      else healChance = 0.7; // Smart healing on hard
      
      // Higher chance to heal if player is far away (safer)
      if (distance > attackRange + 50) healChance += 0.2; // Adjusted for shorter range (was +100)
      
      if (random < healChance) return 'heal';
    }

    // PRIORITY #4: Aggressive attack when in range
    if (playerInRange) {
      let attackChance = 0;
      if (botDifficulty === 'easy') attackChance = 0.5; // Moderate aggression
      else if (botDifficulty === 'medium') attackChance = 0.75; // High aggression
      else attackChance = 0.95; // Very aggressive

      if (random < attackChance) {
        // Smart attack selection based on situation
        if (player2.cooldowns.attack1 === 0 && player2.cooldowns.attack2 === 0) {
          // Use heavy attack when enemy health is low for finishing blow
          if (player1.health < 30 && random < 0.8) {
            return 'attack2'; // Go for the kill
          }
          // Use heavy attack when bot has high health advantage
          if (player2.health > player1.health + 30 && random < 0.6) {
            return 'attack2'; // Capitalize on advantage
          }
          // Otherwise balance between attacks
          return random < 0.65 ? 'attack1' : 'attack2';
        } else if (player2.cooldowns.attack1 === 0) {
          return 'attack1';
        } else if (player2.cooldowns.attack2 === 0) {
          return 'attack2';
        }
      }
    }

    // PRIORITY #5: Intelligent movement based on situation
    if (distance > optimalDistance + 25) { // Reduced threshold for shorter range (was +50)
      // Move closer aggressively when far
      let moveChance = 0;
      if (botDifficulty === 'easy') moveChance = 0.7; // Good movement
      else if (botDifficulty === 'medium') moveChance = 0.85; // Better movement
      else moveChance = 0.95; // Excellent movement
      
      if (random < moveChance) {
        const moveDirection = player2Center < player1Center ? 'move-right' : 'move-left';
        console.log(`Bot MOVING: ${moveDirection} (too far, distance=${distance.toFixed(0)})`);
        return moveDirection;
      }
    } else if (distance < optimalDistance - 15) { // Reduced threshold for shorter range (was -30)
      // Back away if too close and vulnerable
      let backAwayChance = 0;
      if (player2.health < player1.health) backAwayChance = 0.4; // Back away when losing
      else backAwayChance = 0.15; // Occasionally back away when winning
      
      if (random < backAwayChance) {
        const moveDirection = player2Center > player1Center ? 'move-right' : 'move-left';
        console.log(`Bot BACKING AWAY: ${moveDirection} (too close, distance=${distance.toFixed(0)})`);
        return moveDirection;
      }
    }

    // PRIORITY #6: Circle around player for strategic positioning
    if (distance < attackRange + 75 && distance > attackRange - 25) { // Adjusted for shorter range (was +150 and -50)
      let circleChance = 0;
      if (botDifficulty === 'easy') circleChance = 0.2;
      else if (botDifficulty === 'medium') circleChance = 0.35;
      else circleChance = 0.5;
      
      if (random < circleChance) {
        // Circle in direction that gives advantage
        const moveDirection = random < 0.5 ? 'move-left' : 'move-right';
        console.log(`Bot CIRCLING: ${moveDirection} (strategic positioning, distance=${distance.toFixed(0)})`);
        return moveDirection;
      }
    }

    // PRIORITY #7: Random movement to stay unpredictable
    let randomMoveChance = 0;
    if (botDifficulty === 'easy') randomMoveChance = 0.1;
    else if (botDifficulty === 'medium') randomMoveChance = 0.2;
    else randomMoveChance = 0.3;
    
    if (random < randomMoveChance) {
      const moveDirection = random < 0.5 ? 'move-left' : 'move-right';
      console.log(`Bot RANDOM MOVE: ${moveDirection} (unpredictable movement)`);
      return moveDirection;
    }

    return null;
  }, [player1, player2, botDifficulty, characterWidth, attackRange]);

  useEffect(() => {
    if (gameOver || gamePaused) return;
    const botActionInterval = setInterval(() => {
      const action = getBotAction();
      if (action) {
        console.log(`Bot taking action: ${action}, Distance: ${Math.abs((player1.x + characterWidth / 2) - (player2.x + characterWidth / 2)).toFixed(0)}, Player1 at: ${player1.x}, Player2 at: ${player2.x}`);
        handlePlayer2Action(action);
      } else {
        console.log(`Bot no action - Cooldowns: ${JSON.stringify(player2.cooldowns)}`);
      }
    }, difficultySettings.botActionInterval);
    return () => clearInterval(botActionInterval);
  }, [gameOver, gamePaused, getBotAction, handlePlayer2Action, difficultySettings.botActionInterval, player1.x, player2.x, player2.cooldowns, characterWidth]);

  const resetGame = useCallback(() => {
    const { player1X, player2X } = calculateInitialPositions();
    setPlayer1({ 
      x: player1X, 
      health: initialMaxHealth, 
      action: 'idle', 
      direction: 'right', 
      hitEffect: 0, 
      triggerActionAnim: 0,
      cooldowns: {
        dodge: 0,
        attack1: 0,
        attack2: 0,
        heal: 0,
        wrongAnswer: 0,
      },
      isDodging: false,
      isHealing: false,
      consecutiveAttacks: 0, // Keep for interface compatibility but not used for player
    });
    setPlayer2({ 
      x: player2X, 
      health: initialMaxHealth, 
      action: 'idle', 
      direction: 'left', 
      hitEffect: 0, 
      triggerActionAnim: 0,
      cooldowns: {
        dodge: 0,
        attack1: 0,
        attack2: 0,
        heal: 0,
        wrongAnswer: 0,
      },
      isDodging: false,
      isHealing: false,
      consecutiveAttacks: 0, // Reset consecutive attacks
    });
    setGameOver(false);
    setWinner(null);
    setParticles([]);
    setRoundStart(true);
    setTimeout(() => {
      if (fightStartSoundRef.current) {
        fightStartSoundRef.current.play().catch(e => console.log("Fight start sound error:", e));
      }
    }, 1000);
  }, [calculateInitialPositions, fightStartSoundRef]);

  // Luxury helper function for health bar styling
  const getHealthBarClass = useCallback((health: number, maxHealth: number) => {
    const healthPercentage = (health / maxHealth) * 100;
    if (healthPercentage > 60) return 'high-health';
    else if (healthPercentage > 30) return 'medium-health';
    else return 'low-health';
  }, []);

  return (
    <div className={`game-container ${screenShake > 0 ? 'shake' : ''}`}>
      {/* Header - Top Center */}
      <div className="game-header">
        <h1>Real-Time Fighter <span style={{fontWeight:400,opacity:0.8}}>({botDifficulty.charAt(0).toUpperCase() + botDifficulty.slice(1)})</span></h1>
        {/* <div className="difficulty-stats">
          <span className="stat-item">Luxury Gaming Experience</span>
          <span className="stat-divider">•</span>
          <span className="stat-item">Translation Combat</span>
          <span className="stat-divider">•</span>
          <span className="stat-item">{botDifficulty.charAt(0).toUpperCase() + botDifficulty.slice(1)} Mode</span>
        </div> */}
      </div>

      {/* Health Bars - Luxury glassmorphism design */}
      <div className="health-container">
        <div className="player-health left">
          <div className="player-name">Player 1</div>
          <div className="health-bar-container">
            <div className="health-bar">
              <div 
                className={`health-fill ${getHealthBarClass(player1.health, initialMaxHealth)}`}
                style={{ width: `${(player1.health / initialMaxHealth) * 100}%` }}
              ></div>
            </div>
            <div className="health-text">{player1.health}/{initialMaxHealth}</div>
          </div>
          {player1.cooldowns.wrongAnswer > 0 && (
            <div className="wrong-answer-penalty">
              <span className="penalty-text">Wrong Answer Penalty: {(player1.cooldowns.wrongAnswer / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>
        
        <div className="vs-text">VS</div>
        
        <div className="player-health right">
          <div className="player-name">Bot</div>
          <div className="health-bar-container">
            <div className="health-bar">
              <div 
                className={`health-fill ${getHealthBarClass(player2.health, initialMaxHealth)}`}
                style={{ width: `${(player2.health / initialMaxHealth) * 100}%` }}
              ></div>
            </div>
            <div className="health-text">{player2.health}/{initialMaxHealth}</div>
          </div>
          {player2.cooldowns.wrongAnswer > 0 && (
            <div className="bot-penalty">
              <span className="penalty-text">Bot Penalty: {(player2.cooldowns.wrongAnswer / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Luxury Action Cards at Bottom */}
      <div className="center-actions">
        <div className="action-card movement-card">
          <div className="action-key">A / ←</div>
          <div className="action-label">Move Left</div>
        </div>
        <div className="action-card movement-card">
          <div className="action-key">D / →</div>
          <div className="action-label">Move Right</div>
        </div>
        <div className={`action-card light-attack ${player1.cooldowns.attack1 > 0 ? 'on-cooldown' : ''}`}>
          <div className="action-key">J</div>
          <div className="action-label">Light Attack</div>
          {player1.cooldowns.attack1 > 0 && <div className="cooldown-time">{(player1.cooldowns.attack1 / 1000).toFixed(1)}s</div>}
        </div>
        <div className={`action-card heavy-attack ${player1.cooldowns.attack2 > 0 ? 'on-cooldown' : ''}`}>
          <div className="action-key">K</div>
          <div className="action-label">Heavy Attack</div>
          {player1.cooldowns.attack2 > 0 && <div className="cooldown-time">{(player1.cooldowns.attack2 / 1000).toFixed(1)}s</div>}
        </div>
        <div className={`action-card dodge ${player1.cooldowns.dodge > 0 ? 'on-cooldown' : ''}`}>
          <div className="action-key">S / ↓</div>
          <div className="action-label">Dodge</div>
          {player1.cooldowns.dodge > 0 && <div className="cooldown-time">{(player1.cooldowns.dodge / 1000).toFixed(1)}s</div>}
        </div>
        <div className={`action-card heal ${player1.cooldowns.heal > 0 ? 'on-cooldown' : ''}`}>
          <div className="action-key">H</div>
          <div className="action-label">Heal</div>
          {player1.cooldowns.heal > 0 && <div className="cooldown-time">{(player1.cooldowns.heal / 1000).toFixed(1)}s</div>}
        </div>
      </div>

      {/* Quiz Modal - Only show for player attacks */}
      {quizActive && currentQuestion && pendingAttack?.attackerPlayer === 1 && (
        <div className="quiz-modal">
          <div className="quiz-content">
            <h2>Translate to Attack!</h2>
            <p className="quiz-question">
              Translate "{currentQuestion.word}" to {currentQuestion.language}
            </p>
            <div className="quiz-options">
              {currentQuestion.options.map((option, index) => (
                <button 
                  key={index} 
                  onClick={() => handleTranslationAnswer(index)} 
                  className="quiz-option"
                >
                  {index + 1}. {option}
                </button>
              ))}
            </div>
            <p className="quiz-instruction">Press 1-4 or click to answer</p>
          </div>
        </div>
      )}



      {/* Round start and Game over screens with luxury styling */}
      {roundStart && (
        <div className="round-start-screen">
          <div className="round-start-text">FIGHT!</div>
          <div className="round-start-subtitle">Translation Combat Begins</div>
        </div>
      )}

      {gameOver && (
        <div className="game-over-screen">
          <h2>Game Over!</h2>
          <p>{winner} wins the translation battle!</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}

      {/* Add top controls for context */}
      {/* <div className="top-controls">
        Movement: A/D or ←/→ • Combat: J (Light) • K (Heavy) • S (Dodge) • H (Heal) • Quiz: 1-4 to answer translation questions
      </div> */}

      {/* Game Characters */}
      <Character 
        name="Player 1" 
        initialX={player1.x} 
        initialHealth={player1.health}
        images={character1Images} 
        direction={player1.direction} 
        currentAction={player1.action} 
        onHitEffect={player1.hitEffect} 
        triggerActionAnimation={player1.triggerActionAnim} 
        hideHealthBar={true}
        isDodging={player1.isDodging}
        isHealing={player1.isHealing}
      />
      <Character 
        name="Player 2" 
        initialX={player2.x} 
        initialHealth={player2.health}
        images={character2Images} 
        direction={player2.direction} 
        currentAction={player2.action} 
        onHitEffect={player2.hitEffect} 
        triggerActionAnimation={player2.triggerActionAnim} 
        hideHealthBar={true}
        isDodging={player2.isDodging}
        isHealing={player2.isHealing}
      />

      <div className="particles-container">
        {particles.map(p => <div key={p.id} className="particle" style={{ left: `${p.x}px`, top: `${p.y}px`, opacity: p.life / 100 }} />)}
      </div>


    </div>
  );
};

export default FightingGame;