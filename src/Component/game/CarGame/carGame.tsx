import React, { useState, useEffect, useRef, useCallback } from 'react';

import CarSelection from './CarSelection.tsx';
import Car3D from './Car3D.tsx';
import type { CarOption } from './CarSelection.tsx';


interface QuizQuestion {
    question: string;
    answer: string;
}


const CarGame = () => {
    
    const [userCarPosition, setUserCarPosition] = useState(0); 
    const [botCarsPositions, setBotCarsPositions] = useState([0, 0, 0]); 
    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null); 
    const [userInput, setUserInput] = useState(''); 
    const [feedbackMessage, setFeedbackMessage] = useState(''); 
    const [gameStarted, setGameStarted] = useState(false); 
    const [gameEnded, setGameEnded] = useState(false); 
    const [winner, setWinner] = useState(''); 
    const [userSpeedBoost, setUserSpeedBoost] = useState(0); 
    const [userBaseSpeed, setUserBaseSpeed] = useState(0.5); 
    const [botBaseSpeed, setBotBaseSpeed] = useState(0.4); 
    const gameIntervalRef = useRef<NodeJS.Timeout | null>(null); 
    const quizInputRef = useRef<HTMLInputElement>(null); 
    const [roadScrollX, setRoadScrollX] = useState(0); 
    const [isCheering, setIsCheering] = useState(false); 
    const [isQuestionCooldown, setIsQuestionCooldown] = useState(false); 
    const [questionsAnsweredCount, setQuestionsAnsweredCount] = useState(0); 
    const [winningCarOffset, setWinningCarOffset] = useState(0); 
    const [showConfetti, setShowConfetti] = useState(false); 
    const [showCountdown, setShowCountdown] = useState(false); 
    const [countdownNumber, setCountdownNumber] = useState<number | 'GO!'>(3); 
    const [selectedCarId, setSelectedCarId] = useState<string>(''); 
    const [showCarSelection, setShowCarSelection] = useState(true); 

    
    const USER_CAR_FIXED_SCREEN_LEFT = 20; 
    const TOTAL_SCROLL_DISTANCE_PX = 4000; 
    const SECTION_LENGTH_PX = 800; 
    const GRASS_OFFSET_X = -200; 

    
    const carOptions: CarOption[] = [
        {
            id: 'race',
            name: 'Race Car',
            modelPath: '/kenney_car-kit/Models/GLB%20format/race.glb',
            previewImage: '/red-truck.svg',
            color: 'bg-red-500'
        },
        {
            id: 'race-future',
            name: 'Future Racer',
            modelPath: '/kenney_car-kit/Models/GLB%20format/race-future.glb',
            previewImage: '/blue-green-truck-mini.svg',
            color: 'bg-blue-500'
        },
        {
            id: 'sedan-sports',
            name: 'Sports Sedan',
            modelPath: '/kenney_car-kit/Models/GLB%20format/sedan-sports.glb',
            previewImage: '/orange-van.svg',
            color: 'bg-orange-500'
        },
        {
            id: 'suv-luxury',
            name: 'Luxury SUV',
            modelPath: '/kenney_car-kit/Models/GLB%20format/suv-luxury.glb',
            previewImage: '/black-truck.svg',
            color: 'bg-gray-800'
        },
        {
            id: 'police',
            name: 'Police Car',
            modelPath: '/kenney_car-kit/Models/GLB%20format/police.glb',
            previewImage: '/white-dumper.svg',
            color: 'bg-blue-900'
        },
        {
            id: 'van',
            name: 'Racing Van',
            modelPath: '/kenney_car-kit/Models/GLB%20format/van.glb',
            previewImage: '/yellow-mini-truck.svg',
            color: 'bg-yellow-500'
        }
    ];

    
    const selectedCar = carOptions.find(car => car.id === selectedCarId);

    
    const botCarModels = [
        carOptions.find(car => car.id === 'race'),
        carOptions.find(car => car.id === 'sedan-sports'),
        carOptions.find(car => car.id === 'suv-luxury')
    ];

    
    const quizQuestions: QuizQuestion[] = [
        { question: 'What is 5 + 7?', answer: '12' },
        
        
        
        
        
        
        
        
        
    ];

    
    const generateQuestion = useCallback(() => {
        
        if (questionsAnsweredCount >= quizQuestions.length) {
            setGameEnded(true);
            
            const finalPositions = [userCarPosition, ...botCarsPositions];
            const maxPos = Math.max(...finalPositions);
            if (userCarPosition === maxPos) {
                setWinner('You');
            } else {
                const winningBotIndex = botCarsPositions.findIndex(pos => pos === maxPos);
                setWinner(`Bot ${winningBotIndex + 1}`);
            }
            if (gameIntervalRef.current) {
                clearInterval(gameIntervalRef.current);
            }
            return;
        }

        const randomIndex = Math.floor(Math.random() * quizQuestions.length);
        setCurrentQuestion(quizQuestions[randomIndex]);
        setUserInput('');
        setFeedbackMessage('');
        setIsQuestionCooldown(false);
        setTimeout(() => {
            if (quizInputRef.current) {
                quizInputRef.current.focus();
            }
        }, 0);
    }, [quizQuestions, questionsAnsweredCount, userCarPosition, botCarsPositions]);

    
    const gameLoop = useCallback(() => {
        if (gameEnded) return;

        
        setUserCarPosition(prevPos => prevPos + userBaseSpeed + userSpeedBoost);
        setBotCarsPositions(prevPositions => {
            return prevPositions.map(pos => pos + botBaseSpeed + (Math.random() * 0.1 - 0.05));
        });

        
        setUserSpeedBoost(prevBoost => Math.max(0, prevBoost - 0.005));

        
        
        setRoadScrollX(-(userCarPosition / 100) * TOTAL_SCROLL_DISTANCE_PX);

    }, [gameEnded, userBaseSpeed, userSpeedBoost, botBaseSpeed, userCarPosition]);

    
    useEffect(() => {
        if (gameStarted && !gameEnded) {
            gameIntervalRef.current = setInterval(gameLoop, 50);
        } else if (gameEnded) {
            if (gameIntervalRef.current) {
                clearInterval(gameIntervalRef.current);
            }
        }
        return () => {
            if (gameIntervalRef.current) {
                clearInterval(gameIntervalRef.current);
            }
        };
    }, [gameStarted, gameEnded, gameLoop]);

    
    useEffect(() => {
        if (gameEnded && winner) {
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
    }, [gameEnded, winner]);

    
    useEffect(() => {
        let countdownInterval: NodeJS.Timeout | null = null;
        if (showCountdown && countdownNumber !== 'GO!' && countdownNumber > 0) {
            countdownInterval = setInterval(() => {
                setCountdownNumber(prevNum => {
                    if (typeof prevNum === 'number' && prevNum > 1) {
                        return prevNum - 1;
                    } else if (prevNum === 1) {
                        return 'GO!'; 
                    } else {
                        
                        return 0;
                    }
                });
            }, 1000); 
        } else if (showCountdown && countdownNumber === 'GO!') {
            
            setTimeout(() => {
                setShowCountdown(false);
                setGameStarted(true); 
                generateQuestion(); 
            }, 1000); 
        }

        return () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [showCountdown, countdownNumber, generateQuestion]);

    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
    };

    
    const handleSubmitQuiz = (e: React.FormEvent) => {
        e.preventDefault();
        if (isQuestionCooldown) return;

        setIsQuestionCooldown(true);

        if (currentQuestion && userInput.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()) {
            setFeedbackMessage('Correct! Speed boost activated!');
            setUserSpeedBoost(prev => prev + 3.0);
            setIsCheering(true);
            setTimeout(() => setIsCheering(false), 1500);
            setQuestionsAnsweredCount(prevCount => prevCount + 1);
            setTimeout(() => generateQuestion(), 2000);
        } else {
            setFeedbackMessage('Incorrect. Try again!');
            setUserSpeedBoost(prev => Math.max(0, prev - 0.5));
            setIsCheering(false);
            setQuestionsAnsweredCount(prevCount => prevCount + 1);
            setTimeout(() => generateQuestion(), 2000);
        }
    };

    
    const startGame = () => {
        setUserCarPosition(0);
        setBotCarsPositions([0, 0, 0]);
        setRoadScrollX(0);
        setGameEnded(false);
        setWinner('');
        setUserSpeedBoost(0);
        setQuestionsAnsweredCount(0);
        setWinningCarOffset(0);
        setShowConfetti(false);
        setGameStarted(false); 
        setCountdownNumber(3); 
        setShowCountdown(true); 
    };

    
    const resetGame = () => {
        setGameStarted(false);
        setGameEnded(false);
        setUserCarPosition(0);
        setBotCarsPositions([0, 0, 0]);
        setRoadScrollX(0);
        setWinner('');
        setUserSpeedBoost(0);
        setCurrentQuestion(null);
        setUserInput('');
        setFeedbackMessage('');
        setIsCheering(false);
        setIsQuestionCooldown(false);
        setQuestionsAnsweredCount(0);
        setWinningCarOffset(0);
        setShowConfetti(false);
        setShowCountdown(false); 
        setCountdownNumber(3); 
        setShowCarSelection(true); 
        setSelectedCarId(''); 
        if (gameIntervalRef.current) {
            clearInterval(gameIntervalRef.current);
        }
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
            <img src="/images/lightPost_exclusive_SE.png" alt="Light Post SE" className="absolute h-1/2 bottom-[-19%]" style={{ left: `${offsetX + 300}px`, transform: 'translateY(-50%)', zIndex: 4 }} />
            <img src="/images/lightPost_exclusive_SW.png" alt="Light Post SW" className="absolute h-1/2 bottom-[-19%]" style={{ left: `${offsetX + 700}px`, transform: 'translateY(-50%)', zIndex: 4 }} />
            </>
    );

    
    const numRepetitions = Math.ceil(TOTAL_SCROLL_DISTANCE_PX / SECTION_LENGTH_PX) + 1; 

    
    const handleCarSelect = (carId: string) => {
        setSelectedCarId(carId);
    };

    const handleStartGameFromSelection = () => {
        if (selectedCarId) {
            setShowCarSelection(false);
            setShowCountdown(true);
            setCountdownNumber(3);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-inter flex flex-col items-center justify-center p-4">
            <h1 className="text-5xl font-extrabold mb-8 text-yellow-400 drop-shadow-lg">Language Planet</h1>
            {gameEnded && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center z-50">
                    <p className="text-8xl font-extrabold text-yellow-300 mb-8 animate-bounce">
                        {winner === 'You' ? 'YOU WON!' : `${winner.toUpperCase()} WON!`}
                    </p>
                    {showConfetti && (
                        <img
                            src="/2979685.png" 
                            alt="Confetti"
                            className="absolute inset-0 w-full h-full object-cover animate-confetti-burst"
                        />
                    )}
                    <button
                        onClick={resetGame}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition duration-300 hover:scale-105 text-2xl mt-8"
                    >
                        Play Again
                    </button>
                </div>
            )}
            {showCarSelection && (
                <CarSelection
                    onCarSelect={handleCarSelect}
                    selectedCarId={selectedCarId}
                    onStartGame={handleStartGameFromSelection}
                />
            )}
            {!gameStarted && !gameEnded && !showCountdown && !showCarSelection && (
                <button
                    onClick={startGame}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition duration-300 hover:scale-105 text-2xl animate-pulse"
                >
                    Start Race!
                </button>
            )}

            {(gameStarted || showCountdown) && !gameEnded && ( 
                <div className="flex flex-col w-full max-w-6xl bg-gray-800 rounded-xl shadow-2xl overflow-hidden h-[calc(100vh-160px)]">
                    <div className="relative w-full h-1/2 overflow-hidden rounded-t-xl">
                        <div
                            className="absolute inset-0"
                            style={{
                                transform: `translateX(${roadScrollX % SECTION_LENGTH_PX}px)`, 
                                width: `${TOTAL_SCROLL_DISTANCE_PX}px` 
                            }}
                        >
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `url('/road_0.png')`,
                                    backgroundRepeat: 'repeat-x',
                                    backgroundSize: 'auto 100%',
                                    backgroundPositionX: `${roadScrollX}px`, 
                                    width: '100%', 
                                }}
                            ></div>
                            {Array.from({ length: numRepetitions }).map((_, i) => (
                                <div key={i} style={{ position: 'absolute', left: `${i * SECTION_LENGTH_PX}px`, width: `${SECTION_LENGTH_PX}px`, height: '100%' }}>
                                    {renderBackgroundElements(0)}
                                </div>
                            ))}

                        </div>
                        {showCountdown && (
                            <div className="absolute inset-0 flex items-center justify-center z-40">
                                <p className={`text-9xl font-extrabold text-yellow-400 countdown-pop ${countdownNumber === 'GO!' ? 'text-green-400' : ''}`}>
                                    {countdownNumber}
                                </p>
                            </div>
                        )}
                        <div className="absolute inset-x-0 top-0 h-1/6 flex items-center justify-center overflow-hidden z-20">
                            {isCheering && (
                                <img
                                    src="/image_5ad672.png"
                                    alt="Cheering Audience"
                                    className="w-full h-full object-contain animate-cheer-fade"
                                />
                            )}
                        </div>
                        <div
                            className="absolute w-28 h-16 flex items-center justify-center text-sm font-bold z-1"
                            style={{
                                left: `${USER_CAR_FIXED_SCREEN_LEFT + (gameEnded && winner === 'You' ? winningCarOffset : 0)}%`,
                                top: '27%',
                                transition: 'left 0.5s ease-out, transform 0.5s ease-out'
                            }}
                        >
                            {selectedCar ? (
                                <Car3D 
                                    modelPath={selectedCar.modelPath}
                                    position={{ x: 1.2, y: -0.7, z: 0 }}
                                    rotation={Math.PI / 1.6}
                                    scale={2.2}
                                    className="w-full h-full"
                                />
                            ) : (
                                <Car3D 
                                    modelPath={carOptions[1].modelPath}
                                    position={{ x: 0, y: -0.7, z: 0 }}
                                    rotation={Math.PI / 1.6}
                                    scale={2.2}
                                    className="w-full h-full"
                                />
                            )}
                            {gameStarted && !gameEnded && (
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-8 h-4 bg-gray-400 rounded-full blur-sm opacity-0 animate-smoke" style={{ animationDelay: '0s' }}></div>
                            )}
                        </div>
                        {botCarsPositions.map((pos, index) => {
                            let botEffectiveLeft = `max(0%, calc(${USER_CAR_FIXED_SCREEN_LEFT}% + ${(pos - userCarPosition)}%))`;
                            if (gameEnded && winner === `Bot ${index + 1}`) {
                                const currentVisualLeft = USER_CAR_FIXED_SCREEN_LEFT + (pos - userCarPosition);
                                botEffectiveLeft = `${currentVisualLeft + winningCarOffset}%`;
                            }

                            const botCar = botCarModels[index];

                            return (
                                <div
                                    key={index}
                                    className="absolute w-28 h-16 flex items-center justify-center text-sm font-bold z-1"
                                    style={{
                                        left: botEffectiveLeft,
                                        top: index === 0 ? '8%' : index === 1 ? '48%' : '71%',
                                        transition: 'left 0.5s ease-out, transform 0.5s ease-out'
                                    }}
                                >
                                    {botCar && (
                                        <Car3D 
                                            modelPath={botCar.modelPath}
                                            position={{ x: 0, y: -0.7, z: 0 }}
                                            rotation={Math.PI / 1.6}
                                            scale={2.2}
                                            className="w-full h-full"
                                        />
                                    )}
                                    {gameStarted && !gameEnded && (
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-8 h-4 bg-gray-400 rounded-full blur-sm opacity-0 animate-smoke" style={{ animationDelay: `${index * 0.2}s` }}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="w-full h-1/2 p-6 flex flex-col justify-center items-center bg-gray-700 rounded-b-xl">
                        <h2 className="text-3xl font-bold mb-6 text-yellow-300">Quiz Time!</h2>
                        <p className="text-xl mb-2 text-center">Question {questionsAnsweredCount + 1} of {quizQuestions.length}</p>
                        {currentQuestion && (
                            <form onSubmit={handleSubmitQuiz} className="w-full max-w-sm">
                                <p className="text-2xl mb-4 text-center">{currentQuestion.question}</p>
                                <input
                                    ref={quizInputRef}
                                    type="text"
                                    value={userInput}
                                    onChange={handleInputChange}
                                    className={`w-full p-3 mb-4 text-lg rounded-md bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isQuestionCooldown ? 'animate-pulse-subtle' : ''}`}
                                    placeholder="Type your answer here..."
                                    autoComplete="off"
                                    disabled={gameEnded || isQuestionCooldown}
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md shadow-lg transform transition duration-300 hover:scale-105 text-xl"
                                    disabled={gameEnded || isQuestionCooldown}
                                >
                                    Submit Answer
                                </button>
                            </form>
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
                    animation: win-animation 0.5s ease-out;
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
                .animate-countdown-pop {
                    animation: countdown-pop 1s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CarGame;
