import React from 'react';

interface LessonCardProps {
  title: string;
  description: string;
  icon?: string;
  progress?: number;
  timeLeft?: string;
  isCompleted?: boolean;
}

const LessonCard = ({
  title,
  description,
  icon,
  progress,
  timeLeft,
  isCompleted
}: LessonCardProps) => {
  const showProgress = typeof progress === 'number' && progress > 0;

  return (
    <article
      style={{
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '20px',
        width: '300px',
        fontFamily: 'sans-serif',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {icon && (
        <img
          src={icon}
          alt={`${title} icon`}
          style={{ width: '60px', height: '60px', objectFit: 'contain' }}
        />
      )}

      <h2 style={{ fontSize: '1.2rem', margin: '0' }}>{title}</h2>

      <p style={{ fontSize: '0.95rem', color: '#555', margin: '0' }}>
        {description}
      </p>

      <div
        style={{
          marginTop: '20px',
          width: '100%',
          display: 'flex',
          gap: '12px',
          fontSize: '0.85rem',
          color: '#555',
          borderTop: '1px solid #eee',
          paddingTop: '12px'
        }}
      >
        {isCompleted ? (
          <>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/5551a386c8985edbd32b15d42877ca5ef2dd663e"
              alt="Completed"
              style={{ width: '18px' }}
            />
            <span style={{ color: '#28a745', fontWeight: 600 }}>Completed</span>
          </>
        ) : (
          <>
            {showProgress && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/aca0a4cc9dba05c78bc82ad8333a67d58e5fe413"
                  alt="Progress"
                  style={{ width: '18px' }}
                />
                <span>{progress}%</span>
              </div>
            )}
            {timeLeft && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/fb5a231ade49291214d0227b4bc1979165212cbe"
                  alt="Time left"
                  style={{ width: '18px' }}
                />
                <span>{timeLeft}</span>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
};

export default LessonCard;
