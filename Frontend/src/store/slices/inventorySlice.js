import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null,
  totalItems: 0,
  currentPage: 0,
  itemsPerPage: 10
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    fetchInventoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchInventorySuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload.items;
      state.totalItems = action.payload.total;
      state.error = null;
    },
    fetchInventoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addItemSuccess: (state, action) => {
      state.items.push(action.payload);
      state.totalItems += 1;
    },
    updateItemSuccess: (state, action) => {
      const index = state.items.findIndex(item => item._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteItemSuccess: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
      state.totalItems -= 1;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
    }
  }
});

export const {
  fetchInventoryStart,
  fetchInventorySuccess,
  fetchInventoryFailure,
  addItemSuccess,
  updateItemSuccess,
  deleteItemSuccess,
  setPage,
  setItemsPerPage
} = inventorySlice.actions;

export default inventorySlice.reducer; 