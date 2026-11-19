import axios from 'axios';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const browserHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const usesSecureDevProxy = typeof window !== 'undefined'
  && window.location.protocol === 'https:'
  && configuredApiBaseUrl?.startsWith('http:');
const apiBaseUrl = usesSecureDevProxy
  ? '/api'
  : configuredApiBaseUrl?.replace('localhost', browserHost).replace('127.0.0.1', browserHost);

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cp360_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;