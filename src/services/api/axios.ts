import axios from 'axios';

const isServer = typeof window === 'undefined';

export const getBaseURL = () => {
  // Server-side (SSR/SSG): connect directly to internal backend
  if (isServer) {
    return process.env.INTERNAL_BACKEND_URL || 'http://localhost:5000';
  }
  // Client-side (Browser): use relative URL so Next.js server proxies the request
  // This completely hides backend domain/IP from client bundles and network inspection
  return '';
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
