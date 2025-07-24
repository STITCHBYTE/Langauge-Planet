import React from 'react';

const LessonCardButton = ({ variant, label, onClick }) => {
  const baseStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid transparent',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
    textAlign: 'center',
  };

  const variantStyles = {
    blue: {
      backgroundColor: '#2563EB',
      color: '#FFFFFF',
    },
    outline: {
      backgroundColor: '#FFFFFF',
      color: '#4B5563',
      borderColor: '#D1D5DB',
    },
    gray: {
      backgroundColor: '#F3F4F6',
      color: '#4B5563',
    },
    green: {
      backgroundColor: '#10B981',
      color: '#FFFFFF',
    },
    red: {
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
    },
  };

  const style = { ...baseStyle, ...variantStyles[variant] };
  return (
    <button style={style} onClick={onClick}>
      {label}
    </button>
  );
};

export default LessonCardButton;