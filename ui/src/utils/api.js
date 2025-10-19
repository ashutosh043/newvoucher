// src/utils/api.js
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Change if needed
  withCredentials: true, // Important for refreshToken cookies
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle expired access token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          'http://localhost:5000/api/auth/refresh-token',
          {},
          { withCredentials: true }
        );
        localStorage.setItem('accessToken', res.data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
        return api(originalRequest); // Retry request
      } catch (err) {
        // Refresh token failed — log out
        localStorage.clear();
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Please log in again.',
        }).then(() => {
          window.location.href = '/';
        });
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;