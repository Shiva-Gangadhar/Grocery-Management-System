import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer from './slices/inventorySlice';
import ordersReducer from './slices/ordersSlice';

const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    orders: ordersReducer
  }
});

export default store; 