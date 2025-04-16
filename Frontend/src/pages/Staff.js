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
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Salesperson',
    password: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    // Filter staff based on search term
    if (searchTerm.trim() === '') {
      setFilteredStaff(staff);
    } else {
      const filtered = staff.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStaff(filtered);
    }
  }, [searchTerm, staff]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/staff');
      setStaff(response.data);
      setFilteredStaff(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to fetch staff. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (staffMember = null) => {
    if (staffMember) {
      setEditStaff(staffMember);
      setFormData({
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone || '',
        role: staffMember.role,
        password: '' // Password is not included in edit mode
      });
    } else {
      setEditStaff(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'Salesperson',
        password: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditStaff(null);
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
      const dataToSend = { ...formData };
      
      // Validate required fields
      if (!dataToSend.name || !dataToSend.email) {
        setError('Name and email are required fields');
        return;
      }
      
      // For new staff members, password is required
      if (!editStaff && (!dataToSend.password || dataToSend.password.length < 6)) {
        setError('Password is required and must be at least 6 characters long');
        return;
      }
      
      // Remove password if empty in edit mode
      if (editStaff && !dataToSend.password) {
        delete dataToSend.password;
      }
      
      console.log('Submitting staff data:', { ...dataToSend, password: '***' });
      
      let response;
      if (editStaff) {
        response = await axios.put(`http://localhost:5001/api/staff/${editStaff._id}`, dataToSend);
        console.log('Staff member updated successfully:', response.data);
      } else {
        response = await axios.post('http://localhost:5001/api/staff', dataToSend);
        console.log('Staff member created successfully:', response.data);
      }
      
      // Check if the response contains an error message
      if (response.data && response.data.message && response.data.message.includes('Error')) {
        setError(response.data.message);
        return;
      }
      
      fetchStaff();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving staff member:', err);
      let errorMessage = 'Failed to save staff member. Please try again.';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', err.response.data);
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Error request:', err.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message);
        errorMessage = err.message;
      }
      
      setError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await axios.delete(`http://localhost:5001/api/staff/${id}`);
        fetchStaff();
        setError(null);
      } catch (err) {
        console.error('Error deleting staff member:', err);
        setError(err.response?.data?.message || 'Failed to delete staff member. Please try again.');
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
        <Typography variant="h4">Staff Members</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add Staff Member
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
          placeholder="Search by name, email, or role..."
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
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {searchTerm ? 'No staff members found matching your search' : 'No staff members found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((member, index) => (
                <TableRow key={member._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone || '-'}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(member)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteStaff(member._id)}
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
        <DialogTitle>{editStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
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
            {!editStaff && (
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
                helperText="Password must be at least 6 characters long"
              />
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                label="Role"
                required
              >
                <MenuItem value="Cashier">Cashier</MenuItem>
                <MenuItem value="Salesperson">Salesperson</MenuItem>
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
            {editStaff ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff; 