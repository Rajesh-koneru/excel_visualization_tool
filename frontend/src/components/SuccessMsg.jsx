import React, { useEffect, useState } from 'react';

const SuccessMessage = ({ message, duration = 3000 ,type='success'}) => {
  const bgColor = type === 'success' ? '#16a34a' : '#dc2626'; // green or red
  const [visible, setVisible] = useState(false);


  useEffect(() => {
    // Show message
    setVisible(true);

    // Hide after `duration` ms
    const timer = setTimeout(() => setVisible(false), duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        backgroundColor: bgColor,
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        position: 'fixed',
        top: '20px',
        left: '50%',
        transformOrigin: 'center',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
       {message}
    </div>
  );
};

export default SuccessMessage;
