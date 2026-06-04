import axios from 'axios';

const api = axios.create({
  baseURL: 'https://taskflow-production-7da4.up.railway.app/api',
  withCredentials: true
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;