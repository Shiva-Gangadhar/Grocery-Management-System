import { alpha } from '@mui/material/styles';

export const flexCenter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export const flexBetween = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

export const flexStart = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start'
};

export const flexEnd = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end'
};

export const pageContainer = {
  padding: 3,
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto'
};

export const card = {
  borderRadius: 2,
  boxShadow: 1,
  bgcolor: 'background.paper',
  p: 2
};

export const tableCell = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: 200
};

export const searchField = (theme) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
});

export const modalContent = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 1
}; 