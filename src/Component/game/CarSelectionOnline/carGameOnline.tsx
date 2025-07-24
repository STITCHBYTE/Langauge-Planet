import React, { useState, useEffect, useRef, useCallback } from 'react';
import CarSelection from './CarSelectionOnline.tsx';
import Car3D from './Car3DOnline.tsx';
import type { CarOption } from './CarSelectionOnline.tsx';

interface QuizQuestion {
    question: string;
    answer: string;
}
interface PlayerState {
    id: string;
    carId: string | null;
    progress: number;
    playerNum: number;
}

const BOT_COUNT = 2;
const BOT_ANSWER_DELAY = 2500;
const BOT_CAR_IDS = ['suv-luxury', 'van'];

const CarGameOnline = () => {
    const pathParts = window.location.pathname.split('/');
    const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const roomId = pathParts[2] || '';
    const ws = useRef<WebSocket | null>(null);
    const [clientId, setClientId] = useState('');
    const [playerNum, setPlayerNum] = useState<number | null>(null);
    const [positions, setPositions] = useState<{ player1: number; player2: number }>({ player1: 0, player2: 0 });
    const [gameState, setGameState] = useState<'waiting' | 'starting' | 'racing' | 'finished'>('waiting');
    const [winner, setWinner] = useState<string>('');
    const [gameStarted, setGameStarted] = useState(false); 
    const [botCarIds, setBotCarIds] = useState<string[]>(BOT_CAR_IDS);
    const [botProgress, setBotProgress] = useState<number[]>(Array(BOT_COUNT).fill(0));
    const [botFinished, setBotFinished] = useState<boolean[]>(Array(BOT_COUNT).fill(false));
    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
    const [userInput, setUserInput] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isQuestionCooldown, setIsQuestionCooldown] = useState(false);
    const [questionsAnsweredCount, setQuestionsAnsweredCount] = useState(0);
    const quizInputRef = useRef<HTMLInputElement>(null);
    const [showCarSelection, setShowCarSelection] = useState(true);
    const [selectedCarId, setSelectedCarId] = useState('');
    const [opponentCarId, setOpponentCarId] = useState('');
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdownNumber, setCountdownNumber] = useState<number | 'GO!'>(3);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isCheering, setIsCheering] = useState(false);
    const [winningCarOffset, setWinningCarOffset] = useState(0);
    const [gameEnded, setGameEnded] = useState(false);

    const TOTAL_SCROLL_DISTANCE_PX = 4000;
    const SECTION_LENGTH_PX = 800;
    const carOptions: CarOption[] = [
        { id: 'race', name: 'Race Car', modelPath: '/kenney_car-kit/Models/GLB format/race.glb', previewImage: '/red-truck.svg', color: 'bg-red-500' },
        { id: 'race-future', name: 'Future Racer', modelPath: '/kenney_car-kit/Models/GLB format/race-future.glb', previewImage: '/blue-green-truck-mini.svg', color: 'bg-blue-500' },
        { id: 'sedan-sports', name: 'Sports Sedan', modelPath: '/kenney_car-kit/Models/GLB format/sedan-sports.glb', previewImage: '/orange-van.svg', color: 'bg-orange-500' },
        { id: 'suv-luxury', name: 'Luxury SUV', modelPath: '/kenney_car-kit/Models/GLB format/suv-luxury.glb', previewImage: '/black-truck.svg', color: 'bg-gray-800' },
        { id: 'police', name: 'Police Car', modelPath: '/kenney_car-kit/Models/GLB format/police.glb', previewImage: '/white-dumper.svg', color: 'bg-blue-900' },
        { id: 'van', name: 'Racing Van', modelPath: '/kenney_car-kit/Models/GLB format/van.glb', previewImage: '/yellow-mini-truck.svg', color: 'bg-yellow-500' }
    ];
    const WINNER_OFFSET = 8;
    const userProgress = playerNum === 1 ? positions.player1 : positions.player2;
    const opponentProgress = playerNum === 1 ? positions.player2 : positions.player1;
    const selectedCar = carOptions.find(car => car.id === selectedCarId);
    const quizQuestions: QuizQuestion[] = [
        { question: 'What is 5 + 7?', answer: '12' },
        { question: 'What is the capital of France?', answer: 'paris' },
        { question: 'Type "ready" to continue!', answer: 'ready' }
    ];

    useEffect(() => {
        if (!roomId) return;
        if (!ws.current || ws.current.url !== `ws://localhost:8002/` || ws.current.readyState === WebSocket.CLOSED) {
            if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
                ws.current.close();
            }
            const wsUrl = `ws://localhost:8002`;
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                ws.current?.send(JSON.stringify({ type: 'JOIN_ROOM', roomId }));
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case 'CLIENT_CONNECTED':
                        setClientId(data.clientId);
                        break;
                    case 'ROOM_JOINED':
                        setPlayerNum(data.playerNum);
                        break;
                    case 'START_RACE':
                        setShowCarSelection(false);
                        setShowCountdown(true);
                        setCountdownNumber(3);
                        setGameState('starting');
                        break;
                    case 'OPPONENT_CAR_SELECTED':
                        setOpponentCarId(data.carId);
                        break;
                    case 'GAME_STATE_UPDATE':
                        setPositions(data.positions);
                        setGameState('racing');
                        break;
                    case 'GAME_OVER':
                        setGameState('finished');
                        setWinner(data.winner === playerNum ? 'You' : `Player ${data.winner}`);
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 3000);
                        break;
                    case 'GAME_RESTARTED':
                        setGameState('waiting');
                        setWinner('');
                        setPositions({ player1: 0, player2: 0 });
                        setSelectedCarId('');
                        setOpponentCarId('');
                        setShowCarSelection(true);
                        setQuestionsAnsweredCount(0);
                        setCurrentQuestion(null);
                        setGameEnded(false);
                        break;
                    default:
                        break;
                }
            };

            ws.current.onclose = () => {
            };

            ws.current.onerror = (error) => {
            };
        }
        return () => {
            if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
                ws.current.close();
                ws.current = null;
            }
        };
    }, [roomId]);
    const generateQuestion = useCallback(() => {
        if (questionsAnsweredCount < quizQuestions.length) {
            setCurrentQuestion(quizQuestions[questionsAnsweredCount]);
            setUserInput('');
            setFeedbackMessage('');
            setIsQuestionCooldown(false);
            setTimeout(() => {
                if (quizInputRef.current) {
                    quizInputRef.current.focus();
                }
            }, 50);
        } else {
            setCurrentQuestion(null);
        }
    }, [quizQuestions, questionsAnsweredCount]);
    useEffect(() => {
        if (gameState === 'finished' && winner) {
            let animationProgress = 0;
            const animationDuration = 1500;
            const maxOffset = 50;

            const interval = setInterval(() => {
                animationProgress += 50;
                const currentOffset = (animationProgress / animationDuration) * maxOffset;

                if (animationProgress >= animationDuration) {
                    setWinningCarOffset(maxOffset);
                    clearInterval(interval);
                } else {
                    setWinningCarOffset(currentOffset);
                }
            }, 50);

            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);

            return () => clearInterval(interval);
        }
        if (gameState !== 'finished') {
            setWinningCarOffset(0);
        }
    }, [gameState, winner]);
    useEffect(() => {
        let countdownTimeout: NodeJS.Timeout | null = null;
        let countdownInterval: NodeJS.Timeout | null = null;

        if (showCountdown && typeof countdownNumber === 'number' && countdownNumber > 0) {
            countdownInterval = setInterval(() => {
                setCountdownNumber(prevNum => {
                    if (typeof prevNum === 'number' && prevNum > 1) {
                        return prevNum - 1;
                    } else {
                        clearInterval(countdownInterval!);
                        countdownTimeout = setTimeout(() => {
                            setShowCountdown(false);
                            setCountdownNumber(3);
                        }, 1000);
                        return 'GO!';
                    }
                });
            }, 1000);
        } else if (showCountdown && countdownNumber === 'GO!') {
            countdownTimeout = setTimeout(() => {
                setShowCountdown(false);
                setCountdownNumber(3);
            }, 1000);
        }

        return () => {
            if (countdownInterval) clearInterval(countdownInterval);
            if (countdownTimeout) clearTimeout(countdownTimeout);
        };
    }, [showCountdown, countdownNumber]);
    const handleSubmitQuiz = (e: React.FormEvent) => {
        e.preventDefault();
        if (isQuestionCooldown || gameState !== 'racing' || !currentQuestion) return;

        setIsQuestionCooldown(true);
        const DELAY = 3000;

        if (userInput.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()) {
            setFeedbackMessage('Correct! Speed boost activated!');
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ type: 'SUBMIT_ANSWER', roomId, isCorrect: true }));
            }
            setIsCheering(true);
            setTimeout(() => setIsCheering(false), 1500);
            setQuestionsAnsweredCount(prevCount => prevCount + 1);
            setTimeout(() => generateQuestion(), DELAY);
        } else {
            setFeedbackMessage('Incorrect. Try again!');
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ type: 'SUBMIT_ANSWER', roomId, isCorrect: false }));
            }
            setIsCheering(false);
            setTimeout(() => {
                setUserInput('');
                setFeedbackMessage('');
                setIsQuestionCooldown(false);
                quizInputRef.current?.focus();
            }, DELAY);
        }
    };
    useEffect(() => {
        if (gameState === 'racing' && currentQuestion === null && questionsAnsweredCount < quizQuestions.length) {
            generateQuestion();
        }
    }, [gameState, currentQuestion, questionsAnsweredCount, quizQuestions.length, generateQuestion]);
    const resetGame = () => {
        setGameStarted(false);
    };
    const renderBackgroundElements = (offsetX: number) => (
        <>
            <img src="/images/barrierRed_NE.png" alt="Red Barrier" className="absolute h-1/6 top-[-8%]" style={{ left: `${offsetX + 50}px`, zIndex: 5 }} />
            <img src="/images/barrierRed_NW.png" alt="Red Barrier" className="absolute h-1/6 top-[-8%]" style={{ left: `${offsetX + 250}px`, zIndex: 5 }} />
            <img src="/images/barrierRed_NW.png" alt="Red Barrier" className="absolute h-1/6 top-[-8%]" style={{ left: `${offsetX + 550}px`, zIndex: 5 }} />
            <img src="/images/barrierRed_NE.png" alt="Red Barrier" className="absolute h-1/6 bottom-[-4%]" style={{ left: `${offsetX + 100}px`, zIndex: 5 }} />
            <img src="/images/barrierRed_NE.png" alt="Red Barrier" className="absolute h-1/6 bottom-[-4%]" style={{ left: `${offsetX + 300}px`, zIndex: 5 }} />
            <img src="/images/barrierRed_NW.png" alt="Red Barrier" className="absolute h-1/6 bottom-[-4%]" style={{ left: `${offsetX + 570}px`, zIndex: 5 }} />
            <img src="/images/lightColored_NE.png" alt="Traffic Light NE" className="absolute h-1/4 top-0" style={{ left: `${offsetX + 100}px`, transform: 'translateY(-50%)', zIndex: 5 }} />
            <img src="/images/lightColored_NW.png" alt="Traffic Light NW" className="absolute h-1/4 top-0" style={{ left: `${offsetX + 500}px`, transform: 'translateY(-50%)', zIndex: 5 }} />
            <img src="/images/lightPost_exclusive_SE.png" alt="Light Post SE" className="absolute h-1/2 bottom-[-19%]" style={{ left: `${offsetX + 300}px`, transform: 'translateY(-50%)', zIndex: 999 }} />
            <img src="/images/lightPost_exclusive_SW.png" alt="Light Post SW" className="absolute h-1/2 bottom-[-19%]" style={{ left: `${offsetX + 700}px`, transform: 'translateY(-50%)', zIndex: 999 }} />
        </>
    );
    const numRepetitions = Math.ceil(TOTAL_SCROLL_DISTANCE_PX / SECTION_LENGTH_PX) + 1;
    const handleCarSelect = (carId: string) => {
        if (selectedCarId === carId) {
            return;
        }
        if (gameState !== 'waiting') {
            return;
        }

        setSelectedCarId(carId);
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'SELECT_CAR', roomId, carId }));
        }
    };
    useEffect(() => {
        if (gameState === 'starting') {
            setBotCarIds(BOT_CAR_IDS);
            setBotProgress(Array(BOT_COUNT).fill(0));
            setBotFinished(Array(BOT_COUNT).fill(false));
        }
    }, [gameState]);
    useEffect(() => {
        if (gameState !== 'racing') return;
        const BOT_SPEEDS = [0.18, 0.22];
        const TICK_MS = 50;
        const interval = setInterval(() => {
            setBotProgress(prev => prev.map((p, i) => {
                if (botFinished[i]) return p;
                const next = p + BOT_SPEEDS[i];
                return next >= 100 ? 100 : next;
            }));
        }, TICK_MS);
        return () => clearInterval(interval);
    }, [gameState, botFinished]);
    useEffect(() => {
        if (gameState !== 'racing') return;
        setBotFinished(prev => prev.map((f, i) => f || botProgress[i] >= 100));
    }, [botProgress, gameState]);

    const [carShake, setCarShake] = useState(0);
    useEffect(() => {
        if (gameState !== 'racing') {
            setCarShake(0);
            return;
        }
        let frame = 0;
        let raf: number | undefined;
        const animate = () => {
            setCarShake(Math.sin(frame * 0.2) * 2);
            frame++;
            raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
        return () => {
            if (raf !== undefined) cancelAnimationFrame(raf);
        };
    }, [gameState]);

    const [animatedUserProgress, setAnimatedUserProgress] = useState(0);
    const [roadAnimationProgress, setRoadAnimationProgress] = useState(0);

    useEffect(() => {
        let rafId: number;
        const animateRoad = () => {
            setRoadAnimationProgress(prev => {
                const allCurrentProgress = [userProgress, opponentProgress, ...botProgress];
                const maxCurrentProgress = Math.max(...allCurrentProgress);
                if (gameState === 'finished') {
                    if (prev < 100) {
                        return Math.min(100, prev + (100 - prev) * 0.05 + 0.1);
                    } else {
                        return 100;
                    }
                }
                const MIN_ROAD_SPEED_PER_FRAME = 0.2;
                return Math.max(prev + MIN_ROAD_SPEED_PER_FRAME, maxCurrentProgress);
            });
            rafId = requestAnimationFrame(animateRoad);
        };

        if (gameState === 'racing' || gameState === 'finished') {
            rafId = requestAnimationFrame(animateRoad);
        } else {
            setRoadAnimationProgress(0);
        }

        return () => {
            cancelAnimationFrame(rafId);
        };
    }, [gameState, userProgress, opponentProgress, botProgress]);
    const roadScrollX = -(roadAnimationProgress / 100) * TOTAL_SCROLL_DISTANCE_PX;

    function getCarOffsetAbsolute(progress: number, isWinner: boolean = false) {
        const min = 20, max = 80;
        let effectiveProgress = progress;
        if (gameState === 'finished' && isWinner) {
            effectiveProgress += WINNER_OFFSET;
        }
        effectiveProgress = Math.min(100, effectiveProgress);
        return min + (max - min) * (effectiveProgress / 100);
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white font-inter flex flex-col items-center justify-center p-4">
            <h1 className="text-5xl font-extrabold mb-8 text-yellow-400 drop-shadow-lg">Langauge Planet</h1>
            {gameState === 'finished' && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center z-50">
                    <p className="text-8xl font-extrabold text-yellow-300 mb-8 animate-bounce">
                        {winner === 'You' ? 'YOU WON!' : `${winner} WON!`}
                    </p>
                    {showConfetti && (
                        <img
                            src="/2979685.png"
                            alt="Confetti"
                            className="absolute inset-0 w-full h-full object-cover animate-confetti-burst"
                        />
                    )}
                    <button
                        onClick={() => {
                            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                                ws.current.send(JSON.stringify({ type: 'RESTART_GAME', roomId }));
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition duration-300 hover:scale-105 text-2xl mt-8"
                    >
                        Play Again
                    </button>
                </div>
            )}

            {showCarSelection && (
                <>
                    <CarSelection
                        onCarSelect={handleCarSelect}
                        selectedCarId={selectedCarId}
                        disableCarIds={[selectedCarId, opponentCarId].filter(Boolean)}
                        meId={clientId}
                        renderCarLabel={(carId: string) => {
                            if (carId === selectedCarId) {
                                return <span className="block text-green-400 text-xs font-bold mt-1">Selected by you</span>;
                            }
                            if (carId === opponentCarId) {
                                return <span className="block text-pink-400 text-xs font-bold mt-1">Selected by opponent</span>;
                            }
                            return null;
                        }}
                    />
                    {(!selectedCarId || !opponentCarId) && (
                        <p className="text-xl text-gray-400 mt-4">
                            {selectedCarId ? 'Waiting for opponent to select car...' : 'Please select your car to start!'}
                        </p>
                    )}
                    {selectedCarId && opponentCarId && gameState === 'waiting' && (
                         <p className="text-xl text-yellow-300 mt-4 animate-pulse">
                             Both cars selected. Waiting for race to start...
                         </p>
                    )}
                </>
            )}
            {showCountdown && (
                <div className="absolute inset-0 flex items-center justify-center z-40">
                    <p className={`text-9xl font-extrabold text-yellow-400 countdown-pop ${countdownNumber === 'GO!' ? 'text-green-400' : ''}`}>{countdownNumber}</p>
                </div>
            )}
            {(gameState === 'racing' || gameState === 'finished') && (
                <div className="flex flex-col w-full max-w-6xl bg-gray-800 rounded-xl shadow-2xl overflow-hidden h-[calc(100vh-160px)]">
                <div className="relative w-full h-1/2 overflow-hidden rounded-t-xl">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundPositionX: `${roadScrollX % SECTION_LENGTH_PX}px`,
                            backgroundImage: `url('/road_0.png')`,
                            backgroundRepeat: 'repeat-x',
                            backgroundSize: 'auto 100%',
                            width: '100%',
                        }}
                    >
                        {Array.from({ length: numRepetitions }).map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    left: `${i * SECTION_LENGTH_PX + (roadScrollX % SECTION_LENGTH_PX)}px`,
                                    width: `${SECTION_LENGTH_PX}px`,
                                    height: '100%',
                                    transform: `translateX(${roadScrollX > 0 ? -TOTAL_SCROLL_DISTANCE_PX : 0}px)`
                                }}
                            >
                                {renderBackgroundElements(0)}
                            </div>
                        ))}
                    </div>
                <div
                    className="absolute w-28 h-16 flex items-center justify-center text-sm font-bold z-30 transition-transform duration-500"
                    style={{
                        left: `${getCarOffsetAbsolute(userProgress, winner === 'You')}%`,
                        top: '10%',
                        transform: `translateY(0) translateX(${carShake}px)`,
                        transition: gameState === 'finished' ? 'left 1.2s cubic-bezier(0.4,1.4,0.6,1), transform 0.5s' : 'transform 0.2s',
                    }}
                >
                    <div
                        className="absolute left-[-30px] bottom-2 w-10 h-10 pointer-events-none"
                        style={{ zIndex: 1 }}
                    >
                        <div className="w-full h-full animate-smoke">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <ellipse cx="20" cy="30" rx="10" ry="6" fill="#bbb" opacity="0.7"/>
                                <ellipse cx="15" cy="35" rx="6" ry="4" fill="#ccc" opacity="0.5"/>
                            </svg>
                        </div>
                    </div>
                    {selectedCar && (
                        <Car3D
                            modelPath={selectedCar.modelPath}
                            position={{ x: 0, y: -0.7, z: 0 }}
                            rotation={Math.PI / 1.6}
                            scale={2.2}
                            className="w-full h-full"
                        />
                    )}
                </div>
                {playerNum && opponentCarId && (
                    <div
                        className="absolute w-28 h-16 flex items-center justify-center text-sm font-bold z-30 transition-transform duration-500"
                        style={{
                            left: `${getCarOffsetAbsolute(opponentProgress, winner !== 'You' && winner !== '' && winner !== 'Bot 1' && winner !== 'Bot 2')}%`,
                            top: '31%',
                            transition: 'left 0.5s ease-out, transform 0.5s ease-out'
                        }}
                    >
                        <div
                            className="absolute left-[-30px] bottom-2 w-10 h-10 pointer-events-none"
                            style={{ zIndex: 1 }}
                        >
                            <div className="w-full h-full animate-smoke">
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <ellipse cx="20" cy="30" rx="10" ry="6" fill="#bbb" opacity="0.7"/>
                                    <ellipse cx="15" cy="35" rx="6" ry="4" fill="#ccc" opacity="0.5"/>
                                </svg>
                            </div>
                        </div>
                        {(() => {
                            const opponentCar = carOptions.find(car => car.id === opponentCarId);
                            if (opponentCar) {
                                return (
                                    <Car3D
                                        modelPath={opponentCar.modelPath}
                                        position={{ x: 0, y: -0.7, z: 0 }}
                                        rotation={Math.PI / 1.6}
                                        scale={2.2}
                                        className="w-full h-full"
                                    />
                                );
                            } else {
                                return (
                                    <div className="w-full h-full bg-gray-500 rounded-full opacity-70 flex items-center justify-center">
                                        <span className="text-white">Opponent</span>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                )}
                {botCarIds.map((carId, i) => {
                    const botCar = carOptions.find(car => car.id === carId);
                    const botLaneTops = ['52%', '73%'];
                    const botWinnerName = `Bot ${i + 1}`;
                    return (
                        <div
                            key={carId}
                            className="absolute w-28 h-16 flex items-center justify-center text-sm font-bold z-20 transition-transform duration-500"
                            style={{
                                left: `${getCarOffsetAbsolute(botProgress[i], winner === botWinnerName)}%`,
                                top: botLaneTops[i],
                                transition: 'left 0.5s ease-out, transform 0.5s ease-out'
                            }}
                        >
                            <div
                                className="absolute left-[-30px] bottom-2 w-10 h-10 pointer-events-none"
                                style={{ zIndex: 1 }}
                            >
                                <div className="w-full h-full animate-smoke">
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <ellipse cx="20" cy="30" rx="10" ry="6" fill="#bbb" opacity="0.7"/>
                                        <ellipse cx="15" cy="35" rx="6" ry="4" fill="#ccc" opacity="0.5"/>
                                    </svg>
                                </div>
                            </div>
                            {botCar ? (
                                <Car3D
                                    modelPath={botCar.modelPath}
                                    position={{ x: 0, y: -0.7, z: 0 }}
                                    rotation={Math.PI / 1.6}
                                    scale={2.2}
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-500 rounded-full opacity-70 flex items-center justify-center">
                                    <span className="text-white">Bot</span>
                                </div>
                            )}
                        </div>
                    );
                })}
                </div>
                    <div className="w-full h-1/2 p-6 flex flex-col justify-center items-center bg-gray-700 rounded-b-xl">
                        <h2 className="text-3xl font-bold mb-6 text-yellow-300">Quiz Time!</h2>
                        <p className="text-xl mb-2 text-center">Question {questionsAnsweredCount + 1} of {quizQuestions.length}</p>
                        {currentQuestion ? (
                            <form onSubmit={handleSubmitQuiz} className="w-full max-w-sm">
                                <p className="text-2xl mb-4 text-center">{currentQuestion.question}</p>
                                <input
                                    ref={quizInputRef}
                                    type="text"
                                    value={userInput}
                                    onChange={e => setUserInput(e.target.value)}
                                    className={`w-full p-3 mb-4 text-lg rounded-md bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isQuestionCooldown ? 'animate-pulse-subtle' : ''}`}
                                    placeholder="Type your answer here..."
                                    autoComplete="off"
                                    disabled={gameState !== 'racing' || isQuestionCooldown}
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md shadow-lg transform transition duration-300 hover:scale-105 text-xl"
                                    disabled={gameState !== 'racing' || isQuestionCooldown}
                                >
                                    Submit Answer
                                </button>
                            </form>
                        ) : (
                            <p className="text-2xl mt-4 font-semibold text-green-400">
                                {gameState === 'racing' && questionsAnsweredCount >= quizQuestions.length
                                    ? "All questions answered! Awaiting race finish..."
                                    : "Quiz will start with the race!"
                                }
                            </p>
                        )}
                        {feedbackMessage && (
                            <p className={`text-xl mt-4 font-semibold ${feedbackMessage.includes('Correct') ? 'text-green-400' : 'text-red-400'}`}>
                                {feedbackMessage}
                            </p>
                        )}
                    </div>
                </div>
            )}
            <style>{`
                @keyframes cheer-fade {
                    0% { opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .animate-cheer-fade {
                    animation: cheer-fade 1.5s ease-out forwards;
                }

                @keyframes smoke-puff {
                    0% {
                        transform: translate(-50%, 0) scale(0.5);
                        opacity: 0;
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 0.7;
                    }
                    100% {
                        transform: translate(-50%, -100%) scale(1.5);
                        opacity: 0;
                    }
                }
                .animate-smoke {
                    animation: smoke-puff 1s ease-out infinite;
                }

                @keyframes pulse-subtle {
                    0%, 100% {
                        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
                    }
                    50% {
                        box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
                    }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 2s infinite;
                }

                @keyframes win-animation {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .animate-win {
                    animation: win-animation 0.5s ease-out; /* Apply once for visual pop */
                }

                @keyframes confetti-burst {
                    0% { opacity: 0; transform: scale(0.5); }
                    20% { opacity: 1; transform: scale(1); }
                    80% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(1.2); }
                }
                .animate-confetti-burst {
                    animation: confetti-burst 3s ease-out forwards;
                }

                @keyframes countdown-pop {
                    0% { transform: scale(0.5); opacity: 0; }
                    20% { opacity: 1; }
                    80% { transform: scale(1.2); opacity: 1; }
                    95% { opacity: 1; }
                    100% { transform: scale(1); opacity: 0; }
                }
                .countdown-pop {
                    animation: countdown-pop 1s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CarGameOnline;
