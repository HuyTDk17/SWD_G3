import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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

function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await forgotPassword({ email });
      setMessage('If the email exists, a reset OTP has been sent to it.');
      setTimeout(() => navigate('/reset-password', { state: { email } }), 1000);
    } catch (err) {
      setError(authService.getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>Forgot password</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" disabled={submitting} fullWidth>
          {submitting ? 'Sending...' : 'Send reset OTP'}
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

export default ForgotPasswordPage;
