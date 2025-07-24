import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Character as CharacterType } from './CharacterSelect';
import './FightingGame.css';
import Character from './Character.tsx';

interface PlayerState {
  x: number;
  action: string;
  direction: string;
  hitEffect: number;
  triggerActionAnim: number;
  cooldowns: PlayerCooldown;
  isDodging: boolean;
  isHealing: boolean;
  consecutiveAttacks: number;
  health: number; 
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

interface FightingGameProps {
  initialDifficulty?: 'easy' | 'medium' | 'hard';
  selectedCharacter: CharacterType | null;
}

const FightingGame: React.FC<FightingGameProps> = ({
  initialDifficulty = 'medium',
  selectedCharacter
}) => {
  const [botCharacter, setBotCharacter] = useState<CharacterType | null>(null);

  useEffect(() => {
    const loadBotCharacter = async () => {
        try {
            const response = await fetch('/assets/data/characters.json');
            const data = await response.json();
            const bot = data.find((char: CharacterType) => char.key === 'medieval_warrior3');
            setBotCharacter(bot || data[0]);
        } catch (error) {
            console.error('Error loading bot character:', error);
        }
    };
    loadBotCharacter();
  }, []);

  const getCharacterSprites = useCallback((character: CharacterType | null) => {
    if (!character) return {};
    const basePath = `/assets/sprites/${character.key}`;
    return {
      'idle-left': `${basePath}/idle.png`, 'idle-right': `${basePath}/idle.png`,
      'walk-left': `${basePath}/run.png`, 'walk-right': `${basePath}/run.png`,
      'attack1-left': `${basePath}/attack1.png`, 'attack1-right': `${basePath}/attack1.png`,
      'attack2-left': `${basePath}/attack2.png`, 'attack2-right': `${basePath}/attack2.png`,
      'dodge-left': `${basePath}/jump.png`, 'dodge-right': `${basePath}/jump.png`,
      'ko-left': `${basePath}/death.png`, 'ko-right': `${basePath}/death.png`,
      'hit-left': `${basePath}/take_hit.png`, 'hit-right': `${basePath}/take_hit.png`,
    };
  }, []);

  const character1Images = getCharacterSprites(selectedCharacter);
  const character2Images = getCharacterSprites(botCharacter);

  const initialMaxHealth = 100;
  const moveSpeed = 20;
  const attackRange = 70;
  const characterWidth = 200;
  const gapBetweenCharacters = 250;

  const difficultySettings = useMemo(() => {
    switch (initialDifficulty) {
      case 'easy': return { botMoveSpeed: 38, botActionInterval: 50, botAttackDamage: 8, playerAttackDamage: 15 };
      case 'medium': return { botMoveSpeed: 45, botActionInterval: 45, botAttackDamage: 15, playerAttackDamage: 20 };
      case 'hard': return { botMoveSpeed: 50, botActionInterval: 45, botAttackDamage: 15, playerAttackDamage: 12 };
      default: return { botMoveSpeed: 30, botActionInterval: 70, botAttackDamage: 15, playerAttackDamage: 15 };
    }
  }, [initialDifficulty]);

  const translationQuestions = useMemo(() => [
    { word: "Hello", language: "Spanish", options: ["Hola", "Adiós", "Gracias", "Por favor"], correct: 0 },
    { word: "Water", language: "French", options: ["Feu", "Terre", "Eau", "Air"], correct: 2 },
    { word: "Book", language: "German", options: ["Stuhl", "Tisch", "Buch", "Fenster"], correct: 2 },
  ], []);

  const calculateInitialPositions = useCallback(() => {
    const screenWidth = window.innerWidth;
    const offsetFromEdge = 50; 

    return {
      player1X: offsetFromEdge, 
      player2X: screenWidth - characterWidth - offsetFromEdge, 
    };
  }, [characterWidth]); 


  const [player1, setPlayer1] = useState<PlayerState>(() => ({
    x: calculateInitialPositions().player1X, health: initialMaxHealth, action: 'idle', direction: 'right', hitEffect: 0, triggerActionAnim: 0,
    cooldowns: { dodge: 0, attack1: 0, attack2: 0, heal: 0, wrongAnswer: 0 },
    isDodging: false, isHealing: false, consecutiveAttacks: 0,
  }));

  const [player2, setPlayer2] = useState<PlayerState>(() => ({
    x: calculateInitialPositions().player2X, health: initialMaxHealth, action: 'idle', direction: 'left', hitEffect: 0, triggerActionAnim: 0,
    cooldowns: { dodge: 0, attack1: 0, attack2: 0, heal: 0, wrongAnswer: 0 },
    isDodging: false, isHealing: false, consecutiveAttacks: 0,
  }));

  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [roundStart, setRoundStart] = useState<boolean>(true);
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<TranslationQuestion | null>(null);
  const [gamePaused, setGamePaused] = useState<boolean>(false);
  const [pendingAttack, setPendingAttack] = useState<PendingAttack | null>(null);

  useEffect(() => {
      const timer = setTimeout(() => setRoundStart(false), 2000);
      const fightStartSound = new Audio('/sounds/fight-start.mp3');
      fightStartSound.play().catch(e => console.log(e));
      return () => clearTimeout(timer);
  }, []);

  
  useEffect(() => {
    const interval = setInterval(() => {
      const reduceCooldowns = (setter: React.Dispatch<React.SetStateAction<PlayerState>>) => {
        setter(prev => ({ ...prev, cooldowns: {
            dodge: Math.max(0, prev.cooldowns.dodge - 50),
            attack1: Math.max(0, prev.cooldowns.attack1 - 50),
            attack2: Math.max(0, prev.cooldowns.attack2 - 50),
            heal: Math.max(0, prev.cooldowns.heal - 50),
            wrongAnswer: Math.max(0, prev.cooldowns.wrongAnswer - 50),
        }}));
      };
      reduceCooldowns(setPlayer1);
      reduceCooldowns(setPlayer2);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleHit = useCallback((targetPlayerNum: number, damage: number, attackerPlayerNum: number) => {
    const punchSound = new Audio('/sounds/punch.mp3'); 
    punchSound.play().catch(e => console.log(e));

    const targetSetter = targetPlayerNum === 1 ? setPlayer1 : setPlayer2;
    const currentTarget = targetPlayerNum === 1 ? player1 : player2;
    const winnerName = attackerPlayerNum === 1 ? selectedCharacter?.name : botCharacter?.name;

    const newHealth = Math.max(0, currentTarget.health - damage);

    if (newHealth === 0) {
      setGameOver(true);
      setWinner(`${winnerName} wins!`);
      targetSetter(prev => ({ ...prev, health: 0, action: 'ko' }));
    } else {
      targetSetter(prev => ({ ...prev, health: newHealth, action: 'hit' }));
      setTimeout(() => {
        targetSetter(prev => ({ ...prev, action: 'idle' }));
      }, 400);
    }
  }, [player1, player2, selectedCharacter, botCharacter]);


  const resetGame = useCallback(() => {
    const { player1X, player2X } = calculateInitialPositions();
    setPlayer1(prev => ({...prev, x: player1X, health: initialMaxHealth, action: 'idle', direction: 'right', cooldowns: { dodge: 0, attack1: 0, attack2: 0, heal: 0, wrongAnswer: 0 }}));
    setPlayer2(prev => ({...prev, x: player2X, health: initialMaxHealth, action: 'idle', direction: 'left', cooldowns: { dodge: 0, attack1: 0, attack2: 0, heal: 0, wrongAnswer: 0 }}));
    setGameOver(false);
    setWinner(null);
    setRoundStart(true);

    
    console.log('[resetGame] Character 1 images:', character1Images);
    console.log('[resetGame] Character 2 images:', character2Images);
  }, [calculateInitialPositions, initialMaxHealth, character1Images, character2Images]);

  
  useEffect(() => {
    console.log('[render] Character 1 images:', character1Images);
    console.log('[render] Character 2 images:', character2Images);
  }, [character1Images, character2Images]);

  const handleMovement = useCallback((playerNum: number, direction: 'left' | 'right') => {
    const setter = playerNum === 1 ? setPlayer1 : setPlayer2;
    const currentPlayer = playerNum === 1 ? player1 : player2;
    
    if (['attack1', 'attack2', 'hit', 'ko', 'jump'].includes(currentPlayer.action)) return;
    const moveDistance = playerNum === 1 ? moveSpeed : difficultySettings.botMoveSpeed;
    setter(prev => {
      const newX = direction === 'left' ? Math.max(0, prev.x - moveDistance) : Math.min(window.innerWidth - characterWidth, prev.x + moveDistance);
      return { ...prev, x: newX, action: 'walk', direction };
    });
  }, [player1, player2, difficultySettings.botMoveSpeed]);

  
  const getAnimationDuration = useCallback((playerNum: number, actionType: string) => {
    const char = playerNum === 1 ? selectedCharacter : botCharacter;
    
    const mappedAction = { 'dodge': 'jump', 'heal': 'jump' }[actionType] || actionType;
    
    const frameCount = char?.frameCounts?.[mappedAction] || char?.frameCounts?.[actionType] || char?.frameCounts?.['idle'] || 6;
    return frameCount * 100; 
  }, [selectedCharacter, botCharacter]);


  
  const executeAttack = useCallback((attackerNum: number, attackType: 'attack1' | 'attack2') => {
    const attacker = attackerNum === 1 ? player1 : player2;
    const target = attackerNum === 1 ? player2 : player1;
    const attackerSetter = attackerNum === 1 ? setPlayer1 : setPlayer2;

    
    const distance = Math.abs((attacker.x + characterWidth / 2) - (target.x + characterWidth / 2));
    const isInRange = distance <= attackRange + characterWidth / 2;
    const isFacingTarget = (attacker.direction === 'right' && attacker.x < target.x) || (attacker.direction === 'left' && attacker.x > target.x);

    
    
    
    
    
    
    if (attackerNum === 1 && ( (attackType === 'attack1' && attacker.cooldowns.attack1 > 0) || (attackType === 'attack2' && attacker.cooldowns.attack2 > 0) ) ) {
        console.log(`Attack blocked for player ${attackerNum} due to cooldown.`);
        return; 
    }


    attackerSetter(prev => ({ ...prev, action: attackType, triggerActionAnim: prev.triggerActionAnim + 1 })); 

    
    
    
    if (isInRange && isFacingTarget && !target.isDodging) {
      const damage = attackerNum === 1 ? difficultySettings.playerAttackDamage : difficultySettings.botAttackDamage;
      const finalDamage = attackType === 'attack1' ? damage : damage + 10;
      handleHit(attackerNum === 1 ? 2 : 1, finalDamage, attackerNum); 
    } else {
        
        
        console.log(`Attack animation for player ${attackerNum} but no hit registered (out of range/facing wrong way/target dodged).`);
    }

    
    const cooldownTime = attackType === 'attack1' ? 500 : 900;
    attackerSetter(prev => ({ ...prev, cooldowns: { ...prev.cooldowns, [attackType]: cooldownTime } }));

    
    const animDuration = getAnimationDuration(attackerNum, attackType);
    setTimeout(() => attackerSetter(prev => ({ ...prev, action: 'idle' })), animDuration); 
  }, [player1, player2, difficultySettings, handleHit, attackRange, characterWidth, getAnimationDuration]);

  const executeDodge = useCallback((playerNum: number) => {
    console.log('[executeDodge] Called for player:', playerNum);
    const setter = playerNum === 1 ? setPlayer1 : setPlayer2;
    const currentPlayer = playerNum === 1 ? player1 : player2;

    
    if (currentPlayer.cooldowns.dodge > 0 || currentPlayer.isDodging) {
      console.log('[executeDodge] Dodge blocked due to cooldown or already dodging.');
      return;
    }

    console.log('[executeDodge] Dodge allowed, updating state...');
    setter(prev => ({
      ...prev,
      action: 'dodge', 
      isDodging: true,
      triggerActionAnim: prev.triggerActionAnim + 1, 
      cooldowns: { ...prev.cooldowns, dodge: 1250 } 
    }));

    const woahSound = new Audio('/sounds/swoosh.mp3'); 
    woahSound.play()
      .then(() => console.log('[executeDodge] Dodge sound played.'))
      .catch(e => console.log("[executeDodge] Dodge sound error:", e));

    
    const animDuration = getAnimationDuration(playerNum, 'dodge');
    setTimeout(() => {
      console.log('[executeDodge] Dodge duration ended, resetting state.');
      setter(prev => ({ ...prev, isDodging: false, action: 'idle' }));
    }, animDuration); 
  }, [player1, player2, getAnimationDuration]);

  const executeHeal = useCallback((playerNum: number) => {
    const setter = playerNum === 1 ? setPlayer1 : setPlayer2;
    const currentPlayer = playerNum === 1 ? player1 : player2;

    
    if (currentPlayer.cooldowns.heal > 0 || currentPlayer.health >= initialMaxHealth || currentPlayer.isHealing) {
        console.log('[executeHeal] Cannot heal: Cooldown, Health full, or already healing.');
        return;
    }

    setter(prev => ({
      ...prev,
      action: 'heal', 
      health: Math.min(initialMaxHealth, prev.health + 20), 
      isHealing: true,
      triggerActionAnim: prev.triggerActionAnim + 1, 
      cooldowns: { ...prev.cooldowns, heal: 5000 } 
    }));

    
    const animDuration = getAnimationDuration(playerNum, 'heal');
    setTimeout(() => {
        setter(prev => ({ ...prev, isHealing: false, action: 'idle' }));
    }, animDuration); 
  }, [player1, player2, initialMaxHealth, getAnimationDuration]);


  const startTranslationQuiz = useCallback((attackerNum: number, targetNum: number, damage: number, attackType: 'attack1' | 'attack2') => {
    
    if (gamePaused) {
        console.log("Quiz already active or game paused. Not starting new quiz.");
        return;
    }
    setGamePaused(true);
    setQuizActive(true);
    setCurrentQuestion(translationQuestions[Math.floor(Math.random() * translationQuestions.length)]);
    setPendingAttack({ attackerPlayer: attackerNum, targetPlayer: targetNum, damage, attackType });
  }, [translationQuestions, gamePaused]);


  const handleTranslationAnswer = useCallback((selectedOption: number) => {
    if (!currentQuestion || !pendingAttack) return; 

    if (selectedOption === currentQuestion.correct) {
      
      
      executeAttack(pendingAttack.attackerPlayer, pendingAttack.attackType); 
    } else {
      setPlayer1(prev => ({...prev, cooldowns: {...prev.cooldowns, wrongAnswer: 1500}})); 
    }
    setGamePaused(false);
    setQuizActive(false);
    setCurrentQuestion(null); 
    setPendingAttack(null); 
  }, [pendingAttack, currentQuestion, executeAttack]);


  const getBotAction = useCallback((): string | null => {
    const player1Center = player1.x + characterWidth / 2;
    const player2Center = player2.x + characterWidth / 2;
    const distance = Math.abs(player1Center - player2Center);
    const inAttackRange = distance <= attackRange + characterWidth / 2;
    const random = Math.random();

    
    if ((player1.action === 'attack1' || player1.action === 'attack2') && inAttackRange) {
      const dodgeChance = initialDifficulty === 'easy' ? 0.3 : initialDifficulty === 'medium' ? 0.6 : 0.8;
      if (random < dodgeChance && player2.cooldowns.dodge === 0) return 'dodge';
    }
    if (inAttackRange && player2.cooldowns.wrongAnswer === 0) {
      const isFacing = (player2.direction === 'left' && player2.x > player1.x) || (player2.direction === 'right' && player2.x < player1.x);
      if (isFacing) {
        if (player2.cooldowns.attack2 === 0 && player1.health < 30 && random < 0.7) return 'attack2';
        if (player2.cooldowns.attack1 === 0 && random < 0.6) return 'attack1';
        if (player2.cooldowns.attack2 === 0 && random < 0.4) return 'attack2';
      }
    }
    if (player2.health < 40 && player2.cooldowns.heal === 0 && random < 0.6) return 'heal';
    const optimalDistance = attackRange + 20;
    if (distance > optimalDistance + 50) return player2Center < player1Center ? 'move-right' : 'move-left';
    if (distance < optimalDistance - 20 && player2.health < player1.health) return player2Center > player1Center ? 'move-right' : 'move-left';
    return null;
  }, [player1, player2, initialDifficulty, attackRange, characterWidth]);

  useEffect(() => {
    if (gameOver || gamePaused) return;
    const botInterval = setInterval(() => {
      const action = getBotAction();
      if (action) {
        if (action.startsWith('move-')) handleMovement(2, action.split('-')[1] as 'left' | 'right');
        else if (action === 'attack1' || action === 'attack2') executeAttack(2, action);
        else if (action === 'dodge') executeDodge(2);
        else if (action === 'heal') executeHeal(2);
      }
    }, difficultySettings.botActionInterval);
    return () => clearInterval(botInterval);
  }, [gameOver, gamePaused, getBotAction, handleMovement, executeAttack, executeDodge, executeHeal, difficultySettings.botActionInterval]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || gamePaused) return; 
      if (quizActive) { 
        if (['1', '2', '3', '4'].includes(e.key)) handleTranslationAnswer(parseInt(e.key, 10) - 1);
        return;
      }
      
      const canMove = !['attack1', 'attack2', 'hit', 'ko', 'jump', 'dodge', 'heal'].includes(player1.action);
      const canAttack = !['hit', 'ko', 'jump', 'dodge', 'heal'].includes(player1.action);

      
      const target = player2; 
      const distance = Math.abs((player1.x + characterWidth / 2) - (target.x + characterWidth / 2));
      const isInRange = distance <= attackRange + characterWidth / 2;
      const isFacingTarget = (player1.direction === 'right' && player1.x < target.x) || (player1.direction === 'left' && player1.x > target.x);
      const willHit = isInRange && isFacingTarget && !target.isDodging;


      switch (e.key.toLowerCase()) {
        case 'a': case 'arrowleft': if (canMove) handleMovement(1, 'left'); break;
        case 'd': case 'arrowright': if (canMove) handleMovement(1, 'right'); break;
        case 'w': case 'arrowup': executeDodge(1); break; 
        case 's': case 'arrowdown': executeDodge(1); break; 
        
        case 'j':
          if (canAttack && player1.cooldowns.attack1 === 0) {
              if (willHit) { 
                  startTranslationQuiz(1, 2, difficultySettings.playerAttackDamage, 'attack1');
              } else {
                  
                  executeAttack(1, 'attack1'); 
              }
          }
          break;
        case 'k':
          if (canAttack && player1.cooldowns.attack2 === 0) {
              if (willHit) { 
                  startTranslationQuiz(1, 2, difficultySettings.playerAttackDamage + 10, 'attack2');
              } else {
                  
                  executeAttack(1, 'attack2'); 
              }
          }
          break;
        
        case 'h': if (player1.cooldowns.heal === 0) executeHeal(1); break; 
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (['a', 'd', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase()) && player1.action === 'walk') {
        setPlayer1(prev => ({ ...prev, action: 'idle' }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, gamePaused, player1, quizActive, executeAttack, handleMovement, executeDodge, executeHeal, handleTranslationAnswer, startTranslationQuiz, difficultySettings, attackRange, characterWidth]); 

  if (!selectedCharacter || !botCharacter) {
    return <div>Loading fighters...</div>;
  }

  return (
    <div className={`game-container`}>
        {/* Dim overlay that appears when quiz is active */}
        {quizActive && <div className="game-dim-overlay"></div>}

        {/* Question display area (top) */}
        {quizActive && currentQuestion && pendingAttack?.attackerPlayer === 1 && (
            <div className="quiz-top-question-area">
                <div className="quiz-question-display">
                    Translate "{currentQuestion.word}" to {currentQuestion.language}
                </div>
            </div>
        )}

        {/* Options display area (bottom) */}
        {quizActive && currentQuestion && pendingAttack?.attackerPlayer === 1 && (
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
                <div>
                <p className="quiz-instruction-bottom">Press 1-4 or click to answer</p>
                </div>
            </div>
        )}

      <div className="health-container">
        <div className="player-health left">
          <div className="player-name">{selectedCharacter.name}</div>
          <div className="health-bar-container">
            <div className="health-bar"><div className="health-fill" style={{ width: `${(player1.health / initialMaxHealth) * 100}%` }}></div></div>
            <div className="health-text">{player1.health}/{initialMaxHealth}</div>
          </div>
        </div>
        <div className="vs-text">VS</div>
        <div className="player-health right">
          <div className="player-name">{botCharacter.name}</div>
          <div className="health-bar-container">
            <div className="health-bar"><div className="health-fill" style={{ width: `${(player2.health / initialMaxHealth) * 100}%` }}></div></div>
            <div className="health-text">{player2.health}/{initialMaxHealth}</div>
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="game-over-screen">
          <h2>Game Over!</h2>
          <p>{winner}</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}

      {roundStart && (
        <div className="round-start-screen">
          <div className="round-start-text">FIGHT!</div>
        </div>
      )}

      <Character key={selectedCharacter.key} name={selectedCharacter.name} initialX={player1.x} images={character1Images} direction={player1.direction} currentAction={player1.action} onHitEffect={player1.hitEffect} triggerActionAnimation={player1.triggerActionAnim} frameCounts={selectedCharacter.frameCounts} scale={selectedCharacter.scale} />
      <Character key={botCharacter.key} name={botCharacter.name} initialX={player2.x} images={character2Images} direction={player2.direction} currentAction={player2.action} onHitEffect={player2.hitEffect} triggerActionAnimation={player2.triggerActionAnim} frameCounts={botCharacter.frameCounts} scale={botCharacter.scale} />
    </div>
  );
};

export default FightingGame;