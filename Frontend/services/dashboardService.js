import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${authService.getToken()}` }
});

const dashboardService = {
  getStats: async () => {
    const response = await axios.get(`${API_URL}/dashboard/stats`, getAuthHeader());
    return response.data;
  },

  getSalesData: async (period = '7d') => {
    const response = await axios.get(
      `${API_URL}/dashboard/sales?period=${period}`,
      getAuthHeader()
    );
    return response.data;
  },

  getTopItems: async () => {
    const response = await axios.get(`${API_URL}/dashboard/top-items`, getAuthHeader());
    return response.data;
  }
};

export default dashboardService;