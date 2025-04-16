import React from 'react';
import { Box, Grid } from '@mui/material';
import PropTypes from 'prop-types';

const Form = ({ 
  onSubmit, 
  children, 
  spacing = 2,
  direction = 'column',
  ...props 
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      <Grid
        container
        direction={direction}
        spacing={spacing}
      >
        {children}
      </Grid>
    </Box>
  );
};

Form.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  spacing: PropTypes.number,
  direction: PropTypes.oneOf(['row', 'column'])
};

export default Form; 