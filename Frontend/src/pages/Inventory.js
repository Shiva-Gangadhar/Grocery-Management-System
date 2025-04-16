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
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';

const Inventory = () => {
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
    supplier: {
      name: '',
      contact: '',
      email: ''
    },
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name'); // 'name' or 'category'
  const [categories] = useState(['Groceries', 'Household', 'Snacks', 'Beverages', 'Personal Care', 'Other']);
  const [units] = useState(['kg', 'g', 'l', 'ml', 'pcs', 'box', 'pack']);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
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
        supplier: {
          name: item.supplier?.name || '',
          contact: item.supplier?.contact || '',
          email: item.supplier?.email || ''
        },
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
        supplier: {
          name: '',
          contact: '',
          email: ''
        },
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          Add New Item
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          {/* Removed duplicate Add New Item button */}
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Search By</InputLabel>
              <Select
                value={searchBy}
                onChange={handleSearchByChange}
                label="Search By"
              >
                <MenuItem value="name">Item Name</MenuItem>
                <MenuItem value="category">Category</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Minimum Stock</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell>{item.minimumStock}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(item)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Supplier Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Supplier Name"
                  name="supplier.name"
                  value={formData.supplier.name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Supplier Contact"
                  name="supplier.contact"
                  value={formData.supplier.contact}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Supplier Email"
                  name="supplier.email"
                  type="email"
                  value={formData.supplier.email}
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