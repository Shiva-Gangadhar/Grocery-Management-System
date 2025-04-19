import axios from 'axios';
import { API_URL } from '../config';
import { getAuthHeader } from '../utils/auth';

const inventoryService = {
  getAllItems: async () => {
    const response = await axios.get(`${API_URL}/inventory`, getAuthHeader());
    return response.data;
  },

  createItem: async (itemData) => {
    const response = await axios.post(`${API_URL}/inventory`, itemData, getAuthHeader());
    return response.data;
  },

  updateItem: async (id, itemData) => {
    const response = await axios.put(`${API_URL}/inventory/${id}`, itemData, getAuthHeader());
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await axios.delete(`${API_URL}/inventory/${id}`, getAuthHeader());
    return response.data;
  },

  getLowStockItems: async () => {
    const response = await axios.get(`${API_URL}/inventory/low-stock`, getAuthHeader());
    return response.data;
  }
};

export default inventoryService; 