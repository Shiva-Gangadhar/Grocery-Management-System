import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    items: [{ name: '', quantity: '', price: '' }],
    totalAmount: 0,
    status: 'pending',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchInventory();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      setError('Failed to fetch orders');
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/inventory');
      setInventory(response.data);
    } catch (error) {
      setError('Failed to fetch inventory');
    }
  };

  const handleOpen = (order = null) => {
    if (order) {
      setViewOrder(order);
      setFormData({
        customerName: order.customerName,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
      });
    } else {
      setViewOrder(null);
      setFormData({
        customerName: '',
        items: [{ name: '', quantity: '', price: '' }],
        totalAmount: 0,
        status: 'pending',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setViewOrder(null);
    setFormData({
      customerName: '',
      items: [{ name: '', quantity: '', price: '' }],
      totalAmount: 0,
      status: 'pending',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Calculate total amount
    const total = newItems.reduce(
      (sum, item) => sum + (item.quantity * item.price || 0),
      0
    );

    setFormData({
      ...formData,
      items: newItems,
      totalAmount: total,
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: '', price: '' }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (viewOrder) {
        await axios.put(`/api/orders/${viewOrder._id}`, formData);
        setSuccess('Order updated successfully');
      } else {
        await axios.post('/api/orders', formData);
        setSuccess('Order created successfully');
      }
      handleClose();
      fetchOrders();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`/api/orders/${id}`);
        setSuccess('Order deleted successfully');
        fetchOrders();
      } catch (error) {
        setError('Failed to delete order');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Order Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          New Order
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell align="right">₹{order.totalAmount}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpen(order)}
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(order._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {viewOrder ? 'View Order' : 'Create New Order'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              margin="normal"
              required
            />

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Order Items
            </Typography>

            {formData.items.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Item</InputLabel>
                  <Select
                    value={item.name}
                    label="Item"
                    onChange={(e) =>
                      handleItemChange(index, 'name', e.target.value)
                    }
                  >
                    {inventory.map((inv) => (
                      <MenuItem key={inv._id} value={inv.name}>
                        {inv.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, 'quantity', e.target.value)
                  }
                  sx={{ width: '120px' }}
                />
                <TextField
                  label="Price"
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(index, 'price', e.target.value)
                  }
                  sx={{ width: '120px' }}
                />
                {!viewOrder && (
                  <IconButton
                    color="error"
                    onClick={() => removeItem(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}

            {!viewOrder && (
              <Button
                startIcon={<AddIcon />}
                onClick={addItem}
                sx={{ mt: 1 }}
              >
                Add Item
              </Button>
            )}

            <TextField
              fullWidth
              label="Total Amount"
              value={formData.totalAmount}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={handleChange}
                name="status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {!viewOrder && (
            <Button onClick={handleSubmit} variant="contained">
              Create Order
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders; 