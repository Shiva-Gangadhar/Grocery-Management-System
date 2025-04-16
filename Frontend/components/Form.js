import React from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress
} from '@mui/material';

const Form = ({
  fields,
  values,
  errors,
  touched,
  isSubmitting,
  handleChange,
  handleBlur,
  handleSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel
}) => {
  const renderField = (field) => {
    const {
      name,
      label,
      type = 'text',
      required = false,
      options,
      multiline = false,
      rows = 1,
      fullWidth = true,
      disabled = false
    } = field;

    const error = touched[name] && errors[name];
    const commonProps = {
      id: name,
      name,
      label,
      value: values[name] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: !!error,
      helperText: error,
      required,
      fullWidth,
      disabled: disabled || isSubmitting,
      size: "small",
      margin: "normal"
    };

    if (type === 'select') {
      return (
        <FormControl
          key={name}
          error={!!error}
          fullWidth={fullWidth}
          required={required}
          size="small"
          margin="normal"
        >
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select
            labelId={`${name}-label`}
            {...commonProps}
            label={label}
          >
            {options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );
    }

    return (
      <TextField
        key={name}
        {...commonProps}
        type={type}
        multiline={multiline}
        rows={rows}
      />
    );
  };

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      noValidate
    >
      {fields.map(field => renderField(field))}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {onCancel && (
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {submitText}
        </Button>
      </Box>
    </Box>
  );
};

export default Form; 