// src/components/common/Toast.js
import React from 'react';
import { Snackbar, Alert } from '@mui/material';

/**
 * Toast - Bildirim komponenti
 */
function Toast({ open, message, severity = 'info', onClose, duration = 4000 }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Toast;
