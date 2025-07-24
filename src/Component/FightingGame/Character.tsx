import React, { useState, useEffect, useMemo } from 'react';

interface CharacterProps {
  key: string;
  name: string;
  initialX: number;
  images: { [key: string]: string };
  direction: string;
  currentAction: string;
  onHitEffect: number;
  triggerActionAnimation: number;
  frameCounts: { [key: string]: number };
  scale?: number;
}

const Character: React.FC<CharacterProps> = ({
  initialX,
  images,
  direction,
  currentAction,
  frameCounts,
  scale = 1,
}) => {
  const [x, setX] = useState<number>(initialX);
  const [spriteSheetSize, setSpriteSheetSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const safeAction = currentAction || 'idle';
  const safeDirection = direction || 'right';

  useEffect(() => {
    setX(initialX);
  }, [initialX]);
  const { animationName, animationDuration, frameCountValue, iterationCount, fillMode } = useMemo(() => {
    const action = safeAction;
    
    const actionMap: { [key: string]: string } = {
      'walk': 'run', 'ko': 'death', 'hit': 'take_hit', 'dodge': 'jump', 'heal': 'jump'
    };
    
    const mappedAction = actionMap[action] || action;
    const count = frameCounts?.[mappedAction] || frameCounts?.idle || 6;
    const oneShotActions = new Set(['attack1', 'attack2', 'hit', 'ko', 'death', 'jump', 'dodge']);
    
    let determinedIterationCount = 'infinite';
    let determinedFillMode: 'forwards' | 'none' = 'none';

    if (oneShotActions.has(action)) {
        determinedIterationCount = '1';
        determinedFillMode = 'forwards';
    }
    
    return {
      animationName: `sprite-anim-${mappedAction}-${count}`,
      animationDuration: `${count * 0.1}s`,
      frameCountValue: count,
      iterationCount: determinedIterationCount,
      fillMode: determinedFillMode,
    };
  }, [safeAction, frameCounts]);

  useEffect(() => {
    const img = new window.Image();
    const spriteUrl = images?.[`${safeAction}-${safeDirection}`] || images?.[`idle-${safeDirection}`];
    if (spriteUrl) {
        img.src = spriteUrl;
        img.onload = () => {
            setSpriteSheetSize({ width: img.naturalWidth, height: img.naturalHeight });
        };
    }
  }, [images, safeAction, safeDirection]);

  const frameWidth = (spriteSheetSize.width / frameCountValue) * scale;
  const frameHeight = spriteSheetSize.height * scale;

  const characterStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    bottom: '50px',
    width: frameWidth ? `${frameWidth}px` : '0px',
    height: frameHeight ? `${frameHeight}px` : '0px',
    overflow: 'hidden',
    transform: safeDirection === 'right' ? 'scaleX(1)' : 'scaleX(-1)',
    transition: 'left 0.1s linear',
    zIndex: 10,
    filter: 'drop-shadow(3px 5px 5px rgba(0,0,0,0.5))',
  };

  const spriteStyle: React.CSSProperties = {
    width: `${frameWidth * frameCountValue}px`,
    height: `${frameHeight}px`,
    backgroundImage: `url(${images?.[`${safeAction}-${safeDirection}`] || images?.[`idle-${safeDirection}`]})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '0% 0%',
    backgroundSize: 'cover',
    animationName: animationName,
    animationDuration: animationDuration,
    animationIterationCount: iterationCount,
    animationFillMode: fillMode,
    animationTimingFunction: `steps(${frameCountValue})`,
    imageRendering: 'pixelated',
  };

  useEffect(() => {
    const styleId = `sprite-animation-${animationName}`;
    if (document.getElementById(styleId)) return;
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `
      @keyframes ${animationName} {
        to {
          transform: translateX(-100%);
        }
      }
    `;
    document.head.appendChild(styleElement);
    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [animationName]);

  return (
    <div style={characterStyle}>
      <div style={spriteStyle} />
    </div>
  );
};

export default Character;