import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Close } from '@mui/icons-material';

const Modal = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  disableBackdropClick = false,
  showCloseButton = true
}) => {
  const handleClose = (event, reason) => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {showCloseButton && (
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="close"
              size="small"
            >
              <Close />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions>
          {typeof actions === 'function' ? actions() : actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal; 