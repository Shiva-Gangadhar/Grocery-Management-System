import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    items: [{ item: '', quantity: 1, price: 0 }],
    totalAmount: 0,
    status: 'Email Sent',
    notes: ''
  });
  const [open, setOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [success, setSuccess] = useState('');
  const [autoOrders, setAutoOrders] = useState([]);

  const statusOptions = [
    { value: 'Email Sent', label: 'Email Sent' },
    { value: 'Completed', label: 'Completed' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchOrders(),
          fetchCustomers(),
          fetchInventory(),
          checkLowStock()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      const response = await axios.get('http://localhost:5001/api/orders');
      console.log('Orders response:', response.data);
      
      const ordersData = response.data.data || response.data;
      if (!Array.isArray(ordersData)) {
        throw new Error('Invalid orders data format');
      }
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
      setOrders([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/customers');
      const customersData = response.data.data || response.data;
      setCustomers(customersData);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchInventory = async () => {
    try {
      console.log('Fetching inventory...');
      const response = await axios.get('http://localhost:5001/api/inventory');
      console.log('Inventory response:', response.data);
      
      const inventoryData = response.data.data || response.data;
      if (!Array.isArray(inventoryData)) {
        throw new Error('Invalid inventory data format');
      }
      
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to fetch inventory');
      setInventory([]);
    }
  };

  const checkLowStock = async () => {
    try {
      console.log('Checking for low stock items...');
      const response = await axios.get('http://localhost:5001/api/inventory/check-low-stock');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to check low stock items');
      }

      const autoOrdersData = response.data.data || [];
      if (autoOrdersData.length > 0) {
        setAutoOrders(autoOrdersData);
        setSuccess(`Found ${autoOrdersData.length} low stock items. Automatic orders created.`);
      }
    } catch (error) {
      console.error('Error checking low stock:', error);
      // Don't show error to user for automatic checks
      // setError('Failed to check low stock items');
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      const inventoryItem = inventory.find(i => i._id === item.item);
      return total + (inventoryItem?.price || 0) * item.quantity;
    }, 0);
  };

  const handleOpenDialog = (order = null) => {
    if (order) {
      setEditOrder(order);
      setFormData({
        orderId: order.orderId,
        items: order.items.map(item => ({
          item: item.item._id,
          quantity: item.quantity
        })),
        totalAmount: order.totalAmount,
        status: order.status,
        notes: order.notes || ''
      });
    } else {
      setEditOrder(null);
      setFormData({
        orderId: '',
        items: [{ item: '', quantity: 1, price: 0 }],
        totalAmount: 0,
        status: 'Email Sent',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditOrder(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // If item is changed, update the price
    if (field === 'item' && value) {
      const selectedItem = inventory.find(i => i._id === value);
      if (selectedItem) {
        newItems[index].price = selectedItem.price;
      }
    }

    setFormData(prev => ({
      ...prev,
      items: newItems,
      totalAmount: newItems.reduce((total, item) => {
        const inventoryItem = inventory.find(i => i._id === item.item);
        return total + (inventoryItem?.price || 0) * (item.quantity || 0);
      }, 0)
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { item: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      items: newItems,
      totalAmount: calculateTotal(newItems)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate that all items have been selected
      const hasEmptyItems = formData.items.some(item => !item.item);
      if (hasEmptyItems) {
        setError('Please select all items');
        return;
      }

      // Validate quantities
      const hasInvalidQuantities = formData.items.some(item => !item.quantity || item.quantity <= 0);
      if (hasInvalidQuantities) {
        setError('Please enter valid quantities for all items');
        return;
      }

      // Prepare items with all required fields
      const itemsWithDetails = formData.items.map(item => {
        const inventoryItem = inventory.find(i => i._id === item.item);
        if (!inventoryItem) {
          throw new Error(`Item with ID ${item.item} not found`);
        }
        return {
          item: item.item,
          quantity: parseInt(item.quantity),
          price: inventoryItem.price
        };
      });

      const orderData = {
        items: itemsWithDetails,
        status: formData.status,
        notes: formData.notes,
        totalAmount: itemsWithDetails.reduce((total, item) => total + (item.price * item.quantity), 0)
      };

      console.log('Sending order data:', orderData);

      if (editOrder) {
        await axios.put(`http://localhost:5001/api/orders/${editOrder._id}`, orderData);
      } else {
        await axios.post('http://localhost:5001/api/orders', orderData);
      }
      fetchOrders();
      handleCloseDialog();
      setError(null);
    } catch (err) {
      console.error('Error saving order:', err);
      const errorMessage = err.response?.data?.details?.join(', ') || 
                          err.response?.data?.error || 
                          err.response?.data?.message || 
                          'Failed to save order. Please try again.';
      setError(errorMessage);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`http://localhost:5001/api/orders/${id}`);
        fetchOrders();
        setError(null);
      } catch (err) {
        console.error('Error deleting order:', err);
        setError(err.response?.data?.message || 'Failed to delete order. Please try again.');
      }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (newStatus === 'Completed') {
        // Delete the order if status is changed to Completed
        const response = await axios.delete(`http://localhost:5001/api/orders/${orderId}`);
        
        if (response.data.success) {
          // Remove the order from the state
          setOrders(orders.filter(order => order._id !== orderId));
          setSuccess('Order completed and removed successfully');
        }
      } else {
        // Update status for other cases
        const response = await axios.put(`http://localhost:5001/api/orders/${orderId}`, {
          status: newStatus
        });
        
        if (response.data.success) {
          // Update the orders state with the new status
          setOrders(orders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          ));
          setSuccess('Order status updated successfully');
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading data...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Orders</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Create Order
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

      {/* Automatic Orders Section */}
      {autoOrders.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Automatic Orders (Low Stock Items)</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {autoOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id}</TableCell>
                    <TableCell>
                      {order.items.map((item) => {
                        const inventoryItem = inventory.find(i => i._id === item.item);
                        return inventoryItem ? inventoryItem.name : 'N/A';
                      }).join(', ')}
                    </TableCell>
                    <TableCell>
                      {order.items.map(item => item.quantity).join(', ')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={order.status === 'pending' ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{order.notes}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(order)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Regular Orders Section */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>
                    {order.items.map((item, index) => (
                      <div key={index}>
                        {item.item?.name || 'N/A'}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    {order.items.map((item, index) => (
                      <div key={index}>
                        {item.item?.category || 'N/A'}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    {order.items.map((item, index) => (
                      <div key={index}>
                        {item.item?.unit || 'N/A'}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    {order.items.map((item, index) => (
                      <div key={index}>
                        {item.quantity}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>₹{order.totalAmount}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      fullWidth
                      size="small"
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(order)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteOrder(order._id)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editOrder ? 'Edit Order' : 'Create New Order'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Order Items</Typography>
            {formData.items.map((item, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Item Name</InputLabel>
                    <Select
                      value={item.item || ''}
                      onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                      label="Item Name"
                      required
                    >
                      {inventory.map((inv) => (
                        <MenuItem key={inv._id} value={inv._id}>
                          {inv.name} (₹{inv.price})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    label="Category"
                    value={inventory.find(i => i._id === item.item)?.category || ''}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    label="Unit"
                    value={inventory.find(i => i._id === item.item)?.unit || ''}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    required
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                  >
                    Remove
                  </Button>
                </Grid>
              </Grid>
            ))}
            <Button
              variant="outlined"
              onClick={addItem}
              sx={{ mt: 1 }}
            >
              Add Item
            </Button>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Total Amount: ₹{formData.totalAmount.toFixed(2)}
            </Typography>

            <Grid item xs={12}>
              <TextField
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                fullWidth
                required
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editOrder ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders; 