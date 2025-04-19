import axios from 'axios';
import { API_URL } from '../config';
import { getAuthHeader } from '../utils/auth';

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
  }
};

export default dashboardService; 