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
}

interface CharacterSelectProps {
    onSelect: (character: Character) => void;
    selectedCharacter?: Character | null;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, selectedCharacter: initialSelectedCharacter }) => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(initialSelectedCharacter || null);

    // ✅ NEW: This object holds the specific settings for each character's portrait.
    // You can easily tweak these values to get the perfect headshot for each fighter.
    const PORTRAIT_DATA = {
        'fighter1': { backgroundSize: '1200%', backgroundPosition: '0% 50%' },
        'MedievalKingPack': { backgroundSize: '1260%', backgroundPosition: '21% 80%' },
        'medieval_warrior': { backgroundSize: '1700%', backgroundPosition: '23% 95%' },
        'medieval_warrior2': { backgroundSize: '3000%', backgroundPosition: '44% 68%' },
        'medieval_warrior3': { backgroundSize: '3000%', backgroundPosition: '55% 63%' },
        'wizard': { backgroundSize: '2000%', backgroundPosition: '76% 94%' },
        'fighter2': { backgroundSize: '1000%', backgroundPosition: '15% 45%' },
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
                    // Get the specific portrait data for the current character
                    const portraitStyle = PORTRAIT_DATA[character.key as keyof typeof PORTRAIT_DATA] || {};

                    const finalSpriteStyle: React.CSSProperties = {
                        backgroundImage: `url(/assets/sprites/${character.key}/idle.png)`,
                        ...portraitStyle, // Apply the new portrait settings
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