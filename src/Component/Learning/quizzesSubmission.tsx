import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Server_url from '../../config.js';
import { FiVolume2 } from 'react-icons/fi';
import { FaCheckCircle, FaTimesCircle, FaFlag } from 'react-icons/fa';
import { useView } from '../../Context/ViewContext.tsx';

const QuizzesSubmission: React.FC = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useView();

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [translateOrder, setTranslateOrder] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<{ [key: number]: boolean }>({});
  const [matchSelections, setMatchSelections] = useState<{ left?: string; right?: string }>({});
  const [draggedToken, setDraggedToken] = useState<string | null>(null);
  const [matchupScoreShown, setMatchupScoreShown] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(Date.now());
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${Server_url}/api/lessons/lesson/${lessonId}/quizzes/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch quizzes');
        const data = await res.json();
        setQuizzes(data);
        setQuizStartTime(Date.now());
      } catch (err) {
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) {
      fetchQuizzes();
    }
  }, [lessonId]);

  const handleChoiceClick = (answer: any) => {
    setSelected(answer.id);
    setShowFeedback(answer.is_correct ? 'correct' : 'incorrect');
  };

  const handleTokenClick = (token: string) => {
    if (translateOrder.includes(token)) return;
    setTranslateOrder([...translateOrder, token]);
  };

  const handleRemoveToken = (idx: number) => {
    setTranslateOrder(translateOrder.filter((_, i) => i !== idx));
  };

  const handleDragStart = (token: string) => {
    setDraggedToken(token);
  };

  const handleDragEnd = () => {
    setDraggedToken(null);
  };

  const handleDrop = () => {
    const quiz = quizzes[currentIdx];
    if (
      draggedToken &&
      !translateOrder.includes(draggedToken) &&
      (!quiz.translate?.correct_words || translateOrder.length < quiz.translate.correct_words.length)
    ) {
      setTranslateOrder([...translateOrder, draggedToken]);
    }
    setDraggedToken(null);
  };

  const handleContinue = async (matchupData?: { correct: number, total: number, answers: any }) => {
    const quiz = quizzes[currentIdx];
    if (!quiz || !currentUser) return;

    const studentId = currentUser.id;
    const timeTakenSeconds = Math.floor((Date.now() - quizStartTime) / 1000);
    const timeTakenISO = `PT${timeTakenSeconds}S`;

    let answerPayload: any = {};
    let isCorrect = showFeedback === 'correct';

    if (quiz.exercise_type === 'multiple-choice') {
      answerPayload = { selected_option: selected };
    } else if (quiz.exercise_type === 'translate') {
      answerPayload = { translated_phrase: translateOrder.join(' ') };
      isCorrect = JSON.stringify(translateOrder) === JSON.stringify(quiz.translate.correct_words);
    } else if (quiz.exercise_type === 'word-match' && matchupData) {
      answerPayload = { word_match_pairs: matchupData.answers };
      isCorrect = matchupData.correct === matchupData.total;
    }

    try {
      await fetch(`${Server_url}/api/lessons/quiz/${quiz.id}/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          student: studentId,
          lesson: lessonId,
          time_taken: timeTakenISO,
          answer: answerPayload,
          passed: isCorrect,
        })
      });
    } catch (err) {
    }

    if (currentIdx < quizzes.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowFeedback(null);
      setSelected(null);
      setTranslateOrder([]);
      setMatchSelections({});
      setMatchedPairs({});
      setMatchupScoreShown(false);
      setQuizStartTime(Date.now());
    } else {
      setQuizCompleted(true);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <FaCheckCircle className="text-green-500" style={{ fontSize: 120 }} />
        <h1 className="text-4xl font-bold mt-8 mb-2 text-gray-900">Quiz Completed!</h1>
        <button
          className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          onClick={() => navigate(`/lesson/${lessonId}`)}
        >
          Back to Lesson
        </button>
      </div>
    );
  }

  const quiz = quizzes[currentIdx];
  if (!quiz) return <div className="min-h-screen flex items-center justify-center">No quizzes found.</div>;

  const progress = quizzes.length > 0 ? ((currentIdx + 1) / quizzes.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center justify-between px-12 pt-8">
        <span className="text-gray-600 font-semibold text-sm">QUIZ {currentIdx + 1}</span>
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

      <div className="flex flex-col items-center mt-12 mb-8">
        {quiz.exercise_type === 'multiple-choice' && quiz.multiple_choice && (
          <>
            <h2 className="text-xl font-semibold mb-8 text-gray-800 text-center">
              {quiz.multiple_choice.prompt}
            </h2>
            <div className="flex flex-col items-center mb-12">
              <button className="bg-gray-100 rounded-lg px-10 py-6 flex flex-col items-center gap-2 mb-2">
                <FiVolume2 className="text-2xl text-gray-500 mb-2" />
                <span className="text-lg font-semibold text-gray-700">
                  {quiz.multiple_choice.word_to_learn}
                </span>
              </button>
            </div>
            <div className="flex gap-8 justify-center">
              {quiz.multiple_choice.answers.map((answer: any) => {
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
        {quiz.exercise_type === 'translate' && quiz.translate && (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="bg-blue-100 border-2 border-blue-400 rounded-lg px-10 py-6 flex flex-col items-center gap-2 mb-2">
                <FiVolume2 className="text-2xl text-gray-500 mb-2" />
                {quiz.translate.image && (
                  <img
                    src={`${Server_url}${quiz.translate.image}`}
                    alt="exercise"
                    className="w-32 h-32 object-contain rounded-xl mb-2"
                  />
                )}
                <span className="text-lg font-semibold text-gray-700">
                  {quiz.translate.phrase_to_translate}
                </span>
                {quiz.translate.prompt && (
                  <span className="text-base text-gray-600">
                    {quiz.translate.prompt}
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
              {translateOrder.length === 0 && (
                <span className="text-gray-400 px-4 py-2">Drag words here</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {quiz.translate.display_words &&
                quiz.translate.display_words
                  .filter((token: string) => !translateOrder.includes(token))
                  .map((token: string, idx: number) => (
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
                  quiz.translate &&
                  JSON.stringify(translateOrder) === JSON.stringify(quiz.translate.correct_words)
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
        {quiz.exercise_type === 'word-match' && quiz.word_match?.matches && (
          <>
            <div className="flex flex-col items-center mb-8">
              <h3 className="text-lg font-semibold mb-4">{quiz.word_match.prompt || "Match the accurate translation"}</h3>
              <MatchupStep
                pairs={quiz.word_match.matches}
                isLastExercise={currentIdx === quizzes.length - 1}
                onContinue={(data) => handleContinue(data)}
                onScoreShown={() => setMatchupScoreShown(true)}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between px-12 pb-8 mt-auto">
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
        <div className="flex-1" />
        <div className="flex gap-4">
          <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-6 py-2 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition">
            <FaFlag className="text-gray-400" /> Report
          </button>
        </div>
        <div>
          {(quiz.exercise_type === 'multiple-choice' || quiz.exercise_type === 'translate') && showFeedback !== null && (
            <button
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                showFeedback === 'correct'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
              onClick={() => handleContinue()}
            >
              {currentIdx === quizzes.length - 1 ? 'Finish Quiz' : 'Continue Quiz'}
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
  onContinue: (data: { correct: number, total: number, answers: any }) => void,
  onScoreShown: () => void,
}> = ({ pairs, isLastExercise, onContinue, onScoreShown }) => {
  const [currentPairIdx, setCurrentPairIdx] = useState(0);
  const [selectedDefs, setSelectedDefs] = useState<{ [pairId: string]: string }>({});
  const [showScore, setShowScore] = useState(false);

  const allDefs = React.useMemo(() => [...pairs].sort(() => 0.5 - Math.random()).map(p => p.definition), [pairs]);
  const allTerms = React.useMemo(() => [...pairs].sort(() => 0.5 - Math.random()).map(p => p.term), [pairs]);

  useEffect(() => {
    if (showScore) {
      onScoreShown();
    }
  }, [showScore, onScoreShown]);

  const handleDefClick = (def: string) => {
    if (showScore) return;
    const pair = pairs[currentPairIdx];
    setSelectedDefs(prev => {
      const updated = { ...prev, [pair.id]: def };
      if (currentPairIdx === pairs.length - 1) {
        setShowScore(true);
      } else {
        setCurrentPairIdx(currentPairIdx + 1);
      }
      return updated;
    });
  };

  const handleFinalContinue = () => {
    const correctCount = pairs.filter(p => selectedDefs[p.id] === p.definition).length;
    const answers = pairs.map(p => ({ term: p.term, selected_definition: selectedDefs[p.id] || "" }));
    onContinue({ correct: correctCount, total: pairs.length, answers });
  };

  let feedbackText = '';
  let feedbackColor = '';
  let feedbackIcon = null;
  if (showScore) {
    const correctCount = pairs.filter(p => selectedDefs[p.id] === p.definition).length;
    if (correctCount === pairs.length) {
      feedbackText = 'Fantastic!';
      feedbackColor = 'text-green-600';
      feedbackIcon = <FaCheckCircle />;
    } else if (correctCount > 0) {
      feedbackText = 'Good!';
      feedbackColor = 'text-blue-600';
      feedbackIcon = <FaCheckCircle />;
    } else {
      feedbackText = 'Incorrect!';
      feedbackColor = 'text-red-600';
      feedbackIcon = <FaTimesCircle />;
    }
  }

  return (
    <div className="w-full relative min-h-[350px] flex flex-col justify-between">
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
                const isSelected = Object.values(selectedDefs).includes(def);
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
            <div className={`flex items-center justify-center gap-2 font-semibold text-lg mb-4 ${feedbackColor}`}>
              {feedbackIcon} {feedbackText}
            </div>
            <div className="grid grid-cols-2 gap-8 w-full">
              <div>
                {pairs.map(pair => (
                  <div key={pair.id} className="mb-4">
                    <button
                      className="w-[400px] bg-blue-50 border border-blue-300 rounded-lg px-6 py-4 text-left font-semibold"
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
                      className={`w-[400px] bg-gray-50 border rounded-lg px-6 py-4 text-left font-semibold ${
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
            <button
              className="mt-8 bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg"
              onClick={handleFinalContinue}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesSubmission;