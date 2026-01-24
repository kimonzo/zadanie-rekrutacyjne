import axios from 'axios';

export const API_URL = 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAuthToken = async (): Promise<string> => {
  let token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;

  if (token) return token;

  try {
    const response = await axios.post(`${API_URL}/session`);
    token = response.data.token;

    if (token && typeof window !== 'undefined') {
      localStorage.setItem('jwt_token', token);
    }

    return token || '';
  } catch (error) {
    console.error('Failed to create session:', error);
    return '';
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }
    return Promise.reject(error);
  }
);

// --- TYPES ---

export interface ShortenResponse {
  id: number;
  shortCode: string;
  longUrl: string;
  owner?: string;
}

export interface UrlEntry {
  id: number;
  shortCode: string;
  longUrl: string;
  clickCount: number;
  createdAt: string;
}
