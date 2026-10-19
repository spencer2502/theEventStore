import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === '') return '/api';
  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token from localStorage for reliable cross-domain requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // If login or refresh returned a token, persist it
    if (response.data?.token || response.data?.accessToken) {
      localStorage.setItem('token', response.data.token || response.data.accessToken);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    const errors = error.response?.data?.errors;
    return Promise.reject({ message, errors, status: error.response?.status, raw: error });
  }
);

export default api;
