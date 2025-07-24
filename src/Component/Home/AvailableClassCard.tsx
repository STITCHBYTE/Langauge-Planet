import React, { useState } from 'react';
import Server_url from '../../config.js';
import { toast } from 'react-toastify';
import './Style.css';

const AvailableClassCard = ({ classId, icon, title, teacher }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const handleRequestToJoin = async () => {
    if (isRequesting || hasRequested) return;

    setIsRequesting(true);
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`${Server_url}/api/classrooms/classroom/invite/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classroom: classId,
        }),
      });

      if (response.ok) {
        setHasRequested(true);
        toast.success('Request sent successfully!');
      } else {
        toast.error('Failed to send request');
      }
    } catch (error) {
      toast.error('Error sending request');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="class-card">
      <div className="class-card-header">
        <div className="class-card-left">
          <img src={icon || "https://via.placeholder.com/60"} alt={title} className="class-card-icon" />
          <div className="class-card-topic">{title}</div>
          <div className="class-card-teacher">{teacher}</div>
        </div>
        <div className="class-card-right">
          <button 
            className={`class-card-button ${hasRequested ? 'requested' : ''}`}
            onClick={handleRequestToJoin}
            disabled={isRequesting || hasRequested}
          >
            {isRequesting ? 'Requesting...' : hasRequested ? 'Requested' : 'Request to Join'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailableClassCard;