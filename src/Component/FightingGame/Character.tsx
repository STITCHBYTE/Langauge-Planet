import React, { useState, useEffect, useRef, CSSProperties } from 'react';

interface CharacterProps {
  name: string;
  initialX: number;
  initialHealth: number;
  images: { [key: string]: string };
  direction: string;
  currentAction: string;
  onHitEffect: number;
  triggerActionAnimation: number;
  hideHealthBar?: boolean;
}

const Character: React.FC<CharacterProps> = ({ 
  name, 
  initialX, 
  initialHealth, 
  images, 
  direction, 
  currentAction, 
  onHitEffect, 
  triggerActionAnimation, 
  hideHealthBar = false 
}) => {
  const [x, setX] = useState<number>(initialX);
  const [hitEffectVisible, setHitEffectVisible] = useState<boolean>(false);
  const [animationFrame, setAnimationFrame] = useState<number>(0); // For future sprite sheet animation
  const [effectClass, setEffectClass] = useState<string>(''); // For dynamic CSS classes
  const characterRef = useRef<HTMLDivElement>(null);

  // Update character position if initialX prop changes
  useEffect(() => {
    setX(initialX);
  }, [initialX]);

  // Trigger hit effect when onHitEffect prop changes
  useEffect(() => {
    if (onHitEffect) {
      const isCritical = Math.random() < 0.15; // Same critical chance as in App.js
      setHitEffectVisible(true);
      
      if (isCritical) {
        setEffectClass('character-critical-hit');
      } else {
        setEffectClass('character-hit-effect');
      }
      
      const timer = setTimeout(() => {
        setHitEffectVisible(false);
        setEffectClass('');
      }, isCritical ? 500 : 300); // Longer effect for critical hits
      
      return () => clearTimeout(timer);
    }
  }, [onHitEffect]);

  // Add walking animation effect
  useEffect(() => {
    let walkInterval: NodeJS.Timeout | null = null;
    if (currentAction === 'walk') {
      setEffectClass('character-walking');
      // Add a subtle walking bobbing animation
      walkInterval = setInterval(() => {
        setAnimationFrame(prev => (prev + 1) % 2); // Simple 2-frame animation
      }, 300); // Change frame every 300ms for walking rhythm
    } else {
      setEffectClass('');
      setAnimationFrame(0);
    }
    
    return () => {
      if (walkInterval) clearInterval(walkInterval);
    };
  }, [currentAction]);

  // Add dodge effect
  useEffect(() => {
    if (currentAction === 'dodge') {
      setEffectClass('character-dodge-effect');
      const timer = setTimeout(() => {
        setEffectClass('');
      }, 400);
      return () => clearTimeout(timer);
    } else if (currentAction === 'ko') {
      // Add KO fall animation
      setEffectClass('character-ko-fall');
      // Don't clear the effect class for KO as it should persist
    }
  }, [currentAction]);

  // Simulate action animation (for single images, this just ensures the action image is shown)
  useEffect(() => {
    if (triggerActionAnimation && (currentAction === 'attack' || currentAction === 'dodge' || currentAction === 'ko')) {
      // For actual sprite sheets, you'd cycle frames here
      setAnimationFrame(0); // Reset frame on new action
      // Add a class for CSS-based animations
      if (characterRef.current) {
        characterRef.current.classList.add('action-animation');
        const animationTimer = setTimeout(() => {
          if (characterRef.current) {
            characterRef.current.classList.remove('action-animation');
          }
        }, 300); // Match this with your CSS animation duration
        return () => clearTimeout(animationTimer);
      }
    }
  }, [triggerActionAnimation, currentAction]);

  // Determine which image to show based on current action and direction
  const getImageSrc = (): string => {
    // If you had sprite sheets, you'd select the correct frame here.
    // E.g., images[`${currentAction}-${direction}_frame${animationFrame}`]
    const stateKey = `${currentAction}-${direction}`;
    return images[stateKey] || images[`idle-${direction}`] || '';
  };

  const characterStyle: CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    bottom: currentAction === 'ko' ? '50px' : currentAction === 'walk' ? `${150 + (animationFrame * 5)}px` : '150px', // Add bobbing for walking
    transform: direction === 'right' ? 'scaleX(1)' : 'scaleX(-1)',
    transition: currentAction === 'walk' ? 'left 0.1s ease-out' : 'left 0.3s ease-out, bottom 0.8s ease-out', // Faster transition for walking
    width: '200px',
    height: '200px',
    zIndex: currentAction === 'ko' ? 1 : 10, // KO'd character goes behind winner
    // Additional styling for KO state
    ...(currentAction === 'ko' && {
      transform: `${direction === 'right' ? 'scaleX(1)' : 'scaleX(-1)'} rotate(-15deg)`,
      transition: 'left 0.3s ease-out, bottom 0.8s ease-out, transform 1s ease-out',
      transformOrigin: 'center bottom', // Rotate from bottom for more realistic fall
      filter: 'brightness(0.7) saturate(0.5)', // Dim the KO'd character
    })
  };

  const hitEffectStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%', // Make hit effect cover the character
    height: '100%',
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: '50%',
    opacity: hitEffectVisible ? 1 : 0,
    transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
    zIndex: 10,
    pointerEvents: 'none',
    // Add a subtle expand/contract animation to the hit effect
    animation: hitEffectVisible ? 'hitPulse 0.15s ease-out' : 'none',
  };

  const hitEffectLayer1Style: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '120%',
    height: '120%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
    animation: 'hitPulse 0.2s ease-out',
  };

  const hitEffectLayer2Style: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    borderRadius: '50%',
    animation: 'hitPulse 0.15s ease-out 0.05s',
  };

  const healthBarContainerStyle: CSSProperties = {
    position: 'absolute',
    top: '-30px',
    width: '100%',
    backgroundColor: '#555',
    height: '10px',
    border: '1px solid black'
  };

  const healthBarFillStyle: CSSProperties = {
    width: `${(initialHealth / 100) * 100}%`,
    backgroundColor: initialHealth > 30 ? 'green' : 'red',
    height: '100%'
  };

  const nameStyle: CSSProperties = {
    position: 'absolute',
    top: '-50px',
    width: '100%',
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold'
  };

  const imageStyle: CSSProperties = {
    width: '150%',
    height: '150%'
  };

  return (
    <div ref={characterRef} style={characterStyle} className={`character-container ${effectClass}`}>
      <img
        src={getImageSrc()}
        alt={`${name} ${currentAction}`}
        style={imageStyle}
      />
      {/* Enhanced Hit Effect */}
      {hitEffectVisible && (
        <div style={hitEffectStyle}>
          {/* Multiple hit effect layers for more impact */}
          <div style={hitEffectLayer1Style}></div>
          <div style={hitEffectLayer2Style}></div>
        </div>
      )}

      {/* Health Bar - Only show if hideHealthBar is false */}
      {!hideHealthBar && (
        <div style={healthBarContainerStyle}>
          <div style={healthBarFillStyle}></div>
        </div>
      )}
      
      {/* Character Name - Only show if hideHealthBar is false */}
      {!hideHealthBar && (
        <div style={nameStyle}>
          {name}
        </div>
      )}
    </div>
  );
};

export default Character;