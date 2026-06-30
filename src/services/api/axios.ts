import axios from 'axios';

const isServer = typeof window === 'undefined';

export const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return 'https://invoice-backend-murex.vercel.app';
};

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Security: Access token is kept strictly in-memory
let _accessToken: string | null = null;

export const tokenStore = {
  getAccessToken: (): string | null => {
    return _accessToken;
  },
  
  setAccessToken: (token: string | null): void => {
    _accessToken = token;
  },

  getRefreshToken: (): string | null => {
    if (isServer) return null;
    return localStorage.getItem('refresh_token');
  },

  setRefreshToken: (token: string | null): void => {
    if (isServer) return;
    if (token) {
      localStorage.setItem('refresh_token', token);
    } else {
      localStorage.removeItem('refresh_token');
    }
  },

  clearTokens: (): void => {
    _accessToken = null;
    if (!isServer) {
      localStorage.removeItem('refresh_token');
    }
  },
};
