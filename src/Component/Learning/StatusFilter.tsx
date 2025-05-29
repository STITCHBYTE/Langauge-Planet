import React from 'react';
import './Learning.css'; 

const StatusFilter = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
      <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Status</label>
      <button style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 15px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#fff',
        cursor: 'pointer'
      }}>
        <div style={{ marginRight: '8px' }}>
          <span style={{ marginRight: '5px' }}>All Lessons</span>
          <span style={{ color: '#007bff' }}>15</span>
        </div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/f74c21f9ed150bf0579dceb1adfef5b1032d99e7"
          alt="Dropdown arrow"
          style={{ width: '12px' }}
        />
      </button>
    </div>
  );
};

export default StatusFilter;
