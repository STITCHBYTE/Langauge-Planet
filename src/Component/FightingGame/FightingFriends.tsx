import React, { useState, useEffect, useCallback, useRef } from 'react';
import Character from './Character.tsx';
import './FightingGame.css';

interface PlayerState {
  x: number;
  health: number;
  action: string;
  direction: string;
  hitEffect: number;
  triggerActionAnim: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface PendingAttack {
  attackerPlayer: number;
  targetPlayer: number;
  damage: number;
}

interface ReconnectTimeout extends NodeJS.Timeout {
  retryCount?: number;
}

const FightingFriendsOnline: React.FC = () => {
  // Image mappings for Player 1 (Ryu-like)
  const character1Images = {
    'idle-left': '/images/idel-left.png',
    'idle-right': '/images/idel-left.png',
    'walk-left': '/images/left.png',
    'walk-right': '/images/left.png',
    'attack-left': '/images/attack-left.png',
    'attack-right': '/images/attack-left.png',
    'dodge-left': '/images/doge-left.png',
    'dodge-right': '/images/doge-left.png',
    'ko-left': '/images/KO-left.png',
    'ko-right': '/images/KO-left.png',
  };

  // Image mappings for Player 2 (Cyborg-like)
  const character2Images = {
    'idle-left': '/images/idle-right.png',
    'idle-right': '/images/idle-right.png',
    'walk-left': '/images/walk1-right.png',
    'walk-right': '/images/right.png',
    'attack-left': '/images/attack-right.png',
    'attack-right': '/images/attack-right.png',
    'dodge-left': '/images/dodge-right.png',
    'dodge-right': '/images/dodge-right.png',
    'ko-left': '/images/KO-right.png',
    'ko-right': '/images/KO-right.png',
  };

  const initialMaxHealth = 100;
  const moveSpeed = 20;
  const attackRange = 200;
  const characterWidth = 200;
  const gapBetweenCharacters = 250;
  const attackDamage = 15;

  const calculateInitialPositions = useCallback(() => {
    const screenWidth = window.innerWidth;
    const totalOccupiedWidth = 2 * characterWidth + gapBetweenCharacters;
    const leftEdgeOfBlock = (screenWidth - totalOccupiedWidth) / 2;
    return {
      player1X: leftEdgeOfBlock,
      player2X: leftEdgeOfBlock + characterWidth + gapBetweenCharacters,
    };
  }, [characterWidth, gapBetweenCharacters]);

  const [player1, setPlayer1] = useState<PlayerState>(() => ({ x: 0, health: initialMaxHealth, action: 'idle', direction: 'right', hitEffect: 0, triggerActionAnim: 0 }));
  const [player2, setPlayer2] = useState<PlayerState>(() => ({ x: 0, health: initialMaxHealth, action: 'idle', direction: 'left', hitEffect: 0, triggerActionAnim: 0 }));

  // Game State
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [roundStart, setRoundStart] = useState<boolean>(true);
  const [gamePaused, setGamePaused] = useState<boolean>(false);

  // Network State
  const [roomId, setRoomId] = useState<string | null>(null);
  const [joinRoomId, setJoinRoomId] = useState<string>('');
  const [myPlayerNumber, setMyPlayerNumber] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [messageQueue, setMessageQueue] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReconnectTimeout | null>(null);

  // UI & Effects State
  const [screenShake, setScreenShake] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [particles, setParticles] = useState<any[]>([]);
  const [damageIndicators, setDamageIndicators] = useState<any[]>([]);
  
  // Quiz State
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [pendingAttack, setPendingAttack] = useState<PendingAttack | null>(null);

  const quizQuestions: QuizQuestion[] = [
    { question: "What is 15 + 27?", options: ["42", "41", "43", "44"], correct: 0 },
    { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2 },
    { question: "What is 8 × 7?", options: ["54", "56", "58", "52"], correct: 1 },
  ];

  // Sound Refs
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const punchSoundRef = useRef<HTMLAudioElement | null>(null);
  const woahSoundRef = useRef<HTMLAudioElement | null>(null);
  const fightStartSoundRef = useRef<HTMLAudioElement | null>(null);
  const koSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);

  // --- CORE GAME LOGIC ---

  const resetGame = useCallback(() => {
    const { player1X, player2X } = calculateInitialPositions();
    setPlayer1({ x: player1X, health: initialMaxHealth, action: 'idle', direction: 'right', hitEffect: 0, triggerActionAnim: 0 });
    setPlayer2({ x: player2X, health: initialMaxHealth, action: 'idle', direction: 'left', hitEffect: 0, triggerActionAnim: 0 });
    setGameOver(false);
    setWinner(null);
    setParticles([]);
    setDamageIndicators([]);
    setRoundStart(true);
    const fightStartTimer = setTimeout(() => {
      if (fightStartSoundRef.current) {
        fightStartSoundRef.current.play().catch(e => console.log("Fight start sound error:", e));
      }
    }, 1000);
    return () => clearTimeout(fightStartTimer);
  }, [calculateInitialPositions]);

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
  }, [player1, player2, createParticles]);

  const startQuiz = useCallback((attackerPlayer: number, targetPlayer: number, damage: number) => {
    setGamePaused(true);
    const randomQuestion = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setPendingAttack({ attackerPlayer, targetPlayer, damage });
    setQuizActive(true);
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
  }, [quizQuestions]);

  const handleQuizAnswer = useCallback((selectedOption: number) => {
    if (!currentQuestion || !pendingAttack) return;
    if (selectedOption === currentQuestion.correct) {
      handleHit(pendingAttack.targetPlayer, pendingAttack.damage, pendingAttack.attackerPlayer);
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

  const sendPlayerAction = useCallback((action: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'PLAYER_ACTION', action }));
    }
  }, []);

  const handlePlayerAction = useCallback((playerNum: number, actionType: string) => {
    if (gameOver || gamePaused) return;
    const playerState = playerNum === 1 ? player1 : player2;
    if (playerState.action !== 'idle') return;

    sendPlayerAction(actionType); // Always send action to server

    const setter = playerNum === 1 ? setPlayer1 : setPlayer2;
    setter(prev => ({ ...prev, action: actionType, triggerActionAnim: prev.triggerActionAnim + 1 }));

    if (actionType === 'attack') {
      const opponentState = playerNum === 1 ? player2 : player1;
      const distance = Math.abs((playerState.x + characterWidth / 2) - (opponentState.x + characterWidth / 2));
      const isFacingOpponent = (playerState.direction === 'right' && playerState.x < opponentState.x) || (playerState.direction === 'left' && playerState.x > opponentState.x);
      
      if (distance < attackRange + characterWidth / 2 && isFacingOpponent && opponentState.action !== 'dodge') {
        startQuiz(playerNum, playerNum === 1 ? 2 : 1, attackDamage);
      }
    } else if (actionType === 'dodge') {
      if (woahSoundRef.current) {
        woahSoundRef.current.play().catch(e => console.log("Woah sound error:", e));
      }
    }
    resetAction(playerNum);
  }, [player1, player2, gameOver, gamePaused, resetAction, startQuiz, sendPlayerAction]);

  // --- NETWORK LOGIC ---

  const sendPlayerMove = useCallback((x: number, action: string, direction: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'PLAYER_MOVE', x, action, direction }));
    }
  }, []);

  // const sendPlayerAction = useCallback((action: string) => {
  //   if (wsRef.current?.readyState === WebSocket.OPEN) {
  //     wsRef.current.send(JSON.stringify({ type: 'PLAYER_ACTION', action }));
  //   }
  // }, []);
  
  const sendHealthUpdate = useCallback((playerNum: number, newHealth: number, isKO = false) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'HEALTH_UPDATE', playerNum, health: newHealth, isKO }));
    }
  }, []);

  const connectToWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) return;
    setConnectionStatus('connecting');
    const ws = new WebSocket('ws://localhost:3001'); // Ensure your server address is correct
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('connected');
      if (reconnectTimeoutRef.current) {
        (reconnectTimeoutRef.current as any).retryCount = 0;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (myPlayerNumber === null && data.type !== 'GAME_START' && data.type !== 'ROOM_CREATED') {
          setMessageQueue(prev => [...prev, data]);
          return;
        }
        handleServerMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        if (reconnectTimeoutRef.current) {
          (reconnectTimeoutRef.current as any).retryCount = ((reconnectTimeoutRef.current as any).retryCount || 0) + 1;
          if ((reconnectTimeoutRef.current as any).retryCount <= 5) {
            connectToWebSocket();
          } else {
            setConnectionStatus('error');
          }
        }
      }, 3000) as any;
    };
    ws.onerror = () => setConnectionStatus('error');
  }, [myPlayerNumber]);

  const handleServerMessage = (data: any) => {
    switch (data.type) {
      case 'ROOM_CREATED':
        setRoomId(data.roomId);
        setMyPlayerNumber(data.playerNum);
        resetGame();
        break;
      case 'GAME_START':
        setMyPlayerNumber(data.playerNum);
        setJoinRoomId('');
        resetGame();
        break;
      case 'ERROR':
        alert(`Server Error: ${data.message}`);
        break;
      case 'OPPONENT_ACTION':
        handleOpponentAction(data.action);
        break;
      case 'OPPONENT_MOVE':
        handleOpponentMove(data);
        break;
      case 'OPPONENT_HEALTH_UPDATE':
        handleOpponentHealthUpdate(data);
        break;
      case 'OPPONENT_DISCONNECTED':
        alert('Opponent has disconnected.');
        setRoomId(null);
        setMyPlayerNumber(null);
        resetGame();
        break;
    }
  };

  const handleOpponentAction = (action: string) => {
    const opponentNum = myPlayerNumber === 1 ? 2 : 1;
    const setter = opponentNum === 1 ? setPlayer1 : setPlayer2;
    setter(prev => ({ ...prev, action, triggerActionAnim: prev.triggerActionAnim + 1 }));
    resetAction(opponentNum);
  };

  const handleOpponentMove = ({ x, action, direction }: { x: number; action: string; direction: string }) => {
    const opponentNum = myPlayerNumber === 1 ? 2 : 1;
    const setter = opponentNum === 1 ? setPlayer1 : setPlayer2;
    setter(prev => ({ ...prev, x, action, direction }));
  };

  const handleOpponentHealthUpdate = ({ playerNum, health, isKO }: { playerNum: number; health: number; isKO: boolean }) => {
    const setter = playerNum === 1 ? setPlayer1 : setPlayer2;
    setter(prev => ({ ...prev, health, action: isKO ? 'ko' : prev.action }));
    if (isKO) {
      setGameOver(true);
      setWinner(playerNum === 1 ? 'Player 2' : 'Player 1');
    }
  };

  useEffect(() => {
    connectToWebSocket();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [connectToWebSocket]);

  useEffect(() => {
    if (myPlayerNumber !== null && messageQueue.length > 0) {
      messageQueue.forEach(handleServerMessage);
      setMessageQueue([]);
    }
  }, [myPlayerNumber, messageQueue]);

  // --- INPUT HANDLING ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || gamePaused || quizActive || myPlayerNumber === null) return;
      
      // Both players use the same controls as shown in the UI
      // Movement: A/← for left, D/→ for right
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        const setter = myPlayerNumber === 1 ? setPlayer1 : setPlayer2;
        setter(prev => {
          const newX = Math.max(0, prev.x - moveSpeed);
          sendPlayerMove(newX, 'walk', 'left');
          return { ...prev, x: newX, action: 'walk', direction: 'left' };
        });
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        const setter = myPlayerNumber === 1 ? setPlayer1 : setPlayer2;
        setter(prev => {
          const newX = Math.min(window.innerWidth - characterWidth, prev.x + moveSpeed);
          sendPlayerMove(newX, 'walk', 'right');
          return { ...prev, x: newX, action: 'walk', direction: 'right' };
        });
      } 
      // Combat: SPACE for attack, S/↓ for dodge
      else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // Prevent page scroll
        handlePlayerAction(myPlayerNumber, 'attack');
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        handlePlayerAction(myPlayerNumber, 'dodge');
      }
      // Quiz: 1-4 for answer options
      else if (quizActive && currentQuestion && ['1', '2', '3', '4'].includes(e.key)) {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < currentQuestion.options.length) {
          handleQuizAnswer(optionIndex);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (myPlayerNumber === null) return;
      // Reset to idle when movement keys are released (both players use same controls now)
      if ((e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') ||
          (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight')) {
        const setter = myPlayerNumber === 1 ? setPlayer1 : setPlayer2;
        setter(prev => ({ ...prev, action: 'idle' }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, gamePaused, quizActive, currentQuestion, myPlayerNumber, handlePlayerAction, sendPlayerMove, handleQuizAnswer]);

  // --- EFFECTS & MISC HOOKS ---

  useEffect(() => {
    // Initialize sounds and music
    backgroundMusicRef.current = new Audio('/sounds/background.mp3');
    punchSoundRef.current = new Audio('/sounds/punch.mp3');
    woahSoundRef.current = new Audio('/sounds/swoosh.mp3');
    fightStartSoundRef.current = new Audio('/sounds/fight-start.mp3');
    koSoundRef.current = new Audio('/sounds/KO.mp3');
    gameOverSoundRef.current = new Audio('/sounds/game-over.mp3');
    
    const handleFirstInteraction = () => {
      setAudioEnabled(true);
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.loop = true;
        backgroundMusicRef.current.volume = 0.2;
        backgroundMusicRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setRoundStart(false), 3000);
    return () => clearTimeout(timer);
  }, [roundStart]);

  useEffect(() => {
    if (particles.length > 0) {
      const interval = setInterval(() => {
        setParticles(prev => prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.5, life: p.life - 2 })).filter(p => p.life > 0));
      }, 16);
      return () => clearInterval(interval);
    }
  }, [particles.length]);

  const createRoom = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'CREATE_ROOM' }));
    }
  };

  const joinRoom = () => { 
    if (joinRoomId.trim() && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'JOIN_ROOM', roomId: joinRoomId.trim() }));
    }
  };

  // --- RENDER ---

  return (
    <div className={`game-container ${screenShake > 0 ? 'shake' : ''}`}>
      <h1>Player vs Player (Online)</h1>
      
      <div className="game-mode-controls">
        <div className={`bot-connection-status ${connectionStatus}`}>
          <span className="status-indicator"></span>
          Server: {connectionStatus}
        </div>
        {connectionStatus === 'connected' && !roomId && (
          <>
            <button onClick={createRoom}>Create Room</button>
            <div className="join-room-container">
              <input type="text" placeholder="Enter Room ID" value={joinRoomId} onChange={(e) => setJoinRoomId(e.target.value)} />
              <button onClick={joinRoom}>Join</button>
            </div>
          </>
        )}
        {roomId && <div className="room-info">Room ID: <span className="room-id-text">{roomId}</span></div>}
      </div>

      {quizActive && currentQuestion && (
        <div className="quiz-modal">
          <div className="quiz-content">
            <h2>Answer to Attack!</h2>
            <p className="quiz-question">{currentQuestion.question}</p>
            <div className="quiz-options">
              {currentQuestion.options.map((option, index) => (
                <button key={index} onClick={() => handleQuizAnswer(index)} className="quiz-option">{option}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {roundStart && <div className="round-start-screen"><div className="round-start-text">FIGHT!</div></div>}

      <div className="health-container">
        <div className="player-health">
          <div className="player-name">{myPlayerNumber === 1 ? 'You (P1)' : 'Opponent (P1)'}</div>
          <div className="health-bar-container"><div className="health-bar"><div className="health-fill" style={{ width: `${(player1.health / initialMaxHealth) * 100}%` }}></div></div><div className="health-text">{player1.health}/{initialMaxHealth}</div></div>
        </div>
        <div className="vs-text">VS</div>
        <div className="player-health">
          <div className="player-name">{myPlayerNumber === 2 ? 'You (P2)' : 'Opponent (P2)'}</div>
          <div className="health-bar-container"><div className="health-bar"><div className="health-fill" style={{ width: `${(player2.health / initialMaxHealth) * 100}%` }}></div></div><div className="health-text">{player2.health}/{initialMaxHealth}</div></div>
        </div>
      </div>

      {gameOver && (
        <div className="game-over-screen">
          <h2>Game Over!</h2>
          <p>{winner} wins!</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}

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
      />

      <div className="particles-container">
        {particles.map(p => <div key={p.id} className="particle" style={{ left: `${p.x}px`, top: `${p.y}px`, opacity: p.life / 100 }} />)}
      </div>
    </div>
  );
};

export default FightingFriendsOnline;
