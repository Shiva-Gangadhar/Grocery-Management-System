// Date formatting
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Currency formatting
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Number formatting
export const formatNumber = (number) => {
  if (number === undefined || number === null) return '';
  
  return new Intl.NumberFormat('en-IN').format(number);
};

// Percentage formatting
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '';
  return `${value}%`;
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};

export const formatQuantity = (quantity, unit = '') => {
  if (quantity === null || quantity === undefined) return '';
  return `${quantity} ${unit}`.trim();
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatAddress = (address) => {
  if (!address) return '';
  const { street, city, state, country, zipCode } = address;
  return [street, city, state, zipCode, country]
    .filter(Boolean)
    .join(', ');
}; 