import axios from 'axios';
import { API_URL } from '../config';
import { getAuthHeader } from '../utils/auth';

const orderService = {
  getAllOrders: async () => {
    const response = await axios.get(`${API_URL}/orders`, getAuthHeader());
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