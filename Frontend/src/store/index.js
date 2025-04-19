import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer from './slices/inventorySlice';
import ordersReducer from './slices/ordersSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    orders: ordersReducer,
    auth: authReducer
  }
});

export default store; 