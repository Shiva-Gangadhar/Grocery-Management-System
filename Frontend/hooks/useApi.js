import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleApiError, handleAuthError } from '../utils/errorHandler';

const useApi = (apiFunc) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Execute API call
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunc(...args);
      setData(result);
      return result;
    } catch (err) {
      // Handle authentication errors
      if (err.response?.status === 401) {
        handleAuthError(err, navigate);
      } else {
        handleApiError(err, setError);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc, navigate]);

  // Reset state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    error,
    loading,
    execute,
    reset
  };
};

export default useApi; 