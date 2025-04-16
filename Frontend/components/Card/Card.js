import React from 'react';
import { Card as MuiCard, CardContent, CardHeader, CardActions } from '@mui/material';
import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  title,
  subheader,
  action,
  footer,
  elevation = 1,
  ...props 
}) => {
  return (
    <MuiCard elevation={elevation} {...props}>
      {(title || subheader || action) && (
        <CardHeader
          title={title}
          subheader={subheader}
          action={action}
        />
      )}
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <CardActions>
          {footer}
        </CardActions>
      )}
    </MuiCard>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  subheader: PropTypes.node,
  action: PropTypes.node,
  footer: PropTypes.node,
  elevation: PropTypes.number
};

export default Card;