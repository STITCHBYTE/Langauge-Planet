import React, { useState, useEffect } from 'react';
import './CharacterSelect.css';

export interface Character {
    key: string;
    name: string;
    scale: number;
    offset: number;
    flipX: boolean;
    animations: string[];
    yOffset?: number;
    frameCounts: { [key: string]: number };
}

interface CharacterSelectProps {
    onSelect: (character: Character) => void;
    selectedCharacter?: Character | null;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, selectedCharacter: initialSelectedCharacter }) => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(initialSelectedCharacter || null);

    const PORTRAIT_DATA: { [key: string]: React.CSSProperties } = {
        'MedievalKingPack': { backgroundSize: '800%', backgroundPosition: '39% 90%' },
        'medieval_warrior': { backgroundSize: '1000%', backgroundPosition: '40% 90%' },
        'medieval_warrior2': { backgroundSize: '2000%', backgroundPosition: '4% 68%' },
        'medieval_warrior3': { backgroundSize: '2200%', backgroundPosition: '55.2% 63%' },
    };

    useEffect(() => {
        const loadCharacters = async () => {
            try {
                const response = await fetch('/assets/data/characters.json');
                const data = await response.json();
                setCharacters(data);

                if (initialSelectedCharacter) {
                    const initialChar = data.find((char: Character) => char.key === initialSelectedCharacter.key);
                    setSelectedCharacter(initialChar || null);
                }
            } catch (error) {
                console.error('Error loading characters:', error);
            }
        };
        loadCharacters();
    }, [initialSelectedCharacter]);

    const handleSelect = (character: Character) => {
        setSelectedCharacter(character);
        onSelect(character);
    };

    return (
        <div className="character-select-container">
            <div className="title-container">
                <h1 className="main-title">Choose Your Fighter</h1>
                <div className="title-shine"></div>
            </div>
            <div className="character-grid">
                {characters.map((character) => {
                    const portraitStyle = PORTRAIT_DATA[character.key] || {};

                    const finalSpriteStyle: React.CSSProperties = {
                        backgroundImage: `url(/assets/sprites/${character.key}/idle.png)`,
                        ...portraitStyle,
                    };

                    return (
                        <div
                            key={character.key}
                            className={`character-card-select ${selectedCharacter?.key === character.key ? 'selected' : ''}`}
                            onClick={() => handleSelect(character)}
                        >
                            <div className="card-shine"></div>
                            <div className="character-preview-select">
                                <div
                                    className="character-sprite"
                                    style={finalSpriteStyle}
                                />
                            </div>
                            <h2 className="fighter-name">{character.name}</h2>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CharacterSelect;