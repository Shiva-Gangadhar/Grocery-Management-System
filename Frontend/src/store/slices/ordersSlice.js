import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  loading: false,
  error: null,
  totalOrders: 0,
  currentPage: 0,
  ordersPerPage: 10
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    fetchOrdersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action) => {
      state.loading = false;
      state.orders = action.payload.orders;
      state.totalOrders = action.payload.total;
      state.error = null;
    },
    fetchOrdersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addOrderSuccess: (state, action) => {
      state.orders.unshift(action.payload);
      state.totalOrders += 1;
    },
    updateOrderSuccess: (state, action) => {
      const index = state.orders.findIndex(order => order._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    deleteOrderSuccess: (state, action) => {
      state.orders = state.orders.filter(order => order._id !== action.payload);
      state.totalOrders -= 1;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setOrdersPerPage: (state, action) => {
      state.ordersPerPage = action.payload;
    }
  }
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  addOrderSuccess,
  updateOrderSuccess,
  deleteOrderSuccess,
  setPage,
  setOrdersPerPage
} = ordersSlice.actions;

export default ordersSlice.reducer; 