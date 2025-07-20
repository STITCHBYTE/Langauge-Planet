import React, { useState } from 'react';
import FightingGame from './FightingGame.tsx';
import CharacterSelect, { Character } from './CharacterSelect.tsx';
import './fighting.css';

interface GameScreenProps {
  initialDifficulty?: 'easy' | 'medium' | 'hard';
  isMultiplayer?: boolean;
  roomId?: string;
  joinRoomId?: string;
  roomAction?: 'create' | 'join';
}

const GameScreen: React.FC<GameScreenProps> = (props) => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showCharacterSelect, setShowCharacterSelect] = useState(true);

  if (showCharacterSelect) {
    return (
      <div className="character-select-screen">
        <CharacterSelect
          onSelect={(character) => {
            setSelectedCharacter(character);
            setShowCharacterSelect(false);
          }}
          selectedCharacter={selectedCharacter}
        />
      </div>
    );
  }

  return (
    <FightingGame
      {...props}
      selectedCharacter={selectedCharacter}
    />
  );
};

export default GameScreen;