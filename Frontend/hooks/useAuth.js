import { useSelector, useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, logout } from '../store/slices/authSlice';
import axios from 'axios';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = async (credentials) => {
    try {
      dispatch(loginStart());
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch(loginSuccess({ user, token }));
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch(logout());
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/users/profile`, userData);
      dispatch(loginSuccess({ user: response.data, token: localStorage.getItem('token') }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Update failed' };
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout: logoutUser,
    updateProfile
  };
};

export default useAuth;