import React, { useState } from 'react';
import FightingGame from '../FightingGame/FightingGame.tsx';
import FightingFriendsOnline from '../FightingGame/FightingFriends.tsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="modern-modal-backdrop"
      onClick={onClose}
    >
      <div 
        className="modern-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="modern-modal-close"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

const FightGame: React.FC = () => {
  const [gameMode, setGameMode] = useState<'menu' | 'bot' | 'player'>('menu');
  const [showRoomModal, setShowRoomModal] = useState<boolean>(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState<boolean>(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [roomAction, setRoomAction] = useState<'create' | 'join' | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [generatedRoomId, setGeneratedRoomId] = useState<string>('');
  const [joinRoomId, setJoinRoomId] = useState<string>('');

  const generateRoomId = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handlePlayWithBot = () => {
    setShowDifficultyModal(true);
  };

  const handleSelectDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedDifficulty(difficulty);
    setShowDifficultyModal(false);
    setGameMode('bot');
  };

  const handlePlayWithPlayer = () => {
    setShowRoomModal(true);
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setGeneratedRoomId(newRoomId);
    setRoomId(newRoomId);
    setRoomAction('create');
  };

  const handleJoinRoom = () => {
    setRoomAction('join');
  };

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(generatedRoomId);
      alert('Room ID copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedRoomId;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Room ID copied to clipboard!');
      } catch (fallbackErr) {
        alert(`Failed to copy. Room ID: ${generatedRoomId}`);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleStartOnlineGame = () => {
    if (roomAction === 'join' && !joinRoomId.trim()) {
      alert('Please enter a Room ID');
      return;
    }
    setShowRoomModal(false);
    setGameMode('player');
  };

  const handleBackToMenu = () => {
    setGameMode('menu');
    setShowRoomModal(false);
    setShowDifficultyModal(false);
    setRoomAction(null);
    setRoomId('');
    setGeneratedRoomId('');
    setJoinRoomId('');
  };

  const handleCloseModal = () => {
    setShowRoomModal(false);
    setRoomAction(null);
    setGeneratedRoomId('');
    setJoinRoomId('');
  };

  const handleCloseDifficultyModal = () => {
    setShowDifficultyModal(false);
  };

  if (gameMode === 'bot') {
    return (
      <div className="relative w-full h-screen">
        <button 
          className="absolute top-5 left-5 z-50 bg-black bg-opacity-80 text-white border-none py-3 px-6 rounded-full cursor-pointer text-base font-bold transition-all duration-300 hover:bg-opacity-90 hover:-translate-x-1"
          onClick={handleBackToMenu}
        >
          ← Back to Menu
        </button>
        <FightingGame initialDifficulty={selectedDifficulty} />
      </div>
    );
  }

  if (gameMode === 'player') {
    return (
      <div className="relative w-full h-screen">
        <button 
          className="absolute top-5 left-5 z-50 bg-black bg-opacity-80 text-white border-none py-3 px-6 rounded-full cursor-pointer text-base font-bold transition-all duration-300 hover:bg-opacity-90 hover:-translate-x-1"
          onClick={handleBackToMenu}
        >
          ← Back to Menu
        </button>
        <FightingFriendsOnline />
      </div>
    );
  }

  return (
    <div className="game-selection-container">
      <div className="game-selection-modal">
        {/* Left Side - Player Controls */}
        <div className="controls-section">
          <h2 className="controls-title">Game Controls</h2>
          
          <div className="player-info">
            <div className="player-avatar">
              <img src="/sprites/player-idle.png" alt="Player" className="player-image" />
            </div>
            <div className="player-details">
              <h3 className="player-name">Player 1</h3>
              <p className="player-status">Ready to Fight</p>
            </div>
          </div>

          <div className="controls-list">
            <div className="control-group">
              <h4 className="control-category">Movement</h4>
              <div className="control-item">
                <span className="key-binding">A / ←</span>
                <span className="control-desc">Move Left</span>
              </div>
              <div className="control-item">
                <span className="key-binding">D / →</span>
                <span className="control-desc">Move Right</span>
              </div>
            </div>

            <div className="control-group">
              <h4 className="control-category">Combat</h4>
              <div className="control-item">
                <span className="key-binding">SPACE</span>
                <span className="control-desc">Attack</span>
              </div>
              <div className="control-item">
                <span className="key-binding">S / ↓</span>
                <span className="control-desc">Dodge</span>
              </div>
            </div>

            <div className="control-group">
              <h4 className="control-category">Quiz</h4>
              <div className="control-item">
                <span className="key-binding">1-4</span>
                <span className="control-desc">Answer Options</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Game Mode Selection */}
        <div className="gamemode-section">
          <h2 className="gamemode-title">Select Game Mode</h2>
          <p className="gamemode-subtitle">Choose how you want to battle</p>

          <div className="gamemode-options">
            <button 
              className="gamemode-card bot-mode"
              onClick={handlePlayWithBot}
            >
              <div className="gamemode-icon">
                <img src="/sprites/bot-idle.png" alt="Bot" className="mode-image" />
              </div>
              <div className="gamemode-content">
                <h3 className="gamemode-name">Single Player</h3>
                <p className="gamemode-desc">Fight against intelligent AI</p>
                <div className="gamemode-features">
                  <span className="feature-tag">Quiz Battle</span>
                  <span className="feature-tag">Progressive AI</span>
                </div>
              </div>
            </button>

            <button 
              className="gamemode-card multiplayer-mode"
              onClick={handlePlayWithPlayer}
            >
              <div className="gamemode-icon">
                <div className="multiplayer-avatars">
                  <img src="/sprites/player-idle.png" alt="Player 1" className="avatar-small" />
                  <img src="/sprites/player-idle.png" alt="Player 2" className="avatar-small" />
                </div>
              </div>
              <div className="gamemode-content">
                <h3 className="gamemode-name">Multiplayer</h3>
                <p className="gamemode-desc">Challenge friends online</p>
                <div className="gamemode-features">
                  <span className="feature-tag">Real-time Battle</span>
                  <span className="feature-tag">Room System</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={showRoomModal} onClose={handleCloseModal}>
        <div className="room-modal-content">
          <h2 className="room-modal-title">Multiplayer Setup</h2>
          <p className="room-modal-subtitle">Choose how you want to connect with other players</p>

          {!roomAction && (
            <div className="room-options">
              <button 
                className="room-option create-room"
                onClick={handleCreateRoom}
              >
                <div className="room-option-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </div>
                <div className="room-option-content">
                  <h3 className="room-option-title">Create Room</h3>
                  <p className="room-option-desc">Start a new game and invite friends</p>
                </div>
              </button>

              <button 
                className="room-option join-room"
                onClick={handleJoinRoom}
              >
                <div className="room-option-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z"></path>
                  </svg>
                </div>
                <div className="room-option-content">
                  <h3 className="room-option-title">Join Room</h3>
                  <p className="room-option-desc">Enter a room code to join a game</p>
                </div>
              </button>
            </div>
          )}

          {roomAction === 'create' && (
            <div className="room-created">
              <div className="success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              <h3 className="room-created-title">Room Created Successfully!</h3>
              <div className="room-id-section">
                <label className="room-id-label">Share this Room ID:</label>
                <div className="room-id-container">
                  <input 
                    type="text" 
                    value={generatedRoomId} 
                    readOnly 
                    className="room-id-input"
                  />
                  <button 
                    className="copy-button"
                    onClick={handleCopyRoomId}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <p className="room-info">Your friend can join using this Room ID</p>
              <div className="room-actions">
                <button className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button className="start-btn" onClick={handleStartOnlineGame}>
                  Start Game
                </button>
              </div>
            </div>
          )}

          {roomAction === 'join' && (
            <div className="room-join">
              <h3 className="room-join-title">Join a Room</h3>
              <div className="room-id-section">
                <label htmlFor="joinRoomInput" className="room-id-label">
                  Enter Room ID:
                </label>
                <input
                  id="joinRoomInput"
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character Room ID"
                  className="room-id-input join-input"
                  maxLength={6}
                />
              </div>
              <div className="room-actions">
                <button className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button 
                  className={`start-btn ${!joinRoomId.trim() ? 'disabled' : ''}`}
                  onClick={handleStartOnlineGame}
                  disabled={!joinRoomId.trim()}
                >
                  Join Game
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={showDifficultyModal} onClose={handleCloseDifficultyModal}>
        <div className="difficulty-modal-content">
          <div className="difficulty-modal-header">
            <h2 className="difficulty-modal-title">Choose Your Challenge</h2>
            <p className="difficulty-modal-subtitle">Select difficulty level</p>
          </div>

          <div className="difficulty-cards-container">
            <div className="difficulty-cards">
              <button 
                className="difficulty-card difficulty-easy"
                onClick={() => handleSelectDifficulty('easy')}
              >
                <div className="difficulty-card-glow"></div>
                <div className="difficulty-card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <h3 className="difficulty-card-title">Beginner</h3>
                <p className="difficulty-card-description">Slow AI • Simple Questions</p>
                <div className="difficulty-level-indicator">
                  <div className="level-dot active"></div>
                  <div className="level-dot"></div>
                  <div className="level-dot"></div>
                </div>
              </button>

              <button 
                className="difficulty-card difficulty-medium featured"
                onClick={() => handleSelectDifficulty('medium')}
              >
                <div className="difficulty-card-glow"></div>
                <div className="featured-badge">Recommended</div>
                <div className="difficulty-card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <h3 className="difficulty-card-title">Warrior</h3>
                <p className="difficulty-card-description">Smart AI • Mixed Questions</p>
                <div className="difficulty-level-indicator">
                  <div className="level-dot active"></div>
                  <div className="level-dot active"></div>
                  <div className="level-dot"></div>
                </div>
              </button>

              <button 
                className="difficulty-card difficulty-hard"
                onClick={() => handleSelectDifficulty('hard')}
              >
                <div className="difficulty-card-glow"></div>
                <div className="difficulty-card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                </div>
                <h3 className="difficulty-card-title">Legend</h3>
                <p className="difficulty-card-description">Expert AI • Hard Questions</p>
                <div className="difficulty-level-indicator">
                  <div className="level-dot active"></div>
                  <div className="level-dot active"></div>
                  <div className="level-dot active"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FightGame;