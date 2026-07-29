import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chatToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('chatToken');
      localStorage.removeItem('chatUser');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const logoutUser = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// ---- Users ----
export const getAllUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);

// ---- Rooms ----
export const createRoom = (data) => api.post('/rooms', data);
export const getRooms = () => api.get('/rooms');
export const getRoomById = (id) => api.get(`/rooms/${id}`);
export const joinRoom = (id) => api.put(`/rooms/${id}/join`);

// ---- Messages ----
export const getRoomMessages = (roomId) => api.get(`/messages/room/${roomId}`);
export const getDirectMessages = (userId) => api.get(`/messages/direct/${userId}`);

export default api;