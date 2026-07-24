import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await resetPassword(form);
      setMessage('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(authService.getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>Reset password</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter the 6-digit code we emailed you along with your new password.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      <Stack spacing={2}>
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="OTP"
          name="otp"
          value={form.otp}
          onChange={handleChange}
          inputProps={{ maxLength: 6 }}
          required
          fullWidth
        />
        <TextField
          label="New password"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={handleChange}
          required
          fullWidth
          helperText="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
        />
        <Button type="submit" variant="contained" disabled={submitting} fullWidth>
          {submitting ? 'Resetting...' : 'Reset password'}
        </Button>
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Link component={RouterLink} to="/login" underline="hover">
          Back to login
        </Link>
      </Box>
    </Box>
  );
}

export default ResetPasswordPage;
