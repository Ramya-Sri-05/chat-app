# Chatify

A modern real-time chat application built with React, Vite, Express, MongoDB, and Socket.IO.

## Overview

This project is a full-stack chat application with:
- user signup / login authentication
- real-time messaging
- chat rooms and direct messaging
- online presence indicators
- room creation and message history

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Socket.IO Client
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO
- Auth: JWT-based authentication
- Styling: CSS-driven modern UI

## Project Structure
backend/
package.json
server.js
config/
db.js
controllers/
authController.js
messageController.js
roomController.js
userController.js
middleware/
authMiddleware.js
models/
Message.js

Room.js
User.js
routes/
authRoutes.js
messageRoutes.js
roomRoutes.js
socket/
socketHandler.js
frontend/
package.json
vite.config.js
index.html
src/
App.jsx

index.css
pages/
ChatPage.jsx
Login.jsx
Signup.jsx
components/
AuthInput.jsx
AuthLayout.jsx
ChatWindow.jsx
MessageBubble.jsx
Navbar.jsx
OnlineStatusDot.jsx
RoomList.jsx
UserList.jsx
context/
AuthContext.jsx
SocketContext.jsx
utils/
api.js


## Features

- Secure signup and login
- JWT authorization for protected backend routes
- Real-time room chat
- Direct messaging between users
- Online status tracking
- Room creation and room list
- Clean modern UI with reusable auth components

## Installation

### Backend
cd backend
npm install

## Frontend
cd frontend
npm install
