import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return structured error message
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    const errors = error.response?.data?.errors;
    return Promise.reject({ message, errors, status: error.response?.status, raw: error });
  }
);

export default api;
