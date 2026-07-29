import React from 'react';

const OnlineStatusDot = ({ isOnline }) => {
  return (
    <span
      className={`status-dot ${isOnline ? 'status-dot--online' : 'status-dot--offline'}`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
};

export default OnlineStatusDot;