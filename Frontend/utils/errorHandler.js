import { useToast } from '../contexts/ToastContext';

// Extract error message from various error formats
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Axios error
  if (error.response) {
    // Server responded with error
    return error.response.data.message || error.response.data.error || 'Server error';
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.';
  } else if (error.message) {
    // Other error with message
    return error.message;
  }
  
  // Fallback
  return 'An unknown error occurred';
};

// Handle API errors
export const handleApiError = (error) => {
  const message = error.response?.data?.message || error.message || 'An error occurred';
  return message;
};

// Handle form submission errors
export const handleFormError = (error, setFormErrors) => {
  if (error.response && error.response.data.errors) {
    // Server validation errors
    setFormErrors(error.response.data.errors);
  } else {
    // General error
    setFormErrors({ submit: getErrorMessage(error) });
  }
  console.error('Form Error:', error);
};

// Handle authentication errors
export const handleAuthError = (error, navigate) => {
  const message = getErrorMessage(error);
  
  // If unauthorized, redirect to login
  if (error.response && error.response.status === 401) {
    navigate('/login');
  }
  
  return message;
};

export const useErrorHandler = () => {
  const { showToast } = useToast();

  const handleError = (error) => {
    const message = handleApiError(error);
    showToast(message, 'error');
    return message;
  };

  return { handleError };
};

export const isNetworkError = (error) => {
  return !error.response && error.message === 'Network Error';
};

export const isAuthError = (error) => {
  return error.response?.status === 401;
};

export const isValidationError = (error) => {
  return error.response?.status === 422;
};

export const isServerError = (error) => {
  return error.response?.status >= 500;
};

export const getValidationErrors = (error) => {
  if (!isValidationError(error)) return {};
  return error.response?.data?.errors || {};
}; 