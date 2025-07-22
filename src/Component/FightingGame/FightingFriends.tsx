import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Character from './Character.tsx'; // Assuming Character.tsx exists
import './FightingGame.css'; // Assuming FightingGame.css exists
import './luxury-mcq.css'; // Import the new luxury-mcq.css file for luxury MCQ modal styles

// --- (Interfaces and other constants remain the same) ---
interface CharacterType {
    key: string;
    name: string;
    frameCounts: any;
    scale: number;
    yOffset?: number;
}

interface PlayerState {
    x: number;
    health: number;
    action: string;
    direction: string;
    hitEffect: number;
    triggerActionAnim: number;
}

type GameState = 'CONNECTING' | 'CHARACTER_SELECT' | 'FIGHTING' | 'GAME_OVER';

const SPRITE_STYLE_MAP: { [key: string]: React.CSSProperties } = {
    'MedievalKingPack': { backgroundSize: '1260%', backgroundPosition: '21.5% 0%' },
    'medieval_warrior': { backgroundSize: '1700%', backgroundPosition: '23% 10%' },
    'medieval_warrior2': { backgroundSize: '3000%', backgroundPosition: '44% 68%' },
    'medieval_warrior3': { backgroundSize: '3000%', backgroundPosition: '55% 63%' },
};

interface VocabularyQuestion {
  english: string;
  spanish: string;
  options: string[];
}

const FightingFriendsOnline: React.FC = () => {
    const { roomCode: urlRoomId } = useParams<{ roomCode: string }>();
    const navigate = useNavigate();

    // --- State Management ---
    const [gameState, setGameState] = useState<GameState>('CONNECTING');
    const [allCharacters, setAllCharacters] = useState<CharacterType[]>([]);
    const [myCharacter, setMyCharacter] = useState<CharacterType | null>(null);
    const [opponentCharacter, setOpponentCharacter] = useState<CharacterType | null>(null);
    const [player1Selection, setPlayer1Selection] = useState<string | null>(null);
    const [player2Selection, setPlayer2Selection] = useState<string | null>(null);
    const [pendingGameStart, setPendingGameStart] = useState<any | null>(null);
    
    // State to manage the "Copied!" feedback message
    const [isCopied, setIsCopied] = useState(false);

    // Network and Game states
    const [gameMessage, setGameMessage] = useState('Connecting to server...');
    const [myPlayerNumber, setMyPlayerNumber] = useState<number | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    // Player fight states
    const [player1, setPlayer1] = useState<PlayerState>({ x: 100, health: 100, action: 'idle', direction: 'right', hitEffect: 0, triggerActionAnim: 0 });
    const [player2, setPlayer2] = useState<PlayerState>({ x: window.innerWidth - 400, health: 100, action: 'idle', direction: 'left', hitEffect: 0, triggerActionAnim: 0 });
    const [winner, setWinner] = useState<string | null>(null);
    
    // Game constants
    const moveSpeed = 20;
    const attackRange = 250;
    const characterWidth = 150;

    // Quiz states
    const [quizActive, setQuizActive] = useState(false);
    const [quizQuestion, setQuizQuestion] = useState<VocabularyQuestion | null>(null);
    const [vocab, setVocab] = useState<VocabularyQuestion[]>([]);
    const [pendingAttackType, setPendingAttackType] = useState<'attack1' | 'attack2' | null>(null);
    const [quizResult, setQuizResult] = useState<null | 'correct' | 'incorrect'>(null);


    // --- (useEffect for fetchCharacters and WebSocket logic remains the same) ---
    // --- Initial Setup ---
    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const response = await fetch('/assets/data/characters.json');
                const data = await response.json();
                setAllCharacters(data);
            } catch (error) {
                console.error("Failed to load characters:", error);
                setGameMessage('Error: Could not load character data.');
            }
        };
        fetchCharacters();
    }, []);

    // Fetch vocabulary on mount
    useEffect(() => {
        fetch('/assets/vocabulary.json')
          .then(res => res.json())
          .then(data => setVocab(data.vocabulary))
          .catch(() => setVocab([]));
    }, []);

    // --- WebSocket Logic ---
    useEffect(() => {
        if (!urlRoomId) {
            navigate('/');
            return;
        };
        console.log('Connecting to room:', urlRoomId);

        const connect = () => {
            const ws = new WebSocket('ws://localhost:3001');
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('✅ WebSocket connection opened.');
                setGameMessage('Connection successful. Entering room...');
                const message = { type: 'ENTER_ROOM', roomId: urlRoomId };
                ws.send(JSON.stringify(message));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case 'START_CHARACTER_SELECT':
                        setMyPlayerNumber(data.playerNum);
                        setGameState('CHARACTER_SELECT');
                        setGameMessage(data.message || 'Choose your fighter!');
                        if (data.initialSelections) {
                            setPlayer1Selection(data.initialSelections.player1);
                            setPlayer2Selection(data.initialSelections.player2);
                        }
                        break;

                    case 'PLAYER_JOINED':
                        setGameMessage(data.message);
                        break;

                    case 'UPDATE_SELECTION':
                        if (data.playerNum === 1) setPlayer1Selection(data.characterKey);
                        if (data.playerNum === 2) setPlayer2Selection(data.characterKey);
                        break;

                    case 'START_GAME':
                        console.log("START_GAME message received. Queuing for processing.");
                        setPendingGameStart(data);
                        break;
                    
                    case 'PLAYER_MOVE': {
                        const setter = data.playerNumber === 1 ? setPlayer1 : setPlayer2;
                        setter(prev => ({...prev, x: data.x, action: data.action, direction: data.direction}));
                        break;
                    }
                    case 'PLAYER_ACTION': {
                        const setter = data.playerNumber === 1 ? setPlayer1 : setPlayer2;
                        setter(prev => ({...prev, action: data.action, triggerActionAnim: prev.triggerActionAnim + 1}));
                        console.log('PLAYER_ACTION received:', data);
                        break;
                    }
                    case 'HEALTH_UPDATE': {
                        const targetSetter = data.playerNum === 1 ? setPlayer1 : setPlayer2;
                        targetSetter(prev => {
                            const newHealth = Math.max(0, prev.health - data.damage);
                            if (newHealth === 0) {
                                setGameState('GAME_OVER');
                                const winnerPlayer = data.playerNum === 1 ? 'Player 2' : 'Player 1';
                                setWinner(winnerPlayer);
                                setGameMessage(`${winnerPlayer} wins!`);
                            }
                            return { ...prev, health: newHealth, hitEffect: prev.hitEffect + 1 };
                        });
                        break;
                    }
                        
                    case 'OPPONENT_DISCONNECTED':
                        setGameState('GAME_OVER');
                        setWinner('You');
                        setGameMessage('Opponent disconnected.');
                        break;
                    
                    case 'ERROR':
                        alert(`Server Error: ${data.message}`);
                        navigate('/');
                        break;
                }
            };

            ws.onclose = () => {
                setGameMessage('Connection lost. Please refresh.');
            };

            ws.onerror = (err) => {
                console.error('WebSocket error:', err);
                setGameMessage('Could not connect to the server.');
            };
        };

        connect();
        return () => {
            wsRef.current?.close();
        };
    }, [urlRoomId, navigate]);

    // Safely process the START_GAME message
    useEffect(() => {
        if (pendingGameStart && allCharacters.length > 0) {
            console.log("Processing queued START_GAME message now that characters are loaded.");
            const data = pendingGameStart;

            const myCharKey = myPlayerNumber === 1 ? data.player1Character : data.player2Character;
            const opponentCharKey = myPlayerNumber === 1 ? data.player2Character : data.player1Character;

            setMyCharacter(allCharacters.find(c => c.key === myCharKey) || null);
            setOpponentCharacter(allCharacters.find(c => c.key === opponentCharKey) || null);
            
            setGameState('FIGHTING');
            setGameMessage('FIGHT!');
            setTimeout(() => setGameMessage(''), 2000);

            setPendingGameStart(null);
        }
    }, [pendingGameStart, allCharacters, myPlayerNumber]);

    // --- (Game Logic, Keyboard Handlers, and Memoized image maps remain the same) ---
    const executeAttack = useCallback((attackType: 'attack1' | 'attack2') => {
        if (!myPlayerNumber || gameState !== 'FIGHTING') return;

        const me = myPlayerNumber === 1 ? player1 : player2;
        const opponent = myPlayerNumber === 1 ? player2 : player1;
        const mySetter = myPlayerNumber === 1 ? setPlayer1 : setPlayer2;

        mySetter(prev => ({ ...prev, action: attackType, triggerActionAnim: prev.triggerActionAnim + 1 }));

        setTimeout(() => {
            mySetter(prev => prev.action === attackType ? { ...prev, action: 'idle' } : prev);
        }, 400);


        // Use left edge for distance calculation for more intuitive hit detection
        const distance = Math.abs(me.x - opponent.x);
        // You can tune this value to match your sprite size visually
        const tunedAttackRange = 150;
        const isInRange = distance <= tunedAttackRange;
        // For now, allow facing any direction (for easier testing)
        const isFacingTarget = true;

        console.log('Attack:', {
          meX: me.x,
          opponentX: opponent.x,
          distance,
          isInRange,
          isFacingTarget,
          myDirection: me.direction,
          opponentDirection: opponent.direction
        });

        if (isInRange && isFacingTarget) {
            // Show quiz before sending attack
            if (vocab.length > 0) {
              setQuizQuestion(vocab[Math.floor(Math.random() * vocab.length)]);
              setQuizActive(true);
              setPendingAttackType(attackType);
              return; // Don't send attack yet
            }
        } else {
            // Out of range: just play animation, no quiz, no damage
            wsRef.current?.send(JSON.stringify({
                type: 'PLAYER_ACTION',
                action: attackType,
                hit: false,
                damage: 0
            }));
        }
    }, [myPlayerNumber, player1, player2, gameState, attackRange, characterWidth, vocab]);

    // Quiz answer handler
    const handleQuizAnswer = (option: string) => {
      if (!quizQuestion || !pendingAttackType) return;
      const correct = option === quizQuestion.spanish;
      setQuizResult(correct ? 'correct' : 'incorrect');

      if (correct) {
        setTimeout(() => {
          // Play attack animation (set action to attack)
          const mySetter = myPlayerNumber === 1 ? setPlayer1 : setPlayer2;
          mySetter(prev => ({ ...prev, action: pendingAttackType, triggerActionAnim: prev.triggerActionAnim + 1 }));
          // Send the attack to the server immediately after starting animation
          wsRef.current?.send(JSON.stringify({
            type: 'PLAYER_ACTION',
            action: pendingAttackType,
            hit: true,
            damage: 10
          }));
          setPendingAttackType(null);
          setTimeout(() => {
            // After attack animation, always set to idle and increment triggerActionAnim
            mySetter(prev => ({ ...prev, action: 'idle', triggerActionAnim: prev.triggerActionAnim + 1 }));
            // After attack and idle, clear quiz modal and feedback
            setTimeout(() => {
              setQuizActive(false);
              setQuizQuestion(null);
              setQuizResult(null);
            }, 100); // Ensure idle is visible before closing modal
          }, 400); // Attack animation duration
        }, 1200); // Show correct feedback for 1.2s
      } else {
        setTimeout(() => {
          setQuizActive(false);
          setQuizQuestion(null);
          setQuizResult(null);
          setPendingAttackType(null);
        }, 1200); // Show incorrect feedback for 1.2s
      }
    };

    // --- Keyboard Input Handler ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'FIGHTING') return;

            const myPlayerState = myPlayerNumber === 1 ? player1 : player2;
            const mySetter = myPlayerNumber === 1 ? setPlayer1 : setPlayer2;

            switch (e.key.toLowerCase()) {
                case 'a':
                case 'arrowleft': {
                    const newX = Math.max(0, myPlayerState.x - moveSpeed);
                    mySetter(prev => ({...prev, x: newX, action: 'run', direction: 'left'}));
                    wsRef.current?.send(JSON.stringify({type: 'PLAYER_MOVE', x: newX, action: 'run', direction: 'left'}));
                    break;
                }
                case 'd':
                case 'arrowright': {
                    const newX = Math.min(window.innerWidth - characterWidth, myPlayerState.x + moveSpeed);
                    mySetter(prev => ({...prev, x: newX, action: 'run', direction: 'right'}));
                    wsRef.current?.send(JSON.stringify({type: 'PLAYER_MOVE', x: newX, action: 'run', direction: 'right'}));
                    break;
                }
                case 'j':
                    executeAttack('attack1');
                    break;
                case 'k':
                    executeAttack('attack2');
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
             if (gameState !== 'FIGHTING') return;
             const mySetter = myPlayerNumber === 1 ? setPlayer1 : setPlayer2;
             if (['a', 'd', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
                 mySetter(prev => ({...prev, action: 'idle'}));
                 wsRef.current?.send(JSON.stringify({type: 'PLAYER_MOVE', x: (myPlayerNumber === 1 ? player1.x : player2.x), action: 'idle', direction: (myPlayerNumber === 1 ? player1.direction : player2.direction)}));
             }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState, myPlayerNumber, player1, player2, executeAttack]);

    // Memoized image maps
    const myImages = useMemo(() => {
        if (!myCharacter) return {} as { [key: string]: string };
        return {
            'idle-left': `/assets/sprites/${myCharacter.key}/idle.png`,
            'idle-right': `/assets/sprites/${myCharacter.key}/idle.png`,
            'run-left': `/assets/sprites/${myCharacter.key}/run.png`,
            'run-right': `/assets/sprites/${myCharacter.key}/run.png`,
            'attack1-left': `/assets/sprites/${myCharacter.key}/attack1.png`,
            'attack1-right': `/assets/sprites/${myCharacter.key}/attack1.png`,
            'attack2-left': `/assets/sprites/${myCharacter.key}/attack2.png`,
            'attack2-right': `/assets/sprites/${myCharacter.key}/attack2.png`,
            'jump-left': `/assets/sprites/${myCharacter.key}/jump.png`,
            'jump-right': `/assets/sprites/${myCharacter.key}/jump.png`,
            'death-left': `/assets/sprites/${myCharacter.key}/death.png`,
            'death-right': `/assets/sprites/${myCharacter.key}/death.png`,
            'take_hit-left': `/assets/sprites/${myCharacter.key}/take_hit.png`,
            'take_hit-right': `/assets/sprites/${myCharacter.key}/take_hit.png`
        };
    }, [myCharacter]);
    const opponentImages = useMemo(() => {
        if (!opponentCharacter) return {} as { [key: string]: string };
        return {
            'idle-left': `/assets/sprites/${opponentCharacter.key}/idle.png`,
            'idle-right': `/assets/sprites/${opponentCharacter.key}/idle.png`,
            'run-left': `/assets/sprites/${opponentCharacter.key}/run.png`,
            'run-right': `/assets/sprites/${opponentCharacter.key}/run.png`,
            'attack1-left': `/assets/sprites/${opponentCharacter.key}/attack1.png`,
            'attack1-right': `/assets/sprites/${opponentCharacter.key}/attack1.png`,
            'attack2-left': `/assets/sprites/${opponentCharacter.key}/attack2.png`,
            'attack2-right': `/assets/sprites/${opponentCharacter.key}/attack2.png`,
            'jump-left': `/assets/sprites/${opponentCharacter.key}/jump.png`,
            'jump-right': `/assets/sprites/${opponentCharacter.key}/jump.png`,
            'death-left': `/assets/sprites/${opponentCharacter.key}/death.png`,
            'death-right': `/assets/sprites/${opponentCharacter.key}/death.png`,
            'take_hit-left': `/assets/sprites/${opponentCharacter.key}/take_hit.png`,
            'take_hit-right': `/assets/sprites/${opponentCharacter.key}/take_hit.png`
        };
    }, [opponentCharacter]);


    // --- UI Handlers ---
    const handleSelectCharacter = (charKey: string) => {
        const mySelection = myPlayerNumber === 1 ? player1Selection : player2Selection;
        if (mySelection) return; // Prevent changing selection

        wsRef.current?.send(JSON.stringify({ type: 'SELECT_CHARACTER', characterKey: charKey }));
        if (myPlayerNumber === 1) setPlayer1Selection(charKey);
        if (myPlayerNumber === 2) setPlayer2Selection(charKey);
    };
    
    // **MODIFIED**: Handler now copies the full window URL
    const handleCopyRoomCode = () => {
        // Copies the full URL, e.g., "http://localhost:3000/room/ABCD"
        navigator.clipboard.writeText(window.location.href).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Hide message after 2 seconds
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };

    const handleRestart = () => {
        // Reset all relevant states
        setPlayer1({ x: 100, health: 100, action: 'idle', direction: 'right', hitEffect: 0, triggerActionAnim: 0 });
        setPlayer2({ x: window.innerWidth - 400, health: 100, action: 'idle', direction: 'left', hitEffect: 0, triggerActionAnim: 0 });
        setWinner(null);
        setMyCharacter(null);
        setOpponentCharacter(null);
        setPlayer1Selection(null);
        setPlayer2Selection(null);
        setPendingGameStart(null);
        setGameMessage('Restarting...');
        setGameState('CHARACTER_SELECT');
        wsRef.current?.send(JSON.stringify({ type: 'RESTART_GAME', roomId: urlRoomId }));
    };

    // --- Render Logic ---
    const renderContent = () => {
        switch (gameState) {
            case 'CONNECTING':
                return <div className="lobby-container"><p className="game-message">{gameMessage}</p></div>;

            case 'CHARACTER_SELECT':
                const opponentSelection = myPlayerNumber === 1 ? player2Selection : player1Selection;
                return (
                    <div className="character-select-container">
                        <div className="game-message-container">
                           <h2>{gameMessage}</h2>
                           <div className="room-info">
                                <span>Room: {urlRoomId}</span>
                                {/* MODIFIED: Tooltip updated to reflect the new action */}
                                <button onClick={handleCopyRoomCode} className="copy-button" title="Copy Room URL">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zM8 7a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 8 7z"/>
                                    </svg>
                                </button>
                                {isCopied && <span className="copy-feedback">Copied!</span>}
                           </div>
                        </div>
                        <div className="character-grid">
                            {allCharacters.map(char => {
                                const isOpponentSelection = char.key === opponentSelection;
                                const isMySelection = char.key === (myPlayerNumber === 1 ? player1Selection : player2Selection);
                                let className = "character-card";
                                if (isMySelection) className += " selected-me";
                                if (isOpponentSelection) className += " selected-opponent";
                                return (
                                    <div key={char.key} className={className} onClick={() => handleSelectCharacter(char.key)}>
                                        <div
                                            className="char-select-sprite"
                                            style={{
                                                backgroundImage: `url(/assets/sprites/${char.key}/idle.png)`,
                                                ...(SPRITE_STYLE_MAP[char.key] || {}),
                                                width: 80,
                                                height: 80,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: SPRITE_STYLE_MAP[char.key]?.backgroundPosition || 'center',
                                                backgroundSize: SPRITE_STYLE_MAP[char.key]?.backgroundSize || 'cover',
                                                borderRadius: 12,
                                                margin: '0 auto 8px auto',
                                            }}
                                        />
                                        <h3>{char.name}</h3>
                                        {isMySelection && <div className="selection-tag my-tag">You (P{myPlayerNumber})</div>}
                                        {isOpponentSelection && <div className="selection-tag opponent-tag">Opponent</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            // --- (FIGHTING and GAME_OVER cases remain the same) ---
            case 'FIGHTING':
                if (!myCharacter || !opponentCharacter) return <div>Loading assets...</div>;
                return (
                    <div className="game-arena">
                        <div className="ff-healthbar-ui-container">
                            <div className="ff-healthbar-player">
                                <div className="ff-player-name">You</div>
                                <div className="ff-health_bar-container">
                                    <div className="ff-health-bar">
                                        <div
                                            className={`ff-health-fill ${
                                                (myPlayerNumber === 1 ? player1.health : player2.health) > 60
                                                ? 'ff-high-health'
                                                : (myPlayerNumber === 1 ? player1.health : player2.health) > 30
                                                ? 'ff-medium-health'
                                                : 'ff-low-health'
                                            }`}
                                            style={{
                                                width: `${Math.max(0, myPlayerNumber === 1 ? player1.health : player2.health)}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="ff-health-text">
                                        {myPlayerNumber === 1 ? player1.health : player2.health}/100
                                    </div>
                                </div>
                            </div>
                            <div className="ff-healthbar-player">
                                <div className="ff-player-name">Opponent</div>
                                <div className="ff-health_bar-container">
                                    <div className="ff-health-bar">
                                        <div
                                            className={`ff-health-fill ${
                                                (myPlayerNumber === 1 ? player2.health : player1.health) > 60
                                                ? 'ff-high-health'
                                                : (myPlayerNumber === 1 ? player2.health : player1.health) > 30
                                                ? 'ff-medium-health'
                                                : 'ff-low-health'
                                            }`}
                                            style={{
                                                width: `${Math.max(0, myPlayerNumber === 1 ? player2.health : player1.health)}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="ff-health-text">
                                        {myPlayerNumber === 1 ? player2.health : player1.health}/100
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="game-message-banner">{gameMessage}</div>
                        <Character key={'my-char'} name={myCharacter.name} initialX={myPlayerNumber === 1 ? player1.x : player2.x} images={myImages} direction={myPlayerNumber === 1 ? player1.direction : player2.direction} currentAction={myPlayerNumber === 1 ? player1.action : player2.action} frameCounts={myCharacter.frameCounts} scale={myCharacter.scale} onHitEffect={myPlayerNumber === 1 ? player1.hitEffect : player2.hitEffect} triggerActionAnimation={myPlayerNumber === 1 ? player1.triggerActionAnim : player2.triggerActionAnim} />
                        <Character key={'opponent-char'} name={opponentCharacter.name} initialX={myPlayerNumber === 1 ? player2.x : player1.x} images={opponentImages} direction={myPlayerNumber === 1 ? player2.direction : player1.direction} currentAction={myPlayerNumber === 1 ? player2.action : player1.action} frameCounts={opponentCharacter.frameCounts} scale={opponentCharacter.scale} onHitEffect={myPlayerNumber === 1 ? player2.hitEffect : player1.hitEffect} triggerActionAnimation={myPlayerNumber === 1 ? player2.triggerActionAnim : player1.triggerActionAnim} />
                        <div className="controls-bar-ui">
                            <div className="controls-section">
                                <span className="controls-label">Move:</span>
                                <span className="controls-key-glass">A</span>
                                <span className="controls-key-glass">D</span>
                                <span className="controls-key-glass">←</span>
                                <span className="controls-key-glass">→</span>
                            </div>
                            <div className="controls-section">
                                <span className="controls-label">Attack:</span>
                                <span className="controls-key-glass">J</span>
                                <span className="controls-key-glass">K</span>
                            </div>
                        </div>
                    </div>
                );

            case 'GAME_OVER':
                return (
                    <div className="game-over-screen">
                        <h2>Game Over</h2>
                        <p>{winner} wins!</p>
                        <button onClick={() => navigate('/')}>Back to Menu</button>
                        <button onClick={handleRestart}>Restart</button>
                    </div>
                );

            default:
                return <div>An unknown error occurred.</div>;
        }
    };

    return (
        <div className="game-container">
            {/* The game header is now rendered outside the switch statement */}
            {/* <div className="game-header"><h1>Fighting Friends Online</h1></div> */}
            {renderContent()}
            {quizActive && quizQuestion && (
              <div className="luxury-mcq-modal">
                <div className="luxury-mcq-content">
                  <h3 className="luxury-mcq-title">🧠 Translate to Spanish</h3>
                  <div className="luxury-mcq-question">{quizQuestion.english}</div>
                  <div className="luxury-mcq-options">
                    {quizQuestion.options.map(opt => (
                      <button
                        key={opt}
                        className={`luxury-mcq-option-btn${quizResult && (opt === quizQuestion.spanish ? ' correct' : quizResult === 'incorrect' && quizResult !== 'correct' && opt === (quizResult === 'incorrect' ? opt : '') ? ' incorrect' : '')}`}
                        onClick={() => handleQuizAnswer(opt)}
                        disabled={!!quizResult}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {quizResult === 'correct' && <div className="luxury-mcq-feedback correct">✅ Correct!</div>}
                  {quizResult === 'incorrect' && <div className="luxury-mcq-feedback incorrect">❌ Incorrect!</div>}
                </div>
              </div>
            )}
        </div>
    );
}

export default FightingFriendsOnline;