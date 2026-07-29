import React, { useState } from 'react';

const RoomList = ({ rooms, activeChat, onSelectRoom, onCreateRoom }) => {
  const [showForm, setShowForm] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setSubmitting(true);
    setError('');
    const result = await onCreateRoom(roomName.trim(), roomDesc.trim());
    setSubmitting(false);

    if (result?.success) {
      setRoomName('');
      setRoomDesc('');
      setShowForm(false);
    } else {
      setError(result?.message || 'Failed to create room');
    }
  };

  return (
    <div className="list-section">
      <div className="list-section__header">
        <h3>Rooms</h3>
        <button className="btn btn--small" onClick={() => setShowForm((s) => !s)}>
          {showForm ? '✕' : '+ New'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            maxLength={40}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={roomDesc}
            onChange={(e) => setRoomDesc(e.target.value)}
            maxLength={100}
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn--small btn--primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      )}

      <ul className="list">
        {rooms.length === 0 && <li className="list__empty">No rooms yet</li>}
        {rooms.map((room) => (
          <li
            key={room._id}
            className={`list__item ${
              activeChat?.type === 'room' && activeChat?.id === room._id ? 'list__item--active' : ''
            }`}
            onClick={() => onSelectRoom(room)}
          >
            <div className="list__item-icon">#</div>
            <div className="list__item-body">
              <span className="list__item-title">{room.name}</span>
              {room.description && (
                <span className="list__item-subtitle">{room.description}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomList;