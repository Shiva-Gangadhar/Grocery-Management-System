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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Shuffle as ShuffleIcon } from '@mui/icons-material';
import axios from 'axios';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [salespersons, setSalespersons] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    assignedStaff: ''
  });

  useEffect(() => {
    fetchCustomers();
    fetchSalespersons();
  }, []);

  useEffect(() => {
    // Filter customers based on search term
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/customers');
      console.log('Fetched customers:', response.data);
      
      // Check if any customers have missing assignedStaff data
      const customersWithMissingStaff = response.data.filter(
        customer => !customer.assignedStaff || !customer.assignedStaff.name
      );
      
      if (customersWithMissingStaff.length > 0) {
        console.warn('Some customers have missing assignedStaff data:', customersWithMissingStaff);
      }
      
      setCustomers(response.data);
      setFilteredCustomers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to fetch customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalespersons = async () => {
    try {
      // Fetch all staff members with the "Salesperson" role
      const response = await axios.get('http://localhost:5001/api/staff');
      // Filter to only include active Salespersons
      const salespersonsList = response.data.filter(staff => 
        staff.role === 'Salesperson' && staff.isActive
      );
      setSalespersons(salespersonsList);
    } catch (err) {
      console.error('Error fetching Salespersons:', err);
      setError('Failed to fetch available Salespersons. Please try again.');
    }
  };

  const handleOpenDialog = (customer = null) => {
    if (customer) {
      setEditCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
        assignedStaff: customer.assignedStaff?._id || ''
      });
    } else {
      setEditCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        assignedStaff: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditCustomer(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      let response;
      
      // Handle random assignment
      const dataToSend = { ...formData };
      if (dataToSend.assignedStaff === 'random') {
        // For random assignment, we don't send the assignedStaff field at all
        delete dataToSend.assignedStaff;
      }
      
      if (editCustomer) {
        response = await axios.put(`http://localhost:5001/api/customers/${editCustomer._id}`, dataToSend);
      } else {
        response = await axios.post('http://localhost:5001/api/customers', dataToSend);
      }
      
      // Refresh the customers list to get the updated data with assigned Salesperson
      await fetchCustomers();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving customer:', err);
      setError(err.response?.data?.message || 'Failed to save customer. Please try again.');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`http://localhost:5001/api/customers/${id}`);
        fetchCustomers();
        setError(null);
      } catch (err) {
        console.error('Error deleting customer:', err);
        setError(err.response?.data?.message || 'Failed to delete customer. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Customers</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add Customer
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, email, or phone..."
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Assigned Salesperson</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {searchTerm ? 'No customers found matching your search' : 'No customers found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>{customer.address || '-'}</TableCell>
                  <TableCell>
                    {customer.assignedStaff ? 
                      `${customer.assignedStaff.name} (${customer.assignedStaff.staffId})` : 
                      'Not assigned'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(customer)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteCustomer(customer._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Assigned Salesperson</InputLabel>
              <Select
                name="assignedStaff"
                value={formData.assignedStaff}
                onChange={handleInputChange}
                label="Assigned Salesperson"
                required
              >
                <MenuItem value="random">
                  <em>Random Assignment</em>
                </MenuItem>
                {salespersons.length > 0 ? (
                  salespersons.map((salesperson) => (
                    <MenuItem key={salesperson._id} value={salesperson._id}>
                      {salesperson.name} ({salesperson.staffId})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <em>No Salespersons available</em>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            onClick={handleSubmit}
          >
            {editCustomer ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers; 