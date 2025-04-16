import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${authService.getToken()}` }
});

const orderService = {
  getAllOrders: async () => {
    const response = await axios.get(`${API_URL}/orders`, getAuthHeader());
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await axios.get(`${API_URL}/orders/${id}`, getAuthHeader());
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await axios.post(`${API_URL}/orders`, orderData, getAuthHeader());
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await axios.patch(
      `${API_URL}/orders/${id}/status`,
      { status },
      getAuthHeader()
    );
    return response.data;
  },

  deleteOrder: async (id) => {
    const response = await axios.delete(`${API_URL}/orders/${id}`, getAuthHeader());
    return response.data;
  }
};

export default orderService;