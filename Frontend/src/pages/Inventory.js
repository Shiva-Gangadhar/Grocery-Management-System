import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';

const Inventory = () => {
  const theme = useTheme();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    price: '',
    minimumStock: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [categories] = useState(['Groceries', 'Household', 'Snacks', 'Beverages', 'Personal Care', 'Other']);
  const [units] = useState(['kg', 'g', 'l', 'ml', 'pcs', 'box', 'pack']);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    categories: 0
  });

  // Define fetchInventory function
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/inventory');
      const inventoryData = response.data.data || response.data;
      setInventory(inventoryData);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Use fetchInventory in useEffect
  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    const checkLowStockAndCreateOrders = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/inventory/check-low-stock', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to check low stock items');
        }

        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          setSnackbar({
            open: true,
            message: `Created ${data.data.length} orders for low stock items`,
            severity: 'info'
          });
        }
      } catch (error) {
        console.error('Error checking low stock items:', error);
      }
    };

    // Check for low stock items when component mounts
    checkLowStockAndCreateOrders();
  }, []);

  useEffect(() => {
    if (inventory.length > 0) {
      const lowStockItems = inventory.filter(item => item.quantity <= item.minimumStock).length;
      const uniqueCategories = new Set(inventory.map(item => item.category)).size;

      setStats({
        totalItems: inventory.length,
        lowStock: lowStockItems,
        categories: uniqueCategories
      });
    }
  }, [inventory]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Open dialog for adding/editing item
  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        minimumStock: item.minimumStock,
        description: item.description || ''
      });
    } else {
      setEditItem(null);
      setFormData({
        name: '',
        category: '',
        quantity: '',
        unit: '',
        price: '',
        minimumStock: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditItem(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Validate form data before submission
      if (!formData.name || !formData.category || !formData.quantity || 
          !formData.unit || !formData.price || !formData.minimumStock) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Convert numeric fields to numbers
      const dataToSend = {
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        minimumStock: Number(formData.minimumStock)
      };
      
      const url = editItem 
        ? `http://localhost:5001/api/inventory/${editItem._id}`
        : 'http://localhost:5001/api/inventory';
      
      const method = editItem ? 'put' : 'post';
      
      console.log(`Submitting inventory item with data:`, dataToSend);
      
      const response = await axios({
        method,
        url,
        data: dataToSend
      });
      
      console.log('Response from server:', response.data);
      
      // Refresh inventory data
      const updatedResponse = await axios.get('http://localhost:5001/api/inventory');
      const updatedData = updatedResponse.data.data || updatedResponse.data;
      setInventory(updatedData);
      setError(null);
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving inventory item:', err);
      
      // Handle detailed error messages from the backend
      if (err.response?.data?.errors) {
        // Multiple validation errors
        setError(err.response.data.errors.join(', '));
      } else if (err.response?.data?.message) {
        // Single error message
        setError(err.response.data.message);
      } else {
        // Generic error
        setError('Failed to save inventory item. Please try again.');
      }
    }
  };

  // Handle item deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/inventory/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete item');
        }

        // Refresh the inventory list
        await fetchInventory();
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Item deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting item:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to delete item. Please try again.',
          severity: 'error'
        });
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value);
  };

  const filteredInventory = inventory.filter(item => {
    const searchValue = searchTerm.toLowerCase();
    if (searchBy === 'name') {
      return item.name.toLowerCase().includes(searchValue);
    } else if (searchBy === 'category') {
      return item.category.toLowerCase().includes(searchValue);
    }
    return true;
  });

  const handleCreateAutomaticOrders = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/auto-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create automatic orders');
      }

      const data = await response.json();
      setSnackbar({
        open: true,
        message: `Created ${data.orders.length} new orders for low stock items`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating automatic orders:', error);
      setSnackbar({
        open: true,
        message: 'Error creating automatic orders',
        severity: 'error'
      });
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].light, 0.1)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette[color].main, 0.1)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 12px 40px ${alpha(theme.palette[color].main, 0.2)}`,
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                backgroundColor: alpha(theme.palette[color].main, 0.1),
                borderRadius: '12px',
                p: 1.5,
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${alpha(theme.palette[color].main, 0.2)}`,
              }}
            >
              {React.cloneElement(icon, { sx: { color: theme.palette[color].main, fontSize: 28 } })}
            </Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {title}
            </Typography>
          </Box>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              color: theme.palette[color].main,
              fontWeight: 'bold',
              textShadow: `0 2px 4px ${alpha(theme.palette[color].main, 0.2)}`,
            }}
          >
            {value}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box 
      sx={{
        p: 3,
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 4,
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Inventory Management
        </Typography>
      </motion.div>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            icon={<InventoryIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Low Stock"
            value={stats.lowStock}
            icon={<WarningIcon />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Categories"
            value={stats.categories}
            icon={<CategoryIcon />}
            color="success"
          />
        </Grid>
      </Grid>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Search By</InputLabel>
                <Select
                  value={searchBy}
                  onChange={handleSearchByChange}
                  label="Search By"
                  sx={{
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="category">Category</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                }
              }}
            >
              Add Item
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.map((item) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.category}
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.unit}
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        ₹{item.price}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.quantity <= item.minimumStock ? 'Low Stock' : 'In Stock'}
                        color={item.quantity <= item.minimumStock ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleOpenDialog(item)}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDelete(item._id)}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </motion.div>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    label="Unit"
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Stock"
                  name="minimumStock"
                  type="number"
                  value={formData.minimumStock}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Inventory; 