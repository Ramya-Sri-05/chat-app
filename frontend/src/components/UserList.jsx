import React from 'react';
import OnlineStatusDot from './OnlineStatusDot';

const UserList = ({ users, activeChat, onSelectUser, onlineUserIds }) => {
  return (
    <div className="list-section">
      <div className="list-section__header">
        <h3>Direct Messages</h3>
      </div>
      <ul className="list">
        {users.length === 0 && <li className="list__empty">No other users yet</li>}
        {users.map((u) => {
          const isOnline = onlineUserIds.includes(u._id);
          return (
            <li
              key={u._id}
              className={`list__item ${
                activeChat?.type === 'direct' && activeChat?.id === u._id
                  ? 'list__item--active'
                  : ''
              }`}
              onClick={() => onSelectUser(u)}
            >
              <div className="list__item-icon list__item-icon--avatar">
                {u.username.charAt(0).toUpperCase()}
              </div>
              <div className="list__item-body">
                <span className="list__item-title">{u.username}</span>
                <span className="list__item-subtitle">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <OnlineStatusDot isOnline={isOnline} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UserList;