// Email validation
export const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Password validation (at least 6 characters)
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Username validation (at least 3 characters)
export const validateUsername = (username) => {
  return username && username.length >= 3;
};

// Required field validation
export const validateRequired = (value) => {
  return value !== undefined && value !== null && value !== '';
};

// Number validation (positive)
export const validatePositiveNumber = (value) => {
  return !isNaN(value) && Number(value) > 0;
};

// Form validation helper
export const validateForm = (values, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = values[field];
    const fieldRules = rules[field];
    
    if (fieldRules.required && !validateRequired(value)) {
      errors[field] = 'This field is required';
    } else if (value) {
      if (fieldRules.email && !validateEmail(value)) {
        errors[field] = 'Invalid email address';
      }
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `Must be at least ${fieldRules.minLength} characters`;
      }
      if (fieldRules.positiveNumber && !validatePositiveNumber(value)) {
        errors[field] = 'Must be a positive number';
      }
    }
  });
  
  return errors;
};

export const required = (value) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return 'This field is required';
  }
  return '';
};

export const email = (value) => {
  if (!value) return '';
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(value)) {
    return 'Invalid email address';
  }
  return '';
};

export const minLength = (min) => (value) => {
  if (!value) return '';
  if (value.length < min) {
    return `Must be at least ${min} characters`;
  }
  return '';
};

export const maxLength = (max) => (value) => {
  if (!value) return '';
  if (value.length > max) {
    return `Must be no more than ${max} characters`;
  }
  return '';
};

export const number = (value) => {
  if (!value) return '';
  if (isNaN(value)) {
    return 'Must be a number';
  }
  return '';
};

export const min = (min) => (value) => {
  if (!value) return '';
  if (Number(value) < min) {
    return `Must be at least ${min}`;
  }
  return '';
};

export const max = (max) => (value) => {
  if (!value) return '';
  if (Number(value) > max) {
    return `Must be no more than ${max}`;
  }
  return '';
};

export const password = (value) => {
  if (!value) return '';
  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(value)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(value)) {
    return 'Password must contain at least one number';
  }
  return '';
};

export const match = (fieldName) => (value, allValues) => {
  if (!value) return '';
  if (value !== allValues[fieldName]) {
    return `Must match ${fieldName}`;
  }
  return '';
}; 