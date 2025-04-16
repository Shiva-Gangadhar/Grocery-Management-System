import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  loading: false,
  error: null,
  selectedOrder: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.loading = false;
      state.orders = action.payload;
      state.error = null;
    },
    fetchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    addOrder: (state, action) => {
      state.orders.unshift(action.payload);
    },
    updateOrder: (state, action) => {
      const index = state.orders.findIndex(order => order._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    deleteOrder: (state, action) => {
      state.orders = state.orders.filter(order => order._id !== action.payload);
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(order => order._id === orderId);
      if (order) {
        order.status = status;
      }
    }
  }
});

export const {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  selectOrder,
  addOrder,
  updateOrder,
  deleteOrder,
  clearSelectedOrder,
  updateOrderStatus
} = orderSlice.actions;

export default orderSlice.reducer; 