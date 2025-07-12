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
}

const FightingGame: React.FC<FightingGameProps> = ({ initialDifficulty = 'medium' }) => {
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
  
  // Difficulty-based settings
  const getDifficultySettings = useCallback(() => {
    switch (initialDifficulty) {
      case 'easy':
        return {
          botMoveSpeed: 12, // Slower movement
          botActionInterval: 150, // Slower reactions
          botAttackDamage: 8, // Less damage
          playerAttackDamage: 20, // Player does more damage
        };
      case 'medium':
        return {
          botMoveSpeed: 18, // Moderate movement
          botActionInterval: 100, // Moderate reactions
          botAttackDamage: 15, // Standard damage
          playerAttackDamage: 15, // Equal damage
        };
      case 'hard':
        return {
          botMoveSpeed: 25, // Faster movement
          botActionInterval: 60, // Very fast reactions
          botAttackDamage: 22, // More damage
          playerAttackDamage: 12, // Player does less damage
        };
      default:
        return {
          botMoveSpeed: 18,
          botActionInterval: 100,
          botAttackDamage: 15,
          playerAttackDamage: 15,
        };
    }
  }, [initialDifficulty]);

  const difficultySettings = getDifficultySettings();

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
    };
  });

  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [screenShake, setScreenShake] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [damageIndicators, setDamageIndicators] = useState<any[]>([]);
  const [roundStart, setRoundStart] = useState<boolean>(true);
  const [botDifficulty, setBotDifficulty] = useState<string>(initialDifficulty);

  // Quiz system states
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [gamePaused, setGamePaused] = useState<boolean>(false);
  const [pendingAttack, setPendingAttack] = useState<PendingAttack | null>(null);

  const quizQuestions: QuizQuestion[] = [
    {
      question: "What is 15 + 27?",
      options: ["42", "41", "43", "44"],
      correct: 0
    },
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correct: 2
    },
    {
      question: "What is 8 × 7?",
      options: ["54", "56", "58", "52"],
      correct: 1
    },
  ];

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

  useEffect(() => {
    const timer = setTimeout(() => setRoundStart(false), 3000);
    const fightStartTimer = setTimeout(() => {
      if (fightStartSoundRef.current) {
        fightStartSoundRef.current.play().catch(e => console.log("Fight start sound error:", e));
      }
    }, 1000);
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

  const handlePlayer1Action = useCallback((actionType: string) => {
    if (gameOver || gamePaused || player1.action !== 'idle') return;
    setPlayer1(prev => ({ ...prev, action: actionType, triggerActionAnim: prev.triggerActionAnim + 1 }));

    if (actionType === 'attack') {
      const distance = Math.abs((player1.x + characterWidth / 2) - (player2.x + characterWidth / 2));
      const isFacingOpponent = (player1.direction === 'right' && player1.x < player2.x) || (player1.direction === 'left' && player1.x > player2.x);
      if (distance < attackRange + characterWidth / 2 && isFacingOpponent && player2.action !== 'dodge') {
        startQuiz(1, 2, difficultySettings.playerAttackDamage);
      }
    } else if (actionType === 'dodge') {
      if (woahSoundRef.current) {
        woahSoundRef.current.play().catch(e => console.log("Woah sound error:", e));
      }
    }
    resetAction(1);
  }, [player1, player2, gameOver, gamePaused, resetAction, startQuiz, difficultySettings.playerAttackDamage]);

  const handlePlayer2Action = useCallback((actionType: string) => {
    if (gameOver || gamePaused) return;

    // Handle movement actions separately since they don't require idle state
    if (actionType === 'move-left' || actionType === 'move-right') {
      if (actionType === 'move-left') {
        setPlayer2(prev => ({ 
          ...prev, 
          x: Math.max(0, prev.x - difficultySettings.botMoveSpeed), 
          action: 'walk', 
          direction: 'left' 
        }));
      } else if (actionType === 'move-right') {
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
    setPlayer2(prev => ({ ...prev, action: actionType, triggerActionAnim: prev.triggerActionAnim + 1 }));

    if (actionType === 'attack') {
      const distance = Math.abs((player1.x + characterWidth / 2) - (player2.x + characterWidth / 2));
      const isFacingOpponent = (player2.direction === 'left' && player2.x > player1.x) || (player2.direction === 'right' && player2.x < player1.x);
      if (distance < attackRange + characterWidth / 2 && isFacingOpponent && player1.action !== 'dodge') {
        handleHit(1, difficultySettings.botAttackDamage, 2); // Bot attack uses difficulty-based damage
      }
    } else if (actionType === 'dodge') {
      if (woahSoundRef.current) {
        woahSoundRef.current.play().catch(e => console.log("Woah sound error:", e));
      }
    }
    resetAction(2);
  }, [player1, player2, gameOver, gamePaused, resetAction, handleHit, difficultySettings.botMoveSpeed, difficultySettings.botAttackDamage, characterWidth]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || gamePaused) return;
      
      // Movement controls: A/← for left, D/→ for right
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        setPlayer1(prev => ({ ...prev, x: Math.max(0, prev.x - moveSpeed), action: 'walk', direction: 'left' }));
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        setPlayer1(prev => ({ ...prev, x: Math.min(window.innerWidth - characterWidth, prev.x + moveSpeed), action: 'walk', direction: 'right' }));
      } 
      // Combat controls: SPACE for attack, S/↓ for dodge
      else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // Prevent page scroll
        handlePlayer1Action('attack');
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        handlePlayer1Action('dodge');
      }
      // Quiz controls: 1-4 for answer options
      else if (quizActive && currentQuestion && ['1', '2', '3', '4'].includes(e.key)) {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < currentQuestion.options.length) {
          handleQuizAnswer(optionIndex);
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameOver || gamePaused) return;
      // Reset to idle when movement keys are released
      if ((e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') || 
          (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight')) {
        setPlayer1(prev => ({ ...prev, action: 'idle' }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, gamePaused, quizActive, currentQuestion, handlePlayer1Action, handleQuizAnswer]);

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
    const optimalDistance = attackRange + characterWidth / 4; // Ideal attack distance

    // Debug logging (uncomment to see bot decisions)
    // console.log(`Bot AI: distance=${distance.toFixed(0)}, inRange=${playerInRange}, optimal=${optimalDistance.toFixed(0)}, difficulty=${botDifficulty}`);

    // Dodge incoming attacks (difficulty-based reaction)
    if (player1.action === 'attack') {
      let dodgeChance = 0;
      if (botDifficulty === 'easy') dodgeChance = 0.15; // Lower dodge chance
      else if (botDifficulty === 'medium') dodgeChance = 0.45; // Moderate dodge chance
      else dodgeChance = 0.75; // High dodge chance
      
      if (random < dodgeChance) return 'dodge';
    }

    // Movement logic - bot tries to maintain optimal distance
    // Easy bots move less strategically
    const movementRandomness = botDifficulty === 'easy' ? 0.7 : (botDifficulty === 'medium' ? 0.85 : 0.95);
    
    if (distance > optimalDistance + 50) {
      // Too far - move closer (with some randomness for easy bots)
      if (random < movementRandomness) {
        const action = player2Center < player1Center ? 'move-right' : 'move-left';
        return action;
      }
    } else if (distance < optimalDistance - 30 && !playerInRange) {
      // Too close but not in attack range - back away occasionally
      const backAwayChance = botDifficulty === 'easy' ? 0.2 : (botDifficulty === 'medium' ? 0.3 : 0.4);
      if (random < backAwayChance) {
        const action = player2Center > player1Center ? 'move-right' : 'move-left';
        return action;
      }
    }

    // Attack logic when in optimal range (difficulty-based aggression)
    if (playerInRange) {
      let attackChance = 0;
      if (botDifficulty === 'easy') attackChance = 0.25; // Less aggressive
      else if (botDifficulty === 'medium') attackChance = 0.45; // Moderate aggression
      else attackChance = 0.65; // More aggressive

      if (random < attackChance) {
        return 'attack';
      }
    }

    return null;
  }, [player1, player2, botDifficulty, characterWidth, attackRange]);

  useEffect(() => {
    if (gameOver || gamePaused) return;
    const botActionInterval = setInterval(() => {
      const action = getBotAction();
      if (action) handlePlayer2Action(action);
    }, difficultySettings.botActionInterval); // Use difficulty-based interval
    return () => clearInterval(botActionInterval);
  }, [gameOver, gamePaused, getBotAction, handlePlayer2Action, difficultySettings.botActionInterval]);

  const resetGame = useCallback(() => {
    const { player1X, player2X } = calculateInitialPositions();
    setPlayer1({ x: player1X, health: initialMaxHealth, action: 'idle', direction: 'right', hitEffect: 0, triggerActionAnim: 0 });
    setPlayer2({ x: player2X, health: initialMaxHealth, action: 'idle', direction: 'left', hitEffect: 0, triggerActionAnim: 0 });
    setGameOver(false);
    setWinner(null);
    setParticles([]);
    setDamageIndicators([]);
    setRoundStart(true);
    setTimeout(() => {
      if (fightStartSoundRef.current) {
        fightStartSoundRef.current.play().catch(e => console.log("Fight start sound error:", e));
      }
    }, 1000);
  }, [calculateInitialPositions]);



  return (
    <div className={`game-container ${screenShake > 0 ? 'shake' : ''}`}>
      <div className="game-header">
        <h1>Player vs. Bot ({botDifficulty.charAt(0).toUpperCase() + botDifficulty.slice(1)})</h1>
        <div className="difficulty-stats">
          <span className="stat-item">Your Damage: {difficultySettings.playerAttackDamage}</span>
          <span className="stat-divider">•</span>
          <span className="stat-item">Bot Damage: {difficultySettings.botAttackDamage}</span>
          <span className="stat-divider">•</span>
          <span className="stat-item">Bot Speed: {difficultySettings.botMoveSpeed}</span>
        </div>
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
          <div className="player-name">Player 1</div>
          <div className="health-bar-container">
            <div className="health-bar"><div className="health-fill" style={{ width: `${(player1.health / initialMaxHealth) * 100}%` }}></div></div>
            <div className="health-text">{player1.health}/{initialMaxHealth}</div>
          </div>
        </div>
        <div className="vs-text">VS</div>
        <div className="player-health">
          <div className="player-name">Bot</div>
          <div className="health-bar-container">
            <div className="health-bar"><div className="health-fill" style={{ width: `${(player2.health / initialMaxHealth) * 100}%` }}></div></div>
            <div className="health-text">{player2.health}/{initialMaxHealth}</div>
          </div>
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

export default FightingGame;