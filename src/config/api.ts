const API_URL = import.meta.env.VITE_API_URL || 'https://web-production-ac65.up.railway.app/api';

export const endpoints = {
  stock: `${API_URL}/stock`,
  reports: `${API_URL}/reports`,
  // Adicione outros endpoints conforme necessário
};

export default API_URL; 