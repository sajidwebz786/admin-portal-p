// Vite replaces these values at build time. Local development uses its API proxy.
export const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://serverapplication.onrender.com/api' : '/api')
).replace(/\/+$/, '');
