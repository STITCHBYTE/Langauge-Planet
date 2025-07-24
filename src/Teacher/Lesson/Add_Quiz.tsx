import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Header from '../../Component/Home/Header.tsx';
import { Navigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Server_url from '../../config.js';
import { useNavigate } from 'react-router-dom';

type ExerciseType = 'multiple-choice' | 'word-match' | 'translate';
interface BaseExercise { id: string; title: string; type: ExerciseType; }
interface MultipleChoiceAnswer { id: string; text: string; isCorrect: boolean; imageUrl?: string; imageFile?: File; } 
interface MultipleChoiceExercise extends BaseExercise { type: 'multiple-choice'; prompt: string; wordToLearn: string; answers: MultipleChoiceAnswer[]; }
interface WordMatchPair { id: string; term: string; definition: string; }
interface WordMatchExercise extends BaseExercise { type: 'word-match'; prompt: string; matches: WordMatchPair[]; }
interface TranslateExercise extends BaseExercise {
    type: 'translate';
    prompt: string;
    phraseToTranslate: string;
    imageFile?: File | null; 
    imageUrl?: string; 
    correctWords: string[];
    wrongWords: string[];
    displayWords: string[];
}
type Exercise = MultipleChoiceExercise | WordMatchExercise | TranslateExercise;

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const speak = (text: string, lang: string = 'en-US') => {
  if (!text.trim()) return;
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } else {
    toast.error("Sorry, your browser doesn't support text-to-speech.");
  }
};

const MultipleChoiceEditor: React.FC<{ exercise: MultipleChoiceExercise, onUpdate: (updatedExercise: Exercise) => void }> = ({ exercise, onUpdate }) => {
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const setAnswerAsCorrect = (answerId: string) => {
        const updatedAnswers = exercise.answers.map(ans => ({ ...ans, isCorrect: ans.id === answerId }));
        onUpdate({ ...exercise, answers: updatedAnswers });
    };
    const handleAnswerTextChange = (answerId: string, text: string) => {
        const updatedAnswers = exercise.answers.map(ans => 
            ans.id === answerId ? { ...ans, text } : ans
        );
        onUpdate({ ...exercise, answers: updatedAnswers });
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, answerId: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedAnswers = exercise.answers.map(ans => 
                    ans.id === answerId 
                        ? { ...ans, imageUrl: reader.result as string, imageFile: file } 
                        : ans
                );
                onUpdate({ ...exercise, answers: updatedAnswers });
            };
            reader.readAsDataURL(file);
        }
    };
    const triggerFileInput = (answerId: string) => fileInputRefs.current[answerId]?.click();

    return (
        <div className="space-y-6">
            <input type="text" placeholder="Enter the prompt for this exercise here" className="w-full p-3 border border-slate-300 rounded-lg text-sm" value={exercise.prompt} onChange={e => onUpdate({ ...exercise, prompt: e.target.value })}/>
            <div className="text-center bg-slate-100 p-6 rounded-lg">
                <button onClick={() => speak(exercise.wordToLearn, 'en-US')} className="text-2xl text-slate-500 hover:text-blue-600">🔊</button>
                <input type="text" placeholder="Enter the word to learn here" className="w-full bg-transparent text-center text-lg font-semibold text-slate-700 p-2 mt-2 focus:outline-none" value={exercise.wordToLearn} onChange={e => onUpdate({ ...exercise, wordToLearn: e.target.value })} />
            </div>
            <div>
                <h3 className="font-semibold text-slate-700">Answers</h3>
                <p className="text-sm text-slate-500">Provide the possible answers for this exercise and select one correct answer</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {exercise.answers.map(answer => (
                    <div key={answer.id} className="text-center">
                         <div className="relative mb-2">
                             <input type="radio" name="correct-answer" checked={answer.isCorrect} onChange={() => setAnswerAsCorrect(answer.id)} className="absolute top-2 right-2 h-5 w-5 z-20"/>
                            <input type="file" accept="image/*" className="hidden" ref={el => { fileInputRefs.current[answer.id] = el; }} onChange={(e) => handleImageUpload(e, answer.id)} />
                             <div onClick={() => triggerFileInput(answer.id)} className="flex flex-col items-center justify-center h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg overflow-hidden cursor-pointer">
                                {answer.imageUrl ? (<img src={answer.imageUrl} alt="Upload preview" className="h-full w-full object-cover" />) : (<><svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1m6-5l-1.5 1.5" /></svg><span className="text-xs text-slate-500 mt-1">Drag & drop or click to upload</span></>)}
                            </div>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Enter Possible Answer" 
                            className="w-full text-center p-2 border border-slate-300 rounded-lg text-sm"
                            value={answer.text}
                            onChange={(e) => handleAnswerTextChange(answer.id, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const WordMatchEditor: React.FC<{ exercise: WordMatchExercise, onUpdate: (updatedExercise: Exercise) => void }> = ({ exercise, onUpdate }) => {
    const handleShuffle = () => onUpdate({ ...exercise, matches: shuffleArray(exercise.matches) });
    const handleMatchChange = (id: string, field: 'term' | 'definition', value: string) => {
        const updatedMatches = exercise.matches.map(match => match.id === id ? { ...match, [field]: value } : match);
        onUpdate({ ...exercise, matches: updatedMatches });
    };
    const handleAddNewMatch = () => {
        const newMatch = { id: `m-${Date.now()}`, term: '', definition: ''};
        onUpdate({ ...exercise, matches: [...exercise.matches, newMatch] });
    };
    const handleDeleteMatch = (id: string) => {
        const updatedMatches = exercise.matches.filter(match => match.id !== id);
        onUpdate({ ...exercise, matches: updatedMatches });
    };

    return (
        <div className="space-y-6">
            <input type="text" placeholder="Match the accurate translation" className="w-full text-center p-3 border-b border-slate-300 text-lg font-semibold" value={exercise.prompt} onChange={e => onUpdate({ ...exercise, prompt: e.target.value })}/>
            <div>
                <h3 className="font-semibold text-slate-700">Matches</h3>
                <p className="text-sm text-slate-500">Add 3 or more matches and shuffle them.</p>
            </div>
            <div className="space-y-3">
                {exercise.matches.map(match => (
                    <div key={match.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5 flex items-center p-3 bg-blue-100 border border-blue-300 rounded-lg">
                            <button onClick={() => speak(match.term, 'es-ES')} className="text-lg text-slate-600 mr-3 hover:text-blue-600">🔊</button>
                            <input type="text" value={match.term} onChange={(e) => handleMatchChange(match.id, 'term', e.target.value)} className="w-full bg-transparent font-medium focus:outline-none"/>
                        </div>
                        <div className="col-span-5 flex items-center p-3 bg-slate-100 border border-slate-300 rounded-lg">
                            <input type="text" value={match.definition} onChange={(e) => handleMatchChange(match.id, 'definition', e.target.value)} className="w-full bg-transparent font-medium focus:outline-none"/>
                        </div>
                        <div className="col-span-2 flex justify-center">
                             <button onClick={() => handleDeleteMatch(match.id)} className="text-slate-400 hover:text-red-500 p-2">🗑️</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center">
                <button onClick={handleAddNewMatch} className="text-sm font-semibold text-blue-600">+ Add New Match</button>
                <button onClick={handleShuffle} disabled={exercise.matches.length < 2} className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg disabled:opacity-50">Shuffle Matches</button>
            </div>
        </div>
    );
};

const AddWordInput: React.FC<{ onAdd: (word: string) => void, onCancel: () => void }> = ({ onAdd, onCancel }) => {
    const [word, setWord] = useState('');
    const handleAddClick = () => { if (word.trim()) { onAdd(word.trim()); setWord(''); } };
    return (
        <div className="bg-slate-100 border border-blue-500 rounded px-1 py-1 text-sm text-slate-600 flex items-center gap-1 relative">
            <input type="text" value={word} onChange={(e) => setWord(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddClick()} className="bg-transparent focus:outline-none w-full px-2" autoFocus />
            <button onClick={handleAddClick} className="text-green-600 hover:text-green-500 font-bold p-1">✓</button>
            <button onClick={onCancel} className="absolute -top-2 -right-2 bg-white rounded-full text-red-500 text-xs w-4 h-4 flex items-center justify-center border">x</button>
        </div>
    );
};

const WordBlock: React.FC<{ word: string, onRemove: () => void }> = ({ word, onRemove }) => (
    <div className="bg-slate-100 border border-slate-200 rounded px-3 py-1 text-sm text-slate-600 relative group">
        {word}
        <button onClick={onRemove} className="absolute -top-2 -right-2 bg-white rounded-full text-red-500 text-xs w-4 h-4 items-center justify-center border hidden group-hover:flex">x</button>
    </div>
);

const TranslateEditor: React.FC<{ exercise: TranslateExercise, onUpdate: (updatedExercise: Exercise) => void }> = ({ exercise, onUpdate }) => {
    const [isAddingCorrect, setIsAddingCorrect] = useState(false);
    const [isAddingWrong, setIsAddingWrong] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleAddWord = (type: 'correct' | 'wrong', word: string) => {
        if (type === 'correct') { onUpdate({...exercise, correctWords: [...exercise.correctWords, word]}); setIsAddingCorrect(false); } 
        else { onUpdate({...exercise, wrongWords: [...exercise.wrongWords, word]}); setIsAddingWrong(false); }
    };
    const handleRemoveWord = (type: 'correct' | 'wrong', index: number) => {
        if (type === 'correct') { onUpdate({...exercise, correctWords: exercise.correctWords.filter((_, i) => i !== index)}); } 
        else { onUpdate({...exercise, wrongWords: exercise.wrongWords.filter((_, i) => i !== index)}); }
    };
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => onUpdate({ ...exercise, imageUrl: reader.result as string, imageFile: file }); 
        }
    };
    const handleShuffle = () => onUpdate({ ...exercise, displayWords: shuffleArray(exercise.displayWords) });
    useEffect(() => {
        onUpdate({ ...exercise, displayWords: shuffleArray([...exercise.correctWords, ...exercise.wrongWords]) });
    }, [exercise.correctWords.join(','), exercise.wrongWords.join(',')]);

    return (
        <div className="space-y-6">
             <input type="text" placeholder="Write this in English" className="w-full text-center p-3 border-b border-slate-300 text-lg font-semibold" value={exercise.prompt} onChange={e => onUpdate({ ...exercise, prompt: e.target.value })} />
            <div className="text-center">
                 <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                 <div onClick={() => fileInputRef.current?.click()} className="w-48 h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg mx-auto flex items-center justify-center cursor-pointer overflow-hidden">
                     {exercise.imageUrl ? (<img src={exercise.imageUrl} alt="Upload preview" className="h-full w-full object-cover" />) : (<><svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1m6-5l-1.5 1.5" /></svg></>)}
                 </div>
                <div className="bg-blue-100 inline-block p-3 rounded-lg mt-[-1.5rem] relative">
                    <button onClick={() => speak(exercise.phraseToTranslate, 'es-ES')} className="text-lg text-slate-600 mr-2 hover:text-blue-600">🔊</button>
                    <input type="text" value={exercise.phraseToTranslate} onChange={e => onUpdate({ ...exercise, phraseToTranslate: e.target.value })} placeholder="Enter phrase to translate" className="font-semibold bg-transparent focus:outline-none text-center" />
                </div>
            </div>
            <div className="space-y-4">
                <div>
                     <h3 className="font-semibold text-slate-700">Accurate Answer*</h3>
                     <p className="text-sm text-slate-500">Add the words that form the correct answer.</p>
                     <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {exercise.correctWords.map((word, i) => <WordBlock key={`${word}-${i}`} word={word} onRemove={() => handleRemoveWord('correct', i)} />)}
                        {isAddingCorrect ? (<AddWordInput onAdd={(word) => handleAddWord('correct', word)} onCancel={() => setIsAddingCorrect(false)} />) : (<button onClick={() => setIsAddingCorrect(true)} className="h-8 w-8 border-2 border-dashed border-slate-400 rounded text-slate-500">+</button>)}
                     </div>
                </div>
                 <div>
                     <h3 className="font-semibold text-slate-700">Wrong Answer*</h3>
                     <p className="text-sm text-slate-500">Add distractor words.</p>
                     <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {exercise.wrongWords.map((word, i) => <WordBlock key={`${word}-${i}`} word={word} onRemove={() => handleRemoveWord('wrong', i)} />)}
                         {isAddingWrong ? (<AddWordInput onAdd={(word) => handleAddWord('wrong', word)} onCancel={() => setIsAddingWrong(false)} />) : (<button onClick={() => setIsAddingWrong(true)} className="h-8 w-8 border-2 border-dashed border-slate-400 rounded text-slate-500">+</button>)}
                     </div>
                </div>
                 <div>
                     <h3 className="font-semibold text-slate-700">Display Options</h3>
                     <p className="text-sm text-slate-500">These are the shuffled words the student will see.</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {exercise.displayWords.map((word, index) => <div key={`${word}-${index}`} className="bg-slate-100 border border-slate-200 rounded px-3 py-1 text-sm text-slate-600">{word}</div>)}
                     </div>
                </div>
            </div>
             <div className="text-right">
                <button onClick={handleShuffle} disabled={exercise.displayWords.length < 2} className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg disabled:opacity-50">Shuffle Words</button>
            </div>
        </div>
    );
};

const SelectExerciseTypeModal: React.FC<{ isOpen: boolean; onClose: () => void; onSelect: (type: ExerciseType) => void; }> = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;
    const exerciseTypes = [{ name: 'Multiple Choice', type: 'multiple-choice', icon: '🟰' }, { name: 'Word Match', type: 'word-match', icon: '⇄' }, { name: 'Translate', type: 'translate', icon: '文' }];
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl p-8" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-semibold text-center mb-6">Select Exercise Type</h2>
                <div className="flex gap-6">
                    {exerciseTypes.map(({ name, type, icon }) => (<button key={type} onClick={() => onSelect(type as ExerciseType)} className="text-center p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50"><div className="flex items-center justify-center h-20 w-20 bg-slate-100 rounded-lg text-4xl mb-3">{icon}</div><span className="font-medium text-slate-700">{name}</span></button>))}
                </div>
            </div>
        </div>
    );
};

const EnterTitleModal: React.FC<{ isOpen: boolean; onClose: () => void; onCreate: (title: string) => void; }> = ({ isOpen, onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const handleCreate = () => {
        if (title.trim()) {
            onCreate(title.trim());
            setTitle('');
        }
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Enter Exercise Title</h2>
                <input
                    type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Vocabulary Match"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    autoFocus onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-300 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-50">
                        Cancel
                    </button>
                    <button onClick={handleCreate} disabled={!title.trim()} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        Create Exercise
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddQuizPage: React.FC = () => {
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
    const [pendingExerciseType, setPendingExerciseType] = useState<ExerciseType | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
    const navigate = useNavigate();
    const lesson_id = useParams<{ lesson_id: string }>();
    const openCreateExerciseFlow = () => {
        setIsTypeModalOpen(true);
    };

    const handleSelectExerciseType = (type: ExerciseType) => {
        setPendingExerciseType(type);
        setIsTypeModalOpen(false);
        setIsTitleModalOpen(true);
    };

    const handleCreateExerciseWithTitle = (title: string) => {
        if (!pendingExerciseType) return;
        const newId = `ex-${Date.now()}`;
        let newExercise: Exercise;
        switch (pendingExerciseType) {
            case 'multiple-choice':
                newExercise = { id: newId, type: 'multiple-choice', title, prompt: '', wordToLearn: '', answers: [{id: 'a1', text: '', isCorrect: true}, {id: 'a2', text: '', isCorrect: false}, {id: 'a3', text: '', isCorrect: false}] };
                break;
            case 'word-match':
                newExercise = { id: newId, type: 'word-match', title, prompt: 'Match the pairs', matches: [] };
                break;
            case 'translate':
                newExercise = { id: newId, type: 'translate', title, prompt: 'Write this in English', phraseToTranslate: '', imageUrl: '', correctWords: [], wrongWords: [], displayWords: [] };
                break;
        }
        setExercises(prev => [...prev, newExercise]);
        setActiveExerciseId(newId);
        setIsTitleModalOpen(false);
        setPendingExerciseType(null);
    };
    
    const handleUpdateExercise = (updatedExercise: Exercise) => {
        setExercises(prev => prev.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    };

    const handleDeleteExercise = (exerciseId: string) => {
        if (activeExerciseId === exerciseId) setActiveExerciseId(null);
        setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
        setOpenMenuId(null);
    };

    const handleTitleChange = (exerciseId: string, newTitle: string) => {
        setExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, title: newTitle } : ex));
    };
    
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const activeExercise = exercises.find(ex => ex.id === activeExerciseId);

    const handleSaveQuiz = async () => {
        if (exercises.length === 0) {
            toast.error("Please create at least one exercise before saving the quiz.");
            return;
        }

        const token = localStorage.getItem('authToken');
        let savedCount = 0;
        let failedCount = 0;
        const totalExercises = exercises.length;

        for (const ex of exercises) {
            let response;
            const endpoint = `${Server_url}/api/lessons/lesson/${lesson_id.lesson_id}/quiz/add/`;

            try {
                if (ex.type === 'multiple-choice') {
                    const hasImageInAnswers = ex.answers.some(ans => ans.imageFile);

                    if (hasImageInAnswers) {
                        const formData = new FormData();
                        formData.append('title', ex.title);
                        formData.append('exercise_type', 'multiple-choice');
                        formData.append('lesson', lesson_id.lesson_id!);
                        formData.append('multiple_choice', JSON.stringify({
                            prompt: ex.prompt,
                            word_to_learn: ex.wordToLearn,
                        }));

                        const answersMetadata = ex.answers.map((ans, idx) => ({
                            text: ans.text,
                            is_correct: ans.isCorrect,
                            image: ans.imageFile ? `answer_${idx}_image` : null,
                        }));
                        formData.append('answers', JSON.stringify(answersMetadata));

                        ex.answers.forEach((ans, idx) => {
                            if (ans.imageFile) {
                                formData.append(`answer_${idx}_image`, ans.imageFile);
                            }
                        });
                        
                        for (let pair of formData.entries()) { 
                            if (pair[1] instanceof File) {
                            } else {
                            }
                        }

                        response = await fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: formData,
                        });

                    } else {
                        const exercisePayload = {
                            title: ex.title,
                            exercise_type: 'multiple-choice',
                            lesson: lesson_id.lesson_id,
                            multiple_choice: {
                                prompt: ex.prompt,
                                word_to_learn: ex.wordToLearn,
                            },
                            answers: ex.answers.map(ans => ({
                                text: ans.text,
                                is_correct: ans.isCorrect,
                                image: null, 
                            })),
                        };

                        response = await fetch(endpoint, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(exercisePayload),
                        });
                    }
                } else if (ex.type === 'word-match') {
                    const exercisePayload = {
                        title: ex.title,
                        exercise_type: 'word-match',
                        lesson: lesson_id.lesson_id,
                        word_match: {
                            prompt: ex.prompt,
                        },
                        word_match_pairs: ex.matches.map(pair => ({
                            term: pair.term,
                            definition: pair.definition,
                        })),
                    };

                    response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(exercisePayload),
                    });
                } else if (ex.type === 'translate') {
                    if (ex.imageFile) {
                        const formData = new FormData();
                        formData.append('title', ex.title);
                        formData.append('exercise_type', 'translate');
                        formData.append('lesson', lesson_id.lesson_id!);

                        formData.append('translate', JSON.stringify({
                            prompt: ex.prompt,
                            phrase_to_translate: ex.phraseToTranslate,
                            correct_words: ex.correctWords,
                            wrong_words: ex.wrongWords,
                            display_words: ex.displayWords,
                            image: 'image', 
                        }));
                        
                        formData.append('image', ex.imageFile);

                        for (let pair of formData.entries()) { 
                            if (pair[1] instanceof File) {
                            } else {
                            }
                        }

                        response = await fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: formData,
                        });
                    } else {
                        const exercisePayload = {
                            title: ex.title,
                            exercise_type: 'translate',
                            lesson: lesson_id.lesson_id,
                            translate: {
                                prompt: ex.prompt,
                                phrase_to_translate: ex.phraseToTranslate,
                                correct_words: ex.correctWords,
                                wrong_words: ex.wrongWords,
                                display_words: ex.displayWords,
                                image: null, 
                            },
                        };

                        response = await fetch(endpoint, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(exercisePayload),
                        });
                    }
                }

                if (response && response.ok) {
                    savedCount++;
                } else if (response) {
                    failedCount++;
                    const errorData = await response.text();
                } else {
                    failedCount++;
                }

            } catch (error) {
                failedCount++;
            }
        }

        if (failedCount === 0 && savedCount === totalExercises) {
            toast.success(`All ${savedCount} exercises saved successfully!`);
            navigate(`/lesson-view/${lesson_id.lesson_id}`);
        } else if (savedCount > 0) {
            toast.warning(`${savedCount} exercises saved, ${failedCount} failed. Check console for details.`);
        } else if (totalExercises > 0) {
            toast.error(`Failed to save any of the ${totalExercises} exercises. Check console for details.`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <div className="flex flex-1">
              <div className="hidden lg:block w-64 bg-white border-r border-gray-200">
                <Sidebar />
              </div>
              <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col">
                <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
                  <SelectExerciseTypeModal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} onSelect={handleSelectExerciseType} />
                  <EnterTitleModal isOpen={isTitleModalOpen} onClose={() => setIsTitleModalOpen(false)} onCreate={handleCreateExerciseWithTitle} />

                  <div className="flex items-center text-sm mb-6 text-slate-500 flex-wrap">
                    <a href="#" className="flex items-center text-gray-500 hover:text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      Go Back
                    </a>
                    <span className="mx-2">/</span><span>Lesson</span><span className="mx-2">/</span><span>Basic Spanish</span><span className="mx-2">/</span><span className="text-blue-600 font-medium">Add Quiz</span>
                  </div>

                  <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-end items-center border-b border-slate-200 pb-4 mb-6 gap-3">
                      <button className="w-full sm:w-auto px-5 py-2 bg-white border border-slate-300 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
                      <button className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700" onClick={handleSaveQuiz}>Save Quiz</button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                      <div className="lg:w-1/3 w-full mb-8 lg:mb-0">
                        <h3 className="font-semibold text-slate-800">All Quiz Exercises</h3>
                        <p className="text-sm text-slate-500 mb-4">Create & manage exercises from this panel</p>
                        <div className="space-y-2">
                          {exercises.map(ex => (
                            <div key={ex.id} className="relative">
                              <div className={`w-full text-left p-3 rounded-lg flex justify-between items-center ${activeExerciseId === ex.id ? 'bg-blue-100' : 'bg-white hover:bg-slate-50'}`}>
                                {editingExerciseId === ex.id ? (
                                  <input type="text" value={ex.title} autoFocus className="font-medium text-sm text-slate-700 bg-transparent focus:outline-none border-b-2 border-blue-500 w-full" onChange={(e) => handleTitleChange(ex.id, e.target.value)} onBlur={() => setEditingExerciseId(null)} onKeyDown={(e) => { if (e.key === 'Enter') setEditingExerciseId(null) }} />
                                ) : (
                                  <span onClick={() => setActiveExerciseId(ex.id)} className="font-medium text-sm text-slate-700 flex-grow cursor-pointer">{ex.title}</span>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === ex.id ? null : ex.id); }} className="text-slate-400 p-1 hover:bg-slate-200 rounded-full flex-shrink-0">⋮</button>
                              </div>
                              {openMenuId === ex.id && (
                                <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-md shadow-lg z-10 py-1 w-28">
                                  <button onClick={(e) => { e.stopPropagation(); setEditingExerciseId(ex.id); setOpenMenuId(null); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Rename</button>
                                  <button onClick={() => handleDeleteExercise(ex.id)} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100">Delete</button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <button onClick={openCreateExerciseFlow} className="w-full text-center mt-4 p-3 border-2 border-dashed border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:border-blue-500 hover:text-blue-600">+ Create New Exercise</button>
                      </div>
                      <div className="lg:w-2/3 w-full bg-slate-50 p-4 sm:p-6 rounded-lg min-h-[300px]">
                        {activeExercise?.type === 'multiple-choice' && <MultipleChoiceEditor exercise={activeExercise as MultipleChoiceExercise} onUpdate={handleUpdateExercise} />}
                        {activeExercise?.type === 'word-match' && <WordMatchEditor exercise={activeExercise as WordMatchExercise} onUpdate={handleUpdateExercise} />}
                        {activeExercise?.type === 'translate' && <TranslateEditor exercise={activeExercise as TranslateExercise} onUpdate={handleUpdateExercise} />}
                        {!activeExercise && <div className="text-center text-slate-500 h-full flex items-center justify-center">Select an exercise or create a new one to begin.</div>}
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
    );
};

export default AddQuizPage;