export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('flour_erp_api_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
    // If running in browser locally on localhost, connect to local backend port 5000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:5000';
    }
  }
  // Default to live Render backend for mobile app, Vercel, and remote clients
  return process.env.NEXT_PUBLIC_API_URL || 'https://flourmill-ahkk.onrender.com';
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://flourmill-ahkk.onrender.com';
