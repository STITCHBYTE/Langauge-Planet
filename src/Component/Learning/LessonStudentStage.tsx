import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Server_url from '../../config.js';
import { FiVolume2 } from 'react-icons/fi';
import { FaCheckCircle, FaTimesCircle, FaFlag } from 'react-icons/fa';

type MultipleChoiceAnswer = {
  id: string;
  text: string;
  is_correct: boolean;
  image?: string;
};

type MatchPair = {
  left: string;
  right: string;
};

type Exercise = {
  id: string;
  title: string;
  prompt: string;
  word_to_learn?: string;
  image?: string;
  exercise_type: 'multiple-choice' | 'matchup' | 'translate';
  multiple_choice?: {
    answers: MultipleChoiceAnswer[];
  };
  match_pairs?: MatchPair[];
  translate?: {
    tokens: string[];
    correct: string[];
  };
};

const LessonStudentStage: React.FC = () => {
  const { stageId } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [translateOrder, setTranslateOrder] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<{ [key: number]: boolean }>({});
  const [matchSelections, setMatchSelections] = useState<{ left?: string; right?: string }>({}); // <-- Move here
  const [draggedToken, setDraggedToken] = useState<string | null>(null);
  const [matchupScoreShown, setMatchupScoreShown] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([]);
  const [totalCorrectPairs, setTotalCorrectPairs] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${Server_url}/api/lessons/stage/${stageId}/exercises/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch exercises');
        const data = await res.json();
        console.log(data);
        setExercises(data);
      } catch (err) {
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [stageId]);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);


  // When finished, set endTime
  useEffect(() => {
    if (currentIdx === exercises.length) {
      setEndTime(Date.now());
    }
  }, [currentIdx, exercises.length]);

  // Calculate accuracy and time
  const totalNonPairExercises = exercises.filter(
    ex => ex.exercise_type !== 'matchup' && ex.exercise_type !== 'word-match'
  ).length;

  const totalPossible = totalPairs + totalNonPairExercises;
  const totalCorrect = totalCorrectPairs + correctCount; // correctCount for non-pair exercises

  const accuracy = totalPossible > 0 ? Math.round((totalCorrect / totalPossible) * 100) : 0;
  const timeTaken = endTime ? Math.floor((endTime - startTime) / 1000) : 0;
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
console.log(correctCount, exercises.length, accuracy, timeTaken, formattedTime);
  // Completion screen
  if (stageCompleted) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="mb-8">
            <FaCheckCircle className="text-green-500" style={{ fontSize: 120 }} />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Stage Completed</h1>
          <p className="text-lg text-gray-500 mb-8">Nice job finishing your first stage for this lesson</p>
          <div className="flex gap-8 mb-12">
            <div className="bg-white border rounded-xl shadow px-8 py-6 flex flex-col items-center">
              <span className="text-4xl font-bold text-gray-900 mb-2">{accuracy}%</span>
              <span className="text-base text-gray-500">Accuracy</span>
            </div>
            <div className="bg-white border rounded-xl shadow px-8 py-6 flex flex-col items-center">
              <span className="text-4xl font-bold text-gray-900 mb-2">{formattedTime}</span>
              <span className="text-base text-gray-500">Time</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 right-12 flex gap-4">
          <button
            className="border border-blue-600 text-blue-600 font-semibold px-8 py-3 rounded-lg bg-white hover:bg-blue-50 transition"
            onClick={() => setStageCompleted(false)}
          >
            Back to Lesson
          </button>
          <button
            className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            onClick={() => navigate('/next-stage-url')}
          >
            Start Stage 2
          </button>
        </div>
      </div>
    );
  }

  const exercise = exercises[currentIdx];

  // Prevent rendering main UI if exercise is undefined
  if (!exercise) {
    return null;
  }

  const progress = ((currentIdx + 1) / exercises.length) * 100;

  // Multiple Choice Handlers
  const handleChoiceClick = (answer: MultipleChoiceAnswer) => {
    setSelected(answer.id);
    setShowFeedback(answer.is_correct ? 'correct' : 'incorrect');
  };

  // Translate Handlers
  const handleTokenClick = (token: string) => {
    if (translateOrder.includes(token)) return;
    setTranslateOrder([...translateOrder, token]);
  };
  const handleRemoveToken = (idx: number) => {
    setTranslateOrder(translateOrder.filter((_, i) => i !== idx));
  };
  const checkTranslate = () => {
    if (
      exercise.translate &&
      JSON.stringify(translateOrder) === JSON.stringify(exercise.translate.correct)
    ) {
      setShowFeedback('correct');
    } else {
      setShowFeedback('incorrect');
    }
  };

  // Matchup Handlers
  const handleMatchClick = (side: 'left' | 'right', value: string) => {
    setMatchSelections(prev => ({ ...prev, [side]: value }));
  };
  const checkMatch = () => {
    if (
      exercise.match_pairs &&
      exercise.match_pairs.every(
        (pair, idx) =>
          matchSelections[`left${idx}`] === pair.left &&
          matchSelections[`right${idx}`] === pair.right
      )
    ) {
      setShowFeedback('correct');
    } else {
      setShowFeedback('incorrect');
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (token: string) => {
    setDraggedToken(token);
  };

  const handleDragEnd = () => {
    setDraggedToken(null);
  };

  const handleDrop = () => {
    if (
      draggedToken &&
      !translateOrder.includes(draggedToken) &&
      (!exercise.translate?.correct_words || translateOrder.length < exercise.translate.correct_words.length)
    ) {
      setTranslateOrder([...translateOrder, draggedToken]);
    }
    setDraggedToken(null);
  };

  // Next Exercise
  const handleContinue = () => {
    if (showFeedback === 'correct') {
      setCorrectCount(prev => prev + 1);
    }
    setShowFeedback(null);
    setSelected(null);
    setTranslateOrder([]);
    setMatchSelections({});
    setMatchedPairs({});
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setStageCompleted(true);
    }
  };

  // UI
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Bar & Header */}
      <div className="flex items-center justify-between px-12 pt-8">
        <span className="text-gray-600 font-semibold text-sm">STAGE 1</span>
        <div className="w-2/3 h-2 bg-gray-200 rounded-full relative overflow-hidden">
          <div
            className="absolute left-0 top-0 h-2 bg-blue-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button
          className="text-gray-400 text-2xl font-bold"
          onClick={() => navigate(-1)}
          title="Close"
        >
          &times;
        </button>
      </div>

      {/* Prompt */}
      <div className="flex flex-col items-center mt-12 mb-8">
        {/* <h2 className="text-xl font-semibold mb-8 text-gray-800 text-center">
          {exercise.prompt || "Can you guess the meaning of the word below?"}
        </h2> */}

        {/* MULTIPLE CHOICE */}
        {exercise.exercise_type === 'multiple-choice' && (
          <>
          <h2 className="text-xl font-semibold mb-8 text-gray-800 text-center">
              {exercise.multiple_choice?.prompt || "Can you guess the meaning of the word below?"}
            </h2>
            <div className="flex flex-col items-center mb-12">
              <button className="bg-gray-100 rounded-lg px-10 py-6 flex flex-col items-center gap-2 mb-2">
                <FiVolume2 className="text-2xl text-gray-500 mb-2" />
                <span className="text-lg font-semibold text-gray-700">
                  {exercise.multiple_choice?.word_to_learn}
                </span>
              </button>
            </div>
            
            <div className="flex gap-8 justify-center">
              {exercise.multiple_choice?.answers.map(answer => {
                const isSelected = selected === answer.id;
                const isCorrect = showFeedback && answer.is_correct;
                const isIncorrect = showFeedback && isSelected && !answer.is_correct;
                return (
                  <div
                    key={answer.id}
                    className={`flex flex-col items-center rounded-xl border w-56 cursor-pointer transition
                      ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
                      ${isCorrect ? 'border-green-500 bg-green-50' : ''}
                      ${isIncorrect ? 'border-red-500 bg-red-50' : ''}
                    `}
                    onClick={() => !showFeedback && handleChoiceClick(answer)}
                  >
                    {answer.image && (
                      <img
                        src={`${Server_url}${answer.image}`}
                        alt={answer.text}
                        className="w-40 h-40 object-contain rounded-t-xl"
                      />
                    )}
                    <div
                      className={`w-full text-center py-3 rounded-b-xl font-medium text-gray-700
                        ${isCorrect ? 'bg-green-500 text-white' : ''}
                        ${isIncorrect ? 'bg-red-500 text-white' : ''}
                        ${isSelected && !showFeedback ? 'bg-blue-100' : 'bg-blue-50'}
                      `}
                    >
                      {answer.text}
                    </div>
                    {isCorrect && (
                      <FaCheckCircle className="absolute top-2 right-2 text-green-500 text-2xl" />
                    )}
                    {isIncorrect && (
                      <FaTimesCircle className="absolute top-2 right-2 text-red-500 text-2xl" />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* TRANSLATE */}
        {exercise.exercise_type === 'translate' && (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="bg-blue-100 border-2 border-blue-400 rounded-lg px-10 py-6 flex flex-col items-center gap-2 mb-2">
                <FiVolume2 className="text-2xl text-gray-500 mb-2" />
                {/* Show image inside the box if present */}
                {exercise.translate.image && (
                  <img
                    src={`${Server_url}${exercise.translate.image}`}
                    alt="exercise"
                    className="w-32 h-32 object-contain rounded-xl mb-2"
                  />
                )}
                {/* Show prompt inside the box */}
                <span className="text-lg font-semibold text-gray-700">
                  {exercise.phrase_to_translate}
                </span>
                {/* If you have a prompt field for translate */}
                {exercise.translate?.prompt && (
                  <span className="text-base text-gray-600">
                    {exercise.translate.prompt}
                  </span>
                )}
              </div>
            </div>
            <div
              className="flex flex-wrap gap-2 justify-center mb-6 min-h-[48px] border-b border-gray-200"
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              {translateOrder.map((token, idx) => (
                <button
                  key={idx}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold"
                  onClick={() => handleRemoveToken(idx)}
                >
                  {token}
                </button>
              ))}
              {/* Show a placeholder if empty */}
              {translateOrder.length === 0 && (
                <span className="text-gray-400 px-4 py-2">Drag words here</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {exercise.translate && Array.isArray(exercise.translate.display_words) &&
                exercise.translate.display_words
                  .filter(token => !translateOrder.includes(token))
                  .map((token, idx) => (
                    <button
                      key={idx}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold"
                      draggable
                      onDragStart={() => handleDragStart(token)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleTokenClick(token)}
                    >
                      {token}
                    </button>
                  ))
              }
            </div>
            <button
              className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={() => {
                if (
                  exercise.translate &&
                  JSON.stringify(translateOrder) === JSON.stringify(exercise.translate.correct_words)
                ) {
                  setShowFeedback('correct');
                } else {
                  setShowFeedback('incorrect');
                }
              }}
              disabled={showFeedback !== null || translateOrder.length === 0}
            >
              Submit Answer
            </button>
          </>
        )}

        {/* MATCHUP */}
        {(exercise.exercise_type === 'matchup' || exercise.exercise_type === 'word-match') && exercise.word_match?.matches && (
          <>
            <div className="flex flex-col items-center mb-8">
              <h3 className="text-lg font-semibold mb-4">{exercise.word_match.prompt || "Match the accurate translation"}</h3>
              {/* Step-by-step matching */}
              <MatchupStep
                pairs={exercise.word_match.matches}
                isLastExercise={currentIdx === exercises.length - 1}
                onContinue={handleContinue}
                onScoreShown={() => setMatchupScoreShown(true)}
                onPairsEvaluated={(correct, total) => {
                  setTotalCorrectPairs(prev => prev + correct);
                  setTotalPairs(prev => prev + total);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Feedback & Footer */}
      <div className="flex items-center justify-between px-12 pb-8 mt-auto">
        {/* Feedback */}
        {showFeedback === 'correct' && (
          <div className="flex items-center gap-2 text-green-600 font-semibold text-lg">
            <FaCheckCircle /> Fantastic!
          </div>
        )}
        {showFeedback === 'incorrect' && (
          <div className="flex items-center gap-2 text-red-600 font-semibold text-lg">
            <FaTimesCircle /> Incorrect!
          </div>
        )}

        {/* Left buttons */}
        <div className="flex gap-4">
          <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-6 py-2 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition">
            <FaFlag className="text-gray-400" /> Report
          </button>
        </div>

        {/* Right button */}
        <div>
          {/* MCQ and Translate logic unchanged */}
          {(exercise.exercise_type === 'multiple-choice' || exercise.exercise_type === 'translate') && (
            showFeedback !== null ? (
              <button
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  showFeedback === 'correct'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                onClick={handleContinue}
              >
                {currentIdx === exercises.length - 1
                  ? showFeedback === 'correct'
                    ? 'Finish Learning'
                    : 'Continue Learning'
                  : 'Continue Learning'}
              </button>
            ) : (
              <button
                className="border border-gray-300 rounded-lg px-6 py-2 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition"
                onClick={handleContinue}
              >
                Skip Exercise
              </button>
            )
          )}
          {/* Matchup: show button only when score is shown */}
          {(exercise.exercise_type === 'matchup' || exercise.exercise_type === 'word-match') && matchupScoreShown && (
            <button
              className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition"
              onClick={handleContinue}
            >
              {currentIdx === exercises.length - 1
                ? 'Finish Learning'
                : 'Continue Learning'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MatchupStep: React.FC<{
  pairs: { id: string; term: string; definition: string }[],
  isLastExercise: boolean,
  onContinue: () => void,
  onScoreShown: () => void,
  onPairsEvaluated?: (correct: number, total: number) => void
}> = ({ pairs, isLastExercise, onContinue, onScoreShown, onPairsEvaluated }) => {
  const [currentPairIdx, setCurrentPairIdx] = useState(0);
  const [selectedDefs, setSelectedDefs] = useState<{ [pairId: string]: string }>({});
  const [showScore, setShowScore] = useState(false);

  const allDefs = pairs.map(pair => pair.definition);
  const allMatched = Object.keys(selectedDefs).length === pairs.length;
  const correctCount = pairs.filter(pair => selectedDefs[pair.id] === pair.definition).length;

  useEffect(() => {
    if (showScore) {
      onScoreShown();
    }
  }, [showScore, onScoreShown]);

  useEffect(() => {
    if (showScore && typeof onPairsEvaluated === 'function') {
      onPairsEvaluated(correctCount, pairs.length);
    }
  }, [showScore, onPairsEvaluated, correctCount, pairs.length]);

  const handleDefClick = (def: string) => {
    if (showScore) return;
    const pair = pairs[currentPairIdx];
    setSelectedDefs(prev => {
      const updated = { ...prev, [pair.id]: def };
      // If this was the last pair, auto-check
      if (currentPairIdx === pairs.length - 1) {
        setShowScore(true);
      } else {
        setCurrentPairIdx(currentPairIdx + 1);
      }
      return updated;
    });
  };

  const handleCheck = () => {
    setShowScore(true);
  };

  // Feedback text and color/icon
  let feedbackText = '';
  let feedbackColor = '';
  let feedbackIcon = null;
  if (showScore) {
    if (correctCount === 0) {
      feedbackText = 'Incorrect!';
      feedbackColor = 'text-red-600';
      feedbackIcon = <FaTimesCircle />;
    } else if (correctCount === 1) {
      feedbackText = 'Good!';
      feedbackColor = 'text-blue-600';
      feedbackIcon = <FaCheckCircle />;
    } else if (correctCount === 2) {
      feedbackText = 'Excellent!';
      feedbackColor = 'text-green-600';
      feedbackIcon = <FaCheckCircle />;
    } else if (correctCount === 3) {
      feedbackText = 'Fantastic!';
      feedbackColor = 'text-green-600';
      feedbackIcon = <FaCheckCircle />;
    }
  }

  return (
    <div className="w-full relative min-h-[350px] flex flex-col justify-between" style={{ minHeight: 'calc(100vh - 250px)' }}>
      <div>
        {!showScore ? (
          <div className="grid grid-cols-2 gap-8">
            <div>
              {pairs.slice(0, currentPairIdx + 1).map(pair => (
                <div key={pair.id} className="mb-4">
                  <button
                    className={`w-[400px] bg-blue-50 border rounded-lg px-6 py-4 text-left font-semibold flex items-center gap-2 ${
                      selectedDefs[pair.id] ? 'border-green-500 bg-green-100 text-green-700' : 'border-blue-300'
                    }`}
                    disabled
                  >
                    {pair.term}
                  </button>
                </div>
              ))}
            </div>
            <div>
              {allDefs.map(def => {
                const selectedFor = Object.entries(selectedDefs).find(([pairId, d]) => d === def);
                const isSelected = !!selectedFor;
                return (
                  <div key={def} className="mb-4">
                    <button
                      className={`w-[400px] bg-gray-50 border rounded-lg px-6 py-4 text-left font-semibold flex items-center gap-2 ${
                        isSelected
                          ? 'border-green-500 bg-green-100 text-green-700 cursor-not-allowed opacity-80'
                          : 'border-gray-300'
                      }`}
                      onClick={() => !isSelected && handleDefClick(def)}
                      disabled={isSelected || !!selectedDefs[pairs[currentPairIdx].id]}
                    >
                      {def}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Feedback UI same as MCQ */}
            <div className={`flex items-center justify-center gap-2 font-semibold text-lg mb-4 ${feedbackColor}`}>
              {feedbackIcon} {feedbackText}
            </div>
            <div className="grid grid-cols-2 gap-8 w-full">
              <div>
                {pairs.map(pair => (
                  <div key={pair.id} className="mb-4">
                    <button
                      className="w-[400px] bg-blue-50 border border-blue-300 rounded-lg px-6 py-4 text-left font-semibold flex items-center gap-2"
                      disabled
                    >
                      {pair.term}
                    </button>
                  </div>
                ))}
              </div>
              <div>
                {pairs.map(pair => (
                  <div key={pair.id} className="mb-4">
                    <button
                      className={`w-[400px] bg-gray-50 border border-gray-300 rounded-lg px-6 py-4 text-left font-semibold flex items-center gap-2 ${
                        selectedDefs[pair.id] === pair.definition
                          ? 'border-green-500 bg-green-100 text-green-700'
                          : 'border-red-500 bg-red-100 text-red-700'
                      }`}
                      disabled
                    >
                      {selectedDefs[pair.id] || <span className="text-gray-400">Not selected</span>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Buttons always at the page bottom, all in one row */}
      {/* <div className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-12 pb-8">
        <div className="flex gap-4">
          <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-6 py-2 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition">
            <FaFlag className="text-gray-400" /> Report
          </button>
          <button
            className="border border-gray-300 rounded-lg px-6 py-2 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition"
            onClick={onContinue}
          >
            Skip Exercise
          </button>
        </div>
        <div>
          {(!showScore && allMatched) ? (
            <button
              className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition"
              onClick={handleCheck}
            >
              Check
            </button>
          ) : showScore ? (
            <button
              className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition"
              onClick={onContinue}
            >
              {isLastExercise
                ? 'Finish Learning'
                : 'Continue Learning'}
            </button>
          ) : null}
        </div>
      </div> */}
    </div>
  );
};

export default LessonStudentStage;