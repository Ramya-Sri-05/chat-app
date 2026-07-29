import React from 'react';
import { useAuth } from '../context/AuthContext';
import OnlineStatusDot from './OnlineStatusDot';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__brand">💬 MERN Chat</div>
      {user && (
        <div className="navbar__user">
          <OnlineStatusDot isOnline={true} />
          <span className="navbar__username">{user.username}</span>
          <button className="btn btn--ghost" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;