import React from 'react';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    paddingTop: 16,  // pt-4
    marginTop: 16,   // mt-4
    width: '100%',
    fontSize: 14,    // text-sm
    fontWeight: 500, // font-medium
    lineHeight: 1,   // leading-none
    fontFamily: 'inherit',
  },
  buttonBase: {
    display: 'flex',
    gap: 8,          // gap-2
    alignSelf: 'stretch',
    padding: '8px 16px',  // py-2 px-4
    borderRadius: 12,     // rounded-lg
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  },
  variants: {
    blue: {
      backgroundColor: '#2563eb',
      color: '#f3f4f6',
      border: 'none',
    },
    gray: {
      backgroundColor: '#9ca3af',
      color: '#f3f4f6',
      border: 'none',
    },
    outline: {
      backgroundColor: 'white',
      color: '#0d74fa',
      border: '1px solid #0d74fa',
    },
  },
  hoverBlue: {
    backgroundColor: '#1d4ed8',
  },
  hoverGray: {
    backgroundColor: '#6b7280',
  },
  hoverOutline: {
    backgroundColor: '#e0f2ff',
  },
};

const LessonCardButton = ({ variant, label }) => {
  const [hover, setHover] = React.useState(false);

  const variantStyle = styles.variants[variant] || styles.variants.blue;
  let hoverStyle = {};

  if (hover) {
    if (variant === 'blue') hoverStyle = styles.hoverBlue;
    else if (variant === 'gray') hoverStyle = styles.hoverGray;
    else if (variant === 'outline') hoverStyle = styles.hoverOutline;
  }

  return (
    <div style={styles.container}>
      <button
        style={{ ...styles.buttonBase, ...variantStyle, ...hoverStyle }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {label}
      </button>
    </div>
  );
};
export default LessonCardButton;