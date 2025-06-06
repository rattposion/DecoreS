const API_URL = import.meta.env.VITE_API_URL || 'https://web-production-ac65.up.railway.app';

export const endpoints = {
  stock: `${API_URL}/stock`,
  reports: `${API_URL}/reports`,
  testConnection: `${API_URL}/test-connection`
};

export default API_URL; 
