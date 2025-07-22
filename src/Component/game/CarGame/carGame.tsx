import React, { useState, useEffect, useRef, useCallback } from 'react';
// import './App.css'; // Import your CSS styles
import CarSelection from './CarSelection.tsx';
import Car3D from './Car3D.tsx';
import type { CarOption } from './CarSelection.tsx';

// Types
interface QuizQuestion {
    question: string;
    answer: string;
}

// Main App component
const CarGame = () => {
    // Game state variables
    const [userCarPosition, setUserCarPosition] = useState(0); // User car's horizontal progress (0 = start, 100 = finish)
    const [botCarsPositions, setBotCarsPositions] = useState([0, 0, 0]); // Progress for 3 bot cars
    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null); // Current quiz question
    const [userInput, setUserInput] = useState(''); // User's input for the quiz
    const [feedbackMessage, setFeedbackMessage] = useState(''); // Feedback for quiz answers
    const [gameStarted, setGameStarted] = useState(false); // Game started flag
    const [gameEnded, setGameEnded] = useState(false); // Game ended flag
    const [winner, setWinner] = useState(''); // Name of the winner
    const [userSpeedBoost, setUserSpeedBoost] = useState(0); // Temporary speed boost for user
    const [userBaseSpeed, setUserBaseSpeed] = useState(0.5); // Base speed for user car
    const [botBaseSpeed, setBotBaseSpeed] = useState(0.4); // Base speed for bot cars (slightly slower than user's base)
    const gameIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref to store the game loop interval
    const quizInputRef = useRef<HTMLInputElement>(null); // Ref for the quiz input field
    const [roadScrollX, setRoadScrollX] = useState(0); // State for road background horizontal scroll (world offset)
    const [isCheering, setIsCheering] = useState(false); // State for cheering animation
    const [isQuestionCooldown, setIsQuestionCooldown] = useState(false); // New state to manage question delay
    const [questionsAnsweredCount, setQuestionsAnsweredCount] = useState(0); // Track answered questions
    const [winningCarOffset, setWinningCarOffset] = useState(0); // New state for winning car's post-win offset
    const [showConfetti, setShowConfetti] = useState(false); // New state to control confetti animation
    const [showCountdown, setShowCountdown] = useState(false); // New state for countdown visibility
    const [countdownNumber, setCountdownNumber] = useState<number | 'GO!'>(3); // Countdown number, can be 'GO!'
    const [selectedCarId, setSelectedCarId] = useState<string>(''); // Selected car ID
    const [showCarSelection, setShowCarSelection] = useState(true); // Show car selection screen

    // Constants for visual positioning
    const USER_CAR_FIXED_SCREEN_LEFT = 20; // User car visually fixed at 20% from left of game area
    const TOTAL_SCROLL_DISTANCE_PX = 4000; // Increased total scroll distance to accommodate more repetitions
    const SECTION_LENGTH_PX = 800; // Length of one repeating section of background elements
    const GRASS_OFFSET_X = -200; // Offset for grass elements to appear to the left of the road

    // Car options data
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

    // Get selected car data
    const selectedCar = carOptions.find(car => car.id === selectedCarId);

    // Bot car models
    const botCarModels = [
        carOptions.find(car => car.id === 'race'),
        carOptions.find(car => car.id === 'sedan-sports'),
        carOptions.find(car => car.id === 'suv-luxury')
    ];

    // Array of simple quiz questions
    const quizQuestions: QuizQuestion[] = [
        { question: 'What is 5 + 7?', answer: '12' },
        // { question: 'What is the capital of France?', answer: 'Paris' },
        // { question: 'How many legs does a dog have?', answer: '4' },
        // { question: 'Is the sky blue? (yes/no)', answer: 'yes' },
        // { question: 'What is 10 * 3?', answer: '30' },
        // { question: 'Which planet is known as the Red Planet?', answer: 'Mars' },
        // { question: 'What is the opposite of "hot"?', answer: 'cold' },
        // { question: 'What is 20 / 4?', answer: '5' },
        // { question: 'What animal says "moo"?', answer: 'cow' },
        // { question: 'What color is a banana?', answer: 'yellow' },
    ];

    // Function to generate a random question
    const generateQuestion = useCallback(() => {
        // Check if all questions have been answered
        if (questionsAnsweredCount >= quizQuestions.length) {
            setGameEnded(true);
            // Determine winner based on current positions
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

    // Game loop function
    const gameLoop = useCallback(() => {
        if (gameEnded) return;

        // Update car progress (0-100%)
        setUserCarPosition(prevPos => prevPos + userBaseSpeed + userSpeedBoost);
        setBotCarsPositions(prevPositions => {
            return prevPositions.map(pos => pos + botBaseSpeed + (Math.random() * 0.1 - 0.05));
        });

        // Decay user speed boost over time
        setUserSpeedBoost(prevBoost => Math.max(0, prevBoost - 0.005));

        // Update road/world scroll based on user car's progress
        // As userCarPosition goes from 0 to 100, roadScrollX goes from 0 to -TOTAL_SCROLL_DISTANCE_PX
        setRoadScrollX(-(userCarPosition / 100) * TOTAL_SCROLL_DISTANCE_PX);

    }, [gameEnded, userBaseSpeed, userSpeedBoost, botBaseSpeed, userCarPosition]);

    // Effect to start and clear the game interval
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

    // Effect for winning car animation and confetti after game ends
    useEffect(() => {
        if (gameEnded && winner) {
            let animationProgress = 0;
            const animationDuration = 1500; // 1.5 seconds for the winning car to move forward
            const maxOffset = 50; // Move 50% further

            const interval = setInterval(() => {
                animationProgress += 50; // Increment by a small amount
                const currentOffset = (animationProgress / animationDuration) * maxOffset;

                if (animationProgress >= animationDuration) {
                    setWinningCarOffset(maxOffset);
                    clearInterval(interval);
                } else {
                    setWinningCarOffset(currentOffset);
                }
            }, 50); // Update every 50ms

            // Show confetti when game ends and winner is declared
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000); // Confetti lasts for 3 seconds

            return () => clearInterval(interval);
        }
    }, [gameEnded, winner]);

    // Effect for 3-2-1 countdown
    useEffect(() => {
        let countdownInterval: NodeJS.Timeout | null = null;
        if (showCountdown && countdownNumber !== 'GO!' && countdownNumber > 0) {
            countdownInterval = setInterval(() => {
                setCountdownNumber(prevNum => {
                    if (typeof prevNum === 'number' && prevNum > 1) {
                        return prevNum - 1;
                    } else if (prevNum === 1) {
                        return 'GO!'; // Change to 'GO!'
                    } else {
                        // This case should ideally not be reached if logic is correct
                        return 0;
                    }
                });
            }, 1000); // Update every 1 second
        } else if (showCountdown && countdownNumber === 'GO!') {
            // After 'GO!' is displayed, start the game
            setTimeout(() => {
                setShowCountdown(false);
                setGameStarted(true); // Start the game after countdown
                generateQuestion(); // Generate the first question
            }, 1000); // Display "GO!" for 1 second
        }

        return () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [showCountdown, countdownNumber, generateQuestion]);

    // Handle user input for the quiz
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
    };

    // Handle quiz submission
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

    // Start the game initiation (triggers countdown)
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
        setGameStarted(false); // Ensure gameStarted is false before countdown
        setCountdownNumber(3); // Initialize countdown number
        setShowCountdown(true); // Start the countdown
    };

    // Reset the game
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
        setShowCountdown(false); // Reset countdown state
        setCountdownNumber(3); // Reset countdown number
        setShowCarSelection(true); // Show car selection again
        setSelectedCarId(''); // Reset selected car
        if (gameIntervalRef.current) {
            clearInterval(gameIntervalRef.current);
        }
    };

    // Function to render a single set of static background elements
    const renderBackgroundElements = (offsetX: number) => (
        <>
            {/* Banner Towers */}
            {/* <img src="/images/bannerTowerGreen_NE.png" alt="Green Banner Tower" className="absolute h-1/2 top-1/4" style={{ left: `${offsetX + 100}px`, transform: 'translateY(-50%)', zIndex: 5 }} />
            <img src="/images/bannerTowerRed_NW.png" alt="Red Banner Tower" className="absolute h-1/2 top-1/4" style={{ left: `${offsetX + 400}px`, transform: 'translateY(-50%)', zIndex: 5 }} /> */}

            {/* Barriers */}
            <img src="/images/barrierRed_NE.png" alt="Red Barrier" className="absolute h-1/6 top-[-8%]" style={{ left: `${offsetX + 50}px`, zIndex: 5 }} />
            <img src="/images/barrierRed_NW.png" alt="Red Barrier" className="absolute h-1/6 top-[-8%]" style={{ left: `${offsetX + 250}px`, zIndex: 5 }} />
            <img src="/images/barrierRed_NW.png" alt="Red Barrier" className="absolute h-1/6 top-[-8%]" style={{ left: `${offsetX + 550}px`, zIndex: 5 }} />
            <img src="/images/barrierRed_NE.png" alt="Red Barrier" className="absolute h-1/6 bottom-[-4%]" style={{ left: `${offsetX + 100}px`, zIndex: 5 }} />
            <img src="/images/barrierRed_NE.png" alt="Red Barrier" className="absolute h-1/6 bottom-[-4%]" style={{ left: `${offsetX + 300}px`, zIndex: 5 }} />
            <img src="/images/barrierRed_NW.png" alt="Red Barrier" className="absolute h-1/6 bottom-[-4%]" style={{ left: `${offsetX + 570}px`, zIndex: 5 }} />

            {/* Light Colored (Traffic Lights) */}
            <img src="/images/lightColored_NE.png" alt="Traffic Light NE" className="absolute h-1/4 top-0" style={{ left: `${offsetX + 100}px`, transform: 'translateY(-50%)', zIndex: 5 }} />
            <img src="/images/lightColored_NW.png" alt="Traffic Light NW" className="absolute h-1/4 top-0" style={{ left: `${offsetX + 500}px`, transform: 'translateY(-50%)', zIndex: 5 }} />

            {/* Light Posts */}
            <img src="/images/lightPost_exclusive_SE.png" alt="Light Post SE" className="absolute h-1/2 bottom-[-19%]" style={{ left: `${offsetX + 300}px`, transform: 'translateY(-50%)', zIndex: 4 }} />
            <img src="/images/lightPost_exclusive_SW.png" alt="Light Post SW" className="absolute h-1/2 bottom-[-19%]" style={{ left: `${offsetX + 700}px`, transform: 'translateY(-50%)', zIndex: 4 }} />

            {/* Grass elements - positioned on the left side of the road */}
            {/* <img src="/images/grass_NE.png" alt="Grass NE" className="absolute h-1/3 top-1/2" style={{ left: `${offsetX + GRASS_OFFSET_X + 50}px`, transform: 'translateY(-50%)', zIndex: 4 }} />
            <img src="/images/grass_NW.png" alt="Grass NW" className="absolute h-1/3 top-1/2" style={{ left: `${offsetX + GRASS_OFFSET_X + 200}px`, transform: 'translateY(-50%)', zIndex: 4 }} />
            <img src="/images/grass_SE.png" alt="Grass SE" className="absolute h-1/3 bottom-0" style={{ left: `${offsetX + GRASS_OFFSET_X + 100}px`, transform: 'translateY(50%)', zIndex: 4 }} />
            <img src="/images/grass_SW.png" alt="Grass SW" className="absolute h-1/3 bottom-0" style={{ left: `${offsetX + GRASS_OFFSET_X + 300}px`, transform: 'translateY(50%)', zIndex: 4 }} /> */}
        </>
    );

    // Calculate number of repetitions needed for background elements
    const numRepetitions = Math.ceil(TOTAL_SCROLL_DISTANCE_PX / SECTION_LENGTH_PX) + 1; // +1 to ensure overlap for seamless loop

    // Car selection handlers
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

            {/* Winner Overlay - Appears on game end */}
            {gameEnded && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center z-50">
                    <p className="text-8xl font-extrabold text-yellow-300 mb-8 animate-bounce">
                        {winner === 'You' ? 'YOU WON!' : `${winner.toUpperCase()} WON!`}
                    </p>
                    {showConfetti && (
                        <img
                            src="/2979685.png" // Path to your confetti image
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

            {/* Car Selection Screen */}
            {showCarSelection && (
                <CarSelection
                    onCarSelect={handleCarSelect}
                    selectedCarId={selectedCarId}
                    onStartGame={handleStartGameFromSelection}
                />
            )}

            {/* Start Button & Game Area (conditional rendering) */}
            {!gameStarted && !gameEnded && !showCountdown && !showCarSelection && (
                <button
                    onClick={startGame}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition duration-300 hover:scale-105 text-2xl animate-pulse"
                >
                    Start Race!
                </button>
            )}

            {(gameStarted || showCountdown) && !gameEnded && ( // Show game area if game started or countdown is active
                <div className="flex flex-col w-full max-w-6xl bg-gray-800 rounded-xl shadow-2xl overflow-hidden h-[calc(100vh-160px)]">
                    {/* Game Area - Top Half of the container */}
                    <div className="relative w-full h-1/2 overflow-hidden rounded-t-xl">
                        {/* Scrolling World Container */}
                        <div
                            className="absolute inset-0"
                            style={{
                                transform: `translateX(${roadScrollX % SECTION_LENGTH_PX}px)`, // Loop the transform
                                width: `${TOTAL_SCROLL_DISTANCE_PX}px` // Ensure container is wide enough
                            }}
                        >
                            {/* 2D Road Background */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `url('/road_0.png')`,
                                    backgroundRepeat: 'repeat-x',
                                    backgroundSize: 'auto 100%',
                                    backgroundPositionX: `${roadScrollX}px`, // Road image scrolls with the world
                                    width: '100%', // Ensure it fills the scrolling container width
                                }}
                            ></div>

                            {/* Render multiple sets of static background elements */}
                            {Array.from({ length: numRepetitions }).map((_, i) => (
                                <div key={i} style={{ position: 'absolute', left: `${i * SECTION_LENGTH_PX}px`, width: `${SECTION_LENGTH_PX}px`, height: '100%' }}>
                                    {renderBackgroundElements(0)} {/* Pass 0 as offsetX since the parent div handles the offset */}
                                </div>
                            ))}

                        </div> {/* End Scrolling World Container */}

                        {/* 3-2-1 Countdown Display (inside game area) */}
                        {showCountdown && (
                            <div className="absolute inset-0 flex items-center justify-center z-40"> {/* Higher z-index than cars */}
                                <p className={`text-9xl font-extrabold text-yellow-400 countdown-pop ${countdownNumber === 'GO!' ? 'text-green-400' : ''}`}>
                                    {countdownNumber}
                                </p>
                            </div>
                        )}

                        {/* Audience Area (fixed relative to game area, on top of scrolling world) */}
                        <div className="absolute inset-x-0 top-0 h-1/6 flex items-center justify-center overflow-hidden z-20">
                            {isCheering && (
                                <img
                                    src="/image_5ad672.png"
                                    alt="Cheering Audience"
                                    className="w-full h-full object-contain animate-cheer-fade"
                                />
                            )}
                        </div>

                        {/* User Car (fixed relative to game area) */}
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
                            {/* Smoke animation for user car */}
                            {gameStarted && !gameEnded && (
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-8 h-4 bg-gray-400 rounded-full blur-sm opacity-0 animate-smoke" style={{ animationDelay: '0s' }}></div>
                            )}
                        </div>

                        {/* Bot Cars (positioned relative to user car's progress) */}
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
                                    {/* Smoke animation for bot cars */}
                                    {gameStarted && !gameEnded && (
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-8 h-4 bg-gray-400 rounded-full blur-sm opacity-0 animate-smoke" style={{ animationDelay: `${index * 0.2}s` }}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Quiz Area - Bottom Half of the container */}
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

            {/* CSS for animations */}
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
                .animate-countdown-pop {
                    animation: countdown-pop 1s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CarGame;
