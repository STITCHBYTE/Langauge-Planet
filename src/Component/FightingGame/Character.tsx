import React, { useState, useEffect, useMemo } from 'react';
import './FightingGame.css';

interface CharacterProps {
  name: string;
  initialX: number;
  images: { [key: string]: string };
  direction: string;
  currentAction: string;
  onHitEffect: number;
  triggerActionAnimation: number;
  isDodging?: boolean;
  isHealing?: boolean;
}

const FRAME_COUNTS = {
    idle: 6,
    run: 6,
    walk: 6, // Map walk to run
    attack1: 4,
    attack2: 4,
    jump: 8,
    death: 10,
    ko: 10, // Map ko to death
};

const Character: React.FC<CharacterProps> = ({ 
  initialX, 
  images, 
  direction, 
  currentAction
}) => {
  const [x, setX] = useState<number>(initialX);
  
  useEffect(() => {
    setX(initialX);
  }, [initialX]);

  const { animationName, animationDuration, frameCount } = useMemo(() => {
    const action = currentAction || 'idle';
    const count = FRAME_COUNTS[action as keyof typeof FRAME_COUNTS] || FRAME_COUNTS.idle;
    
    return {
      animationName: `sprite-anim-${action}`,
      animationDuration: `${count * 0.1}s`, // Animation speed: 0.1s per frame
      frameCount: count,
    };
  }, [currentAction]);

  const characterStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    bottom: '50px',
    width: '450px',
    height: '450px',
    overflow: 'hidden',
    transform: direction === 'right' ? 'scaleX(1)' : 'scaleX(-1)',
    transition: 'left 0.1s linear',
    zIndex: 10,
    filter: 'drop-shadow(3px 5px 5px rgba(0,0,0,0.5))',
  };

  const spriteStyle: React.CSSProperties = {
    width: `${frameCount * 100}%`, // Make the sprite container wide enough for all frames
    height: '100%',
    backgroundImage: `url(${images[`${currentAction}-${direction}`] || images[`idle-${direction}`]})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '0% 0%',
    backgroundSize: '100% 100%',
    animationName: animationName,
    animationDuration: animationDuration,
    animationIterationCount: 'infinite',
    animationTimingFunction: `steps(${frameCount})`, // Jumps between frames
    imageRendering: 'pixelated',
  };

  return (
    <div style={characterStyle}>
        <div style={spriteStyle} />
    </div>
  );
};

export default Character;