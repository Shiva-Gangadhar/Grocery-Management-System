import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null,
  selectedItem: null
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload;
      state.error = null;
    },
    fetchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    updateItem: (state, action) => {
      const index = state.items.findIndex(item => item._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteItem: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    }
  }
});

export const {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  selectItem,
  addItem,
  updateItem,
  deleteItem,
  clearSelectedItem
} = inventorySlice.actions;

export default inventorySlice.reducer; 