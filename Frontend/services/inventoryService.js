import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${authService.getToken()}` }
});

const inventoryService = {
  getAllItems: async () => {
    const response = await axios.get(`${API_URL}/inventory`, getAuthHeader());
    return response.data;
  },

  getItemById: async (id) => {
    const response = await axios.get(`${API_URL}/inventory/${id}`, getAuthHeader());
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