import axios from 'axios';

// Define what the Backend sends back
export interface ShortenResponse {
  shortCode: string;
  longUrl: string;
}

// Define what we send to the Backend
export interface ShortenPayload {
  longUrl: string;
  userUuid: string;
}

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUserId = (): string => {
  if (typeof window === 'undefined') return '';

  let uuid = localStorage.getItem('user_uuid');
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem('user_uuid', uuid);
  }
  return uuid;
};
